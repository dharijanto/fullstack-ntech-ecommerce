import * as Sequelize from 'sequelize'

export default function addTables (sequelize: Sequelize.Sequelize, models: Sequelize.Models) {
  models.Category = sequelize.define('Category', {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: Sequelize.STRING, unique: true},
    description: {type: Sequelize.STRING}
  })

  models.SubCategory = sequelize.define<SubCategory, SubCategory>('SubCategory', {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: Sequelize.STRING, unique: true},
    description: {type: Sequelize.STRING}
  })
  models.SubCategory.belongsTo(models.Category)

  models.Product = sequelize.define('Product', {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: Sequelize.STRING, unique: true},
    price: {type: Sequelize.INTEGER},
    description: {type: Sequelize.TEXT}
  })

  models.Variant = sequelize.define('Variant', {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: Sequelize.STRING, unique: true}
  })
  models.Variant.belongsTo(models.Product)

  models.Picture = sequelize.define('Picture', {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    url: {type: Sequelize.STRING}
  })
  models.Variant.hasMany(models.Picture)

  models.Supplier = sequelize.define('Supplier', {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    location: {type: Sequelize.STRING},
    city: {type: Sequelize.STRING},
    pickup: {type: Sequelize.BOOLEAN},
    courier: {type: Sequelize.BOOLEAN}
  })

  models.Shop = sequelize.define('Shop', {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: Sequelize.STRING},
    city: {type: Sequelize.STRING},
    address: {type: Sequelize.STRING},
    zipCode: {type: Sequelize.INTEGER},
  })

  models.Stock = sequelize.define('Stock', {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    quantity: {type: Sequelize.INTEGER},
    purchasePrice: {type: Sequelize.INTEGER}
  })

  models.Stock.belongsTo(models.Variant)

  models.Transaction = sequelize.define('Transaction', {
    id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
    quantity: {type: Sequelize.INTEGER}
  })

  models.Transaction.belongsTo(models.Variant)
  models.Stock.belongsTo(models.Variant)

  return models
}

module.exports = addTables