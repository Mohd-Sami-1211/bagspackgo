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

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="p-8 flex flex-col items-center justify-center text-center">
          {isSoldOut ? (
            <>
              <Ticket className="w-16 h-16 text-amber-500 mb-6" />
              <h1 className="text-2xl font-bold tracking-tight mb-2 text-foreground">Event Sold Out</h1>
              <p className="text-muted-foreground text-sm max-w-[300px]">
                This event was fully booked while your payment was processing. Your payment will be <strong className="text-gray-800">automatically refunded within 5–7 business days</strong>.
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
          {isSoldOut ? (
            <div className="flex items-start gap-3 bg-amber-50 text-amber-800 p-4 rounded-md border border-amber-100 mb-8 text-sm">
               <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
               <p className="font-medium">No action is needed from your side. If you don't receive the refund within 7 days, please contact support.</p>
            </div>
          ) : (
            <div className="flex items-start gap-3 bg-red-50 text-red-800 p-4 rounded-md border border-red-100 mb-8 text-sm">
               <AlertTriangle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
               <p className="font-medium">Your session and traveler details have been preserved. You won't need to retype them.</p>
            </div>
          )}

          <div className="space-y-3">
             {isSoldOut ? (
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
