"use strict";
const Stripe = require("stripe");
const unparsed = require("koa-body/unparsed.js");

// @ts-ignore
const stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY);

const webhookSecret = "whsec_7jbjwRRUzK7cjHzlHOVAHx1JE23QviKa"; // cambiar cuando se lleve a producción y sustituirlo por variable de entorno

module.exports = {
  async authorizeUser(ctx, next) {
    const sig = ctx.request.headers["stripe-signature"];
    let event;
    console.log('este es el body RAW')
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
    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        console.log(`PaymentIntent for ${object.amount} was successful!`);
        break;
      case "payment_method.attached":
        const paymentMethod = event.data.object;
        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        break;
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }

    console.log(event);

    try {
      const { email } = object;
      // Buscar un usuario por correo electrónico
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
      return updatedUser;
    } catch (err) {
      ctx.badRequest("Error al procesar webhook stripe:", {
        moreDetails: err,
      });
      throw err;
    }
  },
};
