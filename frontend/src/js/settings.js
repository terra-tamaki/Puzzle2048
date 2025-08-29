/**
 * ブロック崩しゲーム - 設定画面ロジック
 * スライダー操作、設定保存・復元、ゲーム開始処理を管理
 */

class SettingsController {
    constructor() {
        this.distanceSlider = null;
        this.speedSlider = null;
        this.distanceValue = null;
        this.speedValue = null;
        this.startButton = null;
        this.resetButton = null;
        this.settingsForm = null;
        
        this.currentSettings = { ...DEFAULT_SETTINGS };
        this.isInitialized = false;
        
        // イベントハンドラーをバインド
        this.handleDistanceChange = this.handleDistanceChange.bind(this);
        this.handleSpeedChange = this.handleSpeedChange.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.handleReset = this.handleReset.bind(this);
    }

    /**
     * 初期化処理
     */
    init() {
        if (this.isInitialized) return;

        try {
            this.initializeElements();
            this.loadSavedSettings();
            this.setupEventListeners();
            this.updateAllDisplays();
            this.isInitialized = true;
            
            console.log('設定画面の初期化完了');
        } catch (error) {
            console.error('設定画面の初期化に失敗しました:', error);
            this.showErrorMessage('画面の初期化に失敗しました。ページをリロードしてください。');
        }
    }

    /**
     * DOM要素の取得
     */
    initializeElements() {
        this.distanceSlider = document.getElementById('distanceSlider');
        this.speedSlider = document.getElementById('speedSlider');
        this.distanceValue = document.getElementById('distanceValue');
        this.speedValue = document.getElementById('speedValue');
        this.startButton = document.getElementById('startButton');
        this.resetButton = document.getElementById('resetButton');
        this.settingsForm = document.getElementById('settingsForm');

        // 必須要素の存在チェック
        const requiredElements = [
            this.distanceSlider, this.speedSlider, this.distanceValue, 
            this.speedValue, this.startButton, this.resetButton, this.settingsForm
        ];

        if (requiredElements.some(element => !element)) {
            throw new Error('必要なDOM要素が見つかりません');
        }
    }

    /**
     * 保存された設定を読み込み
     */
    loadSavedSettings() {
        try {
            this.currentSettings = SettingsManager.load();
            
            // スライダーに値を設定
            this.distanceSlider.value = this.currentSettings.paddleBlockDistance;
            this.speedSlider.value = this.currentSettings.ballSpeed;
            
            console.log('設定を読み込みました:', this.currentSettings);
        } catch (error) {
            console.error('設定の読み込みに失敗しました:', error);
            this.currentSettings = { ...DEFAULT_SETTINGS };
        }
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // スライダーのイベント
        this.distanceSlider.addEventListener('input', this.handleDistanceChange);
        this.speedSlider.addEventListener('input', this.handleSpeedChange);
        
        // フォーム送信
        this.settingsForm.addEventListener('submit', this.handleFormSubmit);
        
        // リセットボタン
        this.resetButton.addEventListener('click', this.handleReset);
        
        // キーボードショートカット
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
                e.preventDefault();
                this.handleFormSubmit(e);
            } else if (e.key === 'Escape') {
                this.handleReset();
            }
        });

        // ページ離脱時の確認
        window.addEventListener('beforeunload', (e) => {
            const hasChanges = this.hasUnsavedChanges();
            if (hasChanges) {
                e.preventDefault();
                e.returnValue = '未保存の変更があります。ページを離れますか？';
            }
        });
    }

    /**
     * 距離スライダー変更時の処理
     */
    handleDistanceChange(event) {
        const value = parseInt(event.target.value);
        this.currentSettings.paddleBlockDistance = value;
        this.updateDistanceDisplay();
        this.updateDifficultyIndicator();
        
        // 視覚的フィードバック
        this.addSliderFeedback(event.target);
    }

    /**
     * 速度スライダー変更時の処理
     */
    handleSpeedChange(event) {
        const value = parseFloat(event.target.value);
        this.currentSettings.ballSpeed = value;
        this.updateSpeedDisplay();
        this.updateDifficultyIndicator();
        
        // 視覚的フィードバック
        this.addSliderFeedback(event.target);
    }

    /**
     * フォーム送信時の処理（ゲーム開始）
     */
    handleFormSubmit(event) {
        event.preventDefault();
        
        try {
            // 設定を検証・保存
            this.currentSettings = SettingsManager.validate(this.currentSettings);
            const saved = SettingsManager.save(this.currentSettings);
            
            if (!saved) {
                throw new Error('設定の保存に失敗しました');
            }
            
            // ゲーム開始アニメーション
            this.startButton.disabled = true;
            this.startButton.innerHTML = '<span class="material-icons">hourglass_empty</span>開始中...';
            
            // 成功メッセージと遷移
            this.showSuccessMessage('設定を保存しました！', () => {
                NavigationManager.goToGame();
            });
            
            console.log('ゲーム開始 - 設定:', this.currentSettings);
            
        } catch (error) {
            console.error('ゲーム開始に失敗しました:', error);
            this.showErrorMessage('ゲームの開始に失敗しました。設定を確認してください。');
            
            // ボタンを元に戻す
            this.startButton.disabled = false;
            this.startButton.innerHTML = '<span class="material-icons">play_arrow</span>ゲーム開始';
        }
    }

    /**
     * 設定リセット処理
     */
    handleReset() {
        if (!confirm('設定をデフォルト値にリセットしますか？')) {
            return;
        }

        try {
            // デフォルト設定を適用
            this.currentSettings = { ...DEFAULT_SETTINGS };
            
            // スライダーを更新
            this.distanceSlider.value = this.currentSettings.paddleBlockDistance;
            this.speedSlider.value = this.currentSettings.ballSpeed;
            
            // 表示を更新
            this.updateAllDisplays();
            
            // アニメーション効果
            this.addResetAnimation();
            
            this.showSuccessMessage('設定をリセットしました');
            
        } catch (error) {
            console.error('設定リセットに失敗しました:', error);
            this.showErrorMessage('設定のリセットに失敗しました。');
        }
    }

    /**
     * 距離表示の更新
     */
    updateDistanceDisplay() {
        const value = this.currentSettings.paddleBlockDistance;
        let difficulty = '';
        
        if (value <= 80) difficulty = 'やさしい';
        else if (value <= 120) difficulty = '標準';
        else difficulty = '難しい';
        
        this.distanceValue.textContent = `${difficulty}: ${value}px`;
    }

    /**
     * 速度表示の更新
     */
    updateSpeedDisplay() {
        const value = this.currentSettings.ballSpeed;
        let difficulty = '';
        
        if (value <= 2.0) difficulty = 'ゆっくり';
        else if (value <= 3.5) difficulty = '標準';
        else difficulty = '高速';
        
        this.speedValue.textContent = `${difficulty}: ${value}`;
    }

    /**
     * 難易度インジケーターの更新
     */
    updateDifficultyIndicator() {
        const difficultyLevel = SettingsManager.getDifficultyLevel(this.currentSettings);
        const indicators = document.querySelectorAll('.difficulty-indicator span');
        
        // すべてのインジケーターをリセット
        indicators.forEach(indicator => {
            indicator.style.fontWeight = '400';
            indicator.style.transform = 'scale(1)';
        });
        
        // 現在の難易度を強調
        let activeIndicator = null;
        if (difficultyLevel === 'やさしい') {
            activeIndicator = indicators[0];
        } else if (difficultyLevel === '標準' || difficultyLevel === 'ふつう') {
            activeIndicator = indicators[1];
        } else {
            activeIndicator = indicators[2];
        }
        
        if (activeIndicator) {
            activeIndicator.style.fontWeight = '700';
            activeIndicator.style.transform = 'scale(1.2)';
        }
    }

    /**
     * すべての表示を更新
     */
    updateAllDisplays() {
        this.updateDistanceDisplay();
        this.updateSpeedDisplay();
        this.updateDifficultyIndicator();
    }

    /**
     * スライダーフィードバック効果
     */
    addSliderFeedback(slider) {
        slider.style.background = 'linear-gradient(90deg, #667eea, #764ba2)';
        setTimeout(() => {
            slider.style.background = '#e0e0e0';
        }, 200);
    }

    /**
     * リセットアニメーション効果
     */
    addResetAnimation() {
        const card = document.querySelector('.card');
        card.style.animation = 'none';
        setTimeout(() => {
            card.style.animation = 'pulse 0.6s ease-out';
        }, 10);
        
        setTimeout(() => {
            card.style.animation = '';
        }, 600);
    }

    /**
     * 未保存変更の確認
     */
    hasUnsavedChanges() {
        try {
            const savedSettings = SettingsManager.load();
            return (
                savedSettings.paddleBlockDistance !== this.currentSettings.paddleBlockDistance ||
                savedSettings.ballSpeed !== this.currentSettings.ballSpeed
            );
        } catch {
            return false;
        }
    }

    /**
     * 成功メッセージの表示
     */
    showSuccessMessage(message, callback) {
        const notification = this.createNotification(message, 'success');
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
            if (callback) callback();
        }, 2000);
    }

    /**
     * エラーメッセージの表示
     */
    showErrorMessage(message) {
        const notification = this.createNotification(message, 'error');
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    /**
     * 通知要素の作成
     */
    createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 8px 16px rgba(0,0,0,0.2);
            ${type === 'success' 
                ? 'background: linear-gradient(135deg, #27ae60, #2ecc71);' 
                : 'background: linear-gradient(135deg, #e74c3c, #c0392b);'
            }
        `;
        notification.textContent = message;
        return notification;
    }

    /**
     * クリーンアップ処理
     */
    destroy() {
        if (!this.isInitialized) return;

        // イベントリスナーの削除
        this.distanceSlider?.removeEventListener('input', this.handleDistanceChange);
        this.speedSlider?.removeEventListener('input', this.handleSpeedChange);
        this.settingsForm?.removeEventListener('submit', this.handleFormSubmit);
        this.resetButton?.removeEventListener('click', this.handleReset);

        this.isInitialized = false;
        console.log('設定画面のクリーンアップ完了');
    }
}

// グローバルインスタンス
let settingsController;

// DOM読み込み完了時に初期化
document.addEventListener('DOMContentLoaded', () => {
    settingsController = new SettingsController();
    settingsController.init();
});

// ページ離脱時のクリーンアップ
window.addEventListener('beforeunload', () => {
    settingsController?.destroy();
});

// エクスポート（モジュール使用時）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SettingsController };
}