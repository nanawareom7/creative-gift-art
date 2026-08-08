import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pencil, Trash2, Plus, Check, Eye, Clock, Search, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { blogsApi, extractBlogs } from "@/services/api";

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const loadBlogs = () => {
    setLoading(true);
    const params = {};
    if (statusFilter !== "all") params.status = statusFilter;
    if (search.trim()) params.search = search.trim();

    blogsApi
      .listAdmin(params)
      .then((res) => setBlogs(extractBlogs(res)))
      .catch((err) => {
        console.error("Failed to load admin blogs:", err);
        setBlogs([]);
        toast.error("Failed to load blogs");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBlogs();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadBlogs();
  };

  const handleTogglePublish = async (blog) => {
    const newStatus = blog.status === "published" ? "draft" : "published";
    try {
      await blogsApi.togglePublish(blog._id, newStatus);
      toast.success(
        `Blog ${newStatus === "published" ? "published" : "saved as draft"}`
      );
      loadBlogs();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update blog status");
    }
  };

  const handleDelete = async (blog) => {
    if (!confirm(`Are you sure you want to delete "${blog.title}"?`)) return;
    try {
      await blogsApi.remove(blog._id);
      toast.success("Blog post deleted");
      loadBlogs();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete blog");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-3xl">Blog Posts</h1>
          <p className="text-sm text-muted-foreground">
            Manage text articles, guides, and journal posts.
          </p>
        </div>
        <Button
          onClick={() => navigate("/om-admin/blogs/new")}
          className="rounded-full shrink-0"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Create Blog Post
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <Button
            size="sm"
            variant={statusFilter === "all" ? "default" : "outline"}
            onClick={() => setStatusFilter("all")}
            className="rounded-full text-xs"
          >
            All Blogs
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "published" ? "default" : "outline"}
            onClick={() => setStatusFilter("published")}
            className="rounded-full text-xs"
          >
            Published
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "draft" ? "default" : "outline"}
            onClick={() => setStatusFilter("draft")}
            className="rounded-full text-xs"
          >
            Drafts
          </Button>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search blogs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 h-9 text-xs"
          />
          <Button type="submit" size="sm" variant="secondary" className="h-9">
            <Search className="h-3.5 w-3.5" />
          </Button>
        </form>
      </div>

      {/* Blog Posts Table */}
      <div className="rounded-2xl bg-card gold-border luxe-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60">
              <tr>
                <Th>Title</Th>
                <Th>Category</Th>
                <Th>Author</Th>
                <Th>Status</Th>
                <Th>Published Date</Th>
                <Th>Created Date</Th>
                <Th className="text-right pr-4">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    Loading blogs…
                  </td>
                </tr>
              )}
              {!loading && blogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No blog posts found.
                  </td>
                </tr>
              )}
              {!loading &&
                blogs.map((b) => (
                  <tr key={b._id} className="border-t hover:bg-accent/30 transition">
                    <Td className="font-medium max-w-xs truncate">
                      <div className="font-medium text-foreground">{b.title}</div>
                      <div className="text-[11px] font-mono text-muted-foreground truncate">
                        /blog/{b.slug}
                      </div>
                    </Td>
                    <Td className="text-xs text-muted-foreground">
                      <span className="inline-block px-2 py-0.5 rounded bg-secondary text-foreground/80 font-medium">
                        {b.category || "General"}
                      </span>
                    </Td>
                    <Td className="text-xs text-muted-foreground">{b.author || "Creative Gift Art"}</Td>
                    <Td>
                      {b.status === "published" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          <Check className="h-3 w-3" /> Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          <Clock className="h-3 w-3" /> Draft
                        </span>
                      )}
                    </Td>
                    <Td className="text-xs text-muted-foreground">
                      {formatDate(b.publishedAt)}
                    </Td>
                    <Td className="text-xs text-muted-foreground">
                      {formatDate(b.createdAt)}
                    </Td>
                    <Td className="text-right pr-4">
                      <div className="inline-flex gap-1.5">
                        {/* View live public blog if published */}
                        {b.status === "published" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            asChild
                            title="View Public Post"
                          >
                            <Link to={`/blog/${b.slug}`} target="_blank">
                              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                            </Link>
                          </Button>
                        )}

                        {/* Publish / Unpublish Toggle */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTogglePublish(b)}
                          title={b.status === "published" ? "Unpublish (Move to Draft)" : "Publish Blog"}
                          className="h-8 text-xs px-2.5"
                        >
                          {b.status === "published" ? "Unpublish" : "Publish"}
                        </Button>

                        {/* Edit */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/om-admin/blogs/${b._id}/edit`)}
                          title="Edit Blog"
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>

                        {/* Delete */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(b)}
                          title="Delete Blog"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
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
