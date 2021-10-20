const { DataSource } = require('apollo-datasource')
const config = require('../config')

class NotificationAPI extends DataSource {
  constructor({ store }) {
    super();
    this.knex = store.knex;
  }

  initialize(config) {
    this.context = config.context;
  }

  async getNotification({ id }) {
    const notification = await this.knex('notifications')
      .first()
      .where({ id })

    return notification
  }

  async addNotification({ aws_user_id, message, payload }) {
    await this.knex('notifications')
      .insert({
        aws_user_id,
        message,
        payload
      })

    return true
  }

  async markAsRead({ id }) {
    await this.knex('notifications')
      .where({ id })
      .update({ read: true })
    return true
  }
}

module.exports = NotificationAPI;
