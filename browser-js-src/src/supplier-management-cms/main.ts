import * as $ from 'jquery'
import * as toastr from 'toastr'
import 'nc-image-picker'
import 'nc-input-library'

import axios from '../libs/axios-wrapper'
import Config from '../config'
import { getURLQuery } from '../libs/utils'

let supplier: Supplier
let product: Product
let variant: Variant
$(document).ready(() => {
  const ncSupplier = $('#supplier').NCInputLibrary({
    design: {
      title: 'Suppliers'
    },
    table: {
      ui: [
        { id: 'id', desc: 'ID', dataTable: true, input: 'text', disabled: true },
        { id: 'createdAt', desc: 'Date Created', dataTable: true, input: 'text', disabled: true },
        { id: 'updatedAt', desc: 'Date Updated', dataTable: true, input: 'text', disabled: true },
        { id: 'name', desc: 'Name', dataTable: true, input: 'text', disabled: false },
        { id: 'location', desc: 'Location', dataTable: true, input: 'text', disabled: false },
        { id: 'address', desc: 'Address', dataTable: true, input: 'text', disabled: false },
        { id: 'city', desc: 'City', dataTable: true, input: 'text', disabled: false },
        { id: 'zipCode', desc: 'Zip Code', dataTable: true, input: 'text', disabled: false },
        { id: 'pickup', desc: 'Pick Up', dataTable: true, input: 'select', selectData: () => ['true', 'false'], disabled: false },
        { id: 'online', desc: 'Online', dataTable: true, input: 'select', selectData: () => ['true', 'false'], disabled: false }
      ],
      conf: {
        order: [['updatedAt', 'desc']],
        getURL: `/${window['siteHash']}/supplier-management/suppliers` ,
        numColumn: 3,
        onRowClicked: (data: Supplier) => {
          supplier = data
          ncSupplierStock.reloadTable()
        }
      }
    },
    buttons: {
      ui: [
        { id: 'add', desc: 'Add', postTo: `/${window['siteHash']}/supplier-management/supplier` },
        { id: 'edit', desc: 'Edit', postTo: `/${window['siteHash']}/supplier-management/supplier/edit` },
        { id: 'delete', desc: 'Delete', postTo: `/${window['siteHash']}/supplier-management/supplier/delete`, confirm: 'Are you sure?' }
      ],
      conf: {
        networkTimeout: Config.NETWORK_TIMEOUT // timeout for postTo request
      }
    }
  })

  const ncProduct = $('#product').NCInputLibrary({
    design: {
      title: 'Products'
    },
    table: {
      ui: [
        { id: 'id', desc: 'ID', dataTable: true, input: 'hidden', disabled: true },
        { id: 'name', desc: 'Name', dataTable: true, input: 'hidden' },
        { id: 'price', desc: 'Price', dataTable: true, input: 'hidden' },
        { id: 'suppliersCount', desc: '# Suppliers', dataTable: true, input: 'hidden' },
        { id: 'createdAt', desc: 'Date Created', dataTable: true, input: 'hidden', disabled: true },
        { id: 'updatedAt', desc: 'Date Updated', dataTable: true, input: 'hidden', disabled: true }
      ],
      conf: {
        order: [['updatedAt', 'desc']],
        getURL: `/${window['siteHash']}/supplier-management/products` ,
        numColumn: 3,
        onRowClicked: (data: Product) => {
          product = data
          ncVariant.reloadTable()
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
        { id: 'suppliersCount', desc: '# Suppliers', dataTable: true, input: 'hidden' },
        { id: 'createdAt', desc: 'Date Created', dataTable: true, input: 'hidden', disabled: true },
        { id: 'updatedAt', desc: 'Date Updated', dataTable: true, input: 'hidden', disabled: true }
      ],
      conf: {
        order: [['updatedAt', 'desc']],
        getURL: () => {
          const productId = product ? product.id : null
          return `/${window['siteHash']}/supplier-management/variants?productId=${productId}`
        },
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

  const ncSupplierStock = $('#supplier-stock').NCInputLibrary({
    design: {
      title: 'Supplier Stock'
    },
    table: {
      ui: [
        { id: 'id', desc: 'ID', dataTable: true, input: 'hidden', disabled: true },
        { id: 'productName', desc: 'Product Name', dataTable: true, input: 'text', disabled: true },
        { id: 'variantName', desc: 'Variant Name', dataTable: true, input: 'text', disabled: true },
        { id: 'supplierPrice', desc: 'Supplier Price', dataTable: true, input: 'text' },
        { id: 'createdAt', desc: 'Date Created', dataTable: true, input: 'hidden', disabled: true },
        { id: 'updatedAt', desc: 'Date Updated', dataTable: true, input: 'hidden', disabled: true }
      ],
      conf: {
        order: [['updatedAt', 'desc']],
        getURL: () => `/${window['siteHash']}/supplier-management/supplier-stocks?supplierId=${supplier.id}` ,
        numColumn: 3,
        onRowClicked: (data: Product) => {
          product = data
        }
      }
    },
    buttons: {
      ui: [
        { id: 'add', desc: 'Add', postTo: () => {
          const supplierId = supplier ? supplier.id : null
          const variantId = variant ? variant.id : null
          return `/${window['siteHash']}/supplier-management/supplier-stock?supplierId=${supplierId}&variantId=${variantId}`
        }},
        { id: 'edit', desc: 'Edit', postTo: () => `/${window['siteHash']}/supplier-management/supplier-stock/edit` },
        { id: 'delete', desc: 'Delete', postTo: () => `/${window['siteHash']}/supplier-management/supplier-stock/delete`, confirm: 'Are you sure?' }
      ],
      conf: {
        networkTimeout: Config.NETWORK_TIMEOUT // timeout for postTo request
      },
      onPostFinished: (id, successOrFailed, response) => {
        ncProduct.reloadTable()
        ncVariant.reloadTable()
      }
    }
  })

  ncSupplier.reloadTable()
  ncProduct.reloadTable()
  ncVariant.reloadTable()

})
