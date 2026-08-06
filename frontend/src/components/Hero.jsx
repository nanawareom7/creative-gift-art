import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppUrl } from "@/services/api";
import websiteCoverVideo from "@/assets/webiste-cover.mp4";
import heroImg from "@/assets/hero-invitation.jpg";
import slide1 from "@/assets/hero-slide-1.png";
import slide2 from "@/assets/hero-slide-2.png";
import slide3 from "@/assets/hero-slide-3.png";

// Slide 0 = video, slides 1–4 = images.
// Both coexist: video is always in the DOM, images are rendered only when active.
const SLIDES = [
  { type: "video" },
  { type: "image", id: 1, image: heroImg },
  { type: "image", id: 2, image: slide3 },
  { type: "image", id: 3, image: slide2 },
  { type: "image", id: 4, image: slide1 },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  const videoRef = useRef(null);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % SLIDES.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  // Auto-advance every 5 s, pause on hover
  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, 5000);
    return () => clearInterval(timerRef.current);
  }, [next, paused]);

  // Play/pause video depending on active slide
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (current === 0) {
      v.play().catch(() => {}); // silently handle autoplay policy
    } else {
      v.pause();
    }
  }, [current]);

  return (
    <section
      className="hero-section relative w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Video background — always in DOM, fades in/out ── */}
      <video
        ref={videoRef}
        src={websiteCoverVideo}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-[1100ms]"
        style={{ opacity: current === 0 ? 1 : 0 }}
        aria-hidden="true"
      />

      {/* ── Image slides (slides 1–4) — AnimatePresence for smooth crossfade ── */}
      <AnimatePresence mode="sync" initial={false}>
        {SLIDES[current].type === "image" && (
          <motion.img
            key={SLIDES[current].id}
            src={SLIDES[current].image}
            alt="Creative Gift Art luxury invitations"
            className="absolute inset-0 w-full h-full object-cover object-center"
            loading="eager"
            decoding="sync"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>

      {/* ── Gradient overlays ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-transparent" />

      {/* ── Content ── */}
      {/*
        Mobile:  vertically centered, text centered, compact spacing
        Desktop: vertically centered, text left-aligned, original spacing
      */}
      <div className="relative h-full flex items-center">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 w-full">
          <div className="max-w-lg mx-auto sm:mx-0 text-center sm:text-left">

            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-white/70 mb-3 sm:mb-5"
            >
              <span className="h-px w-5 sm:w-6 bg-white/50" />
              Luxury Invitations
              {/* Show right rule on mobile only (for symmetric centered look) */}
              <span className="h-px w-5 bg-white/50 sm:hidden" />
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.1 }}
              className="font-serif text-[1.75rem] leading-[1.12] sm:text-5xl md:text-6xl sm:leading-[1.08] text-white"
            >
              Every Celebration{" "}
              <span
                className="italic"
                style={{
                  background: "linear-gradient(135deg, #e8c97d 0%, #c9a227 50%, #f0d880 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Begins
              </span>{" "}
              with an Invitation.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.22 }}
              className="mt-3 sm:mt-5 text-sm sm:text-lg text-white/75 leading-relaxed"
            >
              Beautifully crafted digital and printed invitations for weddings,
              engagements, birthdays, and every precious moment.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.35 }}
              className="mt-5 sm:mt-8 flex flex-wrap gap-2.5 sm:gap-3 justify-center sm:justify-start"
            >
              <Button
                asChild
                size="lg"
                className="rounded-full h-10 sm:h-11 px-5 sm:px-7 text-xs sm:text-sm font-medium"
                style={{
                  background: "linear-gradient(135deg, #c9a227 0%, #e8c97d 60%, #c9a227 100%)",
                  color: "#1a0e00",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(201,162,39,0.35)",
                }}
              >
                <Link to="/collection/all">
                  Explore Collections <ArrowRight className="ml-1.5 h-3.5 w-3.5 sm:ml-2 sm:h-4 sm:w-4" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                className="rounded-full h-10 sm:h-11 px-5 sm:px-7 text-xs sm:text-sm font-medium border border-white/35 text-white bg-white/10 hover:bg-white/20 hover:border-white/55 backdrop-blur-sm transition"
              >
                <a href={buildWhatsAppUrl()} target="_blank" rel="noreferrer">
                  <MessageCircle className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4 text-[#25D366]" />
                  WhatsApp
                </a>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Prev / Next — hidden on mobile, shown sm+ ── */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="hidden sm:flex absolute left-5 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full items-center justify-center transition-all duration-200 hover:scale-110"
        style={{
          background: "rgba(0,0,0,0.35)",
          border: "1px solid rgba(255,255,255,0.2)",
          backdropFilter: "blur(6px)",
        }}
      >
        <ChevronLeft className="h-4 w-4 text-white" />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="hidden sm:flex absolute right-5 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full items-center justify-center transition-all duration-200 hover:scale-110"
        style={{
          background: "rgba(0,0,0,0.35)",
          border: "1px solid rgba(255,255,255,0.2)",
          backdropFilter: "blur(6px)",
        }}
      >
        <ChevronRight className="h-4 w-4 text-white" />
      </button>

      {/* ── Swipe hint on mobile (left–right chevrons, small) ── */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="sm:hidden absolute left-2.5 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full flex items-center justify-center"
        style={{
          background: "rgba(0,0,0,0.28)",
          border: "1px solid rgba(255,255,255,0.18)",
          backdropFilter: "blur(4px)",
        }}
      >
        <ChevronLeft className="h-3.5 w-3.5 text-white" />
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="sm:hidden absolute right-2.5 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full flex items-center justify-center"
        style={{
          background: "rgba(0,0,0,0.28)",
          border: "1px solid rgba(255,255,255,0.18)",
          backdropFilter: "blur(4px)",
        }}
      >
        <ChevronRight className="h-3.5 w-3.5 text-white" />
      </button>

      {/* ── Dot Indicators ── */}
      <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 sm:gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="transition-all duration-300"
            style={{
              width: i === current ? "20px" : "6px",
              height: "6px",
              borderRadius: "9999px",
              background: i === current
                ? "linear-gradient(135deg, #e8c97d, #c9a227)"
                : "rgba(255,255,255,0.45)",
              border: "none",
              cursor: "pointer",
              boxShadow: i === current ? "0 0 8px rgba(201,162,39,0.6)" : "none",
            }}
          />
        ))}
      </div>

      {/* ── Bottom page-blend ── */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background/60 to-transparent pointer-events-none" />
    </section>
  );
}
