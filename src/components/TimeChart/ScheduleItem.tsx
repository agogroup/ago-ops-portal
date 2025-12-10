import { useRef, useState, useEffect, useCallback } from 'react';
import type { Schedule, Site, WorkTypeMap } from '../../types';

interface ScheduleItemProps {
  schedule: Schedule;
  site: Site | undefined;
  workTypes: WorkTypeMap;
  startHour: number;
  endHour: number;
  onTap?: (schedule: Schedule) => void;
  onUpdate?: (schedule: Schedule) => void;
  // 親コンポーネントでのドラッグ管理用
  onDragStart?: (schedule: Schedule, clientX: number, clientY: number) => void;
  isDraggingExternal?: boolean;
}

const HOUR_WIDTH = 64;
const SNAP_MINUTES = 15;
const MIN_DURATION = 30;

type DragMode = 'move' | 'resize-start' | 'resize-end' | null;

export function ScheduleItem({
  schedule,
  site,
  workTypes,
  startHour,
  endHour,
  onTap,
  onUpdate,
  onDragStart,
  isDraggingExternal,
}: ScheduleItemProps) {
  const workType = workTypes[schedule.workType];
  const elementRef = useRef<HTMLDivElement>(null);

  // ドラッグ状態（リサイズのみ自コンポーネントで管理）
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const [resizeStartDelta, setResizeStartDelta] = useState(0);
  const [resizeEndDelta, setResizeEndDelta] = useState(0);

  // 時間から位置を計算
  const [startH, startM] = schedule.timeStart.split(':').map(Number);
  const [endH, endM] = schedule.timeEnd.split(':').map(Number);

  const startMinutes = (startH - startHour) * 60 + startM;
  const endMinutes = (endH - startHour) * 60 + endM;
  const duration = endMinutes - startMinutes;

  const baseLeft = (startMinutes / 60) * HOUR_WIDTH;
  const baseWidth = (duration / 60) * HOUR_WIDTH;

  // ドラッグ中の位置とサイズ
  const currentLeft = baseLeft + resizeStartDelta;
  const currentWidth = baseWidth - resizeStartDelta + resizeEndDelta;

  const dragStartRef = useRef({ x: 0 });
  const hasMoved = useRef(false);

  const formatTime = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60) + startHour;
    const mins = Math.abs(totalMinutes % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const pxToMinutes = (px: number): number => {
    const minutes = (px / HOUR_WIDTH) * 60;
    return Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES;
  };

  // リサイズ用ドラッグ開始
  const handleResizeStart = useCallback((clientX: number, mode: 'resize-start' | 'resize-end') => {
    setDragMode(mode);
    hasMoved.current = false;
    dragStartRef.current = { x: clientX };
  }, []);

  // 移動用ドラッグ開始（親に委譲）
  const handleMoveStart = useCallback((clientX: number, clientY: number) => {
    hasMoved.current = false;
    dragStartRef.current = { x: clientX };
    onDragStart?.(schedule, clientX, clientY);
  }, [schedule, onDragStart]);

  // リサイズ中
  const handleResizeMove = useCallback((clientX: number) => {
    if (!dragMode || dragMode === 'move') return;

    const deltaX = clientX - dragStartRef.current.x;
    if (Math.abs(deltaX) > 5) {
      hasMoved.current = true;
    }

    const maxMinutes = (endHour - startHour + 1) * 60;

    if (dragMode === 'resize-start') {
      let newDelta = deltaX;
      if (baseLeft + newDelta < 0) {
        newDelta = -baseLeft;
      }
      const newWidth = baseWidth - newDelta;
      if (newWidth < (MIN_DURATION / 60) * HOUR_WIDTH) {
        newDelta = baseWidth - (MIN_DURATION / 60) * HOUR_WIDTH;
      }
      setResizeStartDelta(newDelta);
    } else if (dragMode === 'resize-end') {
      let newDelta = deltaX;
      const maxRight = maxMinutes * (HOUR_WIDTH / 60);
      if (baseLeft + baseWidth + newDelta > maxRight) {
        newDelta = maxRight - baseLeft - baseWidth;
      }
      const newWidth = baseWidth + newDelta;
      if (newWidth < (MIN_DURATION / 60) * HOUR_WIDTH) {
        newDelta = (MIN_DURATION / 60) * HOUR_WIDTH - baseWidth;
      }
      setResizeEndDelta(newDelta);
    }
  }, [dragMode, baseLeft, baseWidth, endHour, startHour]);

  // リサイズ終了
  const handleResizeEnd = useCallback(() => {
    if (!dragMode) return;

    if (hasMoved.current && onUpdate) {
      const maxMinutes = (endHour - startHour + 1) * 60;

      if (dragMode === 'resize-start') {
        const newStartMinutes = pxToMinutes(currentLeft);
        if (newStartMinutes >= 0) {
          onUpdate({
            ...schedule,
            timeStart: formatTime(newStartMinutes),
          });
        }
      } else if (dragMode === 'resize-end') {
        const newEndMinutes = pxToMinutes(currentLeft + currentWidth);
        if (newEndMinutes <= maxMinutes) {
          onUpdate({
            ...schedule,
            timeEnd: formatTime(newEndMinutes),
          });
        }
      }
    }

    setDragMode(null);
    setResizeStartDelta(0);
    setResizeEndDelta(0);
  }, [dragMode, currentLeft, currentWidth, endHour, startHour, schedule, onUpdate]);

  // マウスイベント
  const handleMouseDownResize = (e: React.MouseEvent, mode: 'resize-start' | 'resize-end') => {
    e.preventDefault();
    e.stopPropagation();
    handleResizeStart(e.clientX, mode);
  };

  const handleMouseDownMove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleMoveStart(e.clientX, e.clientY);
  };

  // タッチイベント
  const handleTouchStartResize = (e: React.TouchEvent, mode: 'resize-start' | 'resize-end') => {
    e.stopPropagation();
    const touch = e.touches[0];
    handleResizeStart(touch.clientX, mode);
  };

  const handleTouchStartMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleMoveStart(touch.clientX, touch.clientY);
  };

  // グローバルイベントリスナー（リサイズ用）
  useEffect(() => {
    if (!dragMode) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleResizeMove(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      handleResizeMove(touch.clientX);
    };

    const handleMouseUp = () => {
      handleResizeEnd();
    };

    const handleTouchEnd = () => {
      handleResizeEnd();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [dragMode, handleResizeMove, handleResizeEnd]);

  // クリック処理
  const handleClick = () => {
    if (!hasMoved.current && !isDraggingExternal) {
      onTap?.(schedule);
    }
  };

  const displayStartMinutes = pxToMinutes(currentLeft);
  const displayEndMinutes = pxToMinutes(currentLeft + currentWidth);

  return (
    <div
      ref={elementRef}
      className={`absolute top-1 bottom-1 rounded overflow-hidden text-white text-xs shadow-sm transition-shadow select-none ${
        dragMode || isDraggingExternal
          ? 'shadow-lg z-30 opacity-90'
          : 'hover:shadow-md'
      } ${isDraggingExternal ? 'opacity-50' : ''}`}
      style={{
        left: `${currentLeft}px`,
        width: `${currentWidth}px`,
        backgroundColor: workType.color,
        touchAction: 'none',
      }}
      onClick={handleClick}
    >
      {/* 左端リサイズハンドル */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black/20 z-10"
        onMouseDown={(e) => handleMouseDownResize(e, 'resize-start')}
        onTouchStart={(e) => handleTouchStartResize(e, 'resize-start')}
      />

      {/* メインコンテンツ（移動用） */}
      <div
        className={`absolute left-2 right-2 top-0 bottom-0 ${
          isDraggingExternal ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onMouseDown={handleMouseDownMove}
        onTouchStart={handleTouchStartMove}
      >
        <div className="p-1 h-full flex flex-col justify-center pointer-events-none">
          <div className="font-medium truncate">{site?.name || '不明'}</div>
          <div className="text-[10px] opacity-80 truncate">
            {dragMode
              ? `${formatTime(displayStartMinutes)} - ${formatTime(displayEndMinutes)}`
              : workType.label}
          </div>
        </div>
      </div>

      {/* 右端リサイズハンドル */}
      <div
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black/20 z-10"
        onMouseDown={(e) => handleMouseDownResize(e, 'resize-end')}
        onTouchStart={(e) => handleTouchStartResize(e, 'resize-end')}
      />
    </div>
  );
}
