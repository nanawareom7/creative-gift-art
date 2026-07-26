import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Palette,
  Gem,
  Mail,
  Gift,
  ImageIcon,
  CreditCard,
  UtensilsCrossed,
  Star,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppUrl } from "@/services/api";
import p1 from "@/assets/about-portfolio-1.png";
import p2 from "@/assets/about-portfolio-2.png";
import p3 from "@/assets/about-portfolio-3.png";
import p4 from "@/assets/about-portfolio-4.png";
import heroImg from "@/assets/hero-invitation.jpg";

const WHAT_WE_CREATE = [
  { icon: Palette, title: "Custom Logo Design & Brand Identity" },
  { icon: Gem, title: "Monograms & Personal Branding" },
  { icon: Mail, title: "Wedding Stationery & Invitations" },
  { icon: Star, title: "Digital Invitations & Event Collateral" },
  { icon: Gift, title: "Personalized Gift Designs" },
  { icon: ImageIcon, title: "Custom Illustrations & Artwork" },
  { icon: CreditCard, title: "Visiting Cards & Business Stationery" },
  { icon: UtensilsCrossed, title: "Menu Cards & Print Design Solutions" },
];

const WHY_CHOOSE_US = [
  "Every design is 100% custom — no templates, no shortcuts",
  "Quick turnaround with premium quality craftsmanship",
  "Transparent communication throughout the design process",
  "Unlimited revisions until you are absolutely delighted",
  "Designs delivered in print-ready & digital formats",
  "Trusted by 500+ happy clients across India",
];

const PORTFOLIO = [
  { src: p1, label: "Personalized Gifts", size: "tall" },
  { src: p2, label: "Wedding Stationery", size: "normal" },
  { src: p3, label: "Monogram Design", size: "normal" },
  { src: heroImg, label: "Wedding Invitations", size: "tall" },
  { src: p4, label: "Visiting Cards", size: "normal" },
];

export default function About() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── Hero ── */}
      <section className="relative overflow-hidden section-pad">
        <div className="absolute inset-0 bg-gradient-to-b from-champagne/60 via-background to-background -z-10" />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="text-[11px] tracking-[0.3em] uppercase text-primary mb-6 inline-flex items-center gap-2">
              <span className="h-px w-6 bg-primary/60" />
              Our Story
              <span className="h-px w-6 bg-primary/60" />
            </div>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-foreground leading-tight">
              About{" "}
              <span className="italic gold-gradient-text font-display">Creative Gift Art</span>
            </h1>
            <p className="mt-8 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Every celebration, brand, and milestone has a story worth remembering. At Creative
              Gift Art, we transform ideas into meaningful designs that leave a lasting impression.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── About Content ── */}
      <section className="section-pad">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="text-[11px] tracking-[0.3em] uppercase text-primary mb-4 inline-flex items-center gap-2">
                <span className="h-px w-6 bg-primary/60" /> Who We Are
              </div>
              <h2 className="font-serif text-4xl text-foreground leading-tight">
                We craft{" "}
                <span className="italic gold-gradient-text font-display">visual experiences</span>{" "}
                that reflect your story.
              </h2>
              <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  From elegant wedding stationery and personalized gifts to custom illustrations,
                  logos, monograms, and branding materials, every piece we create is designed with
                  purpose, creativity, and attention to detail.
                </p>
                <p>
                  We don't simply create designs — we craft visual experiences that reflect your
                  personality, style, and story. Whether it's a grand wedding or an intimate
                  birthday celebration, we bring your vision to life with precision and passion.
                </p>
              </div>
              <Button
                asChild
                className="mt-8 rounded-full px-8 h-12 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <a href={buildWhatsAppUrl("Hi! I'd love to discuss a custom design project with Creative Gift Art.")} target="_blank" rel="noreferrer">
                  Start a Project <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </motion.div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative"
            >
              <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-gold-soft via-champagne to-transparent blur-2xl opacity-60 -z-10" />
              <div className="rounded-[2rem] overflow-hidden luxe-shadow gold-border">
                <img
                  src={p2}
                  alt="Wedding Stationery by Creative Gift Art"
                  className="w-full h-[480px] object-cover"
                />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-5 -right-5 glass rounded-2xl p-4 luxe-shadow gold-border hidden sm:block">
                <div className="text-[10px] tracking-widest uppercase text-primary mb-0.5">
                  Studio Since
                </div>
                <div className="font-serif text-2xl text-foreground">2019</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── What We Create ── */}
      <section className="section-pad bg-gradient-to-b from-secondary/30 to-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-[11px] tracking-[0.3em] uppercase text-primary mb-4 inline-flex items-center gap-2">
              <span className="h-px w-6 bg-primary/60" /> Our Craft
              <span className="h-px w-6 bg-primary/60" />
            </div>
            <h2 className="font-serif text-4xl md:text-5xl text-foreground">What We Create</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              A full spectrum of creative design services — each one delivered with luxury-grade
              attention to detail.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WHAT_WE_CREATE.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="bg-card rounded-2xl p-6 gold-border luxe-shadow hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="h-11 w-11 rounded-xl bg-primary/10 grid place-items-center mb-4 group-hover:bg-primary/20 transition">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-serif text-base text-foreground leading-snug">{item.title}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Clients Choose Us ── */}
      <section className="section-pad">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative order-2 lg:order-1"
            >
              <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-champagne via-gold-soft to-transparent blur-2xl opacity-50 -z-10" />
              <div className="rounded-[2rem] overflow-hidden luxe-shadow gold-border">
                <img
                  src={p3}
                  alt="Monogram Design"
                  className="w-full h-[460px] object-cover"
                />
              </div>
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="order-1 lg:order-2"
            >
              <div className="text-[11px] tracking-[0.3em] uppercase text-primary mb-4 inline-flex items-center gap-2">
                <span className="h-px w-6 bg-primary/60" /> Our Promise
              </div>
              <h2 className="font-serif text-4xl text-foreground">
                Why Clients{" "}
                <span className="italic gold-gradient-text font-display">Choose Us</span>
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed mb-8">
                We believe every design should feel personal, purposeful, and premium. Here's what
                sets Creative Gift Art apart.
              </p>
              <ul className="space-y-4">
                {WHY_CHOOSE_US.map((reason, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground/80 text-sm leading-relaxed">{reason}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Portfolio Gallery ── */}
      <section className="section-pad bg-gradient-to-b from-background to-secondary/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-[11px] tracking-[0.3em] uppercase text-primary mb-4 inline-flex items-center gap-2">
              <span className="h-px w-6 bg-primary/60" /> Our Work
              <span className="h-px w-6 bg-primary/60" />
            </div>
            <h2 className="font-serif text-4xl md:text-5xl text-foreground">Portfolio Gallery</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              A glimpse into our world of premium design.
            </p>
          </div>

          {/* Masonry-style gallery */}
          <div className="columns-2 md:columns-3 gap-4 space-y-4">
            {PORTFOLIO.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="break-inside-avoid group relative rounded-2xl overflow-hidden gold-border luxe-shadow"
              >
                <img
                  src={item.src}
                  alt={item.label}
                  className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${item.size === "tall" ? "h-[320px] md:h-[400px]" : "h-[200px] md:h-[260px]"
                    }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="text-[10px] tracking-widest uppercase text-white/90">
                    {item.label}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section-pad">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative rounded-3xl overflow-hidden gold-border luxe-shadow bg-gradient-to-br from-champagne via-background to-gold-soft p-10 md:p-16">
            <div className="text-[11px] tracking-[0.3em] uppercase text-primary mb-4">
              ✦ Ready to Begin? ✦
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-foreground">
              Let's create something{" "}
              <span className="italic gold-gradient-text font-display">beautiful together.</span>
            </h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              Reach out on WhatsApp with your vision and we'll get started right away.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="rounded-full px-8 h-12 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <a href={buildWhatsAppUrl()} target="_blank" rel="noreferrer">
                  Contact On WhatsApp
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-8 h-12 gold-border">
                <Link to="/collection/all">Browse Designs</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
