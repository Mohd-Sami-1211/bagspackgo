// src/utils/razorpayOptions.js
import { verifyPayment } from "./verifyPayment";// Import your axios verify function

export const getRazorpayOptions = (order) => {
  return {
    key: process.env.NEXT_PUBLIC_RAZORPAY_API_KEY, // Enter your Key ID
    amount: order.amount,
    currency: order.currency,
    name: "BagsPackGo",
    description: "Event Booking Payment",
    order_id: order.id, // This is the ID you just generated
    handler: async function (response) {
      // 2. This runs after successful payment
      await verifyPayment(response);
    },
    prefill: {
      email: "user@example.com",
      contact: "9999999999"
    },
    theme: { color: "#3399cc" }
  };
};
