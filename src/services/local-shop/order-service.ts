import * as util from 'util'

import * as Promise from 'bluebird'
import { Model } from 'sequelize'
import * as moment from 'moment'

import AppConfig from '../../app-config'
import CRUDService from '../crud-service'
import LocalShopService from '../local-shop-service'
import OrderService from '../order-service'

export interface ProductAvailability {
  status: 'readyStock' | 'preOrder' | 'unavailable'
  quantity?: number
}

export interface OrderReceipt {
  orderId: number
  fullName: string
  phoneNumber: string
  status: 'Close' | 'PO' | 'Open' | 'Cancelled'
  totalPrice: number
  date: string
  items: {
    status: 'PO' | 'Ready'
    name: string
    variant: string
    price: number
    quantity: number
  }[]
}

/*
  Used for shop-specific code. This should re-use what's in shop-service as much as possible, though.

  TODO:
  1. Update orderHistories whenever an update is made to order table, so that we have better ideas when
     a problem happens
 */
class LocalOrderService extends CRUDService {

  getOrders () {
    return OrderService.getOrders(LocalShopService.getLocalShopId())
  }

  getOpenOrders () {
    return this.getSequelize().query(
`SELECT * FROM ordersView WHERE shopId = ${LocalShopService.getLocalShopId()} AND status != 'Close' AND status != 'Cancelled'`,
      { type: this.getSequelize().QueryTypes.SELECT }).then(result => {
        if (result) {
          return { status: true, data: result }
        } else {
          return { status: false }
        }
      })
  }

  getClosedOrders () {
    return this.getSequelize().query(
`SELECT * FROM ordersView WHERE shopId = ${LocalShopService.getLocalShopId()} AND status = 'Close' OR status = 'Cancelled'`,
      { type: this.getSequelize().QueryTypes.SELECT }).then(result => {
        if (result) {
          return { status: true, data: result }
        } else {
          return { status: false }
        }
      })
  }

  getOrderDetails (orderId) {
    return OrderService.getOrderDetails(orderId)
  }

  editOrder (data: Partial<Order>): Promise<NCResponse<number>> {
    // Make sure no other fields get editted by hacker
    const edittableData = {
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      notes: data.notes
    }
    if (data.id) {
      return super.readOne<Order>('Order', { id: data.id }).then(resp => {
        if (resp.status && resp.data) {
          if (resp.data.status !== 'Open') {
            return { status: false, errMessage: 'Only open order can be editted!' }
          } else {
            if (data.fullName) {
              return super.update<Order>('Order', edittableData, { id: data.id })
            } else {
              return Promise.resolve({ status: false, errMssage: 'fullName is required!' })
            }
          }
        } else {
          return { status: false, errMessage: 'Order is not found!' }
        }
      })
    } else {
      return Promise.resolve({ status: false, errMessage: 'Order is required!' })
    }
  }

  cancelOrder (orderId: number): Promise<NCResponse<number>> {
    return super.readOne<Order>('Order', { id: orderId }).then(resp => {
      if (resp.status && resp.data) {
        if (resp.data.status !== 'Open') {
          return { status: false, errMessage: 'Only open order can be cancelled!' }
        } else {
          return super.update<Order>('Order', { status: 'Cancelled' }, { id: orderId })
        }
      } else {
        return { status: false, errMessage: 'Order is not found!' }
      }
    })
  }

  /*
    1. Check whether there's PO order or not.
    2. If there's, set status to 'PO'
    3. If not, set status to 'Finish'
   */
  closeOrder (orderId: number): Promise<NCResponse<number>> {
    return super.readOne<Order>('Order', { id: orderId }).then(resp => {
      if (resp.status && resp.data) {
        if (resp.data.status === 'Open') {
          return super.read<OrderDetail>('OrderDetail', { orderId }).then(resp2 => {
            if (resp2.status) {
              if (resp2.data) {
                const orderDetails = resp2.data
                let isPO = false
                orderDetails.forEach(orderDetail => {
                  if (orderDetail.status === 'PO') {
                    isPO = true
                  }
                })
                return super.update<Order>('Order', { status: isPO ? 'PO' : 'Close' }, { id: orderId })
              } else {
                return { status: false, errMessage: 'Order is empty!' }
              }
            } else {
              return { status: false, errMessage: resp2.errMessage }
            }
          })
        } else {
          console.log('status=' + JSON.stringify(resp.data))
          return { status: false, errMessage: 'Only open order can be closed!' }
        }
      } else {
        return { status: false, errMessage: 'Order is not found!' }
      }
    })
  }

  finishPOOrder (orderId: number): Promise<NCResponse<number>> {
    return super.readOne<Order>('Order', { id: orderId }).then(resp => {
      if (resp.status && resp.data) {
        const order = resp.data
        if (order.status === 'PO') {
          return super.update<Order>('Order', { status: 'Close' }, { id: orderId })
        } else {
          return { status: false, errMessage: 'Only PO order can be finished!' }
        }
      } else {
        return { status: false, errMessage: 'Order is not found!' }
      }
    })
  }

  /*
  export interface OrderReceipt {
    orderId: number
    fullName: string
    phoneNumber: string
    status: 'Close' | 'PO'
    totalPrice: number
    date: string
    items: {
      name: string
      variant: string
      price: number
      quantity: number
    }[]
  }
  */
  printReceipt (orderId: number): Promise<NCResponse<OrderReceipt>> {
    return OrderService.getOrder(orderId).then(resp => {
      if (resp.status && resp.data) {
        const order = resp.data
        console.dir(resp.data)
        if (order.status === 'Close' || order.status === 'PO') {
          let receipt: OrderReceipt = {
            orderId: order.id,
            fullName: order.fullName,
            phoneNumber: order.phoneNumber,
            status: order.status,
            totalPrice: order.price,
            date: moment().format('DD-MM-YY HH:mm:ss'),
            items: []
          }
          return super.getModels('OrderDetail').findAll({
            where: { orderId },
            include: [{
              model: super.getModels('Variant'),
              include: [{
                model: super.getModels('Product')
              }]
            }]
          }).then(data => {
            const orderDetails = data as OrderDetail[]
            if (orderDetails.length > 0) {
              orderDetails.forEach(orderDetail => {
                if (orderDetail.variant) {
                  const variant: Variant = orderDetail.variant
                  if (variant.product) {
                    const product: Product = variant.product
                    receipt.items.push({
                      name: product.name,
                      status: orderDetail.status,
                      variant: variant.name,
                      price: product.price,
                      quantity: orderDetail.quantity
                    })
                  } else {
                    throw new Error('Order detail does not have product!')
                  }
                } else {
                  throw new Error('Order detail does not have variant!')
                }
              })
              return { status: true, data: receipt }
            } else {
              return { status: false, errMessage: 'Order is empty!' }
            }
          })
        } else {
          return { status: false, errMessage: 'Only closed or PO order can be printed!' }
        }
      } else {
        return { status: false, errMessage: 'Order is not found!' }
      }
    })
  }
}

export default new LocalOrderService()
