import { useEffect, useState, useCallback } from "react";
import { categoriesApi, extractCategories } from "@/services/api";

/**
 * Fetch categories.
 * @param {boolean|'all'} activeOnly
 *   true    → only active categories (public, default)
 *   false   → no active filter sent (backend now defaults to active=true)
 *   'all'   → all categories regardless of status (admin use: active=all)
 */
export function useCategories(activeOnly = true) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);

    let params = {};
    if (activeOnly === "all") {
      params = { active: "all" };
    } else if (activeOnly === true) {
      params = { active: "true" };
    }
    // false → send no active param (backend defaults to active-only, acceptable)

    categoriesApi
      .list(params)
      .then((res) => setData(extractCategories(res)))
      .catch((e) => setError(e?.response?.data?.message || e.message))
      .finally(() => setLoading(false));
  }, [activeOnly]);

  useEffect(refetch, [refetch]);

  return { data, loading, error, refetch };
}
