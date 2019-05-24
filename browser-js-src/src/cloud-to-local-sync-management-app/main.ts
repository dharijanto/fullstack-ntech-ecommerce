import * as $ from 'jquery'
import 'nc-input-library'
import 'nc-image-picker'
/* import * as toastr from 'toastr' */
import * as toastr from 'toastr'
import * as _ from 'lodash'

import axios from '../libs/axios-wrapper'
import Config from '../config'

console.log(_.random(true))

const ncHistory = $('#history').NCInputLibrary({
  design: {
    title: 'Cloud-to-Local Sync Management'
  },
  table: {
    ui: [
      { id: 'id', desc: 'ID', dataTable: true, input: 'hidden', disabled: true },
      { id: 'status', desc: 'Status', dataTable: true, input: 'hidden', disabled: false },
      { id: 'info', desc: 'Info', dataTable: true, input: 'hidden', disabled: false },
      { id: 'untilTime', desc: 'Until Time', dataTable: true, input: 'hidden', disabled: false },
      { id: 'createdAt', desc: 'Date Created', dataTable: true, input: 'hidden', disabled: true },
      { id: 'updatedAt', desc: 'Date Updated', dataTable: true, input: 'hidden', disabled: true }
    ],
    conf: {
      order: [['updatedAt', 'desc']],
      getURL: `/cms/sync-management/cloud-to-local/history` ,
      numColumn: 3,
      onRowClicked: (data: CloudToLocalSyncHistory) => {
        return
      }
    }
  },
  buttons: {
    ui: [
      { id: 'sync', desc: 'Sync', postTo: () => `/cms/sync-management/cloud-to-local/sync` }
    ],
    conf: {
      networkTimeout: Config.NETWORK_TIMEOUT // timeout for postTo request
    }
  }
})

ncHistory.reloadTable()

setInterval(() => {
  ncHistory.reloadTable()
}, 5000)
