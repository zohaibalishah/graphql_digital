const Coinbase = require('../lib/coinbase')
const config = require('../config')
const express = require('express')
const knex = require('knex')({
  client: 'mysql',
  connection: {
  host: "database-1.cl8jcz3tpxxa.eu-west-2.rds.amazonaws.com",
  port: 3306,
  user: "admin",
  password: "lolG32327",
  database: "digitall",
  }
});
// const knex = require('knex')({
//   client: 'pg',
//   version: '12.3',
//   connection: config.dbConnectionAirstayz,
//   searchPath: ['knex', '$user', 'airstayz_dev', 'public'],
// })


const AirstayzCoinbaseRoute = express.Router()

AirstayzCoinbaseRoute.post('/create-charge', async (req, res) => {
  const coinbase = new Coinbase(config.coinbaseApiKeyAirstayz, config.webhookSecretAirstayz)

  const {
    name,
    description,
    amount,
    currency,
    booking,
    itinerary_item,
  } = req.body

  const { aws_user_id, wallet_address } = req.currentUser

  const chargeInput = {
    name,
    description,
    pricing_type: "fixed_price",
    local_price: {
      amount,
      currency,
    },
    metadata: {
      aws_user_id,
      wallet_address,
      booking,
      itinerary_item,
    }
  }

  const charge = await coinbase.createCharge(chargeInput)
  charge.status = charge.timeline[charge.timeline.length - 1].status
  charge.timeline = JSON.stringify(charge.timeline)
  charge.payments = JSON.stringify(charge.payments)
  const coinbase_charge = {
    id: charge.id,
    code: charge.code,
    name: charge.name,
    amount: charge.pricing.local.amount,
    description: charge.description,
    hosted_url: charge.hosted_url,
    user_id: aws_user_id,
    wallet_address,
    local_amount: charge.pricing.local.amount,
    bitcoin_amount: charge.pricing.bitcoin.amount,
    ethereum_amount: charge.pricing.ethereum.amount,
    status: charge.status
  }

  await knex('coinbase_charges').insert(coinbase_charge)

  res.json({
    id: charge.id,
    hosted_url: charge.hosted_url,
    expires_at: charge.expires_at,
    addresses: charge.addresses,
    pricing: charge.pricing
  })
})

module.exports = AirstayzCoinbaseRoute
