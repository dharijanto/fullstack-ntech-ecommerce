import * as $ from 'jquery'
import * as toastr from 'toastr'
import { getURLQuery } from '../libs/utils'
import axios from '../libs/axios-wrapper'
import 'nc-image-picker'
import 'nc-input-library'

const ncPicture = $('#product-picture').NCInputLibrary({
  design: {
    title: 'Pictures'
  },
  table: {
    ui: [
      { id: 'id', desc: 'ID', dataTable: true, input: 'text', disabled: true },
      { id: 'createdAt', desc: 'Date Created', dataTable: true, input: 'text', disabled: true },
      { id: 'updatedAt', desc: 'Date Updated', dataTable: true, input: 'text', disabled: true },
      { id: 'name', desc: 'Name', dataTable: true, input: 'text' },
      { id: 'description', desc: 'Description', dataTable: true, input: 'text' }
    ],
    conf: {
      order: [['updatedAt', 'desc']],
      getURL: `/${window['siteHash']}/product-management/product/pictures` ,
      numColumn: 3
    }
  },
  buttons: {
    ui: [
      { id: 'add', desc: 'Add', postTo: `/${window['siteHash']}/product-management/product/picture` },
      { id: 'edit', desc: 'Edit', postTo: `/${window['siteHash']}/product-management/product/picture/edit` },
      { id: 'delete', desc: 'Delete', postTo: `/${window['siteHash']}/product-management/product/picture/delete` }
    ],
    conf: {
      networkTimeout: 2000 // timeout for postTo request
    }
  }
})

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
    id: getURLQuery(window.location.href)['id'],
    description: productDescription.summernote('code')
  }

  axios.post<NCResponse<Product>>(`/${window['siteHash']}/product-management/product/edit`, body).then(rawResp => {
    if (rawResp.data.status) {
      toastr.success('Success!')
    } else {
      toastr.error('Failed: ' + rawResp.data.errMessage)
      console.error(rawResp.data.errMessage)
    }
  })
})
function updateSaveButton (text: string) {
  saveButton.text(text)
}

$('#btn-add-image').NCImagePicker({
  callbackFn: (imageurl, imageid) => {
    console.log('haha')
  },
  postURL: '',
  getURL: '',
  deleteURL: ''
})
