# Phase 2 実装計画

## 概要

Phase 1のローカルステート管理をSupabaseに移行し、データ永続化・認証・リアルタイム同期を実現する。

---

## 段階的実装アプローチ

### Step 1: Supabaseセットアップ & データ永続化（認証なし）

**目的**: まずデータがDBに保存され、リロードしても消えないようにする

**作業内容**:
1. Supabaseプロジェクト作成（ユーザー操作）
2. データベーススキーマ作成
3. `@supabase/supabase-js` インストール
4. Supabaseクライアント設定
5. データ取得・更新処理をSupabaseに置き換え

**テーブル設計**:
```sql
-- 会社/担当者
create table companies (
  id serial primary key,
  name text not null,
  type text not null check (type in ('garbage', 'management', 'interior', 'demolition', 'electrical')),
  created_at timestamp with time zone default now()
);

-- 現場
create table sites (
  id serial primary key,
  name text not null,
  address text,
  created_at timestamp with time zone default now()
);

-- スケジュール
create table schedules (
  id serial primary key,
  company_id integer references companies(id) on delete cascade,
  site_id integer references sites(id) on delete cascade,
  date date not null,
  time_start time not null,
  time_end time not null,
  work_type text not null check (work_type in ('garbage', 'management', 'interior', 'demolition', 'electrical')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- インデックス
create index idx_schedules_date on schedules(date);
create index idx_schedules_company on schedules(company_id);
```

**ファイル構成**:
```
src/
├── lib/
│   └── supabase.ts          # Supabaseクライアント
├── hooks/
│   ├── useCompanies.ts      # 会社データ取得
│   ├── useSites.ts          # 現場データ取得
│   └── useSchedules.ts      # スケジュールCRUD
└── types/
    └── database.ts          # Supabase型定義
```

---

### Step 2: ユーザー認証

**目的**: ログイン機能を追加し、データを保護する

**作業内容**:
1. 認証画面（ログイン/登録）作成
2. 認証状態管理（AuthContext）
3. Row Level Security (RLS) ポリシー設定
4. ログアウト機能

**追加コンポーネント**:
```
src/
├── components/
│   └── Auth/
│       ├── LoginForm.tsx
│       └── AuthGuard.tsx
├── contexts/
│   └── AuthContext.tsx
```

**RLSポリシー**:
```sql
-- 認証済みユーザーのみ読み書き可能
alter table schedules enable row level security;

create policy "Authenticated users can read schedules"
  on schedules for select
  to authenticated
  using (true);

create policy "Authenticated users can insert schedules"
  on schedules for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update schedules"
  on schedules for update
  to authenticated
  using (true);
```

---

### Step 3: リアルタイム同期

**目的**: 複数ユーザーが同時に操作しても即座に反映される

**作業内容**:
1. Supabase Realtime有効化
2. useSchedulesフックにリアルタイム購読追加
3. 楽観的UI更新（Optimistic Update）

**実装パターン**:
```typescript
// リアルタイム購読
useEffect(() => {
  const channel = supabase
    .channel('schedules')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'schedules'
    }, (payload) => {
      // 変更をステートに反映
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, []);
```

---

## 環境変数

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 実装順序

| ステップ | 内容 | 見積作業量 |
|----------|------|------------|
| 1-1 | Supabaseプロジェクト作成（ユーザー） | - |
| 1-2 | テーブル作成（SQL実行） | 小 |
| 1-3 | supabase-js導入 | 小 |
| 1-4 | データ取得hooks作成 | 中 |
| 1-5 | App.tsxをhooksに置き換え | 中 |
| 1-6 | 初期データ投入 | 小 |
| 2-1 | 認証画面作成 | 中 |
| 2-2 | AuthContext作成 | 中 |
| 2-3 | RLSポリシー設定 | 小 |
| 3-1 | リアルタイム購読追加 | 中 |

---

## 次のアクション

**Step 1-1: Supabaseプロジェクト作成**

1. https://supabase.com にアクセス
2. GitHubアカウントでサインイン
3. 「New Project」をクリック
4. プロジェクト名: `ago-ops-portal`
5. データベースパスワード: 安全なものを設定（メモしておく）
6. リージョン: `Northeast Asia (Tokyo)` を選択
7. 作成完了後、Settings > API から以下を取得:
   - Project URL
   - anon/public key

取得したら教えてください。Step 1-2に進みます。
