/* eslint-disable no-process-env */

const dbConnection = {
  host: "database-1.cl8jcz3tpxxa.eu-west-2.rds.amazonaws.com",
  port: 3306,
  user: "admin",
  password: "lolG32327",
  database: "digitall",
};
module.exports = {
  dbConnection: dbConnection,
  sumSubAppTokenKey:
    "sbx:DbAsgDw9y3Tv7Ha2kY2gDyEy.d2bxM4IwQGLP3jp7IFZr2MpioFTeONyw",
  sumSubAppTokenSecret: "302z0DLBZP5mUolwloHVG65dD5VUNOFF",
  nodeAddress: "https://data-seed-prebsc-1-s1.binance.org:8545",
  mintingAccounts: process.env.MINTING_ACCOUNTS || "",
  stripeSigningSecret:
    "sk_test_51H3JftDCORTl8KZUNU2uTmFDDlDjHCgvw9WoaRN8kdtcjHuzyluTBjM4jlk8HfcxnGCbips0iW4XvKgXoz1GEtKC00EzbSuN8b",
  stripeApiKey:
    "pk_test_51H3JftDCORTl8KZUXZjgCEcd1x3y4ZJvcaksWwvYOkblf34wnrBGxfgu75EZb179Aadx4XYgE7gJN62aZ0LqeCJm00U5gQf5eX",
  // conainbase db
  dbConnectionAirstayz: dbConnection,
  // coin base
  coinbaseApiKey: process.env.COINBASE_API_KEY || "api_key",
  // coin base
  webhookSecret: process.env.WEBHOOK_SECRET || "",
  // coin base
  coinbaseApiKeyAirstayz:
    process.env.COINBASE_API_KEY_AIRSTAYZ || "api_key_airstayz",
  // coin base
  webhookSecretAirstayz: process.env.WEBHOOK_SECRET_AIRSTAYZ || "",
  jwk: "process.env.JWK",
  jwkAirstayz: "process.env.JWK_AIRSTAYZ",
  cognitoUserPoolId: "eu-west-2_Gl0noybEd",
  signingKey: process.env.SIGNING_ACCOUNT,
};
