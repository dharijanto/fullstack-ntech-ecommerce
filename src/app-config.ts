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

const RECEIPT_PRINTER = {
  DEVICE_NAME: 'POS58', // CUPS device name, see http://localhost:631/admin
  PAPER_WIDTH: '58mm'
}

export default {
  PRODUCTION: false,
  BASE_URL: 'http://ntech.nusantara-local.com',
  IMAGE_PATH: path.join(__dirname, '../images/'),
  IMAGE_MOUNT_PATH: '/images/',
  GENERATED_PRINT_PDF_PATH: path.join(__dirname, '../gen-pdf/'),
  CLOUD_SERVER: false,
  LOCAL_SHOP_INFORMATION,
  DEFAULT_SHOP_PRODUCT_BEHAVIOR,
  DB,
  RECEIPT_PRINTER,
}
