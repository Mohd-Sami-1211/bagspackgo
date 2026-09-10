"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, RefreshCw, XCircle, Ticket } from "lucide-react";
import { motion } from "framer-motion";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";

function EventBookingFailedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // They can pass a return path to go straight back to data entry
  const returnPath = searchParams.get("return") || "/user/events";
  const isSoldOut = searchParams.get("soldOut") === "true";
  const isExpired = searchParams.get("expired") === "true";
  const paymentCaptured = searchParams.get("paymentCaptured") === "true";
  const refundInitiated = searchParams.get("refundInitiated") === "true";
  const refundAmount = searchParams.get("refundAmount");
  const orderId = searchParams.get("orderId");
  const paymentId = searchParams.get("paymentId");
  const refundId = searchParams.get("refundId");
  const isRefundableFailure = isSoldOut || isExpired || paymentCaptured || refundInitiated;
  const isPaymentRefund = paymentCaptured || refundInitiated;

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="p-8 flex flex-col items-center justify-center text-center">
          {isRefundableFailure ? (
            <>
              <Ticket className="w-16 h-16 text-amber-500 mb-6" />
              <h1 className="text-2xl font-bold tracking-tight mb-2 text-foreground">{isPaymentRefund ? 'Booking Not Completed' : isExpired ? 'Checkout Expired' : 'Event Sold Out'}</h1>
              <p className="text-muted-foreground text-sm max-w-[300px]">
                {isPaymentRefund
                  ? <>Your payment was received, but the booking could not be completed. This may happen if the 5-minute checkout window expired or the event became unavailable. The refund {refundInitiated ? 'has been initiated' : 'is being processed'} and should reach your original payment method within <strong className="text-gray-800">3 business days</strong>.</>
                  : isExpired
                    ? <>The checkout window ended before confirmation. Your payment will be <strong className="text-gray-800">automatically refunded in full</strong>.</>
                    : <>This event was fully booked while your payment was processing. Your payment will be <strong className="text-gray-800">automatically refunded within 3 business days</strong>.</>}
              </p>
            </>
          ) : (
            <>
              <XCircle className="w-16 h-16 text-destructive mb-6" />
              <h1 className="text-2xl font-bold tracking-tight mb-2 text-foreground">Payment Unsuccessful</h1>
              <p className="text-muted-foreground text-sm max-w-[280px]">
                We couldn't process your payment. Don't worry, your booking details are safe.
              </p>
            </>
          )}
        </div>

        <div className="px-8 pb-8">
          {isRefundableFailure ? (
            <div className="flex items-start gap-3 bg-amber-50 text-amber-800 p-4 rounded-md border border-amber-100 mb-8 text-sm">
               <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
               <p className="font-medium">No action is needed from your side. If the refund is not reflected within 3 business days, contact support and share the Razorpay details below.</p>
            </div>
          ) : (
            <div className="flex items-start gap-3 bg-red-50 text-red-800 p-4 rounded-md border border-red-100 mb-8 text-sm">
               <AlertTriangle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
               <p className="font-medium">Your session and traveler details have been preserved. You won't need to retype them.</p>
            </div>
          )}

          {isPaymentRefund && (orderId || paymentId || refundId || refundAmount) && (
            <div className="mb-8 rounded-md border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
              <p className="mb-3 font-bold uppercase tracking-wider text-slate-800">Razorpay reference details</p>
              <div className="space-y-2 break-all font-mono">
                {refundAmount && <p><span className="font-sans font-semibold text-slate-500">Refund amount:</span> ₹{Number(refundAmount).toLocaleString('en-IN')}</p>}
                {orderId && <p><span className="font-sans font-semibold text-slate-500">Order ID:</span> {orderId}</p>}
                {paymentId && <p><span className="font-sans font-semibold text-slate-500">Payment ID:</span> {paymentId}</p>}
                {refundId && <p><span className="font-sans font-semibold text-slate-500">Refund ID:</span> {refundId}</p>}
              </div>
            </div>
          )}

          <div className="space-y-3">
             {isRefundableFailure ? (
               <>
                 <Button
                   variant="default"
                   size="lg"
                   className="w-full font-semibold"
                   onClick={() => router.push("/user/events")}
                 >
                   Browse Other Events
                 </Button>
                 <Button
                   variant="outline"
                   size="lg"
                   className="w-full font-semibold"
                   onClick={() => router.push("/user/bookings")}
                 >
                   View My Bookings
                 </Button>
               </>
             ) : (
               <>
                 <Button
                   variant="default"
                   size="lg"
                   className="w-full font-semibold"
                   onClick={() => router.push(returnPath)}
                 >
                   <ArrowLeft className="w-4 h-4 mr-2" /> Back to Booking Form
                 </Button>
                 
                 <Button
                   variant="outline"
                   size="lg"
                   className="w-full font-semibold"
                   onClick={() => router.back()}
                 >
                   <RefreshCw className="w-4 h-4 mr-2" /> Try Payment Again
                 </Button>
               </>
             )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function EventBookingFailed() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <EventBookingFailedContent />
    </Suspense>
  );
}
