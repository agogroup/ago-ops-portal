import { useEffect, useRef, useState, useCallback } from 'react';
import type { Company, Schedule, Site, WorkTypeMap } from '../../types';
import { TimeHeader } from './TimeHeader';
import { TimeChartRow } from './TimeChartRow';

const HOUR_WIDTH = 64;
const SNAP_MINUTES = 15;

interface TimeChartProps {
  companies: Company[];
  schedules: Schedule[];
  sites: Site[];
  workTypes: WorkTypeMap;
  selectedDate: string;
  startHour?: number;
  endHour?: number;
  onScheduleTap?: (schedule: Schedule) => void;
  onScheduleUpdate?: (schedule: Schedule) => void;
}

export function TimeChart({
  companies,
  schedules,
  sites,
  workTypes,
  selectedDate,
  startHour = 0,
  endHour = 24,
  onScheduleTap,
  onScheduleUpdate,
}: TimeChartProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentTimeLeft, setCurrentTimeLeft] = useState<number | null>(null);

  // ドラッグ状態
  const [draggingSchedule, setDraggingSchedule] = useState<Schedule | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [dragStartPosition, setDragStartPosition] = useState({ x: 0, y: 0 });
  const [dropTargetCompanyId, setDropTargetCompanyId] = useState<number | null>(null);
  const rowRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const daySchedules = schedules.filter((s) => s.date === selectedDate);

  // 時間をフォーマット
  const formatTime = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60) + startHour;
    const mins = Math.abs(totalMinutes % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // ピクセルから分に変換（スナップ付き）
  const pxToMinutes = (px: number): number => {
    const minutes = (px / HOUR_WIDTH) * 60;
    return Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES;
  };

  // 現在時刻の線
  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];

      if (selectedDate !== today) {
        setCurrentTimeLeft(null);
        return;
      }

      const hours = now.getHours();
      const minutes = now.getMinutes();

      if (hours < startHour || hours > endHour) {
        setCurrentTimeLeft(null);
        return;
      }

      const minutesFromStart = (hours - startHour) * 60 + minutes;
      const left = (minutesFromStart / 60) * 64;
      setCurrentTimeLeft(left);
    };

    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 60000);
    return () => clearInterval(interval);
  }, [selectedDate, startHour, endHour]);

  // ドラッグ開始
  const handleDragStart = useCallback((schedule: Schedule, clientX: number, clientY: number) => {
    setDraggingSchedule(schedule);
    setDragPosition({ x: clientX, y: clientY });
    setDragStartPosition({ x: clientX, y: clientY });
  }, []);

  // ドラッグ中の処理
  useEffect(() => {
    if (!draggingSchedule) return;

    const handleMove = (clientX: number, clientY: number) => {
      setDragPosition({ x: clientX, y: clientY });

      // ドロップ先の行を判定
      let foundCompanyId: number | null = null;
      rowRefs.current.forEach((row, companyId) => {
        const rect = row.getBoundingClientRect();
        if (clientY >= rect.top && clientY <= rect.bottom) {
          foundCompanyId = companyId;
        }
      });
      setDropTargetCompanyId(foundCompanyId);
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    const handleEnd = () => {
      if (draggingSchedule && onScheduleUpdate) {
        const deltaX = dragPosition.x - dragStartPosition.x;
        const hasMoved = Math.abs(deltaX) > 5 ||
          (dropTargetCompanyId !== null && dropTargetCompanyId !== draggingSchedule.companyId);

        if (hasMoved) {
          // 時間の変更を計算
          const [startH, startM] = draggingSchedule.timeStart.split(':').map(Number);
          const [endH, endM] = draggingSchedule.timeEnd.split(':').map(Number);
          const originalStartMinutes = (startH - startHour) * 60 + startM;
          const duration = ((endH - startHour) * 60 + endM) - originalStartMinutes;

          const deltaMinutes = pxToMinutes(deltaX);
          let newStartMinutes = originalStartMinutes + deltaMinutes;

          // 境界チェック
          const maxMinutes = (endHour - startHour + 1) * 60;
          if (newStartMinutes < 0) newStartMinutes = 0;
          if (newStartMinutes + duration > maxMinutes) newStartMinutes = maxMinutes - duration;

          const newSchedule: Schedule = {
            ...draggingSchedule,
            timeStart: formatTime(newStartMinutes),
            timeEnd: formatTime(newStartMinutes + duration),
            companyId: dropTargetCompanyId ?? draggingSchedule.companyId,
          };

          onScheduleUpdate(newSchedule);
        }
      }

      setDraggingSchedule(null);
      setDropTargetCompanyId(null);
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
  }, [draggingSchedule, dragPosition, dragStartPosition, dropTargetCompanyId, onScheduleUpdate, startHour, endHour]);

  // 行の参照を設定
  const setRowRef = (companyId: number) => (el: HTMLDivElement | null) => {
    if (el) {
      rowRefs.current.set(companyId, el);
    } else {
      rowRefs.current.delete(companyId);
    }
  };

  // ドラッグ中の表示用情報を計算
  const getDragDisplayInfo = () => {
    if (!draggingSchedule) return null;

    const deltaX = dragPosition.x - dragStartPosition.x;
    const [startH, startM] = draggingSchedule.timeStart.split(':').map(Number);
    const [endH, endM] = draggingSchedule.timeEnd.split(':').map(Number);
    const originalStartMinutes = (startH - startHour) * 60 + startM;
    const duration = ((endH - startHour) * 60 + endM) - originalStartMinutes;

    const deltaMinutes = pxToMinutes(deltaX);
    let newStartMinutes = originalStartMinutes + deltaMinutes;

    const maxMinutes = (endHour - startHour + 1) * 60;
    if (newStartMinutes < 0) newStartMinutes = 0;
    if (newStartMinutes + duration > maxMinutes) newStartMinutes = maxMinutes - duration;

    return {
      timeStart: formatTime(newStartMinutes),
      timeEnd: formatTime(newStartMinutes + duration),
    };
  };

  const dragDisplayInfo = getDragDisplayInfo();

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden relative">
      <div ref={scrollRef} className="overflow-x-auto time-chart-scroll">
        <div className="min-w-max">
          <TimeHeader startHour={startHour} endHour={endHour} />
          <div className="relative">
            {/* 現在時刻の線 */}
            {currentTimeLeft !== null && (
              <div
                className="current-time-line"
                style={{ left: `${currentTimeLeft + 96}px` }}
              />
            )}
            {companies.map((company) => (
              <TimeChartRow
                key={company.id}
                ref={setRowRef(company.id)}
                company={company}
                schedules={daySchedules}
                sites={sites}
                workTypes={workTypes}
                startHour={startHour}
                endHour={endHour}
                onScheduleTap={onScheduleTap}
                onScheduleUpdate={onScheduleUpdate}
                onDragStart={handleDragStart}
                draggingScheduleId={draggingSchedule?.id}
                isDropTarget={dropTargetCompanyId === company.id && draggingSchedule?.companyId !== company.id}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ドラッグ中のゴースト */}
      {draggingSchedule && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: dragPosition.x - 60,
            top: dragPosition.y - 20,
            width: 120,
          }}
        >
          <div
            className="p-2 rounded text-xs text-white shadow-lg opacity-90"
            style={{ backgroundColor: workTypes[draggingSchedule.workType].color }}
          >
            <div className="font-medium truncate">
              {sites.find((s) => s.id === draggingSchedule.siteId)?.name || '不明'}
            </div>
            <div className="text-[10px] opacity-80">
              {dragDisplayInfo
                ? `${dragDisplayInfo.timeStart} - ${dragDisplayInfo.timeEnd}`
                : `${draggingSchedule.timeStart} - ${draggingSchedule.timeEnd}`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
