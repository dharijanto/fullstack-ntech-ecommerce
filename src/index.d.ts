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
  productId: number
}

interface Picture extends BaseModel {
  url: string
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
