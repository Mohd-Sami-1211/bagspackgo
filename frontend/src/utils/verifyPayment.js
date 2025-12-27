import axios from "axios";

export async function verifyPayment(razorpayResponse) {
  try {

    const res = await axios.post("/api/verifyPayment", {
      razorpay_order_id: razorpayResponse.razorpay_order_id,
      razorpay_payment_id: razorpayResponse.razorpay_payment_id,
      razorpay_signature: razorpayResponse.razorpay_signature,
    });

    if (res.status === 200) {
      alert("Payment Successful! Your booking is confirmed.");
      
      window.location.href = "/user/bookings";
    }
  } catch (error) {
    
    const errorMessage = error.response?.data?.error || "Payment verification failed";
    console.error("Verification Error:", error);
    alert("Verification failed: " + errorMessage);
  }
}
