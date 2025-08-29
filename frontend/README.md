# ブロック崩しゲーム - フロントエンド実装

## 概要

このディレクトリには、ブロック崩しゲームのフロントエンド実装が含まれています。
HTML5 Canvas、Vanilla JavaScript、CSS3を使用したモダンなWebゲームです。

## ファイル構成

```
frontend/src/
├── index.html          # 設定画面
├── game.html           # ゲーム画面
├── gameover.html       # 結果画面
├── css/
│   └── styles.css      # 共通スタイル
├── js/
│   ├── common.js       # 共通機能・ユーティリティ
│   ├── settings.js     # 設定画面ロジック
│   ├── game.js         # ゲームエンジン
│   └── gameover.js     # 結果画面ロジック
└── assets/             # リソース（画像・音声等）
```

## 機能一覧

### ✅ 実装済み機能
- **設定画面**: 難易度調整（距離・速度）、設定保存・復元
- **ゲーム画面**: Canvas描画、物理演算、当たり判定、ゲームループ
- **結果画面**: 統計表示、アニメーション、再プレイ機能
- **共通機能**: データ管理、画面遷移、ユーティリティ関数

### 🎮 ゲーム機能
- リアルタイム物理演算
- マウス・キーボード操作対応
- 5行8列のカラフルなブロック配置
- パーティクルエフェクト
- スコアシステム・ライフ管理
- 一時停止機能

### 🎨 デザイン機能
- Material Design風のポップなUI
- レスポンシブ対応
- CSS3アニメーション・トランジション
- グラデーション・エフェクト

## 開発・テスト方法

### 1. 開発サーバーの起動

```bash
# フロントエンドディレクトリに移動
cd frontend/src

# Python 3の場合
python3 -m http.server 8080

# Python 2の場合
python -m SimpleHTTPServer 8080

# Node.jsがある場合
npx serve -p 8080
```

### 2. ブラウザでアクセス

```
http://localhost:8080
```

### 3. 動作確認手順

1. **設定画面テスト**
   - スライダー操作で値が変更されるか
   - 設定保存・復元が正常に動作するか
   - ゲーム開始ボタンでゲーム画面に遷移するか

2. **ゲーム画面テスト**
   - マウス・キーボード操作が正常に動作するか
   - ボールとパドル・ブロックの当たり判定が正確か
   - スコア・ライフの表示更新が正常か
   - 一時停止機能が正常に動作するか

3. **結果画面テスト**
   - ゲーム結果が正確に表示されるか
   - 統計情報・進捗バーが正常に表示されるか
   - 再プレイ・設定変更ボタンが正常に動作するか

## 技術仕様

### フロントエンド技術スタック
- **HTML5**: セマンティックマークアップ、Canvas API
- **CSS3**: Flexbox/Grid、アニメーション、レスポンシブデザイン
- **JavaScript (ES6+)**: モジュール、クラス、非同期処理

### ブラウザ対応
- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

### パフォーマンス要件
- 60FPSでの滑らかなゲーム動作
- 初期読み込み時間 < 3秒
- メモリ使用量 < 50MB

## デバッグ・開発ツール

### 1. コンソールログ
各画面でコンソールログを出力しています：
```javascript
// ブラウザの開発者ツール（F12）で確認可能
console.log('設定画面の初期化完了', settings);
console.log('ゲーム開始 - 設定:', gameSettings);
console.log('ゲーム終了', result);
```

### 2. デバッグ機能
- **結果画面**: `Ctrl+T`キーで勝敗切り替え
- **FPS表示**: ゲーム画面右上に表示
- **設定値確認**: ブラウザのlocalStorageで確認可能

### 3. 開発者向けショートカット
```javascript
// ブラウザコンソールで実行可能
localStorage.clear(); // 設定データクリア
console.log(SettingsManager.load()); // 現在の設定表示
```

## カスタマイズ・拡張方法

### 1. ゲーム設定の変更
`js/common.js`の`DEFAULT_SETTINGS`を編集：
```javascript
const DEFAULT_SETTINGS = {
    paddleBlockDistance: 100,  // ブロックとパドルの距離
    ballSpeed: 3.0            // ボール速度
};
```

### 2. ブロック配置のカスタマイズ
`js/game.js`の`createBlocks()`メソッドを編集：
```javascript
const rows = 5;        // 行数
const cols = 8;        // 列数
const colors = [...];  // 色配列
```

### 3. スタイルテーマの変更
`css/styles.css`のカラーパレットを編集：
```css
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --success-color: #27ae60;
    --danger-color: #e74c3c;
}
```

## トラブルシューティング

### よくある問題

1. **ゲームが開始されない**
   - ブラウザコンソールでエラーを確認
   - localStorage の設定データを確認
   - Canvas要素が正常に取得されているか確認

2. **画面遷移が動作しない**
   - ネットワークタブで404エラーを確認
   - ファイルパスが正しいか確認
   - HTTPサーバーが起動しているか確認

3. **スタイルが適用されない**
   - CSSファイルのパスが正しいか確認
   - ブラウザキャッシュをクリア
   - 開発者ツールのネットワークタブでCSSの読み込み状況を確認

### パフォーマンス最適化

1. **ゲームループの最適化**
```javascript
// 重い処理は条件分岐で制限
if (frameCount % 60 === 0) {
    // 1秒に1回実行される処理
    updateFpsDisplay();
}
```

2. **メモリリークの防止**
```javascript
// イベントリスナーのクリーンアップ
window.addEventListener('beforeunload', () => {
    gameEngine?.destroy();
});
```

## 本番環境デプロイ

### 静的ホスティング
- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront

### 最適化チェックリスト
- [ ] CSS/JS の圧縮（minify）
- [ ] 画像の最適化・圧縮
- [ ] GZIP圧縮の有効化
- [ ] キャッシュヘッダーの設定
- [ ] HTTPS の有効化

## ライセンス

このプロジェクトは教育目的で作成されています。