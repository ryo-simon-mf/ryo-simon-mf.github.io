# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⛔ CRITICAL: Git Push Rules (最重要！)

**NEVER run `git push` without EXPLICIT user permission.**

**Enforcement**:
- ❌ **FORBIDDEN**: Running `git push` automatically after commit
- ❌ **FORBIDDEN**: Combining `git commit` and `git push` in a single command with `&&`
- ✅ **REQUIRED**: Always STOP after `git commit` and ASK user before pushing
- ✅ **REQUIRED**: Wait for explicit "push してください" or "push ok" from user

**Correct Workflow**:
1. Make changes
2. `git add .`
3. `git commit -m "message"`
4. **STOP and ask user**: "コミットしました。GitHubにpushしますか？"
5. Wait for user confirmation
6. Only then: `git push origin master`

**Violation History**:
- 2025-11-18: Pushed without permission after hamburger menu fix. User explicitly stated: "だから勝手にpushするなって何度言えばいいんだよ"

---

## ⛔ CRITICAL: Git Commit Message Rules (最重要！)

**NEVER add the following to ANY git commit message:**

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Reason**: User explicitly removed Claude from GitHub Contributors in Session 09 (all 709 commits rewritten). Adding this signature makes Claude appear as a contributor again.

**Enforcement**:
- ❌ **FORBIDDEN**: Any emoji (🤖) in commit messages
- ❌ **FORBIDDEN**: "Generated with Claude Code" text
- ❌ **FORBIDDEN**: "Co-Authored-By: Claude" attribution
- ✅ **REQUIRED**: Plain commit messages WITHOUT any Claude attribution

**If you accidentally add attribution**:
1. Immediately amend the commit: `git commit --amend` (remove attribution)
2. Force push: `git push --force origin master`
3. Apologize to user

**Additional safety**: `.mailmap` file maps any Claude commits to main author.

---

## ⛔ CRITICAL: Work Content Protection (最重要！)

**NEVER modify work content (titles, descriptions, credits, tools, links) without EXPLICIT user instruction.**

**Enforcement**:
- ❌ **FORBIDDEN**: Changing work titles (even translation or simplification)
- ❌ **FORBIDDEN**: Rewriting or summarizing work descriptions
- ❌ **FORBIDDEN**: Modifying credits, tools, or any work metadata
- ❌ **FORBIDDEN**: Inventing or approximating content when data is incomplete
- ✅ **REQUIRED**: Always read from original HTML files for accurate work information
- ✅ **REQUIRED**: Copy exact text, including HTML tags, line breaks, and formatting

**When implementing features involving work data**:
1. Read original HTML files first
2. Extract exact content without modification
3. Preserve all formatting (including `<br>`, `<ul>`, `<li>`, etc.)
4. If data is missing, ask user rather than inventing it

**Violation recorded**: Session 12 (2025-11-17) - User explicitly prohibited content modification after discovering unauthorized changes to work titles and descriptions.

---

## 🚀 Session Initialization (重要！)

**新しいセッションを開始したら、必ず最初に以下を実行してください：**

1. `.claude/work_state.json`を読み込んで前回の作業状態を把握
2. ユーザーに以下を簡潔に報告：
   - 完了したタスク数
   - 進行中のタスク
   - 次に推奨するアクション
3. 提案された改善項目（18項目）の現在のステータス

これにより、セッションごとにスムーズに作業を継続できます。

## 🎨 Multi-Perspective Approach (重要！)

**全ての分析・改善提案は、3つの専門的視点から並列的に検討してください：**

### 1. 👨‍🎨 Web Designer Perspective (Webデザイナー視点)
- **ビジュアル階層**: 情報の優先順位が視覚的に明確か
- **美学とブランディング**: 統一感のあるデザイン言語
- **タイポグラフィ**: フォント選択、サイズ、行間、可読性
- **カラー理論**: 配色の調和、コントラスト、アクセシビリティ
- **レイアウトバランス**: 余白の使い方、視覚的な重さの配分
- **デザイン一貫性**: 全ページでの統一感

### 2. 🧑‍💼 UI/UX Designer Perspective (UI/UXデザイナー視点)
- **ユーザーフロー**: 目的達成までの導線が明確か
- **ナビゲーション**: 直感的でわかりやすいか
- **インタラクション**: クリック/ホバー時のフィードバック
- **アクセシビリティ**: 全ユーザーが使えるか（WCAG準拠）
- **レスポンシブ体験**: モバイル/タブレット/デスクトップでの最適化
- **情報アーキテクチャ**: コンテンツの整理と発見性
- **ユーザビリティ**: 認知負荷、学習曲線、エラー防止

### 3. 👨‍💻 Web Developer Perspective (Web開発者視点)
- **パフォーマンス最適化**: 読み込み速度、バンドルサイズ
- **コード品質**: 保守性、再利用性、可読性
- **ブラウザ互換性**: クロスブラウザ対応
- **SEO**: メタタグ、構造化データ、セマンティックHTML
- **セキュリティ**: XSS、CSRF、依存関係の脆弱性
- **技術標準**: HTML5/CSS3/ES6+の適切な使用
- **スケーラビリティ**: 将来の拡張性

### 🚀 並列分析の実行方法

**大きな改善提案時は、Taskツールで3つのエージェントを並列起動してください：**

```javascript
// 例：セッション開始時の総合分析
Task({
  subagent_type: "general-purpose",
  description: "Web Designer analysis",
  prompt: "Analyze site from Web Designer perspective: visual hierarchy, typography, color theory, layout balance, design consistency"
})

Task({
  subagent_type: "general-purpose",
  description: "UI/UX Designer analysis",
  prompt: "Analyze site from UI/UX Designer perspective: user flow, navigation, accessibility, responsive experience, information architecture"
})

Task({
  subagent_type: "general-purpose",
  description: "Web Developer analysis",
  prompt: "Analyze site from Web Developer perspective: performance, code quality, browser compatibility, SEO, security, technical standards"
})
```

結果を統合し、優先順位付けした総合的な改善提案を行ってください。

### 📋 適用タイミング

- **セッション開始時**: 現状分析（必要に応じて）
- **新機能提案時**: 3視点から実装方法を検討
- **問題解決時**: 根本原因を多角的に分析
- **レビュー時**: 変更の影響を包括的に評価

## 📝 Session End Work Log (重要！)

**重要な作業セッションの終了時には、以下を実行してください：**

1. `work_log/YYYY-MM-DD_session-NN.md`形式でワークログを作成
2. 以下の内容を含める：
   - セッションサマリー
   - 完了したタスク一覧
   - 変更統計（ファイル数、追加/削除行数）
   - Gitコミット履歴
   - 技術的詳細
   - 次のステップ提案
3. `.claude/work_state.json`を更新して作業履歴を記録
4. 全てをGitにコミット＆プッシュ

**ワークログの目的：**
- 後から作業内容を振り返れるようにする
- 会話ログ（Conversation_Summary/）とは別に、技術的な作業ログを残す
- work_log/はGit管理下に置き、リポジトリに含める

---

## Project Overview

This is a static portfolio website for Ryo Simon (Ryo Nishikado), hosted on GitHub Pages. The site showcases creative coding works, design projects, and interactive media art. It's a pure HTML/CSS/JavaScript site with no build process.

## Repository Structure

```
/
├── index.html              # Homepage with p5.js animation background
├── about/                  # About page with profile images (Swiper carousel)
├── works/                  # Individual project pages (~40+ HTML files)
├── Gallery/                # Gallery of embedded Neort.io artworks
├── portfolio/              # Portfolio PDF viewer page
├── contact/                # Contact page
├── cv/                     # CV/Resume page
├── dev/                    # Development/test pages (e.g., AR.js experiments)
├── css/                    # Stylesheets
│   ├── style.css          # Homepage styles
│   ├── style_2.css        # Subpage styles
│   ├── images.css         # Image gallery styles
│   └── swiper/            # Swiper carousel styles
├── js/                     # JavaScript libraries and custom code
│   ├── p5.js/             # p5.js library and custom sketches
│   │   ├── sketch_1.js    # Homepage animation (rotating 3D boxes)
│   │   ├── sketch_2.js    # Alternative sketch
│   │   └── sketch_3.js    # Subpage background animation
│   ├── swiper/            # Swiper carousel library
│   └── sample.js          # jQuery utilities
├── image/                  # Project images and thumbnails
└── favicons/              # Favicon assets
```

## Technology Stack

- **No build tools**: Pure HTML/CSS/JavaScript, no bundlers or preprocessors
- **p5.js**: Creative coding library for animated backgrounds (3D WebGL sketches)
- **Swiper.js**: Touch slider/carousel library for image galleries
- **jQuery 1.12.4**: DOM manipulation utilities
- **A-Frame + AR.js**: Experimental AR features in dev/ folder
- **External embeds**: Neort.io iframes for Gallery page

## Development Workflow

### Viewing the Site Locally

Since this is a static site, you can use any local web server:

```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (if http-server is installed)
npx http-server -p 8000
```

Then open `http://localhost:8000` in a browser.

### File Editing

- HTML files can be edited directly
- CSS files in `css/` directory control styling
- p5.js sketches in `js/p5.js/` control background animations
- No compilation or build step needed

### Testing Changes

After editing files, simply refresh the browser. No build process required.

## Key Architecture Patterns

### Page Layout Structure

All pages follow a consistent two-column layout:
- **#zentai**: Outer container wrapping entire page
- **#content**: Main content area (left/center)
- **#menu**: Fixed sidebar navigation (right side)

The sidebar (#menu) contains:
- Site title/logo
- Navigation links (About, Works, Gallery, Contact, Portfolio)
- Social media links (Twitter, Facebook, Instagram, GitHub)
- Last update date
- Copyright notice

### CSS Styling Approach

- `style.css`: Used for homepage (index.html)
- `style_2.css`: Used for all subpages
- `images.css`: Image gallery/thumbnail styles for Works page
- Japanese font stack prioritizes Hiragino Kaku Gothic Pro

### p5.js Sketch System

Three sketch files serve different pages:
- `sketch_1.js`: Homepage - 3D rotating box grid with pulsing animation
- `sketch_2.js`: Alternative animation (not currently used)
- `sketch_3.js`: Subpage background animation

All sketches:
- Use WEBGL renderer for 3D graphics
- Positioned absolutely with z-index: -999 for background effect
- Include `windowResized()` handler for responsive canvas

### Works Page Pattern

The works listing page (`works/works.html`) uses:
- Grid of thumbnail images wrapped in `.img_wrap` divs
- Each thumbnail links to individual project detail pages
- Filter links at top (All/Code/Object/Design) - currently non-functional

Individual work pages in `works/*.html`:
- Follow same layout structure as other pages
- May include Swiper carousels, embedded videos, or custom content
- Image assets stored in corresponding `image/[project-name]/` folders

## Common Tasks

### Adding a New Work/Project

1. Create new HTML file in `works/` directory (e.g., `works/newproject.html`)
2. Copy structure from existing work page as template
3. Add project images to `image/newproject/` folder
4. Add thumbnail entry to `works/works.html`:
   ```html
   <div class="img_wrap" align="center">
       <a href="./newproject.html">
           <img src="../image/newproject/thumbnail.jpg">
       </a>
   </div>
   ```
5. Update "Last Update" date in sidebar menu

### Modifying Background Animation

Edit the appropriate sketch file in `js/p5.js/`:
- Homepage: `sketch_1.js`
- Other pages: `sketch_3.js`

Variables to adjust:
- `bn`: Number of boxes
- `bs`: Box size
- `bm`: Box margin/spacing
- Animation speed: Adjust frameCount divisor (e.g., `frameCount / 150`)

### Adding Image Carousel

Pages using Swiper carousel need:
1. Include Swiper CSS in `<head>`:
   ```html
   <link rel="stylesheet" href="../css/swiper/swiper.css">
   ```
2. Include Swiper JS before closing `</body>`:
   ```html
   <script src="../js/swiper/swiper.js"></script>
   ```
3. HTML structure:
   ```html
   <div class="swiper-container">
       <div class="swiper-wrapper">
           <div class="swiper-slide"><!-- content --></div>
       </div>
       <div class="swiper-button-prev"></div>
       <div class="swiper-button-next"></div>
   </div>
   ```
4. Initialize in JS or use `ownoption.js` for default config

## Deployment

This site is hosted on GitHub Pages. To deploy changes:

```bash
# Add and commit changes
git add .
git commit -m "Description of changes"

# Push to master branch (GitHub Pages serves from master)
git push origin master
```

Changes will be live at `https://ryo-simon-mf.github.io/` within a few minutes.

## Important Notes

- **No build/compile step**: All files are served as-is
- **Relative paths**: HTML files use relative paths (`../css/`, `./works/`) - be mindful when moving files
- **Japanese content**: Site is primarily in Japanese with some English
- **External dependencies**: Libraries loaded via CDN (jQuery) or local copies (p5.js, Swiper)
- **dev/ folder**: Contains experimental features (AR.js tests) - not linked from main navigation
- **Browser compatibility**: p5.js WebGL sketches require modern browser with WebGL support
