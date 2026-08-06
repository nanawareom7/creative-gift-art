import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import digitalImg from "@/assets/collection-digital.png";
import stationeryImg from "@/assets/collection-stationery.png";
import giftsImg from "@/assets/collection-gifts.png";
import websiteImg from "@/assets/collection-website.png";

const COLLECTIONS = [
  {
    title: "Digital Invitations",
    description: "Static & video invitations for every celebration.",
    image: digitalImg,
    to: "/service/digital-invitations",
    tags: ["Static", "Video"],
  },
  {
    title: "Wedding & Event Stationery",
    description: "Crests, welcome boards, menus and seating charts.",
    image: stationeryImg,
    to: "/service/wedding-event-stationery",
    tags: ["Crests", "Menus", "Seating"],
  },
  {
    title: "Customized Gifts",
    description: "Frames, mugs, keychains, wallet cards & mousepads.",
    image: giftsImg,
    to: "/service/customized-gifts",
    tags: ["Frames", "Mugs", "Keychains"],
  },
  {
    title: "Wedding Websites",
    description: "Elegant single-page websites for your big day.",
    image: websiteImg,
    to: "/service/wedding-website-invitations",
    tags: ["Bespoke", "Mobile-first"],
  },
];

export default function CollectionsSection() {
  return (
    <section className="section-pad bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Our Craft"
          title="Explore Our Collections"
          subtitle="Curated, hand-finished pieces — from digital reveals to keepsake gifts."
        />

        {/* Mobile: horizontal scroll | Desktop: grid */}
        <div className="mt-14">
          {/* ── Mobile slider ──
              Outer div: overflow-hidden clips vertically so cards don't bleed
              into sections above/below, but the inner div overflows horizontally.
              pr-[20vw] on the inner scroll row ensures ~20-25 % of the NEXT
              card is always visible, giving a clear scroll affordance.
          */}
          <div className="lg:hidden overflow-hidden">
            <div
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 -mx-4 px-4 pr-[20vw] sm:pr-[12vw]"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
            >
              {COLLECTIONS.map((c, i) => (
                <motion.div
                  key={c.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  className="shrink-0 snap-start w-[72vw] sm:w-[43vw]"
                >
                  <CollectionCard c={c} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Desktop grid */}
          <div className="hidden lg:grid grid-cols-4 gap-6">
            {COLLECTIONS.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
              >
                <CollectionCard c={c} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CollectionCard({ c }) {
  return (
    <Link
      to={c.to}
      className="group block rounded-2xl overflow-hidden gold-border bg-card luxe-shadow hover:-translate-y-1 transition-all duration-500"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={c.image}
          alt={c.title}
          className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute top-4 right-4 grid place-items-center h-9 w-9 rounded-full glass">
          <ArrowUpRight className="h-4 w-4 text-foreground" />
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-1.5">
          {c.tags.map((t) => (
            <span
              key={t}
              className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full glass text-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-serif text-xl text-foreground">{c.title}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">{c.description}</p>
        <div className="mt-4 text-[11px] tracking-widest uppercase text-primary group-hover:gap-2 inline-flex items-center gap-1 transition-all">
          Explore <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </Link>
  );
}


export function SectionHeading({ eyebrow, title, subtitle, center = true }) {
  return (
    <div className={center ? "text-center max-w-2xl mx-auto" : "max-w-2xl"}>
      {eyebrow && (
        <div className="text-[11px] tracking-[0.3em] uppercase text-primary mb-4 inline-flex items-center gap-2">
          <span className="h-px w-6 bg-primary/60" />
          {eyebrow}
          <span className="h-px w-6 bg-primary/60" />
        </div>
      )}
      <h2 className="font-serif text-4xl md:text-5xl text-foreground">{title}</h2>
      {subtitle && (
        <p className="mt-4 text-muted-foreground text-base md:text-lg leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
