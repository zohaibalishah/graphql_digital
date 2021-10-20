const { DataSource } = require("apollo-datasource");
const SumSumb = require("../lib/sumsub");

class SumSubAPI extends DataSource {
  constructor({ store }) {
    super();

    this.sumsub = new SumSumb();
    this.knex = store.knex;
  }

  initialize(config) {
    this.context = config.context;
  }

  async requestAccessToken(externalUserId) {
    try {
      const { data } = await this.sumsub.requestAccessToken(externalUserId);

      return data;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async getStatus(externalUserId) {
    try {
      const { data } = await this.sumsub.getData(externalUserId);
      const { reviewStatus, reviewResult } = data.review;
      const sumSubReview = {};

      switch (reviewStatus) {
        case "init":
          sumSubReview.status = "init";
          sumSubReview.answer = null;
          break;
        case "pending":
          sumSubReview.status = "pending";
          sumSubReview.answer = null;
          break;
        case "queued":
          sumSubReview.status = "queued";
          sumSubReview.answer = null;
          break;
        case "completed":
          sumSubReview.status = "completed";
          sumSubReview.answer = reviewResult.reviewAnswer;
          sumSubReview.moderationComment =
            reviewResult.moderationComment || null;
          sumSubReview.rejectLabels = reviewResult.rejectLabels || null;
          sumSubReview.reviewRejectType = reviewResult.reviewRejectType || null;
          break;
        case "onHold":
          sumSubReview.status = "onHold";
          sumSubReview.answer = null;
          break;
        default:
          throw new Error("Unable to get review status.");
      }
      return sumSubReview;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}

module.exports = SumSubAPI;
