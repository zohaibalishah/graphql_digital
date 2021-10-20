const Web3 = require("web3");
const Joi = require("joi");
const logger = require("../logger");
const config = require("../../config")

config.mintingAccounts = config.mintingAccounts.split(',')

const knex = require("knex")({
  client: "mysql",
  connection: config.dbConnection,
});

const eventSchema = Joi.object().keys({
  aws_user_id: Joi.string().required(),
  charge_id: Joi.number().required(),
  amount: Joi.number().required(),
  to: Joi.string().required(),
  contract_address: Joi.string().required(),
  source: Joi.number().integer().required(), //eslint-disable-line
});

async function setReferrer(referrerAddress, referredAddress) {
  try {
    const web3 = new Web3(new Web3.providers.HttpProvider(config.nodeAddress), null, { transactionConfirmationBlocks: 1 });
    const adminAccountPrivateKey = config.mintingAccounts[0]
    const account = web3.eth.accounts.wallet.add(`0x${adminAccountPrivateKey}`);

    const { address } = await knex('exchange_contracts')
      .select('address')
      .where('symbol', 'Users')
      .first()

    const usersJson = require("./Users.json");
    const contract = new web3.eth.Contract(usersJson.abi, address, { gasPrice: "0" });

    await contract.methods.setReferrerAddress(referredAddress, referrerAddress).send({ from: account.address, gas: 500000, chainId: 84626 });

    return true
  } catch (err) {
    logger.fmtError(err);
    throw err
  }
}

async function mint(event) {
  try {
    logger.info({ type: "mint", message: "start mint", to_address: event.to });
    const { aws_user_id, charge_id, amount, to, contract_address, source } = await eventSchema.validate(event, { abortEarly: false, stripUnknown: true });
    logger.debug({ type: "mint", nodeAddress: config.nodeAddress });
    const web3 = new Web3(new Web3.providers.HttpProvider(config.nodeAddress), null, { transactionConfirmationBlocks: 1 });

    const mintingAccounts = config.mintingAccounts.map(account => ({
      address: web3.eth.accounts.privateKeyToAccount(`0x${account}`).address,
      pk: account,
    }));
    const usedAccounts = await knex("mintings")
      .pluck("minter")
      .where({ tx_id: null });
    const availableAccounts = mintingAccounts
      .filter(account => !usedAccounts
      .includes(account.address));

    if (availableAccounts.length === 0) {
      throw new Error("No available accounts");
      // add retry
    }

    const account = web3.eth.accounts.wallet.add(`0x${availableAccounts[0].pk}`);
    const assetTokenJson = require("./AssetToken.json");
    const contract = new web3.eth.Contract(assetTokenJson.abi, contract_address, { gasPrice: "0" });
    const measure = logger.measure();
    logger.info({ type: "mint", message: "minting", to, amount });

    const [mintingId] = await knex("mintings").insert({ aws_user_id, charge_id, mint_amount: amount, minter: account.address });
    const rcpt = await contract.methods.purchaseTokens(to, Math.round(amount), source).send({ from: account.address, gas: 500000, chainId: 84626 });
    logger.info({ type: "mint", message: "minting succesful", measure: measure(), rcpt });

    await knex("mintings").update({ tx_id: rcpt.transactionHash })
      .where({ id: mintingId });
    await knex("charges").update({ pending: false })
      .where({ id: charge_id });
    const { symbol } = await knex("exchange_contracts")
      .select("symbol")
      .where({ address: contract_address })
      .first();

    if (charge_id !== 999999999)
      await knex("notifications").insert({
        aws_user_id,
        message: `You have purchased ${Math.round(amount / (10 ** 4)) / 100} ${symbol}.`,
        payload: JSON.stringify({
          type: "minting",
          amount,
          contract: contract_address,
          symbol,
        })
      });
  } catch (err) {
    logger.fmtError(err);
    throw err
  }
}

module.exports = {
  mint,
  setReferrer,
}