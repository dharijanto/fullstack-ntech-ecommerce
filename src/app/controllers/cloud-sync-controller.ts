import * as path from 'path'

import * as express from 'express'
import * as log from 'npmlog'

import BaseController from './base-controller'
import { SiteData } from '../../site-definitions'

import CloudSyncService from '../../services/cloud-sync-service'
import * as AppConfig from '../../app-config'

const TAG = 'CloudSyncController'

/*
This controller is running only on the cloud server in order to serve syncing
 */
export default class CloudSyncController extends BaseController {
  constructor (siteData: SiteData) {
    super(siteData)

    super.addInterceptor((req, res, next) => {
      log.verbose(TAG, 'req.path=' + req.path)
      next()
    })

    super.routeUse('/cloud-data', express.static(AppConfig.GENERATED_CLOUD_SYNC_DATA))
    // Get data from the cloud, update it to the local database
    super.routeGet('/request-cloud-data', (req, res, next) => {
      const { lastSyncTime, shopName } = req.query
      CloudSyncService.getCloudData(lastSyncTime, shopName).then(resp => {
        res.json(resp)
      }).catch(err => {
        next(err)
      })
    })
  }
}
