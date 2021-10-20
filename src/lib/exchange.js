const knex = require('./db')

async function fetchExchangedAmount(from, to, amount) {
  const pair = `${from}/${to}`

  const rateResponse = await knex('rates2')
    .first('value')
    .where({ name: pair })

  const rate = parseFloat(rateResponse.value)
  // const rateResponse = await knex('rates')
  //   .select(pair)
  //   .where({ id: 1 })
  //   .first()

  // const rate = parseFloat(rateResponse[pair])

  return {
    rate,
    toAmount: rate * amount,
  }
}

async function getContractAddresses(fromSymbol, toSymbol) {
  const fromAddress = await knex("exchange_contracts")
    .first("address")
    .where("symbol", fromSymbol)

  const toAddress = await knex("exchange_contracts")
    .first("address")
    .where("symbol", toSymbol)

  return [fromAddress.address, toAddress.address];
}

module.exports = {
  fetchExchangedAmount,
  getContractAddresses,
}
