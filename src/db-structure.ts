import * as Sequelize from 'sequelize'

export default function addTables (sequelize: Sequelize.Sequelize, models: Sequelize.Models) {
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

  models.Product = sequelize.define('product', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false },
    price: { type: Sequelize.INTEGER },
    description: { type: Sequelize.TEXT }
  }, {
    indexes: [
      { fields: ['subCategoryId', 'name'], unique: true }
    ]
  })
  models.Product.belongsTo(models.SubCategory)

  models.Variant = sequelize.define('variant', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, unique: true, allowNull: false }
  }, {
    indexes: [
      { fields: ['productId', 'name'], unique: true }
    ]
  })
  models.Variant.belongsTo(models.Product)

  models.Picture = sequelize.define('picture', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    url: { type: Sequelize.STRING }
  })
  models.Variant.hasMany(models.Picture)

  models.Supplier = sequelize.define('supplier', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING , allowNull: false },
    location: { type: Sequelize.STRING, allowNull: false },
    city: { type: Sequelize.STRING },
    pickup: { type: Sequelize.BOOLEAN },
    courier: { type: Sequelize.BOOLEAN }
  })

  models.Shop = sequelize.define('shop', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false },
    city: { type: Sequelize.STRING },
    address: { type: Sequelize.STRING },
    zipCode: { type: Sequelize.INTEGER }
  })

  models.Stock = sequelize.define('stock', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    quantity: { type: Sequelize.INTEGER },
    purchasePrice: { type: Sequelize.INTEGER }
  })

  models.Stock.belongsTo(models.Variant)

  models.Transaction = sequelize.define('transaction', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    quantity: { type: Sequelize.INTEGER }
  })

  models.Transaction.belongsTo(models.Variant)
  models.Stock.belongsTo(models.Variant)

  return models
}

module.exports = addTables
