import * as Sequelize from 'sequelize'
import * as md5 from 'md5'
const SyncDB = require('../db-structure')

function createSQLiteDatabase (dbName) {
  const dbPath = `/tmp/${dbName}.sqlite`
  const sequelize = new Sequelize(dbName, {
    dialect: 'sqlite',
    storage: dbPath
    /* dialectOptions: {
      useUTC: false
    }, */
  })

  return sequelize.authenticate().then(() => {
    SyncDB(sequelize, {})
    return sequelize.sync({ force: true }).then(() => {
      return dbPath
    })
  })
}

const hash = md5(new Date().toISOString())
createSQLiteDatabase(`sqlite:${hash}`).then(path => {
  console.log('Successfully create SQLite database: ' + path)
}).catch(err => {
  console.error('Failed to create SQLite database: ' + err)
})
