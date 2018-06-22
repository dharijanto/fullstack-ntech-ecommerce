import SequelizeService from './sequelize-service'
import {Model, Instance, WhereOptions, UpdateOptions} from 'sequelize'
import * as Promise from 'bluebird'
var log = require('npmlog')

const TAG = 'BaseService'

export abstract class CRUDService {
  protected getModels (name) {
    return SequelizeService.getInstance().models[name]
  }

  create<T extends BaseModel> (modelName: string, data: Partial<T>) {
    log.verbose(TAG, `create(): modelName=${modelName} data=${JSON.stringify(data)}`)
    if (!data) {
      throw new Error('data has to be specified!')
    }
    return (<Model<Instance<T>, Partial<T>>>this.getModels(modelName))
        .create(Object.assign(data, {id: null})).then(createdData => {
      return {status: true, data: createdData.get({plain: true})}
    }).catch(err => {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return {status: false, errMessage: 'Unique Constraint Error'}
      } else if (err.name === 'SequelizeForeignKeyConstraintError') {
        return {status: false, errMessage: 'Foreign Key Constraint Error!'}
      } else {
        throw err
      }
    })
  }

  // If there's data to be read:
  // {status: true, data: []}
  //
  // If there's no data:
  // {status: false, errCode: ..., errMessage: ..., errData}
  read <T extends BaseModel>(modelName: string, searchClause: WhereOptions<T>): Promise<NCResponse<T[]>> {
    log.verbose(TAG, `read(): modelName=${modelName} searchClause=${JSON.stringify(searchClause)}`)
    return (<Model<Instance<T>, Partial<T>>>this.getModels(modelName))
        .findAll({where: searchClause}).then(readData => {
      if (readData.length > 0) {
        return {status: true, data: readData.map(data => data.get({plain: true}))}
      } else {
        return {status: false}
      }
    })
  }

  readOne <T extends BaseModel>(modelName: string, searchClause: WhereOptions<T>): Promise<NCResponse<T>> {
    return this.read(modelName, searchClause).then(resp => {
      if (resp.status) {
        return {status: true, data: (resp.data || [])[0]}
      } else {
        return {status: false, errMessage: resp.errMessage, errCode: resp.errCode}
      }
    })
  }

  update <T extends BaseModel> (modelName: string, data: Partial<T>, searchClause: WhereOptions<T>): Promise<NCResponse<number>> {
    log.verbose(TAG, `update(): modelName=${modelName} data=${JSON.stringify(data)}`)
    return (<Model<Instance<T>, Partial<T>>>this.getModels(modelName))
        .update(data, {where: <any> searchClause}).spread((count: number) => {
      if (count > 0) {
        return {status: true, data: count}
      } else {
        return {status: false, errMessage: 'Data not found'}
      }
    }).catch(err => {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return {status: false, errMessage: 'Unique Constraint Error'}
      } else if (err.name === 'SequelizeForeignKeyConstraintError') {
        return {status: false, errMessage: 'Foreign Key Constraint Error!'}
      } else {
        throw err
      }
    })
  }

  delete <T extends BaseModel> (modelName: string, searchClause: WhereOptions<T>): Promise<NCResponse<number>> {
    log.verbose(TAG, `delete(): modelName=${modelName} searchClause=${JSON.stringify(searchClause)}`)
    return (<Model<Instance<T>, Partial<T>>>this.getModels(modelName))
        .destroy({where: <any> searchClause}).then((count: number) => {
      if (count > 0) {
        return {status: true, data: count}
      } else {
        return {status: false, errMessage: 'Data not found'}
      }
    }).catch(err => {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return {status: false, errMessage: 'Unique Constraint Error'}
      } else if (err.name === 'SequelizeForeignKeyConstraintError') {
        return {status: false, errMessage: 'Foreign Key Constraint Error!'}
      } else {
        throw err
      }
    })
  }
}

export default CRUDService
