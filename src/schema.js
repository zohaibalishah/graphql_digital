const { gql } = require('apollo-server')

const typeDefs = gql`
  type Query {
    kycReview: SumSubReview!
    requestAccessToken: SumSubAccessToken!
    pendingReferrals: [Referral]!
    referral(id: ID!): Referral
    notification(id: ID!): Notification
    kyc(id: ID!): Kyc
    getCheckoutStatus(input: GetCheckoutStatusInput!): Boolean
  }

  type Mutation {
    addUser: Boolean
    updateCustomReferralCode(customReferralCode: String!): Boolean
    useReferralCode(referralCode: String!): Boolean
    createReferrals(referrals: [ReferralInput!]!): Boolean
    addNotification(input: NotificationInput): Boolean
    addKyc(input: KycInput): Boolean
    markAsRead(input: MarkAsReadInput): Boolean
    updateReferral(input: ReferralInput): Boolean
    verifyKyc(input:VerifyKycInput): Boolean
    createCoinbaseCharge(input: CreateCoinbaseChargeInput!): CoinbaseCharge
    createCheckout(input: CreateCheckoutInput!): String!
    completeCheckout(id: ID!): Boolean
  }

  input GetCheckoutStatusInput {
    amount: Float!
    id: ID!
  }
  
  enum CurrencySymbol {
    USD
    GBP
    EUR
    CHF
    CAD
    AUD
    NZD
    JPY
    NOK
    SEK
    Platinum
    Gold
    Silver
    Oil
    FTSE
    S_AND_P
    EURSTOXX
    BTC
    ETH
    XRP
    XLM
    LTC
    GoldBritannia
    SilverBritannia
    GoldSovereign
  }

  input CreateCheckoutInput {
    amount: Float!
    business_name: String!
    symbol: CurrencySymbol
    email: String!
    wallet_address: String!
  }

  type SumSubReview {
    status: String!
    answer: String
    moderationComment: String
    rejectLabels: [String]
    reviewRejectType: String
  }

  type SumSubAccessToken {
    token: String!
    userId: String!
  }

  input ReferralInput {
    referred_email: String
    referrer_email: String
    referred_phone: String
    referrer_phone: String
  }

  input NotificationInput {
    aws_user_id: String
    message: String
    payload: String
  }

  input MarkAsReadInput {
    id: ID!
  }
  input KycInput {
    aws_user_id: String!
    phone: String
    passport_image_url: String
    bill_image_url: String
    verified: Boolean
    pin: String 
  }

  input VerifyKycInput {
    id: ID!
  }

  type Referral {
    id: ID!
    referred_email: String
    referrer_email: String
    pending: Boolean
    created_at: String
    updated_at: String
    accepted: Boolean
  }

  type Kyc {
    id: ID!
    aws_user_id: String
    phone: String
    passport_image_url: String
    bill_image_url: String
    verified: Boolean
    pin: String
  }

  type Notification {
    id: ID!
    aws_user_id: String
    message: String
    payload: String
    read: Boolean
  }

  type Subscription {
    notificationAdded(aws_user_id: String!): Notification
    referralUpdated(aws_user_id: String!): Referral
  }

  input CreateCoinbaseChargeInput {
    name: String
    description: String
    amount: Float!
    currency: String!
  }
  
  type CoinbaseCharge {
    id: String!
    name: String
    description: String
    addresses: Addresses
    code: String!
    created_at: String!
    expires_at: String!
    hosted_url: String!
    metadata: CoinbaseMetadata
    status: String!
    payments: String
    pricing: CoinbasePricing
    pricing_type: String
    resource: String
    support_email: String
    timeline: String
  }
  
  type CoinbasePricing {
    local: PricingType
    bitcoin: PricingType
    ethereum: PricingType
  }
  
  type PricingType {
    amount: String
    currency: String
  }

  type CoinbaseMetadata {
    aws_user_id: String!
    wallet_address: String!
  }
  
  type Addresses {
    bitcoin: String,
    ethereum: String
  }
  
`


// bitcoincash: PricingType
// litecoin: PricingType
// usdc: PricingType
// dai: PricingType
module.exports = typeDefs
