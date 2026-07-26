import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Globe, ArrowUpRight } from "lucide-react";
import { resolveImage } from "@/services/api";

/* ─────────────────────────────────────────────────────────────── */
/*  Helpers                                                         */
/* ─────────────────────────────────────────────────────────────── */

function getYoutubeId(url = "") {
  const m = url.match(
    /(?:youtube\.com\/(?:shorts\/|watch\?v=|embed\/)|youtu\.be\/)([\w-]{6,})/
  );
  return m ? m[1] : null;
}

/**
 * Thumbnail resolution order:
 *  1. images[0]  – first uploaded gallery image (works for BOTH static & video)
 *  2. thumbnail  – legacy single-thumbnail field
 *  3. YouTube    – auto-generated poster from youtubeLink
 *  4. null       – show placeholder
 */
function getCardImage(t) {
  if (t.images?.length > 0) return resolveImage(t.images[0]);
  if (t.thumbnail) return resolveImage(t.thumbnail);
  const ytId = getYoutubeId(t.youtubeLink || "");
  if (ytId) return `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`;
  return null;
}

/* ─────────────────────────────────────────────────────────────── */
/*  Safe image – state-based error handling, no DOM hacks          */
/* ─────────────────────────────────────────────────────────────── */

function CardImage({ src, alt }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2.5 bg-muted text-muted-foreground/20">
        <svg
          width="36" height="36" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="0.75"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <span className="text-[9px] uppercase tracking-[0.18em] font-medium">No Preview</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.05]"
    />
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  TemplateCard                                                    */
/* ─────────────────────────────────────────────────────────────── */

export default function TemplateCard({ template, index = 0 }) {
  const type = template?.type || (template?.youtubeLink ? "video" : "static");
  const isVideo = type === "video";
  const isWebsite = type === "website";

  const categoryName =
    template?.categoryId?.name ||
    template?.category?.name ||
    template?.categoryName ||
    "";

  const cardImage = getCardImage(template);

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.42, delay: (index % 8) * 0.05 }}
      className="group"
    >
      <Link
        to={`/template/${template.slug || template._id}`}
        className="block rounded-2xl overflow-hidden bg-card"
        style={{
          border: "1px solid color-mix(in oklab, var(--gold) 48%, transparent)",
          boxShadow:
            "0 1px 3px color-mix(in oklab,var(--gold-deep) 5%,transparent)," +
            "0 4px 12px -4px color-mix(in oklab,var(--gold-deep) 10%,transparent)",
          transition: "transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s ease",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "translateY(-5px)";
          e.currentTarget.style.boxShadow =
            "0 2px 6px color-mix(in oklab,var(--gold-deep) 8%,transparent)," +
            "0 16px 40px -8px color-mix(in oklab,var(--gold-deep) 24%,transparent)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow =
            "0 1px 3px color-mix(in oklab,var(--gold-deep) 5%,transparent)," +
            "0 4px 12px -4px color-mix(in oklab,var(--gold-deep) 10%,transparent)";
        }}
      >
        {/* ── Image area (4 : 5) ─────────────────────────────── */}
        <div className="relative overflow-hidden bg-muted" style={{ aspectRatio: "4/5" }}>
          <CardImage src={cardImage} alt={template.title} />

          {/* Gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/[0.04] to-transparent pointer-events-none" />

          {/* Play overlay (video only, on hover) */}
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none">
              <div
                className="h-14 w-14 rounded-full flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg,#c9a227 0%,#f0d87a 100%)",
                  boxShadow: "0 6px 28px rgba(0,0,0,0.45)",
                }}
              >
                <Play className="h-6 w-6 fill-[#1a0e00] text-[#1a0e00] ml-0.5" />
              </div>
            </div>
          )}

          {/* Badge — top-left */}
          <span
            className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2.5 py-[3px] rounded-full text-[9px] uppercase tracking-[0.14em] font-semibold pointer-events-none select-none"
            style={
              isVideo
                ? { background: "linear-gradient(135deg,#c9a227,#f0d87a)", color: "#1a0e00", border: "1px solid rgba(255,255,255,0.25)" }
                : isWebsite
                  ? { background: "rgba(59,130,246,0.85)", color: "#fff", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.2)" }
                  : { background: "rgba(0,0,0,0.46)", color: "#fff", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.16)" }
            }
          >
            {isVideo && <Play className="h-2.5 w-2.5 fill-current shrink-0" />}
            {isVideo ? "Video" : isWebsite ? "Website" : "Static"}
          </span>

          {/* Arrow — bottom-right, hover reveal */}
          <div
            className="absolute bottom-3 right-3 h-7 w-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1.5 group-hover:translate-y-0 transition-all duration-250 pointer-events-none"
            style={{ background: "linear-gradient(135deg,#c9a227,#f0d87a)", boxShadow: "0 2px 14px rgba(201,162,39,0.55)" }}
          >
            <ArrowUpRight className="h-3.5 w-3.5 text-[#1a0e00]" />
          </div>
        </div>

        {/* ── Card footer ────────────────────────────────────── */}
        <div className="px-3.5 pt-3 pb-3.5">
          {categoryName && (
            <p className="text-[9px] uppercase tracking-[0.18em] text-primary/65 mb-1 truncate">
              {categoryName}
            </p>
          )}
          <h3 className="font-serif text-sm leading-snug text-foreground line-clamp-2">
            {template.title}
          </h3>
          <p className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-primary/55 tracking-wide">
            View Details <ArrowUpRight className="h-2.5 w-2.5" />
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
