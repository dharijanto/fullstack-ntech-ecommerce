import * as path from 'path'

import * as express from 'express'

import BaseController from './base-controller'
import { SiteData } from '../../site-definitions'

import CloudSyncService from '../../services/cloud-sync-service'
import * as AppConfig from '../../app-config'

let log = require('npmlog')

const TAG = 'MainController'

/*
This controller is running only on the cloud server in order to serve syncing
 */
export default class CloudSyncController extends BaseController {
  constructor (siteData: SiteData) {
    super(Object.assign(siteData, { viewPath: path.join(__dirname, '../views') }))
    if (!AppConfig.CLOUD_SERVER) {
      super.routeAll('*', (req, res, next) => {
        res.status(500).send('This is a cloud-specific feature!')
      })
    } else {
      super.routeUse('/cloud-data', express.static(AppConfig.GENERATED_CLOUD_SYNC_DATA))
      // Get data from the cloud, update it to the local database
      super.routePost('/request-cloud-data', (req, res, next) => {
        const { lastSyncTime, shopName } = req.body
        CloudSyncService.getCloudData(lastSyncTime, shopName).then(resp => {
          res.json(resp)
        }).catch(err => {
          next(err)
        })
      })
    }
  }
}
