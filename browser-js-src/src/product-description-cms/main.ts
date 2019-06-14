import * as $ from 'jquery'
import * as toastr from 'toastr'
import 'nc-image-picker'
import 'nc-input-library'

import axios from '../libs/axios-wrapper'
import axiosOrig from 'axios'
import Config from '../config'
import { getURLQuery } from '../libs/utils'

$(document).ready(() => {
  const productId = getURLQuery(window.location.href)['id']
  const ncPicture = $('#product-picture').NCInputLibrary({
    design: {
      title: 'Product Images'
    },
    table: {
      ui: [
        { id: 'id', desc: 'ID', dataTable: true, input: 'text', disabled: true },
        { id: 'imageFilename', desc: 'Image (800 x 800)', dataTable: true, input: 'text', disabled: false },
        { id: 'primary', desc: 'Primary Image', dataTable: true, input: 'select', selectData: () => ['1', '0'] , disabled: false },
        { id: 'createdAt', desc: 'Date Created', dataTable: true, input: 'text', disabled: true },
        { id: 'updatedAt', desc: 'Date Updated', dataTable: true, input: 'text', disabled: true }
      ],
      conf: {
        order: [['updatedAt', 'desc']],
        getURL: `/${window['siteHash']}/product-management/product/images?productId=${productId}` ,
        numColumn: 3,
        onRowClicked: (data: ProductImage) => {
          setImagePreview(data.imageFilename)
        }
      }
    },
    buttons: {
      ui: [
        { id: 'add', desc: 'Add', postTo: `/${window['siteHash']}/product-management/product/image?productId=${productId}` },
        { id: 'edit', desc: 'Edit', postTo: `/${window['siteHash']}/product-management/product/image/edit?productId=${productId}` },
        { id: 'delete', desc: 'Delete', postTo: `/${window['siteHash']}/product-management/product/image/delete?productId=${productId}`, confirm: 'Are you sure?' }
      ],
      conf: {
        networkTimeout: Config.NETWORK_TIMEOUT// timeout for postTo request
      }
    }
  })

  const imagePreview = $(`<img class="img-responsive" style="max-width: 200px; padding: 15px">`)
  ncPicture.setFirstCustomView(imagePreview)

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

  const productDescription = $('#product-description')
  const saveButton = $('#btn-save')

  productDescription.summernote({
    airMode: false,
    height: 500
  })

  productDescription.summernote('code', productDescription.text())

  let changesSaved = true
  productDescription.on('summernote.change', function () {
    changesSaved = false
    updateSaveButton('Save Changes')
  })

  saveButton.click(function () {
    const body = {
      id: productId,
      description: productDescription.summernote('code')
    }

    // Since product description can be lengthy, we need to have
    // longer timeout
    const axiosWithLongerTimeout = axiosOrig.create({
      timeout: 50000
    })

    axiosWithLongerTimeout.post<NCResponse<Product>>(`/${window['siteHash']}/product-management/product/edit`, body).then(rawResp => {
      if (rawResp.data.status) {
        toastr.success('Success!')
      } else {
        toastr.error('Failed: ' + rawResp.data.errMessage)
        console.error(rawResp.data.errMessage)
      }
    }).catch(err => {
      console.error('Failed to edit product: ' + err)
      toastr.error('Failed: ' + err.message)
    })
  })

  function updateSaveButton (text: string) {
    saveButton.text(text)
  }

  $('input[name="imageFilename"]').NCImagePicker({
    callbackFn: (imageUrl, imageFilename) => {
      toastr.info('Image Selected!')
      setImagePreview(imageFilename)
      $('input[name="imageFilename"]').val(imageFilename)
    },
    getURL: `/${window['siteHash']}/images`,
    postURL: `/${window['siteHash']}/image`,
    deleteURL: `/${window['siteHash']}/image/delete`
  })

  ncPicture.reloadTable()
})
