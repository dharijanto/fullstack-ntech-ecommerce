import * as $ from 'jquery'
import 'nc-input-library'
import 'nc-image-picker'
import * as toastr from 'toastr'
import * as _ from 'lodash'

import axios from '../libs/axios-wrapper'
import Config from '../config'
import { openPrintDialog } from '../libs/browser-lib'

let order: Order

const ncOrder = $('#order').NCInputLibrary({
  design: {
    title: 'Open Orders'
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
      order: [['updatedAt', 'asc']],
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
      { id: 'cancel', desc: 'Cancel', postTo: '/cms/order-management/order/cancel', confirm: 'Are you sure?' }
    ],
    conf: {
      networkTimeout: Config.NETWORK_TIMEOUT // timeout for postTo request
    }
  }
})

// "Close Order" button
const firstViewRow = $(`<div class="row"/>`)
const closeOrderCol = $(`<div class="col-md-12"/>`)
const closeOrderButton = $(`<button class="btn btn-default btn-block" type="button">Close Order</button>`)
firstViewRow.append(closeOrderCol)
closeOrderCol.append(closeOrderButton)

// "Close PO" button
const closePOCol = $(`<div class="col-md-12"/>`)
const closePOButton = $(`<button class="btn btn-default btn-block" type="button">Close PO</button>`)
firstViewRow.append(closePOCol)
closePOCol.append(closePOButton)

ncOrder.setFirstCustomView(firstViewRow)

function printReceipt (orderId, originalCopy: '1' | '0', orderType: 'order' | 'order-detail' = 'order') {
  return axios.post(`/cms/order-management/${orderType}/print-receipt`, { orderId, originalCopy }).then(rawResp => {
    const resp = rawResp.data
    // TODO: Handle the two cases: print is done on the server, or open up browser printing dialog
    if (resp.status) {
      toastr.success('Receipt printed!')
      if (resp.data && resp.data.url) {
        return openPrintDialog(resp.data.url, $('#print-frame'), 'print-preview')
      } else {
        return
      }
    } else {
      toastr.error('Failed to print customer receipt: ' + resp.errMessage)
      console.error('Failed to print customer receipt: ' + resp.errMessage)
      return
    }
  })
}

closeOrderButton.on('click', function (event) {
  $(this).prop('disabled', true)
  axios.post('/cms/order-management/order/close', { id: order && order.id }).then(rawResp => {
    let resp = rawResp.data as NCResponse<any>
    if (resp.status) {
      toastr.success('Order successfully closed!')
      return
    } else {
      throw new Error(resp.errMessage)
    }
  }).then(() => {
    if (confirm('Print customer receipt?')) {
      toastr.info('Printing customer receipt...')
      // Print customer receipt
      return printReceipt(order.id, '1')
    }
  }).then(() => {
    if (confirm('Print merchant receipt?')) {
      toastr.info('Printing merchant receipt...')
      // Print merchant receipt
      return printReceipt(order.id, '0')
    }
  }).then(() => {
    $(this).prop('disabled', false)
    ncOrder.reloadTable()
  }).catch(err => {
    toastr.error(err.message)
    console.error(err.message)
    $(this).prop('disabled', false)
    ncOrder.reloadTable()
  })
})

closePOButton.on('click', () => {
  $(this).prop('disabled', true)
  axios.post('/cms/order-management/order/close-po', { id: order && order.id }).then(rawResp => {
    let resp = rawResp.data as NCResponse<any>
    if (resp.status) {
      toastr.success('PO Order successfully closed!')
      return
    } else {
      throw new Error(resp.errMessage)
    }
  }).then(() => {
    if (confirm('Print customer receipt?')) {
      toastr.info('Printing customer receipt...')
      // Print customer receipt
      return printReceipt(order.id, '1')
    }
  }).then(() => {
    if (confirm('Print merchant receipt?')) {
      toastr.info('Printing merchant receipt...')
      // Print customer receipt
      return printReceipt(order.id, '1')
    }
  }).then(() => {
    $(this).prop('disabled', false)
    ncOrder.reloadTable()
  }).catch(err => {
    toastr.error(err.message)
    console.error(err.message)
    $(this).prop('disabled', false)
    ncOrder.reloadTable()
  })
})

// ncOrder.setFirstCustomView(orderPrintBtn)

const reloadBtn = $(`<button class="btn btn-default btn-block" type="button"><i class="fa fa-refresh" aria-hidden="true"></i></button>`)
reloadBtn.on('click', () => {
  ncOrder.reloadTable()
})
ncOrder.setSecondCustomView(reloadBtn)

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
      { id: 'aisle', desc: 'Aisle', dataTable: true, input: 'hidden' },
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
      { id: 'delete', desc: 'Delete', postTo: () => `/cms/order-management/order-detail/delete`, confirm: 'Are you sure?' }
    ],
    conf: {
      networkTimeout: Config.NETWORK_TIMEOUT // timeout for postTo request
    },
    onPostFinished: (id, successOrFailed) => {
      ncOrder.reloadTable()
    }
  }
})

const secondViewRow = $('<div class="row"/>')

const printAisleCol = $('<div class="col-md-12"/>')
const printAislesBtn = $(`<button class="btn btn-default btn-block" type="button">Print Aisle Details</button>`)
printAisleCol.append(printAislesBtn)
secondViewRow.append(printAisleCol)

printAislesBtn.on('click', function () {
  $(this).prop('disabled', true)
  if (confirm('Print aisle detail?')) {
    toastr.info('Printing aisle detail...')
    // Print customer receipt
    return printReceipt(order.id, '1', 'order-detail').then(() => {
      $(this).prop('disabled', false)
    }).catch(err => {
      $(this).prop('disabled', false)
      toastr.error(err.message)
      console.error(err.message)
    })
  }
})

ncOrderDetail.setFirstCustomView(secondViewRow)

ncOrder.reloadTable()
