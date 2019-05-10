import * as Promise from 'bluebird'

import CRUDService from '../../services/crud-service'
import SequelizeService from '../../services/sequelize-service'

export default class MyCRUDService extends CRUDService {
  public getModels (name) {
    return super.getModels(name)
  }

  public getSequelize () {
    return super.getSequelize()
  }
  // Delete everything on the database
  destroyAllTables () {
    const modelNames = Object.keys(SequelizeService.getInstance().models)
    return Promise.map(modelNames, modelName => {
      return this.getModels(modelName).destroy({ where: {} })
    })
  }
}
