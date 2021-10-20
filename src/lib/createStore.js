const config = require('../config')

const createStore = () => {
  const knex = require('knex')({
    client: 'mysql',
    connection: config.dbConnection,
  })

  return { knex }
}

module.exports = createStore
