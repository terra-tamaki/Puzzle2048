# 🎮 Puzzle2048

美しいアニメーションとカラフルなデザインの2048パズルゲーム

## ✨ 機能

- **4段階の難易度**: Easy(4×4) → Normal(5×5) → Hard(6×6) → Expert(8×8)
- **美しいアニメーション**: 60FPS滑らかな移動・合体エフェクト
- **音響システム**: タイル値に応じた音階制御
- **振り返り機能**: 関西弁アドバイス付き結果画面
- **レスポンシブデザイン**: PC・モバイル完全対応
- **設定システム**: 音量・アニメーション・ゲームプレイ設定

## 🎯 プレイ方法

### 基本操作
- **矢印キー**: タイル移動
- **R**: リスタート
- **ESC**: 一時停止
- **M**: ミュート切り替え
- **⚙️ボタン**: 設定画面

### ゲームルール
1. 矢印キーでタイルを移動
2. 同じ数字のタイルを合体させて大きな数字を作る
3. 目標タイル（難易度別: 2048/4096/8192/16384）を目指す
4. グリッドが埋まって移動できなくなるとゲームオーバー

## 🚀 デプロイメント

### GitHub Pages
```bash
git add .
git commit -m "Deploy Puzzle2048"
git push origin main
```

### ローカル開発
```bash
python3 -m http.server 8000
# http://localhost:8000 でアクセス
```

## 🏗️ 技術構成

- **フロントエンド**: Vanilla JavaScript (ES6+)
- **アニメーション**: CSS Animations + JavaScript制御
- **音響**: Web Audio API
- **デザイン**: Material Design風
- **レスポンシブ**: CSS Grid + Flexbox

## 📁 ファイル構成

```
/
├── index.html          # メインゲーム画面
├── settings.html       # 設定画面
├── result.html         # 結果画面
├── css/
│   ├── puzzle2048-styles.css  # メインスタイル
│   ├── settings-styles.css    # 設定画面スタイル
│   └── result-styles.css      # 結果画面スタイル
└── js/
    ├── game-engine.js         # ゲームロジック
    ├── ui-controller.js       # UI制御
    ├── animation-controller.js # アニメーション制御
    ├── audio-manager.js       # 音響管理
    ├── settings-controller.js # 設定管理
    └── result-controller.js   # 結果画面制御
```

## 🎓 学習目的

BlueLamp学習プラットフォームの一環として、以下のスキル向上を目指します：
- **集中力**: 論理的思考でタイル配置を計画
- **戦略性**: 効率的な合体パターンの発見
- **忍耐力**: 継続的なチャレンジ精神

## 📊 統計・分析

ゲーム終了後に以下の詳細分析を提供：
- スコア効率性分析
- プレイパターン評価
- 改善アドバイス（関西弁）
- 難易度別ランキング

---

**Generated with BlueLamp - 集中力と論理思考を鍛える学習プラットフォーム**