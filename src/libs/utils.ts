import * as util from 'util'

import AppConfig from '../app-config'
import * as getSlug from 'speakingurl'

import * as Treeize from 'treeize'
import * as flatToTrees from 'flatToTrees'

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

export function getProductURL (product: Product) {
  /* if (product.subCategory.length > 0 && product.subCategory[0].category.length > 0) {
    return `/${product.subCategory[0].category[0].id}/${getSlug(product.subCategory[0].category[0].name)}` +
      `/${product.subCategory[0].id}/${getSlug(product.subCategory[0].name)}` +
      `/${product.id}/${getSlug(product.name)}`
  } else {
    throw new Error('Product needs to have subCategory and category')
  } */

  if (product.subCategory && product.subCategory.category) {
    return `/${product.subCategory.category.id}/${getSlug(product.subCategory.category.name)}` +
      `/${product.subCategory.id}/${getSlug(product.subCategory.name)}` +
      `/${product.id}/${getSlug(product.name)}`
  } else {
    throw new Error('Product needs to have subCategory and category')
  }
}

export function getProductCategoryURL (product: Product) {
  /* return `/category/${product.subCategory[0].category[0].id}/${getSlug(product.subCategory[0].category[0].name)}` */
  console.dir(product)
  return `/category/${product.subCategory.category.id}/${getSlug(product.subCategory.category.name)}`
}

export function getProductCategory (product: Product) {
  return product.subCategory.category.name
}

export function getProductSubCategoryURL (product: Product) {
  return `/category/${product.subCategory.category.id}/${getSlug(product.subCategory.category.name)}/sub-category/${product.subCategory.id}/${getSlug(product.subCategory.name)}`
}

export function getProductSubCategory (product: Product) {
  return product.subCategory.name
}

// If data is already array, leave it.
// If data is object, returns [data]
// If data is null, returns []
export function arrayify (data) {
  if (Array.isArray(data)) {
    return data
  } else if (data) {
    return [data]
  } else {
    return []
  }
}

// Convert flat SQL array into Object. Delimiter is "."
// NOTE: flatToTrees always convert sub-child into array, i.e. a.b: 3' into a.b = [3]
// Due to this, we need to manually parse the array into object
export function objectify (flatArray) {
  const result = flatToTrees(flatArray, {
    removeDuplicateLeaves: true
  })

  return result
}
