import * as $ from 'jquery'
import * as toastr from 'toastr'
import { getURLQuery } from '../libs/utils'
import axios from '../libs/axios-wrapper'
import 'nc-image-picker'
import 'nc-input-library'
import Config from '../config'

let aisle: Partial<Aisle>

$(document).ready(() => {
  const ncAisle = $('#aisle').NCInputLibrary({
    design: {
      title: 'Aisles'
    },
    table: {
      ui: [
        { id: 'aisle', desc: 'Aisle', dataTable: true, input: 'hidden' },
        { id: 'quantity', desc: 'Quantity', dataTable: true, input: 'hidden' }
      ],
      conf: {
        order: [['aisle', 'asc']],
        getURL: () => `/cms/stock-management/aisles/detailed` ,
        numColumn: 3,
        onRowClicked: (data: Aisle) => {
          aisle = data
          ncAisleContent.reloadTable()
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

  const ncAisleContent = $('#aisle-content').NCInputLibrary({
    design: {
      title: 'Aisle Management'
    },
    table: {
      ui: [
        { id: 'productName', desc: 'Product', dataTable: true, input: 'hidden' },
        { id: 'variantName', desc: 'Variant', dataTable: true, input: 'hidden' },
        { id: 'quantity', desc: 'Quantity', dataTable: true, input: 'hidden' }
      ],
      conf: {
        order: [['quantity', 'desc']],
        getURL: () => `/cms/stock-management/aisles/content?aisle=${aisle ? aisle.aisle : ''}` ,
        numColumn: 3,
        onRowClicked: (data) => {
          return
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

  ncAisle.reloadTable()
})
