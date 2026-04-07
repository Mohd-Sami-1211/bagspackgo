"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, RefreshCw, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Suspense } from "react";

function TrekBookingFailedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // They can pass a return path to go straight back to data entry
  const returnPath = searchParams.get("return") || "/user/trek";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-red-50/30 -z-10"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-100 rounded-full blur-[100px] -z-10 opacity-60"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-red-50"
      >
        <div className="bg-red-500 p-8 flex flex-col items-center justify-center text-white relative overflow-hidden">
          {/* Subtle animated blip */}
          <motion.div 
             animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
             transition={{ duration: 2, repeat: Infinity }}
             className="absolute w-32 h-32 bg-white/20 rounded-full"
          />
          <XCircle className="w-16 h-16 mb-4 relative z-10 drop-shadow-md text-red-100" />
          <h1 className="text-2xl font-black tracking-tight relative z-10 text-center">Payment Unsuccessful</h1>
          <p className="text-red-100 font-medium text-sm mt-2 text-center relative z-10 max-w-[250px]">
            We couldn't process your payment. Don't worry, your booking details are safe.
          </p>
        </div>

        <div className="p-8 pb-10">
          <div className="flex items-start gap-3 bg-red-50 text-red-800 p-4 rounded-xl border border-red-100 mb-8 text-sm font-semibold">
             <AlertTriangle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
             <p>Your session and traveler details have been preserved. You won't need to retype them.</p>
          </div>

          <div className="space-y-3">
             <button
               onClick={() => router.push(returnPath)}
               className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-2xl transition shadow-xl shadow-gray-900/10 active:scale-[0.98]"
             >
               <ArrowLeft className="w-5 h-5" /> Back to Booking Form
             </button>
             
             <button
               onClick={() => router.back()}
               className="w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold py-3.5 rounded-2xl transition active:scale-[0.98]"
             >
               <RefreshCw className="w-5 h-5 text-gray-400" /> Try Payment Again
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
