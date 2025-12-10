export type ViewMode = 'day' | 'week';

interface DatePickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function DatePicker({
  selectedDate,
  onDateChange,
  viewMode,
  onViewModeChange,
}: DatePickerProps) {
  // 日付を前後に移動
  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    onDateChange(date.toISOString().split('T')[0]);
  };

  // 週を前後に移動
  const changeWeek = (weeks: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + weeks * 7);
    onDateChange(date.toISOString().split('T')[0]);
  };

  // 日付をフォーマット
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = weekdays[date.getDay()];
    return `${month}月${day}日（${weekday}）`;
  };

  // 週の範囲をフォーマット
  const formatWeekRange = (dateStr: string) => {
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    const monday = new Date(date);
    monday.setDate(date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const formatShort = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
    return `${formatShort(monday)} - ${formatShort(sunday)}`;
  };

  // 今日かどうか判定
  const today = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === today;

  // 今週かどうか判定
  const isThisWeek = (() => {
    const now = new Date();
    const selected = new Date(selectedDate);
    const getWeekStart = (d: Date) => {
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(d.setDate(diff)).toISOString().split('T')[0];
    };
    return getWeekStart(now) === getWeekStart(selected);
  })();

  return (
    <div className="bg-white border-b border-gray-200">
      {/* 表示切替タブ */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => onViewModeChange('day')}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            viewMode === 'day'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          日別
        </button>
        <button
          onClick={() => onViewModeChange('week')}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            viewMode === 'week'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          週間
        </button>
      </div>

      {/* 日付ナビゲーション */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* 前へボタン */}
        <button
          onClick={() => (viewMode === 'day' ? changeDate(-1) : changeWeek(-1))}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label={viewMode === 'day' ? '前日' : '前週'}
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* 日付表示 */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'date';
              input.value = selectedDate;
              input.onchange = (e) => {
                const target = e.target as HTMLInputElement;
                if (target.value) {
                  onDateChange(target.value);
                }
              };
              input.click();
            }}
            className="text-lg font-medium text-gray-800 hover:text-blue-600 transition-colors"
          >
            {viewMode === 'day' ? formatDate(selectedDate) : formatWeekRange(selectedDate)}
          </button>
          {viewMode === 'day' && isToday && (
            <span className="px-2 py-0.5 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
              今日
            </span>
          )}
          {viewMode === 'week' && isThisWeek && (
            <span className="px-2 py-0.5 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
              今週
            </span>
          )}
        </div>

        {/* 次へボタン */}
        <button
          onClick={() => (viewMode === 'day' ? changeDate(1) : changeWeek(1))}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label={viewMode === 'day' ? '翌日' : '翌週'}
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
