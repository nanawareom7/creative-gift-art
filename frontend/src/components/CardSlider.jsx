import { useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * CardSlider — horizontal scroll-snap slider for template cards on mobile.
 * On desktop, falls back to a responsive grid.
 * 
 * Props:
 *   title         - Section title (string)
 *   eyebrow       - Small label above title (string)
 *   viewAllLink   - URL for "View All" button (string)
 *   loading       - boolean
 *   children      - Card components
 *   isEmpty       - boolean — show empty state
 *   emptyMessage  - string
 */
export default function CardSlider({
  title,
  eyebrow,
  viewAllLink,
  loading = false,
  children,
  isEmpty = false,
  emptyMessage = "No items found.",
  onRetry,
}) {
  const trackRef = useRef(null);

  const scroll = (dir) => {
    const track = trackRef.current;
    if (!track) return;
    const cardWidth = track.querySelector(".slider-card")?.offsetWidth || 260;
    track.scrollBy({ left: dir * (cardWidth + 16), behavior: "smooth" });
  };

  return (
    <section className="section-pad">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            {eyebrow && (
              <div className="text-[11px] tracking-[0.3em] uppercase text-primary mb-2 inline-flex items-center gap-2">
                <span className="h-px w-6 bg-primary/60" />
                {eyebrow}
                <span className="h-px w-6 bg-primary/60" />
              </div>
            )}
            <h2 className="font-serif text-3xl md:text-4xl text-foreground">{title}</h2>
          </div>
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="shrink-0 inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition whitespace-nowrap"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {loading ? (
          <SliderSkeleton />
        ) : isEmpty ? (
          <div className="py-14 text-center border border-dashed rounded-2xl text-muted-foreground text-sm">
            <p>{emptyMessage}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-4 inline-flex items-center gap-1.5 text-xs text-primary border border-primary/30 rounded-full px-4 py-1.5 hover:bg-primary/5 transition"
              >
                ↻ Retry
              </button>
            )}
          </div>
        ) : (
          <div className="relative group/slider">
            {/* Prev / Next arrows — visible on hover or always on desktop */}
            <button
              onClick={() => scroll(-1)}
              aria-label="Scroll left"
              className="slider-arrow left-0 -translate-x-1/2"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll(1)}
              aria-label="Scroll right"
              className="slider-arrow right-0 translate-x-1/2"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Track */}
            <div
              ref={trackRef}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-1 px-1"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {children}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/** Wrap individual child cards with this to apply slider sizing */
export function SliderCard({ children }) {
  return (
    <div className="slider-card shrink-0 snap-start w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)]">
      {children}
    </div>
  );
}

function SliderSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)] rounded-2xl overflow-hidden gold-border bg-card"
        >
          <div className="aspect-[3/4] bg-muted animate-pulse" />
          <div className="p-4 space-y-2">
            <div className="h-3 w-1/3 bg-muted animate-pulse rounded" />
            <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
