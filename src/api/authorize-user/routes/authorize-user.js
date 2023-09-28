module.exports = {
  routes: [
    {
      method: "POST",
      path: "/authorize-user",
      handler: "authorize-user.authorizeUser",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
