import SequelizeService from './sequelize-service'
import * as Promise from 'bluebird'
var log = require('npmlog')

const TAG = 'BaseService'

export interface NewData {
  [key: string]: any
}


export interface ExistingData {
  [key: string]: any
  id: number
}

export interface SearchClause {
  [key: string]: any
}

export abstract class CRUDService {
  create (modelName: string, data: NewData): Promise<NCResponse<ExistingData>> {
    log.verbose(TAG, `create(): modelName=${modelName} data=${JSON.stringify(data)}`)
    if (!data) {
      throw new Error('data has to be specified!')
    }
    delete data.id // We want to allow easy duplication, so we assume that adding data with the same id means creating a duplicate
    return SequelizeService.getInstance().models[modelName].create(data).then(createdData => {
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
  read (modelName: string, searchClause: SearchClause): Promise<NCResponse<ExistingData[]>> {
    log.verbose(TAG, `read(): modelName=${modelName} searchClause=${JSON.stringify(searchClause)}`)
    return SequelizeService.getInstance().models[modelName].findAll({where: searchClause}).then(readData => {
      if (readData.length > 0) {
        return {status: true, data: readData.map(data => data.get({plain: true}))}
      } else {
        return {status: false}
      }
    })
  }

  readOne (modelName: string, searchClause: SearchClause) : Promise<NCResponse<ExistingData>> {
    return this.read(modelName, searchClause).then(resp => {
      if (resp.status) {
        return {status: true, data: (resp.data || [])[0]}
      } else {
        return {status: false, errMessage: resp.errMessage, errCode: resp.errCode}
      }
    })
  }

  update (modelName: string, data: ExistingData): Promise<NCResponse<null>> {
    log.verbose(TAG, `update(): modelName=${modelName} data=${JSON.stringify(data)}`)
    return SequelizeService.getInstance().models[modelName].update(data, {where: data}).spread((count) => {
      return {status: true}
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

  delete (modelName: string, data: ExistingData): Promise<NCResponse<null>> {
    log.verbose(TAG, `delete(): modelName=${modelName} data=${JSON.stringify(data)}`)
    return SequelizeService.getInstance().models[modelName].destroy({where: data}).then(numDeleted => {
      if (numDeleted > 0) {
        return {status: true}
      } else {
        return {status: false, errMessage: 'Data Not Found!'}
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
