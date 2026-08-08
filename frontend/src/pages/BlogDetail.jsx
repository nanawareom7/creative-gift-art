import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, User, Tag, ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { blogsApi } from "@/services/api";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);

    blogsApi
      .getBySlug(slug)
      .then((res) => {
        if (res?.data?.blog) {
          const blogData = res.data.blog;
          setBlog(blogData);

          // Update SEO Title & Meta Description
          document.title = `${blogData.title} | Creative Gift Art Blog`;
          if (blogData.excerpt) {
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
              metaDesc.setAttribute("content", blogData.excerpt);
            }
          }
        } else {
          setNotFound(true);
        }
      })
      .catch((err) => {
        console.error("Error fetching blog details:", err);
        setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl section-pad px-4 sm:px-6 lg:px-8">
        <div className="space-y-6 animate-pulse">
          <div className="h-4 w-28 bg-muted rounded" />
          <div className="h-10 w-3/4 bg-muted rounded" />
          <div className="h-4 w-1/3 bg-muted rounded" />
          <div className="h-64 w-full bg-muted rounded-2xl" />
        </div>
      </div>
    );
  }

  if (notFound || !blog) {
    return (
      <div className="mx-auto max-w-2xl section-pad px-4 text-center">
        <div className="bg-card rounded-3xl p-10 gold-border luxe-shadow">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/60 mb-4" />
          <h1 className="font-serif text-3xl text-foreground">Blog Post Not Found</h1>
          <p className="mt-3 text-muted-foreground text-sm">
            The requested article does not exist or is no longer available.
          </p>
          <Button asChild className="mt-6 rounded-full px-6" variant="outline">
            <Link to="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const cleanContent = sanitizeHtml(blog.content);

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto max-w-4xl section-pad px-4 sm:px-6 lg:px-8"
    >
      {/* Back button */}
      <div className="mb-8">
        <Button asChild variant="ghost" size="sm" className="rounded-full hover:bg-secondary">
          <Link to="/blog" className="text-xs font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Blog
          </Link>
        </Button>
      </div>

      {/* Header section */}
      <header className="mb-10 text-center max-w-3xl mx-auto space-y-4">
        {/* Category Badge */}
        <div>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-champagne text-primary text-xs font-semibold uppercase tracking-wider">
            <Tag className="h-3 w-3" />
            {blog.category || "General"}
          </span>
        </div>

        {/* Blog Title */}
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-foreground leading-tight">
          {blog.title}
        </h1>

        {/* Metadata row */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-muted-foreground pt-2">
          <span className="inline-flex items-center gap-1.5 font-medium text-foreground/80">
            <User className="h-3.5 w-3.5 text-primary" />
            {blog.author || "Creative Gift Art"}
          </span>

          {blog.publishedAt && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary/70" />
              {formatDate(blog.publishedAt)}
            </span>
          )}
        </div>
      </header>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent my-8" />

      {/* Excerpt spotlight (if present) */}
      {blog.excerpt && (
        <div className="bg-secondary/40 border-l-2 border-primary p-5 sm:p-6 rounded-r-2xl mb-10 italic text-base text-foreground/90 leading-relaxed font-serif">
          "{blog.excerpt}"
        </div>
      )}

      {/* Main text content */}
      <div
        className="prose prose-stone dark:prose-invert max-w-none text-foreground/90 leading-relaxed text-base space-y-6 [&>h2]:font-serif [&>h2]:text-2xl [&>h2]:sm:text-3xl [&>h2]:mt-8 [&>h2]:mb-4 [&>h2]:text-foreground [&>h3]:font-serif [&>h3]:text-xl [&>h3]:mt-6 [&>h3]:mb-3 [&>h3]:text-foreground [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-2 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:space-y-2 [&>a]:text-primary [&>a]:underline [&>blockquote]:border-l-2 [&>blockquote]:border-primary [&>blockquote]:pl-4 [&>blockquote]:italic"
        dangerouslySetInnerHTML={{ __html: cleanContent }}
      />

      {/* Bottom Footer Actions */}
      <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <Button asChild variant="outline" className="rounded-full gold-border">
          <Link to="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog List
          </Link>
        </Button>
        <p className="text-xs text-muted-foreground italic">
          Published by {blog.author || "Creative Gift Art"}
        </p>
      </div>
    </motion.article>
  );
}
