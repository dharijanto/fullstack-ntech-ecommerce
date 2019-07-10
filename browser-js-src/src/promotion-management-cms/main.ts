import * as $ from 'jquery'
import * as toastr from 'toastr'
import 'nc-image-picker'
import 'nc-input-library'

import axios from '../libs/axios-wrapper'
import Config from '../config'
import { getURLQuery } from '../libs/utils'

let shop: Shop
let promotion: Promotion
let product: Product

$(document).ready(() => {
  const ncShop = $('#shop').NCInputLibrary({
    design: {
      title: 'Shops '
    },
    table: {
      ui: [
        { id: 'id', desc: 'ID', dataTable: true, input: 'text', disabled: true },
        { id: 'createdAt', desc: 'Date Created', dataTable: true, input: 'text', disabled: true },
        { id: 'updatedAt', desc: 'Date Updated', dataTable: true, input: 'text', disabled: true },
        { id: 'name', desc: 'Name', dataTable: true, input: 'text', disabled: false },
        { id: 'city', desc: 'City', dataTable: true, input: 'text', disabled: false },
        { id: 'location', desc: 'Location', dataTable: true, input: 'text', disabled: false },
        { id: 'address', desc: 'Address', dataTable: true, input: 'text', disabled: false },
        { id: 'zipCode', desc: 'Zip Code', dataTable: true, input: 'text', disabled: false }
      ],
      conf: {
        order: [['updatedAt', 'desc']],
        getURL: `/${window['siteHash']}/shop-management/shops` ,
        numColumn: 3,
        onRowClicked: (data: Shop) => {
          shop = data
          ncPromotion.reloadTable()
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

  const ncPromotion = $('#promotion').NCInputLibrary({
    design: {
      title: 'Promotion Management'
    },
    table: {
      ui: [
        { id: 'id', desc: 'ID', dataTable: true, input: 'text', disabled: true },
        { id: 'name', desc: 'Promotion Name', dataTable: true, input: 'text', disabled: false },
        { id: 'productName', desc: 'Product Name', dataTable: true, input: 'text', disabled: true },
        { id: 'createdAt', desc: 'Date Created', dataTable: true, input: 'hidden', disabled: true },
        { id: 'updatedAt', desc: 'Date Updated', dataTable: true, input: 'hidden', disabled: true }
      ],
      conf: {
        order: [['updatedAt', 'desc']],
        getURL: () => `/${window['siteHash']}/shop-management/promotion?shopId=${shop.id}` ,
        numColumn: 3,
        onRowClicked: (data: Promotion) => {
          promotion = data
          // setImagePreview(data.imageFilename)
          ncProduct.reloadTable()
        }
      }
    },
    buttons: {
      ui: [
        { id: 'add', desc: 'Add', postTo: () => {
          const shopId = shop ? shop.id : ''
          const productId = product ? product.id : ''
          return `/${window['siteHash']}/shop-management/promotion?shopId=${shopId}&productId=${productId}`
        }},
        { id: 'edit', desc: 'Edit', postTo: () => {
          const shopId = shop ? shop.id : ''
          const productId = product ? product.id : ''
          return `/${window['siteHash']}/shop-management/promotion/edit?shopId=${shopId}&productId=${productId}`
        }},
        { id: 'delete', desc: 'Delete', postTo: () => `/${window['siteHash']}/shop-management/promotion/delete`, confirm: 'Are you sure?' }
      ],
      conf: {
        networkTimeout: Config.NETWORK_TIMEOUT // timeout for postTo request
      }
    }
  })

  const imagePreview = $(`<img class="img-responsive" style="max-width: 200px; padding: 15px">`)
  ncPromotion.setFirstCustomView(imagePreview)

  function setImagePreview (filename) {
    axios.post(`/${window['siteHash']}/product-management/product/image/get-url`, { filename: filename }).then(resp => {
      console.dir(resp)
      if (resp.status) {
        imagePreview.attr('src', resp.data.data)
      } else {
        toastr.error('Failed to retrieve image URL')
      }
    }).catch(err => {
      console.error(err)
      toastr.error('Unexpected error!')
    })
  }

  $('input[name="imageFilename"]').NCImagePicker({
    callbackFn: (imageUrl, imageFilename) => {
      toastr.info('Image Selected!')
      $('input[name="imageFilename"]').val(imageFilename)
      setImagePreview(imageFilename)
    },
    getURL: `/${window['siteHash']}/images`,
    postURL: `/${window['siteHash']}/image`,
    deleteURL: `/${window['siteHash']}/image/delete`
  })

  const ncProduct = $('#product').NCInputLibrary({
    design: {
      title: 'Products'
    },
    table: {
      ui: [
        { id: 'id', desc: 'ID', dataTable: true, input: 'hidden', disabled: true },
        { id: 'createdAt', desc: 'Date Created', dataTable: true, input: 'hidden', disabled: true },
        { id: 'updatedAt', desc: 'Date Updated', dataTable: true, input: 'hidden', disabled: true },
        { id: 'name', desc: 'Name', dataTable: true, input: 'hidden' },
        { id: 'price', desc: 'Price', dataTable: true, input: 'hidden' }
      ],
      conf: {
        order: [['updatedAt', 'desc']],
        getURL: `/${window['siteHash']}/product-management/products` ,
        numColumn: 3,
        onRowClicked: (data: Product) => {
          product = data
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

  ncShop.reloadTable()
  ncProduct.reloadTable()
})
