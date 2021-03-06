import * as util from 'util'

import { CRUDService } from '../../services/crud-service'
import ShopService from '../../services/shop-service'
import { Model } from 'sequelize'
import * as Promise from 'bluebird'

import * as AppConfig from '../../app-config'
import * as Utils from '../../libs/utils'

export interface VariantAvailability {
  status: 'readyStock' | 'preOrder'
  quantity?: number
}

export interface CategorizedProduct {
  name: string // Category name
  subCategories: Array<{
    name: string
    inStockProducts: Array<InStockProduct>
    poProducts: Array<POProduct>
  }>
}

const a: NCResponse<null> = { status: false, errMessage: '' }

/*
  Used for shop-specific code. This should re-use what's in shop-service as much as possible, though.

  TODO: Move out the logics here to separate files. This file should only contain getLocalShopId() and initialization
 */
class LocalShopService extends CRUDService {
  private localShopId: number = -1
  initialize (): Promise<NCResponse<null>> {
    if (!AppConfig.LOCAL_SHOP_INFORMATION || !AppConfig.LOCAL_SHOP_INFORMATION.NAME) {
      return Promise.resolve({ status: false, errMessage: 'Local Shop Information is not defined!' })
    } else {
      if (this.localShopId === -1) {
        return super.readOne<Shop>('Shop', { name: AppConfig.LOCAL_SHOP_INFORMATION.NAME }).then(resp => {
          if (resp.status && resp.data) {
            this.localShopId = resp.data.id
            return { status: true, data: null }
          } else {
            throw new Error('Shop name is not found!')
          }
        })
      } else {
        return Promise.resolve({ status: true, data: null })
      }
    }
  }

  getLocalShopId (): number {
    if (this.localShopId !== -1) {
      return this.localShopId
    } else {
      throw new Error('Local shop id is not yet retrieved!')
    }
  }

  getLocalShopName (): string {
    if (this.localShopId !== -1) {
      return AppConfig.LOCAL_SHOP_INFORMATION.NAME
    } else {
      throw new Error('Local shop id is not yet retrieved!')
    }
  }

  getShop (): Promise<NCResponse<Shop>> {
    return ShopService.getShop(this.getLocalShopId())
  }

  getShopifiedProducts () {
    return ShopService.getShopifiedProducts(this.getLocalShopId())
  }

  /*
    InStockProduct[] with:
    -primaryImage
    -subCategories

    This is used by landing page, where we display
  */
  getInStockProducts ({ pageSize = 10, pageIndex = 0,
                        productId = null, categoryId = null,
                        subCategoryId = null }): Promise<NCResponse<{ products: InStockProduct[], totalProducts: number }>> {
    return ShopService.getInStockProducts({ pageSize, pageIndex, productId, categoryId, subCategoryId }, this.localShopId)
  }

  getInStockProduct (productId): Promise<NCResponse<InStockProduct>> {
    return this.getInStockProducts({ productId, pageSize: 1, pageIndex: 0 }).then(resp => {
      if (resp.status && resp.data) {
        if (resp.data && resp.data.products.length > 0) {
          return { status: true, data: resp.data.products[0] }
        } else {
          return { status: false, errMessage: 'Product not found!' }
        }
      } else {
        return { status: false, errMessage: resp.errMessage }
      }
    })
  }

  getPOProducts ({ pageSize = 10, pageIndex = 0,
                   productId = null, categoryId = null,
                   subCategoryId = null }): Promise<NCResponse<{ products: POProduct[], totalProducts: number }>> {
    return ShopService.getPOProducts({ pageSize, pageIndex, productId, categoryId, subCategoryId }, this.localShopId)
  }

  getPOProduct (productId): Promise<NCResponse<POProduct>> {
    return this.getPOProducts({ pageSize: 1, pageIndex: 0, productId }).then(resp => {
      if (resp.status && resp.data) {
        if (resp.data.products.length) {
          return { status: true, data: resp.data.products[0] }
        } else {
          return { status: false, errMessage: 'Product not found!' }
        }
      } else {
        return { status: false, errMessage: resp.errMessage }
      }
    })
  }

  getProductsByCategories (): Promise<NCResponse<{categories: CategorizedProduct[], lastUpdated: string}>> {
    /*
      We'll have at most thousands of products and getting price list is
      not something done too often. So for now, we can get by doing the product
      grouping manually.
    */
    const categories: CategorizedProduct[] = []
    let lastUpdated: string
    // Helper function to help grouping
    function addProduct (inStockProduct: boolean, product: InStockProduct | POProduct) {
      function getSubCategory (categoryName, subCategoryName) {
        function getCategory (categoryName) {
          let category = categories.find(category => category.name === categoryName)
          if (!category) {
            category = {
              name: categoryName,
              subCategories: []
            }
            categories.push(category)
          }
          return category
        }
        const subCategories = getCategory(categoryName).subCategories
        let subCategory = subCategories.find(subCategory => subCategory.name === subCategoryName)
        if (!subCategory) {
          subCategory = {
            name: subCategoryName,
            poProducts: [],
            inStockProducts: []
          }
          subCategories.push(subCategory)
        }
        return subCategory
      }
      if (!product.subCategory || !product.subCategory.category) {
        throw new Error('Product does not have category or subCategory defined!')
      }
      const subCategoryName = product.subCategory.name
      const categoryName = product.subCategory.category.name
      const subCategory = getSubCategory(categoryName, subCategoryName)
      if (inStockProduct) {
        subCategory.inStockProducts.push(product as InStockProduct)
      } else {
        subCategory.poProducts.push(product as POProduct)
      }
      if (!lastUpdated) {
        lastUpdated = product.updatedAt
      } else {
        lastUpdated = product.updatedAt > lastUpdated ? product.updatedAt : lastUpdated
      }
    }

    return Promise.join<NCResponse<any>>(
      this.getInStockProducts({}),
      this.getPOProducts({})
    ).spread((resp1: NCResponse<InStockProduct[]>, resp2: NCResponse<POProduct[]>) => {
      if (resp1.status && resp1.data && resp2.status && resp2.data) {
        resp1.data.forEach(inStockProduct => {
          addProduct(true, inStockProduct)
        })
        resp2.data.forEach(poProduct => {
          addProduct(false, poProduct)
        })

        return { status: true, data: { categories, lastUpdated } }
      } else {
        return { status: false, errMessage: resp1.errMessage || resp2.errMessage }
      }
    })
  }

  getShopifiedVariants (productId): Promise<NCResponse<ShopifiedVariant[]>> {
    if (!productId) {
      return Promise.resolve({ status: false, errMessage: 'productId is required!' })
    } else {
      return ShopService.getShopifiedVariants(this.localShopId, productId)
    }
  }

  // Update shopProduct entry
  // In actuality, this can be insert/update
  updateProduct (productId: number, data: Partial<ShopProduct>) {
    const { price, preOrderAllowed, preOrderDuration, disabled } = data
    return this.getModels('ShopProduct').findOne({ where: { shopId: this.localShopId, productId } }).then(data => {
      return {
        id: data && data.id,
        productId,
        shopId: this.localShopId,
        price,
        preOrderAllowed,
        preOrderDuration,
        disabled
      }
    }).then(shopProduct => {
      return this.getModels('ShopProduct').upsert(shopProduct).then(count => {
        return { status: true }
      })
    })
  }

  getVariantInformation (variantId): Promise<NCResponse<{product: ShopifiedProduct, variant: ShopifiedVariant}>> {
    return this.readOne<Variant>('Variant', {
      id: variantId
    }).then(resp => {
      if (resp.status && resp.data) {
        const productId = resp.data.productId
        return Promise.join(
          super.getSequelize().query(
            `SELECT * FROM shopifiedVariantsView WHERE id = ${variantId} AND shopId=${this.localShopId}`,
            { type: super.getSequelize().QueryTypes.SELECT }),
          super.getSequelize().query(
            `SELECT * FROM shopifiedProductsView WHERE id = ${productId} AND shopId=${this.localShopId}`,
            { type: super.getSequelize().QueryTypes.SELECT })
        ).spread((rawVariant, rawProduct) => {
          if (rawVariant && rawProduct) {
            const variant = Utils.objectify(rawVariant)[0]
            const product = Utils.objectify(rawProduct)[0]
            return { status: true, data: { variant, product } }
          } else if (!rawVariant) {
            return { status: false, errMessage: `variantId=${variantId} is not found!` }
          } else {
            return { status: false, errMessage: `productId=${productId} is not found!` }
          }
        })
      } else {
        return { status: false, errMessage: 'variantId=' + variantId + ' is not found!' }
      }
    })
  }

  getVariantPrice (variantId): Promise<NCResponse<number>> {
    return this.readOne<Variant>('Variant', {
      id: variantId
    }).then(resp => {
      if (resp.status && resp.data) {
        const productId = resp.data.productId
        return super.getSequelize().query(
          `SELECT shopPrice FROM shopifiedProductsView WHERE id = ${productId} AND shopId = ${this.getLocalShopId()}`,
          { type: super.getSequelize().QueryTypes.SELECT }).then(result => {
            if (result && result.length > 0) {
              const shopifiedProduct = result[0]
              return { status: true, data: shopifiedProduct.shopPrice }
            } else {
              return { status: false, errMessage: 'productId=' + productId + ' is not found!' }
            }
          })
      } else {
        return { status: false, errMessage: 'variantId=' + variantId + ' is not found!' }
      }
    })
  }

  // TODO: This returns the quantity of the product, but what we want is the quantity of a specific variant,
  //       not all of them!
  getVariantAvailability (variantId: number): Promise<NCResponse<VariantAvailability>> {
    return this.rawReadOneQuery(`
    SELECT * FROM shopifiedVariantsView WHERE id = ${variantId} AND shopId = ${this.getLocalShopId()}
    `).then((resp: NCResponse<ShopifiedVariant>) => {
      if (resp.status && resp.data) {
        const availability = {
          status: resp.data.stockQuantity > 0 ? 'readyStock' : 'preOrder',
          quantity: resp.data.stockQuantity
        } as VariantAvailability

        return { status: true, data: availability }
      } else {
        return { status: false, errMessage: resp.errMessage }
      }
    })
  }

  getPromotions (): Promise<NCResponse<ShopifiedPromotion[]>> {
    return ShopService.getPromotions(this.getLocalShopId())
  }

  getPromotedProducts (): Promise<NCResponse<{ products: InStockProduct[], totalProducts: number }>> {
    return ShopService.getPromotedProducts(this.getLocalShopId())
  }

  createPromotion (productId: number, data: Partial<Promotion>): Promise<NCResponse<Promotion>> {
    if (productId) {
      return super.create<Promotion>('Promotion', Object.assign({ shopId: this.getLocalShopId(), productId }, data))
    } else {
      return Promise.resolve({ status: false, errMessage: 'productId is required!' })
    }
  }

  updatePromotion (productId: number, promotionId: number, data: Partial<Promotion>): Promise<NCResponse<number>> {
    if (data.id) {
      return super.update<Promotion>('Promotion',
          Object.assign({ shopId: this.getLocalShopId(), productId }, data), { id: promotionId })
    } else {
      return Promise.resolve({ status: false, errMessage: 'promotionId is required!' })
    }
  }

  // TODO: Add shopId: this.getLocalShopId() for security
  deletePromotion (promotionId: number): Promise<NCResponse<number>> {
    if (promotionId) {
      return super.delete<Promotion>('Promotion', { id: promotionId })
    } else {
      return Promise.resolve({ status: false, errMessage: 'promoitonId is required!' })
    }
  }
}

export default new LocalShopService()
