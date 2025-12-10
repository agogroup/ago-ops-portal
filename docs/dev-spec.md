# 開発仕様書：タイムチャート画面

## 概要

「誰がどの現場にいるか」を一目で把握できるタイムチャート画面を作成します。
スマートフォンでの利用がメインです。

---

## 画面レイアウト

### タイムチャート

- **縦軸**: 会社/担当者（TEKO、トラ、三十興業、S-TEC、神城電気など）
- **横軸**: 24時間（0:00〜24:00）を1時間刻みで表示
- **セル内**: 現場名と作業種別を表示
- **横スクロール可能**: スマホ画面で全時間帯を確認できるように

### 必須機能

1. **日付切替**: 前日/翌日ボタン、または日付ピッカー
2. **日別/週間表示の切替**
3. **セルタップで詳細表示**
4. **新規スケジュール追加ボタン**
5. **ドラッグ&ドロップでスケジュール移動**
   - スケジュールアイテムを長押しでドラッグ開始
   - 横方向にドラッグして時間を変更（例：10:00→13:00）
   - ドロップ位置に応じてtimeStart/timeEndを自動更新
   - スマホのタッチ操作に対応（touch events）
6. **現在時刻を示す縦線を表示**

---

## 色分け（作業種別）

| 作業種別 | 色 | カラーコード |
|----------|------|--------------|
| ゴミ回収（TEKO作業） | 青 | #3B82F6 |
| 現場管理 | 緑 | #22C55E |
| 内装工事（軽鉄、ボード、クロス等） | オレンジ | #F97316 |
| 解体 | 赤 | #EF4444 |
| 電気工事 | 黄 | #EAB308 |

---

## サンプルデータ

開発時に使用するダミーデータ：

```typescript
const sampleData = {
  companies: [
    { id: 1, name: 'TEKO', type: 'garbage' },
    { id: 2, name: 'トラ（Tiger Management）', type: 'management' },
    { id: 3, name: '三十興業', type: 'interior' },
    { id: 4, name: 'S-TEC', type: 'demolition' },
    { id: 5, name: '神城電気', type: 'electrical' },
  ],
  sites: [
    { id: 1, name: '宇都宮ソフトバンク', address: '宇都宮市' },
    { id: 2, name: 'クレープ屋', address: '東京都' },
    { id: 3, name: '赤羽居酒屋', address: '東京都北区' },
    { id: 4, name: '町屋', address: '東京都荒川区' },
  ],
  schedules: [
    { companyId: 1, siteId: 1, date: '2025-12-09', timeStart: '09:00', timeEnd: '12:00', workType: 'garbage' },
    { companyId: 1, siteId: 4, date: '2025-12-09', timeStart: '14:00', timeEnd: '17:00', workType: 'garbage' },
    { companyId: 2, siteId: 1, date: '2025-12-09', timeStart: '09:00', timeEnd: '18:00', workType: 'management' },
    { companyId: 3, siteId: 3, date: '2025-12-09', timeStart: '13:00', timeEnd: '20:00', workType: 'interior' },
    { companyId: 4, siteId: 4, date: '2025-12-09', timeStart: '08:00', timeEnd: '15:00', workType: 'demolition' },
    { companyId: 5, siteId: 4, date: '2025-12-09', timeStart: '14:00', timeEnd: '18:00', workType: 'electrical' },
  ],
  workTypes: {
    garbage: { label: 'ゴミ回収', color: '#3B82F6' },
    management: { label: '現場管理', color: '#22C55E' },
    interior: { label: '内装工事', color: '#F97316' },
    demolition: { label: '解体', color: '#EF4444' },
    electrical: { label: '電気工事', color: '#EAB308' },
  }
};
```

---

## デザイン要件

- **モバイルファースト**: スマホ画面幅を基準に設計
- **下部固定ナビゲーション**: タイムチャート/現場/追加/連絡先の4タブ
- **ダークモード対応**: 不要（Phase 1では対応しない）
- **言語**: 日本語UI

---

## 技術スタック

| 項目 | 選定 |
|------|------|
| フレームワーク | React 18+ |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS |
| ビルドツール | Vite |
| データ管理 | React useState（Phase 1）→ Supabase（Phase 2） |

---

## ファイル構成（案）

```
src/
├── main.tsx           # エントリーポイント
├── App.tsx            # ルートコンポーネント
├── components/
│   ├── TimeChart/
│   │   ├── TimeChart.tsx        # メインコンポーネント
│   │   ├── TimeChartRow.tsx     # 会社ごとの行
│   │   ├── ScheduleItem.tsx     # スケジュールアイテム
│   │   └── TimeHeader.tsx       # 時間軸ヘッダー
│   ├── Navigation/
│   │   └── BottomNav.tsx        # 下部ナビゲーション
│   └── common/
│       └── DatePicker.tsx       # 日付選択
├── data/
│   └── sampleData.ts            # サンプルデータ
├── types/
│   └── index.ts                 # 型定義
└── styles/
    └── index.css                # Tailwind設定
```

---

## 開発手順

### Phase 1-1: プロジェクト初期化

```bash
npm create vite@latest . -- --template react-ts
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Phase 1-2: タイムチャート基本実装

1. サンプルデータの作成
2. TimeChartコンポーネント作成
3. 横スクロール対応
4. 色分け実装

### Phase 1-3: 操作機能追加

1. 日付切替
2. セルタップ詳細表示
3. ドラッグ&ドロップ

### Phase 1-4: ナビゲーション追加

1. 下部固定ナビゲーション
2. 画面遷移の準備

---

## 注意事項

- シンプルで見やすいUIを心がける
- 過度な機能追加は避け、MVP（最小限の機能）を優先
- コメントは日本語OK、変数名・関数名は英語

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2025-12-08 | 初版作成（bolt-prompt.mdから変換） |

