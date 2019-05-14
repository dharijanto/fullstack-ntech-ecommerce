import * as Promise from 'bluebird'
import * as Sequelize from 'sequelize'
// tslint:disable-next-line:no-duplicate-imports
import { Transaction } from 'sequelize'

import { SyncServiceCls } from '../../app/local-shop-services/sync-service'

export default class MySyncService extends SyncServiceCls {
  retrieveAndApplyCloudToLocalData (
    remoteSyncFileName: string,
    untilTime: string,
    fileNameToJSONData?: (filename: string) => Promise<object>, // Used for unit-testing purposes
    transaction?: Sequelize.Transaction
  ): Promise<NCResponse<Partial<CloudToLocalSyncHistory>>> {
    return super.retrieveAndApplyCloudToLocalData.apply(this, arguments)
  }

  createCloudToLocalSyncHistory (
    status: 'Applying' | 'Success' | 'Failed',
    untilTime: string,
    transaction?: Sequelize.Transaction
  ): Promise<NCResponse<CloudToLocalSyncHistory>> {
    return super.createCloudToLocalSyncHistory.apply(this, arguments)
  }

  updateCloudToLocalSyncHistory (id: number, status: 'Applying' | 'Success' | 'Failed', info?: string, transaction?: Sequelize.Transaction) {
    return super.updateCloudToLocalSyncHistory.apply(this, arguments)
  }

  getLastSuccessfulCloudToLocalSyncHistory (transaction?: Transaction): Promise<NCResponse<CloudToLocalSyncHistory>> {
    return super.getLastSuccessfulCloudToLocalSyncHistory.apply(this, arguments)
  }

  getLastFailedCloudToLocalSyncHistory (transaction?: Transaction): Promise<NCResponse<CloudToLocalSyncHistory>> {
    return super.getLastFailedCloudToLocalSyncHistory.apply(this, arguments)
  }

  getApplyingCloudToLocalSyncHistory (transaction?: Transaction): Promise<NCResponse<CloudToLocalSyncHistory>> {
    return super.getApplyingCloudToLocalSyncHistory.apply(this, arguments)
  }
}
