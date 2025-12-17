# 開発仕様書：タイムチャート画面

## 概要

「誰がどの現場にいるか」を一目で把握できるタイムチャート画面を作成します。
スマートフォンでの利用がメインです。

---

## 実装状況（2025-12-10 時点）

### Phase 1 完了機能

| 機能 | 状態 | 備考 |
|------|------|------|
| タイムチャート（日別） | ✅ 完了 | 24時間表示、横スクロール対応 |
| タイムチャート（週間） | ✅ 完了 | 月〜日の7日間表示 |
| 日付切替 | ✅ 完了 | 前日/翌日、日付ピッカー |
| 日別/週間表示の切替 | ✅ 完了 | タブで切替 |
| セルタップで詳細表示 | ✅ 完了 | モーダル表示 |
| ドラッグ&ドロップ（時間変更） | ✅ 完了 | 15分スナップ |
| ドラッグ&ドロップ（担当者変更） | ✅ 完了 | 日別・週間両対応 |
| リサイズ（開始/終了時間変更） | ✅ 完了 | 左端/右端ドラッグ |
| 現在時刻の縦線 | ✅ 完了 | 当日のみ表示 |
| 新規スケジュール追加 | ✅ 完了 | フォーム実装済 |
| 現場一覧画面 | ✅ 完了 | 検索・フィルタ機能付き |
| 連絡先検索画面 | ✅ 完了 | 作業種別フィルタ付き |
| 下部ナビゲーション | ✅ 完了 | 4タブ構成 |

---

## 画面レイアウト

### タイムチャート（日別）

- **縦軸**: 会社/担当者（TEKO、トラ、三十興業、S-TEC、神城電気など）
- **横軸**: 24時間（0:00〜24:00）を1時間刻みで表示
- **セル内**: 現場名と作業種別を表示
- **横スクロール可能**: スマホ画面で全時間帯を確認できるように

### タイムチャート（週間）

- **縦軸**: 会社/担当者
- **横軸**: 月曜〜日曜の7日間
- **セル内**: 現場名と時間帯を表示

### 操作方法

#### 日別ビュー
| 操作 | 動作 |
|------|------|
| アイテム中央をドラッグ | 時間変更 + 別の担当者に移動 |
| アイテム左端をドラッグ | 開始時間を変更 |
| アイテム右端をドラッグ | 終了時間を変更 |
| アイテムをタップ | 詳細モーダル表示 |

#### 週間ビュー
| 操作 | 動作 |
|------|------|
| アイテムをドラッグ | 別の日・別の担当者に移動 |
| アイテムをタップ | 詳細モーダル表示 |

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

開発時に使用するダミーデータ（`src/data/sampleData.ts`）：

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
    // ...
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

## 技術スタック

| 項目 | 選定 |
|------|------|
| フレームワーク | React 18+ |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS |
| ビルドツール | Vite |
| データ管理 | React useState（Phase 1）→ Supabase（Phase 2） |

---

## ファイル構成（実装済み）

```
src/
├── main.tsx                          # エントリーポイント
├── App.tsx                           # ルートコンポーネント
├── vite-env.d.ts
├── components/
│   ├── TimeChart/
│   │   ├── index.ts
│   │   ├── TimeChart.tsx             # 日別タイムチャート（D&D対応）
│   │   ├── WeekChart.tsx             # 週間タイムチャート（D&D対応）
│   │   ├── TimeChartRow.tsx          # 会社ごとの行
│   │   ├── ScheduleItem.tsx          # スケジュールアイテム（リサイズ対応）
│   │   └── TimeHeader.tsx            # 時間軸ヘッダー
│   ├── Navigation/
│   │   ├── index.ts
│   │   └── BottomNav.tsx             # 下部ナビゲーション
│   ├── ScheduleForm/
│   │   ├── index.ts
│   │   └── ScheduleForm.tsx          # スケジュール追加フォーム
│   ├── SiteList/
│   │   ├── index.ts
│   │   └── SiteList.tsx              # 現場一覧
│   ├── ContactList/
│   │   ├── index.ts
│   │   └── ContactList.tsx           # 連絡先一覧
│   └── common/
│       ├── index.ts
│       └── DatePicker.tsx            # 日付選択（日別/週間切替付き）
├── data/
│   └── sampleData.ts                 # サンプルデータ
├── types/
│   └── index.ts                      # 型定義
└── styles/
    └── index.css                     # Tailwind + カスタムCSS
```

---

## 起動方法

```bash
cd /Volumes/HD-WLU3/ago-ops-portal
npm install   # 初回のみ
npm run dev   # 開発サーバー起動（http://localhost:5173）
npm run build # 本番ビルド
```

---

## Phase 2 で実装予定

- [ ] Supabaseでのデータ永続化
- [ ] ユーザー認証
- [ ] 複数ユーザーでのリアルタイム同期
- [ ] プッシュ通知（LINE連携）
- [ ] ANDPAD PDF連携

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
| 2025-12-10 | Phase 1 実装完了、全機能の実装状況を記載 |

