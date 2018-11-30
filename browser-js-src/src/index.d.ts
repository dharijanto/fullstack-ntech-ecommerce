/// <reference path="../../src/index.d.ts" />
/// <reference types="summernote" />
/// <reference types="bootstrap" />

// TODO: We should create typescript definition for this
interface JQueryPrintConfig {
  title: string
  globalStyles: boolean
  iframe: boolean
  append: string
}

interface JQuery {
  print: (config: JQueryPrintConfig) => void
}