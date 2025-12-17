# TEKO-BOARD - Claude Code 運用ルール

## プロジェクト概要

TEKO事業の人員配置・現場管理システム。
タイムチャートによる配置可視化を中心に、現場関係者（染谷・菅優伍・トラ・梅内）の連携を効率化する。

---

## 重要：セキュリティ境界

このリポジトリには**機密情報を含めない**こと。
詳細: `.claude/rules/security.md`

**判断に迷ったら、含めない**

---

## ルール・コマンド

| ファイル | 内容 |
|----------|------|
| `.claude/rules/security.md` | セキュリティ境界の詳細 |
| `.claude/rules/development.md` | 開発ルール・コーディング規約 |
| `.claude/commands/quality-check.md` | 品質チェックコマンド |

---

## データ管理方針

```
data/
├── workers.json    ← 職人・業者の連絡先
└── sites.json      ← 現場情報
```

- JSONファイルがマスタ（Single Source of Truth）
- AGO秘書_V2のマスタとは独立管理

---

## 利用者情報

| 名前 | 役割 | 利用シーン |
|------|------|------------|
| 染谷雅人 | TEKO現場管理 | 配車指示、現場判断 |
| 菅優伍 | TEKOデスク管理 | 状況把握、スケジュール確認 |
| 堀川寿人（トラ） | 現場管理 | 工程進行、指示出し |
| 梅内光 | 積算・工程準備 | 工程表作成、図面管理 |

---

## 外部サービス

### 連携予定

- ANDPAD: 現場管理プラットフォーム（ブラウザ自動化での連携を検討中）
- LINE: 通知・連絡（将来的に検討）

---

## 開発状況

### Phase 1 完了

タイムチャート画面のプロトタイプ実装が完了。
詳細: `docs/dev-spec.md`

### 起動方法

```bash
npm install   # 初回のみ
npm run dev   # http://localhost:5173 で起動
```

### 次にやること（Phase 2）

1. Supabaseでのデータ永続化
2. ユーザー認証
3. リアルタイム同期
4. Vercelへのデプロイ

詳細: `docs/phase2-plan.md`

### 重要なファイル

```
docs/
├── requirements.md   ← 機能要件書（必読）
├── mockups.md        ← 画面モックアップ
└── dev-spec.md       ← 開発仕様書

src/
├── App.tsx           ← ルートコンポーネント
├── components/       ← UIコンポーネント群
└── types/            ← 型定義
```
