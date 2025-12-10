import { forwardRef } from 'react';
import type { Company, Schedule, Site, WorkTypeMap } from '../../types';
import { ScheduleItem } from './ScheduleItem';

interface TimeChartRowProps {
  company: Company;
  schedules: Schedule[];
  sites: Site[];
  workTypes: WorkTypeMap;
  startHour: number;
  endHour: number;
  onScheduleTap?: (schedule: Schedule) => void;
  onScheduleUpdate?: (schedule: Schedule) => void;
  onDragStart?: (schedule: Schedule, clientX: number, clientY: number) => void;
  draggingScheduleId?: number;
  isDropTarget?: boolean;
}

export const TimeChartRow = forwardRef<HTMLDivElement, TimeChartRowProps>(
  function TimeChartRow(
    {
      company,
      schedules,
      sites,
      workTypes,
      startHour,
      endHour,
      onScheduleTap,
      onScheduleUpdate,
      onDragStart,
      draggingScheduleId,
      isDropTarget,
    },
    ref
  ) {
    const totalHours = endHour - startHour + 1;
    const totalWidth = totalHours * 64;

    const companySchedules = schedules.filter((s) => s.companyId === company.id);

    return (
      <div
        ref={ref}
        className={`flex border-b border-gray-200 min-h-14 transition-colors ${
          isDropTarget ? 'bg-blue-100' : ''
        }`}
      >
        {/* 会社名 */}
        <div className="w-24 min-w-24 shrink-0 border-r border-gray-300 p-2 bg-gray-50 flex items-center">
          <span className="text-sm font-medium text-gray-800 truncate">
            {company.name}
          </span>
        </div>
        {/* スケジュールエリア */}
        <div
          className="relative"
          style={{ width: `${totalWidth}px`, minWidth: `${totalWidth}px` }}
        >
          {/* グリッド線 */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: totalHours }, (_, i) => (
              <div
                key={i}
                className="w-16 min-w-16 border-r border-gray-100 h-full"
              />
            ))}
          </div>
          {/* スケジュールアイテム */}
          {companySchedules.map((schedule) => (
            <ScheduleItem
              key={schedule.id}
              schedule={schedule}
              site={sites.find((s) => s.id === schedule.siteId)}
              workTypes={workTypes}
              startHour={startHour}
              endHour={endHour}
              onTap={onScheduleTap}
              onUpdate={onScheduleUpdate}
              onDragStart={onDragStart}
              isDraggingExternal={draggingScheduleId === schedule.id}
            />
          ))}
        </div>
      </div>
    );
  }
);
