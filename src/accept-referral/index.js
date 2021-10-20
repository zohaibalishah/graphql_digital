const config = require('../config')
const eth = require('../lib/eth')

const knex = require('knex')({
  client: 'mysql',
  connection: config.dbConnection,
})

const acceptReferral = async (req, res) => {
  const {
    referrer_email,
    referred_email,
    referrer_address,
    referred_address,
    id,
    referrer_aws_user_id
  } = req.body

  await eth.setReferrer(referrer_address, referred_address)

  await knex('referrals').update({ accepted: true, pending: false }).where({ id })

  await knex("notifications").insert({
    aws_user_id: referrer_aws_user_id,
    message: `${referred_email} has accepted your referral.`,
    payload: JSON.stringify({
      type: "accept-referral",
      referrer_email,
      referred_email,
    })
  });

  res.sendStatus(200)
}

module.exports = acceptReferral
