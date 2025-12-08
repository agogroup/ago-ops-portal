# bolt.new 用プロンプト

## 使い方

1. https://bolt.new にアクセス
2. 以下のプロンプトをコピーして貼り付け
3. 生成されたコードを確認・調整

---

## プロンプト（そのままコピー）

```
建設現場の人員配置を管理するWebアプリを作成してください。

## 概要
「誰がどの現場にいるか」を一目で把握できるタイムチャート画面を作成します。
スマートフォンでの利用がメインです。

## メイン画面：タイムチャート

### レイアウト
- 縦軸：会社/担当者（TEKO、トラ、三十興業、S-TEC、神城電気など）
- 横軸：時間帯（午前/午後/夜、または時間単位）
- セル内：現場名と作業種別を表示

### 機能
1. 日付切替（前日/翌日ボタン、または日付ピッカー）
2. 日別/週間表示の切替
3. セルタップで詳細表示
4. 新規スケジュール追加ボタン

### 色分け
作業種別によってセルの背景色を変更：
- 青：ゴミ回収（TEKO作業）
- 緑：現場管理
- オレンジ：内装工事（軽鉄、ボード、クロス等）
- 赤：解体
- 黄：電気工事

### サンプルデータ
以下のダミーデータを表示してください：

```javascript
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

### デザイン要件
- モバイルファースト（スマホ画面幅を基準）
- 下部に固定ナビゲーション（タイムチャート/現場/追加/連絡先の4タブ）
- ダークモード対応は不要
- 日本語UI

### 技術スタック
- React + TypeScript
- Tailwind CSS
- データは一旦ローカルステート（後でSupabase等に移行予定）

シンプルで見やすいUIを心がけてください。
```

---

## 期待される出力

bolt.newが以下を生成するはず：
- React + TypeScript プロジェクト
- タイムチャートコンポーネント
- サンプルデータ表示
- 日付切替機能
- 下部ナビゲーション

---

## 生成後の調整ポイント

1. **時間軸の粒度**: 午前/午後/夜 or 1時間単位
2. **セルの情報量**: 現場名だけ or 作業種別も表示
3. **レスポンシブ対応**: PC表示時の幅調整

---

## 補足：bolt.newの使い方

1. プロンプトを貼り付けて「Generate」
2. 生成されたコードをプレビューで確認
3. 「Deploy」でURLを取得
4. 問題があればチャットで修正指示

生成されたコードは後でダウンロードしてリポジトリに取り込み可能。
