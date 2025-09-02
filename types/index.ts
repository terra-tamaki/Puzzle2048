/**
 * ===== 型定義同期ルール =====
 *
 * 【基本原則】一方の/types/index.tsを更新したら、もう一方の/types/index.tsも必ず同じ内容に更新する
 *
 * 【変更の責任】
 * - 型定義を変更した開発者は、両方のファイルを即座に同期させる
 * - 1つのtypes/index.tsの更新は禁止。必ず1つを更新したらもう一つも更新その場で行う。
 *
 * 【絶対に守るべき原則】
 * 1. フロントエンドとバックエンドで異なる型を作らない
 * 2. 同じデータ構造に対して複数の型を作らない
 * 3. 新しいプロパティは必ずオプショナルとして追加
 * 4. APIパスは必ずこのファイルで一元管理する
 * 5. コード内でAPIパスをハードコードしない
 * 6. 2つの同期されたtypes/index.tsを単一の真実源とする
 * 7. 大規模リファクタリングの時は型変更を最初に行い早期に問題検出
 */

// ========================================
// ゲーム設定関連の型定義
// ========================================

/**
 * ゲーム設定オブジェクト
 */
export interface GameSettings {
  /** ブロックとパドル間の距離（px）: 50-200 */
  paddleBlockDistance: number;
  /** ボール速度: 1.0-5.0 */
  ballSpeed: number;
}

/**
 * 難易度レベル
 */
export type DifficultyLevel = 'やさしい' | 'ふつう' | '難しい' | 'カスタム';

// ========================================
// ゲーム状態関連の型定義
// ========================================

/**
 * 2D座標
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * 2D速度ベクトル
 */
export interface Velocity {
  vx: number;
  vy: number;
}

/**
 * 矩形サイズ
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * ボールオブジェクト
 */
export interface BallState extends Position, Velocity {
  /** 半径（px） */
  radius: number;
  /** 最大速度制限 */
  maxSpeed: number;
  /** 最小速度制限 */
  minSpeed: number;
}

/**
 * パドルオブジェクト
 */
export interface PaddleState extends Position, Size {
  /** 目標X座標（マウス追従用） */
  targetX: number;
  /** 移動速度（補間用） */
  velocity: number;
  /** キーボード移動速度 */
  keyboardMoveSpeed: number;
}

/**
 * ブロックオブジェクト
 */
export interface BlockState extends Position, Size {
  /** ブロック色（HEXカラー） */
  color: string;
  /** 行番号（1-5） */
  row: number;
  /** 列番号（0-7） */
  col: number;
  /** 破壊状態 */
  destroyed: boolean;
  /** 獲得ポイント */
  points: number;
  /** 破壊アニメーション用の透明度 */
  opacity?: number;
  /** 破壊アニメーション用のスケール */
  scale?: number;
}

/**
 * パーティクルオブジェクト
 */
export interface ParticleState extends Position, Velocity {
  /** パーティクル色 */
  color: string;
  /** 生存時間（0.0-1.0） */
  life: number;
  /** 減衰率 */
  decay: number;
}

/**
 * ゲーム状態オブジェクト
 */
export interface GameState {
  /** 現在のスコア */
  score: number;
  /** 残りライフ数 */
  lives: number;
  /** 現在のレベル */
  level: number;
  /** 一時停止状態 */
  isPaused: boolean;
  /** ゲーム開始状態 */
  isGameStarted: boolean;
  /** ゲーム終了状態 */
  isGameOver: boolean;
  /** ゲーム開始時刻（UnixTime） */
  startTime: number | null;
  /** 経過ゲーム時間（ミリ秒） */
  gameTime: number;
}

// ========================================
// ゲーム結果関連の型定義
// ========================================

/**
 * ゲーム結果オブジェクト
 */
export interface GameResult {
  /** 勝利/敗北フラグ */
  isVictory: boolean;
  /** 最終スコア */
  finalScore: number;
  /** プレイ時間（MM:SS形式） */
  playTime: string;
  /** 破壊したブロック数 */
  blocksDestroyed: number;
  /** 総ブロック数 */
  totalBlocks: number;
  /** 残りライフ数 */
  remainingLives: number;
  /** 難易度レベル */
  difficulty: DifficultyLevel;
}

/**
 * プレイ統計
 */
export interface PlayStatistics {
  /** ブロック破壊率（%） */
  destructionRate: number;
  /** 平均プレイ時間（秒） */
  averagePlayTime: number;
  /** 最高スコア */
  highScore: number;
  /** プレイ回数 */
  playCount: number;
}

// ========================================
// UI関連の型定義
// ========================================

/**
 * アニメーション状態
 */
export interface AnimationState {
  /** アニメーションID */
  id: string;
  /** アニメーションフレームID */
  frameId: number;
  /** 開始時刻 */
  startTime: number;
  /** アニメーション持続時間 */
  duration: number;
}

/**
 * キーボード入力状態
 */
export interface KeyboardState {
  /** 左矢印キー */
  left: boolean;
  /** 右矢印キー */
  right: boolean;
  /** スペースキー */
  space: boolean;
  /** エスケープキー */
  escape: boolean;
}

// ========================================
// 定数とENUM
// ========================================

/**
 * ゲーム定数
 */
export const GAME_CONSTANTS = {
  /** キャンバスサイズ */
  CANVAS: {
    WIDTH: 800,
    HEIGHT: 600
  },
  /** ボール設定 */
  BALL: {
    RADIUS: 10,
    MIN_SPEED: 2,
    MAX_SPEED: 8
  },
  /** パドル設定 */
  PADDLE: {
    WIDTH: 120,
    HEIGHT: 15,
    BOTTOM_MARGIN: 50
  },
  /** ブロック設定 */
  BLOCKS: {
    ROWS: 5,
    COLS: 8,
    WIDTH: 80,
    HEIGHT: 30,
    SPACING: 5,
    TOP_MARGIN: 80
  },
  /** ゲーム設定の範囲 */
  SETTINGS_RANGE: {
    DISTANCE: { MIN: 50, MAX: 200, DEFAULT: 100 },
    SPEED: { MIN: 1.0, MAX: 5.0, DEFAULT: 3.0 }
  },
  /** 初期ライフ数 */
  INITIAL_LIVES: 3
} as const;

/**
 * ブロック色定義
 */
export const BLOCK_COLORS = [
  '#e74c3c', // 赤（1行目）
  '#f39c12', // オレンジ（2行目）
  '#f1c40f', // 黄（3行目）
  '#27ae60', // 緑（4行目）
  '#3498db'  // 青（5行目）
] as const;

/**
 * ローカルストレージキー
 */
export const STORAGE_KEYS = {
  GAME_SETTINGS: 'gameSettings',
  GAME_RESULT: 'gameResult',
  HIGH_SCORE: 'highScore'
} as const;

// ========================================
// API関連の型定義（将来拡張用）
// ========================================

/**
 * APIレスポンス基底型
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

/**
 * ゲーム設定API（将来のサーバー連携用）
 */
export interface SettingsApiEndpoints {
  GET: '/api/settings';
  POST: '/api/settings';
  PUT: '/api/settings';
}

/**
 * ハイスコアAPI（将来のサーバー連携用）
 */
export interface HighScoreApiEndpoints {
  GET: '/api/highscores';
  POST: '/api/highscores';
}

// ========================================
// ユーティリティ型
// ========================================

/**
 * 部分的な更新用型
 */
export type PartialGameState = Partial<GameState>;
export type PartialGameSettings = Partial<GameSettings>;

/**
 * 読み取り専用ゲーム状態
 */
export type ReadonlyGameState = Readonly<GameState>;

/**
 * 必須プロパティのみを抽出
 */
export type RequiredGameSettings = Required<GameSettings>;

/**
 * HTMLイベント型エイリアス
 */
export type MouseEventHandler = (event: MouseEvent) => void;
export type KeyboardEventHandler = (event: KeyboardEvent) => void;
export type ClickEventHandler = (event: MouseEvent) => void;