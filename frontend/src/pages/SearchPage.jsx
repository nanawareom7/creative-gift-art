import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import { templatesApi, extractTemplates } from "@/services/api";
import TemplateCard from "@/components/TemplateCard";
import { SectionHeading } from "@/components/CollectionsSection";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const [q, setQ] = useState(initialQ);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const term = q.trim();
    if (!term) return setResults([]);

    setLoading(true);
    const timer = setTimeout(() => {
      templatesApi
        .search(term)
        .then((res) => {
          // backend: { success, message, data: { templates, pagination, query } }
          setResults(extractTemplates(res));
          setTotal(res?.data?.pagination?.total ?? extractTemplates(res).length);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
      setSearchParams({ q: term }, { replace: true });
    }, 300);

    return () => clearTimeout(timer);
  }, [q, setSearchParams]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <section className="section-pad">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Search" title="Find Your Perfect Design" />

          {/* Search input */}
          <div className="max-w-xl mx-auto mt-8 flex items-center gap-3 px-5 py-4 rounded-full gold-border bg-card luxe-shadow">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title, category, or tag…"
              className="flex-1 bg-transparent outline-none text-base"
            />
            {q && (
              <button onClick={() => setQ("")} aria-label="Clear search" className="shrink-0">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>

          <div className="mt-12">
            {loading ? (
              <SkeletonGrid />
            ) : results.length === 0 && q.trim() ? (
              <div className="text-center text-muted-foreground py-16 border border-dashed rounded-2xl">
                No results for &ldquo;{q}&rdquo;. Try a different keyword.
              </div>
            ) : results.length === 0 ? (
              <div className="text-center text-muted-foreground py-16">
                Start typing to search across all templates.
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-6 text-center">
                  {total} result{total !== 1 ? "s" : ""} for &ldquo;{q}&rdquo;
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {results.map((t, i) => (
                    <TemplateCard key={t._id} template={t} index={i} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </motion.div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden gold-border bg-card">
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
