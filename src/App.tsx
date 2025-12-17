import { useState } from 'react';
import { TimeChart, WeekChart } from './components/TimeChart';
import { BottomNav } from './components/Navigation';
import { DatePicker } from './components/common';
import { ScheduleForm } from './components/ScheduleForm';
import { SiteList } from './components/SiteList';
import { ContactList } from './components/ContactList';
import type { ViewMode } from './components/common';
import { useCompanies, useSites, useSchedules } from './hooks';
import { workTypes } from './data/sampleData';
import type { Schedule, Site } from './types';

function App() {
  const [activeTab, setActiveTab] = useState('timechart');
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('day');

  // Supabaseからデータ取得
  const { companies, loading: companiesLoading } = useCompanies();
  const { sites, loading: sitesLoading } = useSites();
  const { schedules, loading: schedulesLoading, addSchedule, updateSchedule } = useSchedules();

  const loading = companiesLoading || sitesLoading || schedulesLoading;

  const handleScheduleTap = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
  };

  // スケジュール更新ハンドラ（ドラッグ&ドロップ時）
  const handleScheduleUpdate = async (updatedSchedule: Schedule) => {
    await updateSchedule(updatedSchedule);
  };

  // スケジュール追加ハンドラ
  const handleAddSchedule = async (newSchedule: Omit<Schedule, 'id'>) => {
    const added = await addSchedule(newSchedule);
    if (added) {
      setSelectedDate(newSchedule.date);
      setActiveTab('timechart');
    }
  };

  // 現場選択ハンドラ
  const handleSiteSelect = (site: Site) => {
    const today = new Date().toISOString().split('T')[0];
    const nextSchedule = schedules
      .filter((s) => s.siteId === site.id && s.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))[0];

    if (nextSchedule) {
      setSelectedDate(nextSchedule.date);
    }
    setActiveTab('timechart');
  };

  const closeModal = () => {
    setSelectedSchedule(null);
  };

  // スケジュール詳細取得用ヘルパー
  const getScheduleDetails = (schedule: Schedule) => {
    const company = companies.find((c) => c.id === schedule.companyId);
    const site = sites.find((s) => s.id === schedule.siteId);
    const workType = workTypes[schedule.workType];
    return { company, site, workType };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* ヘッダー */}
      <header className="bg-blue-600 text-white px-4 py-3 shadow-md">
        <h1 className="text-lg font-bold">AGO Ops Portal</h1>
      </header>

      {/* メインコンテンツ */}
      <main className="p-4">
        {activeTab === 'timechart' && (
          <>
            <DatePicker
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
            <div className="mt-4">
              {viewMode === 'day' ? (
                <TimeChart
                  companies={companies}
                  schedules={schedules}
                  sites={sites}
                  workTypes={workTypes}
                  selectedDate={selectedDate}
                  onScheduleTap={handleScheduleTap}
                  onScheduleUpdate={handleScheduleUpdate}
                />
              ) : (
                <WeekChart
                  companies={companies}
                  schedules={schedules}
                  sites={sites}
                  workTypes={workTypes}
                  selectedDate={selectedDate}
                  onScheduleTap={handleScheduleTap}
                  onScheduleUpdate={handleScheduleUpdate}
                />
              )}
            </div>
            {/* 凡例 */}
            <div className="mt-4 bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">凡例</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(workTypes).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-1">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: value.color }}
                    />
                    <span className="text-xs text-gray-600">{value.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'sites' && (
          <div>
            <h2 className="text-lg font-bold mb-4">現場一覧</h2>
            <SiteList
              sites={sites}
              schedules={schedules}
              workTypes={workTypes}
              onSiteSelect={handleSiteSelect}
            />
          </div>
        )}

        {activeTab === 'add' && (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-bold mb-4">スケジュール追加</h2>
            <ScheduleForm
              companies={companies}
              sites={sites}
              workTypes={workTypes}
              onSubmit={handleAddSchedule}
              initialDate={selectedDate}
            />
          </div>
        )}

        {activeTab === 'contacts' && (
          <div>
            <h2 className="text-lg font-bold mb-4">連絡先</h2>
            <ContactList companies={companies} workTypes={workTypes} />
          </div>
        )}
      </main>

      {/* スケジュール詳細モーダル */}
      {selectedSchedule && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white w-full max-w-lg rounded-t-2xl p-6 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const { company, site, workType } = getScheduleDetails(selectedSchedule);
              return (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold">{site?.name || '不明'}</h2>
                    <button
                      onClick={closeModal}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: workType.color }}
                      />
                      <span className="text-sm text-gray-600">{workType.label}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">担当：</span>
                      <span className="text-gray-800">{company?.name || '不明'}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">日付：</span>
                      <span className="text-gray-800">{selectedSchedule.date}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">時間：</span>
                      <span className="text-gray-800">
                        {selectedSchedule.timeStart} - {selectedSchedule.timeEnd}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">住所：</span>
                      <span className="text-gray-800">{site?.address || '不明'}</span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* 下部ナビゲーション */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
