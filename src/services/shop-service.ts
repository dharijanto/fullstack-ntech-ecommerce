import { CRUDService } from './crud-service'
import { Model, Instance } from 'sequelize'
import * as Promise from 'bluebird'

import AppConfig from '../app-config'

/*
  While Product describe generic information about product and ShopProduct
  adds shop-specific information, this combines both.

  Shop should really see this information instead of Product
*/
export interface ShopifiedProduct extends Product {
  shopId: number
  name: string
  subCategory: SubCategory
  variants: Variant[]
  productImages: ProductImage[]
  warranty: string
  description: string
  // --- Comes from shopProduct ---
  price: number // This is the information coming from shopProduct table that is respective to the shopId
  preOrder: boolean
  poLength: number
  disable: boolean
  // --- end ---
  supplierCount: number
  stockCount: number
}

/*
  This is used by ShopManagement in the CMS.
  We have LocalShopService, this is specifically for shop-specific code.
*/
class ShopService extends CRUDService {
  /*
    Return product joined with shopProduct meta information.
    If shopProduct is not defined, append meta information:
    {
      id: null,
      price: product.price,
      preOrder: true,
      poLength: 3 days,
      disable: false
    }
  */

  // TODO: We should create test cases to ensure this is correct...
  // i.e. when there are suppliers, supplier count is correct
  //      when there are shopStocks, the count is correct
  getProducts (shopId, primaryImagesOnly = false, productSearchClause = {}, categorySearchClause = {}): Promise<NCResponse<ShopifiedProduct[]>> {
    return (this.getModels('Product') as Model<Instance<Product>, Partial<Product>>).findAll<Product>({
      where: productSearchClause,
      include: [
        {
          model: super.getModels('ProductImage'),
          where: { primary: primaryImagesOnly }
        },
        {
          model: super.getModels('SubCategory'),
          include: [
            {
              model: super.getModels('Category'),
              where: categorySearchClause
            }
          ]
        },
        {
          model: super.getModels('Variant'),
          include: [
            {
              model: super.getModels('ShopStock'),
              where: {
                shopId
              },
              attributes: ['quantity'],
              required: false
            },
            {
              model: super.getModels('SupplierStock'),
              required: false
            },
            {
              model: super.getModels('OrderDetail'),
              required: false
            }
          ]
        },
        {
          model: super.getModels('ShopProduct'),
          where: {
            shopId
          },
          required: false
        }
      ]
    }).then(products => {
      const mutatedProducts = products.map(product => {
        return product.get({ plain: true })
      }).map(product => {
        /* const shopProduct: ShopProduct | undefined = product.shopProducts && product.shopProducts.find(shopProduct => shopProduct.productId === product.id) */
        let shopProduct: ShopProduct
        if (product.shopProducts) {
          let searchedShopProduct = product.shopProducts.length > 0 && product.shopProducts[0]
          if (searchedShopProduct) {
            shopProduct = searchedShopProduct
          } else {
            shopProduct = {
              id: product.id,
              createdAt: product.createdAt,
              updatedAt: product.updatedAt,
              productId: product.id,
              shopId,
              price: product.price,
              preOrder: AppConfig.DEFAULT_SHOP_PRODUCT_INFORMATION.preOrder, // Default value
              poLength: AppConfig.DEFAULT_SHOP_PRODUCT_INFORMATION.poLength, // Default value
              disable: AppConfig.DEFAULT_SHOP_PRODUCT_INFORMATION.disable // Default value
            }
          }
        } else {
          throw new Error('product.shopProducts is not defined!')
        }

        // TODO: -We should be able to do this in SQL!
        //       -Should split this into a separate function. Too long!
        let supplierCount
        let stockCount
        if (product.variants) {
          supplierCount = product.variants.reduce((acc, variant) => {
            if (variant.supplierStocks) {
              return acc + variant.supplierStocks.length
            } else {
              return acc
            }
          }, 0)

          stockCount = product.variants.reduce((acc, variant) => {
            let shopVariantStock
            if (variant.shopStocks) {
              shopVariantStock = variant.shopStocks.reduce((acc, shopStock) => {
                return shopStock.quantity + acc
              }, 0)
            } else {
              throw new Error('product.variant.shopStocks is not defined!')
            }

            let shopVariantOrder
            if (variant.orderDetails) {
              shopVariantOrder = variant.orderDetails.reduce((acc, orderDetail) => {
                // For PO item, we don't care about how many is ordered as it doesn't affect stockCount
                if (!orderDetail.po) {
                  return orderDetail.quantity + acc
                } else {
                  return acc
                }
              }, 0)
            } else {
              throw new Error('product.variant.orderDetails is not defined!')
            }

            return acc + shopVariantStock - shopVariantOrder
          }, 0)
        } else {
          throw new Error('product.variants is not defined!')
        }

        if (product.subCategory && product.subCategory.category && product.variants && product.productImages) {
          const productWithShopInformation: ShopifiedProduct = {
            id: product.id,
            subCategoryId: product.subCategoryId,
            subCategory: product.subCategory,
            variants: product.variants,
            productImages: product.productImages,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            shopId,
            name: product.name,
            price: shopProduct.price,
            preOrder: shopProduct.preOrder,
            poLength: shopProduct.poLength,
            disable: shopProduct.disable,
            warranty: product.warranty,
            description: product.description,
            supplierCount,
            stockCount
          }
          return productWithShopInformation
        } else {
          throw new Error(`Sub-category, category, variants, or productImages for product with id=${product.id} is not defined!`)
        }
      })
      return { status: true, data: mutatedProducts }
    })
  }

  // Update shopProduct entry
  // In actuality, this can be insert/update
  updateProduct (shopId: number, productId: number, data: Partial<ShopProduct>) {
    const { price, preOrder, poLength, disable } = data
    return this.getModels('ShopProduct').findOne({ where: { shopId, productId } }).then(data => {
      if (data) {
        return {
          id: data.id,
          productId,
          shopId,
          price,
          preOrder,
          poLength,
          disable
        }
      } else {
        return {
          productId,
          shopId,
          price,
          preOrder,
          poLength,
          disable
        }
      }
    }).then(shopProduct => {
      return this.getModels('ShopProduct').upsert(shopProduct).then(count => {
        return { status: true }
      })
    })
  }

  getShopStock (shopId: number) {
    return (this.getModels('ShopStock') as Model<Instance<ShopStock>, Partial<ShopStock>>).findAll({
      where: { shopId },
      include: [
        {
          model: this.getModels('Variant'),
          include: [
            {
              model: this.getModels('Product')
            }
          ]
        }
      ]
    }).then(data => {
      return { status: true, data }
    })
  }

  addShopStock (data: Partial<ShopStock>) {
    const { shopId, variantId, price, quantity, date } = data
    return this.create<ShopStock>('ShopStock', {
      shopId,
      variantId,
      price,
      quantity,
      date
    })
  }

  getSupplierStock (supplierId: number) {
    return this.getModels('SupplierStock').findAll({
      where: { supplierId },
      include: [
        {
          model: this.getModels('Variant'),
          include: [
            {
              model: this.getModels('Product')
            }
          ]
        }
      ]
    }).then(data => {
      return { status: true, data }
    }).catch(this.errHandler)
  }

  addSupplierStock ({ supplierId, variantId, price }) {
    return this.create<SupplierStock>('SupplierStock', {
      supplierId,
      variantId,
      price
    })
  }

  getPromotion (shopId): Promise<NCResponse<Promotion[]>> {
    return this.getModels('Promotion').findAll({
      where: { shopId },
      include: [
        {
          model: this.getModels('Product')
        }
      ]
    }).then(data => {
      return { status: true, data }
    }).catch(this.errHandler)
  }
}

export default new ShopService()