# CLAUDE.md

このファイルは、リポジトリ内のコードを操作する際に Claude Code (claude.ai/code) へのガイダンスを提供します。

## コマンド

```bash
# 開発サーバー起動
yarn dev

# 本番ビルド
yarn build

# 本番起動（ビルド済みの場合）
yarn start

# Lint
yarn lint
```

開発サーバー: `http://localhost:3000`

---

## アーキテクチャ

### 技術スタック

| 項目 | 内容 |
|------|------|
| フレームワーク | Next.js 16（App Router） |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS v4 |
| ホスティング | Vercel |
| CMS / API | Strapi v5（lyrics-web-strapi） |
| ランタイム | Node.js v22 |
| パッケージマネージャー | Yarn |

### 関連リポジトリ

| リポジトリ | 役割 |
|-----------|------|
| `lyrics-web-frontend`（本リポジトリ） | Next.js フロントエンド |
| `lyrics-web-strapi` | Headless CMS バックエンド（Strapi v5） |

---

## ローカル開発環境のセットアップ

### 前提条件

- Node.js v22 以上
- Yarn
- `lyrics-web-strapi` がローカルで起動済み（`http://localhost:1337`）
  - Strapi 側で Content API のパブリック権限を設定済みであること（詳細は lyrics-web-strapi の CLAUDE.md 参照）

### 環境変数

`.env.local.example` をコピーして `.env.local` を作成します。

```bash
cp .env.local.example .env.local
```

`.env.local` の設定値：

```env
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
```

> `.env.local` は `.gitignore` に含まれており、コミットされません。

### 依存関係インストール

```bash
yarn install --ignore-engines
```

> Node.js v22.11.0 で eslint-visitor-keys の engines 制約が発生するため `--ignore-engines` を付けています。

### 開発サーバー起動

```bash
yarn dev
```

`http://localhost:3000` でアクセスできます。

---

## プロジェクト構成

```
lyrics-web-frontend/
├── src/
│   └── app/                  # App Router ルート
│       ├── layout.tsx         # ルートレイアウト
│       ├── page.tsx           # トップページ (/)
│       ├── globals.css        # グローバルスタイル（Tailwind）
│       └── news/
│           ├── page.tsx       # ニュース一覧 (/news)
│           └── [slug]/
│               └── page.tsx   # ニュース詳細 (/news/[slug])
├── .env.local                 # 環境変数（gitignore 済み）
├── .env.local.example         # 環境変数テンプレート
├── next.config.ts             # Next.js 設定
├── tsconfig.json
└── tailwind.config.ts         # Tailwind 設定（自動生成）
```

---

## ページ構成

| パス | ファイル | 説明 |
|------|---------|------|
| `/` | `src/app/page.tsx` | トップページ |
| `/news` | `src/app/news/page.tsx` | ニュース一覧 |
| `/news/[slug]` | `src/app/news/[slug]/page.tsx` | ニュース詳細 |

---

## Strapi API 連携

### データ取得方針

Strapi の REST API を Next.js の `fetch` + `revalidate`（ISR）で取得します。

```typescript
// ISR: 60秒ごとに再生成
const res = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/news?populate=*&sort=publishedAt:desc`, {
  next: { revalidate: 60 },
});
```

### API エンドポイント

```
# ニュース一覧
GET /api/news?populate=*&sort=publishedAt:desc

# ニュース詳細（スラッグ指定）
GET /api/news?filters[slug][$eq]={slug}&populate=*

# カテゴリー一覧
GET /api/categories?populate=*

# 著者一覧
GET /api/authors?populate=*
```

### レスポンス形式（Strapi v5 REST）

Strapi v5 では `data` 配列の各要素がフラットな属性構造になっています（v4 の `attributes` ネストは廃止）。

```typescript
// Strapi v5 のレスポンス例
{
  "data": [
    {
      "id": 1,
      "documentId": "abc123",
      "title": "記事タイトル",
      "slug": "article-slug",
      "excerpt": "概要テキスト",
      "publishedAt": "2026-01-01T00:00:00.000Z",
      "category": { "id": 1, "name": "カテゴリー名", "slug": "category-slug" }
    }
  ],
  "meta": { "pagination": { "page": 1, "pageSize": 25, "pageCount": 1, "total": 10 } }
}
```

---

## パスエイリアス

`@/` は `src/` に対応します（`tsconfig.json` で設定済み）。

```typescript
import { SomeComponent } from '@/components/SomeComponent';
```

---

## スタイリング

Tailwind CSS v4 を使用します。`src/app/globals.css` に `@import "tailwindcss"` が設定されています。

---

## デプロイフロー

### Vercel プロジェクト情報

| 項目 | 値 |
|------|---|
| プロジェクト名 | `lyrics-web/lyrics-web-frontend` |
| 本番 URL | https://lyrics-web-frontend.vercel.app |
| ダッシュボード | https://vercel.com/lyrics-web/lyrics-web-frontend |

### 自動デプロイ

GitHub リポジトリと Vercel が連携済みです。

| ブランチ | デプロイ先 |
|---------|-----------|
| `master` | Production（本番） |
| その他ブランチ | Preview（確認用 URL が自動発行） |

### 手動デプロイ（CLI）

```bash
vercel --prod   # 本番デプロイ
vercel          # Preview デプロイ
```

### 環境変数

Vercel に登録済みの環境変数（CLI で管理）：

| 変数名 | 環境 | 説明 |
|--------|------|------|
| `NEXT_PUBLIC_STRAPI_URL` | Development / Preview / Production | Strapi エンドポイント URL |

環境変数の操作：

```bash
vercel env ls                          # 一覧確認
vercel env add NEXT_PUBLIC_STRAPI_URL  # 追加・更新
vercel env rm NEXT_PUBLIC_STRAPI_URL   # 削除
```

> **Strapi Cloud デプロイ後:** Production の `NEXT_PUBLIC_STRAPI_URL` を Strapi Cloud の本番 URL に更新してください。

### デプロイ前チェック

```bash
yarn build   # ビルドエラーがないか確認
yarn lint    # Lint エラーがないか確認
```

---

## インフラ方針

| 環境 | フロントエンド | Strapi |
|------|--------------|--------|
| ローカル | `yarn dev`（localhost:3000） | `yarn develop`（localhost:1337） |
| STG | Vercel（Preview） | Strapi Cloud（STG 環境） |
| 本番 | Vercel（Production） | Strapi Cloud（本番環境） |
