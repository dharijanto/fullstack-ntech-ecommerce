import {CRUDService} from './crud-service'
import * as Promise from 'bluebird'

class ProductService extends CRUDService {
  createCategory (data: Partial<Category>) {
    return super.create('Category', data)
  }

  updateCategory (id: number, data: Partial<Category>) {
    return super.update('Category', data, {id})
  }

  getCategory (searchClause: Partial<Category>): Promise<NCResponse<Category>>  {
    return super.readOne<Category>('Category', searchClause)
  }

  getCategories (searchClause: Partial<Category> = {}) {
    return super.read<Category>('Category', searchClause)
  }

  createSubCategory (data: Partial<SubCategory>) {
    return super.create('SubCategory', data)
  }

  updateSubCategory (id: number, data: Partial<SubCategory>) {
    return super.update('SubCategory', data, {id})
  }

  getSubCategories (categoryId) {
    return super.read<SubCategory>('SubCategory', {categoryId})
  }

  createProduct (data: Partial<Product>) {
    return super.create('Product', data)
  }

  getProduct (searchClause: Partial<Product>) {
    return super.readOne<Product>('Product', searchClause)
  }

  getProducts (searchClause: Partial<Product>) {
    return super.read<Product>('Product', searchClause)
  }
}

export default new ProductService()