import * as path from 'path'

const LOCAL_SHOP_INFORMATION = {
  NAME: 'Nusantara Gizmo 1' // This should be the same as shop.name
}

// For each products, we can customize certain information, depending
// on the shop. This is the default configuration
const DEFAULT_SHOP_PRODUCT_INFORMATION = {
  preOrder: true, // By default, pre-order is allowed for all products
  poLength: 3, // By default, poLength = 3 days for all products
  disable: false // By default, all products are enabled
}

export default {
  BASE_URL: 'http://ntech.nusantara-local.com',
  IMAGE_PATH: path.join(__dirname, '../images/'),
  IMAGE_MOUNT_PATH: '/images/',
  CLOUD_SERVER: false,
  LOCAL_SHOP_INFORMATION,
  DEFAULT_SHOP_PRODUCT_INFORMATION
}
