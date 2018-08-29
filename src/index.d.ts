declare enum OrderStatus {
  Open = 'Open',
  Close = 'Close',
  PendingPO = 'Pending PO'
}

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
  category?: Category
  imageFilename: string
}

interface Product extends BaseModel {
  name: string
  price: number
  warranty: string
  description: string
  subCategoryId: number
  subCategory?: SubCategory
  variants?: Variant[]
  productImages?: ProductImage[]
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
  preOrder: boolean
  poLength: number
  disable: boolean
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

interface OrderDetail extends BaseModel {
  quantity: number
  price: number
  po: boolean
}

/*
-------------------------------------------------------------------------------
-------------------------------------------------------------------------------
*/