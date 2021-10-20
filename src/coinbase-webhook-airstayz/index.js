const Coinbase = require("../lib/coinbase");
const { mint } = require("../lib/eth");
const config = require("../config");
const logger = require("../lib/logger");
const knex = require("../lib/db");

const coinbaseWebhook = async (req, res) => {
  let event = null;
  const coinbase = new Coinbase(
    config.coinbaseApiKeyAirstayz,
    config.webhookSecretAirstayz
  );

  try {
    event = coinbase.verifyWebhook(
      JSON.stringify(req.body),
      req.headers["x-cc-webhook-signature"]
    );
  } catch (error) {
    console.log(error);
    return res.status(400).send(`Webhook Error:${error.message}`);
  }

  const {
    code: chargeCode,
    payments,
    timeline,
    metadata,
    pricing,
  } = event.data;
  const { aws_user_id, wallet_address, booking } = metadata;

  switch (event.type) {
    case "charge:created": {
      console.log(event.data.metadata);
      break;
    }
    case "charge:confirmed": {
      const { network, value } = payments[0];

      console.log({ network, value });
      break;
    }
    case "charge:failed": {
      // update db
      return res.status(400).json({ message: "Charge failed." });
      break;
    }
    default:
      return res.status(400).json({ message: "Charge type not recognized." });
  }
  res.json({ received: true });
};

module.exports = coinbaseWebhook;
