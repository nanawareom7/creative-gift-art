import { motion } from "framer-motion";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useTemplates } from "@/hooks/useTemplates";
import TemplateCard from "@/components/TemplateCard";
import CategoryTabs from "@/components/CategoryTabs";
import { SectionHeading } from "@/components/CollectionsSection";
import { categoriesApi, extractCategories } from "@/services/api";
import { RefreshCw } from "lucide-react";

// Category slugs that support the Static / Video type filter
const DIGITAL_SLUGS = [
  "digital-invitations",
  "wedding-invitations",
  "engagement-invitations",
  "birthday-invitations",
  "baby-shower-invitations",
  "save-the-date",
  "invitations",
];

export default function CategoryPage() {
  const { slug, type: routeType } = useParams();
  const [searchParams] = useSearchParams();

  const qType = searchParams.get("type");
  const qService = searchParams.get("service") || searchParams.get("serviceId");

  // /collection/:type routes — routeType is "all", "video", "website", …
  const fromRouteType = routeType && routeType !== "all" ? routeType : null;

  // Active category tab
  const [active, setActive] = useState(slug && slug !== "all" ? slug : "all");

  // Type filter (All / Static / Video)
  const [typeFilter, setTypeFilter] = useState("all");

  // ── Categories — filtered by service when ?service= is present ──
  const [cats, setCats] = useState([]);
  const [catsLoading, setCatsLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    setCatsLoading(true);
    try {
      let res;
      if (qService) {
        // Only fetch categories for this specific service
        res = await categoriesApi.byService(qService);
      } else {
        res = await categoriesApi.list({ active: true });
      }
      const list = extractCategories(res);
      setCats(list.filter((c) => c.isActive !== false));
    } catch {
      setCats([]);
    } finally {
      setCatsLoading(false);
    }
  }, [qService]);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  // Should we show All/Static/Video filter?
  const showTypeFilter = useMemo(() => {
    if (fromRouteType) return false;
    const current = active !== "all" ? active : slug;
    return DIGITAL_SLUGS.some(
      (s) => current?.includes(s) || s.includes(current || "")
    );
  }, [active, slug, fromRouteType]);

  const activeType =
    fromRouteType || qType || (typeFilter !== "all" ? typeFilter : null);

  // Template query params
  const params = useMemo(() => {
    const p = { limit: 24 };
    const catSlug =
      active !== "all" ? active : slug && slug !== "all" ? slug : null;
    if (catSlug) p.category = catSlug;
    if (qService) p.service = qService;
    if (activeType) p.type = activeType;
    return p;
  }, [active, slug, qService, activeType]);

  const { data, loading, error, refetch } = useTemplates(params);

  // Page title
  const title = useMemo(() => {
    if (routeType === "website") return "Wedding Websites";
    if (routeType === "video") return "Video Invitations";
    if (active !== "all")
      return active.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    if (slug && slug !== "all")
      return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return "All Invitations";
  }, [slug, routeType, active]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* ── Page header ── */}
      <div className="pt-8 pb-6 md:pt-10 md:pb-8 bg-gradient-to-b from-champagne/30 to-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Collection"
            title={title}
            subtitle="Premium, handcrafted designs ready for your celebration."
          />

          {/* Category tabs — hidden on /collection/:type routes */}
          {!fromRouteType && !catsLoading && cats.length > 0 && (
            <div className="mt-7">
              <CategoryTabs
                categories={cats}
                active={active}
                onChange={(s) => {
                  setActive(s);
                  setTypeFilter("all");
                }}
              />
            </div>
          )}

          {/* Static / Video filter */}
          {showTypeFilter && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {[
                { id: "all", label: "All" },
                { id: "static", label: "Static" },
                { id: "video", label: "Video" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTypeFilter(f.id)}
                  className={`px-5 py-1.5 rounded-full text-sm transition-all border font-medium ${typeFilter === f.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-foreground/70 hover:border-primary hover:text-primary"
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Template grid ── */}
      <section className="pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <SkeletonGrid />
          ) : error ? (
            <ErrorState onRetry={refetch} />
          ) : data.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.map((t, i) => (
                <TemplateCard key={t._id} template={t} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

function EmptyState() {
  return (
    <div className="py-16 text-center border border-dashed rounded-2xl text-sm text-muted-foreground">
      No templates found in this collection yet.
    </div>
  );
}

function ErrorState({ onRetry }) {
  return (
    <div className="py-16 text-center border border-dashed border-destructive/25 rounded-2xl bg-destructive/5">
      <p className="text-sm text-destructive/70">Unable to load templates.</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 text-xs text-primary border border-primary/30 rounded-full px-4 py-1.5 hover:bg-primary/5 transition"
        >
          <RefreshCw className="h-3 w-3" /> Retry
        </button>
      )}
    </div>
  );
}
