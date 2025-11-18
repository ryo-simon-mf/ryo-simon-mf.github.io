#!/bin/bash

###############################################################################
# WebP変換スクリプト - Worksページのサムネイル最適化
#
# このスクリプトは：
# 1. サムネイル用に適切なサイズにリサイズ（1200px幅、Retina対応）
# 2. WebP形式に変換（JPEG/PNGより30-50%小さい）
# 3. 品質85（視覚的な劣化なし）
# 4. オリジナルファイルは .original フォルダにバックアップ
#
# 必要なツール：
# - ImageMagick（brew install imagemagick）
###############################################################################

set -e  # エラーで停止

# カラー出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}  WebP変換スクリプト - Worksページサムネイル${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""

# ImageMagickのチェック
if ! command -v convert &> /dev/null; then
    echo -e "${RED}エラー: ImageMagickがインストールされていません${NC}"
    echo ""
    echo "以下のコマンドでインストールしてください："
    echo -e "${CYAN}brew install imagemagick${NC}"
    echo ""
    exit 1
fi

# プロジェクトルートに移動
cd "$(dirname "$0")/../.."

# works.htmlからサムネイル画像のパスを抽出
echo -e "${YELLOW}works.htmlからサムネイル画像を抽出中...${NC}"
THUMBNAIL_IMAGES=$(grep -o 'data-src="../image/[^"]*"' works/works.html | sed 's/data-src="\.\.\/image\///' | sed 's/"//' | sort)

# 配列に変換
IFS=$'\n' read -r -d '' -a IMAGE_ARRAY <<< "$THUMBNAIL_IMAGES" || true

THUMBNAIL_COUNT=${#IMAGE_ARRAY[@]}
echo -e "${GREEN}✓ ${THUMBNAIL_COUNT}個のサムネイル画像を検出${NC}"
echo ""

# WebP変換設定
THUMBNAIL_WIDTH=1200  # Retina対応（表示480px × 2.5）
WEBP_QUALITY=85       # 視覚的な劣化なし

TOTAL_BEFORE=0
TOTAL_AFTER=0
SUCCESS_COUNT=0
SKIP_COUNT=0

echo -e "${YELLOW}変換設定：${NC}"
echo "  - リサイズ幅: ${THUMBNAIL_WIDTH}px（Retina対応）"
echo "  - WebP品質: ${WEBP_QUALITY}%（業界標準）"
echo "  - オリジナル: .originalフォルダにバックアップ"
echo ""
echo -e "${CYAN}変換を開始します...${NC}"
echo ""

# 各画像をWebPに変換
for img_path in "${IMAGE_ARRAY[@]}"; do
    FULL_PATH="image/$img_path"

    if [ ! -f "$FULL_PATH" ]; then
        echo -e "${YELLOW}スキップ: $img_path (ファイルが見つかりません)${NC}"
        SKIP_COUNT=$((SKIP_COUNT + 1))
        continue
    fi

    # ファイル情報取得
    SIZE_BEFORE=$(stat -f%z "$FULL_PATH" 2>/dev/null || echo 0)
    TOTAL_BEFORE=$((TOTAL_BEFORE + SIZE_BEFORE))

    # ディレクトリとファイル名を分離
    DIR=$(dirname "$FULL_PATH")
    FILENAME=$(basename "$FULL_PATH")
    BASENAME="${FILENAME%.*}"
    EXT="${FILENAME##*.}"

    # WebPファイル名
    WEBP_FILE="$DIR/${BASENAME}.webp"

    # 既にWebPが存在する場合はスキップ
    if [ -f "$WEBP_FILE" ]; then
        echo -e "${YELLOW}スキップ: $img_path (WebPが既に存在)${NC}"
        SKIP_COUNT=$((SKIP_COUNT + 1))
        continue
    fi

    # .originalフォルダ作成
    mkdir -p "$DIR/.original"

    # オリジナルをバックアップ
    if [ ! -f "$DIR/.original/$FILENAME" ]; then
        cp "$FULL_PATH" "$DIR/.original/$FILENAME"
    fi

    echo -e "${BLUE}[$((SUCCESS_COUNT + 1))/${THUMBNAIL_COUNT}] 変換中: $img_path${NC}"
    echo "  元のサイズ: $(numfmt --to=iec-i --suffix=B $SIZE_BEFORE 2>/dev/null || echo "${SIZE_BEFORE}B")"

    # 画像の現在の幅を取得
    CURRENT_WIDTH=$(identify -format "%w" "$FULL_PATH" 2>/dev/null || echo 0)

    # WebPに変換（必要に応じてリサイズ）
    if [ $CURRENT_WIDTH -gt $THUMBNAIL_WIDTH ]; then
        convert "$FULL_PATH" \
            -resize "${THUMBNAIL_WIDTH}x>" \
            -quality $WEBP_QUALITY \
            "$WEBP_FILE" 2>/dev/null || {
                echo -e "${RED}  エラー: 変換失敗${NC}"
                continue
            }
    else
        convert "$FULL_PATH" \
            -quality $WEBP_QUALITY \
            "$WEBP_FILE" 2>/dev/null || {
                echo -e "${RED}  エラー: 変換失敗${NC}"
                continue
            }
    fi

    # 変換後のサイズ
    SIZE_AFTER=$(stat -f%z "$WEBP_FILE" 2>/dev/null || echo 0)
    TOTAL_AFTER=$((TOTAL_AFTER + SIZE_AFTER))

    if [ $SIZE_BEFORE -gt 0 ]; then
        REDUCTION=$((100 - (SIZE_AFTER * 100 / SIZE_BEFORE)))
    else
        REDUCTION=0
    fi

    echo "  WebPサイズ: $(numfmt --to=iec-i --suffix=B $SIZE_AFTER 2>/dev/null || echo "${SIZE_AFTER}B")"
    echo -e "${GREEN}  削減率: ${REDUCTION}%${NC}"
    echo ""

    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
done

# 合計結果
echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}  変換完了！${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""
echo "変換結果："
echo "  - 成功: ${SUCCESS_COUNT}個"
echo "  - スキップ: ${SKIP_COUNT}個"
echo "  - 合計: ${THUMBNAIL_COUNT}個"
echo ""
echo "ファイルサイズ削減："
echo "  最適化前: $(numfmt --to=iec-i --suffix=B $TOTAL_BEFORE 2>/dev/null || echo "${TOTAL_BEFORE}B")"
echo "  最適化後: $(numfmt --to=iec-i --suffix=B $TOTAL_AFTER 2>/dev/null || echo "${TOTAL_AFTER}B")"

if [ $TOTAL_BEFORE -gt 0 ]; then
    TOTAL_REDUCTION=$((100 - (TOTAL_AFTER * 100 / TOTAL_BEFORE)))
    echo -e "${GREEN}  削減率: ${TOTAL_REDUCTION}%${NC}"
fi

echo ""
echo -e "${YELLOW}次のステップ：${NC}"
echo "  1. works/works.htmlの画像パスを更新（.png/.jpg → .webp）"
echo "  2. ブラウザで動作確認"
echo "  3. 問題なければ、オリジナルファイルを削除可能"
echo ""
