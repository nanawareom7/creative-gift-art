import { motion } from "framer-motion";
import { useState, useMemo, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import Hero from "@/components/Hero";
import CollectionsSection, { SectionHeading } from "@/components/CollectionsSection";
import TemplateCard from "@/components/TemplateCard";
import CategoryTabs from "@/components/CategoryTabs";
import CardSlider, { SliderCard } from "@/components/CardSlider";
import { useFeaturedTemplates, useTemplates } from "@/hooks/useTemplates";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight, Star, Quote, RefreshCw } from "lucide-react";
import { buildWhatsAppUrl } from "@/services/api";

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Hero />
      <CollectionsSection />
      <TrendingSection />
      <BrowseByCategory />
      <StatsSection />
      <ReviewsSlider />
      <AboutPreview />
      <CtaStrip />
    </motion.div>
  );
}

/* ─────────────────────── Trending ─ */
function TrendingSection() {
  const { data: featured, loading, error, refetch } = useFeaturedTemplates();

  return (
    <CardSlider
      eyebrow="Trending Now"
      title="Featured Invitations"
      viewAllLink="/collection/all"
      loading={loading}
      isEmpty={!loading && featured.length === 0}
      emptyMessage={
        error
          ? "Unable to load. Check your connection."
          : "No featured templates yet."
      }
      onRetry={error ? refetch : undefined}
    >
      {featured.slice(0, 8).map((t, i) => (
        <SliderCard key={t._id}>
          <TemplateCard template={t} index={i} />
        </SliderCard>
      ))}
    </CardSlider>
  );
}

/* ─────────────────────── Stats ─ */
const STATS = [
  { value: "500+", label: "Happy Customers" },
  { value: "1000+", label: "Designs Created" },
  { value: "5+", label: "Years Experience" },
  { value: "100%", label: "Custom Designs" },
];

function StatsSection() {
  return (
    <section className="py-10 md:py-12 bg-gradient-to-r from-champagne/50 via-background to-champagne/50 border-y border-border/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Mobile: horizontal scroll | Desktop: grid */}
        <div
          className="flex gap-8 overflow-x-auto pb-1 md:grid md:grid-cols-4"
          style={{ scrollbarWidth: "none" }}
        >
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="text-center shrink-0 min-w-[110px] md:min-w-0"
            >
              <div className="font-serif text-4xl md:text-5xl gold-gradient-text font-display">
                {s.value}
              </div>
              <div className="mt-1.5 text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── Browse by Category ─ */
function BrowseByCategory() {
  const { data: cats } = useCategories();
  const [active, setActive] = useState("all");

  const params = useMemo(
    () => (active === "all" ? { limit: 8 } : { category: active, limit: 8 }),
    [active]
  );
  const { data, loading, error, refetch } = useTemplates(params);

  return (
    <section className="section-pad">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Browse"
          title="Designs By Occasion"
          subtitle="Filter through our curated categories."
        />
        <div className="mt-7">
          <CategoryTabs categories={cats} active={active} onChange={setActive} />
        </div>

        <div className="mt-7">
          {loading ? (
            <SkeletonGrid />
          ) : error ? (
            <ErrorState message="Unable to load templates." onRetry={refetch} />
          ) : data.length === 0 ? (
            <EmptyState message="No designs in this category yet." />
          ) : (
            <>
              {/* Mobile: 2+half horizontal slider */}
              <div
                className="md:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth -mx-1 px-1 pb-2"
                style={{ scrollbarWidth: "none" }}
              >
                {data.map((t, i) => (
                  <div key={t._id} className="shrink-0 snap-start" style={{ width: "calc(46% - 6px)" }}>
                    <TemplateCard template={t} index={i} />
                  </div>
                ))}
              </div>
              {/* Desktop: grid */}
              <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4">
                {data.map((t, i) => (
                  <TemplateCard key={t._id} template={t} index={i} />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="mt-7 text-center">
          <Button asChild variant="outline" className="rounded-full px-7 gold-border">
            <Link to="/collection/all">
              View All Designs <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── Reviews Slider ─ */
const REVIEWS = [
  {
    name: "Priya Sharma",
    occasion: "Wedding",
    stars: 5,
    text: "Creative Gift Art made our wedding invitations absolutely magical! The gold calligraphy was exactly what we dreamed of. Every guest complimented how beautiful they were.",
    avatar: "PS",
  },
  {
    name: "Rahul & Anjali",
    occasion: "Engagement",
    stars: 5,
    text: "We got our digital invitation within 24 hours and it was stunning! The video invitation had all our friends amazed. Highly recommend for any celebration.",
    avatar: "RA",
  },
  {
    name: "Meera Patel",
    occasion: "Baby Shower",
    stars: 5,
    text: "The personalized gifts were wrapped so elegantly. The custom photo frame brought tears to my mother's eyes. Truly premium quality at an affordable price.",
    avatar: "MP",
  },
  {
    name: "Arjun Nair",
    occasion: "Birthday",
    stars: 5,
    text: "Super responsive team and the final design exceeded our expectations. The animated birthday invite was a hit on WhatsApp! Will definitely order again.",
    avatar: "AN",
  },
  {
    name: "Sneha & Vivek",
    occasion: "Wedding",
    stars: 5,
    text: "From concept to delivery, the experience was absolutely seamless. Our monogram design was breathtaking and our guests couldn't stop talking about it!",
    avatar: "SV",
  },
  {
    name: "Divya Menon",
    occasion: "Reception",
    stars: 5,
    text: "Ordered custom stationery — welcome board, menu cards, and seating chart. Every piece was perfectly coordinated and delivered ahead of schedule. Outstanding!",
    avatar: "DM",
  },
];

function ReviewsSlider() {
  const trackRef = useRef(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateButtons = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft < 4);
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 4);
  }, []);

  const scroll = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector(".review-card");
    const w = card ? card.offsetWidth + 16 : 300;
    el.scrollBy({ left: dir * w, behavior: "smooth" });
    setTimeout(updateButtons, 350);
  };

  return (
    <section className="section-pad bg-gradient-to-b from-secondary/20 to-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Client Love"
          title="What Our Clients Say"
          subtitle="Trusted by hundreds of happy couples and families across India."
        />

        <div className="mt-8 relative group/reviews">
          {/* Arrows */}
          <button
            onClick={() => scroll(-1)}
            aria-label="Previous reviews"
            className={`hidden md:grid absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10
              h-10 w-10 place-items-center rounded-full bg-background gold-border luxe-shadow
              transition-all duration-200 ${atStart ? "opacity-0 pointer-events-none" : "opacity-100 hover:scale-105"}`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll(1)}
            aria-label="Next reviews"
            className={`hidden md:grid absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10
              h-10 w-10 place-items-center rounded-full bg-background gold-border luxe-shadow
              transition-all duration-200 ${atEnd ? "opacity-0 pointer-events-none" : "opacity-100 hover:scale-105"}`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Track */}
          <div
            ref={trackRef}
            onScroll={updateButtons}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth -mx-1 px-1 pb-2"
            style={{ scrollbarWidth: "none" }}
          >
            {REVIEWS.map((r, i) => (
              <div
                key={r.name}
                className="review-card shrink-0 snap-start"
                style={{
                  width: "min(calc(85vw - 16px), 340px)",
                  minWidth: "260px",
                }}
              >
                <ReviewCard review={r} index={i} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ review, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: (index % 4) * 0.07 }}
      className="bg-card rounded-2xl p-5 gold-border luxe-shadow flex flex-col gap-3 h-full"
    >
      <Quote className="h-5 w-5 text-primary/35 shrink-0" />
      <p className="text-sm text-foreground/80 leading-relaxed flex-1">{review.text}</p>
      <div>
        <div className="flex gap-0.5 mb-2.5">
          {Array.from({ length: review.stars }).map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-primary text-primary" />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/15 grid place-items-center font-serif text-xs text-primary border border-primary/20 shrink-0">
            {review.avatar}
          </div>
          <div>
            <div className="text-sm font-medium text-foreground leading-none">{review.name}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
              {review.occasion}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────── About Preview ─ */
function AboutPreview() {
  return (
    <section className="section-pad">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden gold-border luxe-shadow bg-gradient-to-br from-champagne via-ivory to-gold-soft/30 p-8 md:p-14">
          <div className="max-w-xl">
            <div className="text-[11px] tracking-[0.3em] uppercase text-primary mb-4 inline-flex items-center gap-2">
              <span className="h-px w-6 bg-primary/60" /> Our Story
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-foreground leading-tight">
              Crafting{" "}
              <span className="italic gold-gradient-text font-display">Visual Experiences</span>{" "}
              Since 2019
            </h2>
            <p className="mt-5 text-sm md:text-base text-muted-foreground leading-relaxed">
              At Creative Gift Art, we transform ideas into meaningful designs that leave a lasting
              impression. From elegant wedding stationery to personalized gifts, every piece is
              crafted with purpose and passion.
            </p>
            <Button
              asChild
              className="mt-7 rounded-full px-7 h-11 bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
            >
              <Link to="/about">
                Read Our Story <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── CTA Strip ─ */
function CtaStrip() {
  return (
    <section className="section-pad">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden gold-border luxe-shadow bg-gradient-to-br from-champagne via-background to-gold-soft p-8 md:p-14 text-center">
          <div className="text-[11px] tracking-[0.3em] uppercase text-primary">✦ Start Your Story ✦</div>
          <h2 className="font-serif text-3xl md:text-4xl mt-4 max-w-2xl mx-auto">
            Let's design something{" "}
            <span className="italic gold-gradient-text font-display">unforgettable.</span>
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
            Tell us about your celebration on WhatsApp — we'll handcraft a design just for you.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-7 rounded-full px-8 h-11 bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
          >
            <a href={buildWhatsAppUrl()} target="_blank" rel="noreferrer">
              Contact On WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── Utilities ─ */
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden gold-border bg-card">
          <div className="aspect-[3/4] bg-muted animate-pulse" />
          <div className="p-3 space-y-1.5">
            <div className="h-2.5 w-1/3 bg-muted animate-pulse rounded" />
            <div className="h-3.5 w-2/3 bg-muted animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="py-14 text-center border border-dashed rounded-2xl">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="py-14 text-center border border-dashed border-destructive/25 rounded-2xl bg-destructive/5">
      <p className="text-sm text-destructive/70 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 text-xs text-primary border border-primary/30 rounded-full px-4 py-1.5 hover:bg-primary/5 transition"
        >
          <RefreshCw className="h-3 w-3" /> Retry
        </button>
      )}
    </div>
  );
}
