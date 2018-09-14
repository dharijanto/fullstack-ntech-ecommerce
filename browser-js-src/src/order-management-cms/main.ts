import * as $ from 'jquery'
import 'nc-input-library'
import 'nc-image-picker'
/* import * as toastr from 'toastr' */
import * as toastr from 'toastr'
import * as _ from 'lodash'

import axios from '../libs/axios-wrapper'

console.log(_.random(true))

let shop: Shop
let order: Order

const ncShop = $('#shop').NCInputLibrary({
  design: {
    title: 'Shops '
  },
  table: {
    ui: [
      { id: 'id', desc: 'ID', dataTable: true, input: 'text', disabled: true },
      { id: 'name', desc: 'Name', dataTable: true, input: 'text', disabled: false },
      { id: 'city', desc: 'City', dataTable: true, input: 'text', disabled: false },
      { id: 'location', desc: 'Location', dataTable: true, input: 'text', disabled: false },
      { id: 'address', desc: 'Address', dataTable: true, input: 'text', disabled: false },
      { id: 'zipCode', desc: 'Zip Code', dataTable: true, input: 'text', disabled: false },
      { id: 'createdAt', desc: 'Date Created', dataTable: true, input: 'text', disabled: true },
      { id: 'updatedAt', desc: 'Date Updated', dataTable: true, input: 'text', disabled: true }
    ],
    conf: {
      order: [['updatedAt', 'desc']],
      getURL: `/${window['siteHash']}/shop-management/shops` ,
      numColumn: 3,
      onRowClicked: (data: Shop) => {
        shop = data
        ncOrder.reloadTable()
      }
    }
  },
  buttons: {
    ui: [],
    conf: {
      networkTimeout: 2000 // timeout for postTo request
    }
  }
})

const ncOrder = $('#order').NCInputLibrary({
  design: {
    title: 'Orders'
  },
  table: {
    ui: [
      { id: 'id', desc: 'ID', dataTable: true, input: 'text', disabled: true },
      { id: 'fullName', desc: 'Name', dataTable: true, input: 'text' },
      { id: 'notes', desc: 'Notes', dataTable: true, input: 'text' },
      { id: 'quantity', desc: 'Quantity', dataTable: true, input: 'text' },
      { id: 'price', desc: 'Price', dataTable: true, input: 'text' },
      { id: 'status', desc: 'Status', dataTable: true, input: 'text' },
      { id: 'createdAt', desc: 'Date Created', dataTable: true, input: 'text', disabled: true },
      { id: 'updatedAt', desc: 'Date Updated', dataTable: true, input: 'text', disabled: true }
    ],
    conf: {
      order: [['updatedAt', 'desc']],
      getURL: () => `/${window['siteHash']}/order-management/orders?shopId=${shop ? shop.id : ''}` ,
      onRowClicked: (data: Order) => {
        order = data
        ncOrderDetail.reloadTable()
      },
      numColumn: 3
    }
  },
  buttons: {
    ui: [],
    conf: {
      networkTimeout: 2000 // timeout for postTo request
    }
  }
})

const ncOrderDetail = $('#order-detail').NCInputLibrary({
  design: {
    title: 'Order Details'
  },
  table: {
    ui: [
      { id: 'id', desc: 'ID', dataTable: true, input: 'text', disabled: true },
      { id: 'productName', desc: 'Product', dataTable: true, input: 'text' },
      { id: 'variantName', desc: 'Variant', dataTable: true, input: 'text' },
      { id: 'quantity', desc: 'Quantity', dataTable: true, input: 'text' },
      { id: 'price', desc: 'Price', dataTable: true, input: 'text' },
      { id: 'status', desc: 'Status', dataTable: true, input: 'text' },
      { id: 'preOrderDuration', desc: 'PO Duration', dataTable: true, input: 'text' },
      { id: 'productId', desc: 'Product ID', dataTable: true, input: 'text', disabled: true },
      { id: 'variantId', desc: 'Variant ID', dataTable: true, input: 'text', disabled: true },
      { id: 'orderId', desc: 'Order ID', dataTable: true, input: 'text', disabled: true },
      { id: 'createdAt', desc: 'Date Created', dataTable: true, input: 'text', disabled: true },
      { id: 'updatedAt', desc: 'Date Updated', dataTable: true, input: 'text', disabled: true }
    ],
    conf: {
      order: [['updatedAt', 'desc']],
      getURL: () => `/${window['siteHash']}/order-management/order-details?orderId=${order ? order.id : ''}` ,
      onRowClicked: () => null,
      numColumn: 3
    }
  },
  buttons: {
    ui: [],
    conf: {
      networkTimeout: 2000 // timeout for postTo request
    }
  }
})

ncShop.reloadTable()
