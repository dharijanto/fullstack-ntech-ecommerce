import * as Sequelize from 'sequelize'

import AppConfig from '../app-config'
import SearchService from '../services/search-service'
import SequelizeService from '../services/sequelize-service'
import LocalShopService from '../app/local-shop-services/local-shop-service'
const sequelizeSync = require('../db-structure')

const sequelize = new Sequelize(AppConfig.DB.DB_NAME, AppConfig.DB.USERNAME, AppConfig.DB.PASSWORD,
  {
    dialect: 'mysql',
    port: AppConfig.DB.PORT,
    logging: true
  })

const models = sequelizeSync(sequelize, {})
sequelize.sync().then(() => {
  SequelizeService.initialize(sequelize, models)
  return LocalShopService.initialize().then(() => {
    return SearchService.initialize().then(() => {
      console.log('Search service initialized!')
      /* SearchService.searchInStockProducts('Flash Drive').then(result => {
        console.log('Search for inStockProducts: \n' + JSON.stringify(result, null, 2))
      }).catch(err => {
        console.error('Search error: ' + err)
      }) */

      SearchService.searchPOProducts('iPhone').then(result => {
        console.log('Search for poProducts: ' + JSON.stringify(result, null, 2))
      }).catch(err => {
        console.error('Search error: ' + err)
      })

      /* SearchService.searchSubCategories('Computer').then(result => {
        console.log('Search for subCategories: ' + JSON.stringify(result, null, 2))
      }).catch(err => {
        console.error('Search error: ' + err)
      }) */
    })
  })
}).catch(err => {
  console.error('Search service failed to initialize: ' + err)
})
