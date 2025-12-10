// 時間軸ヘッダーコンポーネント
interface TimeHeaderProps {
  startHour?: number;
  endHour?: number;
}

export function TimeHeader({ startHour = 0, endHour = 24 }: TimeHeaderProps) {
  const hours = Array.from(
    { length: endHour - startHour + 1 },
    (_, i) => startHour + i
  );

  return (
    <div className="flex border-b border-gray-300 bg-gray-100 sticky top-0 z-20">
      {/* 会社名列のスペース */}
      <div className="w-24 min-w-24 shrink-0 border-r border-gray-300 p-2">
        <span className="text-xs font-medium text-gray-600">会社/担当</span>
      </div>
      {/* 時間列 */}
      <div className="flex">
        {hours.map((hour) => (
          <div
            key={hour}
            className="w-16 min-w-16 border-r border-gray-200 p-1 text-center"
          >
            <span className="text-xs text-gray-600">{hour}:00</span>
          </div>
        ))}
      </div>
    </div>
  );
}
