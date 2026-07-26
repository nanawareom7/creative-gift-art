import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Upload, X } from "lucide-react";
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
import { templatesApi, uploadsApi, resolveImage } from "@/services/api";
import { useCategories } from "@/hooks/useCategories";
import { useServices } from "@/hooks/useServices";
import ErrorBoundary from "@/components/ErrorBoundary";

// Sentinel value used for "no selection" — Radix Select crashes with empty string
const NONE = "__none__";

const EMPTY = {
  title: "",
  description: "",
  serviceId: NONE,
  categoryId: NONE,
  type: "static",
  thumbnail: "",
  images: [],
  youtubeLink: "",
  featured: false,
  tags: [],
};

function AdminTemplateFormInner() {
  const { id } = useParams();
  const navigate = useNavigate();
  // 'all' = fetch every category/service regardless of active status (admin needs to see everything)
  const { data: allCats = [], loading: catsLoading } = useCategories("all");
  const { data: services = [], loading: svcLoading } = useServices("all");
  const [form, setForm] = useState(EMPTY);
  const [tagsInput, setTagsInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(!id); // true immediately for new templates

  // Filter categories by selected service
  const filteredCats =
    form.serviceId && form.serviceId !== NONE
      ? allCats.filter(
        (c) =>
          c.serviceId?._id === form.serviceId ||
          c.serviceId === form.serviceId
      )
      : allCats;

  // Load existing template for edit mode
  useEffect(() => {
    if (!id) return;
    templatesApi
      .get(id)
      .then((res) => {
        const t = res?.data?.template || res?.data;
        if (!t) return;
        setForm({
          title: t.title || "",
          description: t.description || "",
          serviceId: t.serviceId?._id || t.serviceId || NONE,
          categoryId: t.categoryId?._id || t.categoryId || NONE,
          type: t.type || "static",
          thumbnail: t.thumbnail || "",
          images: t.images || [],
          youtubeLink: t.youtubeLink || "",
          featured: !!t.featured,
          tags: t.tags || [],
        });
        setTagsInput((t.tags || []).join(", "));
        setDataLoaded(true);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Failed to load template");
        setDataLoaded(true);
      });
  }, [id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const uploadThumb = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadsApi.single(file);
      set("thumbnail", res?.data?.imageUrl || "");
      toast.success("Thumbnail uploaded");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const uploadGallery = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const res = await uploadsApi.multiple(files);
      const urls = res?.data?.images || [];
      set("images", [...form.images, ...urls]);
      toast.success(`${urls.length} image(s) uploaded`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    // Convert NONE sentinels back to empty strings for API
    const realCategoryId = form.categoryId === NONE ? "" : form.categoryId;
    if (!form.title || !realCategoryId || !form.thumbnail) {
      toast.error("Title, category and thumbnail are required");
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      serviceId: form.serviceId === NONE ? "" : form.serviceId,
      categoryId: realCategoryId,
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    try {
      if (id) await templatesApi.update(id, payload);
      else await templatesApi.create(payload);
      toast.success(id ? "Template updated" : "Template created");
      navigate("/om-admin/templates");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const isLoading = (id && !dataLoaded) || catsLoading || svcLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/om-admin/templates"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to templates
      </Link>
      <h1 className="font-serif text-3xl mb-6">{id ? "Edit Template" : "New Template"}</h1>

      <form onSubmit={submit} className="grid lg:grid-cols-3 gap-6 max-w-6xl">
        {/* ── Left / Main ── */}
        <div className="lg:col-span-2 space-y-5 bg-card p-6 rounded-2xl gold-border luxe-shadow">
          <Field label="Title *">
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} required />
          </Field>
          <Field label="Description">
            <Textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
            />
          </Field>

          {/* Service + Category row */}
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Service (optional)">
              <Select
                value={form.serviceId || NONE}
                onValueChange={(v) => {
                  set("serviceId", v);
                  set("categoryId", NONE); // reset when service changes
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>All services</SelectItem>
                  {services.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Category *">
              <Select
                value={form.categoryId || NONE}
                onValueChange={(v) => set("categoryId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Select category</SelectItem>
                  {filteredCats.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          {/* Type */}
          <Field label="Type">
            <Select value={form.type} onValueChange={(v) => set("type", v)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="static">Static (image)</SelectItem>
                <SelectItem value="video">Video (YouTube)</SelectItem>
                <SelectItem value="website">Website</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {/* YouTube URL — only for video / website */}
          {(form.type === "video" || form.type === "website") && (
            <Field label="YouTube URL">
              <Input
                value={form.youtubeLink}
                onChange={(e) => set("youtubeLink", e.target.value)}
                placeholder="https://youtube.com/shorts/…"
              />
            </Field>
          )}

          <Field label="Tags (comma separated)">
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="royal, luxury, traditional"
            />
          </Field>

          {/* Featured toggle */}
          <div className="flex items-center justify-between rounded-xl border p-4">
            <div>
              <div className="font-medium text-sm">Featured / Trending</div>
              <div className="text-xs text-muted-foreground">
                Show on the home trending section.
              </div>
            </div>
            <Switch
              checked={form.featured}
              onCheckedChange={(v) => set("featured", !!v)}
            />
          </div>
        </div>

        {/* ── Right / Media ── */}
        <div className="space-y-5">
          {/* Thumbnail */}
          <div className="bg-card p-6 rounded-2xl gold-border luxe-shadow">
            <Label className="block mb-3">Thumbnail *</Label>
            {form.thumbnail ? (
              <div className="relative">
                <img
                  src={resolveImage(form.thumbnail)}
                  alt=""
                  className="w-full aspect-[3/4] object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => set("thumbnail", "")}
                  className="absolute top-2 right-2 bg-background/90 rounded-full p-1 hover:bg-background"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <label className="grid place-items-center aspect-[3/4] rounded-lg border-2 border-dashed cursor-pointer hover:border-primary transition">
                <div className="text-center text-muted-foreground text-sm">
                  <Upload className="h-5 w-5 mx-auto mb-2" />
                  {uploading ? "Uploading…" : "Click to upload"}
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={uploadThumb}
                  disabled={uploading}
                />
              </label>
            )}
          </div>

          {/* Gallery */}
          <div className="bg-card p-6 rounded-2xl gold-border luxe-shadow">
            <Label className="block mb-3">Gallery (up to 10)</Label>
            <div className="grid grid-cols-3 gap-2">
              {form.images.map((src, i) => (
                <div key={i} className="relative">
                  <img
                    src={resolveImage(src)}
                    alt=""
                    className="aspect-square object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      set(
                        "images",
                        form.images.filter((_, idx) => idx !== i)
                      )
                    }
                    className="absolute top-1 right-1 bg-background/90 rounded-full p-0.5 hover:bg-background"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {form.images.length < 10 && (
                <label className="aspect-square grid place-items-center rounded-md border-2 border-dashed cursor-pointer hover:border-primary transition">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={uploadGallery}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={saving || uploading}
            className="w-full rounded-full h-11"
          >
            {saving ? "Saving…" : id ? "Update Template" : "Create Template"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function AdminTemplateForm() {
  return (
    <ErrorBoundary>
      <AdminTemplateFormInner />
    </ErrorBoundary>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}
