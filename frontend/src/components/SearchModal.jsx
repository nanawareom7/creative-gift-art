import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { templatesApi, resolveImage, extractTemplates } from "@/services/api";

export default function SearchModal({ open, onOpenChange }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setQ("");
      setResults([]);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!q || q.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await templatesApi.search(q.trim());
        // backend: { success, message, data: { templates, pagination } }
        setResults(extractTemplates(res).slice(0, 12));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 280);
    return () => clearTimeout(timer);
  }, [q]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden gold-border">
        <DialogTitle className="sr-only">Search templates</DialogTitle>

        {/* Input bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search templates, categories, tags…"
            className="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground"
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="Clear">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-3">
          {loading && (
            <div className="py-10 text-center text-sm text-muted-foreground">Searching…</div>
          )}
          {!loading && q.length >= 2 && results.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No matches for &ldquo;{q}&rdquo;.
            </div>
          )}
          {!loading && q.length < 2 && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Type at least 2 characters to search.
            </div>
          )}
          {results.length > 0 && (
            <ul className="grid sm:grid-cols-2 gap-2">
              {results.map((t) => (
                <li key={t._id}>
                  <Link
                    to={`/template/${t.slug || t._id}`}
                    onClick={() => onOpenChange?.(false)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition"
                  >
                    <img
                      src={resolveImage(t.thumbnail)}
                      alt=""
                      className="h-14 w-14 rounded-md object-cover bg-muted shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-widest text-primary">
                        {t.categoryId?.name || t.category?.name || t.type || ""}
                      </div>
                      <div className="text-sm truncate font-serif">{t.title}</div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
