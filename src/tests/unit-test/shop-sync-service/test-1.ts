import * as path from 'path'
import * as assert from 'assert'
import * as process from 'process'

import * as Sequelize from 'sequelize'
import * as moment from 'moment'
import * as Promise from 'bluebird'
import * as pretry from 'bluebird-retry'

import * as AppConfig from '../../../app-config'
import SequelizeService from '../../../services/sequelize-service'
import CRUDService from '../../classes/crud-service'
import CloudSyncService from '../../classes/cloud-sync-service'
import ShopSyncService from '../../classes/shop-sync-service'
import ShopService from '../../../services/shop-service'
import ProductService from '../../../services/product-service'
import { fstat, readFile } from 'fs'
const createModel = require(path.join('../../../db-structure'))

describe('Test CloudSyncservice', () => {
  let crud: CRUDService
  let ssService: ShopSyncService
  let csService: CloudSyncService
  before(done => {
    const sequelize = new Sequelize(AppConfig.TEST_SQL_DB, { logging: !!process.env.DEBUG_SQL, operatorsAliases: false })
    const models = createModel(sequelize, {})
    SequelizeService.initialize(sequelize, models)
    SequelizeService.getInstance().sequelize.sync().then(() => {
      crud = new CRUDService()
      ssService = new ShopSyncService()
      csService = new CloudSyncService()
      done()
    })
  })

  beforeEach(done => {
    crud.destroyAllTables().then(() => {
      ShopService.createShop({ name: 'My Shop 1' }).then(resp => {
        assert.ok('status' in resp)
        assert.ok(resp.status)
        done()
      })
    })
  })
  describe('Test sync state', () => {
    it('Test "Applying" state', done => {
      crud.getSequelize().transaction({ isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE }, trx => {
        return ssService.createCloudToLocalSyncHistory('Applying', '2019-09-09', trx).then(resp => {
          if (resp.status && resp.data) {
            assert.equal(resp.data.status, 'Applying')
            assert.equal(resp.data.untilTime, '2019-09-09')
            return ssService.getApplyingCloudToLocalSyncHistory(trx).then(resp => {
              if (resp.status && resp.data) {
                assert.equal(resp.data.status, 'Applying')
                assert.equal(resp.data.untilTime, '2019-09-09')
                return ssService.getLastSuccessfulCloudToLocalSyncHistory(trx).then(resp => {
                  assert.equal(resp.status, false, 'Unexpected response from getlastSuccessfulCloudToLocalSyncHistory()')
                  return
                })
              } else {
                throw new Error('Failed to getApplyingCloudToLocalSyncHistory(): ' + resp.errMessage)
              }
            })
          } else {
            throw new Error('Failed to createCloudToLocalSyncHistory(): ' + resp.errMessage)
          }
        })
      }).then(() => done()).catch(done)
    })

    it('Test "Success" state', function (done) {
      crud.getSequelize().transaction({ isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE }, trx => {
        return ssService.createCloudToLocalSyncHistory('Success', '2019-09-09', trx).then(resp => {
          if (resp.status && resp.data) {
            return ssService.getApplyingCloudToLocalSyncHistory(trx).then(resp => {
              if (resp.status && resp.data) {
                throw new Error('Unexpected response status from getApplyingCloudToLocalSyncHistory(): ' + JSON.stringify(resp))
              } else {
                return ssService.getLastSuccessfulCloudToLocalSyncHistory(trx).then(resp => {
                  if (resp.status && resp.data) {
                    assert.equal(resp.data.status, 'Success')
                    assert.equal(resp.data.untilTime, '2019-09-09')
                    return
                  } else {
                    throw new Error('Unexpected response from getLastSuccessfulCloudToLocalSyncHistory(): ' + resp.errMessage)
                  }
                })
              }
            })
          } else {
            throw new Error('Unexpected response status from createCloudToLocalSyncHistory()')
          }
        })
      }).then(() => {
        done()
      }).catch(err => {
        done(err)
      })
    })

    it('Test state update', done => {
      crud.getSequelize().transaction({ isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE }, trx => {
        return ssService.createCloudToLocalSyncHistory('Applying', '2019-09-09', trx).then(resp => {
          if (resp.status && resp.data) {
            const history = resp.data
            assert.equal(resp.data.status, 'Applying')
            assert.equal(resp.data.untilTime, '2019-09-09')
            return ssService.getApplyingCloudToLocalSyncHistory(trx).then(resp => {
              if (resp.status && resp.data) {
                assert.equal(resp.data.status, 'Applying')
                assert.equal(resp.data.untilTime, '2019-09-09')
                return ssService.getLastSuccessfulCloudToLocalSyncHistory(trx).then(resp => {
                  if (resp.status) {
                    throw new Error('Unexpected response from getLastSuccessfulCloudToLocalSyncHistory()')
                  } else {
                    return ssService.updateCloudToLocalSyncHistory(history.id, 'Success', 'Successfully updated!', trx).then(resp => {
                      if (resp.status) {
                        return ssService.getLastSuccessfulCloudToLocalSyncHistory(trx).then(resp => {
                          if (resp.status && resp.data) {
                            assert.equal(resp.data.status, 'Success')
                            assert.equal(resp.data.info, 'Successfully updated!')
                            assert.equal(resp.data.id, history.id)
                            return
                          } else {
                            throw new Error('Unexpected status from getLastSuccessfulCloudToLocalSyncHistory()!')
                          }
                        })
                      } else {
                        throw new Error('Failed to updateCloudToLocalSyncHistory(): ' + resp.errMessage)
                      }
                    })
                  }
                })
              } else {
                throw new Error('Failed to getApplyingCloudToLocalSyncHistory(): ' + resp.errMessage)
              }
            })
          } else {
            throw new Error('Failed to createCloudToLocalSyncHistory(): ' + resp.errMessage)
          }
        })
      }).then(() => done()).catch(done)
    })
  })

  describe('Test syncing', () => {
    beforeEach((done) => {
      ProductService.createCategory({ name: 'Komputer', description: '' }).then(resp => {
        if (resp.status && resp.data) {
          return Promise.join(
            ProductService.createSubCategory({ name: 'Mouse', categoryId: resp.data.id }),
            ProductService.createSubCategory({ name: 'Keyboard', categoryId: resp.data.id }),
            ProductService.createSubCategory({ name: 'Monitor', categoryId: resp.data.id })
          ).spread((resp1: NCResponse<any>, resp2, resp3) => {
            if (resp.status && resp.data && resp2.status && resp2.data && resp3.status && resp3.data) {
              const mouse = resp.data
              const keyboard = resp2.data
              const monitor = resp3.data
              return Promise.join(
                ProductService.createProduct({ subCategoryId: mouse.id, name: 'Logitech M135', price: 125000, warranty: '1 tahun' }),
                ProductService.createProduct({ subCategoryId: keyboard.id, name: 'Logitech TM220', price: 200000, warranty: '1 tahun' }),
                ProductService.createProduct({ subCategoryId: monitor.id, name: 'LG G240', price: 2500000, warranty: '2 tahun' }),
                ProductService.createProduct({ subCategoryId: monitor.id, name: 'MSI LM110', price: 4200000, warranty: '3 tahun' })
              ).then(results => {
                let lastUpdatedAt: string = ''
                for (let i = 0 ; i < results.length ; i++) {
                  const current = results[i]
                  if (current.status && current.data) {
                    if (!lastUpdatedAt || lastUpdatedAt < current.data.updatedAt) {
                      lastUpdatedAt = current.data.updatedAt
                    }
                  } else {
                    assert.fail('Failed to createProduct(): ' + results[i].errMessage)
                  }
                }
                return csService.createSyncHistory('My Shop 1', 'Preparing', '2017-01-01').then(resp => {
                  if (resp.status && resp.data) {
                    const syncHistory = resp.data
                    return csService.prepareData('My Shop 1', '2017-01-01', lastUpdatedAt, resp.data.id).then(resp => {
                      // Wait until data's been prepared
                      function getState () {
                        return csService.getSyncHistory('My Shop 1', lastUpdatedAt).then(resp => {
                          if (resp.status && resp.data && resp.data.status === 'Success') {
                            return
                          } else {
                            throw new Error('Not yet finished!')
                          }
                        })
                      }

                      // After 5 seconds, prepareData() should've completed
                      return pretry(getState, { interval: 1000, max_tries: 5 })
                    })
                  } else {
                    throw new Error('Failed to createSyncHistory(): ' + resp.errMessage)
                  }
                })
              })
            } else {
              throw new Error('Failed to createSubCategory(): resp' + JSON.stringify(resp))
            }
          })
        } else {
          throw new Error('Failed to createCategory(): resp' + JSON.stringify(resp))
        }
      }).then(() => {
        done()
      }).catch(done)
    })

    it('Test retrieveAndApplyCloudToLocalData()', done => {
      crud.getModels('Product').destroy({ where: {} }).then(() => {
        return crud.getModels('SubCategory').destroy({ where: {} })
      }).then(() => {
        return crud.getModels('Category').destroy({ where: {} })
      }).then(() => {
        const now = moment().format('YYYY-MM-DD HH:mm:ss')
        return csService.getSyncHistory('My Shop 1', '2017-01-01').then(resp => {
          if (resp.status && resp.data) {
            const syncFileName = resp.data.fileName || ''
            if (resp.data.status !== 'Success') {
              throw new Error('getSyncHistory() return non success status: ' + resp.data.status)
            } else {
              const jsonResolver = (filename) => {
                console.log('jsonResolver(): filename=' + path.join(`${AppConfig.GENERATED_CLOUD_SYNC_DATA}`, filename))
                const readFileAsync = Promise.promisify(readFile)
                return readFileAsync(path.join(`${AppConfig.GENERATED_CLOUD_SYNC_DATA}`, filename)).then(data => {
                  return JSON.parse(data.toString())
                })
              }
              return ssService.retrieveAndApplyCloudToLocalData(syncFileName, now, jsonResolver).then(resp => {
                if (resp.status && resp.data) {
                  const id = resp.data.id
                  assert.equal(resp.data.status, 'Applying')
                  const retry = () => {
                    return Promise.join(
                      ssService.getLastSuccessfulCloudToLocalSyncHistory(),
                      ssService.getLastFailedCloudToLocalSyncHistory()
                    ).spread((resp: NCResponse<CloudToLocalSyncHistory>, resp2) => {
                      if (resp2.status && resp2.data) {
                        throw new Error('Fauled to retrieveAndApplyCloudToLocalData(): ' + resp2.data.info)
                      }
                      if (resp.status && resp.data) {
                        if (resp.data.id === id) {
                          return resp
                        } else {
                          console.error('last getLastSuccessfulCloudToLocalSyncHistory() returns different id: ' + resp.data.id)
                          throw new Error('last getLastSuccessfulCloudToLocalSyncHistory() returns different id: ' + resp.data.id)
                        }
                      } else {
                        console.error('Failed to getLastSuccessfulCloudToLocalSyncHistory(): ' + resp.errMessage)
                        throw new Error('Failed to getLastSuccessfulCloudToLocalSyncHistory(): ' + resp.errMessage)
                      }
                    })
                  }
                  return Promise.delay(500).then(() => retry()).then(resp => {
                    return Promise.join(
                      crud.getModels('Category').findAll(),
                      crud.getModels('SubCategory').findAll(),
                      crud.getModels('Product').findAll()
                    ).spread((data: any[], data2, data3) => {
                      assert(data.length === 1, 'Unexpected number of categories: ' + data.length)
                      assert(data2.length === 3, 'Unexpected number of subCategories: ' + data2.length)
                      assert(data3.length === 4, 'Unexpected number of products: ' + data3.length)
                      return
                    })
                  })
                } else {
                  throw new Error('Failed to retrieveAndApplyCloudToLocalData(): ' + resp.errMessage)
                }
              })
            }
          } else {
            throw new Error('Failed to getSyncHistory(): ' + resp.errMessage)
          }
        }).then(() => {
          done()
        }).catch(err => {
          done(err)
        })
      })
      // done()
    })

    // TODO: Test prepare data lastSyncTime and untilTime
  })

  after(done => {
    SequelizeService.getInstance().close()
    done()
  })

})
