/**
 * ブロック崩しゲーム - ゲームオーバー画面ロジック
 * 結果表示、統計計算、アニメーション効果を管理
 */

class GameOverController {
    constructor() {
        // DOM要素
        this.resultTitle = null;
        this.resultIcon = null;
        this.resultText = null;
        this.resultSubtitle = null;
        this.achievementBadge = null;
        this.achievementText = null;
        this.finalScore = null;
        this.scoreImprovement = null;
        this.motivationMessage = null;
        
        // 統計要素
        this.playTimeValue = null;
        this.blocksValue = null;
        this.difficultyValue = null;
        this.livesValue = null;
        
        // 進捗要素
        this.progressFill = null;
        this.progressPercentage = null;
        
        // ボタン要素
        this.replayBtn = null;
        this.settingsBtn = null;
        
        // ゲーム結果データ
        this.gameResult = null;
        this.isInitialized = false;
        
        // イベントハンドラーをバインド
        this.handleReplay = this.handleReplay.bind(this);
        this.handleSettings = this.handleSettings.bind(this);
        this.toggleResult = this.toggleResult.bind(this);
    }

    /**
     * 初期化処理
     */
    init() {
        if (this.isInitialized) return;

        try {
            this.initializeElements();
            this.loadGameResult();
            this.setupEventListeners();
            this.displayResults();
            this.startAnimations();
            this.isInitialized = true;
            
            console.log('ゲームオーバー画面の初期化完了', this.gameResult);
        } catch (error) {
            console.error('ゲームオーバー画面の初期化に失敗しました:', error);
            this.showErrorState();
        }
    }

    /**
     * DOM要素の取得
     */
    initializeElements() {
        // 結果表示要素
        this.resultTitle = document.getElementById('resultTitle');
        this.resultIcon = document.getElementById('resultIcon');
        this.resultText = document.getElementById('resultText');
        this.resultSubtitle = document.getElementById('resultSubtitle');
        this.achievementBadge = document.getElementById('achievementBadge');
        this.achievementText = document.getElementById('achievementText');
        this.finalScore = document.getElementById('finalScore');
        this.scoreImprovement = document.getElementById('scoreImprovement');
        this.motivationMessage = document.getElementById('motivationMessage');
        
        // 統計要素
        this.playTimeValue = document.getElementById('playTimeValue');
        this.blocksValue = document.getElementById('blocksValue');
        this.difficultyValue = document.getElementById('difficultyValue');
        this.livesValue = document.getElementById('livesValue');
        
        // 進捗要素
        this.progressFill = document.getElementById('progressFill');
        this.progressPercentage = document.getElementById('progressPercentage');
        
        // ボタン要素
        this.replayBtn = document.getElementById('replayBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        
        // 必須要素の存在チェック
        const requiredElements = [
            this.resultTitle, this.finalScore, this.replayBtn, this.settingsBtn
        ];
        
        if (requiredElements.some(element => !element)) {
            throw new Error('必要なDOM要素が見つかりません');
        }
    }

    /**
     * ゲーム結果データの読み込み
     */
    loadGameResult() {
        try {
            this.gameResult = GameResultManager.load();
            
            if (!this.gameResult) {
                // デフォルトデータで初期化
                this.gameResult = {
                    isVictory: false,
                    finalScore: 0,
                    playTime: '0:00',
                    blocksDestroyed: 0,
                    totalBlocks: 40,
                    remainingLives: 0,
                    difficulty: 'カスタム'
                };
                console.warn('ゲーム結果が見つかりません。デフォルトデータを使用します。');
            }
        } catch (error) {
            console.error('ゲーム結果の読み込みに失敗しました:', error);
            this.gameResult = this.getDefaultResult();
        }
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // ボタンイベント
        this.replayBtn.addEventListener('click', this.handleReplay);
        this.settingsBtn.addEventListener('click', this.handleSettings);
        
        // キーボードショートカット
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'Enter':
                    this.handleReplay();
                    break;
                case 'Escape':
                    this.handleSettings();
                    break;
                case 't':
                case 'T':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.toggleResult();
                    }
                    break;
            }
        });
        
        // タッチジェスチャー対応
        let touchStartY = 0;
        document.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const deltaY = touchStartY - touchEndY;
            
            if (Math.abs(deltaY) > 50) {
                if (deltaY > 0) {
                    // 上スワイプ - 再プレイ
                    this.handleReplay();
                } else {
                    // 下スワイプ - 設定
                    this.handleSettings();
                }
            }
        });
    }

    /**
     * 結果表示処理
     */
    displayResults() {
        this.updateResultHeader();
        this.updateScoreSection();
        this.updateStatsSection();
        this.updateProgressSection();
        this.updateMotivationMessage();
        
        if (this.gameResult.isVictory) {
            this.createConfetti();
        }
    }

    /**
     * 結果ヘッダーの更新
     */
    updateResultHeader() {
        if (this.gameResult.isVictory) {
            this.resultTitle.className = 'result-title victory';
            this.resultIcon.textContent = 'emoji_events';
            this.resultText.textContent = 'クリア！';
            this.resultSubtitle.textContent = 'すべてのブロックを破壊しました';
            this.achievementText.textContent = '素晴らしいプレイでした！';
        } else {
            this.resultTitle.className = 'result-title defeat';
            this.resultIcon.textContent = 'sentiment_dissatisfied';
            this.resultText.textContent = 'ゲームオーバー';
            this.resultSubtitle.textContent = 'また挑戦してみてください';
            this.achievementText.textContent = '次回は頑張りましょう！';
        }
    }

    /**
     * スコアセクションの更新
     */
    updateScoreSection() {
        // アニメーション付きスコア表示
        this.animateNumber(this.finalScore, 0, this.gameResult.finalScore, 2000);
        
        // スコア改善の表示
        const previousBest = this.getPreviousBestScore();
        if (this.gameResult.finalScore > previousBest) {
            this.scoreImprovement.textContent = '新記録達成！';
            this.scoreImprovement.style.color = '#27ae60';
        } else if (previousBest > 0) {
            this.scoreImprovement.textContent = `ベストスコア: ${previousBest}`;
            this.scoreImprovement.style.color = '#666';
        } else {
            this.scoreImprovement.textContent = '初回プレイお疲れ様でした！';
            this.scoreImprovement.style.color = '#3498db';
        }
    }

    /**
     * 統計セクションの更新
     */
    updateStatsSection() {
        this.playTimeValue.textContent = this.gameResult.playTime;
        this.blocksValue.textContent = `${this.gameResult.blocksDestroyed}/${this.gameResult.totalBlocks}`;
        this.difficultyValue.textContent = this.gameResult.difficulty;
        this.livesValue.textContent = this.gameResult.remainingLives;
        
        // 統計カードの色分け
        this.updateStatCardColors();
    }

    /**
     * 進捗セクションの更新
     */
    updateProgressSection() {
        const percentage = Math.round((this.gameResult.blocksDestroyed / this.gameResult.totalBlocks) * 100);
        this.progressPercentage.textContent = `${percentage}%`;
        
        // 進捗バーのクラス設定
        this.progressFill.className = 'progress-fill';
        if (percentage >= 80) {
            this.progressFill.classList.add('high');
        } else if (percentage >= 50) {
            this.progressFill.classList.add('medium');
        } else {
            this.progressFill.classList.add('low');
        }
        
        // アニメーション付き進捗表示
        setTimeout(() => {
            this.progressFill.style.width = `${percentage}%`;
        }, 500);
    }

    /**
     * モチベーションメッセージの更新
     */
    updateMotivationMessage() {
        const messages = this.getMotivationMessages();
        this.motivationMessage.textContent = messages[Math.floor(Math.random() * messages.length)];
    }

    /**
     * 統計カードの色分け
     */
    updateStatCardColors() {
        const statCards = document.querySelectorAll('.stat-card');
        const colors = ['#3498db', '#e74c3c', '#f39c12', '#27ae60'];
        
        statCards.forEach((card, index) => {
            card.style.borderLeftColor = colors[index % colors.length];
        });
    }

    /**
     * アニメーション開始
     */
    startAnimations() {
        // カード要素に順次アニメーションを適用
        const cards = document.querySelectorAll('.stat-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.animation = `slideIn 0.6s ease-out ${index * 0.1}s both`;
            }, 300);
        });
        
        // ボタンのアニメーション
        setTimeout(() => {
            this.replayBtn.style.animation = 'fadeIn 0.8s ease-out';
            this.settingsBtn.style.animation = 'fadeIn 0.8s ease-out 0.2s both';
        }, 1000);
    }

    /**
     * 紙吹雪エフェクト生成
     */
    createConfetti() {
        const container = document.getElementById('celebrationContainer');
        const colors = ['#e74c3c', '#f39c12', '#f1c40f', '#27ae60', '#3498db', '#9b59b6'];
        
        for (let i = 0; i < 30; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
            
            container.appendChild(confetti);
            
            // 5秒後に削除
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, 8000);
        }
    }

    /**
     * 数値アニメーション
     */
    animateNumber(element, start, end, duration) {
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // イージング関数（easeOutCubic）
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.round(start + (end - start) * easeProgress);
            
            element.textContent = currentValue.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    /**
     * 前回のベストスコア取得
     */
    getPreviousBestScore() {
        try {
            const bestScore = localStorage.getItem('bestScore');
            return bestScore ? parseInt(bestScore) : 0;
        } catch {
            return 0;
        }
    }

    /**
     * ベストスコア更新
     */
    updateBestScore() {
        try {
            const currentBest = this.getPreviousBestScore();
            if (this.gameResult.finalScore > currentBest) {
                localStorage.setItem('bestScore', this.gameResult.finalScore.toString());
                return true;
            }
        } catch (error) {
            console.error('ベストスコアの更新に失敗しました:', error);
        }
        return false;
    }

    /**
     * モチベーションメッセージ取得
     */
    getMotivationMessages() {
        const { isVictory, finalScore, blocksDestroyed, totalBlocks } = this.gameResult;
        const percentage = (blocksDestroyed / totalBlocks) * 100;
        
        if (isVictory) {
            return [
                '完璧なプレイでした！素晴らしい技術です！',
                '見事なクリア！次回はさらなる高速クリアに挑戦してみてください！',
                'エキスパートプレイヤーですね！他の難易度も試してみませんか？'
            ];
        } else if (percentage >= 80) {
            return [
                'あと少しでクリアでした！次回は必ずクリアできるはずです！',
                '素晴らしい進歩です！もう一度挑戦してみてください！',
                'ほぼ完璧でした！次のプレイが楽しみです！'
            ];
        } else if (percentage >= 50) {
            return [
                'いい調子です！練習を続ければ必ずクリアできます！',
                '着実に上達していますね！頑張って続けてください！',
                'コツを掴んできましたね！次回はさらに上を目指しましょう！'
            ];
        } else {
            return [
                'まだ始まったばかりです！練習すれば必ず上達します！',
                'ブロック崩しは奥が深いゲームです。楽しみながら続けてください！',
                '最初は誰でも苦戦します。諦めずに挑戦し続けてください！'
            ];
        }
    }

    /**
     * 再プレイ処理
     */
    handleReplay() {
        try {
            // ボタン状態を更新
            this.replayBtn.disabled = true;
            this.replayBtn.innerHTML = '<span class="material-icons">hourglass_empty</span>準備中...';
            
            // 短いディレイの後にゲーム画面に遷移
            setTimeout(() => {
                NavigationManager.goToGame();
            }, 500);
            
            console.log('再プレイを開始');
        } catch (error) {
            console.error('再プレイの開始に失敗しました:', error);
            this.showErrorMessage('再プレイの開始に失敗しました。');
            
            // ボタンを元に戻す
            this.replayBtn.disabled = false;
            this.replayBtn.innerHTML = '<span class="material-icons">replay</span>同じ設定でもう一度';
        }
    }

    /**
     * 設定画面遷移処理
     */
    handleSettings() {
        try {
            NavigationManager.goToSettings();
            console.log('設定画面に遷移');
        } catch (error) {
            console.error('設定画面への遷移に失敗しました:', error);
            this.showErrorMessage('設定画面への遷移に失敗しました。');
        }
    }

    /**
     * 結果切り替え（デバッグ用）
     */
    toggleResult() {
        this.gameResult.isVictory = !this.gameResult.isVictory;
        
        if (this.gameResult.isVictory) {
            this.gameResult.finalScore = Utils.randomInt(800, 1500);
            this.gameResult.blocksDestroyed = this.gameResult.totalBlocks;
            this.gameResult.remainingLives = Utils.randomInt(1, 3);
        } else {
            this.gameResult.finalScore = Utils.randomInt(200, 800);
            this.gameResult.blocksDestroyed = Utils.randomInt(10, 35);
            this.gameResult.remainingLives = 0;
        }
        
        // 表示を更新
        this.displayResults();
        console.log('結果を切り替えました:', this.gameResult);
    }

    /**
     * デフォルト結果データ取得
     */
    getDefaultResult() {
        return {
            isVictory: false,
            finalScore: 320,
            playTime: '2:45',
            blocksDestroyed: 18,
            totalBlocks: 40,
            remainingLives: 0,
            difficulty: '標準'
        };
    }

    /**
     * エラー状態表示
     */
    showErrorState() {
        this.resultText.textContent = 'エラーが発生しました';
        this.resultSubtitle.textContent = 'ページを再読み込みしてください';
        this.motivationMessage.textContent = '申し訳ございません。技術的な問題が発生しました。';
    }

    /**
     * エラーメッセージの表示
     */
    showErrorMessage(message) {
        // 簡単な通知実装
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #e74c3c, #c0392b);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 8px 16px rgba(231, 76, 60, 0.3);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    /**
     * クリーンアップ処理
     */
    destroy() {
        if (!this.isInitialized) return;

        // イベントリスナーの削除
        this.replayBtn?.removeEventListener('click', this.handleReplay);
        this.settingsBtn?.removeEventListener('click', this.handleSettings);

        this.isInitialized = false;
        console.log('ゲームオーバー画面のクリーンアップ完了');
    }
}

// グローバルインスタンス
let gameOverController;

// DOM読み込み完了時に初期化
document.addEventListener('DOMContentLoaded', () => {
    gameOverController = new GameOverController();
    gameOverController.init();
});

// ページ離脱時のクリーンアップ
window.addEventListener('beforeunload', () => {
    gameOverController?.destroy();
});

// エクスポート（モジュール使用時）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameOverController };
}