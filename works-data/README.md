# 作品追加ガイド

このガイドでは、新しい作品をポートフォリオサイトに追加する方法を説明します。

## 📋 簡単3ステップ

### ステップ1: 画像を準備する

1. `image/` フォルダに新しいフォルダを作成
   - フォルダ名: 作品名（英数字、ハイフン推奨）
   - 例: `image/my-new-work/`

2. 作品画像をフォルダに配置
   - **サムネイル画像**: 一覧ページに表示される画像（1枚）
   - **詳細画像**: 作品ページで表示される画像（複数可）

### ステップ2: JSONファイルを作成する

1. `works-data/` フォルダに新しいファイルを作成
   - ファイル名: `作品名.json`（フォルダ名と同じ推奨）
   - 例: `works-data/my-new-work.json`

2. 下記のテンプレートをコピー＆ペースト

3. 必要な情報を記入（詳細は後述）

### ステップ3: 確認する

1. ローカルサーバーを起動
   ```bash
   python3 -m http.server 8000
   ```

2. ブラウザで確認
   - 一覧: `http://localhost:8000/works/works.html`
   - 詳細: `http://localhost:8000/works/works.html#作品ID`

3. 問題なければGitにコミット＆プッシュ
   ```bash
   git add .
   git commit -m "feat: add new work 作品名"
   git push origin master
   ```

---

## 📝 JSONテンプレート

```json
{
  "id": "作品ID",
  "title": "作品タイトル",
  "category": "code",
  "year": "2024",
  "thumbnail": "../image/作品フォルダ名/サムネイル.jpg",
  "images": [
    "../image/作品フォルダ名/image1.jpg",
    "../image/作品フォルダ名/image2.jpg"
  ],
  "description": "作品の説明文。<br>改行したい場合は&lt;br&gt;を使います。",
  "credit": null,
  "tools": null,
  "link": null,
  "exhibition": null,
  "award": null,
  "paper": null,
  "grants": null,
  "collaborators": null,
  "performers": null,
  "download": null,
  "citation": null,
  "related": null
}
```

---

## 📖 各フィールドの説明

### 必須フィールド（必ず記入）

| フィールド | 説明 | 例 |
|----------|------|-----|
| `id` | 作品の識別子（ファイル名と同じ） | `"my-new-work"` |
| `title` | 作品タイトル | `"My New Work"` |
| `category` | カテゴリ（下記参照） | `"code"` |
| `year` | 制作年 | `"2024"` |
| `thumbnail` | サムネイル画像パス | `"../image/my-new-work/thumb.jpg"` |
| `images` | 詳細ページの画像（配列） | `["../image/my-new-work/01.jpg"]` |
| `description` | 作品説明 | `"この作品は..."` |

### カテゴリの選択

以下の3つから選んでください：

- `"code"` - プログラミング作品
- `"object"` - オブジェクト・立体作品
- `"design"` - デザイン作品

### 任意フィールド（必要に応じて記入）

不要な項目は `null` のままでOKです。

| フィールド | 説明 | 記入例 |
|----------|------|--------|
| `credit` | 制作者情報 | `"Ryo Nishikado"` |
| `tools` | 使用ツール・技術 | `"p5.js, HTML5 Canvas"` |
| `link` | 外部リンク | `"<a class=\"list\" href=\"https://...\">LINK</a>"` |
| `exhibition` | 展示情報 | `"渋谷ヒカリエ (2024/01/15-01/20)"` |
| `award` | 受賞情報 | `"TOKYO MIDTOWN AWARD 2024 ファイナリスト"` |
| `paper` | 論文情報 | `"情報処理学会 (2024)"` |
| `grants` | 助成金情報 | `"文化庁メディア芸術創造発信事業"` |
| `collaborators` | 協力者・協力企業 | `"株式会社〇〇 [Produce]"` |
| `performers` | 出演者（パフォーマンス作品の場合） | `"Performer: 〇〇"` |
| `download` | ダウンロードリンク | `"<a href=\"...\">Download</a>"` |
| `citation` | 引用情報 | `"〇〇論文集, pp.1-5"` |
| `related` | 関連作品リンク | `"<a href=\"#other-work\">関連作品</a>"` |

---

## 💡 記入のコツ

### HTML使用可能フィールド

以下のフィールドではHTMLタグが使えます：

- `description` - 改行: `<br>`, リスト: `<ul><li>...</li></ul>`
- `credit` - 改行やリストが使えます
- `link`, `collaborators`, `download`, `related` - リンク: `<a href="...">...</a>`

**例：**
```json
"description": "第一段落の説明。<br><br>第二段落の説明。<ul><li>特徴1</li><li>特徴2</li></ul>"
```

### 画像パスの書き方

- 必ず `../image/` から始める
- 作品フォルダ名を続ける
- ファイル名を続ける

```json
"thumbnail": "../image/作品フォルダ名/ファイル名.jpg"
```

### 複数画像の指定

```json
"images": [
  "../image/my-work/image1.jpg",
  "../image/my-work/image2.jpg",
  "../image/my-work/image3.jpg"
]
```

---

## ✅ 実際の例（toki-shirube）

参考として、実際の作品JSONを確認できます：

```bash
cat works-data/toki-shirube.json
```

この作品は以下の項目を使用しています：
- 基本情報（title, category, year）
- 画像（thumbnail, images）
- 説明（description）
- クレジット（credit）
- 外部リンク（link）
- 受賞情報（award）
- 協力者（collaborators）

---

## 🔧 トラブルシューティング

### Q: 作品が表示されない

**A:** 以下を確認してください：
1. JSONファイルが `works-data/` フォルダにあるか
2. ファイル名が `.json` で終わっているか
3. JSON形式が正しいか（カンマ、引用符など）
4. ブラウザをハードリフレッシュ（Cmd+Shift+R）

### Q: JSON形式が正しいかチェックしたい

**A:** オンラインツールでチェック
- [JSONLint](https://jsonlint.com/) にコピペして確認

### Q: 画像が表示されない

**A:** 画像パスを確認
1. パスが `../image/` から始まっているか
2. フォルダ名とファイル名が正確か
3. 画像ファイルが実際に存在するか
4. ファイル名の大文字小文字が一致しているか

### Q: 改行がうまくいかない

**A:** `<br>` タグを使う
- `\n` ではなく `<br>` を使用
- 段落を空ける場合は `<br><br>`

---

## 📚 参考リンク

- **既存作品の確認**: `works-data/` フォルダ内のJSONファイル
- **作品一覧ページ**: `works/works.html`
- **画像フォルダ**: `image/` フォルダ

---

## 🚀 さらに高度な使い方

### リンクを含める場合

```json
"link": "<a class=\"list\" href=\"https://example.com\">プロジェクトサイト</a>"
```

### リスト形式のクレジット

```json
"credit": "チーム名<br><ul class=\"list-style-none\"><li>Ryo Nishikado (Developer)</li><li>〇〇 (Designer)</li></ul>"
```

### 複数のリンク

```json
"related": "<a class=\"list\" href=\"#work1\">関連作品1</a> / <a class=\"list\" href=\"#work2\">関連作品2</a>"
```

---

**更新日**: 2025-01-18
