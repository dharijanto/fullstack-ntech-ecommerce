import * as $ from 'jquery'
import 'nc-input-library'
import 'nc-image-picker'
/* import * as toastr from 'toastr' */
import * as toastr from 'toastr'
import * as _ from 'lodash'

import axios from '../libs/axios-wrapper'
import Config from '../config'
import * as Utils from '../libs/utils'

console.log(_.random(true))

let variant: Variant
const ncCategory = $('#category').NCInputLibrary({
  design: {
    title: 'Category'
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
      getURL: `/${window['siteHash']}/product-management/categories` ,
      onRowClicked: onCategoryClicked,
      numColumn: 3
    }
  },
  buttons: {
    ui: [
      { id: 'add', desc: 'Add', postTo: `/${window['siteHash']}/product-management/category` },
      { id: 'edit', desc: 'Edit', postTo: `/${window['siteHash']}/product-management/category/edit` },
      { id: 'delete', desc: 'Delete', postTo: `/${window['siteHash']}/product-management/category/delete`, confirm: 'Are you sure?' }
    ],
    conf: {
      networkTimeout: Config.NETWORK_TIMEOUT // timeout for postTo request
    }
  }
})

const ncSubCategory = $('#sub-category').NCInputLibrary({
  design: {
    title: 'Sub-Category'
  },
  table: {
    ui: [
      { id: 'id', desc: 'ID', dataTable: true, input: 'text', disabled: true },
      { id: 'categoryId', desc: 'Category ID', dataTable: false, input: 'select', selectData: Utils.getCategories },
      { id: 'createdAt', desc: 'Date Created', dataTable: true, input: 'text', disabled: true },
      { id: 'updatedAt', desc: 'Date Updated', dataTable: true, input: 'text', disabled: true },
      { id: 'name', desc: 'Name', dataTable: true, input: 'text' },
      { id: 'description', desc: 'Description', dataTable: true, input: 'text' },
      { id: 'imageFilename', desc: 'Image (400 x 400)', dataTable: true, input: 'text', disabled: false }
    ],
    conf: {
      order: [['updatedAt', 'desc']],
      getURL: () => `/${window['siteHash']}/product-management/subCategories?categoryId=${selectedCategory && selectedCategory.id}` ,
      onRowClicked: onSubCategoryClicked,
      numColumn: 3
    }
  },
  buttons: {
    ui: [
      { id: 'add', desc: 'Add', postTo: () => `/${window['siteHash']}/product-management/subCategory?categoryId=${selectedCategory && selectedCategory.id}` },
      { id: 'edit', desc: 'Edit', postTo: () => `/${window['siteHash']}/product-management/subCategory/edit?categoryId=${selectedCategory && selectedCategory.id}` },
      { id: 'delete', desc: 'Delete', postTo: () => `/${window['siteHash']}/product-management/subCategory/delete?categoryId=${selectedCategory && selectedCategory.id}`, confirm: 'Are you sure?' }
    ],
    conf: {
      networkTimeout: Config.NETWORK_TIMEOUT // timeout for postTo request
    }
  }
})

const ncProduct = $('#product').NCInputLibrary({
  design: {
    title: 'Product'
  },
  table: {
    ui: [
      { id: 'id', desc: 'ID', dataTable: true, input: 'text', disabled: true },
      { id: 'subCategoryId', desc: 'Sub-Category ID', dataTable: false, input: 'select', selectData: Utils.getSubCategories },
      { id: 'createdAt', desc: 'Date Created', dataTable: true, input: 'text', disabled: true },
      { id: 'updatedAt', desc: 'Date Updated', dataTable: true, input: 'text', disabled: true },
      { id: 'name', desc: 'Name', dataTable: true, input: 'text' },
      { id: 'price', desc: 'Price', dataTable: true, input: 'text' },
      { id: 'weight', desc: 'Weight', dataTable: true, input: 'text' },
      { id: 'warranty', desc: 'Garansi', dataTable: true, input: 'text' },
      { id: 'notes', desc: 'Notes', dataTable: true, input: 'textArea' }
    ],
    conf: {
      order: [['updatedAt', 'desc']],
      getURL: () => `/${window['siteHash']}/product-management/products?subCategoryId=${selectedSubCategory && selectedSubCategory.id}` ,
      onRowClicked: onProductClicked,
      numColumn: 3
    }
  },
  buttons: {
    ui: [
      { id: 'add', desc: 'Add', postTo: () => `/${window['siteHash']}/product-management/product?subCategoryId=${selectedSubCategory && selectedSubCategory.id}` },
      { id: 'edit', desc: 'Edit', postTo: () => `/${window['siteHash']}/product-management/product/edit?subCategoryId=${selectedSubCategory && selectedSubCategory.id}` },
      { id: 'delete', desc: 'Delete', postTo: () => `/${window['siteHash']}/product-management/product/delete?subCategoryId=${selectedSubCategory && selectedSubCategory.id}`, confirm: 'Are you sure?' }
    ],
    conf: {
      networkTimeout: Config.NETWORK_TIMEOUT // timeout for postTo request
    }
  }
})

const ncVariant = $('#variant').NCInputLibrary({
  design: {
    title: 'Variant'
  },
  table: {
    ui: [
      { id: 'id', desc: 'ID', dataTable: true, input: 'text', disabled: true },
      { id: 'createdAt', desc: 'Date Created', dataTable: true, input: 'text', disabled: true },
      { id: 'updatedAt', desc: 'Date Updated', dataTable: true, input: 'text', disabled: true },
      { id: 'name', desc: 'Name', dataTable: true, input: 'text' }
    ],
    conf: {
      order: [['updatedAt', 'desc']],
      getURL: () => `/${window['siteHash']}/product-management/variants?productId=${selectedProduct && selectedProduct.id}` ,
      numColumn: 3,
      onRowClicked: (data: Variant) => {
        variant = data
      }
    }
  },
  buttons: {
    ui: [
      { id: 'add', desc: 'Add', postTo: () => `/${window['siteHash']}/product-management/variant?productId=${selectedProduct && selectedProduct.id}` },
      { id: 'edit', desc: 'Edit', postTo: () => `/${window['siteHash']}/product-management/variant/edit?productId=${selectedProduct && selectedProduct.id}` },
      { id: 'delete', desc: 'Delete', postTo: () => `/${window['siteHash']}/product-management/variant/delete?productId=${selectedProduct && selectedProduct.id}`, confirm: 'Are you sure?' }
    ],
    conf: {
      networkTimeout: Config.NETWORK_TIMEOUT // timeout for postTo request
    }
  }
})

const btnPrintQRCode = $(`<button class="btn btn-primary"> Print QR </button>`)
btnPrintQRCode.on('click', () => {
  if (variant && variant.id) {
    window.open(`/${window['siteHash']}/product-management/variant/qr-code?variantId=${variant.id}`)
  } else {
    alert('Varian harus dipilih!')
  }
})
ncVariant.setFirstCustomView(btnPrintQRCode)

ncCategory.reloadTable()

let selectedCategory: Category
function onCategoryClicked (data: Category) {
  selectedCategory = data
  ncSubCategory.reloadTable(true)
  console.log('Selected category=' + JSON.stringify(selectedCategory))
}

let selectedSubCategory: Category
function onSubCategoryClicked (data: SubCategory) {
  selectedSubCategory = data
  ncProduct.reloadTable(true)
  setImagePreview(data.imageFilename)
  console.log('Selected category=' + JSON.stringify(selectedCategory))
}

let selectedProduct: Product
function onProductClicked (data: Product) {
  if (selectedProduct && selectedProduct.id === data.id) {
    window.open(`/${window['siteHash']}/product-management/product/description?id=${data.id}`)
  } else {
    toastr.clear()
    toastr.info('Click one more time to open description editor')
  }
  selectedProduct = data
  ncVariant.reloadTable(true)
}

const imagePreview = $(`<img class="img-responsive" style="max-width: 200px; padding: 15px">`)
ncSubCategory.setFirstCustomView(imagePreview)

function setImagePreview (filename) {
  axios.post(`/${window['siteHash']}/image/get-url`, { filename: filename }).then(resp => {
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
    setImagePreview(imageFilename)
    $('input[name="imageFilename"]').val(imageFilename)
  },
  getURL: `/${window['siteHash']}/images`,
  postURL: `/${window['siteHash']}/image`,
  deleteURL: `/${window['siteHash']}/image/delete`
})
