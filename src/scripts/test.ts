import * as util from 'util'

import * as Sequelize from 'sequelize'
import AppConfig from '../app-config'
const sequelizeSync = require('../db-structure')
import SequelizeService from '../services/sequelize-service'
import LocalShopService from '../app/local-shop-services/local-shop-service'

const optionalPassword = AppConfig.DB.PASSWORD ? `:${AppConfig.DB.PASSWORD}` : ''
const sequelize = new Sequelize(AppConfig.DB.DB_NAME, AppConfig.DB.USERNAME, AppConfig.DB.PASSWORD,
  {
    dialect: 'mysql',
    port: AppConfig.DB.PORT,
    logging: true
  })

const models = sequelizeSync(sequelize, {})
sequelize.sync().then(() => {
  SequelizeService.initialize(sequelize, models)
  LocalShopService.initialize().then(() => {
    main()
  })
})

function main () {
  /* const promises = [LocalShopService.getInStockProducts, LocalShopService.getInStockProduct]
  const arg = [[], [5]]

  promises.reduce((acc, promise, index) => {
    return acc.then(() => {
      return promise(arg[index])
    })
  }, Promise.resolve())
 */
  /* LocalShopService.getInStockProduct(5).then(resp => {
    console.log(JSON.stringify(resp))
  }) */
  LocalShopService.getInStockProducts({}).then(resp => {
    if (resp.status && resp.data) {
      console.log(util.inspect(resp, false, null, true))
      /* resp.data.forEach(product => {
        console.log(product.name)
      }) */
    } else {
      console.log('unexpected!')
    }
  })
}
