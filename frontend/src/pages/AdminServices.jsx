import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, X, Check, Globe } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { servicesApi, extractServices } from "@/services/api";

const EMPTY_FORM = { name: "", description: "", isActive: true };

export default function AdminServices() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    servicesApi
      .list({ active: false }) // false = include all (active + inactive)
      .then((res) => setItems(extractServices(res)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      name: s.name || "",
      description: s.description || "",
      isActive: s.isActive ?? true,
    });
    setOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await servicesApi.update(editing._id, form);
        toast.success("Service updated");
      } else {
        await servicesApi.create(form);
        toast.success("Service created");
      }
      setOpen(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (s) => {
    if (!confirm(`Delete service "${s.name}"? This cannot be undone.`)) return;
    try {
      await servicesApi.remove(s._id);
      toast.success("Service deleted");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl">Services</h1>
          <p className="text-sm text-muted-foreground">
            Manage the top-level service categories (Digital Invitations, Gifts, etc.)
          </p>
        </div>
        <Button onClick={openCreate} className="rounded-full">
          <Plus className="h-4 w-4 mr-1.5" /> Add Service
        </Button>
      </div>

      <div className="rounded-2xl bg-card gold-border luxe-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60">
              <tr>
                <Th>Name</Th>
                <Th>Slug</Th>
                <Th>Description</Th>
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
                    No services yet. Click "Add Service" to create one.
                  </td>
                </tr>
              )}
              {items.map((s) => (
                <tr key={s._id} className="border-t hover:bg-accent/30 transition">
                  <Td className="font-medium">
                    <span className="flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
                      {s.name}
                    </span>
                  </Td>
                  <Td className="text-muted-foreground font-mono text-xs">{s.slug}</Td>
                  <Td className="text-muted-foreground text-xs max-w-[200px] truncate">
                    {s.description || "—"}
                  </Td>
                  <Td>
                    {s.isActive ? (
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
                      <Button size="sm" variant="outline" onClick={() => openEdit(s)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => remove(s)}
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
            <DialogTitle>{editing ? "Edit Service" : "New Service"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4 mt-2">
            <div>
              <Label>Service Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="e.g. Digital Invitations"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Short description shown on the service page"
                className="mt-1.5"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="svc-active">Active</Label>
              <Switch
                id="svc-active"
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: !!v })}
              />
            </div>
            <Button type="submit" disabled={saving} className="w-full rounded-full">
              {saving ? "Saving…" : editing ? "Save Changes" : "Create Service"}
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
