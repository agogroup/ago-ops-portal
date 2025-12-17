# ブラウザ自動化によるANDPAD連携検討

作成日: 2025-12-15
出典: 2025-12-13_AI活用深掘りと事業展望.md のリサーチ結果

---

## 背景

ANDPAD APIはコスト理由で除外されたが、ブラウザ自動化（RPA的手法）でデータ連携できる可能性がある。
元のメモではAntigravityが推奨されていたが、Cursorの最新機能でも同等のことが可能になっている。

---

## Cursor Browser Agent（推奨）

### 概要

Cursor 1.7（2025年9月）でブラウザ機能がベータ導入、2.0でGA（正式版）となった。

### 利用可能な操作

| 操作 | 説明 |
|------|------|
| ナビゲーション | URL訪問とページ閲覧 |
| クリック | ボタン、リンク、フォーム要素との相互作用 |
| テキスト入力 | フォーム記入とデータ送信 |
| スクロール | 長いページや内容の閲覧 |
| スクリーンショット | ページの視覚的表現をキャプチャ |
| DOM情報取得 | 要素選択してDOM情報をエージェントに転送 |
| コンソール出力 | JavaScriptエラーとログの監視 |
| ネットワークトラフィック | HTTPリクエスト・レスポンスの追跡 |

### メリット

- **既存環境との統合**: Cursorを開発に使っているなら追加ツール不要
- **DOM情報の活用**: 元のメモで言及された「DOM情報を渡すことでクリック精度が向上」が実現済み
- **セッション永続化**: クッキー・ローカルストレージが保持されるためログイン状態を維持
- **コード生成との連携**: 取得したデータをそのままコードに変換可能

### 使い方

```
@Browser でANDPADにログインして、現場一覧からデータを取得して
```

参考: https://cursor.com/docs/agent/browser

---

## Browser MCP（代替案）

Cursor以外のツール（Claude Code、VS Code等）でも使いたい場合の選択肢。

### 特徴

| 特徴 | 説明 |
|------|------|
| 速度 | ローカル実行により低レイテンシー |
| プライバシー | ブラウザ活動はデバイス内に留まる |
| ログイン状態保持 | 既存ブラウザプロファイルを使用 |
| ステルス性 | 実ブラウザフィンガープリントでBot検知回避 |

### 対応アプリケーション

- Cursor
- Claude (Claude Code含む)
- VS Code
- Windsurf

参考: https://browsermcp.io/

---

## ANDPAD連携の想定ユースケース

### Phase 2で実装可能

1. **現場一覧の自動取得**
   - ANDPADにログイン
   - 現場一覧ページをスクレイピング
   - ago-ops-portalのsites.jsonに同期

2. **工程表データの取得**
   - 特定現場の工程表をスクリーンショット
   - またはデータをテキスト抽出

3. **日報の自動入力**（逆方向）
   - ago-ops-portalで入力したデータをANDPADに自動入力

### 実装上の注意点

- ANDPADの利用規約を確認（自動化の可否）
- ログイン情報の安全な管理（.envファイル、含めない）
- 頻繁なアクセスは避ける（負荷・検知対策）

---

## 比較表

| 項目 | Cursor Browser | Browser MCP | Antigravity |
|------|----------------|-------------|-------------|
| 導入難易度 | 低（組込み） | 中（MCP設定） | 中〜高 |
| Claude Code対応 | × | ○ | × |
| Cursor対応 | ○ | ○ | △ |
| DOM情報取得 | ○ | ○ | ○ |
| コスト | Cursor Pro内 | 無料 | 要調査 |

---

## 推奨方針

1. **開発中**: Cursor Browser Agent を使用（追加設定不要）
2. **Claude Codeから使いたい場合**: Browser MCP を導入
3. **Antigravity**: 現時点では優先度低（Cursorで代替可能）

---

## 次のアクション

- [ ] ANDPADの利用規約を確認（自動化の可否）
- [ ] Cursor Browser Agent でANDPADログインのPoCを実施
- [ ] 必要に応じてBrowser MCPをclaude codeに導入

---

## 参考リンク

- [Cursor Browser Documentation](https://cursor.com/docs/agent/browser)
- [Cursor Changelog](https://cursor.com/changelog)
- [Browser MCP](https://browsermcp.io/)
