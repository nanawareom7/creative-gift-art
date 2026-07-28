import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppUrl } from "@/services/api";
import heroImg from "@/assets/hero-invitation.jpg";
import slide1 from "@/assets/hero-slide-1.png";
import slide2 from "@/assets/hero-slide-2.png";
import slide3 from "@/assets/hero-slide-3.png";

const heroImages = [
  {
    id: 1,
    image: heroImg,
  },
  {
    id: 2,
    image: slide3,
  },
  {
    id: 3,
    image: slide2,
  },
  {
    id: 4,
    image: slide1,
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % heroImages.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + heroImages.length) % heroImages.length);
  }, []);

  // Auto-advance every 4.5 seconds, pause on hover
  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, 4500);
    return () => clearInterval(timerRef.current);
  }, [next, paused]);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: "clamp(420px, 78vh, 780px)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Full-bleed sliding background images ── */}
      <AnimatePresence mode="sync" initial={false}>
        <motion.img
          key={heroImages[current].id}
          src={heroImages[current].image}
          alt="Creative Gift Art luxury invitations"
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="eager"
          decoding="sync"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
        />
      </AnimatePresence>

      {/* ── Subtle dark gradient overlay — no bright white ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-transparent" />

      {/* ── Content ── */}
      <div className="relative h-full flex items-end sm:items-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full pb-10 sm:pb-0">
          <div className="max-w-lg">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 text-[11px] tracking-[0.3em] uppercase text-white/70 mb-5"
            >
              <span className="h-px w-6 bg-white/50" />
              Luxury Invitations
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.1 }}
              className="font-serif text-4xl sm:text-5xl md:text-6xl leading-[1.08] text-white"
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
              className="mt-5 text-base sm:text-lg text-white/75 leading-relaxed"
            >
              Beautifully crafted digital and printed invitations for weddings,
              engagements, birthdays, and every precious moment.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.35 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Button
                asChild
                size="lg"
                className="rounded-full h-11 px-7 text-sm font-medium"
                style={{
                  background: "linear-gradient(135deg, #c9a227 0%, #e8c97d 60%, #c9a227 100%)",
                  color: "#1a0e00",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(201,162,39,0.35)",
                }}
              >
                <Link to="/collection/all">
                  Explore Collections <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                className="rounded-full h-11 px-7 text-sm font-medium border border-white/35 text-white bg-white/10 hover:bg-white/20 hover:border-white/55 backdrop-blur-sm transition"
              >
                <a href={buildWhatsAppUrl()} target="_blank" rel="noreferrer">
                  <MessageCircle className="mr-2 h-4 w-4 text-[#25D366]" />
                  Contact WhatsApp
                </a>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Prev / Next Buttons ── */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
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
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
        style={{
          background: "rgba(0,0,0,0.35)",
          border: "1px solid rgba(255,255,255,0.2)",
          backdropFilter: "blur(6px)",
        }}
      >
        <ChevronRight className="h-4 w-4 text-white" />
      </button>

      {/* ── Dot Indicators ── */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {heroImages.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="transition-all duration-400"
            style={{
              width: i === current ? "24px" : "8px",
              height: "8px",
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
