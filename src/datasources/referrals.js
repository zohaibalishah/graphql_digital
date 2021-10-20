const { DataSource } = require('apollo-datasource')
const config = require('../config')
const eth = require('../lib/eth')
const { updateUser } = require('../lib/cognito')

class ReferralAPI extends DataSource {
  constructor({ store }) {
    super();
    this.knex = store.knex;
  }

  initialize(config) {
    this.context = config.context;
  }

  async getReferral({ id }) {
    const referral = await this.knex('referrals')
      .first()
      .where({ id })

    return referral
  }

  async updateCustomReferralCode({ customReferralCode, aws_user_id }) {
    try {
      const duplicate = await this.knex('users')
        .first('custom_referral_code')
        .where({ custom_referral_code: customReferralCode.toUpperCase() })
      
      if (duplicate) throw new Error('That referral code is already in use.')
      
      await this.knex('users')
        .update({ custom_referral_code: customReferralCode })
        .where({ aws_user_id })
      
      updateUser(aws_user_id, [{ "Name": "custom:custom_referral_code", "Value": customReferralCode }]).send()
      
      return true
    } catch (err) {
      console.log(err)
      throw err
    }
  }

  async useReferralCode({ referralCode, first_name, last_name, aws_user_id, wallet_address, email }) {
    try {
      const referrer = await this.knex('users')
        .first()
        .where({ referral_code: referralCode.toUpperCase() })
        .orWhere({ custom_referral_code: referralCode.toUpperCase() })
      
      await eth.setReferrer(referrer.wallet_address, wallet_address)

      await this.knex('users').update({ used_referral_code: referralCode }).where({ aws_user_id })

      updateUser(aws_user_id, [{ "Name": "custom:used_referral", "Value": referralCode }]).send()

      const response = await this.knex('referrals')
        .first('id')
        .where({ referrer_email: referrer.email, referred_email: email })

      if (response) {
        await this.knex('referrals')
          .update({ pending: false, accepted: true, updated_at: new Date() })
          .where({ id: response.id })
      } else {
        await this.knex('referrals').insert({
          referred_email: email,
          referrer_email: referrer.email,
          pending: false,
          created_at: new Date(),
          accepted: true,
          referrer_name: `${referrer.first_name} ${referrer.last_name}`
        })
      }

      await this.knex("notifications").insert({
        aws_user_id: referrer.aws_user_id,
        message: `${first_name} ${last_name} has accepted your referral.`,
        payload: JSON.stringify({
          type: "accept-referral",
          referrer_email: referrer.email,
          referred_email: email,
        })
      })

      return true
    } catch (err) {
      console.log(err)
      throw err
    }
  }

  async createReferrals({ referrals, aws_user_id, first_name, last_name }) {
    try {
      // await this.knex('referrals').insert({
      //   referrer_email: user.email,
      //   pending: true,
      //   referred_email,
      //   referrer_name: `${first_name} ${last_name}`,
      //   created_at: new Date(),
      // })
      
      // if (referrals.referred_email && referrals.referrer_email) {
      //   const emailParams = {
      //     Destination: {
      //       ToAddresses: [referred_email],
      //     },
      //     Message: {
      //       Body: {
      //         Html: {
      //           Charset: "UTF-8",
      //           Data: "<div><span style=\"font-family: Montserrat-Medium;\">Hi, Hope you are well.</span></div><div><span style=\"font-family: Montserrat-Medium;\">&nbsp;</span></div><p><span style=\"font-family: Montserrat-Medium;\">I would like to invite you to take a look at an exciting new payment app I have recently discovered,&nbsp;</span><span style=\"font-family: Montserrat-SemiBold;\"><strong>THE DIGITALL WALLET</strong></span><span style=\"font-family: Montserrat-Medium;\">.&nbsp;</span></p><div><span style=\"font-family: Montserrat-Medium;\">&nbsp;</span></div><div><span style=\"font-family: Montserrat-Medium;\">This app is really going to change the way we pay for things going forward.</span><div><span style=\"font-family: Montserrat-Medium;\">&nbsp;</span></div><div><span style=\"font-family: Montserrat-SemiBold;\"><strong>JUST DOWNLOADING AND HOLDING THIS APP COULD EARN YOU FREE MONEY.<br/></strong></span><div><span style=\"font-family: Montserrat-Medium;\">&nbsp;</span></div><div><span style=\"font-family: Montserrat-Medium;\">Check out the app now on one of the following links:</span></div><div><span style=\"font-family: Montserrat-Medium;\">&nbsp;</span></div><div><span style=\"font-family: Montserrat-Medium;\">iOS:&nbsp;<a href=\"https://apps.apple.com/us/app/the-digitall-wallet/id1488715558\" target=\"_blank\" rel=\"noopener\" data-saferedirecturl=\"https://www.google.com/url?q=https://apps.apple.com/us/app/the-digitall-wallet/id1488715558&amp;source=gmail&amp;ust=1592694673947000&amp;usg=AFQjCNFrWQrzsY5j5XWPpTUIcUARS-s2-Q\">https://apps.apple.com/<wbr/>us/app/the-digitall-wallet/<wbr/>id1488715558</a>&nbsp;</span></div><div><span style=\"font-family: Montserrat-Medium;\">&nbsp;</span></div><div><span style=\"font-family: Montserrat-Medium;\">Android:&nbsp;<a href=\"https://play.google.com/store/apps/details?id=com.in_one_place_digitall\" target=\"_blank\" rel=\"noopener\" data-saferedirecturl=\"https://www.google.com/url?q=https://play.google.com/store/apps/details?id%3Dcom.in_one_place_digitall&amp;source=gmail&amp;ust=1592694673947000&amp;usg=AFQjCNHIWwF5iT1HRmFm-gyNHoT6nAB2HQ\">https://play.google.<wbr/>com/store/apps/details?id=com.<wbr/>in_one_place_digitall</a></span></div><div><span style=\"font-family: Montserrat-Medium;\">&nbsp;</span></div><div><span style=\"font-family: Montserrat-Medium;\"><a href=\"http://www.digitall.life/\" target=\"_blank\" rel=\"noopener\" data-saferedirecturl=\"https://www.google.com/url?q=http://www.digitall.life&amp;source=gmail&amp;ust=1592694673947000&amp;usg=AFQjCNGpFAnPBkCypsQI4UKYj8EBJ6U-vQ\">www.digitall.life</a></span></div><div>&nbsp;</div><div><span style=\"font-family: Montserrat-Medium;\"><img src=\"https://digitall-dashboard.s3.amazonaws.com/Digital+landscape+small.jpg\" alt=\"logo\" width=\"600\" height=\"293\"/></span></div></div></div>"
      //         },
      //        },
      //        Subject: {
      //         Charset: 'UTF-8',
      //         Data: `${first_name} has invited you to join Digitall!`
      //        }
      //       },
      //     Source: 'info@digitall.life',
      //   };
    
      //   const publishEmailPromise = new AWS.SES({ apiVersion: '2010-12-01' })
      //     .sendEmail(emailParams)
      //     .promise()
    
      //   await publishEmailPromise
      // }
 
      return true
    } catch (error) {
      console.log(error)
      return error
    }
  }

  async addReferral({ referred_email, referrer_email }) {
    await this.knex('referrals')
      .insert({
        referred_email,
        referrer_email,
        pending: true,
        created_at: new Date(),
        accepted: false,
      })

    return true
  }

  async getPendingReferrals() {
    const pending = await this.knex('referrals')
      .select()
      .where({ pending: true })

    return pending
  }
}

module.exports = ReferralAPI;
