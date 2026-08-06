import { Link } from "react-router-dom";
import { Mail, Instagram, MessageCircle } from "lucide-react";
import logo from "@/assets/cga-logo.png";
import { buildWhatsAppUrl } from "@/services/api";

const EMAIL = import.meta.env.VITE_CONTACT_EMAIL || "creativegiftart01@gmail.com";
const IG = import.meta.env.VITE_INSTAGRAM || "creative_gift_art01";

export default function Footer() {
  return (
    <footer className="relative mt-16 bg-gradient-to-b from-background to-champagne/30 border-t border-border">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-10">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="Creative Gift Art" className="h-12 w-auto" />
              <div className="leading-tight">
                <div className="font-serif text-lg">Creative Gift Art</div>
                <div className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
                  Luxury Invitations
                </div>
              </div>
            </Link>
            <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
              A premium digital invitation studio crafting elegant designs for life's most
              memorable celebrations.
            </p>
          </div>

          <FooterCol title="Quick Links">
            <FLink to="/">Home</FLink>
            <FLink to="/collection/all">Digital Invitations</FLink>
            <FLink to="/collection/website">Wedding Websites</FLink>
            <FLink to="/category/stationery">Stationery</FLink>
            <FLink to="/category/gifts">Customized Gifts</FLink>
            <FLink to="/about">About Us</FLink>
          </FooterCol>

          <FooterCol title="Collections">
            <FLink to="/category/wedding">Wedding</FLink>
            <FLink to="/category/engagement">Engagement</FLink>
            <FLink to="/category/birthday">Birthday</FLink>
            <FLink to="/category/baby-shower">Baby Shower</FLink>
            <FLink to="/category/save-the-date">Save The Date</FLink>
          </FooterCol>


          <FooterCol title="Contact">
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm text-foreground/80 hover:text-primary"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className="flex items-center gap-2 text-sm text-foreground/80 hover:text-primary"
            >
              <Mail className="h-4 w-4" /> {EMAIL}
            </a>
            <a
              href={`https://instagram.com/${IG}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm text-foreground/80 hover:text-primary"
            >
              <Instagram className="h-4 w-4" /> @{IG}
            </a>
          </FooterCol>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Creative Gift Art. Handcrafted with care.
          </p>
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary/80">
            ✦ Luxury · Premium · Bespoke ✦
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.25em] text-primary mb-4">{title}</div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}
function FLink({ to, children }) {
  return (
    <Link to={to} className="block text-sm text-foreground/80 hover:text-primary transition">
      {children}
    </Link>
  );
}
