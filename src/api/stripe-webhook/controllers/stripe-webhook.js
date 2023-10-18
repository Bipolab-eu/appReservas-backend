"use strict";
const Stripe = require("stripe");
const unparsed = require("koa-body/unparsed.js");

// @ts-ignore
const stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY, {
  apiVersion: "2023-08-16",
});

const webhookSecret = "whsec_7jbjwRRUzK7cjHzlHOVAHx1JE23QviKa"; // cambiar cuando se lleve a producción y sustituirlo por variable de entorno

module.exports = {
  async authorizeUser(ctx, next) {
    const sig = ctx.request.headers["stripe-signature"];
    let event;
    console.log(ctx.request.body)
    try {
      event = stripe.webhooks.constructEvent(
        ctx.request.body[unparsed],
        sig,
        webhookSecret
      );
    } catch (err) {
      console.log(`❌ Error message: ${err.message}`);
      ctx.response.status = 400;
      ctx.body = `Webhook Error: ${err.message}`;
      return await next();
    }

    const { object } = event.data;

    console.log(event);

    try {
    } catch (err) {
      ctx.badRequest("Error al procesar webhook stripe:", {
        moreDetails: err,
      });
      throw err;
    }

    // Handle Stripe events

    try {
      switch (event.type) {
        case "invoice.payment_.succeeded":
          const { email } = object;
          // Buscar un usuario por correo electrónico despues del pago con el email que llega en el evento:
          // (Podríamos pasar el id una vez creado el cliente en Strapi, y nos ahorramos buscarlo por email) ya que Koa solo tiene un metodo para actualizar y es por ID)
          const user = await strapi
            .query("plugin::users-permissions.user")
            .findOne({ email }, ["id", "email", "blocked"]);
          if (!user) return;

          const updatedUser = await strapi.entityService.update(
            "plugin::users-permissions.user",
            user.id,
            {
              data: {
                blocked: false,
              },
            }
          );
          console.log(
            `Invoce payment for ${object.amount} was successful!\n User with email ${email} authorized!`
          );
          return updatedUser;
        case "invoice.payment_.succeeded":
        default:
          // Unexpected event type
          console.log(`Unhandled event type ${event.type}.`);
      }
    } catch (error) {
      return ctx.badRequest(`Error al procesar el evento: ${error}`);
    }
  },
};
