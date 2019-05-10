import Axios from 'axios'
import * as Promise from 'bluebird'
import * as log from 'npmlog'

import * as AppConfig from '../../app-config'
import CRUDService from '../../services/crud-service'
import SequelizeService from '../../services/sequelize-service'
import Sequelize = require('sequelize')
import LocalShopService from './local-shop-service'

const TAG = 'SyncService'

interface InternalSyncState {
  /**
   * Syncing: Shop server is currently updating its database
   * Ready: Shop server is ready to sync
   * Failed: Last syncing effort was failed
   */
  status: 'Ready' | 'Syncing' | 'Failed'
}

class SyncService extends CRUDService {

  /**
   * Returns shop data to be synced
   */
  getShopData (lastSyncDate?: string) {
    return
  }

  /**
   * Talk to cloud server, get sync histories
   *
   * @param shopIdentifier
   */
  getSyncHistories () {
    return
  }

  // Functions related to syncing cloud-to-local

  getCloudSyncHistories () {
    return super.read<ShopSyncState>('ShopSyncState', {})
  }

  private getLastCloudSyncState (): Promise<NCResponse<ShopSyncState>> {
    return super.readOne<ShopSyncState>('ShopSyncState', {}, { order: [['updatedAt', 'DESC']] })
  }

  // This is needed to know the age of the data to be requested from the cloud
  private getLastCloudSuccessSyncState () {
    return super.readOne<ShopSyncState>('ShopSyncState', { state: 'Success' }, { order: [['updatedAt', 'DESC']] })
  }

  // Process cloud data
  private processCloudData (url: string, timeUntil: string): Promise<NCResponse<any>> {
    // 1. Update syncState to be 'Syncing'
    return super.create<ShopSyncState>('ShopSyncState', { state: 'Syncing', timeUntil }).then(resp => {
      if (resp.status && resp.data) {
        const shopSyncState = resp.data
        return super.getSequelize().transaction({ isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED }, transaction => {
          // 2. Download cloud data
          // 3. Apply cloud data to local db
          throw new Error('Not implemented yet!')
        }).then(() => {
          // 4. Update syncState to be 'Ready'
          throw new Error('Not implemented yet!')
        }).catch(err => {
          return super.update<ShopSyncState>('ShopSyncState', { state: 'Failed', description: err.message }, { id: shopSyncState.id })
        })
      } else {
        throw new Error('Failed to create ShopSyncState: ' + resp.errMessage)
      }
    })
  }

  requestCloudData (): Promise<NCResponse<{syncState: string}>> {
    return this.getLastCloudSyncState().then(resp => {
      if ((resp.status && resp.data && resp.data.state !== 'Syncing') || !resp.status) {
        return this.getLastCloudSuccessSyncState().then(resp2 => {
          let timeUntil = ''
          // If we've successfully synced before, we just wanna get data
          // that is newer than that, otherwise, we sync everything (by leaving timeUntil blank)
          if (resp2.status && resp2.data) {
            timeUntil = resp2.data.timeUntil
          }
          // TODO: Make this mockable for testing purposes?
          return Axios.post(`${AppConfig.CLOUD_SERVER.HOST}/cloud-sync/request`, {
            timeSince: timeUntil,
            shopName: LocalShopService.getLocalShopName()
          }).then(rawResp => {
            const resp3 = rawResp.data
            if (resp3.status && resp3.data) {
              const state: string = resp3.data.syncState
              if (state === 'preparing') {
                // Data is being prepared by the cloud
                return { status: true, data: { syncState: state } }
              } else if (state === 'ready') {
                if (!resp3.data.url || !resp3.data.timeUntil) {
                  throw new Error(`Cloud syncState is ready but doesn't return url and timeUntil!`)
                }
                this.processCloudData(resp3.data.url, resp3.data.timeUntil).then(resp => {
                  if (resp.status) {
                    log.info(TAG, 'requestSync(): processCloudData() succeeded!')
                  } else {
                    throw new Error(resp.errMessage)
                  }
                }).catch(err => {
                  log.error(TAG, 'requestSync(): processCloudData() failed: ' + err.message)
                })
                return { status: true, data: { syncState: 'Ready' } } as NCResponse<{syncState: string}>
              } else {
                throw new Error(`Unexpected syncState from the cloud: ${state}`)
              }
            } else {
              throw new Error(`/cloud-sync/request.POST returns unexpected data: ${JSON.stringify(resp3)}`)
            }
          })
        })
      } else {
        return { status: false, errMessage: 'Sync is in progress! syncState=' + JSON.stringify(resp) } as NCResponse<{syncState: string}>
      }
    })
  }
}

export default new SyncService()
