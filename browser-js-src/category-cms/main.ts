import * as _ from 'lodash'
import * as $ from 'jquery'
require('nc-input-library')

const ncCategory = $('#category').NCInputLibrary({
  design: {
    title: 'Category Management'
  },
  table: {
    ui: [
      {id: 'id', desc: 'ID', dataTable: true, input: 'text', disabled: true},
      {id: 'createdAt', desc: 'Date Created', dataTable: true, input: 'text', disabled: true},
      {id: 'updatedAt', desc: 'Date Updated', dataTable: true, input: 'text', disabled: true},
      {id: 'description', desc: 'Description', dataTable: true, input: 'text'},
      {id: 'name', desc: 'name', dataTable: true, input: 'text'},
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
      {id: 'add', desc: 'Add', postTo: `$/{window['siteHash']}/product-management/category`},
      {id: 'edit', desc: 'Edit', postTo: `/${window['siteHash']}/product-management/category/edit`},
      {id: 'delete', desc: 'Delete', postTo: `/${window['siteHash']}/product-management/category/delete`}
    ],
    conf: {
      networkTimeout: 2000 // timeout for postTo request
    }
  }
})

const ncSubCategory = $('#sub-category').NCInputLibrary({
  design: {
    title: 'Sub-Category Management'
  },
  table: {
    ui: [
      {id: 'id', desc: 'ID', dataTable: true, input: 'text', disabled: true},
      {id: 'createdAt', desc: 'Date Created', dataTable: true, input: 'text', disabled: true},
      {id: 'updatedAt', desc: 'Date Updated', dataTable: true, input: 'text', disabled: true},
      {id: 'description', desc: 'Description', dataTable: true, input: 'text'},
      {id: 'name', desc: 'name', dataTable: true, input: 'text'},
    ],
    conf: {
      order: [['updatedAt', 'desc']],
      getURL: `/${window['siteHash']}/product-management/subCategories` ,
      onRowClicked: onSubCategoryClicked,
      numColumn: 3
    }
  },
  buttons: {
    ui: [
      {id: 'add', desc: 'Add', postTo: `/${window['siteHash']}/product-management/subCategory`},
      {id: 'edit', desc: 'Edit', postTo: `/${window['siteHash']}/product-management/subCategory/edit`},
      {id: 'delete', desc: 'Delete', postTo: `/${window['siteHash']}/product-management/subCategory/delete`}
    ],
    conf: {
      networkTimeout: 2000 // timeout for postTo request
    }
  }
})

ncCategory.reloadTable()

var selectedCategory: Category
function onCategoryClicked (data: Category) {
  selectedCategory = data
  console.log('Selected category=' + JSON.stringify(selectedCategory))
}

function onSubCategoryClicked (data: SubCategory) {

}