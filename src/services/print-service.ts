import * as path from 'path'

// import * as Promise from 'bluebird'
import * as puppeteer from 'puppeteer'
import * as printer from 'printer'
import * as AppConfig from '../app-config'

// TODO:
/*
  This should be used when order management operation is done.
  For example, when an order is 'Closed' or 'Finish PO-ed' a print job should be
  queued.
*/
class PrintService {
  private paperWidth: string
  private paperHeight?: string
  private printerName: string

  // paperHeight: when this is left blank, printer would figure it out automatically
  constructor (printerName: string, paperWidth: string, paperHeight?: string) {
    this.printerName = printerName
    this.paperWidth = paperWidth
    this.paperHeight = paperHeight
  }

  private printFile (pdfFilePath: string, numCopies: number = 1): Promise<NCResponse<{ jobId: number}>> {
    return new Promise((resolve, reject) => {
      printer.printFile({filename: pdfFilePath,
        printer: this.printerName, // printer name, if missing then will print to default printer
        success: function (jobId) {
          resolve({ status: true, data: { jobId } })
        },
        // See https://github.com/apple/cups/blob/master/cups/cups.h for more options
        options: {
          'fit-to-page': true,
          'copies': numCopies
        },
        error: function (err) {
          reject(err)
        }
      })
    })
  }

  // fullURL: Complete URL. This can't be relative path because this is passed to a separate process (puppeteer)
  async printURL (fullURL: string, numCopies: number = 1): Promise<NCResponse<{ jobId: number }>> {
    try {
      const browser = await puppeteer.launch()
      const page = await browser.newPage()
      await page.goto(fullURL, {
        waitUntil: 'networkidle0'
      })
      const outFile = path.join(AppConfig.GENERATED_PRINT_PDF_PATH, `${Date.now()}.pdf`)
      await page.pdf({ width: this.paperWidth, height: this.paperHeight, path: outFile })
      return this.printFile(outFile, numCopies)
    } catch (err) {
      throw err
    }
  }
}

export default PrintService
