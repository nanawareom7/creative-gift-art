import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileImage, Star, Tags, Eye, Plus, Layers } from "lucide-react";
import { dashboardApi } from "@/services/api";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .stats()
      .then((res) => {
        // api.js does .then(r => r.data), so res = { success, message, data: { ... } }
        setStats(res?.data || null);
      })
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl">Studio Overview</h1>
          <p className="text-muted-foreground text-sm">
            A glance at your collection performance.
          </p>
        </div>
        <Button asChild className="rounded-full">
          <Link to="/om-admin/templates/new">
            <Plus className="h-4 w-4 mr-1.5" /> New Template
          </Link>
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <Stat
          icon={FileImage}
          label="Total Templates"
          value={stats?.totalTemplates ?? "—"}
          loading={loading}
        />
        <Stat
          icon={Star}
          label="Featured"
          value={stats?.featuredTemplates ?? "—"}
          loading={loading}
        />
        <Stat
          icon={Layers}
          label="Services"
          value={stats?.totalServices ?? "—"}
          loading={loading}
        />
        <Stat
          icon={Tags}
          label="Categories"
          value={stats?.totalCategories ?? "—"}
          loading={loading}
        />
        <Stat
          icon={Eye}
          label="Total Views"
          value={stats?.totalViews?.toLocaleString() ?? "—"}
          loading={loading}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <Panel title="Recent Templates">
          {stats?.recentTemplates?.length ? (
            <ul className="divide-y">
              {stats.recentTemplates.slice(0, 6).map((t) => (
                <li
                  key={t._id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <span className="truncate text-sm">{t.title}</span>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground shrink-0">
                    {t.type || "static"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty />
          )}
        </Panel>

        <Panel title="Top Viewed">
          {stats?.topViewedTemplates?.length ? (
            <ul className="divide-y">
              {stats.topViewedTemplates.slice(0, 6).map((t) => (
                <li
                  key={t._id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <span className="truncate text-sm">{t.title}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {t.views?.toLocaleString()} views
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty />
          )}
        </Panel>

        {stats?.templatesByService?.length > 0 && (
          <Panel title="By Service">
            <ul className="divide-y">
              {stats.templatesByService.slice(0, 6).map((s, i) => (
                <li key={i} className="py-3 flex items-center justify-between gap-3">
                  <span className="truncate text-sm">{s.serviceName || "Uncategorised"}</span>
                  <span className="text-xs font-medium text-primary shrink-0">{s.count}</span>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        {stats?.templatesByCategory?.length > 0 && (
          <Panel title="By Category">
            <ul className="divide-y">
              {stats.templatesByCategory.slice(0, 6).map((c, i) => (
                <li key={i} className="py-3 flex items-center justify-between gap-3">
                  <span className="truncate text-sm">{c.categoryName || "Uncategorised"}</span>
                  <span className="text-xs font-medium text-primary shrink-0">{c.count}</span>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, loading }) {
  return (
    <div className="rounded-2xl bg-card gold-border luxe-shadow p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="mt-3 font-serif text-3xl">{loading ? "…" : value}</div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="rounded-2xl bg-card gold-border luxe-shadow p-6">
      <h2 className="font-serif text-lg mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Empty() {
  return <p className="text-sm text-muted-foreground">No data yet.</p>;
}
