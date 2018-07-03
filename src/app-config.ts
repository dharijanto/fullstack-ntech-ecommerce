import * as path from 'path'

const IMAGE_PATH = path.join(__dirname, '../images/')
export default {
  BASE_URL: 'http://ntech.nusantara-local.com',
  IMAGE_PATH,
  IMAGE_MOUNT_PATH: '/images/',
  PRODUCT_IMAGES_UPLOAD_PATH: path.join(IMAGE_PATH, 'products'),
  PRODUCT_IMAGES_MOUNT_PATH: '/images/products/'
}
