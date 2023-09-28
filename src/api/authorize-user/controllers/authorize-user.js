"use strict";

module.exports = {
  async authorizeUser(ctx, next) {
    const email = ctx.request.body.customer_email;

    console.log(ctx.request.body);

    try {
      // Buscar un usuario por correo electrónico
      const user = await strapi
        .query("plugin::users-permissions.user")
        .findOne({ email }, ["id", "email", "blocked"]);

      const updatedUser = await strapi.entityService.update(
        "plugin::users-permissions.user",
        user.id,
        {
          data: {
            blocked: false,
          },
        }
      );
      return updatedUser;
    } catch (err) {
      ctx.badRequest("Error al procesar webhook stripe:", {
        moreDetails: err,
      });
      throw err;
    }
  },
};
