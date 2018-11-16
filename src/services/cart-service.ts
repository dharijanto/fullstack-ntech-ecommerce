import { Model } from 'sequelize'
import * as Promise from 'bluebird'

import * as Utils from '../libs/utils'
import { CRUDService } from './crud-service'
import LocalShopService from './local-shop-service'
import ProductService from './product-service';

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
    if (existingItem) {
      existingItem.quantity = existingItem.quantity + item.quantity
      if (existingItem.quantity <= 0) {
        cart[type] = cart[type].filter(currentItem => {
          return currentItem.variantId !== existingItem.variantId
        })
      }
    } else {
      cart[type].push(item)
    }

    return this.getCart(cart)
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
