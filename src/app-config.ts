import * as path from 'path'

const LOCAL_SHOP_INFORMATION = {
  NAME: 'Nusantara Gizmo 1' // This should be the same as shop.name
}

// For each products, we can customize certain information, depending
// on the shop. This is the default configuration
// NOTE: To apply changes, SQL views have to be re-created! (see. services/sql-view-service)
const DEFAULT_SHOP_PRODUCT_BEHAVIOR = {
  preOrderAllowed: true, // By default, pre-order is allowed for all products
  preOrderDuration: 3, // By default, poLength = 3 days for all products
  disabled: false // By default, all products are enabled
}

const DB = {
  USERNAME: 'root',
  PASSWORD: '',
  HOST: 'localhost',
  PORT: 3306,
  DB_NAME: 'app_ntech'
}

export default {
  BASE_URL: 'http://ntech.nusantara-local.com',
  IMAGE_PATH: path.join(__dirname, '../images/'),
  IMAGE_MOUNT_PATH: '/images/',
  CLOUD_SERVER: false,
  LOCAL_SHOP_INFORMATION,
  DEFAULT_SHOP_PRODUCT_BEHAVIOR,
  DB
}
