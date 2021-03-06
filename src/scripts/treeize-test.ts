import * as Utils from '../libs/utils'
import * as util from 'util'
import * as Treeize from 'treeize'

const flatArray = [
  { id: 4,
    shopId: 1,
    name: 'SanDisk Cruzer 32GB',
    description: 'inStockProductsView.description',
    warranty: null,
    price: 165000,
    stockQuantity: '5',
    'primaryImage.imageFilename': '1532682092960_1.png',
    'primaryImage.productId': 4,
    'images.imageFilename': '1532682092960_1.png',
    'images.productId': 4,
    'subCategory.id': 1,
    'subCategory.name': 'Flash Drive',
    'subCategory.description': '',
    'subCategory.categoryId': 1,
    'subCategory.imageFilename': '1532656377590_category-flash-drive.png',
    'subCategory.category.id': 1,
    'subCategory.category.name': 'Aksesoris Komputer',
    'subCategory.category.description': '',
    'variants.id': 9,
    'variants.shopId': 1,
    'variants.productId': 4,
    'variants.name': 'Hitam',
    'variants.stockQuantity': '5' },
  { id: 4,
    shopId: 1,
    name: 'SanDisk Cruzer 32GB',
    description: 'inStockProductsView.description',
    warranty: null,
    price: 165000,
    stockQuantity: '5',
    'primaryImage.imageFilename': '1532682092960_1.png',
    'primaryImage.productId': 4,
    'images.imageFilename': '1532682113935_2.png',
    'images.productId': 4,
    'subCategory.id': 1,
    'subCategory.name': 'Flash Drive',
    'subCategory.description': '',
    'subCategory.categoryId': 1,
    'subCategory.imageFilename': '1532656377590_category-flash-drive.png',
    'subCategory.category.id': 1,
    'subCategory.category.name': 'Aksesoris Komputer',
    'subCategory.category.description': '',
    'variants.id': 9,
    'variants.shopId': 1,
    'variants.productId': 4,
    'variants.name': 'Hitam',
    'variants.stockQuantity': '5' }]

function objectify (flatArray) {
  const tree = new Treeize()
  tree.setOptions({
    input: {
      delimiter: '.'
    },
    output: {
      prune: true
    }
  })
  const result = tree.grow(flatArray).getData()
  return result
}

const result = objectify(flatArray)
console.log(util.inspect(flatArray, false, null, true))
console.log(util.inspect(result, false, null, true))

/* const result = flatToNested.convert(data)
console.log(util.inspect(data, false, null, true))
console.log(util.inspect(result, false, null, true))
 */