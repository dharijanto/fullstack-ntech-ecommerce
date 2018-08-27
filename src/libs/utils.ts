import AppConfig from '../app-config'
import * as getSlug from 'speakingurl'

// Depending whether the server is locally hosted or on the cloud,
// image mount path could be differentz
export function getImageURL (imageFilename) {
  return `${AppConfig.BASE_URL}${AppConfig.IMAGE_MOUNT_PATH}${imageFilename}`
}

// Convert 10000 -> Rp. 10.000
export function formatPrice (price) {
  price = '' + price
  let result = ''
  for (let i = 0; i < price.length; i++) {
    const index = price.length - i - 1
    const c = price[index]
    console.log(c)
    result = c + result
    if ((i + 1) % 3 === 0 && i !== 0 && i !== price.length - 1) {
      result = '.' + result
    }
  }
  return `Rp. ${result}`
}
// Return: URL of format: /1/aksesoris-komputer/3/mouse/logitech-m235
export function getProductURL (product: Product) {
  if (product.subCategory && product.subCategory.category) {
    return `/${product.subCategory.category.id}/` +
      `${getSlug(product.subCategory.category.name)}/` +
      `${product.subCategory.id}/${getSlug(product.subCategory.name)}/` +
      `${product.id}/${getSlug(product.name)}`
  } else {
    throw new Error('Product needs to have subCategory and category')
  }
}
