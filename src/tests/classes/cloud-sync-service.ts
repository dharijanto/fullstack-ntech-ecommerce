import * as Promise from 'bluebird'

import { Transaction } from 'sequelize'

import { CloudSyncServiceCls } from '../../services/cloud-sync-service'

export default class MyCloudSyncService extends CloudSyncServiceCls {
  public prepareData (shopName: string, sinceTime: string, untilTime: string, syncHistoryId: number): Promise<NCResponse<CloudSyncHistory>> {
    return super.prepareData.apply(this, arguments)
  }

  public createSyncHistory (shopName: string, status: CloudSyncStatus, sinceTime: string, transaction?: Transaction): Promise<NCResponse<CloudSyncHistory>> {
    return super.createSyncHistory.apply(this, arguments)
  }

  public getSyncHistory (shopName: string, lastSyncTime: string, transaction?: Transaction): Promise<NCResponse<CloudSyncHistory>> {
    return super.getSyncHistory.apply(this, arguments)
  }
}
