import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Search, Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import logo from "@/assets/cga-logo.png";
import {
  buildWhatsAppUrl,
  servicesApi,
  categoriesApi,
  extractServices,
  extractCategories,
} from "@/services/api";
import SearchModal from "@/components/SearchModal";

function categoryRoute(catSlug) {
  return `/category/${catSlug}`;
}

// WhatsApp SVG icon (green)
function WhatsAppIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [navItems, setNavItems] = useState([]);
  const [navLoading, setNavLoading] = useState(true);
  const [expandedItem, setExpandedItem] = useState(null);
  const navigate = useNavigate();

  // ── Fetch services + categories and build nav structure ──
  useEffect(() => {
    let cancelled = false;
    const buildNav = async () => {
      try {
        const [svcRes, catRes] = await Promise.all([
          servicesApi.list({ active: true }),
          categoriesApi.list({ active: true }),
        ]);
        if (cancelled) return;
        const services = extractServices(svcRes);
        const categories = extractCategories(catRes);
        const catsByService = {};
        categories.forEach((c) => {
          const sid = c.serviceId?._id || c.serviceId || "__none__";
          if (!catsByService[sid]) catsByService[sid] = [];
          catsByService[sid].push(c);
        });
        const built = services
          .filter((s) => (catsByService[s._id] || []).length > 0)
          .map((s) => ({
            label: s.name,
            serviceSlug: s.slug,
            serviceId: s._id,
            children: [
              {
                heading: s.name,
                items: (catsByService[s._id] || [])
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  // Pass ?service=slug so CategoryPage only shows this service's categories
                  .map((c) => [c.name, `${categoryRoute(c.slug)}?service=${s.slug}`]),
              },
            ],
          }));
        setNavItems(built);
      } catch {
        // keep navItems empty
      } finally {
        if (!cancelled) setNavLoading(false);
      }
    };
    buildNav();
    return () => { cancelled = true; };
  }, []);

  // Close drawer on route change
  const closeDrawer = () => {
    setDrawerOpen(false);
    setExpandedItem(null);
  };

  return (
    <>
      <header className="sticky top-0 z-40 glass border-b border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* ── MOBILE header (< lg) ── */}
          <div className="flex lg:hidden h-16 items-center justify-between">
            {/* Left: Hamburger */}
            <button
              onClick={() => setDrawerOpen((v) => !v)}
              className="p-2 rounded-md hover:bg-accent transition"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Center: Logo */}
            <Link to="/" className="flex items-center gap-2" onClick={closeDrawer}>
              <img src={logo} alt="Creative Gift Art" className="h-10 w-auto" />
              <div className="leading-tight hidden sm:block">
                <div className="font-serif text-base text-foreground">Creative Gift Art</div>
              </div>
            </Link>

            {/* Right: Search + WhatsApp */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 rounded-full hover:bg-accent transition"
                aria-label="Search"
              >
                <Search className="h-4.5 w-4.5" />
              </button>
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="p-2 rounded-full text-[#25D366] hover:bg-accent transition"
              >
                <WhatsAppIcon size={20} />
              </a>
            </div>
          </div>

          {/* ── DESKTOP header (≥ lg) ── */}
          <div className="hidden lg:flex h-20 items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <img src={logo} alt="Creative Gift Art" className="h-12 w-auto" />
              <div className="leading-tight">
                <div className="font-serif text-lg text-foreground">Creative Gift Art</div>
                <div className="text-[10px] tracking-[0.25em] text-muted-foreground uppercase">
                  Luxury Invitations
                </div>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="flex items-center gap-1">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `relative px-4 py-2 text-sm transition-colors ${isActive ? "text-primary" : "text-foreground/80 hover:text-primary"
                  }`
                }
              >
                Home
              </NavLink>

              {navLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-4 w-28 bg-muted animate-pulse rounded mx-2" />
                ))
                : navItems.map((item) => <DesktopNavItem key={item.label} item={item} />)}

              <NavLink
                to="/about"
                className={({ isActive }) =>
                  `relative px-4 py-2 text-sm transition-colors ${isActive ? "text-primary" : "text-foreground/80 hover:text-primary"
                  }`
                }
              >
                About Us
              </NavLink>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 rounded-full hover:bg-accent transition"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition"
              >
                Contact On WhatsApp
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ── MOBILE DRAWER ── */}
      {/* Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={closeDrawer}
        />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-50 w-[85vw] max-w-[320px] bg-background border-r border-border flex flex-col transform transition-transform duration-300 ease-in-out lg:hidden ${drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <Link to="/" onClick={closeDrawer} className="flex items-center gap-2">
            <img src={logo} alt="CGA" className="h-9 w-auto" />
            <div className="font-serif text-base">Creative Gift Art</div>
          </Link>
          <button
            onClick={closeDrawer}
            className="p-1.5 rounded-md hover:bg-accent transition"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer nav items */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <DrawerLink to="/" label="Home" onClick={closeDrawer} />

          {navItems.map((item) => (
            <div key={item.label}>
              <button
                onClick={() =>
                  setExpandedItem((v) => (v === item.label ? null : item.label))
                }
                className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-medium hover:bg-accent transition"
              >
                {item.label}
                <ChevronRight
                  className={`h-4 w-4 text-muted-foreground transition-transform ${expandedItem === item.label ? "rotate-90" : ""
                    }`}
                />
              </button>
              {expandedItem === item.label && (
                <div className="pl-4 mt-1 space-y-1">
                  {item.children.map((col) =>
                    col.items.map(([label, to]) => (
                      <button
                        key={label}
                        onClick={() => {
                          navigate(to);
                          closeDrawer();
                        }}
                        className="block w-full text-left py-2 px-3 rounded-md text-sm text-foreground/75 hover:text-primary hover:bg-accent transition"
                      >
                        {label}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}

          <DrawerLink to="/about" label="About Us" onClick={closeDrawer} />
          <DrawerLink
            to="/search"
            label="Search"
            onClick={closeDrawer}
          />
        </nav>

        {/* Drawer footer CTA */}
        <div className="p-4 border-t border-border">
          <a
            href={buildWhatsAppUrl()}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-full bg-[#25D366] text-white py-3 text-sm font-medium hover:bg-[#1ebe5d] transition"
          >
            <WhatsAppIcon size={18} />
            Contact on WhatsApp
          </a>
        </div>
      </div>

      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

function DrawerLink({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `block py-2.5 px-3 rounded-lg text-sm font-medium transition ${isActive
          ? "bg-primary/10 text-primary"
          : "hover:bg-accent text-foreground"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

function DesktopNavItem({ item }) {
  return (
    <div className="relative group">
      <button className="px-4 py-2 text-sm text-foreground/80 hover:text-primary inline-flex items-center gap-1 transition-colors">
        {item.label}
        <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
      </button>

      {/* Dropdown panel */}
      <div
        className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all
          absolute left-1/2 -translate-x-1/2 top-full pt-3 z-50"
      >
        <div
          className="rounded-xl border border-border bg-popover luxe-shadow p-6 grid gap-6 min-w-[280px]"
          style={{
            gridTemplateColumns: `repeat(${Math.min(item.children.length, 2)}, minmax(0, 1fr))`,
          }}
        >
          {item.children.map((col) => (
            <div key={col.heading}>
              <div className="text-[10px] tracking-widest uppercase text-primary mb-3 font-medium">
                {col.heading}
              </div>
              <ul className="space-y-2">
                {col.items.map(([label, to]) => (
                  <li key={label}>
                    <Link
                      to={to}
                      className="text-sm text-foreground/75 hover:text-primary block transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
