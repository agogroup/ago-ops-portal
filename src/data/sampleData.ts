import type { Company, Site, Schedule, WorkTypeMap } from '../types';

export const companies: Company[] = [
  { id: 1, name: 'TEKO', type: 'garbage' },
  { id: 2, name: 'トラ（Tiger Management）', type: 'management' },
  { id: 3, name: '三十興業', type: 'interior' },
  { id: 4, name: 'S-TEC', type: 'demolition' },
  { id: 5, name: '神城電気', type: 'electrical' },
];

export const sites: Site[] = [
  { id: 1, name: '宇都宮ソフトバンク', address: '宇都宮市' },
  { id: 2, name: 'クレープ屋', address: '東京都' },
  { id: 3, name: '赤羽居酒屋', address: '東京都北区' },
  { id: 4, name: '町屋', address: '東京都荒川区' },
];

export const schedules: Schedule[] = [
  { id: 1, companyId: 1, siteId: 1, date: '2025-12-09', timeStart: '09:00', timeEnd: '12:00', workType: 'garbage' },
  { id: 2, companyId: 1, siteId: 4, date: '2025-12-09', timeStart: '14:00', timeEnd: '17:00', workType: 'garbage' },
  { id: 3, companyId: 2, siteId: 1, date: '2025-12-09', timeStart: '09:00', timeEnd: '18:00', workType: 'management' },
  { id: 4, companyId: 3, siteId: 3, date: '2025-12-09', timeStart: '13:00', timeEnd: '20:00', workType: 'interior' },
  { id: 5, companyId: 4, siteId: 4, date: '2025-12-09', timeStart: '08:00', timeEnd: '15:00', workType: 'demolition' },
  { id: 6, companyId: 5, siteId: 4, date: '2025-12-09', timeStart: '14:00', timeEnd: '18:00', workType: 'electrical' },
];

export const workTypes: WorkTypeMap = {
  garbage: { label: 'ゴミ回収', color: '#3B82F6' },
  management: { label: '現場管理', color: '#22C55E' },
  interior: { label: '内装工事', color: '#F97316' },
  demolition: { label: '解体', color: '#EF4444' },
  electrical: { label: '電気工事', color: '#EAB308' },
};
