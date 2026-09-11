"use client";
import { useState, useEffect, useRef } from "react";
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
  Info,
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
  const [paymentMode, setPaymentMode] = useState('partial'); // 'partial' or 'full'
  const checkoutKeyRef = useRef("");

  // Extract useful params
  const category = searchParams?.get("category") || "individual";
  const daysFromParams = parseInt(searchParams?.get("days"));
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
  }, [propTripData]);

  // Load Razorpay script — always, regardless of how trip data is provided
  useEffect(() => {
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    setAppliedCoupon(null);
    setCouponMessage("Invalid or expired coupon code.");
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
      let matchingTier = selectedPkg.pricingTiers.find(
        (t) => numPeople >= t.minPeople && numPeople <= t.maxPeople,
      );
      if (!matchingTier && selectedPkg.pricingTiers.length > 0) {
        const sortedTiers = [...selectedPkg.pricingTiers].sort((a, b) => a.maxPeople - b.maxPeople);
        matchingTier = numPeople > sortedTiers[sortedTiers.length - 1].maxPeople 
          ? sortedTiers[sortedTiers.length - 1] 
          : sortedTiers[0];
      }
      perPersonPrice = Number(matchingTier?.price || 0);
      tierDiscountPercent = Number(matchingTier?.discount || 0);
    } else {
      perPersonPrice = Number(
        selectedPkg?.price?.[config.category] ||
        selectedPkg?.price?.individual ||
        selectedPkg?.price ||
        guide?.price?.[config.category] ||
        guide?.price?.individual ||
        guide?.price ||
        0
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

  // Resolve days from search params first, then from tripData (localStorage), then fallback to 1
  const days = daysFromParams || parseInt(tripData?.tripConfig?.days) || parseInt(tripData?.selectedPackage?.days) || 1;

  const paymentDetails = tripData ? calculatePayment() : null;

  // Compute amount based on payment mode
  const getPayableAmount = () => {
    if (!paymentDetails) return 0;
    if (paymentMode === 'partial') {
      return Math.round(paymentDetails.totalAmount * 0.3);
    }
    return Math.round(paymentDetails.totalAmount);
  };

  const payableAmount = getPayableAmount();
  const remainingAmount = paymentMode === 'partial' ? Math.round(paymentDetails?.totalAmount || 0) - payableAmount : 0;

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

    let activeBookingId = "";
    try {
      if (!checkoutKeyRef.current) {
        checkoutKeyRef.current = globalThis.crypto?.randomUUID?.()
          || `trip-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      }
      const bookingRes = await fetch("/api/user/trip-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId,
          startDate: config.date || new Date().toISOString(),
          numPeople: Number(config.count || 1),
          category: config.category || "individual",
          paymentMode: paymentMode,
          checkoutKey: checkoutKeyRef.current,
          arrivalDeparture: tripData.arrivalDeparture || {},
          personalDetails: tripData.personalDetails || {},
        }),
      });

      const bookingResult = await bookingRes.json();
      if (!bookingResult.success)
        throw new Error(bookingResult.message || "Failed to create booking");

      const { bookingId } = bookingResult;
      activeBookingId = bookingId;

      const orderRes = await fetch("/api/payments/trip-create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) {
        if (orderData.processing) {
          router.push(`/user/trip/booking-failed?state=processing&bookingId=${bookingId}&return=${encodeURIComponent(`/trip/${packageId}`)}`);
          return;
        }
        const orderError = new Error(orderData.message || "Order creation failed");
        orderError.safeToRetry = true;
        throw orderError;
      }

      const { orderId, key, amount: orderAmount } = orderData;

      if (typeof window.Razorpay !== "function") {
        throw new Error("Payment gateway is still loading. Please wait a moment and try again.");
      }

      const rzp = new window.Razorpay({
        key,
        amount: orderAmount,
        currency: "INR",
        order_id: orderId,
        name: "bagspackgo",
        description: `Booking: ${selectedPkg?.label || "Trip"}`,
        prefill: {
          email: personalDetails?.contactDetails?.email || "",
          contact: personalDetails?.contactDetails?.mobile || "",
          name: travelers?.[0]?.name || "",
        },
        theme: { color: "#059669" },
        handler: async (response) => {
          try {
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
              localStorage.removeItem("tripData");
              router.push(
                `/user/trip/booking-success?bookingId=${bookingId}&ref=${verifyData.bookingRef}`,
              );
              return;
            }

            const state = verifyData.refundInitiated || verifyData.refundPending
              ? "refund"
              : "processing";
            router.push(`/user/trip/booking-failed?state=${state}&bookingId=${bookingId}&return=${encodeURIComponent(`/trip/${packageId}`)}`);
          } catch (error) {
            console.error("[Payment] Verification request failed:", error);
            router.push(`/user/trip/booking-failed?state=processing&bookingId=${bookingId}&return=${encodeURIComponent(`/trip/${packageId}`)}`);
          }
        },
        modal: { ondismiss: () => setIsPaymentLoading(false) },
      });
      
      rzp.on('payment.failed', function (response) {
         router.push(`/user/trip/booking-failed?state=failed&bookingId=${bookingId}&return=${encodeURIComponent(`/trip/${packageId}`)}`);
      });
      
      rzp.open();
    } catch (err) {
      console.error("[Payment] Error:", err);
      // setPaymentError(err.message || "Payment failed.");
      // setIsPaymentLoading(false);
      const state = activeBookingId && !err.safeToRetry ? "processing" : "failed";
      router.push(`/user/trip/booking-failed?state=${state}${activeBookingId ? `&bookingId=${activeBookingId}` : ""}&return=${encodeURIComponent(`/trip/${packageId}`)}`);
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

  const selectedPackage = tripData?.selectedPackage || {};
  const guideData = tripData?.guide || guide || {};
  const tripConfig = tripData?.tripConfig || {};
  const packageName = selectedPackage.label || selectedPackage.name || "Trip Package";
  const destination = selectedPackage.destination || guideData.location || "Destination";
  const travelerCount = Number(tripConfig.count || count || travelers.length || 1);
  const categoryLabel = tripConfig.category || category;
  const pickup = arrivalDeparture?.pickup || {};
  const contact = personalDetails?.contactDetails || {};
  const providerTerms = selectedPackage?.termsAndConditions?.length
    ? selectedPackage.termsAndConditions
    : guideData?.termsAndConditions || [];
  const reviewDate = new Date(tripConfig.date || date);
  const formattedTravelDate = Number.isNaN(reviewDate.getTime())
    ? "Date to be confirmed"
    : reviewDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f3f5f0] pb-12 font-sans text-[#17372f] selection:bg-[#dce88b]">
      <style dangerouslySetInnerHTML={{ __html: "footer { display: none !important; }" }} />

      <div className="absolute inset-x-0 top-0 h-[355px] bg-[#102923]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_15%,rgba(220,232,139,0.13),transparent_28%),radial-gradient(circle_at_12%_80%,rgba(85,139,117,0.18),transparent_35%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[#f3f5f0]" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-10 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-7 flex flex-col gap-5 text-white sm:mb-9 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <button
              type="button"
              onClick={() => router.back()}
              className="relative -top-3 mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/15"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#dce88b]">Final step</p>
            <h1 className="mt-2 max-w-2xl font-serif text-4xl leading-[0.98] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Review your journey.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/65 sm:text-base">
              Check the important details once, choose how you want to pay, and reserve your trip.
            </p>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2.5 text-xs font-semibold text-white/75 backdrop-blur-md sm:flex">
            <ShieldCheck className="h-4 w-4 text-[#dce88b]" />
            Secure checkout
          </div>
        </motion.header>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_410px] xl:gap-8">
          <motion.section
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="space-y-5"
          >
            <article className="overflow-hidden rounded-[1.75rem] border border-[#17372f]/10 bg-white shadow-[0_24px_70px_-52px_rgba(23,55,47,0.7)]">
              <div className="border-b border-[#17372f]/10 p-5 sm:p-7">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#668277]">Your package</p>
                    <h2 className="mt-2 font-serif text-3xl leading-tight tracking-[-0.03em] text-[#17372f] sm:text-4xl">
                      {packageName}
                    </h2>
                    <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-[#668277]">
                      <MapPin className="h-4 w-4 text-emerald-700" />
                      {destination}
                    </p>
                  </div>
                  <div className="shrink-0 rounded-2xl border border-[#17372f]/10 bg-[#edf3ee] px-4 py-3">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#668277]">Starting on</p>
                    <p className="mt-1.5 flex items-center gap-2 text-sm font-bold text-[#17372f]">
                      <Calendar className="h-4 w-4 text-emerald-700" />
                      {formattedTravelDate}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 divide-x divide-y divide-[#17372f]/8 sm:grid-cols-4 sm:divide-y-0">
                {[
                  { label: "Duration", value: days + " days", icon: Clock },
                  { label: "Stay", value: Math.max(1, days - 1) + " nights", icon: Hotel },
                  { label: "Travellers", value: travelerCount + " pax", icon: Users },
                  { label: "Category", value: categoryLabel, icon: Luggage },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#789087]">
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </div>
                    <p className="mt-2 text-sm font-bold capitalize text-[#17372f] sm:text-base">{value}</p>
                  </div>
                ))}
              </div>
            </article>

            <div className="grid gap-5 md:grid-cols-2">
              <article className="rounded-[1.6rem] border border-[#17372f]/10 bg-white p-5 shadow-[0_20px_55px_-45px_rgba(23,55,47,0.65)] sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#789087]">Meeting point</p>
                    <h3 className="mt-1 font-serif text-2xl text-[#17372f]">Pickup details</h3>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf3ee] text-emerald-800">
                    <Navigation className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-[#17372f]/8 bg-[#f7f8f4] p-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#789087]">
                    {pickup.time || "Pickup time"}
                  </p>
                  <p className="mt-2 text-base font-bold leading-snug text-[#17372f]">
                    {pickup.address?.label || pickup.address || "Pickup point not selected"}
                  </p>
                  {pickup.location && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#668277]">
                      <MapPin className="h-3.5 w-3.5" />
                      {pickup.location?.label || pickup.location}
                    </p>
                  )}
                </div>
              </article>

              <article className="overflow-hidden rounded-[1.6rem] border border-[#17372f]/10 bg-white shadow-[0_20px_55px_-45px_rgba(23,55,47,0.65)]">
                <div className="flex items-center justify-between border-b border-[#17372f]/8 px-5 py-4 sm:px-6">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#789087]">Guest list</p>
                    <h3 className="mt-1 font-serif text-2xl text-[#17372f]">Travellers</h3>
                  </div>
                  <span className="rounded-full bg-[#edf3ee] px-3 py-1 text-xs font-bold text-emerald-800">
                    {travelers.length || travelerCount} pax
                  </span>
                </div>

                <div className="custom-scrollbar max-h-[250px] space-y-3 overflow-y-auto p-5 sm:px-6">
                  {travelers.length > 0 ? travelers.map((traveler, index) => (
                    <div key={index} className="flex items-center justify-between gap-3 rounded-2xl bg-[#f7f8f4] p-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#17372f] text-xs font-extrabold text-white">
                          {traveler.name ? traveler.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[#17372f]">{traveler.name || "Traveller"}</p>
                          <p className="mt-0.5 text-[11px] font-semibold capitalize text-[#789087]">
                            {[traveler.gender?.label || traveler.gender, traveler.age ? traveler.age + " yrs" : null].filter(Boolean).join(" · ") || "Guest details"}
                          </p>
                        </div>
                      </div>
                      {traveler.idType && (
                        <p className="max-w-[90px] truncate text-[10px] font-bold uppercase tracking-wide text-[#789087]">
                          {traveler.idType?.label || traveler.idType}
                        </p>
                      )}
                    </div>
                  )) : (
                    <p className="py-8 text-center text-sm font-semibold text-[#789087]">No traveller details available.</p>
                  )}
                </div>

                <div className="space-y-2 border-t border-[#17372f]/8 bg-[#edf3ee]/60 px-5 py-4 text-xs font-semibold text-[#668277] sm:px-6">
                  {contact.email && (
                    <p className="flex items-center gap-2 break-all">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      {contact.email}
                    </p>
                  )}
                  {contact.mobile && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      +91 {contact.mobile}
                    </p>
                  )}
                </div>
              </article>
            </div>

            <div className="grid gap-3 rounded-[1.5rem] border border-[#17372f]/10 bg-[#e8eee8] p-4 sm:grid-cols-3 sm:p-5">
              {[
                "Secure Razorpay payment",
                "Booking details protected",
                "Support when you need it",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs font-bold text-[#355c50]">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
                  {item}
                </div>
              ))}
            </div>
          </motion.section>

          {paymentDetails && (
            <motion.aside
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              className="overflow-hidden rounded-[1.75rem] border border-[#17372f]/10 bg-white shadow-[0_28px_80px_-48px_rgba(23,55,47,0.75)] lg:sticky lg:top-6"
            >
              <div className="relative overflow-hidden bg-[#17372f] p-5 text-white sm:p-6">
                <div className="absolute -right-10 -top-14 h-36 w-36 rounded-full bg-[#dce88b]/12 blur-3xl" />
                <p className="relative text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#dce88b]">Payment summary</p>
                <div className="relative mt-3 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-white/55">Total trip value</p>
                    <p className="mt-1 font-serif text-4xl tracking-[-0.04em]">
                      ₹{Math.round(paymentDetails.totalAmount).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <CreditCard className="mb-1 h-6 w-6 text-white/45" />
                </div>
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4 text-[#668277]">
                    <span>Package · {travelerCount} pax</span>
                    <span className="font-bold text-[#17372f]">₹{paymentDetails.packageAmount.toLocaleString("en-IN")}</span>
                  </div>
                  {paymentDetails.tierDiscount > 0 && (
                    <div className="flex items-center justify-between gap-4 font-bold text-emerald-700">
                      <span>Package saving ({paymentDetails.tierDiscountPercent}%)</span>
                      <span>-₹{Math.round(paymentDetails.tierDiscount).toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  {paymentDetails.couponDiscount > 0 && (
                    <div className="flex items-center justify-between gap-4 font-bold text-emerald-700">
                      <span>Coupon saving</span>
                      <span>-₹{Math.round(paymentDetails.couponDiscount).toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="overflow-hidden rounded-2xl border border-[#17372f]/10">
                    <button
                      type="button"
                      onClick={() => setShowFeeBreakdown((visible) => !visible)}
                      className="flex w-full items-center justify-between gap-3 bg-[#f7f8f4] px-4 py-3 text-left text-xs font-bold text-[#4f6f64]"
                    >
                      <span>Service & payment fees</span>
                      <span className="flex items-center gap-2 text-[#17372f]">
                        ₹{paymentDetails.convenienceFees.toLocaleString("en-IN", { maximumFractionDigits: 1 })}
                        {showFeeBreakdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </span>
                    </button>
                    <AnimatePresence>
                      {showFeeBreakdown && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-2.5 border-t border-[#17372f]/8 px-4 py-3 text-xs text-[#789087]">
                            <div className="flex justify-between"><span>Platform fee</span><span>₹{paymentDetails.platformFee.toLocaleString("en-IN", { maximumFractionDigits: 1 })}</span></div>
                            <div className="flex justify-between"><span>Payment gateway</span><span>₹{paymentDetails.gatewayCharges.toLocaleString("en-IN", { maximumFractionDigits: 1 })}</span></div>
                            <div className="flex justify-between"><span>GST on gateway</span><span>₹{paymentDetails.gstOnGateway.toLocaleString("en-IN", { maximumFractionDigits: 1 })}</span></div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="border-t border-[#17372f]/10 pt-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-emerald-700" />
                    <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#668277]">Promo code</p>
                  </div>
                  {!appliedCoupon ? (
                    <div className="relative">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(event) => setCouponCode(event.target.value)}
                        placeholder="ENTER CODE"
                        className="h-11 w-full rounded-full border border-[#17372f]/12 bg-[#f7f8f4] pl-4 pr-20 text-xs font-bold uppercase text-[#17372f] outline-none transition placeholder:text-[#92a39d] focus:border-emerald-700"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="absolute bottom-1 right-1 top-1 rounded-full bg-[#17372f] px-4 text-xs font-bold text-white transition hover:bg-[#244c41]"
                      >
                        Apply
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                      <span className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                        <CheckCircle2 className="h-4 w-4" />
                        {appliedCoupon.code}
                      </span>
                      <button type="button" onClick={removeCoupon} className="text-xs font-bold text-emerald-700">Remove</button>
                    </div>
                  )}
                  {couponMessage && (
                    <p className={appliedCoupon ? "mt-2 text-xs font-bold text-emerald-700" : "mt-2 text-xs font-bold text-rose-600"}>
                      {couponMessage}
                    </p>
                  )}
                </div>

                <div className="border-t border-[#17372f]/10 pt-5">
                  <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.14em] text-[#668277]">How would you like to pay?</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMode("partial")}
                      aria-pressed={paymentMode === "partial"}
                      className={paymentMode === "partial"
                        ? "relative rounded-2xl border-2 border-emerald-700 bg-[#edf3ee] p-3.5 text-left"
                        : "relative rounded-2xl border border-[#17372f]/12 bg-white p-3.5 text-left transition hover:border-[#17372f]/30"}
                    >
                      <span className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#668277]">Pay 30% now</span>
                      <strong className="mt-1 block text-lg text-emerald-800">₹{Math.round(paymentDetails.totalAmount * 0.3).toLocaleString("en-IN")}</strong>
                      <span className="mt-1 block text-[10px] leading-snug text-[#789087]">Reserve with less today</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMode("full")}
                      aria-pressed={paymentMode === "full"}
                      className={paymentMode === "full"
                        ? "relative rounded-2xl border-2 border-emerald-700 bg-[#edf3ee] p-3.5 text-left"
                        : "relative rounded-2xl border border-[#17372f]/12 bg-white p-3.5 text-left transition hover:border-[#17372f]/30"}
                    >
                      <span className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#668277]">Pay in full</span>
                      <strong className="mt-1 block text-lg text-[#17372f]">₹{Math.round(paymentDetails.totalAmount).toLocaleString("en-IN")}</strong>
                      <span className="mt-1 block text-[10px] leading-snug text-[#789087]">Nothing due later</span>
                    </button>
                  </div>

                  {paymentMode === "partial" && (
                    <div className="mt-3 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <p className="text-[11px] font-medium leading-relaxed text-amber-800">
                        Pay ₹{remainingAmount.toLocaleString("en-IN")} on the trip day.
                      </p>
                    </div>
                  )}
                </div>

                {providerTerms.length > 0 && (
                  <div className="rounded-2xl border border-[#17372f]/10 bg-[#f7f8f4] p-4">
                    <p className="text-xs font-bold text-[#17372f]">Provider terms</p>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] leading-relaxed text-[#668277]">
                      {providerTerms.map((term, index) => <li key={index}>{term}</li>)}
                    </ul>
                  </div>
                )}

                <label className={agreedToTerms
                  ? "flex cursor-pointer items-start gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-3.5"
                  : "flex cursor-pointer items-start gap-3 rounded-2xl border border-[#17372f]/12 bg-white p-3.5 transition hover:bg-[#f7f8f4]"}>
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(event) => {
                      setAgreedToTerms(event.target.checked);
                      if (event.target.checked) setPaymentError("");
                    }}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-emerald-700 focus:ring-emerald-700"
                  />
                  <span className="text-[11px] leading-relaxed text-[#668277]">
                    I agree to the <Link href="/terms" target="_blank" className="font-bold text-emerald-800 hover:underline">Terms</Link>,{" "}
                    <Link href="/privacy" target="_blank" className="font-bold text-emerald-800 hover:underline">Privacy Policy</Link>, provider terms, and the cancellation policy.
                  </span>
                </label>

                {paymentError && (
                  <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold leading-relaxed text-rose-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {paymentError}
                  </div>
                )}

                <div className="rounded-2xl bg-[#edf3ee] p-4">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#668277]">
                        {paymentMode === "partial" ? "Paying now · 30%" : "Paying now"}
                      </p>
                      <p className="mt-1 font-serif text-3xl tracking-[-0.03em] text-[#17372f]">₹{payableAmount.toLocaleString("en-IN")}</p>
                    </div>
                    {paymentMode === "partial" && (
                      <p className="pb-1 text-right text-[10px] font-semibold text-[#789087]">
                        of ₹{Math.round(paymentDetails.totalAmount).toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleMakePayment}
                  disabled={isPaymentLoading}
                  className="group flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[#17372f] px-5 text-sm font-bold text-white shadow-[0_16px_35px_-18px_rgba(23,55,47,0.9)] transition hover:bg-[#244c41] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-65"
                >
                  {isPaymentLoading ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/25 border-t-white" />
                  ) : (
                    <>
                      {paymentMode === "partial" ? <>Pay ₹{payableAmount.toLocaleString("en-IN")} now</> : "Confirm & pay securely"}
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>

                <p className="flex items-center justify-center gap-1.5 text-[10px] font-semibold text-[#789087]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Encrypted payment powered by Razorpay
                </p>
              </div>
            </motion.aside>
          )}
        </div>
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: ".custom-scrollbar::-webkit-scrollbar{width:5px}.custom-scrollbar::-webkit-scrollbar-track{background:transparent}.custom-scrollbar::-webkit-scrollbar-thumb{background:#d5ddd8;border-radius:20px}",
        }}
      />
    </div>
  );
};

export default ReviewJourney;
