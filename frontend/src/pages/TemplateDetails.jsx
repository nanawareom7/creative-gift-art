import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft, MessageCircle, Tag, Globe, Play,
  ChevronLeft, ChevronRight, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { templatesApi, resolveImage, buildWhatsAppUrl } from "@/services/api";

/* ─────────────────────────────────────────────────────────────── */
/*  Helpers                                                         */
/* ─────────────────────────────────────────────────────────────── */

function getYoutubeId(url = "") {
  const m = url.match(
    /(?:youtube\.com\/(?:shorts\/|watch\?v=|embed\/)|youtu\.be\/)([\w-]{6,})/
  );
  return m ? m[1] : null;
}

/* ─────────────────────────────────────────────────────────────── */
/*  Lightbox — fullscreen image viewer                             */
/* ─────────────────────────────────────────────────────────────── */

function Lightbox({ images, startAt, onClose }) {
  const [idx, setIdx] = useState(startAt);
  const touchStartX = useRef(null);

  const prev = useCallback(
    () => setIdx(i => (i - 1 + images.length) % images.length),
    [images.length]
  );
  const next = useCallback(
    () => setIdx(i => (i + 1) % images.length),
    [images.length]
  );

  /* keyboard */
  useEffect(() => {
    const onKey = e => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, prev, next]);

  /* lock body scroll */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  /* swipe */
  const onTouchStart = e => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = e => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); }
    touchStartX.current = null;
  };

  return (
    <motion.div
      key="lightbox"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: "rgba(8,5,2,0.96)", backdropFilter: "blur(10px)" }}
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Counter */}
      {images.length > 1 && (
        <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[11px] text-white/50 tracking-widest z-10 select-none">
          {idx + 1} / {images.length}
        </span>
      )}

      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 h-10 w-10 rounded-full flex items-center justify-center z-10 transition-transform hover:scale-110 focus:outline-none"
        style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)" }}
      >
        <X className="h-4.5 w-4.5 text-white" />
      </button>

      {/* Image */}
      <motion.div
        key={idx}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="relative"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: "90vw", maxHeight: "90vh" }}
      >
        <img
          src={resolveImage(images[idx])}
          alt={`Image ${idx + 1}`}
          draggable={false}
          className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl select-none"
          style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.7)" }}
        />
      </motion.div>

      {/* Prev / Next */}
      {images.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); prev(); }}
            aria-label="Previous"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full flex items-center justify-center z-10 transition-transform hover:scale-110 focus:outline-none"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)" }}
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); next(); }}
            aria-label="Next"
            className="absolute right-3 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full flex items-center justify-center z-10 transition-transform hover:scale-110 focus:outline-none"
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)" }}
          >
            <ChevronRight className="h-5 w-5 text-white" />
          </button>
        </>
      )}

      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); setIdx(i); }}
              aria-label={`Image ${i + 1}`}
              className="rounded-full transition-all duration-300 focus:outline-none"
              style={{
                width: i === idx ? "22px" : "8px",
                height: "8px",
                background: i === idx
                  ? "linear-gradient(135deg,#c9a227,#f0d87a)"
                  : "rgba(255,255,255,0.3)",
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  Image grid for video templates (shown below YouTube player)    */
/* ─────────────────────────────────────────────────────────────── */

function ImageGrid({ images, onClickImage }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
      {images.map((src, i) => (
        <button
          key={i}
          onClick={() => onClickImage(i)}
          aria-label={`Open image ${i + 1} fullscreen`}
          className="group/img block rounded-xl overflow-hidden gold-border luxe-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          style={{ aspectRatio: "3/4" }}
        >
          <img
            src={resolveImage(src)}
            alt={`Preview ${i + 1}`}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-[1.05]"
            onError={e => { e.target.parentElement.style.display = "none"; }}
          />
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  Image gallery for static templates (main + thumbnails)         */
/* ─────────────────────────────────────────────────────────────── */

function StaticGallery({ images, onClickImage }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      {/* Main preview — clickable → opens lightbox */}
      <button
        onClick={() => onClickImage(active)}
        className="block w-full rounded-2xl overflow-hidden gold-border luxe-shadow bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Open fullscreen"
      >
        <img
          src={resolveImage(images[active])}
          alt="Template preview"
          className="w-full h-auto object-cover"
          style={{ maxHeight: "520px" }}
          onError={e => { e.target.style.display = "none"; }}
        />
      </button>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 flex-wrap">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              className="rounded-lg overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all duration-200"
              style={{
                width: "64px",
                height: "64px",
                outline: i === active
                  ? "2px solid color-mix(in oklab,var(--gold) 80%,transparent)"
                  : "2px solid transparent",
                outlineOffset: "2px",
                opacity: i === active ? 1 : 0.55,
              }}
            >
              <img
                src={resolveImage(src)}
                alt={`Thumb ${i + 1}`}
                className="w-full h-full object-cover"
                onError={e => { e.target.parentElement.style.display = "none"; }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  Loading skeleton                                               */
/* ─────────────────────────────────────────────────────────────── */

function Skeleton() {
  return (
    <div className="section-pad">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
          <div className="rounded-2xl aspect-[3/4] bg-muted animate-pulse" />
          <div className="space-y-4 pt-4">
            <div className="h-3 w-24 bg-muted animate-pulse rounded" />
            <div className="h-10 w-3/4 bg-muted animate-pulse rounded" />
            <div className="h-4 w-full bg-muted animate-pulse rounded mt-6" />
            <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
            <div className="h-4 w-4/6 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  Main page                                                       */
/* ─────────────────────────────────────────────────────────────── */

export default function TemplateDetails() {
  const { slug } = useParams();
  const [t, setT] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxIdx, setLightboxIdx] = useState(null);   // null = closed

  useEffect(() => {
    setLoading(true);
    setLightboxIdx(null);
    templatesApi
      .get(slug)
      .then(res => { setT(res?.data?.template || res?.data || null); })
      .catch(e => setError(e?.response?.data?.message || e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <Skeleton />;

  if (error || !t)
    return (
      <div className="section-pad text-center">
        <p className="text-muted-foreground">{error || "Template not found."}</p>
        <Button asChild variant="link" className="mt-4">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    );

  /* computed */
  const type = t.type || (t.youtubeLink ? "video" : "static");
  const isVideo = type === "video";
  const isWebsite = type === "website";
  const ytId = getYoutubeId(t.youtubeLink || "");

  /* Always collect images regardless of template type */
  const images = t.images?.length
    ? t.images
    : t.thumbnail ? [t.thumbnail] : [];

  const categoryName = t.categoryId?.name || t.category?.name || "Invitation";
  const serviceName = t.serviceId?.name || null;
  const typeLabel = isVideo ? "Video" : isWebsite ? "Website" : "Static";

  const whatsappMsg = `Hi! I'm interested in the "${t.title}" ${typeLabel.toLowerCase()} invitation from Creative Gift Art. Can you share more details?`;

  return (
    <>
      {/* ── Lightbox ────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxIdx !== null && images.length > 0 && (
          <Lightbox
            images={images}
            startAt={lightboxIdx}
            onClose={() => setLightboxIdx(null)}
          />
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <section className="section-pad">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            {/* Back */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>

            <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">

              {/* ── Left: media ──────────────────────────────── */}
              <div className="space-y-6">

                {/* SECTION 1: YouTube player (video / website only) */}
                {(isVideo || isWebsite) && ytId && (
                  <div className="rounded-2xl overflow-hidden gold-border luxe-shadow aspect-[9/16] max-h-[720px] mx-auto bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}?autoplay=0&rel=0&modestbranding=1`}
                      title={t.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                {/* SECTION 2a: image grid below video (click → lightbox immediately) */}
                {(isVideo || isWebsite) && images.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/60 mb-3 select-none">
                      Preview Images — tap to enlarge
                    </p>
                    <ImageGrid
                      images={images}
                      onClickImage={i => setLightboxIdx(i)}
                    />
                  </div>
                )}

                {/* SECTION 2b: static gallery (main + thumbnails, click → lightbox) */}
                {!isVideo && !isWebsite && images.length > 0 && (
                  <StaticGallery
                    images={images}
                    onClickImage={i => setLightboxIdx(i)}
                  />
                )}

                {/* SECTION 2c: no-media fallback */}
                {images.length === 0 && !ytId && (
                  <div
                    className="rounded-2xl overflow-hidden gold-border luxe-shadow bg-muted flex flex-col items-center justify-center gap-3 text-muted-foreground/25"
                    style={{ aspectRatio: "3/4" }}
                  >
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.7">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span className="text-xs uppercase tracking-widest">No Preview Available</span>
                  </div>
                )}
              </div>

              {/* ── Right: info ──────────────────────────────── */}
              <div className="lg:pt-2 lg:sticky lg:top-8">

                {/* Breadcrumb meta */}
                <div className="text-[11px] tracking-[0.28em] uppercase text-primary mb-4 flex items-center gap-2 flex-wrap">
                  {serviceName && (
                    <>
                      <span>{serviceName}</span>
                      <span className="text-muted-foreground/40">·</span>
                    </>
                  )}
                  <span>{categoryName}</span>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="inline-flex items-center gap-1">
                    {isVideo && <Play className="h-2.5 w-2.5 fill-current" />}
                    {isWebsite && <Globe className="h-2.5 w-2.5" />}
                    {typeLabel}
                  </span>
                </div>

                <h1 className="font-serif text-4xl md:text-5xl text-foreground leading-tight">
                  {t.title}
                </h1>

                {t.description && (
                  <p className="mt-6 text-muted-foreground leading-relaxed whitespace-pre-line">
                    {t.description}
                  </p>
                )}

                {t.tags?.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {t.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground"
                      >
                        <Tag className="h-3 w-3" /> {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* WhatsApp CTA */}
                <div className="mt-10">
                  <Button
                    asChild
                    size="lg"
                    className="rounded-full px-8 h-12 bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
                  >
                    <a href={buildWhatsAppUrl(whatsappMsg)} target="_blank" rel="noreferrer">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Contact On WhatsApp
                    </a>
                  </Button>
                </div>

                {/* Meta */}
                <div className="mt-10 grid grid-cols-2 gap-4 pt-8 border-t border-border/50">
                  <Info label="Type" value={typeLabel} />
                  <Info label="Views" value={t.views ?? 0} />
                  {categoryName && <Info label="Category" value={categoryName} />}
                  {serviceName && <Info label="Service" value={serviceName} />}
                  {images.length > 0 && <Info label="Images" value={images.length} />}
                </div>
              </div>
            </div>
          </div>
        </section>
      </motion.div>
    </>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-serif text-lg capitalize mt-0.5">{value}</div>
    </div>
  );
}
