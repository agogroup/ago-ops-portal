import { useState } from 'react';
import type { Company, WorkTypeMap } from '../../types';

interface ContactListProps {
  companies: Company[];
  workTypes: WorkTypeMap;
}

export function ContactList({ companies, workTypes }: ContactListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkType, setSelectedWorkType] = useState<string | null>(null);

  // 検索と作業種別でフィルタ
  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = company.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesWorkType =
      !selectedWorkType || company.type === selectedWorkType;
    return matchesSearch && matchesWorkType;
  });

  return (
    <div className="space-y-4">
      {/* 検索バー */}
      <div className="relative">
        <input
          type="text"
          placeholder="会社名・担当者名で検索..."
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

      {/* 作業種別フィルタ */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedWorkType(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !selectedWorkType
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          すべて
        </button>
        {Object.entries(workTypes).map(([key, value]) => (
          <button
            key={key}
            onClick={() => setSelectedWorkType(key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedWorkType === key
                ? 'text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={{
              backgroundColor: selectedWorkType === key ? value.color : undefined,
            }}
          >
            {value.label}
          </button>
        ))}
      </div>

      {/* 連絡先リスト */}
      <div className="space-y-2">
        {filteredCompanies.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            該当する連絡先が見つかりません
          </div>
        ) : (
          filteredCompanies.map((company) => {
            const workType = workTypes[company.type];
            return (
              <div
                key={company.id}
                className="bg-white rounded-lg shadow p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{company.name}</h3>
                      <span
                        className="px-2 py-0.5 text-xs rounded-full text-white"
                        style={{ backgroundColor: workType.color }}
                      >
                        {workType.label}
                      </span>
                    </div>
                    {/* 将来的にここに電話番号やメールを追加 */}
                    <p className="text-sm text-gray-500 mt-1">
                      連絡先情報は data/workers.json で管理予定
                    </p>
                  </div>
                  {/* 電話ボタン（将来的に有効化） */}
                  <button
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="電話（準備中）"
                    disabled
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 件数表示 */}
      <div className="text-center text-sm text-gray-500">
        {filteredCompanies.length} 件の連絡先
      </div>
    </div>
  );
}
