# 設備計算ポケット

設備技術者・施工管理・営業担当者向けの、現場ですぐ使える設備計算Webアプリ。

## コマンド

- 起動: `PATH="$(pwd)/../_tools/node-v24.14.0-darwin-arm64/bin:$PATH" npm run dev`
- 型検査: `PATH="$(pwd)/../_tools/node-v24.14.0-darwin-arm64/bin:$PATH" npm run typecheck`
- テスト: `PATH="$(pwd)/../_tools/node-v24.14.0-darwin-arm64/bin:$PATH" npm test`

## 構成

- `src/lib/` … UI非依存の設備計算ロジックとツール定義
- `src/components/` … 各計算ツールと共通UI
- `tests/` … 代表的な計算値・単位換算の回帰テスト

## 守ること

- 計算式はUIから分離し、単位と前提条件をコードコメントに残す。
- 入力不足・範囲外・計算不能の条件を画面で明示する。
- 計算結果は概算・確認用途であることを表示し、設計判断を代替しない。
- コード変更後は型検査とテストを通す。秘密情報・生成物はコミットしない。
