# lyrics-web-frontend

企業向けコンテンツサイトのフロントエンドです。  
Strapi をバックエンド CMS として、Next.js で構築しています。

## 技術スタック

| 項目 | 内容 |
|------|------|
| フレームワーク | Next.js |
| 言語 | TypeScript |
| ホスティング | Vercel |
| CMS / API | Strapi（[lyrics-web-strapi](https://github.com/yoshiydp/lyrics-web-strapi)） |
| DB | PostgreSQL |

## 関連リポジトリ

| リポジトリ | 役割 |
|-----------|------|
| `lyrics-web-frontend`（本リポジトリ） | Next.js フロントエンド |
| `lyrics-web-strapi` | Headless CMS バックエンド（Strapi v5） |

## ページ構成

| パス | 説明 |
|------|------|
| `/` | トップページ |
| `/news` | ニュース一覧ページ |
| `/news/[slug]` | ニュース詳細ページ |

## ローカル開発

### 前提条件

- Node.js v20 以上
- Yarn
- `lyrics-web-strapi` がローカルで起動済み（`http://localhost:1337`）

### セットアップ

```bash
yarn install
cp .env.local.example .env.local
yarn dev
```

### 環境変数

`.env.local.example` をコピーして `.env.local` を作成してください。

```env
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
```

## API 取得方針

Strapi の REST API を `fetch` + `revalidate`（ISR）で取得します。

```
# ニュース一覧
GET /api/news?populate=*&sort=publishedAt:desc

# ニュース詳細（スラッグ指定）
GET /api/news?filters[slug][$eq]={slug}&populate=*
```

## デプロイ

Vercel への自動デプロイを想定しています。  
`main` ブランチへのマージをトリガーに本番デプロイが実行されます。
