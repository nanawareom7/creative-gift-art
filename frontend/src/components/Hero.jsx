import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppUrl } from "@/services/api";

import websiteCoverVideo from "@/assets/webiste-cover.mp4";
import heroImg from "@/assets/hero-invitation.jpg";
import slide1 from "@/assets/hero-slide-1.png";
import slide2 from "@/assets/hero-slide-2.png";
import slide3 from "@/assets/hero-slide-3.png";

// Slide 0 = video
// Slides 1–4 = images
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

  // Auto advance every 5 seconds
  useEffect(() => {
    if (paused) return;

    timerRef.current = setInterval(next, 5000);

    return () => clearInterval(timerRef.current);
  }, [next, paused]);

  // Play / pause video depending on active slide
  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    if (current === 0) {
      video.play().catch(() => { });
    } else {
      video.pause();
    }
  }, [current]);

  return (
    <section
      className="hero-section relative w-full overflow-hidden bg-background"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* =========================================================
          HERO VIDEO
          
          Mobile  : object-contain
          Desktop : object-cover
          ========================================================= */}
      <video
        ref={videoRef}
        src={websiteCoverVideo}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-contain sm:object-cover object-center transition-opacity duration-[1100ms]"
        style={{
          opacity: current === 0 ? 1 : 0,
        }}
        aria-hidden="true"
      />

      {/* =========================================================
          HERO IMAGE SLIDES
          
          Mobile  : object-contain
          Desktop : object-cover
          ========================================================= */}
      <AnimatePresence mode="sync" initial={false}>
        {SLIDES[current].type === "image" && (
          <motion.img
            key={SLIDES[current].id}
            src={SLIDES[current].image}
            alt="Creative Gift Art luxury invitations"
            className="absolute inset-0 w-full h-full object-contain sm:object-cover object-center"
            loading="eager"
            decoding="sync"
            initial={{
              opacity: 0,
              scale: 1.02,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 1.1,
              ease: "easeInOut",
            }}
          />
        )}
      </AnimatePresence>

      {/* =========================================================
          DESKTOP HERO CONTENT
          
          Hidden completely on mobile.
          
          Position:
          - horizontally centered
          - middle/lower portion of image
          - no background
          - no image overlay
          ========================================================= */}
      <div className="hidden sm:flex absolute inset-0 z-[5] items-end justify-center pointer-events-none">
        <div className="w-full max-w-7xl px-6 lg:px-8 pb-[10%]">
          <div className="max-w-3xl mx-auto text-center pointer-events-auto">

            {/* Eyebrow */}
            <motion.div
              initial={{
                opacity: 0,
                y: 16,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.6,
              }}
              className="inline-flex items-center gap-2 text-[11px] tracking-[0.3em] uppercase text-white/85 mb-5"
            >
              <span className="h-px w-6 bg-white/70" />

              Luxury Invitations

              <span className="h-px w-6 bg-white/70" />
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.75,
                delay: 0.1,
              }}
              className="font-serif text-5xl md:text-6xl leading-[1.08] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]"
            >
              Every Celebration{" "}
              <span
                className="italic"
                style={{
                  background:
                    "linear-gradient(135deg, #e8c97d 0%, #c9a227 50%, #f0d880 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Begins
              </span>{" "}
              with an Invitation.
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{
                opacity: 0,
                y: 16,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.7,
                delay: 0.22,
              }}
              className="mt-5 text-lg text-white/90 leading-relaxed max-w-2xl mx-auto drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
            >
              Beautifully crafted digital and printed invitations for
              weddings, engagements, birthdays, and every precious moment.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{
                opacity: 0,
                y: 12,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.65,
                delay: 0.35,
              }}
              className="mt-8 flex flex-wrap gap-3 justify-center"
            >
              {/* Explore Collections */}
              <Button
                asChild
                size="lg"
                className="rounded-full h-11 px-7 text-sm font-medium"
                style={{
                  background:
                    "linear-gradient(135deg, #c9a227 0%, #e8c97d 60%, #c9a227 100%)",
                  color: "#1a0e00",
                  border: "none",
                  boxShadow:
                    "0 4px 20px rgba(201,162,39,0.35)",
                }}
              >
                <Link to="/collection/all">
                  Explore Collections
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              {/* WhatsApp */}
              <Button
                asChild
                size="lg"
                className="rounded-full h-11 px-7 text-sm font-medium border border-white/35 text-white bg-white/10 hover:bg-white/20 hover:border-white/55 backdrop-blur-sm transition"
              >
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4 text-[#25D366]" />
                  WhatsApp
                </a>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* =========================================================
          DESKTOP PREVIOUS BUTTON
          ========================================================= */}
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

      {/* =========================================================
          DESKTOP NEXT BUTTON
          ========================================================= */}
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

      {/* =========================================================
          MOBILE PREVIOUS BUTTON
          ========================================================= */}
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

      {/* =========================================================
          MOBILE NEXT BUTTON
          ========================================================= */}
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

      {/* =========================================================
          SLIDE DOTS
          ========================================================= */}
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
              background:
                i === current
                  ? "linear-gradient(135deg, #e8c97d, #c9a227)"
                  : "rgba(255,255,255,0.45)",
              border: "none",
              cursor: "pointer",
              boxShadow:
                i === current
                  ? "0 0 8px rgba(201,162,39,0.6)"
                  : "none",
            }}
          />
        ))}
      </div>
    </section>
  );
}