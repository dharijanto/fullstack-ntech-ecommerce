var $ = require('jquery')
var toastr = require('toastr')
require('../nc-input-library')

function getDataURL () {
  return 'authorizedSenders'
}

var selectedRowId = null
function onRowClicked (data) {
  console.log(data)
}

function addSearchURL () {
  return 'addAuthorizedSender'
}

function deleteSearchURL () {
  return 'deleteAuthorizedSender'
}

const searchEditorHeader = {
  design: {
    title: 'Authorized Emails',
    panelColor: 'green'
  },
  table: {
    ui: [
      {id: 'email', desc: 'Email Address', dataTable: true, input: 'text'}
    ],
    conf: {
      orderType: 'desc', // If not defined orderType, default is desc
      orderBy: 'email',
      getURL: getDataURL,
      onRowClicked: onRowClicked
    }
  },
  buttons: {
    ui: [
      {id: 'add', desc: 'Add', postTo: addSearchURL},
      {id: 'delete', desc: 'Delete', postTo: deleteSearchURL}
    ]
  }
}

const ncInput = $('#sourceEmailEditor').NCInputLibrary(searchEditorHeader)
ncInput.reloadTable()
