"use strict";

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/stripe-webhook",
      handler: "stripe-webhook.authorizeUser",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
