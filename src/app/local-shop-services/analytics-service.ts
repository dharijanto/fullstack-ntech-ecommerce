import * as path from 'path'

import * as Promise from 'bluebird'
import * as log from 'npmlog'

import * as AppConfig from '../../app-config'
import { CRUDService } from '../../services/crud-service'

const TAG = 'AnalyticsService'

/*
  Important Note:
    analytics has 'onCloud' column
    which indicate that the data is already on the cloud and we don't need to
    send them again when syncing.

    Remember to set the value properly!
*/
class AnalyticsService extends CRUDService {
  private addAnalytics (key: string, value: string, ids: { categoryId?: number, subCategoryId?, productId?: number, variantId?: number }) {
    const { categoryId, subCategoryId, productId, variantId } = ids
    return super.create<Analytics>('Analytics', { key, value, categoryId, subCategoryId, productId, variantId }).catch(err => {
      log.error(TAG, err)
      throw err
    })
  }

  searchQuery (query: string, categoryId?: number) {
    return this.addAnalytics('searchQuery', query, { categoryId })
  }

  categoryHovered (categoryId: number) {
    return this.addAnalytics('categoryHovered', '', { categoryId })
  }

  categoryClicked (categoryId: number) {
    return this.addAnalytics('categoryClicked', '', { categoryId })
  }

  subCategoryClicked (subCategoryId: number) {
    return this.addAnalytics('subCategoryClicked', '', { subCategoryId })
  }

  inStockProductClicked (productId: number) {
    return this.addAnalytics('inStockProductClicked', '', { productId })
  }

  poProductClicked (productId: number) {
    return this.addAnalytics('poProductClicked', '', { productId })
  }

  inStockProductCarted (variantId: number, quantity: number) {
    return this.addAnalytics('inStockProductCarted', quantity.toFixed(), { variantId })
  }

  poProductCarted (variantId: number, quantity: number) {
    return this.addAnalytics('poProductCarted', quantity.toFixed(), { variantId })
  }
}

export default new AnalyticsService()
