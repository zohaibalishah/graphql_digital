const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const FormData = require("form-data");
const config = require("../../config");

const APP_TOKEN_KEY = config.sumSubAppTokenKey;
const APP_TOKEN_SECRET = config.sumSubAppTokenSecret;

function sign(c) {
  const time = Math.round(Date.now() / 1000);
  const hmacSha256 = crypto.createHmac("sha256", APP_TOKEN_SECRET);
  hmacSha256.update(time + c.method.toUpperCase() + c.url);

  if (c.data) {
    hmacSha256.update(getBufferFromFormData(c.data));
  }

  if (c.data) {
    if (c.headers["Content-Type"] === "multipart/form-data") {
      hmacSha256.update(c.data.getBuffer());
    } else {
      hmacSha256.update(Buffer.from(c.data, "utf8"));
    }
  }

  c.headers["X-App-Token"] = APP_TOKEN_KEY;
  c.headers["X-App-Access-Ts"] = time;
  c.headers["X-App-Access-Sig"] = hmacSha256.digest("hex");

  return c;
}

class SumSub {
  constructor() {
    this.axios = axios;
    this.axios.defaults.baseURL = "https://api.sumsub.com";
    this.axios.defaults.headers.common["Accept"] = "application/json";

    this.axios.interceptors.request.use(sign, function (error) {
      return Promise.reject(error);
    });
  }

  getData(externalUserId) {
    return this.axios.get(
      `/resources/applicants/-;externalUserId=${externalUserId}/one`
    );
  }
  requestAccessToken(externalUserId, ttlInSecs = "600") {
    return this.axios.post(
      `/resources/accessTokens?userId=${externalUserId}&ttlInSecs=${ttlInSecs}`
    );
  }
}

module.exports = SumSub;
