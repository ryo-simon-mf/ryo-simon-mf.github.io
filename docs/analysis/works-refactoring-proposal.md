# Works Pages リファクタリング提案

## 質問：大量のHTMLファイルは開発的に良くないか？

**回答：** 40+の重複したHTMLファイルは開発的に問題があります。データとテンプレートを分離すべきです。

---

## 現状の問題点

### 👨‍💻 Web開発者視点での課題

**現在の構造（40+ HTMLファイル）の問題:**
- ❌ **DRY違反**: 同じHTML構造が40回以上重複
- ❌ **メンテナンス性**: 構造変更時に全ファイル修正が必要
- ❌ **一貫性リスク**: 手動コピペでミスが発生しやすい
- ❌ **スケーラビリティ**: 新プロジェクト追加のたびにHTMLファイル作成

**ただし、メリットもあります:**
- ✅ **シンプル**: ビルドプロセス不要、そのまま動く
- ✅ **SEO**: 各プロジェクトが独立したURL
- ✅ **パフォーマンス**: 静的ファイルは超高速
- ✅ **GitHub Pages対応**: そのまま動く

---

## 他のアーティスト/企業の実装パターン

実際の事例を調査すると、主に4つのアプローチがあります：

### 1. データドリブン + クライアントサイドレンダリング
**採用例:** 小〜中規模のポートフォリオサイト

```javascript
// works-data.json
[
  {
    "id": "toki-shirube",
    "title": "toki-shirube",
    "category": "object",
    "images": ["tokishirube01.png", "tokishirube02.png"],
    "description": "現代を生きる我々は...",
    "tools": ["Aroma Candle Design"],
    "links": [...]
  }
]

// 1つのHTML: works/project.html?id=toki-shirube
// JavaScriptでJSONを読み込み、動的に表示
```

**メリット:**
- ✅ データとUIが分離
- ✅ 1つのHTMLテンプレートのみメンテナンス
- ✅ 新プロジェクト = JSONに数行追加

**デメリット:**
- ⚠️ JavaScript必須（SEOに要配慮）
- ⚠️ 初回読み込みで全データをフェッチ

---

### 2. 静的サイトジェネレーター（SSG）
**採用例:** Eleventy, Hugo, Jekyll使用のポートフォリオ

```markdown
// works/toki-shirube.md (データのみ)
---
title: toki-shirube
category: object
images: [tokishirube01.png, tokishirube02.png]
---
現代を生きる我々は...

// ビルド時に自動でHTMLファイル生成
```

**採用企業/アーティスト:**
- Netlify公式サイト（Eleventy）
- GitHub Docs（Jekyll）
- 多くのデザイナーポートフォリオ

**メリット:**
- ✅ ビルド後は静的HTML（現状と同じ速度）
- ✅ データとテンプレート分離
- ✅ SEO完璧、GitHub Pages対応

**デメリット:**
- ⚠️ ビルドプロセスが必要
- ⚠️ Node.js/Ruby環境のセットアップ

---

### 3. モダンフレームワーク（React/Next.js/Nuxt）
**採用例:** 大規模なポートフォリオ、企業サイト

```jsx
// pages/works/[id].jsx
export default function WorkDetail({ project }) {
  return <div>{project.title}...</div>
}
```

**採用企業:**
- Apple（Next.js）
- Nike（React）
- Spotify Design（Next.js）

**メリット:**
- ✅ 超モダン、インタラクション豊富
- ✅ データ管理が洗練

**デメリット:**
- ❌ 学習コスト高い
- ❌ ビルド環境複雑
- ❌ あなたの規模には過剰（Over-engineering）

---

### 4. ヘッドレスCMS
**採用例:** 頻繁に更新する大規模ポートフォリオ

- Contentful, Sanity, Strapi等でコンテンツ管理
- 非エンジニアでも更新可能

**メリット:**
- ✅ GUIでプロジェクト追加
- ✅ 画像管理が楽

**デメリット:**
- ❌ インフラコスト
- ❌ セットアップ複雑

---

## プロジェクト規模別の推奨アプローチ

1. **小規模（10-30プロジェクト）**:
   - 静的HTML or データドリブンJS（JSON）
   - 例: 多くの個人アーティスト

2. **中規模（30-100プロジェクト）**:
   - 静的サイトジェネレーター（Eleventy, Jekyll）
   - 例: デザインスタジオ、フリーランサー

3. **大規模（100+プロジェクト、頻繁更新）**:
   - Next.js + ヘッドレスCMS
   - 例: デザインエージェンシー、大手企業

**あなたは40プロジェクトなので、中規模の境界線にいます。**

---

## 推奨アプローチ：データドリブン with 静的HTML生成

### 自分でコードを書く + GitHub Pagesに最適

**JSONベース + 軽量なNode.jsビルドスクリプト**

### なぜこれが最適か

**Eleventyより優れている点:**
- ❌ Eleventy: 新しいテンプレート言語（Nunjucks/Liquid）を学ぶ必要がある
- ✅ この方式: **純粋なJavaScript + HTMLテンプレートリテラル**だけ（既存知識で書ける）

**完全なJSONベースより優れている点:**
- ❌ クライアントサイドのみ: SEOが弱い、JavaScript必須
- ✅ この方式: **ビルド時に静的HTML生成** = SEO完璧、現状と同じ速度

**GitHub Pagesとの相性:**
- ✅ ビルド後は静的HTMLファイル（現状と同じ）
- ✅ GitHub Actionsで自動ビルド可能
- ✅ またはローカルでビルドしてコミットでもOK

---

## 具体的な実装イメージ

### 1. ディレクトリ構造

```
/
├── works-data/
│   ├── projects.json              # 全プロジェクトのデータ
│   ├── build-works.js             # HTMLを生成するスクリプト（あなたが書く）
│   └── templates/
│       └── project-template.js    # HTMLテンプレート（あなたが書く）
├── works/
│   ├── toki-shirube.html         # ビルドで自動生成される
│   ├── inochinokodou.html        # ビルドで自動生成される
│   └── ... (40+ファイル自動生成)
└── package.json                   # npm run build だけ
```

---

## 実装例

### 2. データファイル（works-data/projects.json）

```json
[
  {
    "id": "toki-shirube",
    "title": "toki-shirube",
    "category": "object",
    "description": "現代を生きる我々は、時刻という普遍的な尺度を用いて時間を認識しています。しかし、昔を生きた人々は、空の色の移ろいや草木の香りの変化などを通して、身体的に時間を捉えていました。\n<br>「toki-shirube」は、1日の中で香りが変化する層構造のアロマキャンドルです。グラデーションのデザインは、空の色の移ろいを表現しました。嗅覚と視覚から、身体的に時の流れを感じられます。",
    "images": [
      {
        "src": "../image/toki-shirube/tokishirube01.png",
        "alt": ""
      },
      {
        "src": "../image/toki-shirube/tokishirube02.png",
        "alt": ""
      }
    ],
    "credits": [
      {
        "group": "Baumkuchen",
        "members": [
          "Maato Kurimoto(Designer)",
          "Takumi Inaba(Planner)",
          "Ryo Nishikado(Creative Technologist/Artist)"
        ]
      },
      {
        "text": "ペガサス・キャンドル株式会社 [Associate Produce]",
        "link": "https://www.pegasuscandle.com/company/"
      }
    ],
    "links": [
      {
        "text": "LINK",
        "url": "https://www.tokyo-midtown.com/jp/award/result/2024/design.html#:~:text=%E3%81%97%E3%82%8C%E3%81%AA%E3%81%84%E3%80%82-,toki%2Dshirube,-%E5%85%A5%E9%81%B8%E8%80%85%EF%BC%9A"
      }
    ]
  }
]
```

---

### 3. ビルドスクリプト（works-data/build-works.js）

**あなたが書くコード - シンプルで理解しやすい**

```javascript
// works-data/build-works.js
const fs = require('fs');
const path = require('path');
const projectTemplate = require('./templates/project-template.js');

// プロジェクトデータを読み込み
const projects = JSON.parse(
  fs.readFileSync('./works-data/projects.json', 'utf-8')
);

// 各プロジェクトごとにHTMLファイルを生成
projects.forEach(project => {
  const html = projectTemplate(project);  // テンプレート関数を呼ぶだけ
  const filePath = path.join(__dirname, '../works', `${project.id}.html`);

  fs.writeFileSync(filePath, html, 'utf-8');
  console.log(`✅ Generated: ${project.id}.html`);
});

console.log(`\n🎉 Built ${projects.length} project pages!`);
```

---

### 4. テンプレート（works-data/templates/project-template.js）

**あなたが書くコード - 純粋なJavaScript関数**

```javascript
// works-data/templates/project-template.js
module.exports = function(project) {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.title} - Ryo Simon</title>

    <!-- SEO Meta Tags -->
    <meta name="description" content="${project.title} project by Ryo Simon.">
    <meta name="keywords" content="Ryo Simon, Ryo Nishikado, creative coding, interactive art, design">
    <meta name="author" content="Ryo Nishikado">
    <meta name="robots" content="index, follow">

    <!-- OGP Meta Tags -->
    <meta property="og:title" content="${project.title} - Ryo Simon">
    <meta property="og:description" content="${project.title} project by Ryo Simon.">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://ryo-simon-mf.github.io/works/${project.id}.html">
    <meta property="og:image" content="https://ryo-simon-mf.github.io/image/profile/2025_icon_basic.webp">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:creator" content="@ryo_simon_mf">

    <link rel="stylesheet" href="../css/common.css" type="text/css">
    <link rel="stylesheet" href="../css/style_2.css" type="text/css">
    <link rel="stylesheet" href="../css/images.css" type="text/css">
    <link rel="stylesheet" href="../css/swiper/swiper.css">

    <!-- icon -->
    <link rel="icon" type="image/x-icon" href="../favicon.ico">
    <link rel="apple-touch-icon" sizes="180x180" href="../apple-touch-icon-180x180.png">

    <!-- jQuery -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
    <script type="text/javascript" src="../js/sample.js"></script>

    <!-- swiper-->
    <script src="../js/swiper/swiper.js"></script>

    <!-- p5.js -->
    <script src="../js/p5.js/p5.min.js"></script>
    <script src="../js/p5.js/sketch_3.js"></script>
</head>
<body>
    <div id="zentai">
        <div id="content">
            <br>
            <h1>${project.title}</h1>
            <hr>

            ${generateSwiper(project.images)}

            <h3>${project.title}</h3>
            <div id="content_in">
                <p>${project.description}</p>

                ${generateCredits(project.credits)}
                ${generateLinks(project.links)}

                <br>
            </div>
            <hr>
            <hr>
            <br>
        </div>
    </div>

    <div id="menu" role="navigation">
        <!-- Menu content loaded dynamically via load-menu.js -->
    </div>
    <script src="../js/load-menu.js"></script>
</body>
</html>`;
};

// 画像スライダーのHTML生成（あなたが書く補助関数）
function generateSwiper(images) {
  if (!images || images.length === 0) return '';

  const slides = images.map(img => `
    <div class="swiper-slide">
        <div class="img_w2">
            <img src="${img.src}" alt="${img.alt}" loading="lazy">
        </div>
    </div>`).join('');

  return `
    <div class="swiper-container">
        <div class="swiper-wrapper">
            ${slides}
        </div>
        <div class="swiper-button-prev"></div>
        <div class="swiper-button-next"></div>
    </div>
    <script src="../js/swiper/ownoption.js"></script>`;
}

// クレジット情報のHTML生成
function generateCredits(credits) {
  if (!credits || credits.length === 0) return '';

  const creditItems = credits.map(credit => {
    if (credit.group) {
      return `
        <a>
            ${credit.group}
            <br>
            <ul class="list-style-none">
                ${credit.members.map(m => `<li>${m}</li>`).join('\n')}
            </ul>
        </a>`;
    }
    return `
      <a>${credit.text}</a>
      ${credit.link ? `<a class="list" href="${credit.link}">[LINK]</a>` : ''}`;
  }).join('<br>\n');

  return `
    <dt>Credit</dt>
    <dd>${creditItems}</dd>
    <br>`;
}

// リンクのHTML生成
function generateLinks(links) {
  if (!links || links.length === 0) return '';

  const linkItems = links.map(link =>
    `<a class="list" href="${link.url}">${link.text}</a>`
  ).join('\n');

  return `
    <dt>Link</dt>
    <dd>${linkItems}</dd>
    <br>`;
}
```

---

### 5. package.json

```json
{
  "name": "ryo-simon-portfolio",
  "version": "1.0.0",
  "scripts": {
    "build": "node works-data/build-works.js",
    "build:watch": "nodemon works-data/build-works.js"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

---

## 使い方

### 新しいプロジェクトを追加する場合

```bash
# 1. projects.jsonに新しいプロジェクトを追加（JSONを編集するだけ）
# 2. ビルド実行
npm run build

# → works/新プロジェクト.html が自動生成される
```

### HTMLテンプレートを変更する場合

```bash
# 1. templates/project-template.js を編集
# 2. ビルド実行
npm run build

# → 全40+ファイルが一括更新される
```

---

## なぜこの方式が「自分でコードを書く」に最適か

### ✅ コードの透明性
- **Eleventy**: テンプレート言語＋内部の魔法 = ブラックボックス
- **この方式**: 純粋なJavaScript関数 = **全て自分で書ける、理解できる**

```javascript
// あなたが書くコード（分かりやすい）
function generateSwiper(images) {
  return images.map(img => `<img src="${img.src}">`).join('');
}
```

### ✅ デバッグが簡単
- エラーが出たら、自分が書いたJavaScriptを読むだけ
- console.logで確認できる
- Node.jsの標準的なデバッグ手法が使える

### ✅ カスタマイズ自由
- テンプレート関数は普通のJavaScript
- 条件分岐、ループ、何でも自由に書ける
- 外部ライブラリも自由に追加できる

### ✅ 学習コスト最小
- 新しい言語を学ぶ必要なし
- JavaScriptのテンプレートリテラルだけ
- Node.jsのfs（ファイル操作）だけ理解すればOK

---

## GitHub Pagesへのデプロイ

### オプション1: ローカルでビルド（推奨・シンプル）

```bash
npm run build
git add works/*.html
git commit -m "Update project pages"
git push
```

### オプション2: GitHub Actionsで自動ビルド

```yaml
# .github/workflows/build.yml
name: Build Works Pages
on:
  push:
    paths:
      - 'works-data/**'
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add works/*.html
          git commit -m "Auto-build project pages"
          git push
```

---

## 比較表：あなたに最適な理由

| 要件 | この方式 | Eleventy |
|------|---------|----------|
| 自分でコードを書く | ✅ 100%自分で書ける | ⚠️ テンプレート言語を学ぶ必要 |
| GitHub Pages | ✅ 完全対応 | ✅ 完全対応 |
| 学習コスト | ✅ 低（JS/HTML/CSSのみ） | ⚠️ 中（新ツール学習） |
| デバッグ | ✅ 簡単（普通のJS） | ⚠️ テンプレートエラーが分かりにくい |
| カスタマイズ | ✅ 完全自由 | ⚠️ フレームワークの制約あり |
| SEO | ✅ 完璧（静的HTML） | ✅ 完璧 |
| ビルド速度 | ✅ 超高速（シンプルなスクリプト） | ⚠️ やや遅い |
| メンテナンス性 | ✅ 自分で全て理解できる | ⚠️ フレームワーク依存 |

---

## 次のステップ

この方式で進める場合：

1. **パイロット実装**: 1-2プロジェクトで試してみる
2. **検証**: ビルド、表示、SEOを確認
3. **全プロジェクト移行**: 既存40+プロジェクトをJSONに変換
4. **ドキュメント整備**: 運用ルールを記録

---

## まとめ

- ✅ データ（JSON）とテンプレート（JS）を分離
- ✅ 純粋なJavaScriptで全て書ける（新しい言語不要）
- ✅ ビルド後は静的HTML（現状と同じ速度・SEO）
- ✅ GitHub Pagesで問題なく動作
- ✅ 新プロジェクト追加 = JSONに数行追加 → ビルド
- ✅ テンプレート修正 = 1ファイル修正 → 全40+ファイル自動更新

**この方式なら、自分でコードを書きながら、保守性の高いポートフォリオサイトを構築できます。**
