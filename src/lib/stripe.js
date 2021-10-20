const logger = require("./logger");
const config = require("../config");
const stripe = require("stripe")(config.stripeSigningSecret);

const STRIPE_VERSION = "2019-05-16";

function constructEvent(body, sig, endpointSecret) {
  return stripe.webhooks.constructEvent(body, sig, endpointSecret);
}

function createCharge(
  { aws_user_id, stripe_customer_id, wallet_address },
  { amount, currency, source }
) {
  return stripe.charges.create({
    amount,
    currency,
    source,
    customer: stripe_customer_id,
    metadata: {
      wallet_address,
      aws_user_id,
    },
  });
}

function createSubscription({ stripe_customer_id }, { plan, source }) {
  return stripe.subscriptions.create({
    customer: stripe_customer_id,
    default_source: source,
    items: [{ plan }],
  });
}

async function createCustomer(awsUserId) {
  const customer = await stripe.customers.create({
    metadata: {
      aws_user_id: awsUserId,
    },
  });
  return customer;
}

async function retrieveOrCreateCustomer(user) {
  let customer = null;
  if (user.stripe_customer_id) {
    customer = await stripe.customers.retrieve(user.stripe_customer_id);
  } else {
    customer = await createCustomer(user.aws_user_id);
  }
  if (!customer) throw new Error("Couldnt get stripe customer");
  return customer;
}

function listSources({ stripe_customer_id }) {
  return stripe.customers.listSources(stripe_customer_id);
}

function listPlans() {
  return stripe.plans.list();
}

function createSource({ stripe_customer_id }, source) {
  return stripe.customers.createSource(stripe_customer_id, { source });
}

function updateSource({ stripe_customer_id }, source, values) {
  return stripe.customers.updateSource(stripe_customer_id, source, values);
}

function deleteSource({ stripe_customer_id }, source) {
  return stripe.customers.deleteSource(stripe_customer_id, source);
}

const funding = {
  STRIPE_VERSION,
};
if (process.env.NODE_ENV === "test") {
  // eslint-disable-line no-process-env
  const mock = (obj, fn, value) => {
    obj[fn.name] = () => {
      logger.debug({ type: "stripe", name: fn.name, value });
      return Promise.resolve(value);
    };
  };
  mock(funding, createCharge, { id: "ch_mock_charge" });
  mock(funding, createSubscription, {
    id: "ch_mock_subscription",
    plan: { currency: "usd", amount: 100 },
  });
  mock(funding, createCustomer, { id: "mock_created_customer" });
  mock(funding, retrieveOrCreateCustomer, { id: "mock_retrieved_customer" });
  mock(funding, listSources, [{ id: "src_listed_card" }]);
  mock(funding, listPlans, [{ id: "plan_active_plan" }]);
  mock(funding, createSource, { id: "src_created_card" });
  mock(funding, updateSource, { id: "src_updated_card" });
  mock(funding, deleteSource, { id: "src_deleted_card", deleted: true });
} else {
  funding.createCharge = createCharge;
  funding.createSubscription = createSubscription;
  funding.createCustomer = createCustomer;
  funding.retrieveOrCreateCustomer = retrieveOrCreateCustomer;
  funding.listSources = listSources;
  funding.listPlans = listPlans;
  funding.createSource = createSource;
  funding.updateSource = updateSource;
  funding.deleteSource = deleteSource;
  funding.constructEvent = constructEvent;
}

module.exports = funding;
