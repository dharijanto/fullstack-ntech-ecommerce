import * as $ from 'jquery'
import 'nc-input-library'
import 'nc-image-picker'
import * as toastr from 'toastr'
import * as _ from 'lodash'

import axios from '../libs/axios-wrapper'
import Config from '../config'

let order: Order

const ncOrder = $('#order').NCInputLibrary({
  design: {
    title: 'Orders'
  },
  table: {
    ui: [
      { id: 'id', desc: 'ID', dataTable: true, input: 'hidden', disabled: true },
      { id: 'fullName', desc: 'Name', dataTable: true, input: 'text' },
      { id: 'phoneNumber', desc: 'Phone Number', dataTable: true, input: 'text' },
      { id: 'notes', desc: 'Notes', dataTable: true, input: 'textArea' },
      { id: 'status', desc: 'Status', dataTable: true, input: 'hidden' },
      { id: 'quantity', desc: 'Quantity', dataTable: true, input: 'hidden' },
      { id: 'price', desc: 'Price', dataTable: true, input: 'hidden' },
      { id: 'createdAt', desc: 'Date Created', dataTable: true, input: 'hidden', disabled: true },
      { id: 'updatedAt', desc: 'Date Updated', dataTable: true, input: 'hidden', disabled: true }
    ],
    conf: {
      order: [['updatedAt', 'desc']],
      getURL: () => `/cms/order-management/open-orders` ,
      onRowClicked: (data: Order) => {
        order = data
        ncOrderDetail.reloadTable()
      },
      numColumn: 3
    }
  },
  buttons: {
    ui: [
      { id: 'add', desc: 'Add', postTo: '/cms/order-management/order' },
      { id: 'edit', desc: 'Edit', postTo: '/cms/order-management/order/edit' },
      { id: 'cancel', desc: 'Cancel', postTo: '/cms/order-management/order/cancel' },
      { id: 'finish', desc: 'Close', postTo: '/cms/order-management/order/close' },
      { id: 'finishPO', desc: 'Finish PO', postTo: '/cms/order-management/order/close-po' }
    ],
    conf: {
      networkTimeout: Config.NETWORK_TIMEOUT // timeout for postTo request
    }
  }
})

const orderPrintBtn = $(`<button class="btn btn-default btn-block" type="button">Print Receipt</button>`)
orderPrintBtn.on('click', () => {
  axios.post('/cms/order-management/order/print-receipt', { orderId: order && order.id }).then(rawResp => {
    let resp = rawResp.data as NCResponse<any>
    if (resp.status) {
      toastr.success('Print job created!')
    } else {
      throw new Error(resp.errMessage)
    }
  }).catch(err => {
    toastr.error(err.message)
    console.error(err.message)
  })
})
ncOrder.setFirstCustomView(orderPrintBtn)

const ncOrderDetail = $('#order-detail').NCInputLibrary({
  design: {
    title: 'Order Details'
  },
  table: {
    ui: [
      { id: 'id', desc: 'ID', dataTable: true, input: 'hidden', disabled: true },
      { id: 'variantId', desc: 'Variant ID', dataTable: true, input: 'text' },
      { id: 'productName', desc: 'Product', dataTable: true, input: 'hidden' },
      { id: 'variantName', desc: 'Variant', dataTable: true, input: 'hidden' },
      { id: 'quantity', desc: 'Quantity', dataTable: true, input: 'text' },
      { id: 'price', desc: 'Price', dataTable: true, input: 'hidden' },
      { id: 'status', desc: 'Status', dataTable: true, input: 'hidden' },
      { id: 'preOrderDuration', desc: 'PO Duration', dataTable: true, input: 'hidden' },
      { id: 'createdAt', desc: 'Date Created', dataTable: true, input: 'hidden', disabled: true },
      { id: 'updatedAt', desc: 'Date Updated', dataTable: true, input: 'hidden', disabled: true }
    ],
    conf: {
      order: [['updatedAt', 'desc']],
      getURL: () => `/cms/order-management/order-details?orderId=${order ? order.id : ''}` ,
      onRowClicked: () => null,
      numColumn: 3
    }
  },
  buttons: {
    ui: [
      { id: 'add', desc: 'Add', postTo: () => `/cms/order-management/order-detail?orderId=${order ? order.id : ''}` },
      // { id: 'edit', desc: 'Edit', postTo: () => `/cms/order-management/order-detail/edit?orderId=${order ? order.id : ''}` },
      { id: 'delete', desc: 'Delete', postTo: () => `/cms/order-management/order-detail/delete` }
    ],
    conf: {
      networkTimeout: Config.NETWORK_TIMEOUT // timeout for postTo request
    }
  }
})

ncOrder.reloadTable()
