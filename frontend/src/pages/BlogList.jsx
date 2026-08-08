import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, User, ArrowRight, Tag, BookOpen } from "lucide-react";
import { blogsApi, extractBlogs } from "@/services/api";

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // SEO setup
    document.title = "Journal & Insights | Creative Gift Art";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        "Read articles on luxury invitations, event design inspiration, wedding stationery trends, and celebrations by Creative Gift Art."
      );
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    blogsApi
      .listPublished()
      .then((res) => {
        setBlogs(extractBlogs(res));
        setError(null);
      })
      .catch((err) => {
        console.error("Error loading blogs:", err);
        setError("Failed to load blog posts. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden section-pad">
        <div className="absolute inset-0 bg-gradient-to-b from-champagne/60 via-background to-background -z-10" />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-[11px] tracking-[0.3em] uppercase text-primary mb-4 inline-flex items-center gap-2">
              <span className="h-px w-6 bg-primary/60" />
              Journal & Insights
              <span className="h-px w-6 bg-primary/60" />
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-foreground leading-tight">
              Stories & <span className="italic gold-gradient-text font-display">Inspirations</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Explore our curated articles on luxury digital invitations, wedding trends, celebration etiquette, and bespoke design art.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Blog Grid Section ── */}
      <section className="section-pad pt-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl p-6 bg-card border border-border/60 animate-pulse space-y-4"
                >
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-6 w-3/4 bg-muted rounded" />
                  <div className="h-16 w-full bg-muted rounded" />
                  <div className="h-4 w-1/2 bg-muted rounded" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-16">
              <p className="text-destructive font-medium">{error}</p>
            </div>
          )}

          {!loading && !error && blogs.length === 0 && (
            <div className="text-center py-20 bg-card/50 rounded-3xl gold-border max-w-xl mx-auto p-8">
              <BookOpen className="h-12 w-12 mx-auto text-primary/60 mb-4" />
              <h2 className="font-serif text-2xl text-foreground">No Blog Posts Yet</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                We're crafting new stories for you. Check back soon for insightful articles and design guides!
              </p>
            </div>
          )}

          {!loading && !error && blogs.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog, index) => (
                <motion.article
                  key={blog._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="group flex flex-col justify-between bg-card rounded-2xl p-6 sm:p-8 gold-border luxe-shadow hover:-translate-y-1.5 transition-all duration-300"
                >
                  <div>
                    {/* Category & Date */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-champagne/80 text-primary font-medium">
                        <Tag className="h-3 w-3" />
                        {blog.category || "General"}
                      </span>
                      {blog.publishedAt && (
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(blog.publishedAt)}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="font-serif text-xl sm:text-2xl text-foreground group-hover:text-primary transition-colors leading-snug mb-3">
                      <Link to={`/blog/${blog.slug}`}>{blog.title}</Link>
                    </h2>

                    {/* Excerpt */}
                    {blog.excerpt && (
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-6">
                        {blog.excerpt}
                      </p>
                    )}
                  </div>

                  {/* Footer metadata & Read More button */}
                  <div className="pt-4 border-t border-border/60 flex items-center justify-between mt-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <User className="h-3.5 w-3.5 text-primary/70" />
                      {blog.author || "Creative Gift Art"}
                    </span>

                    <Link
                      to={`/blog/${blog.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition"
                    >
                      Read More
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
}
