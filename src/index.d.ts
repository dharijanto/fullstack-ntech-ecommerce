interface NCResponse<T> {
  status: boolean,
  data?: T,
  errMessage?: string
  errCode?: number
}

/* interface NCResponseSuccess<T> {
  status: true
  data: T
}

interface NCResponseFailed {
  status: false
  errMessage: string
  errCode?: number
}

type NCResponse<T> = NCResponseSuccess<T> | NCResponseFailed */

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

interface Transaction extends BaseModel {
  quantity: number
}

interface Shop extends BaseModel {
  name: string,
  location: string,
  city: string,
  address: string,
  zipCode: number
}

interface ShopStock extends BaseModel {
  shopId: number
  variantId: number
  price: number
  quantity: number
  date: string
  variant?: Variant
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

/*
-------------------------------------------------------------------------------
-------------------------------------------------------------------------------
*/

/*
-------------------------------------------------------------------------------
Model that directly map to SQL views (created in services/sql-view-service.ts)
For anything else, please define a new interface!
-------------------------------------------------------------------------------
*/

interface ShopifiedProduct extends BaseModel {
  name: string,
  description: string,
  warranty: string,
  defaultPrice: number,
  // The following can be null as they come from LEFT OUTER JOIN between Product and
  // respective table. This is intentional because we want to be able to manage
  // them in CMS
  shopId?: number,
  stockQuantity: number,
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
  shopId: number,
  subCategoryId: number,
  name: string,
  description: string,
  warranty: string,
  price: number,
  stockQuantity: number,
  variants?: InStockVariant[]
  subCategory?: SubCategory
  images?: ProductImage[]
  primaryImage?: ProductImage[]
  updatedAt: string
}

interface InStockVariant extends BaseModel {
  shopId: number,
  productId: number,
  name: string,
  stockQuantity: number
}

interface POProduct extends BaseModel {
  shopId: number,
  name: string,
  description: string,
  warranty: string,
  price: number,
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
  preOrderDuration: number
  orderId: number
  productName: string
  variantName: string
  variantId: number
  variant?: Variant
  productId: number
}

/*
-------------------------------------------------------------------------------
-------------------------------------------------------------------------------
*/
