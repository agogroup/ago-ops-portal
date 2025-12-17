import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Site } from '../types';

export function useSites() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .order('id');

      if (error) throw error;

      const mapped: Site[] = (data || []).map((row) => ({
        id: row.id,
        name: row.name,
        address: row.address || '',
      }));

      setSites(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sites');
    } finally {
      setLoading(false);
    }
  };

  return { sites, loading, error, refetch: fetchSites };
}
