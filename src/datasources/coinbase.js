const { DataSource } = require('apollo-datasource')
const Coinbase = require('../lib/coinbase')
const config = require('../config')

class CoinbaseAPI extends DataSource {
  constructor({ store }) {
    super();

    this.coinbase = new Coinbase(config.coinbaseApiKey, config.webhookSecret)
    this.knex = store.knex;
  }

  async createCoinbaseCharge(input, aws_user_id, wallet_address) {
    const chargeInput = {
      name: input.name,
      description: input.description,
      pricing_type: "fixed_price",
      local_price: {
        amount: input.amount,
        currency: input.currency,
      },
      metadata: {
        aws_user_id,
        wallet_address,
      }
    }

    const charge = await this.coinbase.createCharge(chargeInput)
    charge.status = charge.timeline[charge.timeline.length - 1].status
    charge.timeline = JSON.stringify(charge.timeline)
    charge.payments = JSON.stringify(charge.payments)

    await this.knex('coinbase_charges')
      .insert({
        id: charge.id,
        code: charge.code,
        name: charge.name,
        amount: charge.pricing.local.amount,
        description: charge.description,
        hosted_url: charge.hosted_url,
        aws_user_id,
        wallet_address,
        local_amount: charge.pricing.local.amount,
        bitcoin_amount: charge.pricing.bitcoin.amount,
        ethereum_amount: charge.pricing.ethereum.amount,
        status: charge.status
      })

    return charge
  }
}

module.exports = CoinbaseAPI;
