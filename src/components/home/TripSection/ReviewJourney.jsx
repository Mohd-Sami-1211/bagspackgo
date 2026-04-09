"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Clock,
  Hotel,
  Users,
  Luggage,
  Navigation,
  ShieldCheck,
  Tag,
  CreditCard,
  ChevronRight,
  User,
  Mail,
  Phone,
} from "lucide-react";

const ReviewJourney = ({ guide, searchParams, tripData: propTripData }) => {
  const router = useRouter();
  const [tripData, setTripData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState("");

  const [showFeeBreakdown, setShowFeeBreakdown] = useState(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Extract useful params
  const category = searchParams?.get("category") || "individual";
  const days = parseInt(searchParams?.get("days")) || 1;
  const count = parseInt(searchParams?.get("count")) || 1;
  const dateParam = searchParams?.get("date");
  const date = dateParam ? new Date(dateParam) : new Date();

  useEffect(() => {
    if (propTripData) {
      setTripData(propTripData);
      setIsLoading(false);
      return;
    }
    const loadData = () => {
      try {
        const storedData = localStorage.getItem("tripData");
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setTripData(parsedData);
        }
      } catch (error) {
        console.error("Error loading trip data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();

    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [propTripData]);

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === "WELCOME10") {
      setAppliedCoupon({ code, type: "percent", value: 10 });
      setCouponMessage("🎉 10% discount applied successfully!");
    } else if (code === "FLAT500") {
      setAppliedCoupon({ code, type: "flat", value: 500 });
      setCouponMessage("🎉 ₹500 discount applied successfully!");
    } else {
      setAppliedCoupon(null);
      setCouponMessage("Invalid or expired coupon code.");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponMessage("");
  };

  const calculatePayment = () => {
    const selectedPkg = tripData?.selectedPackage || {};
    const config = tripData?.tripConfig || {};
    const numPeople = Number(config.count || 1);

    let perPersonPrice = 0;
    let tierDiscountPercent = 0;
    if (selectedPkg?.pricingTiers && selectedPkg.pricingTiers.length > 0) {
      const matchingTier =
        selectedPkg.pricingTiers.find(
          (t) => numPeople >= t.minPeople && numPeople <= t.maxPeople,
        ) || selectedPkg.pricingTiers[0];
      perPersonPrice = Number(matchingTier?.price || 0);
      tierDiscountPercent = Number(matchingTier?.discount || 0);
    } else {
      perPersonPrice = Number(
        selectedPkg?.price?.individual ||
          selectedPkg?.price ||
          guide?.price ||
          0,
      );
    }

    let packageAmount = perPersonPrice * numPeople;
    if (!tripData?.selectedPackage) {
      packageAmount = perPersonPrice * (Number(config.days) || 1) * numPeople;
    }

    // Apply tier-based discount
    const tierDiscount = packageAmount * (tierDiscountPercent / 100);
    const amountAfterTierDiscount = packageAmount - tierDiscount;

    // Apply coupon discount on the tier-discounted amount
    let couponDiscount = 0;
    if (appliedCoupon?.type === "percent") {
      couponDiscount = amountAfterTierDiscount * (appliedCoupon.value / 100);
    } else if (appliedCoupon?.type === "flat") {
      couponDiscount = appliedCoupon.value;
    }
    couponDiscount = Math.min(couponDiscount, amountAfterTierDiscount);

    const totalDiscount = tierDiscount + couponDiscount;
    const amountAfterDiscount = packageAmount - totalDiscount;

    const platformFee = amountAfterDiscount * 0.01;
    const subTotal = amountAfterDiscount + platformFee;
    const gatewayCharges = subTotal * 0.02;
    const gstOnGateway = gatewayCharges * 0.18;

    const convenienceFees = platformFee + gatewayCharges + gstOnGateway;
    const totalAmount = amountAfterDiscount + convenienceFees;

    return {
      packageAmount,
      tierDiscount,
      tierDiscountPercent,
      couponDiscount,
      discount: totalDiscount,
      platformFee,
      gatewayCharges,
      gstOnGateway,
      convenienceFees,
      totalAmount,
    };
  };

  const paymentDetails = tripData ? calculatePayment() : null;

  const handleMakePayment = async () => {
    if (!tripData || !paymentDetails) return;
    if (!agreedToTerms) {
      setPaymentError("Please agree to the Terms & Conditions and Privacy Policy to proceed.");
      return;
    }
    setIsPaymentLoading(true);
    setPaymentError("");

    const selectedPkg = tripData.selectedPackage;
    const guideData = tripData.guide;
    const config = tripData.tripConfig || {};
    const packageId = config.packageId || selectedPkg?.id || selectedPkg?._id;
    const guideId = guideData?.id || guideData?._id;

    if (!packageId || !guideId) {
      setPaymentError(
        "Missing required data. Please go back and select a package again.",
      );
      setIsPaymentLoading(false);
      return;
    }

    try {
      const bookingRes = await fetch("/api/user/trip-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId,
          guideId,
          startDate: config.date || new Date().toISOString(),
          numPeople: Number(config.count || 1),
          category: config.category || "individual",
          baseAmount: paymentDetails.packageAmount,
          discount: paymentDetails.discount,
          platformFee: paymentDetails.platformFee,
          taxes: paymentDetails.gstOnGateway,
          totalAmount: Math.round(paymentDetails.totalAmount),
          arrivalDeparture: tripData.arrivalDeparture || {},
          personalDetails: tripData.personalDetails || {},
          packageSnapshot: {
            name: selectedPkg?.label || selectedPkg?.name || "Trip Package",
            destination: guideData?.location || selectedPkg?.destination || "",
            days: selectedPkg?.days || config.days || 1,
          },
        }),
      });

      const bookingResult = await bookingRes.json();
      if (!bookingResult.success)
        throw new Error(bookingResult.message || "Failed to create booking");

      const { bookingId } = bookingResult;
      const amountToPay = Math.round(paymentDetails.totalAmount);

      const orderRes = await fetch("/api/payments/trip-create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountToPay || 1, bookingId }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success)
        throw new Error(orderData.message || "Order creation failed");

      const { orderId, key } = orderData;
      const isMock =
        !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        orderId?.startsWith("mock_order_");

      if (isMock) {
        const verifyRes = await fetch("/api/payments/trip-verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: orderId,
            razorpay_payment_id: `mock_pay_${Date.now()}`,
            bookingId,
          }),
        });
        const verifyData = await verifyRes.json();
        if (!verifyData.success)
          throw new Error(verifyData.message || "Verification failed");
        
        // Clear pending booking data on success
        localStorage.removeItem("pending_booking");
        
        router.push(
          `/user/trip/booking-success?bookingId=${bookingId}&ref=${verifyData.bookingRef}`,
        );
        return;
      }

      const rzp = new window.Razorpay({
        key,
        amount: amountToPay * 100,
        currency: "INR",
        order_id: orderId,
        name: "bagspackgo",
        description: `Booking: ${selectedPkg?.label || "Trip"}`,
        handler: async (response) => {
          const verifyRes = await fetch("/api/payments/trip-verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            localStorage.removeItem("pending_booking");
            router.push(
              `/user/trip/booking-success?bookingId=${bookingId}&ref=${verifyData.bookingRef}`,
            );
          } else {
            router.push(`/user/trip/booking-failed?return=/user/trip/guidelist/tripdetails/${packageId}`);
          }
        },
        modal: { ondismiss: () => setIsPaymentLoading(false) },
      });
      
      rzp.on('payment.failed', function (response) {
         router.push(`/user/trip/booking-failed?return=/user/trip/guidelist/tripdetails/${packageId}`);
      });
      
      rzp.open();
    } catch (err) {
      console.error("[Payment] Error:", err);
      // setPaymentError(err.message || "Payment failed.");
      // setIsPaymentLoading(false);
      router.push(`/user/trip/booking-failed?return=/user/trip/guidelist/tripdetails/${packageId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-semibold text-gray-400 tracking-wider uppercase text-emerald-600/80">
          Preparing Summary...
        </p>
      </div>
    );
  }

  if (!tripData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-20 text-center px-4">
        <AlertCircle className="w-16 h-16 text-gray-200 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          No Booking Data Found
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          It seems your booking session expired. Please start again.
        </p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2.5 bg-emerald-600 text-white rounded-full font-bold shadow-md shadow-emerald-200 hover:bg-emerald-700 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  const { arrivalDeparture, personalDetails } = tripData;
  const travelers = personalDetails?.personalDetails || [];

  return (
    <div className="min-h-screen bg-[#F0FDF4]/30 pt-0 sm:pt-2 pb-24 lg:pb-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-emerald-200 relative -mt-16 sm:-mt-10 md:-mt-12 lg:-mt-14">
      {/* Hide footer only on this page */}
      <style
        dangerouslySetInnerHTML={{
          __html: `footer { display: none !important; }`,
        }}
      />

      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-[100px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>

      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 relative z-10">
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-4 sm:mb-8">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 text-gray-600 rounded-full hover:bg-gray-50 transition shadow-sm shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-emerald-600 uppercase tracking-[0.15em] mb-0.5">
              Checkout
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-none">
              Review Booking
            </h1>
          </div>
        </div>

        {/* --- Card 1: Trip Overview --- */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-emerald-50/50 p-6 sm:p-8 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>

          <div className="mb-6 pb-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-1">
                {tripData?.selectedPackage?.label ||
                  tripData?.selectedPackage?.name ||
                  "Trip Package"}
              </h2>
              <div className="flex items-center text-gray-500 font-medium text-sm gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-500" />
                {guide?.location || tripData?.selectedPackage?.destination}
              </div>
            </div>
            <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100/50 w-fit shrink-0">
              <p className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase text-emerald-600/80 mb-0.5">
                Travel Dates
              </p>
              <p className="text-sm font-bold text-emerald-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {date.toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex flex-col">
              <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase text-emerald-600/80 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" /> Duration
              </p>
              <p className="font-bold text-gray-800 text-sm sm:text-base">
                {days} Days
              </p>
            </div>
            <div className="flex flex-col">
              <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase text-emerald-600/80 mb-1.5 flex items-center gap-1.5">
                <Hotel className="w-3.5 h-3.5 text-gray-400" /> Stay
              </p>
              <p className="font-bold text-gray-800 text-sm sm:text-base">
                {Math.max(1, days - 1)} Nights
              </p>
            </div>
            <div className="flex flex-col">
              <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase text-emerald-600/80 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-gray-400" /> Guests
              </p>
              <p className="font-bold text-gray-800 text-sm sm:text-base">
                {count} Pax
              </p>
            </div>
            <div className="flex flex-col">
              <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase text-emerald-600/80 mb-1.5 flex items-center gap-1.5">
                <Luggage className="w-3.5 h-3.5 text-gray-400" /> Category
              </p>
              <p className="font-bold text-gray-800 text-sm sm:text-base capitalize">
                {category}
              </p>
            </div>
          </div>
        </div>

        {/* --- Double Grid for Logistics & Travelers --- */}
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Logistics Card */}
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 sm:p-8 flex flex-col">
            <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-emerald-500" /> Transportation
            </h3>
            <div className="flex-1 flex flex-col relative gap-8 ml-2">
              <div className="absolute top-2 bottom-6 left-[7px] w-0.5 bg-gray-100 -z-0"></div>

              {/* Pickup Node */}
              <div className="relative z-10 pl-8">
                <div className="absolute top-0.5 left-0 w-4 h-4 rounded-full border-[4px] border-emerald-100 bg-emerald-500"></div>
                <p className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase text-emerald-600/80 mb-1 line-clamp-1 truncate pr-2">
                  Pickup • {arrivalDeparture?.pickup?.time || "TBD"}
                </p>
                <p
                  className="font-bold text-gray-900 text-sm line-clamp-1"
                  title={
                    arrivalDeparture?.pickup?.address?.label ||
                    arrivalDeparture?.pickup?.address ||
                    "No location chosen"
                  }
                >
                  {arrivalDeparture?.pickup?.address?.label ||
                    arrivalDeparture?.pickup?.address ||
                    "No location chosen"}
                </p>
                {arrivalDeparture?.pickup?.location && (
                  <p className="text-xs font-semibold text-gray-500 mt-0.5">
                    City:{" "}
                    {arrivalDeparture.pickup.location?.label ||
                      arrivalDeparture.pickup.location}
                  </p>
                )}
              </div>

              {/* Dropoff Node */}
              <div className="relative z-10 pl-8">
                <div className="absolute top-0.5 left-0 w-4 h-4 rounded-full border-[4px] border-emerald-100 bg-gray-400"></div>
                <p className="text-[10px] font-bold text-gray-500 tracking-wider uppercase text-emerald-600/80 mb-1 line-clamp-1 truncate pr-2">
                  Drop Off • {arrivalDeparture?.dropoff?.time || "TBD"}
                </p>
                <p
                  className="font-bold text-gray-900 text-sm line-clamp-1"
                  title={
                    arrivalDeparture?.dropoff?.address?.label ||
                    arrivalDeparture?.dropoff?.address ||
                    "No location chosen"
                  }
                >
                  {arrivalDeparture?.dropoff?.address?.label ||
                    arrivalDeparture?.dropoff?.address ||
                    "No location chosen"}
                </p>
                {arrivalDeparture?.dropoff?.location && (
                  <p className="text-xs font-semibold text-gray-500 mt-0.5">
                    City:{" "}
                    {arrivalDeparture.dropoff.location?.label ||
                      arrivalDeparture.dropoff.location}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Travelers Card */}
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col">
            <div className="px-6 py-5 sm:px-8 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-500" /> Travelers
              </h3>
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-xs font-bold">
                {travelers.length} Pax
              </span>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[220px] p-6 sm:p-8 flex flex-col gap-4 custom-scrollbar">
              {travelers.length > 0 ? (
                travelers.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center border border-emerald-100 shrink-0">
                        {t.name ? (
                          t.name.charAt(0)
                        ) : (
                          <User className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 line-clamp-1 max-w-[120px]">
                          {t.name || "Unnamed"}
                        </p>
                        <p className="text-[11px] font-semibold text-gray-500 flex items-center gap-1.5 capitalize">
                          {t.gender?.label || t.gender || "-"}{" "}
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>{" "}
                          {t.age ? `${t.age} yrs` : "-"}
                        </p>
                      </div>
                    </div>
                    {t.idType && (
                      <div className="text-right">
                        <p className="text-[9px] font-bold text-gray-400 tracking-wider uppercase text-emerald-600/80">
                          {t.idType?.label ||
                            (typeof t.idType === "string" ? t.idType : "ID")}
                        </p>
                        <p className="text-xs font-semibold text-gray-700 mt-0.5">
                          {t.idNumber}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-4">
                  <p className="text-xs font-medium text-gray-400">
                    No traveler data
                  </p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 w-full px-6 py-4 flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-semibold text-gray-500 tracking-wide border-t border-gray-100">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3 h-3.5" />{" "}
                {personalDetails?.contactDetails?.email || "No Email"}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3 h-3.5" /> +91{" "}
                {personalDetails?.contactDetails?.mobile || "No Number"}
              </span>
            </div>
          </div>
        </div>

        {/* --- Checkout Control Deck (Hidden on mobile) --- */}
        {paymentDetails && (
          <div className="hidden lg:block bg-white rounded-[32px] shadow-[0_15px_40px_rgb(0,0,0,0.06)] border border-emerald-100 overflow-hidden mt-2">
            <div className="grid md:grid-cols-2">
              {/* Left Side: Coupon & Assurances */}
              <div className="p-6 sm:p-8 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/50 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 tracking-tight mb-4 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-500" /> Have a Promo
                    Code?
                  </h3>
                  <div className="flex flex-col gap-3">
                    {!appliedCoupon ? (
                      <div className="flex gap-2 relative">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="flex-1 w-full bg-white border border-gray-200 rounded-2xl px-5 py-3.5 text-sm font-bold text-gray-800 placeholder:text-gray-400 placeholder:font-medium focus:ring-2 focus:ring-emerald-500 outline-none uppercase shadow-sm transition-all"
                          placeholder="COUPON CODE"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          className="absolute right-1.5 top-1.5 bottom-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-5 transition text-xs shadow-sm active:scale-95"
                        >
                          Apply
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-200/60 px-5 py-3.5 rounded-2xl shadow-sm transition-all">
                        <div className="flex items-center gap-2">
                          <div className="bg-emerald-500 p-1 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          </div>
                          <span className="font-bold text-emerald-800 text-sm tracking-tight">
                            {appliedCoupon.code}
                          </span>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="text-xs font-bold text-emerald-600 hover:text-emerald-800 underline tracking-tight bg-transparent"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                    {couponMessage && (
                      <p
                        className={`text-[11px] font-bold mt-1 px-1 ${appliedCoupon ? "text-emerald-600" : "text-red-500"}`}
                      >
                        {couponMessage}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side: Calculation & Pay Button */}
              <div className="p-6 sm:p-8 flex flex-col">
                <h3 className="text-sm font-bold text-gray-900 tracking-tight mb-6 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-500" /> Payment
                  Summary
                </h3>

                <div className="space-y-4 flex-1">
                  <div className="flex justify-between items-center text-sm font-semibold text-gray-600">
                    <span>Original Package ({count} Slots)</span>
                    <span className="text-gray-900">
                      ₹{paymentDetails.packageAmount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {paymentDetails.tierDiscount > 0 && (
                    <div className="flex justify-between items-center text-sm font-bold text-emerald-600 bg-emerald-50/50 p-2.5 rounded-xl -mx-2.5">
                      <span>Package Discount ({paymentDetails.tierDiscountPercent}% off)</span>
                      <span>
                        -₹{Math.round(paymentDetails.tierDiscount).toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}

                  {paymentDetails.couponDiscount > 0 && (
                    <div className="flex justify-between items-center text-sm font-bold text-emerald-600 bg-emerald-50/50 p-2.5 rounded-xl -mx-2.5">
                      <span>Coupon Savings</span>
                      <span>
                        -₹{Math.round(paymentDetails.couponDiscount).toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}

                  {/* Collapsible Convenience Fees */}
                  <div className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50/30">
                    <button
                      onClick={() => setShowFeeBreakdown(!showFeeBreakdown)}
                      className="w-full flex justify-between items-center p-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        Service & Gateway Fees{" "}
                        <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-bold uppercase">
                          (Incl GST)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900">
                          ₹
                          {paymentDetails.convenienceFees.toLocaleString(
                            "en-IN",
                            { maximumFractionDigits: 1 },
                          )}
                        </span>
                        {showFeeBreakdown ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </button>

                    <AnimatePresence>
                      {showFeeBreakdown && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden border-t border-gray-100 bg-white"
                        >
                          <div className="p-4 flex flex-col gap-3 text-xs font-medium text-gray-500">
                            <div className="flex justify-between">
                              <span>Platform Fee (1%)</span>
                              <span>
                                ₹
                                {paymentDetails.platformFee.toLocaleString(
                                  "en-IN",
                                  { maximumFractionDigits: 1 },
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Payment Gateway Charge (2%)</span>
                              <span>
                                ₹
                                {paymentDetails.gatewayCharges.toLocaleString(
                                  "en-IN",
                                  { maximumFractionDigits: 1 },
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>GST on Gateway (18%)</span>
                              <span>
                                ₹
                                {paymentDetails.gstOnGateway.toLocaleString(
                                  "en-IN",
                                  { maximumFractionDigits: 1 },
                                )}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Final Total & Action */}
                <div className="pt-6 mt-2 border-t border-gray-100">
                  <div className="flex justify-between items-end mb-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase text-emerald-600/80 mb-1">
                        Total Payable
                      </span>
                      <span className="font-bold text-gray-900 text-3xl leading-none tracking-tight">
                        ₹
                        {Math.round(paymentDetails.totalAmount).toLocaleString(
                          "en-IN",
                        )}
                      </span>
                    </div>
                  </div>

                  {paymentError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-bold leading-relaxed flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{paymentError}</span>
                    </div>
                  )}

                  {/* T&C Consent */}
                  <label className={`flex items-start gap-3 mb-5 p-4 rounded-xl border-2 cursor-pointer transition-all ${agreedToTerms ? 'border-emerald-500 bg-emerald-50/50' : 'border-gray-200 hover:border-gray-300 bg-gray-50/30'}`}>
                    <input type="checkbox" checked={agreedToTerms} onChange={(e) => { setAgreedToTerms(e.target.checked); if (e.target.checked) setPaymentError(''); }}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 flex-shrink-0" />
                    <span className="text-xs text-gray-600 leading-relaxed">
                      I agree to bagspackgo&apos;s{' '}
                      <Link href="/terms" target="_blank" className="text-emerald-600 font-bold hover:underline">Terms & Conditions</Link>
                      {' '}and{' '}
                      <Link href="/privacy" target="_blank" className="text-emerald-600 font-bold hover:underline">Privacy Policy</Link>.
                      I understand that cancellation and refunds are subject to the platform&apos;s refund policy.
                    </span>
                  </label>

                  <button
                    onClick={handleMakePayment}
                    disabled={isPaymentLoading}
                    className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed shadow-[0_10px_20px_rgba(16,185,129,0.25)] group"
                  >
                    {isPaymentLoading ? (
                      <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Confirm & Pay Securely
                        <ChevronRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] lg:hidden z-50 flex flex-col origin-bottom rounded-t-3xl transition-transform">
        {/* Expandable Breakdown Drawer */}
        <AnimatePresence>
          {showFeeBreakdown && paymentDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-gray-100 bg-gray-50/50"
            >
              <div className="p-5 flex flex-col gap-4">
                <div className="flex justify-between items-center text-sm font-semibold text-gray-600">
                  <span>Original Package ({count} Slots)</span>
                  <span className="text-gray-900">
                    ₹{paymentDetails.packageAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                {paymentDetails.tierDiscount > 0 && (
                  <div className="flex justify-between items-center text-sm font-bold text-emerald-600 bg-emerald-50/50 p-2.5 rounded-xl -mx-2.5">
                    <span>Package Discount ({paymentDetails.tierDiscountPercent}% off)</span>
                    <span>
                      -₹{Math.round(paymentDetails.tierDiscount).toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
                {paymentDetails.couponDiscount > 0 && (
                  <div className="flex justify-between items-center text-sm font-bold text-emerald-600 bg-emerald-50/50 p-2.5 rounded-xl -mx-2.5">
                    <span>Coupon Savings</span>
                    <span>
                      -₹{Math.round(paymentDetails.couponDiscount).toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-3 border-t border-gray-200">
                  <p className="text-xs font-bold text-gray-800 tracking-wider uppercase text-emerald-600/80">
                    Service & Gateway Fees (Incl GST)
                  </p>
                  <div className="flex justify-between items-center text-xs font-semibold text-gray-500 pl-2">
                    <span>Platform Fee (1%)</span>
                    <span className="text-gray-900">
                      ₹
                      {paymentDetails.platformFee.toLocaleString("en-IN", {
                        maximumFractionDigits: 1,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold text-gray-500 pl-2">
                    <span>Payment Gateway Charge (2%)</span>
                    <span className="text-gray-900">
                      ₹
                      {paymentDetails.gatewayCharges.toLocaleString("en-IN", {
                        maximumFractionDigits: 1,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold text-gray-500 pl-2">
                    <span>GST on Gateway (18%)</span>
                    <span className="text-gray-900">
                      ₹
                      {paymentDetails.gstOnGateway.toLocaleString("en-IN", {
                        maximumFractionDigits: 1,
                      })}
                    </span>
                  </div>
                </div>

                {/* Coupon Input Mobile */}
                <div className="mt-4 flex flex-col gap-3">
                  <label className="text-[10px] font-bold text-gray-400 tracking-wider uppercase text-emerald-600/80">
                    Have a Promo Code?
                  </label>
                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-800 placeholder:text-gray-300 outline-none uppercase shadow-sm"
                        placeholder="ENTER COUPON"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-4 text-xs shadow-sm active:scale-95"
                      >
                        Apply
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-3 py-2.5 rounded-xl shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <div className="bg-emerald-500 p-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        </div>
                        <span className="font-bold text-emerald-800 text-xs tracking-tight">
                          {appliedCoupon.code}
                        </span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-[10px] font-bold text-emerald-600 underline tracking-tight"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  {couponMessage && (
                    <p
                      className={`text-[10px] font-bold mt-0.5 px-0.5 ${appliedCoupon ? "text-emerald-600" : "text-red-500"}`}
                    >
                      {couponMessage}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-4 sm:p-5 flex items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFeeBreakdown(!showFeeBreakdown)}
              className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 active:bg-gray-100 transition shadow-sm shrink-0"
            >
              {showFeeBreakdown ? (
                <ChevronDown className="w-5 h-5" />
              ) : (
                <ChevronUp className="w-5 h-5" />
              )}
            </button>
            <div className="flex flex-col">
              <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase text-emerald-600/80 leading-none">
                Total Payable
              </p>
              <p className="font-bold text-gray-900 text-xl tracking-tight leading-tight mt-0.5">
                ₹
                {Math.round(paymentDetails?.totalAmount || 0).toLocaleString(
                  "en-IN",
                )}
              </p>
            </div>
          </div>
          <button
            onClick={handleMakePayment}
            disabled={isPaymentLoading || !agreedToTerms}
            className={`flex-1 h-12 rounded-xl font-bold tracking-wide shadow-[0_5px_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 active:scale-[0.98] transition ${agreedToTerms ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'} disabled:opacity-75`}
          >
            {isPaymentLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Pay Now</>
            )}
          </button>
        </div>

        {/* Mobile T&C Consent */}
        {!agreedToTerms && (
          <div className="px-4 pb-3 bg-white">
            <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer bg-gray-50/50">
              <input type="checkbox" checked={agreedToTerms} onChange={(e) => { setAgreedToTerms(e.target.checked); if (e.target.checked) setPaymentError(''); }}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 flex-shrink-0" />
              <span className="text-[10px] text-gray-500 leading-relaxed">
                I agree to the{' '}
                <Link href="/terms" target="_blank" className="text-emerald-600 font-bold">Terms</Link>{' & '}
                <Link href="/privacy" target="_blank" className="text-emerald-600 font-bold">Privacy Policy</Link>{' '}
                including the cancellation & refund policy.
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Required Global Styles for Custom Scrollbar within specific areas of this component */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #e5e7eb; border-radius: 20px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #d1d5db; }
      `,
        }}
      />
    </div>
  );
};

export default ReviewJourney;

