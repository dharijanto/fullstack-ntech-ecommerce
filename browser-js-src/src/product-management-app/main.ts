import * as $ from 'jquery'
import * as toastr from 'toastr'
import 'nc-image-picker'
import 'nc-input-library'

import axios from '../libs/axios-wrapper'
import Config from '../config'
import { getURLQuery } from '../libs/utils'

let product: Product
let variant: Variant

$(document).ready(() => {
  const ncProduct = $('#product').NCInputLibrary({
    design: {
      title: 'Products'
    },
    table: {
      ui: [
        { id: 'id', desc: 'ID', dataTable: true, input: 'hidden', disabled: true },
        { id: 'name', desc: 'Name', dataTable: true, input: 'hidden' },
        { id: 'disabled', desc: 'Disabled', dataTable: true, input: 'select', selectData: () => ['true', 'false'] },
        { id: 'defaultPrice', desc: 'Default Price', dataTable: true, input: 'hidden' },
        { id: 'shopPrice', desc: 'Shop Price', dataTable: true, input: 'text' },
        { id: 'preOrderAllowed', desc: 'PO Allowed', dataTable: true, input: 'select', selectData: () => ['true', 'false'] },
        { id: 'preOrderDuration', desc: 'PO Duration (days) ', dataTable: true, input: 'text' },
        { id: 'supplierCount', desc: '# Suppliers', dataTable: true, input: 'hidden' },
        { id: 'stockQuantity', desc: '# Stocks', dataTable: true, input: 'hidden' },
        { id: 'createdAt', desc: 'Date Created', dataTable: true, input: 'hidden', disabled: true },
        { id: 'updatedAt', desc: 'Date Updated', dataTable: true, input: 'hidden', disabled: true }
      ],
      conf: {
        order: [['updatedAt', 'desc']],
        getURL: () => `/cms/product-management/products` ,
        numColumn: 3,
        onRowClicked: (data: Product) => {
          product = data
          ncVariant.reloadTable()
        }
      }
    },
    buttons: {
      ui: [
        { id: 'edit', desc: 'Edit', postTo: () => `/cms/product-management/product/edit` }
      ],
      conf: {
        networkTimeout: Config.NETWORK_TIMEOUT // timeout for postTo request
      }
    }
  })
  ncProduct.setFirstCustomView($(`<button class="btn btn-primary" id="btn-product-reload"> Reload </button>`))
  $('#btn-product-reload').click(() => {
    ncProduct.reloadTable()
  })

  const ncVariant = $('#variant').NCInputLibrary({
    design: {
      title: 'Variant'
    },
    table: {
      ui: [
        { id: 'id', desc: 'ID', dataTable: true, input: 'hidden', disabled: true },
        { id: 'name', desc: 'Name', dataTable: true, input: 'hidden' },
        { id: 'supplierCount', desc: '# Suppliers', dataTable: true, input: 'hidden' },
        { id: 'stockQuantity', desc: '# Stocks', dataTable: true, input: 'hidden' }
      ],
      conf: {
        order: [['name', 'asc']],
        getURL: () => `/cms/product-management/variants?productId=${product.id}`,
        numColumn: 3,
        onRowClicked: (data: Variant) => {
          variant = data
        }
      }
    },
    buttons: {
      ui: [],
      conf: {
        networkTimeout: Config.NETWORK_TIMEOUT // timeout for postTo request
      }
    }
  })

  ncProduct.reloadTable()
})
