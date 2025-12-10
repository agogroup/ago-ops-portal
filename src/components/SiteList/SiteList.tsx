import { useState } from 'react';
import type { Site, Schedule, WorkTypeMap } from '../../types';

interface SiteListProps {
  sites: Site[];
  schedules: Schedule[];
  workTypes: WorkTypeMap;
  onSiteSelect?: (site: Site) => void;
}

export function SiteList({
  sites,
  schedules,
  workTypes,
  onSiteSelect,
}: SiteListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // 検索でフィルタ
  const filteredSites = sites.filter(
    (site) =>
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 各現場の今日のスケジュール数を取得
  const today = new Date().toISOString().split('T')[0];
  const getTodayScheduleCount = (siteId: number) => {
    return schedules.filter((s) => s.siteId === siteId && s.date === today).length;
  };

  // 各現場の直近のスケジュールを取得
  const getNextSchedule = (siteId: number) => {
    const futureSchedules = schedules
      .filter((s) => s.siteId === siteId && s.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date) || a.timeStart.localeCompare(b.timeStart));
    return futureSchedules[0];
  };

  return (
    <div className="space-y-4">
      {/* 検索バー */}
      <div className="relative">
        <input
          type="text"
          placeholder="現場名・住所で検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <svg
          className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* 現場リスト */}
      <div className="space-y-2">
        {filteredSites.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            該当する現場が見つかりません
          </div>
        ) : (
          filteredSites.map((site) => {
            const todayCount = getTodayScheduleCount(site.id);
            const nextSchedule = getNextSchedule(site.id);
            const nextWorkType = nextSchedule ? workTypes[nextSchedule.workType] : null;

            return (
              <button
                key={site.id}
                onClick={() => onSiteSelect?.(site)}
                className="w-full bg-white rounded-lg shadow p-4 text-left hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{site.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{site.address}</p>
                    {nextSchedule && (
                      <div className="flex items-center mt-2 space-x-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: nextWorkType?.color }}
                        />
                        <span className="text-xs text-gray-600">
                          次回: {nextSchedule.date} {nextSchedule.timeStart}〜
                        </span>
                      </div>
                    )}
                  </div>
                  {todayCount > 0 && (
                    <span className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                      本日 {todayCount}件
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* 件数表示 */}
      <div className="text-center text-sm text-gray-500">
        {filteredSites.length} 件の現場
      </div>
    </div>
  );
}
