import { Model } from 'sequelize'
import * as Promise from 'bluebird'

import * as Utils from '../libs/utils'
import { CRUDService } from './crud-service'
import LocalShopService from './local-shop-service'
import ProductService from './product-service';
import OrderManagementController from '../cms/controllers/order-management-controller';

interface CartItemMeta {
  variantId: number
  quantity: number
}

interface CartMetaData {
  readyStock: Array<CartItemMeta>
  preOrder: Array<CartItemMeta>
}

export interface CartItem {
  variantId: number
  quantity: number
  image: string
  product: ShopifiedProduct
  variant: ShopifiedVariant
}

export interface Cart {
  readyStock: Array<CartItem>
  preOrder: Array<CartItem>
  totalPrice: number
}

/*
Cart is not actually stored in database, it's stored in the session.
Functions in this service requires currentCart, which is cart information stored
on the session.
 */
class CartService extends CRUDService {
  addItemToCart (type: 'readyStock' | 'preOrder', currentCart: CartMetaData, item: CartItemMeta): Promise<NCResponse<CartMetaData>> {
    let cart: CartMetaData
    if (currentCart) {
      cart = currentCart
    } else {
      cart = { readyStock: [], preOrder: [] }
    }
    const existingItem: CartItemMeta | undefined = cart[type].find(currentItem => {
      return currentItem.variantId === item.variantId
    })
    const requestedQuantity = existingItem ? existingItem.quantity + item.quantity : item.quantity
    return LocalShopService.getVariantAvailability(item.variantId).then(resp => {
      if (resp.status && resp.data) {
        const availableQuantity = resp.data.quantity || 0
        if (resp.data.status === 'readyStock') {
          if (type === 'preOrder') {
            return { status: false, errMessage: 'Product is ready stock!' }
          } else {
            if (requestedQuantity > availableQuantity) {
              return { status: false, errMessage: `Only ${availableQuantity} items left!` }
            } else {
              return { status: true }
            }
          }
        } else if (resp.data.status === 'preOrder') {
          if (type === 'readyStock') {
            return { status: false, errMessage: 'Product is not ready stock!' }
          } else {
            return { status: true }
          }
        } else {
          return { status: false, errMessage: 'Product is not available!' }
        }
      } else {
        return { status: false, errMessage: resp.errMessage }
      }
    }).then(resp => {
      if (resp.status) {
        if (existingItem) {
          existingItem.quantity = requestedQuantity
          // Remove the item from the cart
          if (existingItem.quantity <= 0) {
            cart[type] = cart[type].filter(currentItem => {
              return currentItem.variantId !== existingItem.variantId
            })
          }
        } else {
          cart[type].push(item)
        }
        return this.getCart(cart)
      } else {
        return resp
      }
    })
  }

  private getCartItemDetail (item: CartItemMeta) {
    return Promise.join<NCResponse<any>>(
      ProductService.getVariantImage(item.variantId),
      LocalShopService.getProductInformation(item.variantId)
    ).spread((resp2: NCResponse<ProductImage>, resp: NCResponse<{variant: ShopifiedVariant, product: ShopifiedProduct}>) => {
      if (resp.status && resp.data) {
        return {
          variantId: item.variantId,
          quantity: item.quantity,
          product: resp.data.product,
          variant: resp.data.variant,
          image: resp2.data && Utils.getImageURL(resp2.data.imageFilename)
        }
      } else {
        throw new Error('variantId=' + item.variantId + ' is not found!')
      }
    })
  }

  private createOrderDetail (orderId: number, variantId: number, quantity: number, itemStatus: 'PO' | 'Ready'): Promise<NCResponse<Partial<OrderDetail>>> {
    return LocalShopService.getVariantPrice(variantId).then(resp2 => {
      if (resp2.status && resp2.data) {
        return super.create<OrderDetail>('OrderDetail', {
          orderId,
          status: itemStatus,
          variantId: variantId,
          quantity,
          price: resp2.data
        })
      } else {
        throw new Error(`variantId=${variantId} is not found!`)
      }
    })
  }

  placeOrder (fullName: string, phoneNumber: string, notes: string, currentCart: CartMetaData): Promise<NCResponse<any>> {
    // TODO: Use transaction so we can rollback
    if (fullName) {
      const localShopId = LocalShopService.getLocalShopId()
      return super.create<Order>('Order', {
        fullName,
        phoneNumber,
        notes,
        shopId: localShopId,
        status: 'Open'
      }).then(resp => {
        if (resp.status && resp.data) {
          const orderId = resp.data.id
          return Promise.join(
            Promise.map(currentCart.preOrder, cartItem => {
              return this.createOrderDetail(orderId, cartItem.variantId, cartItem.quantity, 'PO')
            }),
            Promise.map(currentCart.readyStock, cartItem => {
              return this.createOrderDetail(orderId, cartItem.variantId, cartItem.quantity, 'Ready')
            })
          ).spread((poResults: Array<NCResponse<any>>, readyResults: Array<NCResponse<any>>) => {
            const finalResult = poResults.concat(readyResults).reduce((acc, result) => {
              return { status: acc.status && result.status, errMessage: acc.errMessage || result.errMessage }
            }, { status: true, errMessage: '' })
            return finalResult
          })
        } else {
          return Promise.resolve({ status: false, errMessage: resp.errMessage })
        }
      })
    } else {
      return Promise.resolve({ status: false, errMessage: 'fullName is required!' })
    }
  }

  emptyCart (currentCart: CartMetaData) {
    if (currentCart) {
      currentCart.preOrder = []
      currentCart.readyStock = []
      return Promise.resolve({ status: true })
    } else {
      return Promise.resolve({ status: false, errMessage: 'currentCart is not defined!' })
    }
  }

  getCart (currentCart: CartMetaData): Promise<NCResponse<Cart>> {
    if (!currentCart) {
      return Promise.resolve({ status: false, errMessage: 'currentCart is not defined!' })
    } else {
      return Promise.join(
        Promise.map(currentCart.readyStock || [], item => {
          return this.getCartItemDetail(item)
        }),
        Promise.map(currentCart.preOrder || [], item => {
          return this.getCartItemDetail(item)
        })
      ).spread((readyStock: Array<any>, preOrder: Array<any>) => {
        const totalPrice = readyStock.concat(preOrder).reduce((acc, item) => {
          return acc + item.product.shopPrice * item.quantity
        }, 0)
        return {
          status: true,
          data: {
            preOrder,
            readyStock,
            totalPrice
          } as Cart
        }
      })
    }
  }
}

export default new CartService()
