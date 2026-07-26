import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { servicesApi, categoriesApi, templatesApi, extractCategories, extractTemplates } from "@/services/api";
import TemplateCard from "@/components/TemplateCard";
import { SliderCard } from "@/components/CardSlider";
import { SectionHeading } from "@/components/CollectionsSection";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

export default function ServicePage() {
  const { slug } = useParams();
  const [service, setService] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all"); // for digital invitations: all/static/video

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    const loadData = async () => {
      try {
        // Load service info
        const svcRes = await servicesApi.get(slug);
        const svcData = svcRes?.data?.service || svcRes?.data;
        setService(svcData);

        if (svcData?._id) {
          // Load categories for this service
          const catRes = await categoriesApi.byService(slug);
          const cats = extractCategories(catRes) ||
            catRes?.data?.categories || [];
          setCategories(cats.filter((c) => c.isActive !== false));
        }
      } catch (err) {
        console.error("ServicePage load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug]);

  // Check if this service is "Digital Invitations" type (has static/video filter)
  const isDigital = service?.slug?.toLowerCase().includes("digital") ||
    service?.name?.toLowerCase().includes("digital");

  const title = service?.name || slug?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Collection";

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Page header */}
      <section className="section-pad pb-8 bg-gradient-to-b from-champagne/40 to-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Collection"
            title={title}
            subtitle={service?.description || "Premium, handcrafted designs for every occasion."}
          />

          {/* Filter tabs — only for digital invitations */}
          {isDigital && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {["all", "static", "video"].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-5 py-2 rounded-full text-sm capitalize transition-all ${activeFilter === f
                      ? "bg-primary text-primary-foreground luxe-shadow"
                      : "bg-secondary text-secondary-foreground hover:bg-accent"
                    }`}
                >
                  {f === "all" ? "All Invitations" : f === "static" ? "Static Invitations" : "Video Invitations"}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Category sections */}
      <div className="pb-16">
        {categories.length === 0 ? (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
            <div className="border border-dashed rounded-2xl py-16 text-muted-foreground">
              No categories found for this service.
            </div>
          </div>
        ) : (
          categories.map((cat) => (
            <CategorySection
              key={cat._id}
              category={cat}
              typeFilter={isDigital ? activeFilter : null}
              serviceSlug={service?.slug || slug}
            />
          ))
        )}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────── Category Section ─ */
function CategorySection({ category, typeFilter, serviceSlug }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const trackRef = useRef(null);

  useEffect(() => {
    const params = { category: category.slug, limit: 8 };
    if (typeFilter && typeFilter !== "all") params.type = typeFilter;

    setLoading(true);
    templatesApi
      .list(params)
      .then((res) => setTemplates(extractTemplates(res)))
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, [category.slug, typeFilter]);

  const scroll = (dir) => {
    const track = trackRef.current;
    if (!track) return;
    const cardWidth = track.querySelector(".slider-card")?.offsetWidth || 260;
    track.scrollBy({ left: dir * (cardWidth + 16), behavior: "smooth" });
  };

  if (!loading && templates.length === 0) return null;

  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Category header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-serif text-2xl md:text-3xl text-foreground">{category.name}</h3>
            {category.description && (
              <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
            )}
          </div>
          <Link
            to={`/category/${category.slug}${serviceSlug ? `?service=${serviceSlug}` : ""}`}
            className="shrink-0 inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition whitespace-nowrap"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <CategorySkeleton />
        ) : (
          <div className="relative group/slider">
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

            <div
              ref={trackRef}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-1 px-1"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {templates.map((t, i) => (
                <SliderCard key={t._id}>
                  <TemplateCard template={t} index={i} />
                </SliderCard>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function CategorySkeleton() {
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
