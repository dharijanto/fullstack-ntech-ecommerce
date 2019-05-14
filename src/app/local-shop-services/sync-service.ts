import * as fs from 'fs'
import * as path from 'path'

import * as Promise from 'bluebird'
import * as moment from 'moment'
import * as log from 'npmlog'

import { Transaction } from 'sequelize'
import axios from 'axios'

import * as AppConfig from '../../app-config'
import CRUDService from '../../services/crud-service'
import Sequelize = require('sequelize')
import LocalShopService from './local-shop-service'

import { CloudSyncResp } from '../../services/cloud-sync-service'

const TAG = 'CloudSyncService'

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
class SyncService extends CRUDService {
  cloudToLocalSync (): Promise<NCResponse<Partial<CloudToLocalSyncHistory>>> {
    return super.getSequelize().transaction({ isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE }, trx => {
      // Check whether there's a sync that's currently being processed
      return this.getApplyingCloudToLocalSyncHistory(trx).then(resp => {
        // Sync data is currently being applied, bailing
        if (resp.status && resp.data) {
          return resp
        // No sync is progressing
        } else {
          // Get the last time we had successfully sync. We'll retrieve only data that is newer
          return this.getLastSuccessfulCloudToLocalSyncHistory(trx).then(resp => {
            // Fallback value, we leave it empty. Server knows it means we've never synced before
            let lastSyncTime = ''
            if (resp.status && resp.data) {
              lastSyncTime = resp.data.untilTime
            }
            // Ask cloud server for data since lastSyncTime
            return this.requestCloudToLocalSync(lastSyncTime).then(resp => {
              if (resp.status && resp.data) {
                const cloudSyncHistory = resp.data
                // Server has the data ready! We can apply them
                if (cloudSyncHistory.status === 'Success') {
                  if (cloudSyncHistory.fileName) {
                    return this.retrieveAndApplyCloudToLocalData(cloudSyncHistory.fileName, cloudSyncHistory.untilTime, undefined, trx)
                  } else {
                    throw new Error('cloudSyncHistory status is success, but it doesn\'t have filename!')
                  }
                } else if (cloudSyncHistory.status === 'Preparing') {
                  return { status: true, data: { status: 'Preparing' } } as NCResponse<Partial<CloudToLocalSyncHistory>>
                } else {
                  throw new Error('')
                }
              } else {
                throw new Error('Failed to retrieve cloud data: ' + resp.errMessage)
              }
            })
          })
        }
      })
    })
  }

  protected retrieveAndApplyCloudToLocalData (
    remoteSyncFileName: string,
    untilTime: string,
    fileNameToJSONData?: (filename: string) => Promise<object>, // Used for unit-testing purposes
    transaction?: Sequelize.Transaction
  ): Promise<NCResponse<Partial<CloudToLocalSyncHistory>>> {
    return this.createCloudToLocalSyncHistory('Applying', untilTime, transaction).then(resp => {
      if (resp.status && resp.data) {
        const cloudToLocalSyncHistory = resp.data
        let jsonResolver: (filename: string) => Promise<Object>
        if (fileNameToJSONData) {
          jsonResolver = fileNameToJSONData
        } else {
          jsonResolver = (filename: string) => {
            return Promise.resolve(axios.get(`${AppConfig.CLOUD_SERVER.HOST}/cloud-sync/cloud-data/${filename}`).then(rawResp => {
              return rawResp.data
            }))
          }
        }

        jsonResolver(remoteSyncFileName).then(json => {
          const modelNames = Object.keys(json)
          // Note: this is intentionally a different transaction because we don't want it to block
          return super.getSequelize().transaction({ isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE }, trx => {
            return Promise.map(modelNames, modelName => {
              return Promise.map(json[modelName], (data: any) => {
                // Clear out updatedAt so that it's re-generated
                // Paranoid option is required to handle deleted items
                return super.getModels(modelName).findOne({
                  where: { id: data.id },
                  paranoid: false,
                  transaction: trx,
                  lock: Sequelize.Transaction.LOCK.UPDATE
                }).then(result => {
                  if (result) {
                    const updateAny = super.getModels(modelName).update.bind(super.getModels(modelName))
                    // deletedAt is required so that it's reset to NULL
                    return updateAny(
                      { ...data, updatedAt: null },
                      { where: { id: result.id }, paranoid: false, transaction: trx }).catch(err => {
                        throw new Error(`Failed to update data=${JSON.stringify(data)}: ` + err)
                      })
                  } else {
                    return super.getModels(modelName).create(
                      { ...data, updatedAt: null }, { transaction: trx }
                    ).catch(err => {
                      throw new Error(`Failed to create data=${JSON.stringify(data)}: ` + err)
                    })
                  }
                })
              })
            })
          })
        }).then(() => {
          this.updateCloudToLocalSyncHistory(cloudToLocalSyncHistory.id, 'Success')
        }).catch(err => {
          log.error(TAG, 'Failed to apply data from cloud: ' + err)
          this.updateCloudToLocalSyncHistory(cloudToLocalSyncHistory.id, 'Failed', err.message)
        })

        // Note that return and jsonResolver are intentionally made parallel
        // because we don't want caller transaction to block until all data processing has completed
        return resp
      } else {
        throw new Error('Failed to create cloudToLocalSyncHistory: ' + resp.errMessage)
      }
    })
  }

  protected createCloudToLocalSyncHistory (
    status: 'Applying' | 'Success' | 'Failed',
    untilTime: string, transaction?: Sequelize.Transaction
  ): Promise<NCResponse<CloudToLocalSyncHistory>> {
    return super.create<CloudToLocalSyncHistory>('CloudToLocalSyncHistory', {
      status,
      untilTime
    }, { transaction })
  }

  protected updateCloudToLocalSyncHistory (id: number, status: 'Applying' | 'Success' | 'Failed', info?: string, transaction?: Sequelize.Transaction) {
    return super.update<CloudToLocalSyncHistory>('CloudToLocalSyncHistory', {
      status,
      info
    }, { id : id }, { transaction })
  }

  protected getLastSuccessfulCloudToLocalSyncHistory (transaction?: Transaction): Promise<NCResponse<CloudToLocalSyncHistory>> {
    return super.readOne<CloudToLocalSyncHistory>(
      'CloudToLocalSyncHistory',
      { status: 'Success' },
      { order: [['updatedAt', 'DESC']], transaction, lock: transaction && transaction.LOCK.UPDATE }
    )
  }

  protected getLastFailedCloudToLocalSyncHistory (transaction?: Transaction): Promise<NCResponse<CloudToLocalSyncHistory>> {
    return super.readOne<CloudToLocalSyncHistory>(
      'CloudToLocalSyncHistory',
      { status: 'Failed' },
      { order: [['updatedAt', 'DESC']], transaction, lock: transaction && transaction.LOCK.UPDATE }
    )
  }

  protected getApplyingCloudToLocalSyncHistory (transaction?: Transaction): Promise<NCResponse<CloudToLocalSyncHistory>> {
    return super.readOne<CloudToLocalSyncHistory>(
      'CloudToLocalSyncHistory',
      { status: 'Applying' },
      { order: [['updatedAt', 'DESC']], transaction, lock: transaction && transaction.LOCK.UPDATE }
    )
  }

  protected requestCloudToLocalSync (lastSyncTime: string): Promise<NCResponse<CloudSyncResp>> {
    const shopName = LocalShopService.getLocalShopName()
    return Promise.resolve(axios.get(`${AppConfig.CLOUD_SERVER.HOST}/cloud-sync/request-cloud-data?lastSyncTime=${lastSyncTime}&shopName=${shopName}`).then(rawResp => {
      const resp: NCResponse<CloudSyncHistory> = rawResp.data
      if ('status' in resp) {
        if (resp.status && resp.data) {
          return resp
        } else {
          throw new Error('Failed to request cloud data: ' + resp.errMessage)
        }
      } else {
        throw new Error('Unexpected server response: ' + JSON.stringify(resp))
      }
    }))
  }
}

export default new SyncService()
export { SyncService as SyncServiceCls }
