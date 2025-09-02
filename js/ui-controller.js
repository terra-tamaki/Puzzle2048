/**
 * Puzzle2048 UI コントローラー
 * 
 * ゲーム画面の描画、ユーザー操作、UI更新を管理します。
 * GameEngineと連携してゲーム状態を視覚的に表現します。
 */

class UIController {
    constructor(gameEngine) {
        this.game = gameEngine;
        this.gridElement = document.getElementById('game-grid');
        this.currentScoreElement = document.getElementById('current-score');
        this.bestScoreElement = document.getElementById('best-score');
        this.overlayElement = document.getElementById('game-overlay');
        this.overlayMessageElement = document.getElementById('overlay-message');
        this.overlaySubmessageElement = document.getElementById('overlay-submessage');
        
        // デバッグ要素
        this.debugElement = document.getElementById('debug-info');
        this.movesElement = document.getElementById('moves-count');
        this.mergeCountElement = document.getElementById('merge-count');
        this.maxTileElement = document.getElementById('max-tile');
        this.statusElement = document.getElementById('game-status');
        
        this.isAnimating = false;
        this.tileElements = new Map(); // タイルID -> DOM要素のマッピング
        this.animationController = new AnimationController();
        this.audioManager = new AudioManager();
        
        this.initializeEventListeners();
        this.initializeAudio();
        this.setupDynamicGrid();
        this.updateDisplay();
        this.render();
    }

    /**
     * 動的グリッド設定
     */
    setupDynamicGrid() {
        const gridSize = this.game.gridSize;
        const difficulty = this.game.difficulty;
        
        // グリッドのCSS設定を動的に変更
        this.gridElement.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        this.gridElement.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
        
        // 難易度に応じたグリッドサイズ調整
        const containerSizes = {
            easy: { desktop: 600, mobile: 400 },
            normal: { desktop: 650, mobile: 420 },
            hard: { desktop: 700, mobile: 450 },
            expert: { desktop: 800, mobile: 500 }
        };
        
        const sizes = containerSizes[difficulty] || containerSizes.easy;
        const isMobile = window.innerWidth <= 768;
        const containerSize = isMobile ? sizes.mobile : sizes.desktop;
        
        this.gridElement.style.width = `${containerSize}px`;
        this.gridElement.style.height = `${containerSize}px`;
        
        // 既存のグリッドセルをクリア
        const existingCells = this.gridElement.querySelectorAll('.grid-cell');
        existingCells.forEach(cell => cell.remove());
        
        // 新しいグリッドセルを生成
        for (let i = 0; i < gridSize * gridSize; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            this.gridElement.appendChild(cell);
        }
        
        // タイル位置計算パラメータを更新
        this.updatePositionCalculation(containerSize, gridSize);
    }

    /**
     * 位置計算パラメータを更新
     */
    updatePositionCalculation(containerSize, gridSize) {
        const padding = 20;
        const gap = 15;
        const availableSpace = containerSize - (2 * padding) - ((gridSize - 1) * gap);
        this.cellSize = availableSpace / gridSize;
        this.gap = gap;
        this.padding = padding;
    }

    /**
     * 音響システム初期化
     */
    async initializeAudio() {
        this.audioManager.loadSettings();
        
        // 最初のユーザーインタラクションで音響を初期化
        const initAudioOnFirstInteraction = async () => {
            await this.audioManager.initializeOnUserAction();
            document.removeEventListener('click', initAudioOnFirstInteraction);
            document.removeEventListener('keydown', initAudioOnFirstInteraction);
        };
        
        document.addEventListener('click', initAudioOnFirstInteraction);
        document.addEventListener('keydown', initAudioOnFirstInteraction);
    }

    /**
     * イベントリスナーの初期化
     */
    initializeEventListeners() {
        // キーボード操作
        document.addEventListener('keydown', (event) => {
            this.handleKeyPress(event);
        });

        // リスタートボタン
        document.getElementById('restart-button').addEventListener('click', () => {
            this.restartGame();
        });

        // オーバーレイボタン
        document.getElementById('continue-button').addEventListener('click', () => {
            this.hideOverlay();
        });

        document.getElementById('restart-from-overlay').addEventListener('click', () => {
            this.restartGame();
        });

        document.getElementById('view-result').addEventListener('click', () => {
            this.goToResultPage();
        });

        // デバッグモード切り替え（開発用）
        document.addEventListener('keydown', (event) => {
            if (event.key === 'F12' || (event.ctrlKey && event.key === 'd')) {
                event.preventDefault();
                this.toggleDebugMode();
            }
        });
    }

    /**
     * キーボード操作の処理
     */
    handleKeyPress(event) {
        if (this.isAnimating) {
            return; // アニメーション中は操作を無効化
        }

        let direction = null;

        switch (event.key) {
            case 'ArrowLeft':
                direction = 'left';
                break;
            case 'ArrowRight':
                direction = 'right';
                break;
            case 'ArrowUp':
                direction = 'up';
                break;
            case 'ArrowDown':
                direction = 'down';
                break;
            case 'r':
            case 'R':
                this.restartGame();
                return;
            case 'Escape':
                this.togglePause();
                return;
            case 'm':
            case 'M':
                this.toggleMute();
                return;
            default:
                return; // 無関係なキーは無視
        }

        if (direction) {
            event.preventDefault();
            this.moveAndUpdate(direction);
        }
    }

    /**
     * タイル移動と画面更新（アニメーション付き）
     */
    async moveAndUpdate(direction) {
        if (this.isAnimating || this.animationController.getIsAnimating()) {
            return; // アニメーション中は操作無効
        }

        this.isAnimating = true;

        // 移動前の状態を保存
        const previousGrid = this.game.grid.map(row => [...row]);
        
        // ゲームロジック実行
        const result = this.game.move(direction);

        if (result.moved) {
            // 移動音再生
            this.audioManager.playSound('move');
            
            // 移動アニメーション実行
            await this.animateMove(previousGrid, this.game.grid, result);
            
            // 画面を更新
            this.render();
            this.updateDisplay();

            // 合体エフェクト
            if (result.mergeOccurred) {
                // 合体音再生（最大タイル値で音階決定）
                const maxMergedValue = Math.max(...result.mergedTiles.map(t => t.value));
                this.audioManager.playSound('merge', maxMergedValue);
                
                await this.animateMergeEffects(result.mergedTiles);
            }

            // スコア増加エフェクト
            if (result.scoreIncrease > 0) {
                const mergedTile = result.mergedTiles[0];
                if (mergedTile) {
                    const position = this.calculateTilePosition(mergedTile.row, mergedTile.col);
                    await this.animationController.animateScoreIncrease(
                        result.scoreIncrease, 
                        { x: position.x + 60, y: position.y + 60 }
                    );
                }
            }

            // 新タイル出現アニメーション
            await this.animateNewTiles();

            // ゲーム終了チェック
            this.checkGameEnd();
        } else {
            // 無効な移動の場合は振動エフェクト＋無効音
            this.audioManager.playSound('invalid');
            await this.animationController.animateShake();
        }

        this.isAnimating = false;
    }

    /**
     * タイル移動アニメーション
     */
    async animateMove(previousGrid, newGrid, result) {
        const animations = [];

        for (let row = 0; row < this.game.gridSize; row++) {
            for (let col = 0; col < this.game.gridSize; col++) {
                const previousTile = previousGrid[row][col];
                const newTile = newGrid[row][col];

                if (previousTile && newTile && previousTile.id !== newTile.id) {
                    // タイルが移動した場合
                    const tileElement = this.tileElements.get(previousTile.id);
                    if (tileElement) {
                        const fromPos = this.calculateTilePosition(row, col);
                        const toPos = this.calculateTilePosition(newTile.row, newTile.col);
                        
                        animations.push(
                            this.animationController.animateMove(tileElement, fromPos, toPos)
                        );
                    }
                }
            }
        }

        if (animations.length > 0) {
            await this.animationController.runAnimations(animations);
        }
    }

    /**
     * 合体エフェクト実行
     */
    async animateMergeEffects(mergedTiles) {
        const animations = mergedTiles.map(tile => {
            const tileElement = this.tileElements.get(tile.id);
            if (tileElement) {
                return this.animationController.animateMerge(tileElement);
            }
            return Promise.resolve();
        });

        await this.animationController.runAnimations(animations);
    }

    /**
     * 新タイル出現アニメーション
     */
    async animateNewTiles() {
        const newTiles = [];
        
        for (let row = 0; row < this.game.gridSize; row++) {
            for (let col = 0; col < this.game.gridSize; col++) {
                const tile = this.game.grid[row][col];
                if (tile && tile.isNew) {
                    newTiles.push(tile);
                }
            }
        }

        if (newTiles.length > 0) {
            const animations = newTiles.map(tile => {
                const tileElement = this.tileElements.get(tile.id);
                if (tileElement) {
                    return this.animationController.animateAppear(tileElement);
                }
                return Promise.resolve();
            });

            await this.animationController.runAnimations(animations);
        }
    }

    /**
     * ゲーム画面を描画
     */
    render() {
        // 既存のタイル要素をクリア
        const existingTiles = this.gridElement.querySelectorAll('.tile');
        existingTiles.forEach(tile => tile.remove());
        this.tileElements.clear();

        // 新しいタイルを描画
        for (let row = 0; row < this.game.gridSize; row++) {
            for (let col = 0; col < this.game.gridSize; col++) {
                const tile = this.game.grid[row][col];
                if (tile) {
                    this.createTileElement(tile);
                }
            }
        }
    }

    /**
     * タイル要素を作成してDOMに追加
     */
    createTileElement(tile) {
        const tileElement = document.createElement('div');
        tileElement.className = `tile tile-${tile.value}`;
        tileElement.textContent = tile.value;
        tileElement.id = tile.id;

        // 動的サイズ設定
        tileElement.style.width = `${this.cellSize}px`;
        tileElement.style.height = `${this.cellSize}px`;
        
        // フォントサイズを動的調整
        const fontSize = this.calculateFontSize(tile.value, this.cellSize);
        tileElement.style.fontSize = `${fontSize}px`;

        // 位置を設定
        const position = this.calculateTilePosition(tile.row, tile.col);
        tileElement.style.left = `${position.x}px`;
        tileElement.style.top = `${position.y}px`;

        // アニメーションクラスを追加
        if (tile.isNew) {
            tileElement.classList.add('tile-new');
        }
        if (tile.justMerged) {
            tileElement.classList.add('tile-merged');
        }

        this.gridElement.appendChild(tileElement);
        this.tileElements.set(tile.id, tileElement);
    }

    /**
     * タイル値とサイズに応じたフォントサイズを計算
     */
    calculateFontSize(tileValue, cellSize) {
        const baseRatio = 0.42; // セルサイズに対するフォントサイズの比率
        let fontSize = cellSize * baseRatio;
        
        // 大きな数値の場合はフォントサイズを調整
        if (tileValue >= 1024) {
            fontSize *= 0.75;
        } else if (tileValue >= 128) {
            fontSize *= 0.9;
        }
        
        return Math.max(12, Math.floor(fontSize)); // 最小12px
    }

    /**
     * グリッド座標からピクセル位置を計算
     */
    calculateTilePosition(row, col) {
        return {
            x: this.padding + col * (this.cellSize + this.gap),
            y: this.padding + row * (this.cellSize + this.gap)
        };
    }

    /**
     * スコア・統計表示を更新
     */
    updateDisplay() {
        const gameState = this.game.getGameState();

        // スコア更新
        this.currentScoreElement.textContent = gameState.score.toLocaleString();
        this.bestScoreElement.textContent = gameState.bestScore.toLocaleString();

        // ベストスコア更新時のアニメーション
        if (gameState.score === gameState.bestScore && gameState.score > 0) {
            this.bestScoreElement.classList.add('score-increase');
            setTimeout(() => {
                this.bestScoreElement.classList.remove('score-increase');
            }, 600);
        }

        // デバッグ情報更新
        if (this.debugElement && this.debugElement.style.display !== 'none') {
            this.updateDebugDisplay(gameState);
        }
    }

    /**
     * デバッグ情報の更新
     */
    updateDebugDisplay(gameState) {
        if (this.movesElement) this.movesElement.textContent = gameState.moves;
        if (this.mergeCountElement) this.mergeCountElement.textContent = gameState.mergeCount;
        if (this.maxTileElement) this.maxTileElement.textContent = gameState.maxTile;
        if (this.statusElement) this.statusElement.textContent = gameState.status;
    }

    /**
     * ゲーム終了チェックとオーバーレイ表示
     */
    async checkGameEnd() {
        const gameState = this.game.getGameState();

        if (gameState.status === 'won') {
            // 勝利音＋演出アニメーション
            this.audioManager.playVictoryFanfare();
            await this.animationController.animateVictory();
            this.showOverlay('🎉 2048達成！', '継続しますか？', 'victory');
        } else if (gameState.status === 'lost') {
            // ゲームオーバー音
            this.audioManager.playGameOverSound();
            this.showOverlay('😅 ゲームオーバー', '結果を確認しますか？', 'gameover');
        }
    }

    /**
     * オーバーレイを表示
     */
    showOverlay(message, submessage, type) {
        this.overlayMessageElement.textContent = message;
        this.overlaySubmessageElement.textContent = submessage;
        
        // ボタンの表示/非表示を制御
        const continueBtn = document.getElementById('continue-button');
        const restartBtn = document.getElementById('restart-from-overlay');
        const resultBtn = document.getElementById('view-result');

        if (type === 'victory') {
            continueBtn.style.display = 'block';
            restartBtn.style.display = 'block';
            resultBtn.style.display = 'block';
        } else {
            continueBtn.style.display = 'none';
            restartBtn.style.display = 'block';
            resultBtn.style.display = 'block';
        }

        this.overlayElement.classList.add('show');
    }

    /**
     * オーバーレイを非表示
     */
    hideOverlay() {
        this.overlayElement.classList.remove('show');
    }

    /**
     * ゲームリスタート
     */
    restartGame() {
        this.hideOverlay();
        this.game.resetGame();
        this.render();
        this.updateDisplay();
        
        // リスタート音
        this.audioManager.playSound('newgame');
        console.log('🔄 ゲームをリスタートしました');
    }

    /**
     * ミュート切り替え
     */
    toggleMute() {
        const isMuted = this.audioManager.toggleMute();
        console.log(`🔊 音響: ${isMuted ? 'ミュート' : 'オン'}`);
        
        // 視覚的フィードバック（簡易）
        if (this.currentScoreElement) {
            this.currentScoreElement.style.color = isMuted ? '#999' : '#333';
            setTimeout(() => {
                this.currentScoreElement.style.color = '#333';
            }, 500);
        }
    }

    /**
     * 結果画面への遷移
     */
    goToResultPage() {
        const gameResult = this.game.getGameResult();
        const gameState = this.game.getGameState();
        
        // 結果データを整形
        const resultData = {
            finalScore: gameResult.finalScore,
            moves: gameResult.moves,
            mergeCount: gameResult.mergeCount,
            maxTile: gameResult.maxTile,
            playTime: Math.floor(gameResult.playTimeMs / 1000), // 秒単位
            status: gameState.status,
            efficiency: gameResult.efficiency,
            difficulty: this.game.difficulty
        };
        
        // 結果データをLocalStorageに保存（難易度別）
        localStorage.setItem('puzzle2048_last_result', JSON.stringify(resultData));
        localStorage.setItem(`puzzle2048_previous_score_${this.game.difficulty}`, gameResult.finalScore.toString());
        
        // 結果画面に遷移
        window.location.href = 'result.html';
    }

    /**
     * 一時停止の切り替え
     */
    togglePause() {
        if (this.game.status === 'playing') {
            this.game.status = 'paused';
            this.showOverlay('⏸️ 一時停止', 'ESCキーで再開', 'paused');
        } else if (this.game.status === 'paused') {
            this.game.status = 'playing';
            this.hideOverlay();
        }
    }

    /**
     * アニメーション完了を待機
     */
    waitForAnimations() {
        return new Promise(resolve => {
            // CSS アニメーション時間に合わせて待機
            setTimeout(resolve, 300);
        });
    }

    /**
     * デバッグモードの切り替え
     */
    toggleDebugMode() {
        if (this.debugElement) {
            const isVisible = this.debugElement.style.display !== 'none';
            this.debugElement.style.display = isVisible ? 'none' : 'block';
            
            if (!isVisible) {
                this.updateDebugDisplay(this.game.getGameState());
            }
        }
    }

    /**
     * グリッドの座標からピクセル位置を取得
     */
    getTilePixelPosition(row, col) {
        return this.calculateTilePosition(row, col);
    }

    /**
     * ゲーム状態の文字列表現を取得（デバッグ用）
     */
    getGameStateString() {
        const state = this.game.getGameState();
        return `Score: ${state.score}, Moves: ${state.moves}, Status: ${state.status}`;
    }
}

// グローバルで利用可能にする
window.UIController = UIController;