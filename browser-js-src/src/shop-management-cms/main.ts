import * as $ from 'jquery'
import * as toastr from 'toastr'
import { getURLQuery } from '../libs/utils'
import axios from '../libs/axios-wrapper'
import 'nc-image-picker'
import 'nc-input-library'

let shop: Shop
let product: Product
let variant: Variant
let shopStock: ShopStock

$(document).ready(() => {
  const supplierId = getURLQuery(window.location.href)['id']
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
          ncProduct.reloadTable()
        }
      }
    },
    buttons: {
      ui: [
        { id: 'add', desc: 'Add', postTo: `/${window['siteHash']}/shop-management/shop` },
        { id: 'edit', desc: 'Edit', postTo: `/${window['siteHash']}/shop-management/shop/edit` },
        { id: 'delete', desc: 'Delete', postTo: `/${window['siteHash']}/shop-management/shop/delete` }
      ],
      conf: {
        networkTimeout: 2000 // timeout for postTo request
      }
    }
  })

  /*
interface ShopifiedProduct {
  id: number,
  name: string,
  description: string,
  warranty: string,
  defaultPrice: number,
  // The following can be null as they come from LEFT OUTER JOIN between Product and
  // respective table. This is intentional because we want to be able to manage
  // them in CMS
  shopId?: number,
  stockQuantity?: number,
  supplierCount?: number,
  shopPrice?: number,
  preOrderAllowed?: boolean,
  preOrderDuration?: number,
  disabled?: boolean
}
  */
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
        getURL: () => `/${window['siteHash']}/shop-management/products?shopId=${shop.id}` ,
        numColumn: 3,
        onRowClicked: (data: Product) => {
          product = data
          ncVariant.reloadTable()
        }
      }
    },
    buttons: {
      ui: [
        { id: 'edit', desc: 'Edit', postTo: () => `/${window['siteHash']}/shop-management/product/edit?shopId=${shop.id}` }
      ],
      conf: {
        networkTimeout: 2000 // timeout for postTo request
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
        getURL: () => `/${window['siteHash']}/shop-management/variants?shopId=${shop.id}&productId=${product.id}`,
        numColumn: 3,
        onRowClicked: (data: Variant) => {
          variant = data
          ncShopStock.reloadTable()
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

  const ncShopStock = $('#shop-stock').NCInputLibrary({
    design: {
      title: 'Shop Stock'
    },
    table: {
      ui: [
        { id: 'id', desc: 'ID', dataTable: true, input: 'text', disabled: true },
        { id: 'variant.product.name', desc: 'Product Name', dataTable: true, input: 'hidden', disabled: true },
        { id: 'variant.name', desc: 'Variant', dataTable: true, input: 'hidden', disabled: true },
        { id: 'date', desc: 'Date', dataTable: true, input: 'date', data: { dateFormat: 'YYYY-MM-DD' } },
        { id: 'price', desc: 'Purchase Price', dataTable: true, input: 'text' },
        { id: 'quantity', desc: 'Quantity', dataTable: true, input: 'text' },
        { id: 'createdAt', desc: 'Date Created', dataTable: true, input: 'hidden', disabled: true },
        { id: 'updatedAt', desc: 'Date Updated', dataTable: true, input: 'hidden', disabled: true }
      ],
      conf: {
        order: [['updatedAt', 'desc']],
        getURL: () => `/${window['siteHash']}/shop-management/shop-stocks?shopId=${shop.id}&variantId=${variant.id}` ,
        numColumn: 3,
        onRowClicked: (data: ShopStock) => {
          shopStock = data
        }
      }
    },
    buttons: {
      ui: [
        { id: 'add', desc: 'Add', postTo: () => {
          const shopId = shop ? shop.id : null
          const productId = product ? product.id : null
          const variantId = variant ? variant.id : null
          return `/${window['siteHash']}/shop-management/shop-stock?shopId=${shopId}&productId=${productId}&variantId=${variantId}`
        }},
        { id: 'edit', desc: 'Edit', postTo: () => `/${window['siteHash']}/shop-management/shop-stock/edit` },
        { id: 'delete', desc: 'Delete', postTo: () => `/${window['siteHash']}/shop-management/shop-stock/delete` }
      ],
      conf: {
        networkTimeout: 2000 // timeout for postTo request
      },
      onPostFinished: () => {
        ncProduct.reloadTable()
        ncVariant.reloadTable()
      }
    }
  })

  ncShop.reloadTable()
})
