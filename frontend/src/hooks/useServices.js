import { useEffect, useState, useCallback } from "react";
import { servicesApi, extractServices } from "@/services/api";

/**
 * Fetch services.
 * @param {boolean|'all'} activeOnly
 *   true    → only active services (public, default)
 *   false   → all active services (no filter sent = backend defaults active)
 *   'all'   → all services regardless of status (admin use)
 */
export function useServices(activeOnly = true) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);

    const fetchPromise =
      activeOnly === "all"
        ? servicesApi.listAll()
        : servicesApi.list(activeOnly ? { active: "true" } : {});

    fetchPromise
      .then((res) => setData(extractServices(res)))
      .catch((e) => setError(e?.response?.data?.message || e.message))
      .finally(() => setLoading(false));
  }, [activeOnly]);

  useEffect(refetch, [refetch]);

  return { data, loading, error, refetch };
}
