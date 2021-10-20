const AWS = require("aws-sdk");
const config = require("../config");
const logger = require("../lib/logger");
AWS.config.update({ region: "us-east-1" });

const cisp = new AWS.CognitoIdentityServiceProvider();

async function listUsers(filter = "") {
  let users = [];
  let result = {};
  do {
    result = await cisp
      .listUsers({
        // eslint-disable-line no-await-in-loop
        UserPoolId: config.cognitoUserPoolId,
        AttributesToGet: ["email", "name", "custom:wallet_address"],
        Filter: filter,
        PaginationToken: result.PaginationToken,
      })
      .promise();
    users = users.concat(result.Users);
  } while (result.PaginationToken);

  return users;
}

function updateUser(aws_user_id, attributes) {
  return cisp.adminUpdateUserAttributes({
    UserAttributes: attributes,
    Username: aws_user_id,
    UserPoolId: config.cognitoUserPoolId,
  });
}

module.exports = {
  listUsers,
  updateUser,
};

if (process.env.NODE_ENV === "test") {
  // eslint-disable-line no-process-env
  const { User } = require("../test/factories");

  const mock = (obj, fn, v) => {
    obj[fn.name] = (...args) => {
      const value = typeof v === "function" ? v(...args) : v;
      logger.debug({ type: "cognito", name: fn.name, value });
      return value;
    };
  };
  /* eslint-disable */
  mock(module.exports, listUsers, (n = 5) =>
    Promise.all(
      Array(n)
        .fill(0)
        .map(() => User.create())
    )
  );
  mock(module.exports, updateUser, (u) => u);
  /* eslint-enable */
}
