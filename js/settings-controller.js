/**
 * Puzzle2048 設定コントローラー
 * 
 * 難易度設定、音響設定、アニメーション設定の管理
 * ユーザー設定の保存・読み込み機能
 */

class SettingsController {
    constructor() {
        this.currentDifficulty = 'easy';
        this.settings = {
            difficulty: 'easy',
            volume: 70,
            muted: false,
            animationSpeed: 2,
            particleEffects: true,
            autoSave: true,
            showDebug: false,
            confirmRestart: true
        };
        
        this.loadSettings();
    }

    /**
     * 初期化処理
     */
    initialize() {
        this.initializeEventListeners();
        this.updateDisplay();
        this.animateEntrance();
    }

    /**
     * イベントリスナー初期化
     */
    initializeEventListeners() {
        // 難易度選択
        document.querySelectorAll('.difficulty-card').forEach(card => {
            card.addEventListener('click', () => {
                const difficulty = card.dataset.difficulty;
                this.selectDifficulty(difficulty);
            });
        });

        // 音量スライダー
        const volumeSlider = document.getElementById('volume-slider');
        const volumeValue = document.getElementById('volume-value');
        
        volumeSlider.addEventListener('input', (e) => {
            const volume = parseInt(e.target.value);
            this.settings.volume = volume;
            volumeValue.textContent = `${volume}%`;
            this.saveSettings();
        });

        // ミュート切り替え
        document.getElementById('mute-toggle').addEventListener('change', (e) => {
            this.settings.muted = e.target.checked;
            this.saveSettings();
        });

        // 音響テスト
        document.getElementById('test-sound').addEventListener('click', () => {
            this.testSound();
        });

        // アニメーション速度
        document.getElementById('animation-speed').addEventListener('change', (e) => {
            this.settings.animationSpeed = parseInt(e.target.value);
            this.saveSettings();
        });

        // パーティクルエフェクト
        document.getElementById('particle-effects').addEventListener('change', (e) => {
            this.settings.particleEffects = e.target.checked;
            this.saveSettings();
        });

        // 自動セーブ
        document.getElementById('auto-save').addEventListener('change', (e) => {
            this.settings.autoSave = e.target.checked;
            this.saveSettings();
        });

        // デバッグ表示
        document.getElementById('show-debug').addEventListener('change', (e) => {
            this.settings.showDebug = e.target.checked;
            this.saveSettings();
        });

        // リスタート確認
        document.getElementById('confirm-restart').addEventListener('change', (e) => {
            this.settings.confirmRestart = e.target.checked;
            this.saveSettings();
        });

        // アクションボタン
        document.getElementById('start-game').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('reset-settings').addEventListener('click', () => {
            this.resetSettings();
        });

        document.getElementById('back-to-game').addEventListener('click', () => {
            this.backToGame();
        });

        // キーボードショートカット
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'Enter':
                    this.startGame();
                    break;
                case 'Escape':
                    this.backToGame();
                    break;
                case '1':
                    this.selectDifficulty('easy');
                    break;
                case '2':
                    this.selectDifficulty('normal');
                    break;
                case '3':
                    this.selectDifficulty('hard');
                    break;
                case '4':
                    this.selectDifficulty('expert');
                    break;
            }
        });
    }

    /**
     * 難易度選択
     */
    selectDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        this.settings.difficulty = difficulty;
        
        // UI更新
        document.querySelectorAll('.difficulty-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        const selectedCard = document.querySelector(`[data-difficulty="${difficulty}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
            selectedCard.classList.add('difficulty-pulse');
            
            setTimeout(() => {
                selectedCard.classList.remove('difficulty-pulse');
            }, 500);
        }
        
        this.saveSettings();
        console.log(`🎯 難易度設定: ${difficulty}`);
    }

    /**
     * 表示内容の更新
     */
    updateDisplay() {
        // 難易度選択状態
        this.selectDifficulty(this.settings.difficulty);
        
        // 音量設定
        document.getElementById('volume-slider').value = this.settings.volume;
        document.getElementById('volume-value').textContent = `${this.settings.volume}%`;
        
        // チェックボックス設定
        document.getElementById('mute-toggle').checked = this.settings.muted;
        document.getElementById('particle-effects').checked = this.settings.particleEffects;
        document.getElementById('auto-save').checked = this.settings.autoSave;
        document.getElementById('show-debug').checked = this.settings.showDebug;
        document.getElementById('confirm-restart').checked = this.settings.confirmRestart;
        
        // セレクト設定
        document.getElementById('animation-speed').value = this.settings.animationSpeed;
    }

    /**
     * 音響テスト
     */
    testSound() {
        // テスト用の音響マネージャーを作成
        const tempAudioManager = new AudioManager();
        tempAudioManager.volume = this.settings.volume / 100;
        tempAudioManager.muted = this.settings.muted;
        
        tempAudioManager.initialize().then(() => {
            tempAudioManager.testAllSounds();
            setTimeout(() => {
                tempAudioManager.destroy();
            }, 3000);
        }).catch(() => {
            alert('音響テストに失敗しました。ブラウザの音響設定を確認してください。');
        });
    }

    /**
     * ゲーム開始
     */
    startGame() {
        this.saveSettings();
        
        // 難易度パラメータ付きでゲーム画面に遷移
        const params = new URLSearchParams({
            difficulty: this.settings.difficulty,
            volume: this.settings.volume,
            muted: this.settings.muted,
            animationSpeed: this.settings.animationSpeed,
            particleEffects: this.settings.particleEffects,
            showDebug: this.settings.showDebug
        });
        
        window.location.href = `index.html?${params.toString()}`;
    }

    /**
     * ゲーム画面に戻る
     */
    backToGame() {
        // 現在の設定を保存してから戻る
        this.saveSettings();
        window.location.href = 'index.html';
    }

    /**
     * 設定をリセット
     */
    resetSettings() {
        if (confirm('全ての設定をリセットしますか？')) {
            // デフォルト設定に戻す
            this.settings = {
                difficulty: 'easy',
                volume: 70,
                muted: false,
                animationSpeed: 2,
                particleEffects: true,
                autoSave: true,
                showDebug: false,
                confirmRestart: true
            };
            
            this.saveSettings();
            this.updateDisplay();
            
            console.log('⚙️ 設定をリセットしました');
        }
    }

    /**
     * 設定を保存
     */
    saveSettings() {
        try {
            localStorage.setItem('puzzle2048_settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('設定保存エラー:', error);
        }
    }

    /**
     * 設定を読み込み
     */
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('puzzle2048_settings');
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                this.settings = { ...this.settings, ...parsed };
                this.currentDifficulty = this.settings.difficulty;
            }
        } catch (error) {
            console.error('設定読み込みエラー:', error);
        }
    }

    /**
     * 入場アニメーション
     */
    animateEntrance() {
        const sections = document.querySelectorAll('.settings-section');
        sections.forEach((section, index) => {
            section.style.animationDelay = `${index * 0.2}s`;
            section.classList.add('settings-appear');
        });
    }

    /**
     * 難易度設定情報を取得
     */
    getDifficultyInfo(difficulty) {
        const configs = {
            easy: { size: 4, target: 2048, name: 'Easy', description: '初心者向けの4×4グリッド' },
            normal: { size: 5, target: 4096, name: 'Normal', description: '中級者向けの5×5グリッド' },
            hard: { size: 6, target: 8192, name: 'Hard', description: '上級者向けの6×6グリッド' },
            expert: { size: 8, target: 16384, name: 'Expert', description: 'エキスパート向けの8×8グリッド' }
        };
        
        return configs[difficulty] || configs.easy;
    }

    /**
     * 現在の設定を取得
     */
    getCurrentSettings() {
        return { ...this.settings };
    }
}

// グローバルで利用可能にする
window.SettingsController = SettingsController;