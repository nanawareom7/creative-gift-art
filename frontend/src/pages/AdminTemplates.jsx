import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { templatesApi, resolveImage, extractTemplates } from "@/services/api";

export default function AdminTemplates() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    // isActive=all → backend returns ALL templates (active + inactive)
    templatesApi
      .list({ limit: 50, isActive: "all" })
      .then((res) => setItems(extractTemplates(res)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async (t) => {
    if (!confirm(`Delete "${t.title}"?`)) return;
    try {
      await templatesApi.remove(t._id);
      toast.success("Template deleted");
      setItems((cur) => cur.filter((x) => x._id !== t._id));
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to delete");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl">Templates</h1>
          <p className="text-sm text-muted-foreground">Manage your invitation collection.</p>
        </div>
        <Button asChild className="rounded-full">
          <Link to="/om-admin/templates/new">
            <Plus className="h-4 w-4 mr-1.5" /> Add Template
          </Link>
        </Button>
      </div>

      <div className="rounded-2xl bg-card gold-border luxe-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60">
              <tr>
                <Th>Image</Th>
                <Th>Title</Th>
                <Th>Category</Th>
                <Th>Type</Th>
                <Th>Featured</Th>
                <Th className="text-right pr-4">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No templates yet.{" "}
                    <Link to="/om-admin/templates/new" className="text-primary underline">
                      Add the first one.
                    </Link>
                  </td>
                </tr>
              )}
              {items.map((t) => (
                <tr key={t._id} className="border-t hover:bg-accent/30 transition">
                  <Td>
                    <img
                      src={resolveImage(t.thumbnail)}
                      alt=""
                      className="h-12 w-12 rounded-md object-cover bg-muted"
                    />
                  </Td>
                  <Td className="font-medium max-w-[200px] truncate">{t.title}</Td>
                  <Td className="text-muted-foreground">
                    {t.categoryId?.name || t.category?.name || "—"}
                  </Td>
                  <Td>
                    <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-secondary">
                      {t.type || "static"}
                    </span>
                  </Td>
                  <Td>
                    {t.featured ? (
                      <span className="inline-flex items-center gap-1 text-xs text-primary">
                        <Star className="h-3 w-3" /> Yes
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">No</span>
                    )}
                  </Td>
                  <Td className="text-right pr-4">
                    <div className="inline-flex gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/om-admin/templates/${t._id}/edit`}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => remove(t)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const Th = ({ children, className = "" }) => (
  <th
    className={`text-left text-xs uppercase tracking-widest font-medium text-muted-foreground px-4 py-3 ${className}`}
  >
    {children}
  </th>
);
const Td = ({ children, className = "" }) => (
  <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>
);
