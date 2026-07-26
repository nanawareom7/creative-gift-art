import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import slide1 from "@/assets/hero-slide-1.png";
import slide2 from "@/assets/hero-slide-2.png";
import slide3 from "@/assets/hero-slide-3.png";
import heroOriginal from "@/assets/hero-invitation.jpg";

const SLIDES = [
  {
    image: heroOriginal,
    label: "Wedding Invitations",
    subtitle: "Timeless elegance for your special day",
  },
  {
    image: slide1,
    label: "Custom Stationery",
    subtitle: "Gold foil details crafted to perfection",
  },
  {
    image: slide2,
    label: "Digital Invitations",
    subtitle: "Modern designs delivered instantly",
  },
  {
    image: slide3,
    label: "Personalized Gifts",
    subtitle: "Keepsakes that last a lifetime",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % SLIDES.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  // Auto-slide every 4.5 seconds
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 4500);
    return () => clearInterval(timer);
  }, [next, paused]);

  return (
    <div
      className="relative rounded-[2rem] overflow-hidden luxe-shadow gold-border"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      <div className="relative aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/4]">
        <AnimatePresence mode="sync">
          <motion.img
            key={current}
            src={SLIDES[current].image}
            alt={SLIDES[current].label}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.85, ease: "easeInOut" }}
          />
        </AnimatePresence>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Slide label */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`label-${current}`}
            className="absolute bottom-5 left-5 right-5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="text-[10px] tracking-[0.25em] uppercase text-white/80 mb-1">
              ✦ {SLIDES[current].label}
            </div>
            <div className="font-serif text-sm text-white/90">
              {SLIDES[current].subtitle}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Prev / Next buttons */}
        <button
          onClick={prev}
          aria-label="Previous"
          className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full glass grid place-items-center hover:scale-105 transition"
        >
          <ChevronLeft className="h-4 w-4 text-foreground" />
        </button>
        <button
          onClick={next}
          aria-label="Next"
          className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full glass grid place-items-center hover:scale-105 transition"
        >
          <ChevronRight className="h-4 w-4 text-foreground" />
        </button>
      </div>

      {/* Dot navigation */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? "w-6 h-1.5 bg-primary"
                : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
