const { DataSource } = require('apollo-datasource')
const config = require('../config')

class UserAPI extends DataSource {
  constructor({ store }) {
    super();
    this.knex = store.knex;
  }

  initialize(config) { this.context = config.context; }

  async addUser(user) {
    try {
      await this.knex('users').insert(user)
      return true
    } catch (err) {
      console.log(err)
      throw err
    }
  }

  // async updateUser(params) {
  //   try {
  //     await this.knex('users').update(params)
  //   } catch (err) {
  //     console.log(err)
  //     throw err
  //   }
  // }
}

module.exports = UserAPI;
