'use client';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * VideoCard
 * - Only ONE instance is ever mounted at a time (parent ensures that).
 * - Respects `isVisible` from the parent's useInView — pauses when off-screen.
 * - Uses the `poster` attribute so a thumbnail shows while the video file loads.
 * - On mobile the video is NOT auto-started until the card is visible.
 */
const VideoCard = ({
  media,
  name,
  description,
  locations,
  color = 'from-green-500 to-green-700',
  textColor = 'text-white',
  isFlipped,
  onClick,
  isVisible = true,
}) => {
  const videoRef = useRef(null);

  // Play / pause based on flip state and viewport visibility
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!isFlipped && isVisible) {
      video.play().catch(() => {/* autoplay blocked — poster is still shown */});
    } else {
      video.pause();
    }
  }, [isFlipped, isVisible]);

  return (
    <div
      className="relative h-full w-full cursor-pointer select-none"
      onClick={onClick}
      aria-label={isFlipped ? 'Flip back' : 'Flip to see details'}
    >
      <AnimatePresence mode="popLayout">
        {!isFlipped ? (
          <motion.div
            key="front"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0"
          >
            <div className="relative h-full w-full overflow-hidden rounded-xl sm:rounded-2xl shadow-lg">
              {/* Dark gradient overlay so text is always readable */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent z-10 pointer-events-none" />

              {/* Name + tap-hint */}
              <div className="absolute bottom-4 left-4 z-20 pr-16">
                <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight drop-shadow">{name}</h3>
                <p className="text-white/80 text-xs mt-1 hidden sm:block">Tap to see details</p>
              </div>

              {/* Tap hint on mobile (bottom-right) */}
              <div className="absolute bottom-3 right-3 z-20 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1 text-white text-[10px] font-medium sm:hidden">
                tap
              </div>

              {/*
                Video:
                - preload="metadata" so thumbnail loads and video begins quickly
                - poster shows the first frame thumbnail immediately (no blank box)
                - playsInline required for iOS
              */}
              <video
                ref={videoRef}
                src={media.src}
                className="h-full w-full object-cover"
                loop
                muted
                playsInline
                preload="auto"
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="back"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
            className={`absolute inset-0 bg-gradient-to-br ${color} ${textColor} p-5 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg overflow-y-auto`}
          >
            <h3 className="text-xl sm:text-2xl font-bold mb-3">{name}</h3>
            <p className="mb-4 leading-relaxed text-sm sm:text-base opacity-95">{description}</p>
            <h4 className="font-semibold mb-2 text-sm uppercase tracking-wider opacity-80">Popular Locations</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {locations?.map((loc, i) => <li key={i}>{loc}</li>)}
            </ul>
            <p className="mt-5 text-xs opacity-60">Tap anywhere to go back</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoCard;