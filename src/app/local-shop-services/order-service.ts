import * as util from 'util'

import * as Promise from 'bluebird'
import { Model } from 'sequelize'
import * as moment from 'moment'
import * as log from 'npmlog'

import AppConfig from '../../app-config'
import CRUDService from '../../services/crud-service'
import LocalShopService from './local-shop-service'
import OrderService from '../../services/order-service'
import PrintService from '../../services/print-service'
import StockService from './stock-service'

const TAG = 'OrderService'

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
  poDuration?: number
  orderDate: string
  printDate: string
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
  private receiptPrinter: PrintService
  constructor () {
    super()
    this.receiptPrinter = new PrintService(AppConfig.RECEIPT_PRINTER.DEVICE_NAME, AppConfig.RECEIPT_PRINTER.PAPER_WIDTH)
  }

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

  addOrder (data: Partial<Order>): Promise<NCResponse<Order>> {
    return super.create<Order>('Order', Object.assign(data, { status: 'Open', shopId: LocalShopService.getLocalShopId() }))
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

  private isOpenOrder (orderId: number): Promise<NCResponse<null>> {
    return super.readOne<Order>('Order', { id: orderId }).then(resp => {
      if (resp.status && resp.data) {
        if (resp.data.status === 'Open') {
          return { status: true }
        } else {
          return { status: false, errMessage: 'Order is not of \'Open\' status!' }
        }
      } else {
        return { status: false, errMessage: 'Order not found!' }
      }
    })
  }

  // TODO: Finish this off
  addPOOrderDetail (orderId: number, variantId: number, quantity: number): Promise<NCResponse<Partial<OrderDetail[]>>> {
    return LocalShopService.getVariantPrice(variantId).then(resp => {
      if (resp.status && resp.data) {
        const price = resp.data
        return super.getModels('OrderDetail').bulkCreate([{ variantId, orderId, status: 'PO', quantity, price }]).then((data: Partial<OrderDetail>[]) => {
          return { status: true, data } as NCResponse<Partial<OrderDetail[]>>
        })
      } else {
        return { status: false, errMessage: 'Failed to get variant price: ' + resp.errMessage }
      }
    })
  }

  addInStockOrderDetail (orderId: number, variantId: number, quantity: number): Promise<NCResponse<Partial<OrderDetail[]>>> {
    log.verbose(TAG, `addOrderDetailWithStatus(): orderId=${orderId} variantId=${variantId}`)
    return LocalShopService.getVariantPrice(variantId).then(resp2 => {
      if (resp2.status && resp2.data) {
        const price = resp2.data
        return StockService.getStocksGroupedByAisle(variantId).then((resp: NCResponse<ShopStock[]>) => {
          if (resp.status && resp.data) {
            const stocks = resp.data
            let remainingQuantity = quantity
            const orderDetails: Partial<OrderDetail>[] = []
            for (let i = 0; i < stocks.length; i++) {
              const stock = stocks[i]
              if (remainingQuantity <= stock.quantity) {
                orderDetails.push({ orderId, status: 'Ready', variantId, quantity: remainingQuantity, price, aisle: stock.aisle })
                remainingQuantity = 0
                break
              } else {
                orderDetails.push({ orderId, status: 'Ready', variantId, quantity: stock.quantity, price, aisle: stock.aisle })
                remainingQuantity -= stock.quantity
              }
            }
            if (remainingQuantity > 0) {
              return { status: false, errMessage: 'No enough quantity available!' }
            } else {
              return super.getModels('OrderDetail').bulkCreate(orderDetails).then((data: Array<OrderDetail>) => {
                if (data.length) {
                  return { status: true, data }
                } else {
                  return { status: false, errMessage: 'Failed to create order details!' }
                }
              })
            }
          } else {
            return { status: false, errMessage: 'shopStocks not found!' }
          }
        })
      } else {
        throw new Error(`variantId=${variantId} is not found!`)
      }
    })
  }

  addOrderDetail (orderId: number, variantId: number, quantity: number): Promise<NCResponse<Partial<OrderDetail[]>>> {
    /*
      1. Validate orderId -> valid order whose status is not closed / PO
      2. Validate variantId -> product with this id exists
      3. Validate quantity -> non-negative, and if status is ready, quantity doesn't exceed what's available
     */
    if (quantity <= 0) {
      return Promise.resolve({ status: false, errMessage: 'Quantity needs to be a positive number!' })
    } else {
      return this.isOpenOrder(orderId).then(resp => {
        if (resp.status) {
          return LocalShopService.getVariantAvailability(variantId).then((resp2: NCResponse<ProductAvailability>) => {
            if (resp2.status && resp2.data) {
              const availability = resp2.data
              log.verbose(TAG, `addOrderDetail(): quantity=${quantity} availability.quantity=${availability.quantity}`)
              if (availability.status === 'readyStock' && quantity > (availability.quantity || 0)) {
                return { status: false, errMessage: `Only ${availability.quantity} ready stock(s) left!` }
              }
              if (availability.status === 'preOrder') {
                return this.addPOOrderDetail(orderId, variantId, quantity)
              } else {
                return this.addInStockOrderDetail(orderId, variantId, quantity)
              }
            } else {
              return { status: false, errMessage: 'Failed to get variant information: ' + resp2.errMessage }
            }
          })
        } else {
          return { status: false, errMessage: resp.errMessage }
        }
      })
    }
  }

  editOrderDetail (orderDetailId: number, variantId: number, quantity: number) {
    // TODO: To make things easy, we don't currently implement edit
    //       The logic is more complex than addOrderDetail because we need to
    //       take into account the delta stock
  }

  deleteOrderDetail (orderDetailId: number): Promise<NCResponse<number>> {
    if (orderDetailId) {
      return super.readOne<OrderDetail>('OrderDetail', { id: orderDetailId }).then(resp => {
        if (resp.status && resp.data) {
          const orderId = resp.data.orderId
          return this.isOpenOrder(orderId).then(resp2 => {
            if (resp2.status) {
              return super.delete<OrderDetail>('OrderDetail', { id: orderDetailId })
            } else {
              return { status: false, errMessage: resp2.errMessage }
            }
          })
        } else {
          return { status: false, errMessage: resp.errMessage }
        }
      })
    } else {
      return Promise.resolve({ status: false, errMessage: 'orderDetailId is reuqired!' })
    }
  }

  // fullURL: non-relative URL to get HTML version of the receipt
  printReceipt (fullURL: string, numCopies: number = 1): Promise<NCResponse<null>> {
    return Promise.resolve(this.receiptPrinter.printURL(fullURL, numCopies).then(resp => {
      if (resp.status) {
        return { status: true }
      } else {
        return { status: false, errMessage: resp.errMessage }
      }
    }))
  }

  getReceipt (orderId: number): Promise<NCResponse<OrderReceipt>> {
    if (orderId) {
      return OrderService.getOrder(orderId).then(resp => {
        if (resp.status && resp.data) {
          const order = resp.data
          if (order.status === 'Close' || order.status === 'PO') {
            let receipt: OrderReceipt = {
              orderId: order.id,
              fullName: order.fullName,
              phoneNumber: order.phoneNumber,
              status: order.status,
              totalPrice: order.price,
              poDuration: undefined,
              orderDate: moment(resp.data.updatedAt).format('DD-MM-YY HH:mm'),
              printDate: moment().format('DD-MM-YY HH:mm'),
              items: []
            }
            return this.getOrderDetails(orderId).then(resp => {
              if (resp.status && resp.data) {
                resp.data.forEach(orderDetail => {
                  receipt.items.push({
                    name: orderDetail.productName,
                    status: orderDetail.status,
                    variant: orderDetail.variantName,
                    price: orderDetail.price,
                    quantity: orderDetail.quantity
                  })
                  if (orderDetail.status === 'PO') {
                    if (!receipt.poDuration) {
                      receipt.poDuration = orderDetail.preOrderDuration
                    } else {
                      receipt.poDuration = Math.max(receipt.poDuration, orderDetail.preOrderDuration)
                    }
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
    } else {
      return Promise.resolve({ status: false, errMessage: 'orderId is required!' })
    }
  }
}

export default new LocalOrderService()
