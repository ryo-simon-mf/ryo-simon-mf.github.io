# 次回セッション: 2025-11-18 10:00 JST

## 🎯 やること

**Works pages データドリブン化のパイロット実装**

---

## 📋 実装手順

### 1. ブランチ作成
```bash
git checkout -b feature/works-data-driven
```

### 2. ディレクトリ構造作成
```bash
mkdir -p works-data/templates
```

### 3. パイロット実装（1-2プロジェクトで試す）

以下のファイルを作成：
- `works-data/projects.json` - toki-shirubeなど1-2プロジェクトのデータ
- `works-data/build-works.js` - ビルドスクリプト
- `works-data/templates/project-template.js` - HTMLテンプレート
- `package.json` - npm scriptsの追加

### 4. ビルドとテスト
```bash
npm run build
# → works/toki-shirube.html が生成される
```

localhostで確認：
```bash
python3 -m http.server 8000
# http://localhost:8000/works/toki-shirube.html
```

### 5. 動作確認OK → 全プロジェクト移行

残り38プロジェクトをprojects.jsonに追加してビルド

### 6. 最終確認 → masterにマージ

```bash
git checkout master
git merge feature/works-data-driven
git push
```

---

## 📚 参考資料

詳細な実装方法は以下を参照：
- `docs/works-refactoring-proposal.md`

---

## ✅ Session 11で完了したこと

1. 著作権表示の重複削除（35ファイル）
2. メニュー内の著作権表示に統一
3. Works pagesリファクタリング提案書作成
4. データドリブンアプローチの説明
5. 次回実装手順の整理

---

## 🔑 重要なポイント

- **ブランチで試す** → 安全に実装・テスト
- **パイロット実装** → 1-2プロジェクトで確認してから全体移行
- **純粋なJavaScript** → 新しいツール学習不要
- **ビルド後は静的HTML** → SEO・パフォーマンス維持

---

## 💡 期待される効果

| 項目 | 現在 | 移行後 |
|-----|------|--------|
| 新プロジェクト追加 | 200行のHTML手書き | JSONに10行追加 → ビルド |
| テンプレート変更 | 40+ファイル手動修正 | 1ファイル修正 → 全自動更新 |
| メンテナンス性 | 低（重複多数） | 高（データとUI分離） |

---

**準備はOK！次回セッションで実装しましょう 🚀**
