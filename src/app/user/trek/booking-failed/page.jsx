"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, CheckCircle2, LoaderCircle, RefreshCw, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Suspense, useCallback, useEffect, useState } from "react";

const COPY = {
  failed: {
    title: "Payment was not completed",
    description: "No confirmed payment was found for this attempt. Your trek details are still saved.",
    tone: "bg-red-500",
  },
  processing: {
    title: "We’re checking your payment",
    description: "Razorpay may still be confirming it. Please don’t pay again while this check is in progress.",
    tone: "bg-[#17372f]",
  },
  refund: {
    title: "Your refund is being arranged",
    description: "Your payment was received after the booking could not be completed. Once initiated, it should return to the original payment method within 3 business days.",
    tone: "bg-amber-600",
  },
};

function TrekBookingFailedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnPath = searchParams.get("return") || "/user/trek";
  const bookingId = searchParams.get("bookingId") || "";
  const initialState = searchParams.get("state") || "failed";
  const [state, setState] = useState(COPY[initialState] ? initialState : "failed");
  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(false);

  const checkStatus = useCallback(async () => {
    if (!bookingId) return;
    setChecking(true);
    try {
      const response = await fetch(`/api/payments/trek-status?bookingId=${encodeURIComponent(bookingId)}`, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      const result = await response.json();
      if (result.state === "confirmed") {
        localStorage.removeItem("pending_booking");
        localStorage.removeItem("trekData");
        router.replace(`/user/trek/booking-success?bookingId=${bookingId}&ref=${encodeURIComponent(result.bookingRef || "")}`);
        return;
      }
      if (["refund_initiated", "refund_processing"].includes(result.state)) setState("refund");
      else if (result.state === "failed") setState("failed");
      else setState("processing");
      setMessage(result.message || "");
    } catch {
      setState("processing");
      setMessage("The status check is temporarily unavailable. Please wait a moment and check again.");
    } finally {
      setChecking(false);
    }
  }, [bookingId, router]);

  useEffect(() => {
    if (state !== "processing" || !bookingId) return undefined;
    let stopped = false;
    let attempts = 0;
    let timer;
    const poll = async () => {
      if (stopped || attempts >= 6) return;
      attempts += 1;
      await checkStatus();
      if (!stopped) timer = setTimeout(poll, 4000);
    };
    poll();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [bookingId, checkStatus, state]);

  const content = COPY[state];
  const Icon = state === "processing" ? LoaderCircle : state === "refund" ? CheckCircle2 : XCircle;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
      >
        <div className={`${content.tone} p-8 flex flex-col items-center text-white`}>
          <Icon className={`w-14 h-14 mb-4 ${state === "processing" || checking ? "animate-spin" : ""}`} />
          <h1 className="text-2xl font-black tracking-tight text-center">{content.title}</h1>
          <p className="text-white/85 font-medium text-sm mt-2 text-center max-w-sm">{content.description}</p>
        </div>

        <div className="p-8 pb-10">
          <div className="flex items-start gap-3 bg-slate-50 text-slate-700 p-4 rounded-xl border border-slate-100 mb-7 text-sm font-semibold">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
            <p>{message || (state === "failed" ? "You can safely return to the booking form and try again." : "We will keep the booking linked to this payment while its final status is checked.")}</p>
          </div>

          <div className="space-y-3">
            {state === "processing" && bookingId && (
              <button onClick={checkStatus} disabled={checking} className="w-full flex items-center justify-center gap-2 bg-[#17372f] text-white font-bold py-4 rounded-2xl disabled:opacity-60">
                <RefreshCw className={`w-5 h-5 ${checking ? "animate-spin" : ""}`} /> Check payment status
              </button>
            )}
            {state === "failed" && (
              <button onClick={() => router.push(returnPath)} className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-2xl">
                <RefreshCw className="w-5 h-5" /> Try payment again
              </button>
            )}
            <button onClick={() => router.push("/user/trek")} className="w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 font-bold py-3.5 rounded-2xl">
              <ArrowLeft className="w-5 h-5 text-gray-400" /> Back to treks
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function TrekBookingFailed() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <TrekBookingFailedContent />
    </Suspense>
  );
}
