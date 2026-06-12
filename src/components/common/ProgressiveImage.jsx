"use client";
import { useState, useEffect, useRef } from "react";

/**
 * ProgressiveImage
 *
 * Renders images in three stages:
 *   1. Immediately shows a blurred thumbnail (tiny base64 scaled up with CSS blur)
 *   2. Overlays a circular SVG progress ring that animates while the full image loads
 *   3. Cross-fades to the full sharp image and removes the ring once loaded
 *
 * Props:
 *   src        {string}  Full-resolution image (base64 data URI or URL)
 *   thumbnail  {string}  Tiny blurred preview (base64 data URI), shown instantly
 *   alt        {string}  Alt text for accessibility
 *   className  {string}  Class for the outer wrapper div
 *   imgClassName {string} Class applied to both the img elements
 *   onLoad     {fn}      Called when the full image finishes loading
 */
const ProgressiveImage = ({
  src,
  thumbnail,
  alt = "",
  className = "",
  imgClassName = "",
  onLoad,
}) => {
  // progress  0–100 (integer)
  const [progress, setProgress] = useState(0);
  // fullyLoaded: true once the full image is decoded and ready to show
  const [fullyLoaded, setFullyLoaded] = useState(false);
  // showRing: keep ring visible during fade-out
  const [showRing, setShowRing] = useState(true);

  const animFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  // Simulate a realistic load duration (ms). Adjust if needed.
  const SIMULATED_DURATION = 1800;

  // ─── Animate progress ring while the full image loads ────────────────────
  useEffect(() => {
    if (!src) return; // no src yet — keep ring at 0

    setProgress(0);
    setFullyLoaded(false);
    setShowRing(true);
    startTimeRef.current = null;

    // Prefetch the full image using the browser Image constructor
    const img = new window.Image();

    // Animate the ring using requestAnimationFrame for a smooth fill
    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      // Ease-out: fast at start, slower near the end, caps at 92% until loaded
      const raw = Math.min((elapsed / SIMULATED_DURATION) * 100, 92);
      setProgress(Math.round(raw));
      if (raw < 92) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    img.onload = () => {
      // Cancel the simulated animation and snap to 100%
      cancelAnimationFrame(animFrameRef.current);
      setProgress(100);

      // Small delay so the user sees "100%" before the fade kicks in
      setTimeout(() => {
        setFullyLoaded(true);
        onLoad?.();
        // Hide the ring after the cross-fade finishes (matches transition duration)
        setTimeout(() => setShowRing(false), 500);
      }, 200);
    };

    img.onerror = () => {
      cancelAnimationFrame(animFrameRef.current);
      setProgress(100);
      setFullyLoaded(true);
      setTimeout(() => setShowRing(false), 500);
    };

    img.src = src;

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  // ─── SVG ring math ────────────────────────────────────────────────────────
  const RING_SIZE = 56;        // total SVG size (px)
  const STROKE_W = 4;          // ring stroke width (px)
  const RADIUS = (RING_SIZE - STROKE_W) / 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const dashOffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  const hasThumbnail = !!thumbnail;
  const hasSrc = !!src;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* ── Layer 1: Blurred thumbnail (always visible until full image is ready) ── */}
      {hasThumbnail && (
        <img
          src={thumbnail}
          alt={alt}
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            fullyLoaded ? "opacity-0" : "opacity-100"
          } ${imgClassName}`}
          style={{
            filter: "blur(18px)",
            transform: "scale(1.12)", // hide blurred edges
            willChange: "opacity",
          }}
        />
      )}

      {/* ── Layer 2: Full image (fades in when decoded) ───────────────────── */}
      {hasSrc && (
        <img
          src={src}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            fullyLoaded ? "opacity-100" : "opacity-0"
          } ${imgClassName}`}
          style={{ willChange: "opacity" }}
        />
      )}

      {/* ── Layer 3: Placeholder bg when no thumbnail ─────────────────────── */}
      {!hasThumbnail && !fullyLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200" />
      )}

      {/* ── Layer 4: Progress ring overlay ───────────────────────────────── */}
      {showRing && (
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
            fullyLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
          aria-hidden="true"
        >
          {/* Semi-transparent backdrop circle */}
          <div
            className="relative flex items-center justify-center rounded-full"
            style={{
              width: RING_SIZE + 12,
              height: RING_SIZE + 12,
              background: "rgba(15, 23, 42, 0.50)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
          >
            {/* Spinning track when no src yet (indeterminate) */}
            {!hasSrc && (
              <svg
                width={RING_SIZE}
                height={RING_SIZE}
                viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
                className="animate-spin"
                style={{ animationDuration: "1.2s" }}
              >
                <circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth={STROKE_W}
                />
                <circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke="#34d399"
                  strokeWidth={STROKE_W}
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={CIRCUMFERENCE * 0.75}
                />
              </svg>
            )}

            {/* Determinate progress ring once src is available */}
            {hasSrc && (
              <svg
                width={RING_SIZE}
                height={RING_SIZE}
                viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
                style={{ transform: "rotate(-90deg)" }}
              >
                {/* Background track */}
                <circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth={STROKE_W}
                />
                {/* Progress arc */}
                <circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke="#34d399"
                  strokeWidth={STROKE_W}
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={dashOffset}
                  style={{ transition: "stroke-dashoffset 0.25s ease-out" }}
                />
              </svg>
            )}

            {/* Percentage label — only when src is provided */}
            {hasSrc && (
              <span
                className="absolute text-white font-bold select-none"
                style={{
                  fontSize: 11,
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                }}
              >
                {progress}%
              </span>
            )}
          </div>
        </div>
      )}

      {/* Hover zoom works on the wrapper's children so the outer wrapper needs group */}
    </div>
  );
};

export default ProgressiveImage;
