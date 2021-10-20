const { DataSource } = require('apollo-datasource')

class CheckoutAPI extends DataSource {
  constructor({ store }) {
    super();
    this.knex = store.knex;
  }

  initialize(config) { this.context = config.context; }

  async getUncompletedCheckouts(aws_user_id) {
    try {
      const result = this.knex('checkouts')
        .select()
        .where({ completed: 0, customer_aws_user_id: aws_user_id })
      
      return result
    } catch (err) {
      throw err
    }
  }

  async completeCheckout(id, aws_user_id) {
    try {
      const result = await this.knex('checkouts')
        .where({ id, customer_aws_user_id: aws_user_id })
        .update({ completed: 1 })
      
      if (result === 0) throw new Error('No checkout found.')

      return true
    } catch (err) {
      throw err
    }
  }

  async getCheckoutStatus({ id, amount }) {
    try {
      const result = await this.knex('checkouts')
        .first('completed')
        .where({ id, amount })

      if (!result) throw new Error('Incorrect id or amount. Double check both.')

      return result.completed
    } catch (err) {
      throw err
    }
  }

  async createCheckout({ amount, symbol, business_name, email, wallet_address }) {
    if (symbol === 'S_AND_P') symbol = 'S&P'
    try {
      const customer = await this.knex('users')
        .first('aws_user_id')
        .where({ email })
      const business = await this.knex('users')
        .first('aws_user_id')
        .where({ wallet_address })

      if (!customer) throw new Error('Customer\'s email addres is incorrect.')
      if (!business) throw new Error('Business\'s wallet addres is incorrect.')

      const [id] = await this.knex('checkouts').insert({
        customer_aws_user_id: customer.aws_user_id,
        business_aws_user_id: business.aws_user_id,
        amount,
        symbol,
      })

      await this.knex('notifications')
        .insert({
          aws_user_id: customer.aws_user_id,
          message: `Complete your online check out with ${business_name} for ${amount} ${symbol}.`,
          payload: JSON.stringify({
            type: 'checkout',
            checkout_id: id,
            business_name,
            wallet_address,
            amount,
            symbol,
          })
        })  

      return id.toString()
    } catch (err) {
      console.log(err)
      throw err
    }
  }
}

module.exports = CheckoutAPI
