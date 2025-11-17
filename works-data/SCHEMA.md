# Works Data JSON Schema

各作品のJSONファイルは以下のフィールド構造に従います。

## 必須フィールド (Required Fields)

全ての作品JSONファイルに必ず含まれるフィールド：

- **`id`** (string): 作品の一意識別子（ファイル名と同じ）
- **`title`** (string): 作品タイトル
- **`category`** (string): カテゴリー（"code", "object", "design"など）
- **`year`** (string): 制作年
- **`thumbnail`** (string): サムネイル画像のパス
- **`images`** (array of strings): 詳細ページで表示される画像のパス配列
- **`description`** (string): 作品説明文（HTML可）

## 任意フィールド (Optional Fields)

作品によって含まれる場合と含まれない場合があるフィールド（該当しない場合は`null`）：

- **`credit`** (string | null): クレジット情報（共同制作者など）
- **`tools`** (string | null): 使用ツール・技術
- **`exhibition`** (string | null): 展示情報
- **`award`** (string | null): 受賞情報
- **`paper`** (string | null): 論文発表情報
- **`grants`** (string | null): 助成金・支援制度情報
- **`collaborators`** (string | null): 共同制作者（Co-create with）
- **`performers`** (string | null): 演奏者・出演者
- **`download`** (string | null): ダウンロードリンク
- **`citation`** (string | null): 引用・掲載情報
- **`related`** (string | null): 関連情報
- **`link`** (string | null): 外部リンク

## フィールド表示順序

詳細ページでの表示順序（works-spa.js）：

1. Title（タイトル）
2. Year / Category（年 / カテゴリ）
3. Images（画像スライダー）
4. Description（説明）
5. **Performers（演奏者・出演者）**
6. Credit（クレジット）
7. Tool（ツール）
8. Exhibition（展示）
9. Award（受賞）
10. Paper（論文）
11. Grants（助成金）
12. Co-create with（共同制作者）
13. Download（ダウンロード）
14. Citation（引用）
15. Related（関連情報）
16. **Link（リンク）** ← 一番下

## 例

```json
{
  "id": "example-work",
  "title": "Example Work Title",
  "category": "code",
  "year": "2024",
  "thumbnail": "../image/example/thumb.png",
  "images": [
    "../image/example/img1.png",
    "../image/example/img2.png"
  ],
  "description": "作品の説明文...",
  "credit": "Collaborator Name",
  "tools": "Max8, TouchDesigner",
  "link": "<a class=\"list\" href=\"https://example.com\">Project Page</a>",
  "exhibition": "Exhibition Name [Date]",
  "award": "Award Name",
  "paper": null,
  "grants": null,
  "collaborators": null,
  "performers": null,
  "download": null,
  "citation": null,
  "related": null
}
```

## 注意事項

- HTMLタグを含むフィールド（description, credit, linkなど）はダブルクォートを適切にエスケープすること
- 画像パスは相対パス（`../image/...`）を使用
- 該当しない任意フィールドは`null`を設定（空文字列ではなく）
