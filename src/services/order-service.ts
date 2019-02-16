import { CRUDService } from './crud-service'
import { Model, Instance, Sequelize } from 'sequelize'
import * as Promise from 'bluebird'

import AppConfig from '../app-config'

/*
  This is used to do shop management.
  For example, to customize price for product
*/
class OrderService extends CRUDService {
  getOrders (shopId) {
    return this.getSequelize().query(`SELECT * FROM ordersView WHERE shopId = ${shopId}`,
      { type: this.getSequelize().QueryTypes.SELECT }).then(result => {
        if (result) {
          return { status: true, data: result }
        } else {
          return { status: false }
        }
      })
  }

  getOrder (orderId): Promise<NCResponse<Order>> {
    return super.rawReadOneQuery(`SELECT * FROM ordersView WHERE id = ${orderId}`).then(resp => {
      if (resp.status && resp.data) {
        return { status: true, data: resp.data }
      } else {
        return { status: false }
      }
    })
  }

  getOrderDetails (orderId): Promise<NCResponse<OrderDetail[]>> {
    return this.getSequelize().query(`SELECT * FROM orderDetailsView WHERE orderId = ${orderId}`,
      { type: this.getSequelize().QueryTypes.SELECT }).then(result => {
        if (result) {
          return { status: true, data: result }
        } else {
          return { status: false }
        }
      })
  }
}

export default new OrderService()
