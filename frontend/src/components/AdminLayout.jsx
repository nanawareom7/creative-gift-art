import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { LayoutDashboard, FileImage, Tags, Layers, LogOut, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/cga-logo.png";

export default function AdminLayout() {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("cga_token");
    navigate("/om-admin/login");
  };

  const linkCls = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${
      isActive
        ? "bg-primary text-primary-foreground"
        : "text-foreground/80 hover:bg-accent"
    }`;

  return (
    <div className="min-h-screen flex bg-secondary/40">
      <aside className="hidden md:flex md:w-64 flex-col border-r border-border bg-card">
        <div className="px-5 py-5 border-b flex items-center gap-3">
          <img src={logo} alt="CGA" className="h-9 w-auto" />
          <div className="leading-tight">
            <div className="font-serif">CGA Admin</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Studio Panel
            </div>
          </div>
        </div>
        <nav className="p-3 space-y-1 flex-1">
          <NavLink end to="/om-admin" className={linkCls}>
            <LayoutDashboard className="h-4 w-4" /> Overview
          </NavLink>
          <NavLink to="/om-admin/templates" className={linkCls}>
            <FileImage className="h-4 w-4" /> Templates
          </NavLink>
          <NavLink to="/om-admin/categories" className={linkCls}>
            <Tags className="h-4 w-4" /> Categories
          </NavLink>
          <NavLink to="/om-admin/services" className={linkCls}>
            <Layers className="h-4 w-4" /> Services
          </NavLink>
        </nav>
        <div className="p-3 border-t space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary px-4 py-2"
          >
            <ExternalLink className="h-3.5 w-3.5" /> View Site
          </Link>
          <Button variant="outline" className="w-full" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden flex items-center justify-between px-4 h-14 border-b bg-card">
          <div className="flex items-center gap-2">
            <img src={logo} alt="CGA" className="h-8 w-auto" />
            <span className="font-serif">CGA Admin</span>
          </div>
          <Button size="sm" variant="outline" onClick={logout}>
            Logout
          </Button>
        </header>
        <div className="md:hidden flex gap-1 p-2 border-b bg-card overflow-x-auto">
          <NavLink end to="/om-admin" className={linkCls}>Overview</NavLink>
          <NavLink to="/om-admin/templates" className={linkCls}>Templates</NavLink>
          <NavLink to="/om-admin/categories" className={linkCls}>Categories</NavLink>
          <NavLink to="/om-admin/services" className={linkCls}>Services</NavLink>
        </div>
        <main className="p-5 md:p-8 flex-1 overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
