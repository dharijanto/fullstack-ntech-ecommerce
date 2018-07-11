interface NCResponse<T> {
  status: boolean,
  data?: T,
  errMessage?: string
  errCode?: number
}

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
  description: string,
  categoryId: number
}

interface Product extends BaseModel {
  name: string
  price: number,
  description: string
  subCategoryId: number
}

interface Variant extends BaseModel {
  name: string
  productId: number,
  product?: Product
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