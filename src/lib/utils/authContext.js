// const logger = require('./logger')
const jwt = require("jsonwebtoken");
const jwkToPem = require("jwk-to-pem");

const config = require("../../config");

const authContext = async ({ req }) => {
  try {
    let pem = null;

    if (!req.headers.authorization) {
      throw new Error("Authorization headers not found.");
    }

    const token = req.headers.authorization;
    const base64AlgoAndTokenType = token.split(".")[0];
    const buffer = new Buffer.from(base64AlgoAndTokenType, "base64");
    const algoAndTokenType = JSON.parse(buffer.toString("ascii"));
    const jwk = JSON.parse(config.jwk);

    if (algoAndTokenType.kid === jwk.keys[0].kid) {
      pem = jwkToPem(jwk.keys[0]);
    } else {
      pem = jwkToPem(jwk.keys[1]);
    }

    const decoded = await jwt.verify(token, pem);
    const valid =
      decoded && decoded.exp && decoded.exp * 1000 > new Date().getTime();
    const formatted_user = {
      aws_user_id: decoded.sub,
      email: decoded.email,
      first_name: decoded.given_name,
      last_name: decoded.family_name,
      wallet_address: decoded["custom:wallet_address"],
      referral_code: decoded["custom:referral_code"],
      stripe_customer_id: decoded["custom:stripe_customer_id"],
      used_referral_code: decoded["custom:used_referral"],
      contract_user_id: decoded["custom:contract_user_id"],
      custom_referral_code: decoded["custom:custom_referral_code"],
    };
    const user = valid
      ? { ...decoded, ...formatted_user, loggedIn: true }
      : { loggedIn: false };
    return user;
  } catch (err) {
    console.log("err", err);
    return {
      loggedIn: false,
      aws_user_id: "123_123_aws_user_id",
      email: "email@email",
      first_name: "Bob",
      last_name: "Smith",
      wallet_address: "0x00000000000000000000000000000000000000",
      stripe_customer_id: "cus_123_stripe_id",
      contract_user_id: 1,
      referral_code: "123ABC",
      used_referral_code: "",
      custom_referral_code: "",
    };
  }
};

module.exports = authContext;
