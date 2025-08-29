/**
 * ブロック崩しゲーム - 共通機能
 * 設定管理、画面遷移、ユーティリティ関数を提供
 */

// ゲーム設定のデフォルト値
const DEFAULT_SETTINGS = {
    paddleBlockDistance: 100,
    ballSpeed: 3.0
};

// ローカルストレージキー
const STORAGE_KEYS = {
    GAME_SETTINGS: 'gameSettings',
    GAME_RESULT: 'gameResult'
};

/**
 * 設定管理クラス
 */
class SettingsManager {
    /**
     * 設定を保存
     * @param {Object} settings - 設定オブジェクト
     */
    static save(settings) {
        try {
            localStorage.setItem(STORAGE_KEYS.GAME_SETTINGS, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('設定の保存に失敗しました:', error);
            return false;
        }
    }

    /**
     * 設定を読み込み
     * @returns {Object} 設定オブジェクト
     */
    static load() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.GAME_SETTINGS);
            return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
        } catch (error) {
            console.error('設定の読み込みに失敗しました:', error);
            return DEFAULT_SETTINGS;
        }
    }

    /**
     * 設定の妥当性を検証
     * @param {Object} settings - 設定オブジェクト
     * @returns {Object} 検証・補正された設定オブジェクト
     */
    static validate(settings) {
        const validated = { ...settings };
        
        // 距離の範囲チェック（50-200px）
        validated.paddleBlockDistance = Math.max(50, Math.min(200, validated.paddleBlockDistance || DEFAULT_SETTINGS.paddleBlockDistance));
        
        // 速度の範囲チェック（1.0-5.0）
        validated.ballSpeed = Math.max(1.0, Math.min(5.0, validated.ballSpeed || DEFAULT_SETTINGS.ballSpeed));
        
        return validated;
    }

    /**
     * 難易度レベルを判定
     * @param {Object} settings - 設定オブジェクト
     * @returns {string} 難易度レベル
     */
    static getDifficultyLevel(settings) {
        const { paddleBlockDistance, ballSpeed } = settings;
        
        if (paddleBlockDistance <= 80 && ballSpeed <= 2.0) {
            return 'やさしい';
        } else if (paddleBlockDistance >= 150 || ballSpeed >= 4.0) {
            return '難しい';
        } else if (paddleBlockDistance === DEFAULT_SETTINGS.paddleBlockDistance && ballSpeed === DEFAULT_SETTINGS.ballSpeed) {
            return '標準';
        } else {
            return 'カスタム';
        }
    }
}

/**
 * ゲーム結果管理クラス
 */
class GameResultManager {
    /**
     * ゲーム結果を保存
     * @param {Object} result - 結果オブジェクト
     */
    static save(result) {
        try {
            localStorage.setItem(STORAGE_KEYS.GAME_RESULT, JSON.stringify(result));
            return true;
        } catch (error) {
            console.error('ゲーム結果の保存に失敗しました:', error);
            return false;
        }
    }

    /**
     * ゲーム結果を読み込み
     * @returns {Object|null} 結果オブジェクト
     */
    static load() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.GAME_RESULT);
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.error('ゲーム結果の読み込みに失敗しました:', error);
            return null;
        }
    }
}

/**
 * ページ遷移管理クラス
 */
class NavigationManager {
    /**
     * 設定画面に遷移
     */
    static goToSettings() {
        if (NavigationManager.isDevEnvironment()) {
            window.location.href = 'index.html';
        } else {
            window.location.href = '/';
        }
    }

    /**
     * ゲーム画面に遷移
     */
    static goToGame() {
        if (NavigationManager.isDevEnvironment()) {
            window.location.href = 'game.html';
        } else {
            window.location.href = '/game';
        }
    }

    /**
     * ゲームオーバー画面に遷移
     */
    static goToGameOver() {
        if (NavigationManager.isDevEnvironment()) {
            window.location.href = 'gameover.html';
        } else {
            window.location.href = '/gameover';
        }
    }

    /**
     * 開発環境判定
     */
    static isDevEnvironment() {
        return (
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.protocol === 'file:' ||
            window.location.port !== ''
        );
    }

    /**
     * 現在のページを判定
     */
    static getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        
        if (filename === 'game.html' || path.includes('/game')) {
            return 'game';
        } else if (filename === 'gameover.html' || path.includes('/gameover')) {
            return 'gameover';
        } else {
            return 'settings';
        }
    }

    /**
     * ページタイトルの更新
     */
    static updatePageTitle(suffix = '') {
        const baseTitle = 'ブロック崩しゲーム';
        document.title = suffix ? `${baseTitle} - ${suffix}` : baseTitle;
    }

    /**
     * ブラウザの戻るボタン対応
     */
    static setupHistoryNavigation() {
        window.addEventListener('popstate', (event) => {
            const currentPage = NavigationManager.getCurrentPage();
            console.log('ブラウザナビゲーション:', currentPage);
            
            // 必要に応じてページ状態の復元処理を追加
            if (event.state) {
                console.log('復元する状態:', event.state);
            }
        });
    }

    /**
     * ページ遷移時の確認ダイアログ
     */
    static confirmNavigation(message = 'ページを離れますか？') {
        return confirm(message);
    }
}

/**
 * ユーティリティ関数
 */
class Utils {
    /**
     * 時間を MM:SS 形式にフォーマット
     * @param {number} seconds - 秒数
     * @returns {string} フォーマット済み時間
     */
    static formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * 数値を指定桁数で四捨五入
     * @param {number} num - 数値
     * @param {number} decimals - 小数点以下の桁数
     * @returns {number} 四捨五入された数値
     */
    static round(num, decimals = 1) {
        const multiplier = Math.pow(10, decimals);
        return Math.round(num * multiplier) / multiplier;
    }

    /**
     * 範囲内の値にクランプ
     * @param {number} value - 値
     * @param {number} min - 最小値
     * @param {number} max - 最大値
     * @returns {number} クランプされた値
     */
    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    /**
     * デバウンス関数
     * @param {Function} func - 実行する関数
     * @param {number} delay - 遅延時間（ミリ秒）
     * @returns {Function} デバウンスされた関数
     */
    static debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * ランダムな整数を生成
     * @param {number} min - 最小値
     * @param {number} max - 最大値
     * @returns {number} ランダムな整数
     */
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * ランダムな色を生成
     * @returns {string} ランダムなHEXカラー
     */
    static randomColor() {
        const colors = ['#e74c3c', '#f39c12', '#f1c40f', '#27ae60', '#3498db', '#9b59b6'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}

/**
 * アニメーション管理クラス
 */
class AnimationManager {
    constructor() {
        this.animations = new Map();
    }

    /**
     * アニメーションを開始
     * @param {string} id - アニメーションID
     * @param {Function} callback - アニメーションコールバック
     */
    start(id, callback) {
        if (this.animations.has(id)) {
            this.stop(id);
        }
        
        const animate = () => {
            const continueAnimation = callback();
            if (continueAnimation !== false) {
                this.animations.set(id, requestAnimationFrame(animate));
            } else {
                this.animations.delete(id);
            }
        };
        
        this.animations.set(id, requestAnimationFrame(animate));
    }

    /**
     * アニメーションを停止
     * @param {string} id - アニメーションID
     */
    stop(id) {
        if (this.animations.has(id)) {
            cancelAnimationFrame(this.animations.get(id));
            this.animations.delete(id);
        }
    }

    /**
     * すべてのアニメーションを停止
     */
    stopAll() {
        this.animations.forEach((animationId) => {
            cancelAnimationFrame(animationId);
        });
        this.animations.clear();
    }
}

// グローバルインスタンス
const animationManager = new AnimationManager();

// エクスポート（モジュール使用時）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SettingsManager,
        GameResultManager,
        NavigationManager,
        Utils,
        AnimationManager,
        animationManager,
        DEFAULT_SETTINGS,
        STORAGE_KEYS
    };
}