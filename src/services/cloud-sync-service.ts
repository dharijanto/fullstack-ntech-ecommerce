import * as fs from 'fs'
import * as path from 'path'

import * as Promise from 'bluebird'
import * as moment from 'moment'
import * as log from 'npmlog'

import { Transaction } from 'sequelize'

import * as AppConfig from '../app-config'
import CRUDService from './crud-service'
import Sequelize = require('sequelize')

const TAG = 'CloudSyncService'

export interface CloudSyncResp {
  status: CloudSyncStatus
  fileName?: string
  untilTime: string
}

// TODO: Figure this out
interface CloudData {

}

/*
This is used by Cloud Server to serve sync requests from local-server

There are 2 different kind of SQL tables:
1. Cloud tables
2. Local tables

Cloud tables are supposed to be modified only on the cloud server (i.e. accessed using the Internet).
Respectively, local tables should only be modified by local server. Due to this clear separation of
table ownerships, syncing can be done easily because each of the tables have different owners and

TODO:
1. Mapping table to map local-ID to cloud-ID
 */
class CloudSyncService extends CRUDService {
  constructor () {
    super()
  }

  /**
   * Returns cloud data to be used to update local-server
   *
   * @param lastSyncDate When specified, this will return only data whose updatedAt is bigger
   *
   */
  getCloudData (lastSyncTime: string, shopName: string): Promise<NCResponse<CloudSyncResp>> {
    if (!shopName) {
      return Promise.reject('shopName is required!')
    } else {
      // When leave empty, we'll just sync from the beginning
      if (!lastSyncTime) {
        lastSyncTime = '2017-01-01 00:00:00'
      }
      return super.getSequelize().transaction({ isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE }, trx => {
        return this.getSyncHistory(shopName, lastSyncTime, trx).then(resp => {
          // We already have the data
          if (resp.status && resp.data && resp.data.status === 'Success') {
            const syncHistory = resp.data
            return { status: true, data: { status: 'Success', fileName: syncHistory.fileName, untilTime: syncHistory.untilTime } } as NCResponse<CloudSyncResp>
          // There's a sync being prepared
          } else if (resp.status && resp.data && resp.data.status === 'Preparing') {
            return { status: true, data: { status: 'Preparing' } } as NCResponse<CloudSyncResp>
          // Never synced before
          } else if (!resp.status) {
            return this.createSyncHistory(shopName, 'Preparing', lastSyncTime, trx).then(resp => {
              if (resp.status && resp.data) {
                const currentSyncHistory = resp.data
                this.prepareData(shopName, lastSyncTime, currentSyncHistory.untilTime, currentSyncHistory.id).catch(err => {
                  log.error(TAG, err)
                })
                return { status: true, data: { status: 'Preparing' } } as NCResponse<CloudSyncResp>
              } else {
                throw new Error('createSyncState() failed: ' + resp.errMessage)
              }
            })
          } else {
            throw new Error('getLastSyncState() returns unexpected value: ' + JSON.stringify(resp))
          }
        })
      })
    }
  }

  protected createSyncHistory (shopName: string, status: CloudSyncStatus, sinceTime: string, transaction?: Transaction) {
    const now = moment().format('YYYY-MM-DD HH:mm:ss')
    return super.create<CloudSyncHistory>('CloudSyncHistory', { status, shopName, sinceTime, untilTime: now }, { transaction })
  }

  /**
   * Get non-failed sync that meets the criteria. We wanna reduce having to re-query the entire
   * database everytime we do a sync, and for that, we cache sync result.
   * For example if there was a sync with sinceTime = 2018-01-01 00:00 and untilTime = 2018-02-01 00:00
   * and there's a request for sync with lastSyncTime = 2018-01-28, then we'll return the previous sync
   * data. Client will have to query us again to get the sync data from 2018-02-01 to now.
   */
  protected getSyncHistory (shopName: string, lastSyncTime?: string, transaction?: Transaction): Promise<NCResponse<CloudSyncHistory>> {
    // If there's a sync data that is applicable, we'd use it to reduce database querying workload
    // Newer data will eventually be retrieved by the client
    return super.readOne<CloudSyncHistory>('CloudSyncHistory', {
      shopName,
      status: {
        [Sequelize.Op.ne]: 'Failed'
      },
      sinceTime: {
        [Sequelize.Op.lte]: lastSyncTime
      },
      untilTime: {
        [Sequelize.Op.gt]: lastSyncTime
          // In case of multiple results, we wanna get the most recent data whose sinceTime is closer to our lastSyncTIme
      }},{ order: [['untilTime', 'DESC'], ['sinceTime', 'DESC']], transaction, lock: transaction && transaction.LOCK.UPDATE })
  }

  public getDataSince (shopName: string, sinceTime: string): Promise<any> {
    return super.readOne<Shop>('Shop', { name: shopName }).then(resp => {
      if (resp.status && resp.data) {
        // TODO
        // 1. Select data from the table that meets criteria
        // 2. Update syncHistory status to 'Failed' or 'Success
        // Data from these tables are the ones that need to be sent
        const models = ['Image', 'Category', 'SubCategory', 'Product', 'Variant', 'ProductImage', 'Supplier', 'SupplierStock', 'Promotion']
        return Promise.map(models, model => {
          return super.getModels(model).findAll({
            where: {
              [Sequelize.Op.or]: {
                updatedAt: {
                  [Sequelize.Op.gte]: sinceTime
                },
                deletedAt: {
                  [Sequelize.Op.gte]: sinceTime
                }
              }
            },
            paranoid: false
          }).then(data => {
            return {
              model,
              data
            }
          })
        }, { concurrency: 5 }).then((results: Array<{model: string, data: BaseModel[]}>) => {
          return results.reduce((acc, result) => {
            return { ...acc, [result.model]: result.data }
          }, {})
        })
      } else {
        throw new Error(`Shop doesn't exist!`)
      }
    })
  }

  protected prepareData (shopName: string, sinceTime: string, untilTime: string, syncHistoryId: number): Promise<NCResponse<CloudSyncHistory>> {
    return this.getDataSince(shopName, sinceTime).then(data => {
      // Write generated cloud sync data to file
      return new Promise((resolve, reject) => {
        try {
          const outFileName = `${Date.now()}_cloud-sync-data.json`
          fs.writeFile(
            path.join(AppConfig.GENERATED_CLOUD_SYNC_DATA, outFileName),
            JSON.stringify(data), err => {
              if (err) {
                reject(err)
              } else {
                resolve(outFileName)
              }
            })
        } catch (err) {
          reject(err)
        }
      }).then((fileName: string) => {
        // Update SyncHistory
        return super.update<CloudSyncHistory>('CloudSyncHistory', { status: 'Success', fileName }, { id: syncHistoryId }).then(resp2 => {
          if (!(resp2.status && resp2.data !== undefined && resp2.data > 0)) {
            log.error(TAG, `prepareData(): Failed to update CloudSyncHistory! id=${syncHistoryId} resp=${JSON.stringify(resp2)}`)
            // TODO: send email using MailService
            return { status: false, errMessage: resp2.errMessage }
          } else {
            return super.readOne<CloudSyncHistory>('CloudSyncHistory', { id: syncHistoryId })
          }
        })
      }).catch(err => {
        return super.update<CloudSyncHistory>('CloudSyncHistory', { status: 'Failed', info: err.message }, { id: syncHistoryId }).then(resp2 => {
          if (!(resp2.status && resp2.data !== undefined && resp2.data > 0)) {
            log.error(TAG, `prepareData(): Failed to update CloudSyncHistory! id=${syncHistoryId} resp=${JSON.stringify(resp2)}`)
            // TODO: send email using MailService
          }
          throw err
        })
      })
    })
  }
}

export default new CloudSyncService()
export { CloudSyncService as CloudSyncServiceCls }
