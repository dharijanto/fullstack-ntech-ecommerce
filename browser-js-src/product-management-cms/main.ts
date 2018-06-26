import * as $ from 'jquery'
import 'nc-input-library'
/* import * as toastr from 'toastr' */
import * as toastr from 'toastr'
import * as _ from 'lodash'

console.log(_.random(true))
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
      { id: 'delete', desc: 'Delete', postTo: `/${window['siteHash']}/product-management/category/delete` }
    ],
    conf: {
      networkTimeout: 2000 // timeout for postTo request
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
      { id: 'createdAt', desc: 'Date Created', dataTable: true, input: 'text', disabled: true },
      { id: 'updatedAt', desc: 'Date Updated', dataTable: true, input: 'text', disabled: true },
      { id: 'name', desc: 'Name', dataTable: true, input: 'text' },
      { id: 'description', desc: 'Description', dataTable: true, input: 'text' }
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
      { id: 'delete', desc: 'Delete', postTo: () => `/${window['siteHash']}/product-management/subCategory/delete?categoryId=${selectedCategory && selectedCategory.id}` }
    ],
    conf: {
      networkTimeout: 2000 // timeout for postTo request
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
      { id: 'createdAt', desc: 'Date Created', dataTable: true, input: 'text', disabled: true },
      { id: 'updatedAt', desc: 'Date Updated', dataTable: true, input: 'text', disabled: true },
      { id: 'name', desc: 'Name', dataTable: true, input: 'text' },
      { id: 'price', desc: 'Price', dataTable: true, input: 'text' }
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
      { id: 'delete', desc: 'Delete', postTo: () => `/${window['siteHash']}/product-management/product/delete?subCategoryId=${selectedSubCategory && selectedSubCategory.id}` }
    ],
    conf: {
      networkTimeout: 2000 // timeout for postTo request
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
      numColumn: 3
    }
  },
  buttons: {
    ui: [
      { id: 'add', desc: 'Add', postTo: () => `/${window['siteHash']}/product-management/variant?productId=${selectedProduct && selectedProduct.id}` },
      { id: 'edit', desc: 'Edit', postTo: () => `/${window['siteHash']}/product-management/variant/edit?productId=${selectedProduct && selectedProduct.id}` },
      { id: 'delete', desc: 'Delete', postTo: () => `/${window['siteHash']}/product-management/variant/delete?productId=${selectedProduct && selectedProduct.id}` }
    ],
    conf: {
      networkTimeout: 2000 // timeout for postTo request
    }
  }
})

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
  console.log('Selected category=' + JSON.stringify(selectedCategory))
}

let selectedProduct: Product
function onProductClicked (data: Product) {
  if (selectedProduct && selectedProduct.id === data.id) {
    console.log('hehe')
  } else {
    console.log('should toast')
    toastr.info('Click one more time to open description editor')
  }
  selectedProduct = data
  ncVariant.reloadTable(true)
}
