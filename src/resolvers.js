const { PubSub, withFilter } = require('apollo-server');

const pubsub = new PubSub();

const NOTIFICATION_ADDED = 'NOTIFICATION_ADDED';

const resolvers = {
  Query: {
    pendingReferrals: (_, __, { dataSources }) =>
      dataSources.referralAPI.getPendingReferrals(),
    requestAccessToken: (_, __, { dataSources, aws_user_id }) =>
      dataSources.sumsubAPI.requestAccessToken(aws_user_id),
    kycReview: (_, __, { dataSources, aws_user_id }) =>
      dataSources.sumsubAPI.getStatus(aws_user_id),
    referral: (_, { id }, { dataSources }) =>
      dataSources.referralAPI.getReferral({ id }),
    notification: (_, { id }, { dataSources }) =>
      dataSources.notificationAPI.getNotification({ id }),
    kyc: (_, { id }, { dataSources }) =>
      dataSources.kycAPI.getKyc({ id }),
    getCheckoutStatus: (_, { input }, { dataSources  }) =>
      dataSources.checkoutAPI.getCheckoutStatus(input),
  },
  Mutation: {
    completeCheckout: async (_, { id }, { dataSources, aws_user_id }) => {
      const results = await dataSources.checkoutAPI.completeCheckout(id, aws_user_id);
      return results
    },
    createCheckout: async (_, { input }, { dataSources }) => {
      const results = await dataSources.checkoutAPI.createCheckout(input);
      return results
    },
    addUser: async (_, __, { dataSources, aws_user_id, email, first_name, last_name, contract_user_id, wallet_address, referral_code }) => {
      const results = await dataSources.userAPI.addUser({ aws_user_id, email, first_name, last_name, contract_user_id, wallet_address, referral_code });
      return results
    },
    useReferralCode: async (_, { referralCode }, { dataSources, aws_user_id, first_name, last_name, wallet_address, email }) => {
      const results = await dataSources.referralAPI.useReferralCode({ referralCode, aws_user_id, first_name, last_name, wallet_address, email });
      return results
    },
    updateCustomReferralCode: async (_, { customReferralCode }, { dataSources, aws_user_id }) => {
      const results = await dataSources.referralAPI.updateCustomReferralCode({ customReferralCode, aws_user_id });
      return results
    },
    createReferrals: async (_, { referrals }, { dataSources, aws_user_id, first_name, last_name }) => {
      const results = await dataSources.referralAPI.createReferrals({ referrals, aws_user_id, first_name, last_name });
      return results
    },
    addNotification: (_, { input }, { dataSources }) => {
      pubsub.publish(NOTIFICATION_ADDED, { notificationAdded: input });
      return dataSources.notificationAPI.addNotification({ ...input });
    },
    addKyc: async (_, { input }, { dataSources }) => {
      const results = await dataSources.kycAPI.addKyc({ ...input });
      return results
    },
    verifyKyc: async (_, { input }, { dataSources }) => {
      const results = await dataSources.kycAPI.verifyKyc({ ...input });
      return results
    },
    markAsRead: async (_, { input }, { dataSources }) => {
      const results = await dataSources.notificationAPI.markAsRead({ ...input });
      return results
    },
    createCoinbaseCharge: async (_, { input }, { dataSources, aws_user_id, wallet_address, loggedIn }) => {
      if (!loggedIn) return new Error('Not logged in.')
      const results = await dataSources.coinbaseAPI.createCoinbaseCharge(input, aws_user_id, wallet_address)
      return results
    },
  },
  Subscription: {
    notificationAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator([NOTIFICATION_ADDED]),
        (payload, variables) => {
          return payload.notificationAdded.aws_user_id === variables.aws_user_id;
        },
      )
    },
  }
}

module.exports = resolvers
