/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable no-trailing-spaces */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
const { DataSource } = require('apollo-datasource')
const config = require('../config')
const EthCrypto = require('eth-crypto')
const { fetchExchangedAmount, getContractAddresses } = require('../lib/exchange')

class ExchangeAPI extends DataSource {
  constructor({ store }) {
    super();
    this.knex = store.knex;
  }

  initialize(config) {
    this.context = config.context;
  }

  async convert({ from, to, amount }) {
    try {
      const response = await fetchExchangedAmount(from, to, amount)

      return response
    } catch (err) {
      console.log(err)
      throw err
    }
  }

  async getExchangeRate({ from, to }) {
    try {
      const pair = `${from}/${to}`
      // const response = await this.knex('rates')
      //   .first(pair)
      //   .where({ id: 1 })
      const response = await this.knex('rates2')
        .first('value')
        .where({ name: pair })
    
      
      return response[pair]
    } catch (err) {
      console.log(err)
      throw err
    }
  }

  async getExchangeParams({ fromSymbol, toSymbol, amount, nonce }) {
    try {
      const [fromAddress, toAddress] = await getContractAddresses(fromSymbol, toSymbol)
      const { rate, toAmount } = await fetchExchangedAmount(fromSymbol, toSymbol, fromAmount)

      const formattedToAmount = Math.round(toAmount * (10 ** 6))
      const formattedFromAmount = Math.round(fromAmount * (10 ** 6))

      if (!toAmount) throw new Error("Exchange amount could not be determined.")

      const message = EthCrypto.hash.keccak256([
        { type: "uint256", value: formattedFromAmount },
        { type: "uint256", value: formattedToAmount },
        { type: "address", value: fromAddress },
        { type: "address", value: toAddress },
        { type: "uint256", value: nonce },
      ])
    
      const sig = EthCrypto.sign(config.eth.signingKey, message)

      return {
        rate,
        exchange_params: {
          fromAmount: formattedFromAmount,
          toAmount: formattedToAmount,
          fromAddress,
          toAddress,
          nonce,
          sig,
        }
      }
    } catch (err) {
      console.log(err)
      throw err
    }
  }
}

module.exports = ExchangeAPI;
