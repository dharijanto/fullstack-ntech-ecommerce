interface NCResponse<T> {
  status: boolean,
  data?: T,
  errMessage?: string
  errCode?: number
}

/* type NCResponse<T> = NCSuccessResponse<T> | NCFailedResponse

interface NCSuccessResponse<T> {
  status: true,
  data: T
}

interface NCFailedResponse {
  status: false,
  errMessage: string
  errCode?: number
} */

/*
-------------------------------------------------------------------------------
Sequelize Model. Should not add anything else other than what could come from:
1. Single table query
2. Join query

For anything else, please define a new interface!
-------------------------------------------------------------------------------
*/
interface BaseModel {
  id: number,
  createdAt: string,
  updatedAt: string,
  deletedAt?: string
}


// ---- Start of cloud-exclusive tables ---
// ----------------------------------------
/*
The following are tables that are read-only on the cloud server.
*/

interface Image extends BaseModel {
  filename: string
}

interface Category extends BaseModel {
  name: string
  description: string
}

interface SubCategory extends BaseModel {
  name: string
  description: string
  categoryId: number
  category: Category
  imageFilename: string
}

interface Product extends BaseModel {
  name: string
  price: number
  weight: number
  notes: string
  warranty: string
  description: string
  subCategoryId: number
  subCategory: SubCategory
  variants: Variant[]
  productImages: ProductImage[]
  shopProducts?: ShopProduct[]
}

interface Variant extends BaseModel {
  name: string
  productId: number,
  product?: Product,
  supplierStocks?: SupplierStock[]
  shopStocks?: ShopStock[]
  orderDetails?: OrderDetail[]
}

interface ProductImage extends BaseModel {
  imageFilename: string
  productId: number
  primary?: boolean
}

// TODO: Add foreign key ids
interface Supplier extends BaseModel {
  location: string,
  city: string,
  pickup: boolean,
  courier: boolean
}

interface Shop extends BaseModel {
  name: string,
  city: string,
  address: string,
  zipCode: number
}

interface Stock extends BaseModel {
  quantity: number
  purchasePrice: number
}

interface Shop extends BaseModel {
  name: string,
  location: string,
  city: string,
  address: string,
  zipCode: number
}

interface ShopStockBST extends BaseModel {
  shopId: number
  date: string,
  description: string
}

interface ShopStock extends BaseModel {
  shopId: number
  shopStockBSTId: number
  variantId: number
  quantity: number
  price: number
  aisle: string
  date: string
  variant?: Variant
}

interface Aisle extends BaseModel {
  shopId: number
  aisle: string
}

interface ShopProduct extends BaseModel {
  price: number
  preOrderAllowed: boolean
  preOrderDuration: number
  disabled: boolean
  productId: number
  shopId: number
}

interface Supplier extends BaseModel {
  name: string,
  location: string,
  address: string,
  city: string,
  zipCode: number,
  pickup: boolean,
  online: boolean
}

interface SupplierStock extends BaseModel {
  price: number,
  supplierId: number,
  variantId: number
  date: string
  variant?: Variant,
}

interface Promotion extends BaseModel {
  product?: Product
  shopId: number
  productId: number
  imageFilename: string
}

interface User extends BaseModel {
  username: string
  password?: string
  confirmPassword?: string
  salt?: string
  saltedPass?: string
  fullName: string
  privilege: ['Admin', 'Cashier', 'Opnamer']
  shopId: number
}

type CloudSyncStatus = 'Preparing' | 'Success' | 'Failed'
interface CloudSyncHistory extends BaseModel {
  status: CloudSyncStatus
  info?: string
  shopName: string
  sinceTime: string
  untilTime: string,
  fileName?: string
}
// ----------------------------------------
// ---- End of cloud-exclusive tables ---


// ---- Start of local-exclusive tables ---
// ----------------------------------------
/*
The following are tables that are read-only on the local server.
 */
interface Order extends BaseModel {
  fullName: string,
  phoneNumber: string
  notes: string,
  quantity: number,
  price: number,
  status: 'Open' | 'Close' | 'PO' | 'Cancelled',
  shopId: number
}

interface OrderDetail extends BaseModel {
  quantity: number
  price: number
  status: 'PO' | 'Ready'
  aisle: string
  preOrderDuration: number
  orderId: number
  productName: string
  variantName: string
  variantId: number
  variant?: Variant
  productId: number
}

/* interface ShopSyncState extends BaseModel {
  state: 'Syncing' | 'Success' | 'Failed',
  timeUntil: string
  description: string
} */

interface CloudToLocalSyncHistory extends BaseModel {
  status: 'Preparing' | 'Applying' | 'Success' | 'Failed'
  info: string
  untilTime: string
}

// ----------------------------------------
// ---- End of local-exclusive tables ---

// ---- Start of both local and cloud tables ---
// ----------------------------------------

interface Analytics extends BaseModel {
  key: string
  value: string
  categoryId?: number
  subCategoryId?: number
  productId?: number
  variantId?: number
}

// ----------------------------------------
// ---- End of local-exclusive tables ---


//-------------------------------------------------------------------------------
// ---------------Start of model that comes from SQL views-----------------------
// ---------------(created in services/sql-view-service.ts)----------------------
interface ShopifiedProduct extends BaseModel {
  subCategoryId: number
  subCategoryName: string
  categoryId: number
  categoryName: string
  name: string,
  description: string,
  warranty: string,
  defaultPrice: number,
  // The following can be null as they come from LEFT OUTER JOIN between Product and
  // respective table. This is intentional because we want to be able to manage
  // them in CMS
  shopId?: number,
  stockQuantity: number,
  allTimeStocks: number,
  allTimeOrders: number,
  allTimePOOrders: number,
  supplierCount: number,
  shopPrice: number,
  preOrderAllowed: boolean,
  preOrderDuration: number,
  disabled: boolean
}

interface ShopifiedVariant extends BaseModel {
  productId: number,
  shopId: number,
  name: string,
  stockQuantity: number,
  allTimeStocks: number,
  allTimeOrders: number,
  allTimePOOrders: number,
  supplierCount: number
}

interface ShopifiedPromotion extends BaseModel {
  productId: number
  imageFilename: string
  productName: string
  productPrice: number
  subCategoryId: number
  subCategoryName: string
  categoryId: number
  categoryName: string
}

interface InStockProduct extends BaseModel {
  subCategoryId: number
  subCategoryName: string
  categoryId: number
  categoryName: string
  shopId: number,
  name: string,
  description: string,
  warranty: string,
  price: number,
  weight: number,
  stockQuantity: number,
  variants?: InStockVariant[]
  subCategory?: SubCategory
  images?: ProductImage[]
  primaryImage?: ProductImage
  updatedAt: string
}

interface InStockVariant extends BaseModel {
  shopId: number,
  productId: number,
  name: string,
  stockQuantity: number
}

interface POProduct extends BaseModel {
  subCategoryId: number
  subCategoryName: string
  categoryId: number
  categoryName: string
  shopId: number,
  name: string,
  description: string,
  warranty: string,
  price: number,
  weight: number,
  preOrderDuration: number
  variants?: POVariant[]
  subCategory?: SubCategory
  images?: ProductImage[]
  primaryImage?: ProductImage
  updatedAt: string
}

interface POVariant extends BaseModel {
  shopId: number
  productId: number,
  name: string
}
//-------------------------------------------------------------------------------
// ---------------End of model that comes from SQL views-------------------------