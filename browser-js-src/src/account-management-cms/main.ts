import * as $ from 'jquery'
import 'nc-input-library'
import 'nc-image-picker'
/* import * as toastr from 'toastr' */
import * as toastr from 'toastr'
import * as _ from 'lodash'

import axios from '../libs/axios-wrapper'

console.log(_.random(true))

let shop: Shop

const ncShop = $('#shop').NCInputLibrary({
  design: {
    title: 'Shops '
  },
  table: {
    ui: [
      { id: 'id', desc: 'ID', dataTable: true, input: 'hidden', disabled: true },
      { id: 'name', desc: 'Name', dataTable: true, input: 'hidden', disabled: false },
      { id: 'city', desc: 'City', dataTable: true, input: 'hidden', disabled: false },
      { id: 'location', desc: 'Location', dataTable: true, input: 'hidden', disabled: false },
      { id: 'address', desc: 'Address', dataTable: true, input: 'hidden', disabled: false },
      { id: 'zipCode', desc: 'Zip Code', dataTable: true, input: 'hidden', disabled: false },
      { id: 'createdAt', desc: 'Date Created', dataTable: true, input: 'hidden', disabled: true },
      { id: 'updatedAt', desc: 'Date Updated', dataTable: true, input: 'hidden', disabled: true }
    ],
    conf: {
      order: [['updatedAt', 'desc']],
      getURL: `/${window['siteHash']}/shop-management/shops` ,
      numColumn: 3,
      onRowClicked: (data: Shop) => {
        shop = data
        console.dir(shop)
        ncAccount.reloadTable()
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

const ncAccount = $('#account').NCInputLibrary({
  design: {
    title: 'Accounts'
  },
  table: {
    ui: [
      { id: 'id', desc: 'ID', dataTable: true, input: 'hidden', disabled: true },
      { id: 'username', desc: 'Username', dataTable: true, input: 'text' },
      { id: 'password', desc: 'Password', dataTable: false, input: 'password' },
      { id: 'confirmPassword', desc: 'Confirm Password', dataTable: false, input: 'password' },
      { id: 'fullName', desc: 'Full Name', dataTable: true, input: 'text' },
      { id: 'privilege', desc: 'Privilege', dataTable: true, input: 'select', selectData: () => ['Admin', 'Cashier', 'Opnamer'] },
      { id: 'createdAt', desc: 'Date Created', dataTable: true, input: 'hidden', disabled: true },
      { id: 'updatedAt', desc: 'Date Updated', dataTable: true, input: 'hidden', disabled: true }
    ],
    conf: {
      order: [['updatedAt', 'desc']],
      getURL: () => `/${window['siteHash']}/account-management/accounts?shopId=${shop ? shop.id : ''}` ,
      onRowClicked: (data) => {
        return
      },
      numColumn: 3
    }
  },
  buttons: {
    ui: [
      { id: 'add', desc: 'Add', postTo: () => `/${window['siteHash']}/account-management/account?shopId=${shop ? shop.id : ''}` },
      { id: 'edit', desc: 'Edit', postTo: () => `/${window['siteHash']}/account-management/account/edit?shopId=${shop ? shop.id : ''}` },
      { id: 'delete', desc: 'Delete', postTo: () => `/${window['siteHash']}/shop-management/shop/delete` }
    ],
    conf: {
      networkTimeout: 2000 // timeout for postTo request
    }
  }
})

ncShop.reloadTable()
