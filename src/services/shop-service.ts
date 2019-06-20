import * as util from 'util'

import { Model, Instance, Op } from 'sequelize'
import * as Promise from 'bluebird'

import { CRUDService } from './crud-service'
import * as AppConfig from '../app-config'
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

  createShop (data: Partial<Shop>) {
    return super.create<Shop>('Shop', data)
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

  /*
    productId: undefined -> disregard it
               number/string -> single product
               array -> products with matching ids
   */
  getInStockProducts ({ pageSize = 10, pageIndex = 0,
                        productId = null, categoryId = null,
                        subCategoryId = null }, shopId): Promise<NCResponse<{ products: InStockProduct[], totalProducts: number }>> {
    if (productId !== null && !(Utils.isNumber(productId) || Array.isArray(productId))) {
      return Promise.reject('productId has to be number or array! ' + JSON.stringify(productId))
    } else if (categoryId !== null && !Utils.isNumber(categoryId)) {
      return Promise.reject('categoryId has to be number!')
    } else if (subCategoryId !== null && !Utils.isNumber(subCategoryId)) {
      return Promise.reject('subCategoryId has to be number!')
    }

    // When productId is empty array, we can't pass it to SQL
    if (Array.isArray(productId) && (productId || []).length === 0) {
      productId = null
    }

    const getQuery = `
      SELECT
        inStockProductsView.id as id,
        inStockProductsView.shopId as shopId,
        inStockProductsView.name as name,
        inStockProductsView.description as description,
        inStockProductsView.warranty as warranty,
        inStockProductsView.price as price,
        inStockProductsView.stockQuantity as stockQuantity,
        inStockProductsView.updatedAt as updatedAt,
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
          WHERE inStockProductsView.shopId = ${shopId}
                ${productId && typeof productId !== 'object' ? 'AND inStockProductsView.id =' + productId : ''}
                ${productId && typeof productId === 'object' ? 'AND inStockProductsView.id IN (' + (productId || []).join(', ') + ')' : ''}
                ${subCategoryId ? ' AND inStockProductsView.subCategoryId =' + subCategoryId : ''}
                ${categoryId ? ' AND inStockProductsView.categoryId = ' + categoryId : '' }
          LIMIT ${pageSize * pageIndex}, ${pageSize}
         ) as inStockProductsView
    LEFT OUTER JOIN productImages ON inStockProductsView.id = productImages.productId AND productImages.deletedAt IS NULL
    LEFT OUTER JOIN
      (SELECT * FROM productImages WHERE \`primary\` = TRUE AND deletedAt IS NULL) as primaryImages ON inStockProductsView.id = primaryImages.productId
    INNER JOIN subCategories ON subCategories.id = inStockProductsView.subCategoryId
    INNER JOIN categories ON subCategories.categoryId = categories.id
    LEFT OUTER JOIN inStockVariantsView ON inStockVariantsView.productId = inStockProductsView.id AND inStockVariantsView.shopId = ${shopId}
    ORDER BY inStockProductsView.name;`

    const countQuery = `
      SELECT COUNT(*) AS count
        FROM (SELECT *
              FROM inStockProductsView
              WHERE inStockProductsView.shopId = ${shopId}
                    ${productId && typeof productId !== 'object' ? 'AND inStockProductsView.id =' + productId : ''}
                    ${productId && typeof productId === 'object' ? 'AND inStockProductsView.id IN (' + (productId || []).join(', ') + ')' : ''}
                    ${subCategoryId ? ' AND inStockProductsView.subCategoryId =' + subCategoryId : ''}
                    ${categoryId ? ' AND inStockProductsView.categoryId = ' + categoryId : '' }
              ) as inStockProductsView;`

    return Promise.join(
      this.getSequelize().query(getQuery, { type: this.getSequelize().QueryTypes.SELECT, nest: false }),
      this.getSequelize().query(countQuery, { type: this.getSequelize().QueryTypes.SELECT, nest: false })
    ).spread((flattenedProducts, countData) => {
      const products = Utils.objectify(flattenedProducts).map(product => {
        product.subCategory = product.subCategory[0]
        product.subCategory.category = product.subCategory.category[0]
        product.primaryImage = product.primaryImage[0]
        return product
      })
      const totalProducts = countData[0].count
      return { status: true, data: { products, totalProducts } }
    })
  }

  // TODO: Limit should be done on the final queries. Solution is to add categoryId on SQL view
  getPOProducts ({ pageSize = 10, pageIndex = 0,
                  productId = null, categoryId = null,
                  subCategoryId = null }, shopId): Promise<NCResponse<{ products: POProduct[], totalProducts: number }>> {
    if (productId !== null && !(Utils.isNumber(productId) || Array.isArray(productId))) {
      return Promise.reject('productId has to be number!')
    } else if (categoryId !== null && !Utils.isNumber(categoryId)) {
      return Promise.reject('categoryId has to be number!')
    } else if (subCategoryId !== null && !Utils.isNumber(subCategoryId)) {
      return Promise.reject('subCategoryId has to be number!')
    }

    // When productId is empty array, we can't pass it to SQL
    if (Array.isArray(productId) && (productId || []).length === 0) {
      productId = null
    }

    const getQuery = `
      SELECT
        poProductsView.id as id,
        poProductsView.shopId as shopId,
        poProductsView.name as name,
        poProductsView.description as description,
        poProductsView.warranty as warranty,
        poProductsView.price as price,
        poProductsView.preOrderDuration as preOrderDuration,
        poProductsView.updatedAt as updatedAt,
        primaryImages.imageFilename as \`primaryImage.imageFilename\`,
        primaryImages.productId as \`primaryImage.productId\`,
        productImages.imageFilename as \`images.imageFilename\`,
        # productImages.productId as \`images.productId\`,
        productImages.primary as \`images.primary\`,
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
        WHERE poProductsView.shopId = ${shopId}
              ${productId && typeof productId !== 'object' ? 'AND poProductsView.id =' + productId : ''}
              ${productId && typeof productId === 'object' ? 'AND poProductsView.id IN (' + (productId || []).join(', ') + ')' : ''}
              ${subCategoryId ? 'AND poProductsView.subCategoryId =' + subCategoryId : ''}
              ${categoryId ? ' AND poProductsView.categoryId = ' + categoryId : '' }
        LIMIT ${pageSize * pageIndex}, ${pageSize}
        ) as poProductsView
      LEFT OUTER JOIN
        (SELECT * FROM productImages WHERE \`primary\` = TRUE AND deletedAt IS NULL) as primaryImages ON poProductsView.id = primaryImages.productId
      LEFT OUTER JOIN productImages ON poProductsView.id = productImages.productId AND productImages.deletedAt IS NULL
      INNER JOIN subCategories on subCategories.id = poProductsView.subCategoryId
      INNER JOIN categories on subCategories.categoryId = categories.id
      LEFT OUTER JOIN poVariantsView ON poVariantsView.productId = poProductsView.id AND poVariantsView.shopId = ${shopId}
      ORDER BY poProductsView.name;`

    const countQuery = `
      SELECT COUNT(*) AS count FROM
        (SELECT *
          FROM poProductsView
          WHERE poProductsView.shopId = ${shopId}
                ${productId && typeof productId !== 'object' ? 'AND poProductsView.id =' + productId : ''}
                ${productId && typeof productId === 'object' ? 'AND poProductsView.id IN (' + (productId || []).join(', ') + ')' : ''}
                ${subCategoryId ? 'AND poProductsView.subCategoryId =' + subCategoryId : ''}
                ${categoryId ? ' AND poProductsView.categoryId = ' + categoryId : '' }
          ) as poProductsView`

    return Promise.join(
      this.getSequelize().query(getQuery, { type: this.getSequelize().QueryTypes.SELECT, nest: false }),
        this.getSequelize().query(countQuery, { type: this.getSequelize().QueryTypes.SELECT })
    ).spread((flattenedProducts, countData) => {
      const products = Utils.objectify(flattenedProducts).map(product => {
        product.subCategory = product.subCategory[0]
        product.subCategory.category = product.subCategory.category[0]
        product.primaryImage = product.primaryImage[0]
        return product
      })
      const totalProducts = countData[0].count
      return { status: true, data: { products, totalProducts } }
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

  getShopStock (shopId, searchClause = {}): Promise<NCResponse<Partial<ShopStock[]>>> {
    return (this.getModels('ShopStock') as Model<Instance<ShopStock>, Partial<ShopStock>>).findAll({
      where: Object.assign({}, searchClause, { shopId }),
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
      return { status: true, data: data.map(rawRow => {
        const row = rawRow.get({ plain: true })
        return { sku: `${row.variant && row.variant.product && row.variant.product.id} - ${row.variant && row.variant.id}`, ...row }
        return row
      })}
    })
  }

  // To easily figure out which product doesn't have suppliers
  getProductsWithSuppliersCount () {
    return super.rawReadQuery(`
      SELECT products.id id, products.name name,
              products.price price, MAX(variants.createdAt) createdAt,
              MAX(variants.updatedAt) updatedAt, COUNT(supplierStocks.id) suppliersCount
      FROM products
      INNER JOIN variants ON variants.productId = products.id AND variants.deletedAt IS NULL
      LEFT OUTER JOIN supplierStocks ON supplierStocks.variantId = variants.id AND supplierStocks.deletedAt IS NULL
      WHERE products.deletedAt IS NULL
      GROUP BY products.id, products.name, products.price
    `)
  }

  getVariantsWithSupplierCount (productId: number) {
    if (!productId) {
      return Promise.reject({ status: false, errMessage: 'productId is required!' })
    } else {
      return super.rawReadQuery(`
        SELECT variants.productId productId, variants.id id, variants.name name,
               MAX(variants.createdAt) createdAt,
               MAX(variants.updatedAt) updatedAt, COUNT(supplierStocks.id) suppliersCount
        FROM variants
        LEFT OUTER JOIN supplierStocks ON supplierStocks.variantId = variants.id AND supplierStocks.deletedAt IS NULL
        WHERE variants.deletedAt IS NULL AND variants.productId = ${productId}
        GROUP BY variants.productId, variants.id, variants.name
      `)
    }
  }

  getSupplierStock (supplierId: number) {
    return this.rawReadQuery(`
      SELECT * FROM supplierStocksView WHERE supplierId = ${supplierId}
    `)
  }

  addSupplierStock ({ supplierId, variantId, price }) {
    return this.create<SupplierStock>('SupplierStock', {
      supplierId,
      variantId,
      price
    })
  }

  // TODO: This should be of shopifiedProductsView instead of product table
  getPromotion (shopId): Promise<NCResponse<ShopifiedPromotion[]>> {
    return super.rawReadQuery(`SELECT * FROM shopifiedPromotionsView WHERE shopId = ${shopId}`)
  }
}

export default new ShopService()
