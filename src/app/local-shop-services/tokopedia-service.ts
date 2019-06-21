import CRUDService from '../../services/crud-service'
import xlsx from 'node-xlsx'
import * as htmlToText from 'html-to-text'
import ShopService from './local-shop-service'

class TokopediaService extends CRUDService {
  generatedExcel () {
    const rowHeader = [
      'Nama Produk',
      'Kategori',
      'Deskripsi Produk',
      'Harga (Dalam Rupiah)',
      'Berat (Dalam Gram)',
      'Pemesanan Minimum',
      'Status',
      'Jumlah Stok',
      'Etalase',
      'Preorder',
      'Waktu Proses Preorder',
      'Kondisi',
      'Gambar 1',
      'Gambar 2',
      'Gambar 3',
      'Gambar 4',
      'Gambar 5',
      'URL Video Produk 1',
      'URL Video Produk 2',
      'URL Video Produk 3'
    ]

    return ShopService.getInStockProducts({ pageSize: 1000, pageIndex: 0 }).then(resp => {
      if (resp.status && resp.data) {
        let data: any[] = resp.data.products.map(inStockProduct => {
          let primaryImageURL = inStockProduct.primaryImage && `http://ngizmo-ntech.nusantara-cloud.com/images/${inStockProduct.primaryImage.imageFilename}`
          return [
            inStockProduct.name.substring(0, 69), 36, htmlToText.fromString(inStockProduct.description), inStockProduct.price,
            '1000', 1, 'Stok Tersedia', inStockProduct.stockQuantity,
            inStockProduct.subCategory && inStockProduct.subCategory.category && inStockProduct.subCategory.category.name,
            '', '', 'Baru', primaryImageURL, '', '', '', '', '', '', ''
          ]
        })

        let buffer = xlsx.build([{ name: 'Template Impor Product', data: [ rowHeader ].concat(data) }], { })
        return { status: true, data: buffer }
      } else {
        return { status: false, errMessage: resp.errMessage }
      }
    })
  }
}

export default new TokopediaService()
