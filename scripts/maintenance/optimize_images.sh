#!/bin/bash

###############################################################################
# 画像最適化スクリプト - Worksページのサムネイル最適化
#
# このスクリプトは：
# 1. サムネイル用に適切なサイズにリサイズ（1200px幅、Retina対応）
# 2. JPEG品質85%で最適化（視覚的な劣化なし）
# 3. オリジナルファイルは .original フォルダにバックアップ
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
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}  画像最適化スクリプト - Worksページサムネイル${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""

# ImageMagickのチェック
if ! command -v convert &> /dev/null; then
    echo -e "${RED}エラー: ImageMagickがインストールされていません${NC}"
    echo "以下のコマンドでインストールしてください："
    echo "  brew install imagemagick"
    exit 1
fi

# プロジェクトルートに移動
cd "$(dirname "$0")/../.."

# 最適化対象の画像リスト（特に大きいファイル）
declare -a IMAGES=(
    "image/theplotecho/theplotecho_1.png"
    "image/VariableFlavorRemix/VariableFlavorRemix_01.png"
    "image/toki-shirube/tokishirube01.png"
    "image/playingtokyo/playingtokyo_1.png"
    "image/mutek_jp_2020/mutek_jp_2020_1.png"
    "image/motioncrossfader/motioncrossfader_1.png"
    "image/ATYD/ATYD_1.png"
)

# サムネイル最適化設定
THUMBNAIL_WIDTH=1200  # Retina対応（表示480px × 2.5）
JPEG_QUALITY=85       # 視覚的な劣化なし

TOTAL_BEFORE=0
TOTAL_AFTER=0

echo -e "${YELLOW}最適化設定：${NC}"
echo "  - リサイズ幅: ${THUMBNAIL_WIDTH}px（Retina対応）"
echo "  - JPEG品質: ${JPEG_QUALITY}%（業界標準）"
echo "  - オリジナル: .originalフォルダにバックアップ"
echo ""

# 各画像を最適化
for img in "${IMAGES[@]}"; do
    if [ ! -f "$img" ]; then
        echo -e "${YELLOW}スキップ: $img (ファイルが見つかりません)${NC}"
        continue
    fi

    # ファイル情報取得
    SIZE_BEFORE=$(stat -f%z "$img")
    TOTAL_BEFORE=$((TOTAL_BEFORE + SIZE_BEFORE))

    # ディレクトリとファイル名を分離
    DIR=$(dirname "$img")
    FILENAME=$(basename "$img")
    BASENAME="${FILENAME%.*}"
    EXT="${FILENAME##*.}"

    # .originalフォルダ作成
    mkdir -p "$DIR/.original"

    # オリジナルをバックアップ
    if [ ! -f "$DIR/.original/$FILENAME" ]; then
        cp "$img" "$DIR/.original/$FILENAME"
        echo -e "${GREEN}✓ バックアップ: $DIR/.original/$FILENAME${NC}"
    fi

    echo -e "${BLUE}処理中: $img${NC}"
    echo "  元のサイズ: $(numfmt --to=iec-i --suffix=B $SIZE_BEFORE)"

    # 画像の現在の幅を取得
    CURRENT_WIDTH=$(identify -format "%w" "$img")

    # リサイズ＆最適化（PNGはJPEGに変換）
    if [ "$EXT" = "png" ]; then
        # PNG → JPEG変換 + リサイズ + 最適化
        NEW_FILE="$DIR/${BASENAME}.jpg"

        if [ $CURRENT_WIDTH -gt $THUMBNAIL_WIDTH ]; then
            convert "$img" \
                -resize "${THUMBNAIL_WIDTH}x>" \
                -quality $JPEG_QUALITY \
                -sampling-factor 4:2:0 \
                -interlace Plane \
                "$NEW_FILE"
        else
            convert "$img" \
                -quality $JPEG_QUALITY \
                -sampling-factor 4:2:0 \
                -interlace Plane \
                "$NEW_FILE"
        fi

        # 元のPNGを削除
        rm "$img"
        img="$NEW_FILE"

        echo -e "${GREEN}  → JPEG変換完了${NC}"
    else
        # JPEGの場合はリサイズ＋最適化のみ
        TEMP_FILE="${img}.tmp.jpg"

        if [ $CURRENT_WIDTH -gt $THUMBNAIL_WIDTH ]; then
            convert "$img" \
                -resize "${THUMBNAIL_WIDTH}x>" \
                -quality $JPEG_QUALITY \
                -sampling-factor 4:2:0 \
                -interlace Plane \
                "$TEMP_FILE"
        else
            convert "$img" \
                -quality $JPEG_QUALITY \
                -sampling-factor 4:2:0 \
                -interlace Plane \
                "$TEMP_FILE"
        fi

        mv "$TEMP_FILE" "$img"
    fi

    # 最適化後のサイズ
    SIZE_AFTER=$(stat -f%z "$img")
    TOTAL_AFTER=$((TOTAL_AFTER + SIZE_AFTER))
    REDUCTION=$((100 - (SIZE_AFTER * 100 / SIZE_BEFORE)))

    echo "  最適化後: $(numfmt --to=iec-i --suffix=B $SIZE_AFTER)"
    echo -e "${GREEN}  削減率: ${REDUCTION}%${NC}"
    echo ""
done

# 合計結果
echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}  最適化完了！${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""
echo "合計サイズ削減："
echo "  最適化前: $(numfmt --to=iec-i --suffix=B $TOTAL_BEFORE)"
echo "  最適化後: $(numfmt --to=iec-i --suffix=B $TOTAL_AFTER)"
TOTAL_REDUCTION=$((100 - (TOTAL_AFTER * 100 / TOTAL_BEFORE)))
echo -e "${GREEN}  削減率: ${TOTAL_REDUCTION}%${NC}"
echo ""
echo -e "${YELLOW}注意: works.htmlでPNG→JPEGに変更した画像の拡張子を更新してください${NC}"
echo ""
