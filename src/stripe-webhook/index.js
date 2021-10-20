const config = require('../config')
const logger = require('../lib/logger')
const stripe = require('../lib/stripe')
const { mint } = require('../lib/eth')

const knex = require('knex')({
  client: 'mysql',
  connection: config.dbConnection,
})

const stripeWebhook = async (req, res) => {
  let event = null
  try {
    event = stripe.constructEvent(req.body, req.headers['stripe-signature'], config.stripeSigningSecret)
  } catch (err) {
    return res.sendStatus(403)
  }
  switch (event.type) {
    case 'charge.succeeded': {
      let contract_address = null
      let bal_amount = null
      const charge = event.data.object
      const response = await knex('exchange_contracts')
        .select('address')
        .where('symbol', charge.currency.toUpperCase())
      if (response[0] && response[0].address) {
        contract_address = response[0].address
      } else {
        const usdResponse = await knex('exchange_contracts')
          .select('address')
          .where('symbol', 'USD')
        contract_address = usdResponse.address
      }
      const amount = parseInt(charge.amount, 10)
      const source = charge.currency.toUpperCase() === 'USD' ? 0 : 1
      if (charge.currency.toUpperCase() === 'JPY') {
        bal_amount = parseInt(amount * (10 ** 6), 10)
      } else {
        bal_amount = parseInt((amount / 100) * (10 ** 6), 10)
      }
      const { wallet_address, aws_user_id } = charge.metadata
      const [charge_id] = await knex('charges').insert({
        pending: true,
        aws_user_id,
        stripe_charge_token: charge.id,
        amount,
        bal_amount,
        currency: charge.currency,
        success: true,
        event_created: event.created,
        event_id: event.id,
      })
      mint({ aws_user_id, charge_id, to: wallet_address, amount: bal_amount, contract_address, source })
        .then(tx => logger.info({ type: 'minting', tx }))
        .catch(err => logger.fmtError(err, { type: 'minting' }))
      break;
    }
    case 'charge.failed': {
      const charge = event.data.object;
      const amount = parseInt(charge.amount, 10)
      const bal_amount = parseInt((amount / 100) * (10 ** 6), 10)
      const { aws_user_id } = charge.metadata
      await knex('charges').insert({
        aws_user_id,
        stripe_charge_token: charge.id,
        amount,
        bal_amount,
        currency: charge.currency,
        success: false,
        event_created: event.created,
        event_id: event.id,
      })
      break;
    }
    default:
      return res.sendStatus(400);
  }

  res.json({ received: true })
}

module.exports = stripeWebhook
