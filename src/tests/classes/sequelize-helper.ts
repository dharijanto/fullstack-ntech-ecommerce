import * as Promise from 'bluebird'
import SequelizeService from '../../services/sequelize-service'

function destroyAllTables () {
  const modelNames = Object.keys(SequelizeService.getInstance().models)
  return Promise.map(modelNames, modelName => {
    return SequelizeService.getInstance().models[modelName].destroy({ where: {} })
  })
}

export { destroyAllTables }
