import * as path from 'path'
import * as assert from 'assert'
import * as process from 'process'

import * as Sequelize from 'sequelize'
import * as Promise from 'bluebird'

import * as AppConfig from '../../../app-config'
import SequelizeService from '../../../services/sequelize-service'
import CRUDService from '../../classes/crud-service'
import CloudSyncservice from '../../classes/cloud-sync-service'
import ShopSyncService from '../../classes/shop-sync-service'
import ShopService from '../../../services/shop-service'
import ProductService from '../../../services/product-service'
const createModel = require(path.join('../../../db-structure'))

describe('Test CloudSyncservice', () => {
  let crud: CRUDService
  let csService: ShopSyncService
  before(done => {
    const sequelize = new Sequelize(AppConfig.TEST_SQL_DB, { logging: !!process.env.DEBUG_SQL, operatorsAliases: false })
    const models = createModel(sequelize, {})
    SequelizeService.initialize(sequelize, models)
    SequelizeService.getInstance().sequelize.sync().then(() => {
      crud = new CRUDService()
      csService = new ShopSyncService()
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
        return csService.createCloudToLocalSyncHistory('Applying', '2019-09-09', trx).then(resp => {
          if (resp.status && resp.data) {
            assert.equal(resp.data.status, 'Applying')
            assert.equal(resp.data.untilTime, '2019-09-09')
            return csService.getApplyingCloudToLocalSyncHistory(trx).then(resp => {
              if (resp.status && resp.data) {
                assert.equal(resp.data.status, 'Applying')
                assert.equal(resp.data.untilTime, '2019-09-09')
                return csService.getLastSuccessfulCloudToLocalSyncHistory(trx).then(resp => {
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
        return csService.createCloudToLocalSyncHistory('Success', '2019-09-09', trx).then(resp => {
          if (resp.status && resp.data) {
            return csService.getApplyingCloudToLocalSyncHistory(trx).then(resp => {
              if (resp.status && resp.data) {
                throw new Error('Unexpected response status from getApplyingCloudToLocalSyncHistory(): ' + JSON.stringify(resp))
              } else {
                return csService.getLastSuccessfulCloudToLocalSyncHistory(trx).then(resp => {
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
        return csService.createCloudToLocalSyncHistory('Applying', '2019-09-09', trx).then(resp => {
          if (resp.status && resp.data) {
            const history = resp.data
            assert.equal(resp.data.status, 'Applying')
            assert.equal(resp.data.untilTime, '2019-09-09')
            return csService.getApplyingCloudToLocalSyncHistory(trx).then(resp => {
              if (resp.status && resp.data) {
                assert.equal(resp.data.status, 'Applying')
                assert.equal(resp.data.untilTime, '2019-09-09')
                return csService.getLastSuccessfulCloudToLocalSyncHistory(trx).then(resp => {
                  if (resp.status) {
                    throw new Error('Unexpected response from getLastSuccessfulCloudToLocalSyncHistory()')
                  } else {
                    return csService.updateCloudToLocalSyncHistory(history.id, 'Success', 'Successfully updated!', trx).then(resp => {
                      if (resp.status) {
                        return csService.getLastSuccessfulCloudToLocalSyncHistory(trx).then(resp => {
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
                const csService = new CloudSyncservice()
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

                      function rejectDelay (timeout, reason) {
                        return new Promise((resolve, reject) => {
                          setTimeout(() => {
                            reject(reason)
                          }, timeout)
                        })
                      }

                      // Wait for a while until data is prepared
                      let p = Promise.reject('Initial')
                      for (let i = 0 ; i < 10 ; i++) {
                        p = p.catch(() => {
                          return getState()
                        }).catch(err => {
                          return rejectDelay(200, err)
                        })
                      }
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
      //csService.retrieveAndApplyCloudToLocalData('test', '')
      done()
    })

    // TODO: Test prepare data lastSyncTime and untilTime
  })

  after(done => {
    SequelizeService.getInstance().close()
    done()
  })

})
