import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BlogTextEditor from "@/components/BlogTextEditor";
import { blogsApi, extractBlogs } from "@/services/api";

const CATEGORIES = [
  "General",
  "Invitations",
  "Wedding Tips",
  "Event Design",
  "Stationery",
  "Custom Gifts",
  "Monograms",
];

const INITIAL_FORM = {
  title: "",
  slug: "",
  category: "General",
  author: "Creative Gift Art",
  excerpt: "",
  content: "",
  status: "draft",
};

export default function AdminBlogForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      blogsApi
        .listAdmin()
        .then((res) => {
          const list = extractBlogs(res);
          const found = list.find((b) => b._id === id);
          if (found) {
            setForm({
              title: found.title || "",
              slug: found.slug || "",
              category: found.category || "General",
              author: found.author || "Creative Gift Art",
              excerpt: found.excerpt || "",
              content: found.content || "",
              status: found.status || "draft",
            });
          } else {
            toast.error("Blog post not found");
            navigate("/om-admin/blogs");
          }
        })
        .catch((err) => {
          console.error("Error loading blog details:", err);
          toast.error("Failed to load blog post");
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  const handleSubmit = async (e, targetStatus) => {
    if (e) e.preventDefault();

    if (!form.title.trim()) {
      toast.error("Blog title is required");
      return;
    }
    if (!form.content.trim()) {
      toast.error("Blog content is required");
      return;
    }

    setSaving(true);

    const payload = {
      ...form,
      status: targetStatus || form.status,
    };

    try {
      if (isEditing) {
        await blogsApi.update(id, payload);
        toast.success(
          payload.status === "published"
            ? "Blog updated & published!"
            : "Blog updated as draft"
        );
      } else {
        await blogsApi.create(payload);
        toast.success(
          payload.status === "published"
            ? "Blog created & published!"
            : "Blog created as draft"
        );
      }
      navigate("/om-admin/blogs");
    } catch (err) {
      console.error("Failed to save blog:", err);
      toast.error(err?.response?.data?.message || "Failed to save blog post");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading blog editor…
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top navigation & action header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/om-admin/blogs")}
          className="rounded-full"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Blogs
        </Button>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={(e) => handleSubmit(e, "draft")}
            className="rounded-full"
          >
            <Save className="h-4 w-4 mr-1.5" /> Save as Draft
          </Button>
          <Button
            type="button"
            disabled={saving}
            onClick={(e) => handleSubmit(e, "published")}
            className="rounded-full"
          >
            <Send className="h-4 w-4 mr-1.5" /> Publish Blog
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 sm:p-8 gold-border luxe-shadow space-y-6">
        <h1 className="font-serif text-2xl">
          {isEditing ? "Edit Blog Post" : "Create New Blog Post"}
        </h1>

        <form onSubmit={(e) => handleSubmit(e, form.status)} className="space-y-6">
          {/* Title & Slug */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label>Blog Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. 5 Trends in Luxury Digital Invitations for 2026"
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>URL Slug (optional - auto generated)</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="e.g. 5-trends-luxury-digital-invitations"
                className="mt-1.5 font-mono text-xs"
              />
            </div>

            <div>
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(val) => setForm({ ...form, category: val })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Author & Excerpt */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Author</Label>
              <Input
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                placeholder="Creative Gift Art"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(val) => setForm({ ...form, status: val })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <Label>Short Excerpt (Summary for blog cards & meta description)</Label>
            <Textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="Brief preview sentence summarizing the article..."
              rows={2}
              className="mt-1.5"
            />
          </div>

          {/* Content (Rich Text Editor) */}
          <div>
            <Label className="mb-1.5 block">Blog Content *</Label>
            <BlogTextEditor
              value={form.content}
              onChange={(newContent) => setForm({ ...form, content: newContent })}
            />
          </div>

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/om-admin/blogs")}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={saving}
              onClick={(e) => handleSubmit(e, "draft")}
              className="rounded-full"
            >
              Save as Draft
            </Button>
            <Button
              type="button"
              disabled={saving}
              onClick={(e) => handleSubmit(e, "published")}
              className="rounded-full"
            >
              {saving ? "Saving…" : isEditing ? "Update & Publish" : "Publish Blog"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
