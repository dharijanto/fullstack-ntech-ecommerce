import * as $ from 'jquery'
import * as toastr from 'toastr'
import { getURLQuery } from '../libs/utils'
import axios from '../libs/axios-wrapper'
import 'nc-image-picker'
import 'nc-input-library'
import Config from '../config'

let promotion: Promotion
let product: Product

$(document).ready(() => {
  const ncPromotion = $('#promotion').NCInputLibrary({
    design: {
      title: 'Promotion Management'
    },
    table: {
      ui: [
        { id: 'id', desc: 'ID', dataTable: true, input: 'hidden', disabled: true },
        { id: 'name', desc: 'Promotion Name', dataTable: true, input: 'text', disabled: false },
        { id: 'productName', desc: 'Product Name', dataTable: true, input: 'hidden', disabled: true },
        { id: 'imageFilename', desc: 'Image (645x275)', dataTable: true, input: 'text', disabled: false },
        { id: 'createdAt', desc: 'Date Created', dataTable: true, input: 'hidden', disabled: true },
        { id: 'updatedAt', desc: 'Date Updated', dataTable: true, input: 'hidden', disabled: true }
      ],
      conf: {
        order: [['updatedAt', 'desc']],
        getURL: () => `/cms/promotion-management/promotions` ,
        numColumn: 3,
        onRowClicked: (data: Promotion) => {
          promotion = data
          setImagePreview(data.imageFilename)
          ncProduct.reloadTable()
        }
      }
    },
    buttons: {
      ui: [
        { id: 'add', desc: 'Add', postTo: () => {
          const productId = product ? product.id : ''
          return `/cms/promotion-management/promotion?productId=${productId}`
        }},
        { id: 'edit', desc: 'Edit', postTo: () => {
          const productId = product ? product.id : ''
          return `/cms/promotion-management/promotion/edit?productId=${productId}`
        }},
        { id: 'delete', desc: 'Delete', postTo: () => `/cms/promotion-management/promotion/delete` }
      ],
      conf: {
        networkTimeout: Config.NETWORK_TIMEOUT // timeout for postTo request
      }
    }
  })

  const imagePreview = $(`<img class="img-responsive" style="max-width: 200px; padding: 15px">`)
  ncPromotion.setFirstCustomView(imagePreview)

  function setImagePreview (filename) {
    axios.post(`/cms/promotion-management/image/get-url`, { filename: filename }).then(resp => {
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
    getURL: `/cms/promotion-management/images`,
    postURL: `/cms/promotion-management/image`,
    deleteURL: `/cms/promotion-management/image/delete`
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
        { id: 'shopPrice', desc: 'Price', dataTable: true, input: 'hidden' }
      ],
      conf: {
        order: [['updatedAt', 'desc']],
        getURL: `/cms/product-management/products` ,
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

  ncProduct.reloadTable()
  ncPromotion.reloadTable()
})
