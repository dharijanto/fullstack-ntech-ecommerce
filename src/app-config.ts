import * as path from 'path'

const LOCAL_SHOP_INFORMATION = {
  NAME: 'Nusantara Gizmo 1' // This should be the same as shop.name
}

export default {
  BASE_URL: 'http://ntech.nusantara-local.com',
  IMAGE_PATH: path.join(__dirname, '../images/'),
  IMAGE_MOUNT_PATH: '/images/',
  CLOUD_SERVER: false,
  LOCAL_SHOP_INFORMATION
}
