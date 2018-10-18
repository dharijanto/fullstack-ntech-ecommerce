import * as util from 'util'

import { Model, Instance, Sequelize } from 'sequelize'
import * as Promise from 'bluebird'

import { CRUDService } from './crud-service'
import AppConfig from '../app-config'
import * as Utils from '../libs/utils'

/*
  This is used to do shop management.
  For example, to customize price for product
*/
class ShopService extends CRUDService {
  /*
    Return product joined with shopProduct meta information.
    If shopProduct is not defined, append meta information:
    {
      id: null,
      price: product.price,
      preOrder: true,
      poLength: 3 days,
      disable: false
    }
  */

  getShops () {
    return this.read<Shop>('Shop', {}).then(resp => {
      return resp
    })
  }

  // TODO: We should create test cases to ensure this is correct...
  // i.e. when there are suppliers, supplier count is correct
  //      when there are shopStocks, the count is correct
  getShopifiedProducts (shopId, primaryImagesOnly = false, productSearchClause = {}, categorySearchClause = {}): Promise<NCResponse<ShopifiedProduct[]>> {
    return this.getSequelize().query(`SELECT * FROM shopifiedProductsView WHERE shopId = ${shopId}`,
      { type: this.getSequelize().QueryTypes.SELECT }).then(result => {
        if (result) {
          return { status: true, data: result }
        } else {
          return { status: false }
        }
      })
  }

  getInStockProducts ({ pageSize = 10, pageIndex = 0, productId = null }, shopId): Promise<NCResponse<InStockProduct[]>> {
    return this.getSequelize().query(`
    SELECT
    inStockProductsView.id as id,
    inStockProductsView.shopId as shopId,
    inStockProductsView.name as name,
    inStockProductsView.description as description,
    inStockProductsView.warranty as warranty,
    inStockProductsView.price as price,
    inStockProductsView.stockQuantity as stockQuantity,
    primaryImages.imageFilename as \`primaryImage.imageFilename\`,
    primaryImages.productId as \`primaryImage.productId\`,
    productImages.imageFilename as \`images.imageFilename\`,
    productImages.productId as \`images.productId\`,
    subCategories.id as \`subCategory.id\`,
    subCategories.name as \`subCategory.name\`,
    subCategories.description as \`subCategory.description\`,
    subCategories.categoryId as \`subCategory.categoryId\`,
    subCategories.imageFilename as \`subCategory.imageFilename\`,
    categories.id as \`subCategory.category.id\`,
    categories.name as \`subCategory.category.name\`,
    categories.description as \`subCategory.category.description\`,
    inStockVariantsView.id as \`variants.id\`,
    inStockVariantsView.shopId as \`variants.shopId\`,
    inStockVariantsView.productId as \`variants.productId\`,
    inStockVariantsView.name as \`variants.name\`,
    inStockVariantsView.stockQuantity as \`variants.stockQuantity\`
 FROM (SELECT *
       FROM inStockProductsView
       WHERE inStockProductsView.shopId = ${shopId} ${productId ? 'AND inStockProductsView.id =' + productId : ''}
       LIMIT ${pageSize * pageIndex}, ${pageSize}
      ) as inStockProductsView
LEFT OUTER JOIN productImages on inStockProductsView.id = productImages.productId
LEFT OUTER JOIN
  (SELECT * FROM productImages WHERE \`primary\` = TRUE) as primaryImages ON inStockProductsView.id = primaryImages.productId
LEFT OUTER JOIN subCategories on subCategories.id = inStockProductsView.subCategoryId
LEFT OUTER JOIN categories on subCategories.categoryId = categories.id
LEFT OUTER JOIN inStockVariantsView ON inStockVariantsView.productId = inStockProductsView.id AND inStockVariantsView.shopId = ${shopId}
ORDER BY inStockProductsView.id;
    `, { type: this.getSequelize().QueryTypes.SELECT, nest: false }).then(flattenedProducts => {
      const treeifiedProducts = Utils.objectify(flattenedProducts).map(product => {
        product.subCategory = product.subCategory[0]
        product.subCategory.category = product.subCategory.category[0]
        product.primaryImage = product.primaryImage[0]
        return product
      })
      return { status: true, data: treeifiedProducts }
    })
  }

  getPOProducts ({ pageSize = 10, pageIndex = 0, productId = null }, shopId): Promise<NCResponse<POProduct[]>> {
    return this.getSequelize().query(`
SELECT
  poProductsView.id as id,
  poProductsView.shopId as shopId,
  poProductsView.name as name,
  poProductsView.description as description,
  poProductsView.warranty as warranty,
  poProductsView.price as price,
  poProductsView.preOrderDuration as preOrderDuration,
  primaryImages.imageFilename as \`primaryImage.imageFilename\`,
  primaryImages.productId as \`primaryImage.productId\`,
  productImages.imageFilename as \`images.imageFilename\`,
  productImages.productId as \`images.productId\`,
  subCategories.id as \`subCategory.id\`,
  subCategories.name as \`subCategory.name\`,
  subCategories.description as \`subCategory.description\`,
  subCategories.categoryId as \`subCategory.categoryId\`,
  subCategories.imageFilename as \`subCategory.imageFilename\`,
  categories.id as \`subCategory.category.id\`,
  categories.name as \`subCategory.category.name\`,
  categories.description as \`subCategory.category.description\`,
  poVariantsView.id as \`variants.id\`,
  poVariantsView.shopId as \`variants.shopId\`,
  poVariantsView.productId as \`variants.productId\`,
  poVariantsView.name as \`variants.name\`,
  poVariantsView.supplierCount as \`variants.supplierCount\`
FROM (SELECT *
  FROM poProductsView
  WHERE poProductsView.shopId = ${shopId} ${productId ? 'AND poProductsView.id =' + productId : ''}
  LIMIT ${pageSize * pageIndex}, ${pageSize}
 ) as poProductsView
LEFT OUTER JOIN
  (SELECT * FROM productImages WHERE \`primary\` = TRUE) as primaryImages ON poProductsView.id = primaryImages.productId
LEFT OUTER JOIN productImages on poProductsView.id = productImages.productId
LEFT OUTER JOIN subCategories on subCategories.id = poProductsView.subCategoryId
LEFT OUTER JOIN categories on subCategories.categoryId = categories.id
LEFT OUTER JOIN poVariantsView ON poVariantsView.productId = poProductsView.id AND poVariantsView.shopId = ${shopId}
ORDER BY poProductsView.id LIMIT ${pageSize * pageIndex}, ${pageSize};
    `, { type: this.getSequelize().QueryTypes.SELECT, nest: false }).then(flattenedProducts => {
      const treeifiedProducts = Utils.objectify(flattenedProducts).map(product => {
        product.subCategory = product.subCategory[0]
        product.subCategory.category = product.subCategory.category[0]
        product.primaryImage = product.primaryImage[0]
        return product
      })
      return { status: true, data: treeifiedProducts }
    })
  }

  getShopifiedVariants (shopId, productId): Promise<NCResponse<ShopifiedVariant[]>> {
    return this.getSequelize().query(`SELECT * FROM shopifiedVariantsView WHERE shopId = ${shopId} AND productId =${productId}`,
      { type: this.getSequelize().QueryTypes.SELECT }).then(result => {
        if (result) {
          return { status: true, data: result }
        } else {
          return { status: false }
        }
      })
  }

  getShopStock (searchClause) {
    return (this.getModels('ShopStock') as Model<Instance<ShopStock>, Partial<ShopStock>>).findAll({
      where: searchClause,
      include: [
        {
          model: this.getModels('Variant'),
          include: [
            {
              model: this.getModels('Product')
            }
          ]
        }
      ]
    }).then(data => {
      return { status: true, data }
    })
  }

  getSupplierStock (supplierId: number) {
    return this.getModels('SupplierStock').findAll({
      where: { supplierId },
      include: [
        {
          model: this.getModels('Variant'),
          include: [
            {
              model: this.getModels('Product')
            }
          ]
        }
      ]
    }).then(data => {
      return { status: true, data }
    }).catch(this.errHandler)
  }

  addSupplierStock ({ supplierId, variantId, price }) {
    return this.create<SupplierStock>('SupplierStock', {
      supplierId,
      variantId,
      price
    })
  }

  getPromotion (shopId): Promise<NCResponse<Promotion[]>> {
    return this.getModels('Promotion').findAll({
      where: { shopId },
      include: [
        {
          model: this.getModels('Product'),
          include: [
            {
              model: this.getModels('SubCategory'),
              include: [
                {
                  model: this.getModels('Category')
                }
              ]
            }
          ]
        }
      ]
    }).then(data => {
      const result = data.map(promotion => promotion.get({ plain: true }))
      /* console.log(util.inspect(result)) */
      return { status: true, data: result }
    }).catch(this.errHandler)
  }
}

export default new ShopService()
