import * as path from 'path'
import * as assert from 'assert'
import * as process from 'process'

import * as Sequelize from 'sequelize'
import * as Promise from 'bluebird'
import * as pretry from 'bluebird-retry'

import * as AppConfig from '../../../app-config'
import SequelizeService from '../../../services/sequelize-service'
import CRUDService from '../../classes/crud-service'
import CloudSyncService from '../../classes/cloud-sync-service'
import ShopService from '../../../services/shop-service'
import ProductService from '../../../services/product-service'
const createModel = require(path.join('../../../db-structure'))

describe('Test CloudSyncservice', () => {
  let crud: CRUDService
  let csService: CloudSyncService
  before(done => {
    const sequelize = new Sequelize(AppConfig.TEST_SQL_DB, { logging: !!process.env.DEBUG_SQL, operatorsAliases: false })
    const models = createModel(sequelize, {})
    SequelizeService.initialize(sequelize, models)
    SequelizeService.getInstance().sequelize.sync().then(() => {
      crud = new CRUDService()
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
    it('Test getLastSyncState() 1', done => {
      csService.getSyncHistory('My Shop 1', '2019-02-01 00:00:00').then(resp => {
        assert.ok('status' in resp && !resp.status, 'getLastSyncHistory should fail')
        return crud.getSequelize().transaction({ isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE }, trx => {
          const sinceTime = '2019-01-02'
          return csService.createSyncHistory('My Shop 1', 'Preparing', sinceTime, trx).then(resp => {
            assert.ok(resp.status && resp.data && resp.data.status, 'createSyncHistory should succeed 1')
            // Last sync was on the same day
            return csService.getSyncHistory('My Shop 1', '2019-01-02', trx).then(resp => {
              assert.ok(resp.status, 'getLastSyncHistory should succeed 1')
              assert.equal(resp.data && resp.data.sinceTime, sinceTime)
              assert.equal(resp.data && resp.data.status, 'Preparing')
              // Last sync was more recent than the history
              return csService.getSyncHistory('My Shop 1', '2019-01-03', trx).then(resp => {
                assert.ok(resp.status, 'getLastSyncHistory should succeed 2')
                assert.equal(resp.data && resp.data.sinceTime, sinceTime)
                assert.equal(resp.data && resp.data.status, 'Preparing')
                return csService.getSyncHistory('My Shop 1', '2019-01-01', trx).then(resp => {
                  assert.ok(resp.status === false, 'getLastSyncHistory should fail 1')
                })
              })
            })
          })
        })
      }).then(() => {
        done()
      }).catch(done)
    })

    it('Test getLastSyncState() 2', done => {
      crud.getSequelize().transaction({ isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE }, trx => {
        const sinceTime = '2019-02-02'
        const sinceTime2 = '2019-03-01'
        return Promise.join(
          csService.createSyncHistory('My Shop 1', 'Preparing', sinceTime, trx),
          csService.createSyncHistory('My Shop 1', 'Preparing', sinceTime2, trx)
        ).spread<void, NCResponse<CloudSyncHistory>>((resp1, resp2) => {
          assert.ok(resp1.status, 'History 1 should create fine')
          assert.ok(resp2.status, 'History 2 should create fine')
          return Promise.join(
            csService.getSyncHistory('My Shop 1', '2019-03-05', trx),
            csService.getSyncHistory('My Shop 1', '2019-03-07', trx)
          ).spread<void, NCResponse<CloudSyncHistory>>((resp1, resp2) => {
            assert.ok(resp1.status === true, 'History should be retrieved 1: ' + JSON.stringify(resp1))
            assert.ok(resp2.status === true, 'History should be retrieved 2: ' + JSON.stringify(resp2))
            assert.equal(resp1.data && resp1.data.sinceTime, sinceTime2)
            assert.equal(resp2.data && resp2.data.sinceTime, sinceTime2)
          })
        })
      }).then(() => {
        done()
      }).catch(done)
    })
  })

  describe('Test prepare data', () => {
    beforeEach((done) => {
      ProductService.createCategory({ name: 'Komputer', description: '' }).then(resp => {
        if (resp.status && resp.data) {
          return ProductService.createSubCategory({ name: 'Mouse', categoryId: resp.data.id }).then(resp => {
            if (resp.status && resp.data) {
              return ProductService.createProduct({ subCategoryId: resp.data.id, name: 'Logitech M135', price: 125000, warranty: '1 tahun' })
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

    it('Prepare data should work', done => {
      const lastSyncTime = '2017-01-01'
      csService.createSyncHistory('My Shop 1', 'Preparing', lastSyncTime).then(resp => {
        if (resp.status && resp.data) {
          const syncHistoryId = resp.data.id
          const untilTime = resp.data.untilTime
          return csService.prepareData('My Shop 1', lastSyncTime, untilTime, resp.data.id).then(resp => {
            if (resp.status && resp.data) {
              assert(resp.data.fileName !== undefined, 'Filename should not be empty')
              assert(resp.data.status === 'Success', 'Resp should succeed ')
              assert(resp.data.id === syncHistoryId, 'Id should be the same as syncHistoryId')
              const getState = () => {
                return csService.getSyncHistory('My Shop 1', lastSyncTime).then(resp => {
                  if (resp.status && resp.data && resp.data.status === 'Success') {
                    assert.ok(resp.data.fileName, 'syncFileName does not exist!')
                    return
                  } else {
                    throw new Error('Not yet finished!')
                  }
                })
              }

              // After 5 seconds, prepareData() should've completed
              return pretry(getState, { interval: 1000, max_tries: 5 })
            } else {
              throw new Error('prepareData() failed! resp=' + JSON.stringify(resp))
            }
          })
        } else {
          throw new Error(`Sync history can't be created: ` + resp.errMessage)
        }
      }).then(resp => {
        done()
      }).catch(err => {
        done(err)
      })
    })

    // TODO: Test prepare data lastSyncTime and untilTime
  })

  after(done => {
    SequelizeService.getInstance().close()
    done()
  })

})
