import * as $ from 'jquery'
import 'nc-input-library'
import 'nc-image-picker'
import * as toastr from 'toastr'
import * as _ from 'lodash'

import axios from '../libs/axios-wrapper'
import { openPrintDialog } from '../libs/browser-lib'
import Config from '../config'

let order: Order

const ncOrder = $('#order').NCInputLibrary({
  design: {
    title: 'Closed Orders'
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
      getURL: () => `/cms/order-management/closed-orders` ,
      onRowClicked: (data: Order) => {
        order = data
        ncOrderDetail.reloadTable()
      },
      numColumn: 3
    }
  },
  buttons: {
    ui: [
      /* { id: 'edit', desc: 'Edit', postTo: '/cms/order-management/order/edit' },
      { id: 'cancel', desc: 'Cancel', postTo: '/cms/order-management/order/cancel' },
      { id: 'finish', desc: 'Close', postTo: '/cms/order-management/order/close' },
      { id: 'finishPO', desc: 'Finish PO', postTo: '/cms/order-management/order/close-po' } */
    ],
    conf: {
      networkTimeout: Config.NETWORK_TIMEOUT // timeout for postTo request
    }
  }
})

const orderPrintBtn = $(`<button class="btn btn-default btn-block" type="button">Print Receipt</button>`)
orderPrintBtn.on('click', function () {
  $(this).prop('disabled', true)
  Promise.resolve().then(() => {
    if (confirm('Print customer receipt?')) {
      toastr.info('Printing customer receipt...')
      // Print customer receipt
      return printReceipt(order.id, '1')
    }
  }).then(() => {
    if (confirm('Print merchant receipt?')) {
      toastr.info('Printing merchant receipt...')
      return printReceipt(order.id, '0')
    }
  }).then(() => {
    $(this).prop('disabled', false)
  }).catch(err => {
    $(this).prop('disabled', false)
    toastr.error(err.message)
    console.error(err.message)
  })
})
ncOrder.setFirstCustomView(orderPrintBtn)

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
      { id: 'aisle', desc: 'Aisle', dataTable: true, input: 'hidden' },
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
      /* { id: 'add', desc: 'Add', postTo: `/cms/order-management/order-detail/order` },
      { id: 'edit', desc: 'Edit', postTo: `/cms/order-management/order-detail/order/edit` },
      { id: 'delete', desc: 'Delete', postTo: `/cms/order-management/order-detail/order/delete` } */
    ],
    conf: {
      networkTimeout: Config.NETWORK_TIMEOUT // timeout for postTo request
    }
  }
})

ncOrder.reloadTable()
