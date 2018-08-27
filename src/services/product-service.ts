import { CRUDService } from './crud-service'
import { Model } from 'sequelize'
import * as Promise from 'bluebird'

class ProductService extends CRUDService {
  // Get all products with only their primary image
  getProductsWithPrimaryImage (): Promise<NCResponse<Product[]>> {
    return super.getModels('Product').findAll<Product>({
      include: [
        {
          model: super.getModels('ProductImage'),
          where: { primary: true }
        },
        {
          model: super.getModels('SubCategory'),
          include: [{ model: super.getModels('Category') }]
        }
      ]
    }).then(readData => {
      return { status: true, data: readData.map(data => data.get({ plain: true })) }
    })
  }

  createCategory (data: Partial<Category>) {
    return super.create('Category', data)
  }

  getCategory (searchClause: Partial<Category>) {
    return super.readOne<Category>('Category', searchClause)
  }

  getCategories (searchClause: Partial<Category> = {}, includeSubCategories: boolean = false): Promise<NCResponse<Category[]>> {
    if (includeSubCategories) {
      return this.getModels('Category').findAll<Category>({
        include: [
          {
            model: this.getModels('SubCategory')
          }
        ],
        where: searchClause
      }).then(readData => {
        return { status: true, data: readData.map(data => data.get({ plain: true })) }
      })
    } else {
      return super.read<Category>('Category', searchClause)
    }
  }

  updateCategory (id: number, data: Partial<Category>) {
    return super.update('Category', data, { id })
  }

  deleteCategory (id: number) {
    return super.delete('Category', { id })
  }

  createSubCategory (data: Partial<SubCategory>) {
    return super.create('SubCategory', data)
  }

  getSubCategories (categoryId) {
    return super.read<SubCategory>('SubCategory', { categoryId })
  }

  getSubCategory (searchClause: Partial<Category>) {
    return super.readOne<SubCategory>('SubCategory', searchClause)
  }

  updateSubCategory (id: number, data: Partial<SubCategory>) {
    return super.update('SubCategory', data, { id })
  }

  deleteSubCategory (id: number) {
    return super.delete('SubCategory', { id })
  }

  getProductImages (productId: number): Promise<NCResponse<ProductImage[]>> {
    return (this.getModels('ProductImage') as Model<ProductImage, Partial<ProductImage>>)
      .findAll({ where: { productId } }).then(data => {
        return { status: true, data }
      })
  }
}

export default new ProductService()
