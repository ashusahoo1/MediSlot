import express from "express";
import Stripe from "stripe";
import {Appointment} from "../models/appointment.model.js";
import {ApiError} from "../utils/ApiError.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const fulfillAppointmentBooking = async (appointmentId) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new ApiError(404, "Appointment not found");

  appointment.status = "booked";
  await appointment.save();

  console.log(`✅ Appointment ${appointmentId} marked as booked.`);
};

// Stripe requires the raw body to validate signature
router.post("/webhook",express.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook Error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ✅ Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      try {
        await fulfillAppointmentBooking(session.metadata?.appointmentId);
      } catch (err) {
        console.error("Error fulfilling booking:", err.message);
      }
    }

    res.status(200).json({ received: true });
  }
);

// Stripe sends Receipt emails automatically if customer_email is provided and receipts are enabled in Stripe Dashboard.
router.get("/session/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],//use to send receipt
    });

    const receiptUrl = session.payment_intent?.charges?.data[0]?.receipt_url;

    res.status(200).json({
      session,
      receiptUrl,
    });
  } catch (err) {
    console.error("Stripe session fetch error:", err.message);
    res.status(400).json({ message: "Failed to fetch session details" });
  }
});


export default router;
