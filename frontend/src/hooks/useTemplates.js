import { useEffect, useState, useCallback } from "react";
import { templatesApi, extractTemplates, extractPagination } from "@/services/api";

/**
 * Fetch a paginated / filtered list of templates.
 * Pass any query params supported by GET /api/templates:
 *   page, limit, sort, category, service, featured, type, isActive
 */
export function useTemplates(params = {}) {
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stable cache key so we only re-fetch when params actually change
  const key = JSON.stringify(params);

  const fetchIt = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await templatesApi.list(params);
      setData(extractTemplates(res));
      setMeta(extractPagination(res));
    } catch (e) {
      setError(e?.response?.data?.message || e.message);
      setData([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    fetchIt();
  }, [fetchIt]);

  return { data, meta, loading, error, refetch: fetchIt };
}

/**
 * Fetch featured / trending templates.
 * Uses GET /api/templates/featured
 */
export function useFeaturedTemplates(limit = 8) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);
    templatesApi
      .featured(limit)
      .then((res) => {
        setData(extractTemplates(res));
      })
      .catch((e) => {
        setError(e?.response?.data?.message || e.message);
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [limit]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
