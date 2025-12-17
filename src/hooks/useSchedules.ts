import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Schedule, WorkType } from '../types';

export function useSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('date')
        .order('time_start');

      if (error) throw error;

      const mapped: Schedule[] = (data || []).map((row) => ({
        id: row.id,
        companyId: row.company_id,
        siteId: row.site_id,
        date: row.date,
        timeStart: row.time_start.slice(0, 5), // "HH:mm:ss" -> "HH:mm"
        timeEnd: row.time_end.slice(0, 5),
        workType: row.work_type as WorkType,
      }));

      setSchedules(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // スケジュール追加
  const addSchedule = async (schedule: Omit<Schedule, 'id'>): Promise<Schedule | null> => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .insert({
          company_id: schedule.companyId,
          site_id: schedule.siteId,
          date: schedule.date,
          time_start: schedule.timeStart,
          time_end: schedule.timeEnd,
          work_type: schedule.workType,
        })
        .select()
        .single();

      if (error) throw error;

      const newSchedule: Schedule = {
        id: data.id,
        companyId: data.company_id,
        siteId: data.site_id,
        date: data.date,
        timeStart: data.time_start.slice(0, 5),
        timeEnd: data.time_end.slice(0, 5),
        workType: data.work_type as WorkType,
      };

      setSchedules((prev) => [...prev, newSchedule]);
      return newSchedule;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add schedule');
      return null;
    }
  };

  // スケジュール更新
  const updateSchedule = async (schedule: Schedule): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('schedules')
        .update({
          company_id: schedule.companyId,
          site_id: schedule.siteId,
          date: schedule.date,
          time_start: schedule.timeStart,
          time_end: schedule.timeEnd,
          work_type: schedule.workType,
          updated_at: new Date().toISOString(),
        })
        .eq('id', schedule.id);

      if (error) throw error;

      setSchedules((prev) =>
        prev.map((s) => (s.id === schedule.id ? schedule : s))
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update schedule');
      return false;
    }
  };

  // スケジュール削除
  const deleteSchedule = async (id: number): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSchedules((prev) => prev.filter((s) => s.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete schedule');
      return false;
    }
  };

  return {
    schedules,
    loading,
    error,
    refetch: fetchSchedules,
    addSchedule,
    updateSchedule,
    deleteSchedule,
  };
}
