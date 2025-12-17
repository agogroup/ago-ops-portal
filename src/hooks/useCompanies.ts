import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Company, WorkType } from '../types';

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('id');

      if (error) throw error;

      const mapped: Company[] = (data || []).map((row) => ({
        id: row.id,
        name: row.name,
        type: row.type as WorkType,
      }));

      setCompanies(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  return { companies, loading, error, refetch: fetchCompanies };
}
