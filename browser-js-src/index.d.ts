/// <reference path="../src/index.d.ts" />

declare namespace NCInputLibrary {
  type InputType = 'text' | 'date' | 'password' | 'textArea' | 'select'

  interface InputOptionalData {
    format?: (colText: string) => string
  }

  type SelectArrayDataCb = () => Array<string>
  type SelectArrayObjectDataCb = () => {searchVar: string, url: string}
  type SelectPromisedDataCb = () => Promise<Array<string>>

  type GetURLCallback = () => string
  type RowClickedCallback = (data: Object) => void
  type TableDrawnCallback = (data: Array<Object>) => void

  interface InputEntry {
    id: string // POST / GET id
    desc: string
    dataTable: boolean // Whether data table column of this input should be rendered
    input: InputType // What kind of input
    type?: 'date'
    disabled?: boolean // Whether the input should be greyed out
    data?: InputOptionalData
    selectData?: SelectArrayDataCb | SelectArrayObjectDataCb | SelectPromisedDataCb
  }

  interface ButtonEntry {
    id: string // POST / GET id
    desc: string
    postTo: GetURLCallback | string
  }

  interface TableConf {
    order: Array<[string, 'desc' | 'asc']>
    getURL: string | GetURLCallback
    onRowClicked?: RowClickedCallback
    onTableDrawn?: TableDrawnCallback
    numColumn?: 2 | 3
  }

  interface NCInputConfig {
    design: {
      title: string
    },
    table: {
      ui: Array<InputEntry>,
      conf: TableConf
    },
    buttons: {
      ui: Array<ButtonEntry>
      conf: {
        networkTimeout?: number
      }
    }
  }

  interface NCInput {
    reloadTable (clearNotif?: boolean): void
    clearNotif (): void
    setFirstCustomView(jqueryElement: JQuery.htmlString | JQuery.TypeOrArray<JQuery.Node | JQuery<JQuery.Node>>): void
    setSecondCustomView(jqueryElement: JQuery.htmlString | JQuery.TypeOrArray<JQuery.Node | JQuery<JQuery.Node>>): void
  }
}

interface JQuery {
  NCInputLibrary: (config: NCInputLibrary.NCInputConfig) => NCInputLibrary.NCInput
}
