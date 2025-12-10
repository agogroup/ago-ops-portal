import { useState } from 'react';
import type { Company, Site, Schedule, WorkType, WorkTypeMap } from '../../types';

interface ScheduleFormProps {
  companies: Company[];
  sites: Site[];
  workTypes: WorkTypeMap;
  onSubmit: (schedule: Omit<Schedule, 'id'>) => void;
  initialDate?: string;
}

export function ScheduleForm({
  companies,
  sites,
  workTypes,
  onSubmit,
  initialDate,
}: ScheduleFormProps) {
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    companyId: companies[0]?.id || 0,
    siteId: sites[0]?.id || 0,
    date: initialDate || today,
    timeStart: '09:00',
    timeEnd: '17:00',
    workType: 'garbage' as WorkType,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyId) {
      newErrors.companyId = '会社を選択してください';
    }
    if (!formData.siteId) {
      newErrors.siteId = '現場を選択してください';
    }
    if (!formData.date) {
      newErrors.date = '日付を入力してください';
    }
    if (!formData.timeStart) {
      newErrors.timeStart = '開始時間を入力してください';
    }
    if (!formData.timeEnd) {
      newErrors.timeEnd = '終了時間を入力してください';
    }
    if (formData.timeStart >= formData.timeEnd) {
      newErrors.timeEnd = '終了時間は開始時間より後にしてください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    onSubmit({
      companyId: formData.companyId,
      siteId: formData.siteId,
      date: formData.date,
      timeStart: formData.timeStart,
      timeEnd: formData.timeEnd,
      workType: formData.workType,
    });

    // フォームをリセット
    setFormData({
      companyId: companies[0]?.id || 0,
      siteId: sites[0]?.id || 0,
      date: initialDate || today,
      timeStart: '09:00',
      timeEnd: '17:00',
      workType: 'garbage',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 会社/担当者 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          会社/担当者
        </label>
        <select
          value={formData.companyId}
          onChange={(e) =>
            setFormData({ ...formData, companyId: Number(e.target.value) })
          }
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.companyId ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
        {errors.companyId && (
          <p className="mt-1 text-sm text-red-500">{errors.companyId}</p>
        )}
      </div>

      {/* 現場 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          現場
        </label>
        <select
          value={formData.siteId}
          onChange={(e) =>
            setFormData({ ...formData, siteId: Number(e.target.value) })
          }
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.siteId ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          {sites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.name}（{site.address}）
            </option>
          ))}
        </select>
        {errors.siteId && (
          <p className="mt-1 text-sm text-red-500">{errors.siteId}</p>
        )}
      </div>

      {/* 作業種別 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          作業種別
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(workTypes).map(([key, value]) => (
            <button
              key={key}
              type="button"
              onClick={() =>
                setFormData({ ...formData, workType: key as WorkType })
              }
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                formData.workType === key
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor:
                  formData.workType === key ? value.color : undefined,
              }}
            >
              {value.label}
            </button>
          ))}
        </div>
      </div>

      {/* 日付 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          日付
        </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.date ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.date && (
          <p className="mt-1 text-sm text-red-500">{errors.date}</p>
        )}
      </div>

      {/* 時間 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            開始時間
          </label>
          <input
            type="time"
            value={formData.timeStart}
            onChange={(e) =>
              setFormData({ ...formData, timeStart: e.target.value })
            }
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.timeStart ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.timeStart && (
            <p className="mt-1 text-sm text-red-500">{errors.timeStart}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            終了時間
          </label>
          <input
            type="time"
            value={formData.timeEnd}
            onChange={(e) =>
              setFormData({ ...formData, timeEnd: e.target.value })
            }
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.timeEnd ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.timeEnd && (
            <p className="mt-1 text-sm text-red-500">{errors.timeEnd}</p>
          )}
        </div>
      </div>

      {/* 送信ボタン */}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        スケジュールを追加
      </button>
    </form>
  );
}
