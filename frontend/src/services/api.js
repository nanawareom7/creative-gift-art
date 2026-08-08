import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const UPLOADS_BASE =
  import.meta.env.VITE_UPLOADS_URL || API_URL.replace(/\/api\/?$/, "");

// Helper: check if a string looks like a MongoDB ObjectId (24 hex chars)
const isObjectId = (str) => /^[0-9a-fA-F]{24}$/.test(str);

export const api = axios.create({
  baseURL: API_URL,
  timeout: 20000, // 20s — handles Atlas cold-start (was 12s)
  headers: { "Content-Type": "application/json" },
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cga_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Clear token ONLY on explicit 401 from the server.
// Do NOT clear on timeouts or network errors (ECONNABORTED, ERR_NETWORK)
// — those are transient and should not log the admin out.
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const isServerAuth =
      err?.response?.status === 401 &&
      !err?.code?.includes("TIMEOUT") &&
      err?.code !== "ERR_NETWORK" &&
      err?.code !== "ECONNABORTED";

    if (isServerAuth) {
      localStorage.removeItem("cga_token");
    }
    return Promise.reject(err);
  }
);

/**
 * Convert a backend `/uploads/...` relative path to an absolute URL.
 * Pass-through for already-absolute URLs.
 */
export const resolveImage = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${UPLOADS_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Response shape from backend:
//   axios response  →  r
//   r.data          →  { success, message, data: { ... } }
//
// All .then(r => r.data) calls below strip the axios layer,
// giving callers { success, message, data }.
// ─────────────────────────────────────────────────────────────────────────────

/* ── Auth ──────────────────────────────────────────────────────────────────── */
export const authApi = {
  login: (email, password) =>
    api.post("/auth/login", { email, password }).then((r) => r.data),
  profile: () => api.get("/auth/profile").then((r) => r.data),
  logout: () => api.post("/auth/logout").then((r) => r.data),
};

/* ── Services ──────────────────────────────────────────────────────────────── */
export const servicesApi = {
  // Public: only active services (default)
  list: (params = {}) =>
    api.get("/services", { params }).then((r) => r.data),
  // Admin: all services regardless of active status
  listAll: () =>
    api.get("/services", { params: { active: "all" } }).then((r) => r.data),
  get: (idOrSlug) =>
    api.get(`/services/${idOrSlug}`).then((r) => r.data),
  create: (body) =>
    api.post("/services", body).then((r) => r.data),
  update: (id, body) =>
    api.put(`/services/${id}`, body).then((r) => r.data),
  remove: (id) =>
    api.delete(`/services/${id}`).then((r) => r.data),
};

/* ── Categories ────────────────────────────────────────────────────────────── */
export const categoriesApi = {
  list: (params = {}) =>
    api.get("/categories", { params }).then((r) => r.data),
  byService: (serviceIdOrSlug) =>
    api.get(`/categories/service/${serviceIdOrSlug}`).then((r) => r.data),
  get: (idOrSlug) =>
    api.get(`/categories/${idOrSlug}`).then((r) => r.data),
  create: (body) =>
    api.post("/categories", body).then((r) => r.data),
  update: (id, body) =>
    api.put(`/categories/${id}`, body).then((r) => r.data),
  remove: (id) =>
    api.delete(`/categories/${id}`).then((r) => r.data),
};

/* ── Templates ─────────────────────────────────────────────────────────────── */
export const templatesApi = {
  list: (params = {}) =>
    api.get("/templates", { params }).then((r) => r.data),
  featured: (limit = 8) =>
    api.get("/templates/featured", { params: { limit } }).then((r) => r.data),
  search: (q, params = {}) =>
    api.get("/templates/search", { params: { q, ...params } }).then((r) => r.data),
  /**
   * Get a single template.
   * - If `slugOrId` is a MongoDB ObjectId (24 hex chars) → uses the admin
   *   endpoint GET /templates/id/:id (no isActive filter, any status).
   * - Otherwise → uses the public GET /templates/:slug endpoint.
   *
   * This fixes the admin edit page "No template found" bug where an ObjectId
   * was being passed to the slug route which filters by isActive:true.
   */
  get: (slugOrId) => {
    const url = isObjectId(slugOrId)
      ? `/templates/id/${slugOrId}`
      : `/templates/${slugOrId}`;
    return api.get(url).then((r) => r.data);
  },
  create: (body) =>
    api.post("/templates", body).then((r) => r.data),
  update: (id, body) =>
    api.put(`/templates/${id}`, body).then((r) => r.data),
  remove: (id) =>
    api.delete(`/templates/${id}`).then((r) => r.data),
};

/* ── Uploads ───────────────────────────────────────────────────────────────── */
export const uploadsApi = {
  single: (file) => {
    const fd = new FormData();
    fd.append("image", file);
    return api
      .post("/upload/template-image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
  multiple: (files) => {
    const fd = new FormData();
    [...files].forEach((f) => fd.append("images", f));
    return api
      .post("/upload/template-images", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },
};

/* ── Dashboard ─────────────────────────────────────────────────────────────── */
export const dashboardApi = {
  stats: () => api.get("/dashboard/stats").then((r) => r.data),
};

/* ── Blogs ─────────────────────────────────────────────────────────────────── */
export const blogsApi = {
  listPublished: (params = {}) =>
    api.get("/blogs", { params }).then((r) => r.data),
  getBySlug: (slug) =>
    api.get(`/blogs/${slug}`).then((r) => r.data),
  listAdmin: (params = {}) =>
    api.get("/blogs/admin", { params }).then((r) => r.data),
  create: (body) =>
    api.post("/blogs", body).then((r) => r.data),
  update: (id, body) =>
    api.put(`/blogs/${id}`, body).then((r) => r.data),
  remove: (id) =>
    api.delete(`/blogs/${id}`).then((r) => r.data),
  togglePublish: (id, status) =>
    api.put(`/blogs/${id}/publish`, { status }).then((r) => r.data),
};

/* ── WhatsApp ──────────────────────────────────────────────────────────────── */
export const WHATSAPP_NUMBER =
  import.meta.env.VITE_WHATSAPP_NUMBER || "917304807878";

export const buildWhatsAppUrl = (message) => {
  const text = encodeURIComponent(
    message || "Hi! I'm interested in your invitations from Creative Gift Art."
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
};

/* ── Response helpers ──────────────────────────────────────────────────────── */
// Backend wraps lists as:  { success, message, data: { templates/categories/services/blogs, pagination } }
// These helpers extract the array safely regardless of key name.

export const extractTemplates = (res) => {
  const d = res?.data;
  return Array.isArray(d?.templates) ? d.templates
    : Array.isArray(d?.items) ? d.items
      : Array.isArray(d) ? d
        : [];
};

export const extractCategories = (res) => {
  const d = res?.data;
  return Array.isArray(d?.categories) ? d.categories
    : Array.isArray(d?.items) ? d.items
      : Array.isArray(d) ? d
        : [];
};

export const extractServices = (res) => {
  const d = res?.data;
  return Array.isArray(d?.services) ? d.services
    : Array.isArray(d?.items) ? d.items
      : Array.isArray(d) ? d
        : [];
};

export const extractBlogs = (res) => {
  const d = res?.data;
  return Array.isArray(d?.blogs) ? d.blogs
    : Array.isArray(d?.items) ? d.items
      : Array.isArray(d) ? d
        : [];
};

export const extractPagination = (res) => res?.data?.pagination ?? null;
