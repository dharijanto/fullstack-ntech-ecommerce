import * as SphinxClient from 'sphinxapi'

class SearchService {
  private sphinxClient
  constructor () {
    this.sphinxClient = new SphinxClient()
  }

  initialize () {
    this.sphinxClient.SetServer('localhost', 9312)
    return new Promise((resolve, reject) => {
      this.sphinxClient.Status((err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  // TODO: Format the returned results
  searchInStockProducts (query: string) {
    return new Promise((resolve, reject) => {
      // this.sphinxClient.Query(`SELECT * FROM instockproducts WHERE MATCH('${query}')`, (err, result) => {
      this.sphinxClient.Query(`logitech`, 'inStockProducts', (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  }

  searchPOProducts (query: string) {
    return
  }

  searchSubCategories (query: string) {
    return
  }
}

export default new SearchService()
