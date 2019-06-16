import * as $ from 'jquery'
import * as toastr from 'toastr'
import { getURLQuery } from '../libs/utils'
import axios from '../libs/axios-wrapper'
import Config from '../config'
import 'nc-image-picker'
import 'nc-input-library'

let product: Product
let variant: Variant
let shopStock: ShopStock

$(document).ready(() => {

  let shopStockBST
  const ncStockBST = $('#shop-stock-bst').NCInputLibrary({
    design: {
      title: 'Stock In BST'
    },
    table: {
      ui: [
        { id: 'id', desc: 'ID', dataTable: true, input: 'hidden', disabled: true },
        { id: 'date', desc: 'Date', dataTable: true, input: 'date', data: { dateFormat: 'YYYY-MM-DD' } },
        { id: 'description', desc: 'Description', dataTable: true, input: 'text' },
        { id: 'quantity', desc: 'Quantity', dataTable: true, input: 'hidden' },
        { id: 'createdAt', desc: 'Created At', dataTable: true, input: 'hidden' },
        { id: 'updatedAt', desc: 'Updated At', dataTable: true, input: 'hidden' }
      ],
      conf: {
        order: [['updatedAt', 'desc']],
        getURL: () => `/cms/stock-management/stock-bst`,
        numColumn: 3,
        onRowClicked: (data: ShopStockBST) => {
          shopStockBST = data
          ncShopStock.reloadTable()
        }
      }
    },
    buttons: {
      ui: [
        { id: 'add', desc: 'Add', postTo: () => `/cms/stock-management/stock-bst` },
        { id: 'edit', desc: 'Edit', postTo: () => `/cms/stock-management/stock-bst/edit`, confirm: 'Are you sure?' },
        { id: 'delete', desc: 'Delete', postTo: () => `/cms/stock-management/stock-bst/delete`, confirm: 'Are you sure?' }
      ],
      conf: {
        networkTimeout: Config.NETWORK_TIMEOUT // timeout for postTo request
      },
      onPostFinished: () => {
        ncProduct.reloadTable()
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
        { id: 'categoryName', desc: 'Category', dataTable: true, input: 'hidden' },
        { id: 'subCategoryName', desc: 'Sub Category', dataTable: true, input: 'hidden' },
        { id: 'shopPrice', desc: 'Sell Price', dataTable: true, input: 'hidden' },
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
      ui: [],
      conf: {
        networkTimeout: Config.NETWORK_TIMEOUT // timeout for postTo request
      }
    }
  })
  const btnReloadProduct = $('<button class="btn btn-primary"> Reload </button>')
  btnReloadProduct.click(() => ncProduct.reloadTable())
  ncProduct.setFirstCustomView(btnReloadProduct)

  const ncVariant = $('#variant').NCInputLibrary({
    design: {
      title: 'Variant'
    },
    table: {
      ui: [
        { id: 'id', desc: 'ID', dataTable: true, input: 'hidden', disabled: true },
        { id: 'name', desc: 'Name', dataTable: true, input: 'hidden' },
        { id: 'stockQuantity', desc: '# Stocks', dataTable: true, input: 'hidden' },
        { id: 'supplierCount', desc: '# Suppliers', dataTable: true, input: 'hidden' }
      ],
      conf: {
        order: [['name', 'asc']],
        getURL: () => `/cms/product-management/variants?productId=${product ? product.id : ''}`,
        numColumn: 3,
        onRowClicked: (data: Variant) => {
          variant = data
          ncShopStock.reloadTable()
          ncGroupedShopStock.reloadTable()
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

  const ncGroupedShopStock = $('#grouped-shop-stock').NCInputLibrary({
    design: {
      title: 'Stocks Left on Aisles'
    },
    table: {
      ui: [
        { id: 'quantity', desc: 'Quantity', dataTable: true, input: 'hidden' },
        { id: 'aisle', desc: 'Aisle', dataTable: true, input: 'hidden' }
      ],
      conf: {
        order: [['aisle', 'asc']],
        getURL: () => `/cms/stock-management/stocks-left?variantId=${variant ? variant.id : 0}` ,
        numColumn: 3,
        onRowClicked: (data: ShopStock) => {
          shopStock = data
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

  function getAisles (): Promise<Array<string>> {
    return axios.get('/cms/stock-management/aisles').then(rawResp => {
      const resp = rawResp.data
      if (resp.status && resp.data) {
        return resp.data.map(data => data.aisle)
      } else {
        throw new Error(resp.errMessage)
      }
    })
  }

  const ncShopStock = $('#shop-stock').NCInputLibrary({
    design: {
      title: 'Stocks (On selected BST)'
    },
    table: {
      ui: [
        { id: 'id', desc: 'ID', dataTable: true, input: 'hidden', disabled: true },
        { id: 'variant.product.name', desc: 'Product', dataTable: true, input: 'hidden', disabled: true },
        { id: 'variant.name', desc: 'Variant', dataTable: true, input: 'hidden', disabled: true },
        { id: 'price', desc: 'Purchase Price', dataTable: true, input: 'text' },
        { id: 'quantity', desc: 'Quantity', dataTable: true, input: 'text' },
        { id: 'aisle', desc: 'Aisle', dataTable: true, input: 'select', selectData: getAisles },
        { id: 'createdAt', desc: 'Date Created', dataTable: true, input: 'hidden', disabled: true },
        { id: 'updatedAt', desc: 'Date Updated', dataTable: true, input: 'hidden', disabled: true }
      ],
      conf: {
        order: [['updatedAt', 'desc']],
        getURL: () => `/cms/stock-management/stocks?bstId=${shopStockBST ? shopStockBST.id : ''}` ,
        numColumn: 3,
        onRowClicked: (data: ShopStock) => {
          shopStock = data
        }
      }
    },
    buttons: {
      ui: [
        { id: 'add', desc: 'Add', postTo: () => {
          const productId = product ? product.id : ''
          const variantId = variant ? variant.id : ''
          const bstId = shopStockBST ? shopStockBST.id : ''
          return `/cms/stock-management/stock?productId=${productId}&variantId=${variantId}&bstId=${bstId}`
        }},
        { id: 'edit', desc: 'Edit', postTo: () => `/cms/stock-management/stock/edit`, confirm: 'Are you sure?' },
        { id: 'delete', desc: 'Delete', postTo: () => `/cms/stock-management/stock/delete`, confirm: 'Are you sure?' }
      ],
      conf: {
        networkTimeout: Config.NETWORK_TIMEOUT // timeout for postTo request
      },
      onPostFinished: () => {
        ncProduct.reloadTable()
        ncVariant.reloadTable()
        ncGroupedShopStock.reloadTable()
      }
    }
  })

  ncStockBST.reloadTable()
  ncProduct.reloadTable()
})
