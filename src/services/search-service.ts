import * as Promise from 'bluebird'
import * as SphinxClient from 'sphinxapi'
import * as log from 'npmlog'
import LocalShopService from '../app/local-shop-services/local-shop-service'
import productService from './product-service'

const TAG = 'SearchService'

/*
TODO:
  1. Add pagination support
*/
class SearchService {
  private sphinxClient
  constructor () {
    this.sphinxClient = Promise.promisifyAll(new SphinxClient())
  }

  initialize () {
    this.sphinxClient.SetServer('localhost', 9312)
    return new Promise((resolve, reject) => {
      this.sphinxClient.Status((err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve({ status: true })
        }
      })
    })
  }

  validateQuery (query): Promise<NCResponse<null>> {
    if (query === undefined || query === null || query === '') {
      return Promise.resolve({ status: false, errMessage: 'query cannot be empty!' })
    } else {
      return Promise.resolve({ status: true })
    }
  }

  // TODO: Format the returned results
  searchInStockProducts (query: string): Promise<NCResponse<{ products: InStockProduct[], totalProducts: number }>> {
    // this.sphinxClient.Query(`SELECT * FROM instockproducts WHERE MATCH('${query}')`, (err, result) => {
    return this.validateQuery(query).then(resp => {
      if (resp.status) {
        return this.sphinxClient.QueryAsync(query, 'inStockProducts').then(result => {
          log.verbose(TAG, `searchInStockProducts(): sphinx result=${JSON.stringify(result, null, 2)}`)
          const ids = result.matches.map(match => match.id)
          if (ids.length > 0) {
            return LocalShopService.getInStockProducts({ productId: ids }).then(resp => {
              return resp
            })
          } else {
            return { status: true, data: { products: [], totalProducts: 0 } }
          }
        })
      } else {
        return { status: false, errMessage: 'Invalid query: ' + resp.errMessage }
      }
    })
  }

  searchPOProducts (query: string): Promise<NCResponse<{ products: POProduct[], totalProducts: number }>> {
      // this.sphinxClient.Query(`SELECT * FROM instockproducts WHERE MATCH('${query}')`, (err, result) => {
    return this.validateQuery(query).then(resp => {
      if (resp.status) {
        return this.sphinxClient.QueryAsync(query, 'poProducts').then(result => {
          log.verbose(TAG, `searchPOProducts(): sphinx result=${JSON.stringify(result, null, 2)}`)
          const ids = result.matches.map(match => match.id)
          if (ids.length > 0) {
            return LocalShopService.getPOProducts({ productId: ids }).then(resp => {
              return resp
            })
          } else {
            return { status: true, data: { products: [], totalProducts: 0 } }
          }
        })
      } else {
        return { status: false, errMessage: 'Invalid query: ' + resp.errMessage }
      }
    })
  }

  searchSubCategories (query: string): Promise<NCResponse<SubCategory[]>> {
    return this.validateQuery(query).then(resp => {
      if (resp.status) {
        return this.sphinxClient.QueryAsync(query, 'subCategories').then(result => {
          log.verbose(TAG, `searchSubCategories(): sphinx result=${JSON.stringify(result, null, 2)}`)
          const ids = result.matches.map(match => match.id)
          return productService.getSubCategories({ id: ids }).then(resp => {
            return resp
          })
        })
      } else {
        return { status: false, errMessage: 'Invalid query: ' + resp.errMessage }
      }
    })
  }
}

export default new SearchService()
