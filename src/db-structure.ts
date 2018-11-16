import * as Sequelize from 'sequelize'

export default function addTables (sequelize: Sequelize.Sequelize, models: Sequelize.Models) {
  /*
    ----------------------------
      Cloud-specific Database
      Local shop shouldn't modify the following tables at all!
    ----------------------------
   */
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
      { fields: ['supplierId', 'variantId'], unique: true }
    ]
  })

  models.SupplierStock.belongsTo(models.Supplier)
  models.SupplierStock.belongsTo(models.Variant)
  models.Variant.hasMany(models.SupplierStock)

  models.Shop = sequelize.define('shop', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false, unique: true },
    location: { type: Sequelize.STRING },
    city: { type: Sequelize.STRING },
    address: { type: Sequelize.STRING },
    zipCode: { type: Sequelize.INTEGER }
  })
  /*
  ----------------------------
  End of Cloud-only database
  ----------------------------
  */

  /*
  ----------------------------
    Local-shop specific Database
    Cloud shouldn't modify the following tables at all!
  ----------------------------
  */
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
    preOrderAllowed: { type: Sequelize.BOOLEAN },
    preOrderDuration: { type: Sequelize.INTEGER },
    disabled: { type: Sequelize.BOOLEAN, defaultValue: false } // when enabled, the item is not sold on the store
  })
  models.ShopProduct.belongsTo(models.Product)
  models.ShopProduct.belongsTo(models.Shop)
  models.Product.hasMany(models.ShopProduct)

  models.Promotion = sequelize.define('promotion', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING }
  })
  models.Promotion.belongsTo(models.Shop)
  models.Promotion.belongsTo(models.Product)
  models.Promotion.belongsTo(models.Image, { targetKey: 'filename', foreignKey: 'imageFilename' })

  models.Order = sequelize.define('order', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    fullName: { type: Sequelize.STRING },
    phoneNumber: { type: Sequelize.STRING },
    status: { type: Sequelize.ENUM(['Open', 'Close', 'PO']) },
    notes: Sequelize.STRING
  }, {
    paranoid: true
  })
  models.Order.belongsTo(models.Shop)

  models.OrderDetail = sequelize.define('orderDetail', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    quantity: { type: Sequelize.INTEGER, allowNull: false },
    price: { type: Sequelize.INTEGER, allowNull: false },
    status: { type: Sequelize.ENUM(['PO', 'Ready']) }
  }, {
    paranoid: true
  })

  models.User = sequelize.define('user', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: Sequelize.STRING }, // The pair of (username, schoolId) should be unique, we should use MySQL composite key for this
    saltedPass: { type: Sequelize.STRING },
    salt: { type: Sequelize.STRING },
    fullName: { type: Sequelize.STRING },
    privilege: { type: Sequelize.ENUM, values: ['Admin', 'Cashier', 'Opnamer'], allowNull: false }
  })
  models.User.belongsTo(models.Shop)
  models.OrderDetail.belongsTo(models.Variant)
  models.OrderDetail.belongsTo(models.Order)
  models.Variant.hasMany(models.OrderDetail)
  /*
  ----------------------------
    End of local-only database
  ----------------------------
  */
  return models
}

module.exports = addTables
