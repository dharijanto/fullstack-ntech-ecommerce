interface NCResponse<T> {
  status: boolean,
  data?: T,
  errMessage?: string
  errCode?: number
}

interface CommonModel {
  id: number,
  createdAt: string,
  updatedAt: string
}

interface Category extends CommonModel {
  name: string
  description: string
}

interface SubCategory extends CommonModel {
  name: string
  description: string,
  categoryId: number
}

interface Product extends CommonModel {
  name: string
  price: number,
  description: string
  subCategoryId: number
}

interface Variant extends CommonModel {
  name: string
  productId: number
}

interface Picture extends CommonModel {
  url: string
}

// TODO: Add foreign key ids
interface Supplier extends CommonModel {
  location: string,
  city: string,
  pickup: boolean,
  courier: boolean
}

interface Shop extends CommonModel {
  name: string,
  city: string,
  address: string,
  zipCode: number
}

interface Stock extends CommonModel {
  quantity: number
  purchasePrice: number
}

interface Transaction extends CommonModel {
  quantity: number
}