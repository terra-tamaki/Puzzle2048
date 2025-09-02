/**
 * Puzzle2048 アニメーションコントローラー
 * 
 * タイルの移動、合体、出現アニメーションを制御します。
 * 60FPS滑らかなアニメーションでユーザー体験を向上させます。
 */

class AnimationController {
    constructor() {
        this.animationQueue = [];
        this.isAnimating = false;
        this.animationSpeed = 1; // 1-3の速度設定
        this.gridElement = document.getElementById('game-grid');
    }

    /**
     * アニメーション速度を設定
     * @param {number} speed - 1(遅い) から 3(速い)
     */
    setSpeed(speed) {
        this.animationSpeed = Math.max(1, Math.min(3, speed));
    }

    /**
     * 基本アニメーション継続時間を取得
     */
    getBaseDuration() {
        const baseDuration = 300; // 基本300ms
        return baseDuration / this.animationSpeed;
    }

    /**
     * タイル移動アニメーション
     * @param {HTMLElement} tileElement - タイル要素
     * @param {Object} fromPos - 開始位置 {x, y}
     * @param {Object} toPos - 終了位置 {x, y}
     * @returns {Promise} アニメーション完了Promise
     */
    animateMove(tileElement, fromPos, toPos) {
        return new Promise(resolve => {
            const duration = this.getBaseDuration();
            
            // 開始位置を設定
            tileElement.style.left = `${fromPos.x}px`;
            tileElement.style.top = `${fromPos.y}px`;
            
            // アニメーション設定
            tileElement.style.transition = `all ${duration}ms ease-in-out`;
            
            // 少し遅延してから移動開始（レンダリング確保）
            requestAnimationFrame(() => {
                tileElement.style.left = `${toPos.x}px`;
                tileElement.style.top = `${toPos.y}px`;
            });

            // アニメーション完了を待機
            setTimeout(resolve, duration);
        });
    }

    /**
     * タイル合体エフェクト
     * @param {HTMLElement} tileElement - 合体するタイル要素
     * @returns {Promise} アニメーション完了Promise
     */
    animateMerge(tileElement) {
        return new Promise(resolve => {
            const duration = this.getBaseDuration() * 0.8; // 少し短めに
            
            // 合体アニメーションクラスを追加
            tileElement.classList.add('tile-merged');
            
            // スケール・回転アニメーション
            tileElement.style.animation = `tile-merge ${duration}ms ease-out`;
            
            setTimeout(() => {
                tileElement.classList.remove('tile-merged');
                tileElement.style.animation = '';
                resolve();
            }, duration);
        });
    }

    /**
     * 新タイル出現アニメーション
     * @param {HTMLElement} tileElement - 新しいタイル要素
     * @returns {Promise} アニメーション完了Promise
     */
    animateAppear(tileElement) {
        return new Promise(resolve => {
            const duration = this.getBaseDuration() * 0.6; // 短めに
            
            // 出現アニメーションクラスを追加
            tileElement.classList.add('tile-new');
            
            // 回転・スケールアニメーション
            tileElement.style.animation = `tile-appear ${duration}ms ease-out`;
            
            setTimeout(() => {
                tileElement.classList.remove('tile-new');
                tileElement.style.animation = '';
                resolve();
            }, duration);
        });
    }

    /**
     * スコア増加エフェクト
     * @param {number} points - 増加ポイント
     * @param {Object} position - 表示位置 {x, y}
     * @returns {Promise} アニメーション完了Promise
     */
    animateScoreIncrease(points, position) {
        return new Promise(resolve => {
            // スコア増加表示要素を作成
            const scoreElement = document.createElement('div');
            scoreElement.className = 'score-popup';
            scoreElement.textContent = `+${points}`;
            
            // 位置とスタイル設定
            scoreElement.style.cssText = `
                position: absolute;
                left: ${position.x}px;
                top: ${position.y}px;
                font-size: 24px;
                font-weight: 900;
                color: #00b894;
                z-index: 100;
                pointer-events: none;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            `;

            this.gridElement.appendChild(scoreElement);

            // アニメーション実行
            const duration = this.getBaseDuration();
            scoreElement.style.transition = `all ${duration}ms ease-out`;
            
            requestAnimationFrame(() => {
                scoreElement.style.transform = 'translateY(-50px) scale(1.5)';
                scoreElement.style.opacity = '0';
            });

            // 要素削除
            setTimeout(() => {
                if (scoreElement.parentNode) {
                    scoreElement.parentNode.removeChild(scoreElement);
                }
                resolve();
            }, duration);
        });
    }

    /**
     * 勝利演出アニメーション
     * @returns {Promise} アニメーション完了Promise
     */
    animateVictory() {
        return new Promise(resolve => {
            // 2048タイルを探す
            const tile2048 = document.querySelector('.tile-2048');
            
            if (tile2048) {
                // 特別な勝利エフェクト
                tile2048.style.animation = 'victory-celebration 2s ease-in-out';
                
                // パーティクルエフェクト（簡易版）
                this.createParticleEffect(tile2048);
            }

            // 画面全体の祝福エフェクト
            document.body.style.animation = 'victory-flash 0.5s ease-in-out 3';

            setTimeout(() => {
                if (tile2048) {
                    tile2048.style.animation = '';
                }
                document.body.style.animation = '';
                resolve();
            }, 2000);
        });
    }

    /**
     * グリッド振動エフェクト（無効な操作時）
     * @returns {Promise} アニメーション完了Promise
     */
    animateShake() {
        return new Promise(resolve => {
            const duration = 300;
            
            this.gridElement.style.animation = `grid-shake ${duration}ms ease-in-out`;
            
            setTimeout(() => {
                this.gridElement.style.animation = '';
                resolve();
            }, duration);
        });
    }

    /**
     * パーティクルエフェクト作成（勝利時）
     */
    createParticleEffect(centerElement) {
        const rect = centerElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.className = 'victory-particle';
            
            const angle = (i / 12) * Math.PI * 2;
            const distance = 100 + Math.random() * 50;
            const endX = centerX + Math.cos(angle) * distance;
            const endY = centerY + Math.sin(angle) * distance;

            particle.style.cssText = `
                position: fixed;
                left: ${centerX}px;
                top: ${centerY}px;
                width: 8px;
                height: 8px;
                background: linear-gradient(45deg, #ffd700, #ff6348);
                border-radius: 50%;
                z-index: 1000;
                pointer-events: none;
            `;

            document.body.appendChild(particle);

            // パーティクル移動アニメーション
            requestAnimationFrame(() => {
                particle.style.transition = 'all 1s ease-out';
                particle.style.left = `${endX}px`;
                particle.style.top = `${endY}px`;
                particle.style.opacity = '0';
                particle.style.transform = 'scale(2)';
            });

            // パーティクル削除
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1000);
        }
    }

    /**
     * 複数アニメーションの並列実行
     * @param {Array} animations - アニメーション関数の配列
     * @returns {Promise} 全アニメーション完了Promise
     */
    async runAnimations(animations) {
        this.isAnimating = true;
        
        try {
            await Promise.all(animations);
        } catch (error) {
            console.error('Animation error:', error);
        }
        
        this.isAnimating = false;
    }

    /**
     * アニメーション実行中かどうか
     */
    getIsAnimating() {
        return this.isAnimating;
    }

    /**
     * 全アニメーションをクリア
     */
    clearAllAnimations() {
        // 実行中のアニメーションを停止
        const animatedElements = document.querySelectorAll('.tile, .score-popup, .victory-particle');
        animatedElements.forEach(element => {
            element.style.animation = '';
            element.style.transition = '';
        });

        this.isAnimating = false;
        this.animationQueue = [];
    }
}

// CSS Animations追加（動的に追加）
const additionalStyles = `
/* ===== 勝利・エフェクト用アニメーション ===== */
@keyframes victory-celebration {
    0%, 100% { transform: scale(1) rotate(0deg); }
    25% { transform: scale(1.2) rotate(5deg); }
    50% { transform: scale(1.3) rotate(-5deg); }
    75% { transform: scale(1.2) rotate(3deg); }
}

@keyframes victory-flash {
    0%, 100% { background: linear-gradient(135deg, #a8e6a3 0%, #81c784 100%); }
    50% { background: linear-gradient(135deg, #ffd700 0%, #ff6348 100%); }
}

@keyframes grid-shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-5px); }
    40% { transform: translateX(5px); }
    60% { transform: translateX(-3px); }
    80% { transform: translateX(3px); }
}

/* ===== スコアポップアップ ===== */
.score-popup {
    font-family: 'Noto Sans JP', Arial, sans-serif;
    user-select: none;
}
`;

// スタイルを動的追加
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// グローバルで利用可能にする
window.AnimationController = AnimationController;