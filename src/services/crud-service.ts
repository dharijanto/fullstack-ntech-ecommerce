import SequelizeService from './sequelize-service'
import { Model, Instance, WhereOptions, UpdateOptions } from 'sequelize'
import * as Promise from 'bluebird'
let log = require('npmlog')

const TAG = 'BaseService'

export abstract class CRUDService {
  protected getModels (name) {
    return SequelizeService.getInstance().models[name]
  }

  protected getSequelize () {
    return SequelizeService.getInstance().sequelize
  }

  protected errHandler (err) {
    if (err.name) {
      return { status: false, errMessage: err.message }
    } else {
      throw err
    }
  }

  create<T extends BaseModel> (modelName: string, data: Partial<T>) {
    log.verbose(TAG, `create(): modelName=${modelName} data=${JSON.stringify(data)}`)
    return (this.getModels(modelName) as Model<Instance<T>, Partial<T>>).create(Object.assign(data, { id: null })).then(createdData => {
      return { status: true, data: createdData.get({ plain: true }) }
    }).catch(this.errHandler)
  }

  // If there's data to be read:
  // {status: true, data: []}
  //
  // If there's no data:
  // {status: false, errCode: ..., errMessage: ..., errData}
  read <T extends BaseModel> (modelName: string, searchClause: WhereOptions<T>): Promise<NCResponse<T[]>> {
    log.verbose(TAG, `read(): modelName=${modelName} searchClause=${JSON.stringify(searchClause)}`)
    return (this.getModels(modelName) as Model<Instance<T>, Partial<T>>).findAll({ where: searchClause }).then(readData => {
      return { status: true, data: readData.map(data => data.get({ plain: true })) }
    }).catch(this.errHandler)
  }

  readOne <T extends BaseModel> (modelName: string, searchClause: WhereOptions<T>): Promise<NCResponse<T>> {
    return (this.getModels(modelName) as Model<Instance<T>, Partial<T>>).findOne({ where: searchClause }).then(readData => {
      if (readData) {
        return { status: true, data: readData.get({ plain: true }) }
      } else {
        return { status: false, errMessage: 'Data not found' }
      }
    }).catch(this.errHandler)
  }

  update <T extends BaseModel> (modelName: string, data: Partial<T>, searchClause: WhereOptions<T>): Promise<NCResponse<number>> {
    log.verbose(TAG, `update(): modelName=${modelName} data=${JSON.stringify(data)}`)
    return (this.getModels(modelName) as Model<Instance<T>, Partial<T>>)
      .update(data, { where: searchClause as any }).spread((count: number) => {
        if (count > 0) {
          return { status: true, data: count }
        } else {
          return { status: false, errMessage: 'Data not found' }
        }
      }).catch(this.errHandler)
  }

  delete <T extends BaseModel> (modelName: string, searchClause: WhereOptions<T>): Promise<NCResponse<number>> {
    log.verbose(TAG, `delete(): modelName=${modelName} searchClause=${JSON.stringify(searchClause)}`)
    return (this.getModels(modelName) as Model<Instance<T>, Partial<T>>)
      .destroy({ where: searchClause as any }).then((count: number) => {
        if (count > 0) {
          return { status: true, data: count }
        } else {
          return { status: false, errMessage: 'Data not found' }
        }
      }).catch(this.errHandler)
  }
}

export default CRUDService
