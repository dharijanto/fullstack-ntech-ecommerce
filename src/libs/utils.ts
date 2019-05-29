import * as util from 'util'

import * as AppConfig from '../app-config'
import * as getSlug from 'speakingurl'

import * as Treeize from 'treeize'
import * as flatToTrees from 'flatToTrees'

// Depending whether the server is locally hosted or on the cloud,
// image mount path could be differentz
export function getImageURL (imageFilename, cms = false) {
  if (imageFilename) {
    if (cms) {
      return `${AppConfig.BASE_URL}${AppConfig.IMAGE_MOUNT_PATH}${imageFilename}`
    } else {
      return `${AppConfig.IMAGE_MOUNT_PATH}${imageFilename}`
    }
  } else {
    return ``
  }
}

// Convert 10000 -> Rp. 10.000
export function formatPrice (price) {
  price = '' + price
  let result = ''
  for (let i = 0; i < price.length; i++) {
    const index = price.length - i - 1
    const c = price[index]
    result = c + result
    if ((i + 1) % 3 === 0 && i !== 0 && i !== price.length - 1) {
      result = '.' + result
    }
  }
  return `Rp. ${result}`
}

export function getHomeURL (inStockProductPage = 1, poProductPage = 1, anchor = null) {
  return `/?in-stock-products-page=${inStockProductPage}&po-products-page=${poProductPage}${anchor ? '#' + anchor : ''}`
}

export function getProductURL (product: Product) {
  if (product.subCategory && product.subCategory.category) {
    return `/${product.subCategory.category.id}/${getSlug(product.subCategory.category.name)}` +
      `/${product.subCategory.id}/${getSlug(product.subCategory.name)}` +
      `/${product.id}/${getSlug(product.name)}`
  } else {
    throw new Error('Product needs to have subCategory and category')
  }
}

/* export function getProductCategoryURL (product: Product) {
  return `/category/${product.subCategory.category.id}/${getSlug(product.subCategory.category.name)}`
}
 */
export function getCategoryName (product: Product) {
  return product.subCategory.category.name
}

/* export function getProductSubCategoryURL (product: Product, inStockProductPage = 1, poProductPage = 1, anchor = null) {
  return `/category/${product.subCategory.category.id}/${getSlug(product.subCategory.category.name)}` +
         `/sub-category/${product.subCategory.id}/${getSlug(product.subCategory.name)}`
}
 */
export function getSubCategoryName (product: Product) {
  return product.subCategory.name
}

export function getCategoryURL (category: Category, inStockProductPage = 1, poProductPage = 1, anchor = null) {
  return `/${category.id}/${getSlug(category.name)}` +
      `?in-stock-products-page=${inStockProductPage}&po-products-page=${poProductPage}${anchor ? '#' + anchor : ''}`
}

export function getSubCategoryURL (category: Category, subCategory: SubCategory, inStockProductPage = 1, poProductPage = 1, anchor = null) {
  return `/${category.id}/${getSlug(category.name)}/${subCategory.id}/${getSlug(subCategory.name)}` +
      `?in-stock-products-page=${inStockProductPage}&po-products-page=${poProductPage}${anchor ? '#' + anchor : ''}`
}

export function getPromotionURL (promotion: ShopifiedPromotion) {
  return `/${promotion.categoryId}/${getSlug(promotion.categoryName)}/${promotion.subCategoryId}/` +
         `${getSlug(promotion.subCategoryName)}/${promotion.productId}/${getSlug(promotion.productName)}`
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

export function range (start: number, end: number, step: number = 1) {
  let result: Array<number> = []
  for (let i = start ; i < end ; i += step) {
    result.push(i)
  }

  return result
}

export function isNumber (s) {
  if (s === null || s === undefined) {
    return false
  }

  let str = s
  if (typeof str !== 'string') {
    str = '' + s
  }

  return str.match(/^\d+$/) !== null
}

// Pagination helper
export function getNumberOfPage (totalProducts: number, productsPerPage: number) {
  if (totalProducts <= productsPerPage) {
    return 1
  } else {
    return (totalProducts / productsPerPage).toFixed()
  }
}
