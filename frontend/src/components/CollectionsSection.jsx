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
    <section className="py-20 sm:py-24 lg:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* =====================================================
            SECTION HEADING
            ===================================================== */}
        <SectionHeading
          eyebrow="Our Craft"
          title="Explore Our Collections"
          subtitle="Curated, hand-finished pieces — from digital reveals to keepsake gifts."
        />

        {/* =====================================================
            COLLECTIONS
            ===================================================== */}
        <div className="mt-12 sm:mt-14">

          {/* ===================================================
              MOBILE / TABLET HORIZONTAL SLIDER
              =================================================== */}
          <div className="lg:hidden overflow-hidden">
            <div
              className="
                flex
                gap-4
                overflow-x-auto
                snap-x
                snap-mandatory
                scroll-smooth
                pb-3
                -mx-4
                px-4
                pr-[20vw]
                sm:pr-[12vw]
              "
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {COLLECTIONS.map((c, i) => (
                <motion.div
                  key={c.title}
                  initial={{
                    opacity: 0,
                    y: 30,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    margin: "-80px",
                  }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.08,
                  }}
                  className="
                    shrink-0
                    snap-start
                    w-[72vw]
                    sm:w-[43vw]
                    h-[510px]
                    sm:h-[520px]
                  "
                >
                  <CollectionCard c={c} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* ===================================================
              DESKTOP GRID
              =================================================== */}
          <div className="hidden lg:grid grid-cols-4 gap-6 items-stretch">
            {COLLECTIONS.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  margin: "-80px",
                }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.08,
                }}
                className="h-[530px]"
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

/* =============================================================
   COLLECTION CARD
   ============================================================= */

function CollectionCard({ c }) {
  return (
    <Link
      to={c.to}
      className="
        group
        block
        h-full
        rounded-[22px]
        overflow-hidden
        border
        border-[#d9b66c]/70
        bg-background
        shadow-[0_8px_30px_rgba(0,0,0,0.06)]
        transition-all
        duration-500
        hover:-translate-y-1
        hover:shadow-[0_14px_40px_rgba(0,0,0,0.10)]
      "
    >
      {/* =======================================================
          IMAGE
          ======================================================= */}
      <div
        className="
          relative
          w-full
          h-[290px]
          sm:h-[300px]
          lg:h-[355px]
          overflow-hidden
        "
      >
        <img
          src={c.image}
          alt={c.title}
          loading="lazy"
          className="
            w-full
            h-full
            object-cover
            object-center
            transition-transform
            duration-700
            ease-out
            group-hover:scale-[1.04]
          "
        />

        {/* =====================================================
            TAGS
            ===================================================== */}
        <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
          {c.tags.map((t) => (
            <span
              key={t}
              className="
                px-3
                py-1.5
                rounded-full
                text-[9px]
                sm:text-[10px]
                tracking-[0.12em]
                uppercase
                font-medium
                bg-white/90
                text-[#26211b]
                backdrop-blur-sm
                border
                border-white/60
              "
            >
              {t}
            </span>
          ))}
        </div>

        {/* =====================================================
            ARROW
            ===================================================== */}
        <div
          className="
            absolute
            top-4
            right-4
            h-10
            w-10
            rounded-full
            flex
            items-center
            justify-center
            bg-white/90
            text-[#26211b]
            backdrop-blur-sm
            transition-all
            duration-300
            group-hover:bg-[#c9a227]
            group-hover:text-white
            group-hover:rotate-12
          "
        >
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>

      {/* =======================================================
          CONTENT
          ======================================================= */}
      <div
        className="
          flex
          flex-col
          h-[175px]
          lg:h-[175px]
          px-5
          py-5
          sm:px-6
          sm:py-6
        "
      >
        {/* Title */}
        <h3
          className="
            font-serif
            text-xl
            sm:text-[21px]
            lg:text-[20px]
            leading-[1.25]
            text-[#17130f]
            min-h-[50px]
          "
        >
          {c.title}
        </h3>

        {/* Description */}
        <p
          className="
            mt-2
            text-sm
            leading-[1.55]
            text-muted-foreground
            line-clamp-2
            min-h-[44px]
          "
        >
          {c.description}
        </p>

        {/* Explore */}
        <div
          className="
            mt-auto
            pt-3
            flex
            items-center
            gap-1.5
            text-[11px]
            tracking-[0.16em]
            uppercase
            font-medium
            text-[#b07d18]
            transition-all
            duration-300
            group-hover:gap-2.5
          "
        >
          Explore
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </Link>
  );
}

/* =============================================================
   SECTION HEADING
   ============================================================= */

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = true,
}) {
  return (
    <div
      className={
        center
          ? "text-center max-w-3xl mx-auto"
          : "max-w-3xl"
      }
    >
      {/* Eyebrow */}
      {eyebrow && (
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="h-px w-6 bg-[#c9a227]" />

          <span
            className="
              text-[10px]
              sm:text-[11px]
              tracking-[0.32em]
              uppercase
              text-[#b07d18]
              font-medium
            "
          >
            {eyebrow}
          </span>

          <span className="h-px w-6 bg-[#c9a227]" />
        </div>
      )}

      {/* Title */}
      <h2
        className="
          font-serif
          text-4xl
          sm:text-5xl
          lg:text-[48px]
          leading-[1.1]
          text-[#17130f]
        "
      >
        {title}
      </h2>

      {/* Subtitle */}
      {subtitle && (
        <p
          className="
            mt-4
            text-base
            sm:text-lg
            leading-relaxed
            text-muted-foreground
          "
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}