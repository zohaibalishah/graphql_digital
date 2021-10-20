const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');

const config = require('../../config')

const authMiddleware = async (req, res, next) => {
  try {
    let pem = null

    if (!req.headers.authorization) {
      throw new Error('Authorization headers not found.')
    }

    const token = req.headers.authorization
    const base64AlgoAndTokenType = token.split('.')[0]
    const buffer = new Buffer.from(base64AlgoAndTokenType, 'base64')
    const algoAndTokenType = JSON.parse(buffer.toString('ascii'))
    const jwk = JSON.parse(config.jwk)

    if (algoAndTokenType.kid === jwk.keys[0].kid) {
      pem = jwkToPem(jwk.keys[0])
    } else {
      pem = jwkToPem(jwk.keys[1])
    }

    const decoded = await jwt.verify(token, pem)
    const valid = decoded && decoded.exp && ((decoded.exp * 1000) > new Date().getTime())
    const formatted_user = {
      groups: decoded['cognito:groups'],
      aws_user_id: decoded.sub,
      first_name: decoded.given_name,
      last_name: decoded.family_name,
      email: decoded.email,
      wallet_address: decoded['custom:wallet_address'],
      stripe_customer_id: decoded['custom:stripe_customer_id']
    }
    if (!valid) {
      console.log('not authorized', { req })
      res.sendStatus(403)
      return
    }
    req.currentUser = { ...decoded, ...formatted_user, loggedIn: true }
    next()
  } catch (err) {
    console.log('authorization error', { error: err })
    res.sendStatus(400)
  }
}

module.exports = authMiddleware