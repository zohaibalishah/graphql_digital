const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { createServer } = require("http");
const jwtDecode = require("jwt-decode");
const typeDefs = require("./src/schema");

const stripeWebhook = require("./src/stripe-webhook");
const coinbaseWebhook = require("./src/coinbase-webhook");
const sumsubWebhook = require("./src/sumsub-webhook");

const coinbaseWebhookAirstayz = require("./src/coinbase-webhook-airstayz");
const AirstayzCoinbaseRoute = require("./src/coinbase-airstayz");

const sendEmail = require("./src/send-email");
const acceptReferral = require("./src/accept-referral");
const ServiceImageRoute = require("./src/upload-image");
const resolvers = require("./src/resolvers");
const { json, raw } = require("body-parser");
const createStore = require("./src/lib/createStore");
const logger = require("./src/lib/logger");

const authMiddleware = require("./src/lib/utils/authMiddleware.js");
const authMiddlewareAirstayz = require("./src/lib/utils/authMiddlewareAirstayz.js");
const authContext = require("./src/lib/utils/authContext");

const ReferralAPI = require("./src/datasources/referrals");
const NotificationAPI = require("./src/datasources/notifications");
const KycAPI = require("./src/datasources/kyc");
const UserAPI = require("./src/datasources/user");
const CoinbaseAPI = require("./src/datasources/coinbase");
const SumSubAPI = require("./src/datasources/sumsub");
const CheckoutAPI = require("./src/datasources/checkout");

const cors = require("cors");

const store = createStore();
const port = 80;
const app = express();

const dataSources = () => ({
  referralAPI: new ReferralAPI({ store }),
  notificationAPI: new NotificationAPI({ store }),
  kycAPI: new KycAPI({ store }),
  userAPI: new UserAPI({ store }),
  coinbaseAPI: new CoinbaseAPI({ store }),
  sumsubAPI: new SumSubAPI({ store }),
  checkoutAPI: new CheckoutAPI({ store }),
});

app.use(cors());

app.use((req, res, next) => {
  if (req.originalUrl.includes("stripe-webhook")) {
    next();
  } else {
    json()(req, res, next);
  }
});

app.use("/images", authMiddleware, ServiceImageRoute);
app.use("/coinbase-airstayz", authMiddlewareAirstayz, AirstayzCoinbaseRoute);
app.post("/stripe-webhook", raw({ type: "*/*" }), stripeWebhook);
app.post("/coinbase-webhook", coinbaseWebhook);
app.post("/sumsub-webhook", sumsubWebhook);

app.post("/coinbase-webhook-airstayz", coinbaseWebhookAirstayz);

app.post("/accept-referral", acceptReferral);

app.post("/email", sendEmail);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authContext,
  dataSources,
  playground: true,
});

server.applyMiddleware({ app });
const httpServer = createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen(port, () => {
  logger.debug(`server ready at http://localhost:${port}${server.graphqlPath}`);
  logger.debug(
    `Subscriptions ready at ws://localhost:${port}${server.subscriptionsPath}`
  );
});
