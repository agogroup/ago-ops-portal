// 作業種別
export type WorkType = 'garbage' | 'management' | 'interior' | 'demolition' | 'electrical';

// 会社/担当者
export interface Company {
  id: number;
  name: string;
  type: WorkType;
}

// 現場
export interface Site {
  id: number;
  name: string;
  address: string;
}

// スケジュール
export interface Schedule {
  id: number;
  companyId: number;
  siteId: number;
  date: string; // YYYY-MM-DD
  timeStart: string; // HH:mm
  timeEnd: string; // HH:mm
  workType: WorkType;
}

// 作業種別の設定
export interface WorkTypeConfig {
  label: string;
  color: string;
}

// 作業種別マップ
export type WorkTypeMap = Record<WorkType, WorkTypeConfig>;
