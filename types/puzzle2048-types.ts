/**
 * Puzzle2048ゲーム 型定義ファイル
 * 
 * バージョン: 1.0.0
 * 最終更新日: 2025-09-02
 * 
 * このファイルは、Puzzle2048ゲームで使用される全ての型定義を一元管理します。
 * ゲーム状態、タイル、結果、音響制御、アニメーション制御の各モデルを定義します。
 */

// =============================================================================
// 基本型定義
// =============================================================================

/**
 * ゲーム方向の列挙型
 */
export type Direction = 'left' | 'right' | 'up' | 'down';

/**
 * ゲーム状態の列挙型
 */
export type GameStatus = 'playing' | 'won' | 'lost' | 'paused';

/**
 * タイルの値（2の累乗のみ有効）
 */
export type TileValue = 0 | 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096 | 8192;

// =============================================================================
// ゲーム状態モデル
// =============================================================================

/**
 * 個別タイルのデータ構造
 */
export interface Tile {
  /** タイルの値（0は空タイル） */
  value: TileValue;
  /** グリッド内の行位置（0-3） */
  row: number;
  /** グリッド内の列位置（0-3） */
  col: number;
  /** 新しく生成されたタイルかどうか */
  isNew: boolean;
  /** このターンで合体したタイルかどうか */
  justMerged: boolean;
  /** タイルの一意識別ID */
  id: string;
  /** 前回位置（アニメーション用） */
  previousRow?: number;
  /** 前回位置（アニメーション用） */
  previousCol?: number;
}

/**
 * ゲーム全体の状態管理
 */
export interface GameState {
  /** 4x4グリッドのタイル配置 */
  grid: (Tile | null)[][];
  /** 現在のスコア */
  score: number;
  /** ベストスコア */
  bestScore: number;
  /** 移動回数 */
  moves: number;
  /** ゲーム開始フラグ */
  gameStarted: boolean;
  /** ゲーム終了フラグ */
  gameOver: boolean;
  /** ゲーム状態 */
  status: GameStatus;
  /** ゲーム開始時刻 */
  startTime: number;
  /** 合体回数 */
  mergeCount: number;
  /** 到達した最高タイル */
  maxTile: TileValue;
  /** 前回の移動が有効だったか */
  lastMoveValid: boolean;
}

/**
 * ゲーム設定データ
 */
export interface GameSettings {
  /** 効果音の音量（0-1） */
  soundVolume: number;
  /** アニメーション速度（1-3） */
  animationSpeed: number;
  /** カラーテーマ */
  colorTheme: 'default' | 'dark' | 'colorful';
  /** 振動フィードバック有効/無効 */
  hapticFeedback: boolean;
}

// =============================================================================
// 結果・統計モデル
// =============================================================================

/**
 * プレイ結果の詳細データ
 */
export interface GameResult {
  /** 勝利フラグ（2048達成） */
  isVictory: boolean;
  /** 到達した最高タイル */
  maxTile: TileValue;
  /** 最終スコア */
  finalScore: number;
  /** 総移動回数 */
  moves: number;
  /** プレイ時間（フォーマット済み文字列） */
  playTime: string;
  /** プレイ時間（ミリ秒） */
  playTimeMs: number;
  /** 合体回数 */
  mergeCount: number;
  /** 効率性（スコア/手数） */
  efficiency: number;
  /** 平均移動時間（秒） */
  avgMoveTime: number;
  /** ゲーム終了時刻 */
  endTime: number;
  /** ベストスコア更新フラグ */
  isBestScore: boolean;
  /** スコア改善値 */
  scoreImprovement: number;
}

/**
 * プレイ履歴データ
 */
export interface GameHistory {
  /** プレイ記録のリスト */
  games: GameResult[];
  /** 総プレイ回数 */
  totalGames: number;
  /** 総プレイ時間 */
  totalPlayTime: number;
  /** 勝利回数 */
  victories: number;
  /** 平均スコア */
  averageScore: number;
  /** 最高記録達成日 */
  bestScoreDate: string;
}

// =============================================================================
// 音響制御モデル
// =============================================================================

/**
 * 効果音の種類
 */
export type SoundType = 'move' | 'merge' | 'invalid' | 'victory' | 'gameover' | 'newgame';

/**
 * 音響効果制御
 */
export interface AudioManager {
  /** 音量設定（0-1） */
  volume: number;
  /** ミュート状態 */
  muted: boolean;
  /** 効果音の再生 */
  playSound: (type: SoundType, tileValue?: TileValue) => void;
  /** 音量変更 */
  setVolume: (volume: number) => void;
  /** ミュート切り替え */
  toggleMute: () => void;
  /** 初期化 */
  initialize: () => Promise<void>;
}

/**
 * 音響効果の詳細設定
 */
export interface SoundConfig {
  /** 音響ファイルのパス */
  path: string;
  /** 基本音量（0-1） */
  baseVolume: number;
  /** ピッチ調整範囲 */
  pitchRange?: [number, number];
  /** 再生時間制限（ミリ秒） */
  maxDuration?: number;
}

// =============================================================================
// アニメーション制御モデル
// =============================================================================

/**
 * アニメーションの種類
 */
export type AnimationType = 'move' | 'merge' | 'appear' | 'disappear' | 'shake' | 'victory';

/**
 * アニメーション設定
 */
export interface AnimationConfig {
  /** アニメーション継続時間（ミリ秒） */
  duration: number;
  /** イージング関数 */
  easing: string;
  /** 遅延時間（ミリ秒） */
  delay?: number;
  /** 繰り返し回数 */
  iterations?: number;
}

/**
 * 視覚効果制御
 */
export interface AnimationController {
  /** アニメーション速度設定（1-3） */
  speed: number;
  /** タイル移動アニメーション */
  animateMove: (tile: Tile, fromRow: number, fromCol: number, toRow: number, toCol: number) => Promise<void>;
  /** タイル合体エフェクト */
  animateMerge: (tile: Tile) => Promise<void>;
  /** タイル出現アニメーション */
  animateAppear: (tile: Tile) => Promise<void>;
  /** スコア上昇エフェクト */
  animateScoreIncrease: (points: number, position: { x: number, y: number }) => Promise<void>;
  /** 勝利演出 */
  animateVictory: () => Promise<void>;
  /** グリッド振動エフェクト */
  animateShake: () => Promise<void>;
  /** アニメーション速度設定 */
  setSpeed: (speed: number) => void;
}

// =============================================================================
// UI状態管理モデル
// =============================================================================

/**
 * UI状態の管理
 */
export interface UIState {
  /** 現在表示中のページ */
  currentPage: 'game' | 'result';
  /** ローディング状態 */
  loading: boolean;
  /** エラー状態 */
  error: string | null;
  /** モーダル表示状態 */
  modalOpen: boolean;
  /** 設定パネル表示状態 */
  settingsOpen: boolean;
  /** タッチ操作の有効/無効 */
  touchEnabled: boolean;
}

/**
 * タッチジェスチャーの情報
 */
export interface TouchGesture {
  /** 開始位置 */
  startX: number;
  /** 開始位置 */
  startY: number;
  /** 終了位置 */
  endX: number;
  /** 終了位置 */
  endY: number;
  /** 方向 */
  direction: Direction | null;
  /** 距離 */
  distance: number;
}

// =============================================================================
// ゲームロジック関数型定義
// =============================================================================

/**
 * 移動ロジックの結果
 */
export interface MoveResult {
  /** 移動後のグリッド */
  newGrid: (Tile | null)[][];
  /** スコア増加値 */
  scoreIncrease: number;
  /** 移動が有効だったか */
  moved: boolean;
  /** 合体が発生したか */
  mergeOccurred: boolean;
  /** 合体したタイルのリスト */
  mergedTiles: Tile[];
}

/**
 * ゲーム操作関数の型定義
 */
export interface GameOperations {
  /** タイル移動処理 */
  move: (direction: Direction) => MoveResult;
  /** 新しいタイルの生成 */
  addRandomTile: () => Tile | null;
  /** ゲーム終了判定 */
  isGameOver: () => boolean;
  /** 勝利判定 */
  isVictory: () => boolean;
  /** ゲームリセット */
  resetGame: () => void;
  /** 状態保存 */
  saveState: () => void;
  /** 状態復元 */
  loadState: () => GameState | null;
}

// =============================================================================
// LocalStorage データ構造
// =============================================================================

/**
 * LocalStorageに保存するデータ構造
 */
export interface StorageData {
  /** ゲーム設定 */
  settings: GameSettings;
  /** ベストスコア */
  bestScore: number;
  /** プレイ履歴 */
  history: GameHistory;
  /** 最後のゲーム状態 */
  lastGameState?: GameState;
  /** 保存日時 */
  savedAt: number;
}

/**
 * LocalStorageキーの定数
 */
export const STORAGE_KEYS = {
  SETTINGS: 'puzzle2048_settings',
  BEST_SCORE: 'puzzle2048_best_score',
  HISTORY: 'puzzle2048_history',
  LAST_GAME: 'puzzle2048_last_game'
} as const;

// =============================================================================
// イベントシステム
// =============================================================================

/**
 * ゲームイベントの種類
 */
export type GameEventType = 
  | 'game_start'
  | 'game_end'
  | 'tile_move'
  | 'tile_merge'
  | 'score_update'
  | 'best_score_update'
  | 'victory_achieved'
  | 'settings_changed';

/**
 * ゲームイベントのデータ
 */
export interface GameEvent {
  /** イベントの種類 */
  type: GameEventType;
  /** イベントのペイロード */
  payload: any;
  /** イベント発生時刻 */
  timestamp: number;
}

/**
 * イベントリスナーの型
 */
export type GameEventListener = (event: GameEvent) => void;

// =============================================================================
// パフォーマンス・デバッグ用
// =============================================================================

/**
 * パフォーマンス測定データ
 */
export interface PerformanceMetrics {
  /** フレームレート */
  fps: number;
  /** 移動処理時間（ミリ秒） */
  moveProcessingTime: number;
  /** レンダリング時間（ミリ秒） */
  renderTime: number;
  /** メモリ使用量（概算） */
  memoryUsage: number;
}

/**
 * デバッグ情報
 */
export interface DebugInfo {
  /** 現在のゲーム状態 */
  gameState: GameState;
  /** パフォーマンス指標 */
  performance: PerformanceMetrics;
  /** エラーログ */
  errors: string[];
  /** 操作履歴 */
  actionHistory: string[];
}

// =============================================================================
// デフォルト値と定数
// =============================================================================

/**
 * ゲーム定数
 */
export const GAME_CONSTANTS = {
  /** グリッドサイズ */
  GRID_SIZE: 4,
  /** 勝利タイル */
  VICTORY_TILE: 2048,
  /** 新タイルの値候補 */
  NEW_TILE_VALUES: [2, 4] as TileValue[],
  /** 新タイルの確率（2の確率） */
  NEW_TILE_2_PROBABILITY: 0.9,
  /** 最大タイル値 */
  MAX_TILE_VALUE: 8192,
  /** アニメーション継続時間 */
  ANIMATION_DURATION: 250,
  /** 移動判定の最小距離 */
  MIN_SWIPE_DISTANCE: 50
} as const;

/**
 * デフォルト設定
 */
export const DEFAULT_SETTINGS: GameSettings = {
  soundVolume: 0.7,
  animationSpeed: 2,
  colorTheme: 'default',
  hapticFeedback: true
};

/**
 * 初期ゲーム状態
 */
export const INITIAL_GAME_STATE: Omit<GameState, 'grid'> = {
  score: 0,
  bestScore: 0,
  moves: 0,
  gameStarted: false,
  gameOver: false,
  status: 'playing',
  startTime: 0,
  mergeCount: 0,
  maxTile: 0,
  lastMoveValid: false
};

// =============================================================================
// ユーティリティ型
// =============================================================================

/**
 * 部分的な更新用のユーティリティ型
 */
export type PartialGameState = Partial<GameState>;

/**
 * 読み取り専用のゲーム状態
 */
export type ReadonlyGameState = Readonly<GameState>;

/**
 * 関数型のイベントハンドラー
 */
export type GameEventHandler<T extends GameEventType> = (
  event: GameEvent & { type: T }
) => void;

/**
 * 型安全なLocalStorageアクセス
 */
export interface TypedStorage {
  getItem<K extends keyof StorageData>(key: K): StorageData[K] | null;
  setItem<K extends keyof StorageData>(key: K, value: StorageData[K]): void;
  removeItem<K extends keyof StorageData>(key: K): void;
  clear(): void;
}