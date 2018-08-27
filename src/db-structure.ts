import * as Sequelize from 'sequelize'

export default function addTables (sequelize: Sequelize.Sequelize, models: Sequelize.Models) {
  models.Image = sequelize.define('image', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    filename: { type: sequelize.Sequelize.STRING, unique: true }
  })

  models.Category = sequelize.define('category', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, unique: true, allowNull: false, validate: { len: [1, 255] } },
    description: { type: Sequelize.STRING }
  })

  models.SubCategory = sequelize.define<SubCategory, SubCategory>('subCategory', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false },
    description: { type: Sequelize.STRING }
  }, {
    indexes: [
      { fields: ['categoryId', 'name'], unique: true }
    ]
  })
  models.SubCategory.belongsTo(models.Category)
  models.SubCategory.belongsTo(models.Image, { targetKey: 'filename', foreignKey: 'imageFilename' })
  models.Category.hasMany(models.SubCategory)

  models.Product = sequelize.define('product', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false },
    price: { type: Sequelize.INTEGER },
    warranty: { type: Sequelize.STRING },
    description: { type: Sequelize.TEXT }
  }, {
    indexes: [
      { fields: ['subCategoryId', 'name'], unique: true }
    ]
  })
  models.Product.belongsTo(models.SubCategory)

  models.Variant = sequelize.define('variant', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false }
  }, {
    indexes: [
      { fields: ['productId', 'name'], unique: true }
    ]
  })
  models.Variant.belongsTo(models.Product)
  models.Product.hasMany(models.Variant)

  models.ProductImage = sequelize.define('productImages', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    primary: { type: Sequelize.BOOLEAN }
  }, {
    indexes: [
      { fields: ['productId', 'imageFilename'], unique: true }
    ]
  })
  models.ProductImage.belongsTo(models.Product)
  models.Product.hasMany(models.ProductImage)
  models.ProductImage.belongsTo(models.Image, { targetKey: 'filename', foreignKey: 'imageFilename' })

  models.Supplier = sequelize.define('supplier', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING , allowNull: false },
    location: { type: Sequelize.STRING, allowNull: true },
    address: { type: Sequelize.STRING, allowNull: true },
    city: { type: Sequelize.STRING },
    zipCode: { type: Sequelize.INTEGER },
    pickup: { type: Sequelize.BOOLEAN },
    online: { type: Sequelize.BOOLEAN }
  })

  models.SupplierStock = sequelize.define('supplierStock', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    price: { type: Sequelize.INTEGER },
    date: { type: Sequelize.DATE }
  }, {
    indexes: [
      { fields: ['supplierId', 'variantId'] }
    ]
  })

  models.SupplierStock.belongsTo(models.Supplier)
  models.SupplierStock.belongsTo(models.Variant)

  models.Shop = sequelize.define('shop', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false, unique: true },
    location: { type: Sequelize.STRING },
    city: { type: Sequelize.STRING },
    address: { type: Sequelize.STRING },
    zipCode: { type: Sequelize.INTEGER }
  })

  models.ShopStock = sequelize.define('shopStock', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    price: { type: Sequelize.INTEGER }, // purchase price, not sell price
    date: { type: Sequelize.DATE },
    quantity: { type: Sequelize.INTEGER }
  })
  models.ShopStock.belongsTo(models.Shop)
  models.ShopStock.belongsTo(models.Variant)
  models.Variant.hasMany(models.ShopStock)

  models.ShopProduct = sequelize.define('shopProduct', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    price: { type: Sequelize.INTEGER }, // sell price. If unset, use product.price
    preOrder: { type: Sequelize.BOOLEAN },
    poLength: { type: Sequelize.INTEGER },
    disable: { type: Sequelize.BOOLEAN, defaultValue: false } // when enabled, the item is not sold on the store
  })
  models.ShopProduct.belongsTo(models.Product)

  models.Promotion = sequelize.define('promotion', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true }
  })
  models.Promotion.belongsTo(models.Shop)
  models.Promotion.belongsTo(models.Product)
  models.Promotion.belongsTo(models.Image, { targetKey: 'filename', foreignKey: 'imageFilename' })

  models.Transaction = sequelize.define('transaction', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    quantity: { type: Sequelize.INTEGER },
    price: { type: Sequelize.INTEGER }
  })

  models.Transaction.belongsTo(models.Variant)

  return models
}

module.exports = addTables
