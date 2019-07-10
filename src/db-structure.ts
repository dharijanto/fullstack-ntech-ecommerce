import * as Sequelize from 'sequelize'

function addTables (sequelize: Sequelize.Sequelize, models: Sequelize.Models) {
  /*
    ----------------------------
      Cloud-specific Database
      Local shop shouldn't modify the following tables at all, due to synchronization purposes!
    ----------------------------
   */
  models.Image = sequelize.define('image', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    filename: { type: sequelize.Sequelize.STRING, unique: true }
  }, {
    paranoid: true
  })

  models.Category = sequelize.define('category', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false, validate: { len: [1, 255] } },
    description: { type: Sequelize.STRING }
  }, {
    paranoid: true
  })

  models.SubCategory = sequelize.define('subCategory', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false },
    description: { type: Sequelize.STRING }
  }, {
    paranoid: true
  })
  models.SubCategory.belongsTo(models.Category)
  models.SubCategory.belongsTo(models.Image, { targetKey: 'filename', foreignKey: 'imageFilename' })
  models.Category.hasMany(models.SubCategory)

  models.Product = sequelize.define('product', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false },
    price: { type: Sequelize.INTEGER },
    // In gram
    weight: { type: Sequelize.INTEGER, defaultValue: 500 },
    notes: { type: Sequelize.TEXT },
    warranty: { type: Sequelize.STRING },
    description: { type: Sequelize.TEXT('long') }
  }, {
    paranoid: true
  })
  models.Product.belongsTo(models.SubCategory)

  models.Variant = sequelize.define('variant', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false }
  }, {
    /* indexes: [
      { fields: ['productId', 'name'], unique: true }
    ], */
    paranoid: true
  })
  models.Variant.belongsTo(models.Product)
  models.Product.hasMany(models.Variant)

  models.ProductImage = sequelize.define('productImages', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    primary: { type: Sequelize.BOOLEAN }
  }, {
    indexes: [
      // { fields: ['productId', 'imageFilename'], unique: true }
    ],
    paranoid: true
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
  }, {
    paranoid: true
  })

  models.SupplierStock = sequelize.define('supplierStock', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    price: { type: Sequelize.INTEGER },
    date: { type: Sequelize.DATE }
  }, {
    indexes: [
      // { fields: ['supplierId', 'variantId'], unique: true }
    ],
    paranoid: true
  })

  models.SupplierStock.belongsTo(models.Supplier)
  models.SupplierStock.belongsTo(models.Variant)
  models.Variant.hasMany(models.SupplierStock)

  models.Shop = sequelize.define('shop', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING, allowNull: false },
    location: { type: Sequelize.STRING },
    city: { type: Sequelize.STRING },
    address: { type: Sequelize.STRING },
    zipCode: { type: Sequelize.INTEGER }
  }, {
    paranoid: true
  })

  models.Promotion = sequelize.define('promotion', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.STRING }
  }, {
    paranoid: true
  })
  models.Promotion.belongsTo(models.Shop)
  models.Promotion.belongsTo(models.Product)

  // Used for mapping map local-to-cloud id
  models.SyncMap = sequelize.define('syncMap', {
    shopName: { type: Sequelize.STRING }, // Identify which school
    serverHash: { type: Sequelize.STRING }, // Identify which version of local server
    localId: { type: Sequelize.INTEGER },
    cloudId: { type: Sequelize.INTEGER },
    tableName: { type: Sequelize.STRING }
  })

  models.ShopSyncHistory = sequelize.define('shopSyncHistory', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    status: { type: Sequelize.ENUM(['Syncing', 'Success', 'Failed']) },
    shopName: { type: Sequelize.STRING },
    // Date of last synchronization. Intentionally STRING type instead of DATE
    // because we're storing local server's date, not ours. And to avoid confusion
    // with timezone conversion, STRING is way easier to work with in this case
    untilTime: { type: Sequelize.STRING }
  })

  // When there's a request for cloud-to-local sync, cloud server
  // prepares a data fulfills the required sinceTime and untilTime.
  // Those data are saved here so that subsequent redundant request
  // don't have to be re-computed.
  models.CloudSyncHistory = sequelize.define('cloudSyncHistory', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    status: { type: Sequelize.ENUM(['Preparing', 'Success', 'Failed']) },
    shopName: { type: Sequelize.STRING },
    info: { type: Sequelize.STRING },
    // Date of last synchronization. Intentionally STRING type instead of DATE
    // because we're storing local server's date, not ours. And to avoid confusion
    // with timezone conversion, STRING is way easier to work with in this case
    sinceTime: { type: Sequelize.STRING },
    untilTime: { type: Sequelize.STRING },
    fileName: { type: Sequelize.STRING }
  })

  /*
  ----------------------------
  End of Cloud-only database
  ----------------------------
  */

  /*
  ----------------------------
    Local-shop specific Database
    Cloud shouldn't modify the following tables at all, due to synchronization purposes!
  ----------------------------
  */

  // No need to sync this table
  models.User = sequelize.define('user', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: Sequelize.STRING }, // The pair of (username, schoolId) should be unique, we should use MySQL composite key for this
    saltedPass: { type: Sequelize.STRING },
    salt: { type: Sequelize.STRING },
    fullName: { type: Sequelize.STRING },
    privilege: { type: Sequelize.ENUM, values: ['Admin', 'Cashier', 'Opnamer'], allowNull: false }
  }, {
    paranoid: true
  })
  models.User.belongsTo(models.Shop)

  models.ShopStockBST = sequelize.define('shopStockBST', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    description: { type: Sequelize.STRING },
    date: { type: Sequelize.DATE },
    onCloud: { type: Sequelize.BOOLEAN, defaultValue: true }
  }, {
    paranoid: true
  })
  models.ShopStockBST.belongsTo(models.Shop)

  models.ShopStock = sequelize.define('shopStock', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    price: { type: Sequelize.INTEGER }, // purchase price, not sell price
    date: { type: Sequelize.DATE },
    aisle: { type: Sequelize.STRING, allowNull: false },
    quantity: { type: Sequelize.INTEGER },
    onCloud: { type: Sequelize.BOOLEAN, defaultValue: true }
  }, {
    paranoid: true
  })
  models.ShopStock.belongsTo(models.ShopStockBST)
  models.ShopStock.belongsTo(models.Shop)
  models.ShopStock.belongsTo(models.Variant)
  models.Variant.hasMany(models.ShopStock)

  // No need to sync this table
  models.ShopAisle = sequelize.define('shopAisle', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    aisle: { type: Sequelize.STRING, allowNull: false, unique: true }
  })
  models.ShopAisle.belongsTo(models.Shop)

  models.ShopProduct = sequelize.define('shopProduct', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    price: { type: Sequelize.INTEGER }, // sell price. If unset, use product.price
    preOrderAllowed: { type: Sequelize.BOOLEAN },
    preOrderDuration: { type: Sequelize.INTEGER },
    disabled: { type: Sequelize.BOOLEAN, defaultValue: false }, // when enabled, the item is not sold on the store
    onCloud: { type: Sequelize.BOOLEAN, defaultValue: true }
  }, {
    paranoid: true
  })
  models.ShopProduct.belongsTo(models.Product)
  models.ShopProduct.belongsTo(models.Shop)
  models.Product.hasMany(models.ShopProduct)

  models.Order = sequelize.define('order', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    fullName: { type: Sequelize.STRING },
    phoneNumber: { type: Sequelize.STRING },
    status: { type: Sequelize.ENUM(['Open', 'Close', 'PO', 'Cancelled']) },
    notes: Sequelize.STRING,
    onCloud: { type: Sequelize.BOOLEAN, defaultValue: true }
  }, {
    paranoid: true
  })
  models.Order.belongsTo(models.Shop)

  models.OrderDetail = sequelize.define('orderDetail', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    quantity: { type: Sequelize.INTEGER, allowNull: false },
    aisle: { type: Sequelize.STRING },
    price: { type: Sequelize.INTEGER, allowNull: false },
    status: { type: Sequelize.ENUM(['PO', 'Ready']) },
    onCloud: { type: Sequelize.BOOLEAN, defaultValue: true }
  }, {
    paranoid: true
  })

  models.OrderDetail.belongsTo(models.Variant)
  models.OrderDetail.belongsTo(models.Order)
  models.Variant.hasMany(models.OrderDetail)

  models.Analytics = sequelize.define('analytics', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    key: { type: Sequelize.STRING },
    value: { type: Sequelize.STRING },
    categoryId: { type: Sequelize.INTEGER, allowNull: true },
    subCategoryId: { type: Sequelize.INTEGER, allowNull: true },
    productId: { type: Sequelize.INTEGER, allowNull: true },
    variantId: { type: Sequelize.INTEGER, allowNull: true }
  })

  // Not synced to the cloud
  // Currently used to create a hash for a local server.
  // When we try to sync local-to-cloud, we send this hash to tell the server
  // which mapping table should be used. This is needed when for example a local
  // server got stolen and we have to replace it. Since the database is brand new
  // the ids are different and hence the old mapping table is not applicable
  models.LocalMetaData = sequelize.define('localMetaData', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    key: { type: Sequelize.STRING, unique: true },
    value: { type: Sequelize.STRING }
  })

  // Local-to-cloud sync histories
  models.ShopSyncState = sequelize.define('shopSyncState', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    status: { type: Sequelize.ENUM(['Syncing', 'Success', 'Failed']) },
    description: { type: Sequelize.STRING },
    timeUntil: { type: Sequelize.STRING }
  })

  // Cloud-to-local sync histories
  models.CloudToLocalSyncHistory = sequelize.define('cloudToLocalSyncHistory', {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    status: { type: Sequelize.ENUM(['Preparing', 'Applying', 'Success', 'Failed']) },
    info: { type: Sequelize.TEXT('long') }, // error message, would be stored here
    untilTime: { type: Sequelize.STRING }
  })

  /*
  ----------------------------
    End of local-only database
  ----------------------------
  */
  return models
}

// module.exports = addTables
export = addTables
