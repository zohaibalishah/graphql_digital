const Coinbase = require('../lib/coinbase')
const config = require('../config')
const { mint } = require('../lib/eth')
const logger = require("../lib/logger");
const knex = require('../lib/db')

const sumsubWebhook = async (req, res) => {
  res.json({ received: true })
}

module.exports = sumsubWebhook;
