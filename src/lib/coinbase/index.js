const { Webhook, Client, resources: { Charge } } = require('coinbase-commerce-node')

class Coinbase {
  constructor(apiKey, webhookSecret) {
    Client.init(apiKey)

    this.Webhook = Webhook
    this.Charge = Charge
    this.webhookSecret = webhookSecret
  }

  verifyWebhook(data, signature) {
    return this.Webhook.verifyEventBody(
      data,
      signature,
      this.webhookSecret
    )
  }
  
  async createCharge(input) {
    const charge = await this.Charge.create(input, (error, response) => {
      console.log(error)
      console.log(response)
    })

    return charge
  }
}

module.exports = Coinbase
