import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, X, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ErrorBoundary from "@/components/ErrorBoundary";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { categoriesApi, servicesApi, extractCategories, extractServices } from "@/services/api";

// Sentinel to avoid Radix UI Select crash with empty string value
const NONE = "__none__";

const EMPTY_FORM = { name: "", serviceId: NONE, description: "", isActive: true };

export default function AdminCategories() {
  const [items, setItems] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadCategories = () => {
    setLoading(true);
    categoriesApi
      .list()
      .then((res) => setItems(extractCategories(res)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(loadCategories, []);

  // Load ALL services for the dropdown (active + inactive)
  // Previously called list({ active: false }) which returned only INACTIVE services!
  useEffect(() => {
    servicesApi
      .listAll()
      .then((res) => setServices(extractServices(res)))
      .catch(() => {});
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      name: c.name || "",
      serviceId: c.serviceId?._id || c.serviceId || NONE,
      description: c.description || "",
      isActive: c.isActive ?? true,
    });
    setOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    // Convert NONE sentinel back to empty string for API
    const payload = {
      ...form,
      serviceId: form.serviceId === NONE ? "" : form.serviceId,
    };
    try {
      if (editing) {
        await categoriesApi.update(editing._id, payload);
        toast.success("Category updated");
      } else {
        await categoriesApi.create(payload);
        toast.success("Category created");
      }
      setOpen(false);
      loadCategories();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c) => {
    if (!confirm(`Delete category "${c.name}"?`)) return;
    try {
      await categoriesApi.remove(c._id);
      toast.success("Category deleted");
      loadCategories();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl">Categories</h1>
          <p className="text-sm text-muted-foreground">Organize your collections by occasion.</p>
        </div>
        <Button onClick={openCreate} className="rounded-full">
          <Plus className="h-4 w-4 mr-1.5" /> Add Category
        </Button>
      </div>

      <div className="rounded-2xl bg-card gold-border luxe-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60">
              <tr>
                <Th>Name</Th>
                <Th>Service</Th>
                <Th>Slug</Th>
                <Th>Status</Th>
                <Th className="text-right pr-4">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    No categories yet.
                  </td>
                </tr>
              )}
              {items.map((c) => (
                <tr key={c._id} className="border-t hover:bg-accent/30 transition">
                  <Td className="font-medium">{c.name}</Td>
                  <Td className="text-muted-foreground text-xs">
                    {c.serviceId?.name || "—"}
                  </Td>
                  <Td className="text-muted-foreground font-mono text-xs">{c.slug}</Td>
                  <Td>
                    {c.isActive ? (
                      <span className="inline-flex items-center gap-1 text-xs text-primary">
                        <Check className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <X className="h-3 w-3" /> Inactive
                      </span>
                    )}
                  </Td>
                  <Td className="text-right pr-4">
                    <div className="inline-flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(c)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => remove(c)}
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

      {/* Create / Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Category" : "New Category"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4 mt-2">
            <div>
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Service</Label>
              <Select
                value={form.serviceId || NONE}
                onValueChange={(v) => setForm({ ...form, serviceId: v })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select service (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>No service</SelectItem>
                  {services.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="mt-1.5"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="cat-active">Active</Label>
              <Switch
                id="cat-active"
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: !!v })}
              />
            </div>
            <Button type="submit" disabled={saving} className="w-full rounded-full">
              {saving ? "Saving…" : editing ? "Save Changes" : "Create Category"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
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

