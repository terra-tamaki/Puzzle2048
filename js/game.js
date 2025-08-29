/**
 * ブロック崩しゲーム - ゲームエンジン
 * Canvas描画、物理演算、当たり判定、ゲームループを管理
 */

/**
 * ゲームオブジェクトクラス
 */
class GameObject {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    /**
     * 矩形同士の当たり判定
     */
    intersects(other) {
        return (
            this.x < other.x + other.width &&
            this.x + this.width > other.x &&
            this.y < other.y + other.height &&
            this.y + this.height > other.y
        );
    }

    /**
     * 中心座標を取得
     */
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }
}

/**
 * ボールクラス
 */
class Ball extends GameObject {
    constructor(x, y, radius, vx, vy) {
        super(x - radius, y - radius, radius * 2, radius * 2);
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.maxSpeed = 8;
        this.minSpeed = 2;
    }

    /**
     * 位置の更新
     */
    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // 速度制限
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.maxSpeed) {
            this.vx = (this.vx / speed) * this.maxSpeed;
            this.vy = (this.vy / speed) * this.maxSpeed;
        } else if (speed < this.minSpeed) {
            this.vx = (this.vx / speed) * this.minSpeed;
            this.vy = (this.vy / speed) * this.minSpeed;
        }
    }

    /**
     * 壁との衝突処理
     */
    handleWallCollision(canvasWidth, canvasHeight) {
        // 左右の壁
        if (this.x <= 0) {
            this.x = 0;
            this.vx = Math.abs(this.vx);
        } else if (this.x + this.width >= canvasWidth) {
            this.x = canvasWidth - this.width;
            this.vx = -Math.abs(this.vx);
        }
        
        // 上の壁
        if (this.y <= 0) {
            this.y = 0;
            this.vy = Math.abs(this.vy);
        }
        
        // 下の壁（ミス判定）
        return this.y + this.height >= canvasHeight;
    }

    /**
     * パドルとの衝突処理
     */
    handlePaddleCollision(paddle) {
        if (!this.intersects(paddle)) return false;

        // ボールがパドルの上側に当たった場合のみ処理
        if (this.y + this.height - this.vy <= paddle.y) {
            this.y = paddle.y - this.height;
            
            // パドルとの接触位置に応じて反射角度を調整
            const paddleCenter = paddle.x + paddle.width / 2;
            const ballCenter = this.x + this.width / 2;
            const relativeIntersectX = ballCenter - paddleCenter;
            const normalizedRelativeIntersection = relativeIntersectX / (paddle.width / 2);
            
            // 反射角度を計算（最大60度）
            const bounceAngle = normalizedRelativeIntersection * Math.PI / 3;
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            
            this.vx = speed * Math.sin(bounceAngle);
            this.vy = -Math.abs(speed * Math.cos(bounceAngle));
            
            return true;
        }
        
        return false;
    }

    /**
     * ブロックとの衝突処理
     */
    handleBlockCollision(block) {
        if (!this.intersects(block)) return false;

        // 衝突方向を判定
        const ballCenter = this.getCenter();
        const blockCenter = block.getCenter();
        
        const dx = ballCenter.x - blockCenter.x;
        const dy = ballCenter.y - blockCenter.y;
        
        const overlapX = (this.width + block.width) / 2 - Math.abs(dx);
        const overlapY = (this.height + block.height) / 2 - Math.abs(dy);
        
        // より小さい重なりの方向で反射
        if (overlapX < overlapY) {
            // 水平方向の衝突
            this.vx = dx > 0 ? Math.abs(this.vx) : -Math.abs(this.vx);
        } else {
            // 垂直方向の衝突
            this.vy = dy > 0 ? Math.abs(this.vy) : -Math.abs(this.vy);
        }
        
        return true;
    }

    /**
     * 描画
     */
    render(ctx) {
        const centerX = this.x + this.radius;
        const centerY = this.y + this.radius;
        
        // グラデーション効果
        const gradient = ctx.createRadialGradient(
            centerX - this.radius * 0.3, centerY - this.radius * 0.3, 0,
            centerX, centerY, this.radius
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.7, '#3498db');
        gradient.addColorStop(1, '#2980b9');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 輝きエフェクト
        ctx.shadowColor = '#3498db';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

/**
 * パドルクラス
 */
class Paddle extends GameObject {
    constructor(x, y, width, height, ballSpeed = 3) {
        super(x, y, width, height);
        this.targetX = x;
        this.velocity = 0;
        this.speed = 0.2; // マウスと同じなめらかさ
        this.keyboardMoveSpeed = ballSpeed + 1; // キーボード移動距離
    }

    /**
     * 目標位置の設定
     */
    setTargetX(x, canvasWidth) {
        this.targetX = Utils.clamp(x - this.width / 2, 0, canvasWidth - this.width);
    }

    /**
     * 位置の更新（マウスと同じなめらかな追従）
     */
    update() {
        // マウスと全く同じなめらかな追従処理
        const dx = this.targetX - this.x;
        this.x += dx * this.speed;
        
        // 境界制限
        this.x = Utils.clamp(this.x, 0, 800 - this.width);
    }

    /**
     * 描画
     */
    render(ctx) {
        // パドル本体のグラデーション
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, '#9b59b6');
        gradient.addColorStop(0.5, '#8e44ad');
        gradient.addColorStop(1, '#732d91');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 輝きエフェクト
        ctx.shadowColor = '#9b59b6';
        ctx.shadowBlur = 8;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
        
        // ハイライト
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(this.x, this.y, this.width, 3);
    }
}

/**
 * ブロッククラス
 */
class Block extends GameObject {
    constructor(x, y, width, height, color, row) {
        super(x, y, width, height);
        this.color = color;
        this.row = row;
        this.destroyed = false;
        this.points = (6 - row) * 10; // 上の行ほど高得点
        this.opacity = 1;
        this.scale = 1;
    }

    /**
     * ブロック破壊処理
     */
    destroy() {
        this.destroyed = true;
    }

    /**
     * ブロック破壊アニメーション
     */
    updateDestroyAnimation() {
        if (this.destroyed) {
            this.opacity -= 0.1;
            this.scale -= 0.05;
            return this.opacity <= 0;
        }
        return false;
    }

    /**
     * 描画
     */
    render(ctx) {
        if (this.destroyed && this.opacity <= 0) return;

        ctx.save();
        
        if (this.destroyed) {
            ctx.globalAlpha = this.opacity;
            
            // 破壊アニメーション用の変形
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;
            ctx.translate(centerX, centerY);
            ctx.scale(this.scale, this.scale);
            ctx.translate(-centerX, -centerY);
        }
        
        // ブロック本体
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 枠線
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // ハイライト効果
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, 'rgba(255,255,255,0.4)');
        gradient.addColorStop(0.5, 'rgba(255,255,255,0.1)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.2)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.restore();
    }
}

/**
 * メインゲームエンジンクラス
 */
class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // ゲーム状態
        this.gameState = {
            score: 0,
            lives: 3,
            level: 1,
            isPaused: false,
            isGameStarted: false,
            isGameOver: false,
            startTime: null,
            gameTime: 0
        };
        
        // ゲームオブジェクト
        this.ball = null;
        this.paddle = null;
        this.blocks = [];
        this.particles = [];
        
        // 設定値の読み込み
        this.settings = SettingsManager.load();
        console.log('読み込んだ設定:', this.settings);
        
        // アニメーション管理
        this.lastTime = 0;
        this.fps = 0;
        this.frameCount = 0;
        this.lastFpsTime = 0;
        
        // キーボード状態管理
        this.keys = {
            left: false,
            right: false
        };
        
        // イベントハンドラー
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleClick = this.handleClick.bind(this);
        
        this.init();
    }

    /**
     * 初期化処理
     */
    init() {
        this.createGameObjects();
        this.setupEventListeners();
        this.updateUI();
        this.showStartOverlay();
        this.render(); // 初期描画
        
        console.log('ゲームエンジン初期化完了', this.settings);
    }

    /**
     * ゲームオブジェクトの作成
     */
    createGameObjects() {
        // ボール作成
        const ballRadius = 10;
        const ballX = this.width / 2;
        const ballY = this.height - 100;
        const ballSpeed = this.settings.ballSpeed || 3;
        
        this.ball = new Ball(ballX, ballY, ballRadius, ballSpeed, -ballSpeed);
        
        // パドル作成（設定に基づく位置）
        const paddleWidth = 120;
        const paddleHeight = 15;
        const paddleX = (this.width - paddleWidth) / 2;
        const paddleY = this.height - 50;
        
        // ブロックとパドルの距離を設定値に基づいて調整
        const blockAreaBottom = 80 + (5 * (30 + 5)); // ブロック領域の下端
        const requiredDistance = this.settings.paddleBlockDistance || 100;
        const adjustedPaddleY = Math.min(paddleY, blockAreaBottom + requiredDistance);
        
        this.paddle = new Paddle(paddleX, adjustedPaddleY, paddleWidth, paddleHeight, ballSpeed);
        
        // ブロック作成
        this.createBlocks();
    }

    /**
     * ブロック配置の生成
     */
    createBlocks() {
        this.blocks = [];
        
        const rows = 5;
        const cols = 8;
        const blockWidth = 80;
        const blockHeight = 30;
        const blockSpacing = 5;
        const offsetX = (this.width - (cols * blockWidth + (cols - 1) * blockSpacing)) / 2;
        const offsetY = 80;
        
        const colors = [
            '#e74c3c', // 赤
            '#f39c12', // オレンジ  
            '#f1c40f', // 黄
            '#27ae60', // 緑
            '#3498db'  // 青
        ];
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = offsetX + col * (blockWidth + blockSpacing);
                const y = offsetY + row * (blockHeight + blockSpacing);
                const color = colors[row];
                
                const block = new Block(x, y, blockWidth, blockHeight, color, row + 1);
                this.blocks.push(block);
            }
        }
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
        this.canvas.addEventListener('click', this.handleClick);
        
        // UI要素のイベント
        document.getElementById('pauseBtn')?.addEventListener('click', () => this.togglePause());
        document.getElementById('resumeBtn')?.addEventListener('click', () => this.togglePause());
        document.getElementById('settingsBtn')?.addEventListener('click', () => this.goToSettings());
        document.getElementById('gameOverBtn')?.addEventListener('click', () => this.goToGameOver());
    }

    /**
     * マウス移動処理
     */
    handleMouseMove(event) {
        if (!this.gameState.isGameStarted || this.gameState.isPaused) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        
        // Canvas座標に正確に変換
        const scaleX = this.canvas.width / rect.width;
        const adjustedX = mouseX * scaleX;
        
        this.paddle.setTargetX(adjustedX, this.width);
    }

    /**
     * キーボード押下処理
     */
    handleKeyDown(event) {
        switch (event.code) {
            case 'Space':
                event.preventDefault();
                if (!this.gameState.isGameStarted) {
                    this.startGame();
                }
                break;
            case 'Escape':
                event.preventDefault();
                this.togglePause();
                break;
            case 'ArrowLeft':
                event.preventDefault();
                this.keys.left = true;
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.keys.right = true;
                break;
        }
    }

    /**
     * キーボード離上処理
     */
    handleKeyUp(event) {
        switch (event.code) {
            case 'ArrowLeft':
                event.preventDefault();
                this.keys.left = false;
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.keys.right = false;
                break;
        }
    }

    /**
     * クリック処理
     */
    handleClick(event) {
        if (!this.gameState.isGameStarted) {
            this.startGame();
        }
    }

    /**
     * ゲーム開始
     */
    startGame() {
        if (this.gameState.isGameStarted) return;
        
        this.gameState.isGameStarted = true;
        this.gameState.startTime = Date.now();
        this.hideStartOverlay();
        requestAnimationFrame((time) => this.gameLoop(time));
        
        console.log('ゲーム開始');
    }

    /**
     * 一時停止の切り替え
     */
    togglePause() {
        if (!this.gameState.isGameStarted || this.gameState.isGameOver) return;
        
        this.gameState.isPaused = !this.gameState.isPaused;
        
        if (this.gameState.isPaused) {
            this.showPauseOverlay();
        } else {
            this.hidePauseOverlay();
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    }

    /**
     * ゲームループ
     */
    gameLoop(currentTime = 0) {
        if (this.gameState.isPaused || this.gameState.isGameOver) return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // FPS計算
        this.frameCount++;
        if (currentTime - this.lastFpsTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsTime = currentTime;
            this.updateFpsDisplay();
        }
        
        // ゲーム時間更新
        this.gameState.gameTime = Date.now() - this.gameState.startTime;
        
        // 更新処理
        this.update(deltaTime);
        
        // 描画処理
        this.render();
        
        // 次フレーム
        if (this.gameState.isGameStarted && !this.gameState.isGameOver) {
            requestAnimationFrame((time) => this.gameLoop(time));
        }
    }

    /**
     * ゲーム状態更新
     */
    update(deltaTime) {
        // キーボード入力でtargetXを更新（マウスと同じ方式）
        if (this.gameState.isGameStarted && !this.gameState.isPaused) {
            if (this.keys.left) {
                const newTargetX = this.paddle.targetX - this.paddle.keyboardMoveSpeed;
                this.paddle.setTargetX(newTargetX + this.paddle.width / 2, this.width);
            }
            if (this.keys.right) {
                const newTargetX = this.paddle.targetX + this.paddle.keyboardMoveSpeed;
                this.paddle.setTargetX(newTargetX + this.paddle.width / 2, this.width);
            }
        }
        
        // パドル更新（マウスと同じ追従方式）
        this.paddle.update();
        
        // ボール更新
        this.ball.update();
        
        // 壁との衝突チェック
        const ballMissed = this.ball.handleWallCollision(this.width, this.height);
        if (ballMissed) {
            this.handleBallMiss();
            return;
        }
        
        // パドルとの衝突チェック
        this.ball.handlePaddleCollision(this.paddle);
        
        // ブロックとの衝突チェック
        for (let i = this.blocks.length - 1; i >= 0; i--) {
            const block = this.blocks[i];
            if (block.destroyed) {
                // 破壊アニメーション更新
                if (block.updateDestroyAnimation()) {
                    this.blocks.splice(i, 1);
                }
                continue;
            }
            
            if (this.ball.handleBlockCollision(block)) {
                block.destroy();
                this.gameState.score += block.points;
                this.updateScoreDisplay();
                
                // パーティクル効果（簡略版）
                this.createParticles(block.getCenter(), block.color);
            }
        }
        
        // 勝利条件チェック
        if (this.blocks.every(block => block.destroyed)) {
            this.handleLevelComplete();
        }
    }

    /**
     * ボールミス処理
     */
    handleBallMiss() {
        this.gameState.lives--;
        this.updateLivesDisplay();
        
        if (this.gameState.lives <= 0) {
            this.gameOver(false);
        } else {
            // ボールをリセット
            this.ball.x = this.width / 2 - this.ball.radius;
            this.ball.y = this.height - 100;
            this.ball.vx = this.settings.ballSpeed || 3;
            this.ball.vy = -(this.settings.ballSpeed || 3);
        }
    }

    /**
     * レベル完了処理
     */
    handleLevelComplete() {
        this.gameOver(true);
    }

    /**
     * ゲームオーバー
     */
    gameOver(victory) {
        this.gameState.isGameOver = true;
        
        // 結果データの保存
        const result = {
            isVictory: victory,
            finalScore: this.gameState.score,
            playTime: Utils.formatTime(this.gameState.gameTime / 1000),
            blocksDestroyed: this.blocks.filter(b => b.destroyed).length,
            totalBlocks: this.blocks.length,
            remainingLives: this.gameState.lives,
            difficulty: SettingsManager.getDifficultyLevel(this.settings)
        };
        
        GameResultManager.save(result);
        
        // オーバーレイ表示
        this.showGameOverOverlay(victory);
        
        console.log('ゲーム終了', result);
    }

    /**
     * パーティクル生成
     */
    createParticles(position, color) {
        // 簡単なパーティクル効果の実装
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const speed = Utils.randomInt(2, 5);
            
            this.particles.push({
                x: position.x,
                y: position.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                life: 1.0,
                decay: 0.02
            });
        }
    }

    /**
     * 描画処理
     */
    render() {
        // 背景クリア
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // ゲームオブジェクト描画
        this.ball.render(this.ctx);
        this.paddle.render(this.ctx);
        
        // ブロック描画
        this.blocks.forEach(block => block.render(this.ctx));
        
        // パーティクル描画・更新
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // パーティクル更新
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= particle.decay;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            
            // パーティクル描画
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
            this.ctx.globalAlpha = 1;
        }
    }

    // UI表示関連メソッド
    showStartOverlay() {
        document.getElementById('startOverlay').style.display = 'flex';
    }

    hideStartOverlay() {
        document.getElementById('startOverlay').style.display = 'none';
    }

    showPauseOverlay() {
        document.getElementById('pauseOverlay').style.display = 'flex';
    }

    hidePauseOverlay() {
        document.getElementById('pauseOverlay').style.display = 'none';
    }

    showGameOverOverlay(victory) {
        const overlay = document.getElementById('gameOverOverlay');
        const title = document.getElementById('gameOverTitle');
        const button = document.getElementById('gameOverBtn');
        
        if (victory) {
            title.innerHTML = '<span class="material-icons icon-xl">emoji_events</span>クリア！';
        } else {
            title.innerHTML = '<span class="material-icons icon-xl">sentiment_dissatisfied</span>ゲームオーバー';
        }
        
        document.getElementById('finalScoreDisplay').textContent = this.gameState.score;
        overlay.style.display = 'flex';
    }

    updateScoreDisplay() {
        document.getElementById('scoreValue').textContent = this.gameState.score;
    }

    updateLivesDisplay() {
        const container = document.getElementById('livesContainer');
        container.innerHTML = '';
        
        for (let i = 0; i < this.gameState.lives; i++) {
            const heart = document.createElement('span');
            heart.className = 'material-icons heart';
            heart.textContent = 'favorite';
            container.appendChild(heart);
        }
    }

    updateFpsDisplay() {
        document.getElementById('fpsCounter').textContent = `FPS: ${this.fps}`;
    }

    updateUI() {
        this.updateScoreDisplay();
        this.updateLivesDisplay();
    }

    // ナビゲーション
    goToSettings() {
        if (confirm('ゲームを終了して設定画面に戻りますか？')) {
            NavigationManager.goToSettings();
        }
    }

    goToGameOver() {
        NavigationManager.goToGameOver();
    }

    /**
     * クリーンアップ
     */
    destroy() {
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        this.canvas.removeEventListener('click', this.handleClick);
        
        console.log('ゲームエンジンクリーンアップ完了');
    }
}

// ゲームエンジンインスタンス
let gameEngine;

// DOM読み込み完了時に初期化
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        gameEngine = new GameEngine(canvas);
    }
});

// ページ離脱時のクリーンアップ
window.addEventListener('beforeunload', () => {
    gameEngine?.destroy();
});

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameEngine, Ball, Paddle, Block, GameObject };
}