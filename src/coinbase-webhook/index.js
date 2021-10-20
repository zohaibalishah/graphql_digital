const Coinbase = require('../lib/coinbase')
const config = require('../config')
const { mint } = require('../lib/eth')
const logger = require("../lib/logger");
const knex = require('../lib/db')

const coinbaseWebhook = async (req, res) => {
  const coinbase = new Coinbase(config.coinbaseApiKey, config.webhookSecret)
  let event = null;

  try {
    event = coinbase.verifyWebhook(
      JSON.stringify(req.body),
      req.headers['x-cc-webhook-signature']
    );
  } catch (error) {
    console.log(error)
    return res.status(400).send(`Webhook Error:${error.message}`);
  }

  const { code: chargeCode, payments, timeline, metadata, pricing } = event.data
  const { aws_user_id, wallet_address } = metadata

  switch (event.type) {
    case 'charge:created': {
      console.log(chargeCode)
      break;
    }
    case 'charge:confirmed': {
      const { network, value } = payments[0]

      let exchange_contract_response = null

      if (network === 'bitcoin') {
        exchange_contract_response = await knex("exchange_contracts")
          .select("address")
          .where("symbol", "BTC")
          .first()
      } else if (network === 'ethereum') {
        exchange_contract_response = await knex("exchange_contracts")
          .select("address")
          .where("symbol", "ETH")
          .first()
      } else res.status(400).json({ message: "Network not recognized." });

      console.log('contract_address', exchange_contract_response.address)

      const [charge_id] = await knex('charges').insert({
        pending: true,
        aws_user_id,
        stripe_charge_token: `cbc_${chargeCode}`,
        amount: value.crypto.amount,
        bal_amount: value.crypto.amount * (10 ** 6),
        currency: pricing.local.currency,
        success: true,
        event_created: new Date(event.created_at).getTime(),
        event_id: event.id,
      })

      console.log('charge id', charge_id)

      await knex('coinbase_charges')
        .update({ status: timeline[timeline.length - 1].status })
        .where({ id: event.id })

      mint({ aws_user_id, charge_id, to: wallet_address, amount: value.crypto.amount * (10 ** 6), contract_address: exchange_contract_response.address, source: 2 })
        .then(tx => logger.info({ type: 'minting', tx }))
        .catch(err => logger.fmtError(err, { type: 'minting' }))
      break;
    }
    case 'charge:failed': {
      await knex('coinbase_charges')
        .update({ status: timeline[timeline.length - 1].status })
        .where({ id: event.id })
      break;
    }
    default:
      return res.status(400).json({ message: "Charge type not recognized." });
  }
  res.json({ received: true })
}

module.exports = coinbaseWebhook;
