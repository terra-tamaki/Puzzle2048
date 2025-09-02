/**
 * Puzzle2048 音響管理システム
 * 
 * Web Audio APIを使用して効果音を生成・再生します。
 * タイル値に応じた音階制御で爽快な音響体験を提供します。
 */

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.volume = 0.7;
        this.muted = false;
        this.isInitialized = false;
        
        // 音響設定
        this.soundConfig = {
            move: { frequency: 200, duration: 100, type: 'sine' },
            merge: { frequency: 440, duration: 200, type: 'square' },
            invalid: { frequency: 100, duration: 150, type: 'sawtooth' },
            victory: { frequency: 523, duration: 500, type: 'sine' },
            gameover: { frequency: 220, duration: 800, type: 'triangle' },
            newgame: { frequency: 330, duration: 300, type: 'sine' }
        };
    }

    /**
     * 音響システム初期化
     * ユーザーアクション後に呼び出す必要があります
     */
    async initialize() {
        try {
            // AudioContextを作成
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // マスターゲインノードを作成
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.volume;
            
            // サスペンド状態の場合は再開
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            this.isInitialized = true;
            console.log('🔊 音響システム初期化完了');
            
            // 初期化完了音を再生
            this.playSound('newgame');
            
        } catch (error) {
            console.warn('音響システム初期化に失敗:', error);
            this.isInitialized = false;
        }
    }

    /**
     * 効果音を再生
     * @param {string} soundType - 音の種類 ('move', 'merge', 'invalid', 'victory', 'gameover', 'newgame')
     * @param {number} tileValue - タイル値（音階制御用、オプション）
     */
    playSound(soundType, tileValue = null) {
        if (!this.isInitialized || this.muted || !this.audioContext) {
            return;
        }

        try {
            const config = this.soundConfig[soundType];
            if (!config) {
                console.warn(`未知の音響タイプ: ${soundType}`);
                return;
            }

            // 音階調整（合体音のみ）
            let frequency = config.frequency;
            if (soundType === 'merge' && tileValue) {
                frequency = this.calculatePitch(tileValue);
            }

            this.createAndPlayTone(frequency, config.duration, config.type);
            
        } catch (error) {
            console.warn('効果音再生エラー:', error);
        }
    }

    /**
     * タイル値に応じた音階を計算
     * @param {number} tileValue - タイル値（2, 4, 8, 16, ...）
     * @returns {number} 周波数（Hz）
     */
    calculatePitch(tileValue) {
        const baseFreq = 440; // A4（基準音）
        const octave = Math.log2(tileValue / 2); // 2→0, 4→1, 8→2...
        
        // 音階を12等分律で計算（1オクターブ上がるごとに2倍）
        const semitones = octave * 2; // より緩やかな音階変化
        return baseFreq * Math.pow(2, semitones / 12);
    }

    /**
     * トーンを生成・再生
     * @param {number} frequency - 周波数
     * @param {number} duration - 継続時間（ミリ秒）
     * @param {string} waveType - 波形タイプ
     */
    createAndPlayTone(frequency, duration, waveType = 'sine') {
        const currentTime = this.audioContext.currentTime;
        
        // オシレーターを作成
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        // 波形と周波数を設定
        oscillator.type = waveType;
        oscillator.frequency.setValueAtTime(frequency, currentTime);
        
        // エンベロープ設定（音の立ち上がり・減衰）
        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.01); // アタック
        gainNode.gain.exponentialRampToValueAtTime(0.1, currentTime + duration / 1000 * 0.3); // ディケイ
        gainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + duration / 1000); // リリース
        
        // 接続
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        // 再生
        oscillator.start(currentTime);
        oscillator.stop(currentTime + duration / 1000);
    }

    /**
     * 特別な勝利音を再生
     */
    playVictoryFanfare() {
        if (!this.isInitialized || this.muted) {
            return;
        }

        // 3段階の音階でファンファーレ
        const notes = [523, 659, 784]; // C5, E5, G5
        const delay = 150; // 音符間の間隔

        notes.forEach((frequency, index) => {
            setTimeout(() => {
                this.createAndPlayTone(frequency, 400, 'sine');
            }, index * delay);
        });
    }

    /**
     * ゲームオーバー音を再生
     */
    playGameOverSound() {
        if (!this.isInitialized || this.muted) {
            return;
        }

        // 下降音階でゲームオーバー感を演出
        const notes = [440, 392, 349, 294]; // A4, G4, F4, D4
        const delay = 200;

        notes.forEach((frequency, index) => {
            setTimeout(() => {
                this.createAndPlayTone(frequency, 300, 'triangle');
            }, index * delay);
        });
    }

    /**
     * 音量設定
     * @param {number} volume - 音量（0-1）
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        if (this.masterGain) {
            this.masterGain.gain.value = this.muted ? 0 : this.volume;
        }
        
        // 設定を保存
        localStorage.setItem('puzzle2048_volume', this.volume.toString());
    }

    /**
     * ミュート切り替え
     */
    toggleMute() {
        this.muted = !this.muted;
        
        if (this.masterGain) {
            this.masterGain.gain.value = this.muted ? 0 : this.volume;
        }
        
        // 設定を保存
        localStorage.setItem('puzzle2048_muted', this.muted.toString());
        
        console.log(`🔊 音響: ${this.muted ? 'ミュート' : 'オン'}`);
        
        return this.muted;
    }

    /**
     * 設定を読み込み
     */
    loadSettings() {
        // 音量設定
        const savedVolume = localStorage.getItem('puzzle2048_volume');
        if (savedVolume) {
            this.volume = parseFloat(savedVolume);
        }

        // ミュート設定
        const savedMuted = localStorage.getItem('puzzle2048_muted');
        if (savedMuted) {
            this.muted = savedMuted === 'true';
        }
    }

    /**
     * ユーザーアクション時の初期化（初回クリック・キー押下時）
     */
    async initializeOnUserAction() {
        if (!this.isInitialized) {
            await this.initialize();
        }
    }

    /**
     * 音響システムの状態を取得
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            volume: this.volume,
            muted: this.muted,
            contextState: this.audioContext ? this.audioContext.state : 'not_created'
        };
    }

    /**
     * リソースクリーンアップ
     */
    destroy() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        this.masterGain = null;
        this.isInitialized = false;
    }

    /**
     * テスト音再生（開発・デバッグ用）
     */
    testAllSounds() {
        if (!this.isInitialized) {
            console.warn('音響システムが初期化されていません');
            return;
        }

        console.log('🎵 全効果音テスト開始');
        
        const testSequence = [
            { type: 'move', delay: 0 },
            { type: 'merge', delay: 300, tileValue: 4 },
            { type: 'merge', delay: 600, tileValue: 16 },
            { type: 'merge', delay: 900, tileValue: 64 },
            { type: 'invalid', delay: 1200 },
            { type: 'victory', delay: 1500 }
        ];

        testSequence.forEach(({ type, delay, tileValue }) => {
            setTimeout(() => {
                console.log(`♪ ${type}音再生${tileValue ? ` (${tileValue})` : ''}`);
                this.playSound(type, tileValue);
            }, delay);
        });
    }
}

// グローバルで利用可能にする
window.AudioManager = AudioManager;