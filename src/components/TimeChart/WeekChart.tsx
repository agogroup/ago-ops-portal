import { useState, useRef, useEffect, useCallback } from 'react';
import type { Company, Schedule, Site, WorkTypeMap } from '../../types';

interface WeekChartProps {
  companies: Company[];
  schedules: Schedule[];
  sites: Site[];
  workTypes: WorkTypeMap;
  selectedDate: string;
  onScheduleTap?: (schedule: Schedule) => void;
  onScheduleUpdate?: (schedule: Schedule) => void;
}

// 週の日付を取得（月曜始まり）
function getWeekDates(dateStr: string): string[] {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

// 曜日ラベル
const weekdayLabels = ['月', '火', '水', '木', '金', '土', '日'];

// ドラッグ可能なスケジュールアイテム
interface DraggableScheduleItemProps {
  schedule: Schedule;
  site: Site | undefined;
  workTypes: WorkTypeMap;
  onTap?: (schedule: Schedule) => void;
  onDragStart?: (schedule: Schedule, e: React.MouseEvent | React.TouchEvent) => void;
  isDragging?: boolean;
}

function DraggableScheduleItem({
  schedule,
  site,
  workTypes,
  onTap,
  onDragStart,
  isDragging,
}: DraggableScheduleItemProps) {
  const workType = workTypes[schedule.workType];
  const hasMoved = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startPos.current = { x: e.clientX, y: e.clientY };
    hasMoved.current = false;

    const handleMouseMove = (moveE: MouseEvent) => {
      const dx = Math.abs(moveE.clientX - startPos.current.x);
      const dy = Math.abs(moveE.clientY - startPos.current.y);
      if (dx > 5 || dy > 5) {
        hasMoved.current = true;
        onDragStart?.(schedule, e);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      if (!hasMoved.current) {
        onTap?.(schedule);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    startPos.current = { x: touch.clientX, y: touch.clientY };
    hasMoved.current = false;

    const handleTouchMove = (moveE: TouchEvent) => {
      const t = moveE.touches[0];
      const dx = Math.abs(t.clientX - startPos.current.x);
      const dy = Math.abs(t.clientY - startPos.current.y);
      if (dx > 5 || dy > 5) {
        hasMoved.current = true;
        onDragStart?.(schedule, e);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      }
    };

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      if (!hasMoved.current) {
        onTap?.(schedule);
      }
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);
  };

  return (
    <div
      className={`w-full text-left p-1 rounded text-xs text-white truncate transition-opacity cursor-grab ${
        isDragging ? 'opacity-50' : 'hover:opacity-80'
      }`}
      style={{ backgroundColor: workType.color, touchAction: 'none' }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div className="truncate font-medium">{site?.name || '不明'}</div>
      <div className="truncate text-[10px] opacity-80">
        {schedule.timeStart}-{schedule.timeEnd}
      </div>
    </div>
  );
}

export function WeekChart({
  companies,
  schedules,
  sites,
  workTypes,
  selectedDate,
  onScheduleTap,
  onScheduleUpdate,
}: WeekChartProps) {
  const weekDates = getWeekDates(selectedDate);
  const today = new Date().toISOString().split('T')[0];

  // ドラッグ状態
  const [draggingSchedule, setDraggingSchedule] = useState<Schedule | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [dropTarget, setDropTarget] = useState<{ date: string; companyId: number } | null>(null);
  const cellRefs = useRef<Map<string, HTMLTableCellElement>>(new Map());

  // 日付ごとのスケジュールを取得
  const getSchedulesForDate = (date: string, companyId: number) => {
    return schedules.filter(
      (s) => s.date === date && s.companyId === companyId
    );
  };

  // セルのキーを生成（日付に-が含まれるので|で区切る）
  const getCellKey = (date: string, companyId: number) => `${date}|${companyId}`;

  // ドラッグ開始
  const handleDragStart = useCallback((schedule: Schedule, e: React.MouseEvent | React.TouchEvent) => {
    setDraggingSchedule(schedule);

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setDragPosition({ x: clientX, y: clientY });
  }, []);

  // ドラッグ中の処理
  useEffect(() => {
    if (!draggingSchedule) return;

    const handleMove = (clientX: number, clientY: number) => {
      setDragPosition({ x: clientX, y: clientY });

      // ドロップ先を判定
      let foundTarget: { date: string; companyId: number } | null = null;
      cellRefs.current.forEach((cell, key) => {
        const rect = cell.getBoundingClientRect();
        if (
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom
        ) {
          const [date, companyIdStr] = key.split('|');
          foundTarget = { date, companyId: parseInt(companyIdStr) };
        }
      });
      setDropTarget(foundTarget);
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    const handleEnd = () => {
      if (dropTarget && draggingSchedule && onScheduleUpdate) {
        // 日付または担当を変更
        if (
          dropTarget.date !== draggingSchedule.date ||
          dropTarget.companyId !== draggingSchedule.companyId
        ) {
          onScheduleUpdate({
            ...draggingSchedule,
            date: dropTarget.date,
            companyId: dropTarget.companyId,
          });
        }
      }
      setDraggingSchedule(null);
      setDropTarget(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [draggingSchedule, dropTarget, onScheduleUpdate]);

  // セル参照を設定
  const setCellRef = (date: string, companyId: number) => (el: HTMLTableCellElement | null) => {
    const key = getCellKey(date, companyId);
    if (el) {
      cellRefs.current.set(key, el);
    } else {
      cellRefs.current.delete(key);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden relative">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[600px]">
          {/* ヘッダー */}
          <thead>
            <tr className="bg-gray-100">
              <th className="w-24 min-w-24 p-2 border-r border-b border-gray-300 text-left">
                <span className="text-xs font-medium text-gray-600">会社/担当</span>
              </th>
              {weekDates.map((date, index) => {
                const d = new Date(date);
                const isToday = date === today;
                const isWeekend = index >= 5;
                return (
                  <th
                    key={date}
                    className={`p-2 border-r border-b border-gray-200 text-center ${
                      isToday ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className={`text-xs ${isWeekend ? 'text-red-500' : 'text-gray-600'}`}>
                      {weekdayLabels[index]}
                    </div>
                    <div className={`text-sm font-medium ${
                      isToday ? 'text-blue-600' : isWeekend ? 'text-red-500' : 'text-gray-800'
                    }`}>
                      {d.getDate()}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          {/* ボディ */}
          <tbody>
            {companies.map((company) => (
              <tr key={company.id} className="border-b border-gray-200">
                {/* 会社名 */}
                <td className="w-24 min-w-24 p-2 border-r border-gray-300 bg-gray-50">
                  <span className="text-sm font-medium text-gray-800 truncate block">
                    {company.name}
                  </span>
                </td>
                {/* 各曜日のセル */}
                {weekDates.map((date) => {
                  const daySchedules = getSchedulesForDate(date, company.id);
                  const isToday = date === today;
                  const isDropTarget =
                    dropTarget?.date === date && dropTarget?.companyId === company.id;

                  return (
                    <td
                      key={date}
                      ref={setCellRef(date, company.id)}
                      className={`p-1 border-r border-gray-100 align-top min-h-16 h-16 transition-colors ${
                        isToday ? 'bg-blue-50' : ''
                      } ${isDropTarget ? 'bg-blue-100 ring-2 ring-blue-400 ring-inset' : ''}`}
                    >
                      <div className="space-y-1">
                        {daySchedules.map((schedule) => (
                          <DraggableScheduleItem
                            key={schedule.id}
                            schedule={schedule}
                            site={sites.find((s) => s.id === schedule.siteId)}
                            workTypes={workTypes}
                            onTap={onScheduleTap}
                            onDragStart={handleDragStart}
                            isDragging={draggingSchedule?.id === schedule.id}
                          />
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ドラッグ中のゴースト */}
      {draggingSchedule && (
        <div
          className="fixed pointer-events-none z-50 opacity-80"
          style={{
            left: dragPosition.x - 50,
            top: dragPosition.y - 20,
            width: 100,
          }}
        >
          <div
            className="p-2 rounded text-xs text-white shadow-lg"
            style={{ backgroundColor: workTypes[draggingSchedule.workType].color }}
          >
            <div className="font-medium truncate">
              {sites.find((s) => s.id === draggingSchedule.siteId)?.name || '不明'}
            </div>
            <div className="text-[10px] opacity-80">
              {draggingSchedule.timeStart}-{draggingSchedule.timeEnd}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
