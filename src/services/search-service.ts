import * as SphinxClient from 'sphinxapi'
import LocalShopService from '../app/local-shop-services/local-shop-service'
import productService from './product-service'
/*
TODO:
  1. Add pagination support
*/
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
  searchInStockProducts (query: string): Promise<NCResponse<{ products: InStockProduct[], totalProducts: number }>> {
    return new Promise((resolve, reject) => {
      // this.sphinxClient.Query(`SELECT * FROM instockproducts WHERE MATCH('${query}')`, (err, result) => {
      this.sphinxClient.Query(query, 'inStockProducts', (err, result) => {
        try {
          if (err) {
            throw err
          } else {
            const ids = result.matches.map(match => match.id)
            LocalShopService.getInStockProducts({ productId: ids }).then(resp => {
              resolve(resp)
            }).catch(err => {
              throw err
            })
          }
        } catch (err) {
          reject(err)
        }
      })
    })
  }

  searchPOProducts (query: string): Promise<NCResponse<{ products: POProduct[], totalProducts: number }>> {
    return new Promise((resolve, reject) => {
      // this.sphinxClient.Query(`SELECT * FROM instockproducts WHERE MATCH('${query}')`, (err, result) => {
      this.sphinxClient.Query(query, 'poProducts', (err, result) => {
        try {
          if (err) {
            throw err
          } else {
            const ids = result.matches.map(match => match.id)
            LocalShopService.getPOProducts({ productId: ids }).then(resp => {
              resolve(resp)
            }).catch(err => {
              throw err
            })
          }
        } catch (err) {
          reject(err)
        }
      })
    })
  }

  searchSubCategories (query: string): Promise<NCResponse<SubCategory[]>> {
    return new Promise((resolve, reject) => {
      // this.sphinxClient.Query(`SELECT * FROM instockproducts WHERE MATCH('${query}')`, (err, result) => {
      this.sphinxClient.Query(query, 'subCategories', (err, result) => {
        try {
          if (err) {
            throw err
          } else {
            const ids = result.matches.map(match => match.id)
            productService.getSubCategories({ id: ids }).then(resp => {
              resolve(resp)
            }).catch(err => {
              throw err
            })
          }
        } catch (err) {
          reject(err)
        }
      })
    })
  }
}

export default new SearchService()
