import { motion } from "framer-motion";

export default function CategoryTabs({ categories, active, onChange }) {
  // Deduplicate by _id to prevent React key collision warning
  const seen = new Set();
  const unique = (categories || []).filter((c) => {
    const id = c._id || c.slug;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  const items = [{ _id: "__all__", slug: "all", name: "All" }, ...unique];

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
      {items.map((c) => {
        const isActive = (active || "all") === c.slug;
        return (
          <button
            key={c._id || c.slug}
            onClick={() => onChange?.(c.slug)}
            className={`relative px-5 py-2 rounded-full text-sm transition-all ${
              isActive
                ? "bg-primary text-primary-foreground luxe-shadow"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="active-cat"
                className="absolute inset-0 rounded-full bg-primary -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative">{c.name}</span>
          </button>
        );
      })}
    </div>
  );
}
