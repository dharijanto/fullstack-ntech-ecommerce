import {CRUDService, SearchClause} from './crud-service'
import * as Promise from 'bluebird'

class ProductService extends CRUDService {
  getCategory (searchClause: Partial<Category>) {
    return <Promise<NCResponse<Category>>> super.readOne('Category', searchClause)
  }

  getCategories (searchClause: Partial<Category> = {}) {
    return <Promise<NCResponse<Category[]>>> super.read('Category', searchClause)
  }

  getSubCategories (searchClause: Partial<SubCategory> = {}) {
    return <Promise<NCResponse<SubCategory>>> super.read('Category', searchClause)
  }

  getProduct () {

  }

  getProducts () {

  }
}

export default new ProductService()