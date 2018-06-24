(function ($) {

  /*

  conf = {
    table: {
      ui: [
        {id: 'subject', desc: 'Subject', dataTable: true, input: 'text', disabled: false},
        {id: 'id', desc: 'ID', dataTable: true, input: 'text', disabled: true},
        {id: 'lastModified', desc: 'Last Modified', dataTable: true, input: 'date', disabled: true}
      ],
      conf: {
        orderBy: 'lastModified',
        onRowClickListener: null
      }
    },
    buttons: {
      ui: [
        {desc: 'Add', postTo: 'addSubject'},
        {desc: 'Delete', postTo: 'deleteSubject'}
      ]
  }
  */
  $.fn.NCFrameworks = function (conf) {
    conf = conf || {}
    conf = $.extend({
      table: {
        // i.e.: {id: 'subject', desc: 'Subject', dataTable: true, input: 'text', disabled: false},
        ui: [],
        conf: {
          orderBy: null,
          onRowClickListener: null
        }
      },
      buttons: {
        // i.e.: {desc: 'Add', postTo: 'addSubject'},
        ui: []
      }
    }, conf)

    const tableConf = conf.table
    const buttonsConf = conf.buttons

    const htmlElements = initHTML($(this), tableConf, buttonsConf)
    const dataTable = initDataTable(htmlElements.table, tableConf)
  }

  function initDataTable (tableElement, tableConf) {
    const tableColumns = []
    const orderBy = tableConf.conf.orderBy
    var orderIndex = -1
    for (var i = 0; i < tableConf.ui.length; i++) {
      const colConf = {
        data: tableConf.ui[i].id,
        name: tableConf.ui[i].id // used to refer to this column, instead of using index
      }
      if (tableConf.ui[i].input === 'date') {
        colConf.render = function (data, type, full, meta) {
          return moment(data).utc().format('YYYY-MM-DD')
        }
      }
      tableColumns.push(colConf)
      orderIndex = (orderBy === tableConf.ui[i].id) ? tableColumns.length - 1 : orderIndex
    }
    tableElement.DataTable()
  }

  function initInputForm (formElement, tableConf, buttonsConf) {
    // Inputs
    for (var i = 0; i < tableConf.ui.length; i++) {
      if (tableConf.ui[i].input === 'text') {
        const formGroup = $('<div class="form-group" />')
        const label = $('<label/>')
        label.html(tableConf.ui[i].desc)
        formGroup.append(label)
        const input = $('<input class="form-control input-md" type="text" placholder=' +
           tableConf.ui[i].inputPlaceholder + '/>')
        formGroup.append(input)
        formElement.append(formGroup)
      }
    }

    // Buttons
    var row = $('<div class="row" />')
    for (var i = 0; i < buttonsConf.ui.length; i++) {
      var col = $('<div class="col-md-3" />')
      row.append(col)
      var button = $('<button class="btn btn-default btn-block" type="button" ic-post-to="' + buttonsConf.ui[i].postTo + '">' +
          buttonsConf.ui[i].desc + '</button>')
      col.append(button)
    }
    formElement.append(row)
  }

  /* UI Structure:
    <div id='ncFrameworks'>

      <div id='dataTable'> </div>
    </div>
  */
  function initHTML (rootElement, tableConf, buttonsConf) {
    const initialized = {}

    // Initialze bootstrap panel
    var panel = $('<div class="panel panel-info" />')
    rootElement.append(panel)
    var panelHeading = $('<div class="panel-heading"/>')
    panel.append(panelHeading)
    var panelTitle = $('<h3 class="panel-title">Input Form</h3>')
    panelHeading.append(panelTitle)
    var panelBody = $('<div class="panel-body" />')
    panel.append(panelBody)

    // Initialize HTML form used for inputs
    var row = $('<div class="row" />')
    panelBody.append(row)
    var col = $('<div class="col-md-12" />')
    initialized.inputForm = $('<form class="ncInputForm" />')
    row.append(col)
    col.append(initialized.inputForm)

    // Iniitialize HTML table used for DataTable
    row = $('<div class="row" />')
    panelBody.append(row)
    col = $('<div class="col-md-12" />')
    initialized.table = $('<table class="custom-table table-stripped table-bordered table-hover" />')
    row.append(col)
    col.append(initialized.table)
    // Create and append table head
    var thead = $('<thead />')
    var tr = $('<tr />')
    for (var i = 0; i < tableConf.ui.length; i++) {
      if (tableConf.ui[i].dataTable) {
        var th = $('<th>' + tableConf.ui[i].desc + '</th>')
        tr.append(th)
      }
    }
    thead.append(tr)
    initialized.table.append(thead)

    initInputForm(initialized.inputForm, tableConf, buttonsConf)
    return initialized
  }
})(jQuery)