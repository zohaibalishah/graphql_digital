const { DataSource } = require('apollo-datasource')
const config = require('../config')

class KycAPI extends DataSource {
  constructor({ store }) {
    super();
    this.knex = store.knex;
  }

  initialize(config) {
    this.context = config.context;
  }

  async getKyc({ id }) {
    const referral = await this.knex('kyc')
      .select()
      .where({ id })
      .first()

    return referral
  }

  async addKyc({ aws_user_id, phone, passport_image_url, bill_image_url, verified, pin }) {
    await this.knex('kyc')
      .insert({
        aws_user_id,
        phone,
        passport_image_url,
        bill_image_url,
        verified,
        pin
      })

    return true
  }

  async verifyKyc({ id }) {
    await this.knex('kyc')
      .where({ id })
      .update({ verified: true })
    return true
  }
}

module.exports = KycAPI;
