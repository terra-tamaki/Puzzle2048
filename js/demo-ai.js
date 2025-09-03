/**
 * Puzzle2048 デモプレイAI
 * 
 * 2048到達を目指す自動プレイアルゴリズムを実装します。
 * コーナー戦略とヒューリスティック評価を使用して最適手を選択します。
 */

class DemoAI {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.isRunning = false;
        this.isPaused = false;
        this.speed = 1000; // ミリ秒（1秒間隔）
        this.moveCount = 0;
        this.strategy = 'corner'; // corner, aggressive, balanced
        
        this.moves = ['left', 'right', 'up', 'down'];
        this.preferredOrder = ['left', 'down', 'up', 'right']; // コーナー戦略用
    }

    /**
     * デモプレイを開始
     */
    async startDemo() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.isPaused = false;
        this.moveCount = 0;
        
        console.log('🤖 デモプレイ開始！', {
            strategy: this.strategy,
            speed: this.speed,
            difficulty: this.gameEngine.difficulty,
            target: this.gameEngine.targetTile,
            gameEngine: this.gameEngine,
            gameOver: this.gameEngine.gameOver
        });
        
        // ゲーム状態をチェック
        if (this.gameEngine.gameOver) {
            console.log('❌ ゲームが既に終了しています - 新しいゲームを開始してください');
            this.stopDemo();
            return;
        }
        
        await this.playLoop();
    }

    /**
     * デモプレイを停止
     */
    stopDemo() {
        this.isRunning = false;
        this.isPaused = false;
        console.log('🛑 デモプレイ停止');
    }

    /**
     * デモプレイを一時停止/再開
     */
    togglePause() {
        if (!this.isRunning) return;
        
        this.isPaused = !this.isPaused;
        console.log(this.isPaused ? '⏸️ デモ一時停止' : '▶️ デモ再開');
        
        if (!this.isPaused) {
            this.playLoop();
        }
    }

    /**
     * メインのプレイループ
     */
    async playLoop() {
        console.log('🔄 プレイループ開始');
        
        while (this.isRunning && !this.gameEngine.gameOver) {
            console.log(`📊 ループ中 - isRunning: ${this.isRunning}, isPaused: ${this.isPaused}, gameOver: ${this.gameEngine.gameOver}`);
            
            if (this.isPaused) {
                await this.sleep(100);
                continue;
            }

            // 最適な手を選択
            const bestMove = this.selectBestMove();
            console.log(`🎯 選択された手: ${bestMove}`);
            
            if (!bestMove) {
                console.log('❌ 有効な手がありません - ゲーム終了');
                this.stopDemo();
                break;
            }

            // 手を実行
            console.log(`🤖 手${this.moveCount + 1}: ${bestMove}を実行`);
            
            // UIController経由で移動実行（画面更新付き）
            if (window.ui && window.ui.handleKeyPress) {
                const keyMap = {
                    'left': 'ArrowLeft',
                    'right': 'ArrowRight', 
                    'up': 'ArrowUp',
                    'down': 'ArrowDown'
                };
                
                // キー押下をシミュレート
                const keyEvent = new KeyboardEvent('keydown', {
                    key: keyMap[bestMove],
                    code: keyMap[bestMove]
                });
                
                window.ui.handleKeyPress(keyEvent);
                this.moveCount++;
                this.lastMove = bestMove;
                
                // UI更新
                this.updateDemoUI();
                
                // 勝利判定
                if (this.gameEngine.hasWon()) {
                    console.log('🎉 デモプレイで2048達成！');
                    this.stopDemo();
                    break;
                }
            } else {
                console.log('❌ UIController が見つかりません');
                this.stopDemo();
                break;
            }

            // 次の手まで待機
            await this.sleep(this.speed);
        }

        if (this.gameEngine.gameOver) {
            console.log('💀 デモプレイ失敗 - ゲームオーバー');
            this.stopDemo();
        }
    }

    /**
     * デモUI更新
     */
    updateDemoUI() {
        const movesElement = document.getElementById('demo-moves');
        if (movesElement) {
            movesElement.textContent = `手数: ${this.moveCount}`;
        }
        
        // 方向矢印のハイライト
        this.highlightDirection(this.lastMove);
    }

    /**
     * 選択された方向をハイライト表示
     */
    highlightDirection(direction) {
        // 全ての矢印を非アクティブに
        const arrows = document.querySelectorAll('.demo-arrow');
        arrows.forEach(arrow => arrow.classList.remove('active'));
        
        // 選択された方向をアクティブに
        if (direction) {
            const arrowElement = document.getElementById(`demo-arrow-${direction}`);
            if (arrowElement) {
                arrowElement.classList.add('active');
                
                // 0.5秒後に非アクティブに
                setTimeout(() => {
                    arrowElement.classList.remove('active');
                }, 500);
            }
        }
    }

    /**
     * 最適な手を選択するメインロジック
     */
    selectBestMove() {
        const validMoves = this.getValidMoves();
        
        if (validMoves.length === 0) {
            return null;
        }

        if (validMoves.length === 1) {
            return validMoves[0];
        }

        switch (this.strategy) {
            case 'corner':
                return this.selectCornerStrategyMove(validMoves);
            case 'aggressive':
                return this.selectAggressiveMove(validMoves);
            case 'balanced':
                return this.selectBalancedMove(validMoves);
            default:
                return this.selectCornerStrategyMove(validMoves);
        }
    }

    /**
     * 有効な手（実際にタイルが動く手）を取得
     */
    getValidMoves() {
        const validMoves = [];
        
        for (const move of this.moves) {
            if (this.isValidMove(move)) {
                validMoves.push(move);
            }
        }
        
        console.log('🔍 有効な手一覧:', validMoves);
        return validMoves;
    }

    /**
     * 指定した手が有効かどうかチェック（修正版）
     */
    isValidMove(direction) {
        // 現在のグリッドで実際に移動シミュレーション
        const originalGrid = this.gameEngine.grid;
        
        // 方向別チェック
        switch (direction) {
            case 'left':
                return this.canMoveLeft(originalGrid);
            case 'right':
                return this.canMoveRight(originalGrid);
            case 'up':
                return this.canMoveUp(originalGrid);
            case 'down':
                return this.canMoveDown(originalGrid);
            default:
                return false;
        }
    }

    /**
     * 左移動が可能かチェック
     */
    canMoveLeft(grid) {
        const size = grid.length;
        for (let row = 0; row < size; row++) {
            for (let col = 1; col < size; col++) {
                const current = grid[row][col];
                if (current) {
                    // 左に空きがある、または同じ値のタイルがある
                    for (let leftCol = col - 1; leftCol >= 0; leftCol--) {
                        const leftTile = grid[row][leftCol];
                        if (!leftTile) return true; // 空きマスがある
                        if (leftTile.value === current.value && !leftTile.justMerged) return true; // 合体可能
                        break; // 異なる値のタイルにぶつかった
                    }
                }
            }
        }
        return false;
    }

    /**
     * 右移動が可能かチェック
     */
    canMoveRight(grid) {
        const size = grid.length;
        for (let row = 0; row < size; row++) {
            for (let col = size - 2; col >= 0; col--) {
                const current = grid[row][col];
                if (current) {
                    // 右に空きがある、または同じ値のタイルがある
                    for (let rightCol = col + 1; rightCol < size; rightCol++) {
                        const rightTile = grid[row][rightCol];
                        if (!rightTile) return true;
                        if (rightTile.value === current.value && !rightTile.justMerged) return true;
                        break;
                    }
                }
            }
        }
        return false;
    }

    /**
     * 上移動が可能かチェック
     */
    canMoveUp(grid) {
        const size = grid.length;
        for (let col = 0; col < size; col++) {
            for (let row = 1; row < size; row++) {
                const current = grid[row][col];
                if (current) {
                    // 上に空きがある、または同じ値のタイルがある
                    for (let upRow = row - 1; upRow >= 0; upRow--) {
                        const upTile = grid[upRow][col];
                        if (!upTile) return true;
                        if (upTile.value === current.value && !upTile.justMerged) return true;
                        break;
                    }
                }
            }
        }
        return false;
    }

    /**
     * 下移動が可能かチェック
     */
    canMoveDown(grid) {
        const size = grid.length;
        for (let col = 0; col < size; col++) {
            for (let row = size - 2; row >= 0; row--) {
                const current = grid[row][col];
                if (current) {
                    // 下に空きがある、または同じ値のタイルがある
                    for (let downRow = row + 1; downRow < size; downRow++) {
                        const downTile = grid[downRow][col];
                        if (!downTile) return true;
                        if (downTile.value === current.value && !downTile.justMerged) return true;
                        break;
                    }
                }
            }
        }
        return false;
    }

    /**
     * コーナー戦略での手選択（左下コーナーに大きなタイルを集約）
     */
    selectCornerStrategyMove(validMoves) {
        // 高度な評価: 各手の総合スコアを計算
        let bestMove = null;
        let bestScore = -Infinity;
        
        for (const move of validMoves) {
            const evaluation = this.evaluateMove(move);
            
            // 総合スコア計算（重み付け）
            let totalScore = 0;
            
            // コーナー戦略ボーナス
            if (move === 'left') totalScore += 1000;
            else if (move === 'down') totalScore += 800;
            else if (move === 'up') totalScore += 200;
            else if (move === 'right') totalScore -= 500;
            
            // 各評価指標を加算
            totalScore += evaluation.scoreGain * 2;        // スコア重視
            totalScore += evaluation.emptyTiles * 100;     // 空きマス重視
            totalScore += evaluation.monotonicity * 50;    // 単調性
            totalScore += evaluation.smoothness * 20;      // スムーズさ
            
            // 危険な手にペナルティ
            if (this.isDangerousMove(move)) {
                totalScore -= 2000;
            }
            
            console.log(`📊 ${move}: ${totalScore}点 (スコア:${evaluation.scoreGain} 空き:${evaluation.emptyTiles})`);
            
            if (totalScore > bestScore) {
                bestScore = totalScore;
                bestMove = move;
            }
        }
        
        return bestMove;
    }

    /**
     * アグレッシブ戦略（スコア最大化重視）
     */
    selectAggressiveMove(validMoves) {
        return this.selectBestScoreMove(validMoves);
    }

    /**
     * バランス戦略（安全性とスコアのバランス）
     */
    selectBalancedMove(validMoves) {
        const safeMove = this.selectSafeMove(validMoves);
        return safeMove || this.selectBestScoreMove(validMoves);
    }

    /**
     * スコアが最も上がる手を選択
     */
    selectBestScoreMove(validMoves) {
        let bestMove = validMoves[0];
        let bestScore = 0;
        
        for (const move of validMoves) {
            const score = this.evaluateMove(move).scoreGain;
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        return bestMove;
    }

    /**
     * 安全な手（空きマスを多く保つ）を選択
     */
    selectSafeMove(validMoves) {
        let bestMove = null;
        let mostEmptyTiles = -1;
        
        for (const move of validMoves) {
            const evaluation = this.evaluateMove(move);
            if (evaluation.emptyTiles > mostEmptyTiles) {
                mostEmptyTiles = evaluation.emptyTiles;
                bestMove = move;
            }
        }
        
        return bestMove;
    }

    /**
     * 手の評価を行う（高度な評価関数）
     */
    evaluateMove(direction) {
        const originalGrid = this.cloneGrid(this.gameEngine.grid);
        const originalScore = this.gameEngine.score;
        
        // 仮想実行
        const testEngine = new GameEngine(this.gameEngine.difficulty);
        testEngine.grid = this.cloneGrid(originalGrid);
        testEngine.score = originalScore;
        
        const result = testEngine.move(direction, false);
        
        // 評価指標を計算
        const scoreGain = testEngine.score - originalScore;
        const emptyTiles = this.countEmptyTiles(testEngine.grid);
        const monotonicity = this.calculateAdvancedMonotonicity(testEngine.grid);
        const smoothness = this.calculateSmoothness(testEngine.grid);
        const cornerWeight = this.calculateCornerWeight(testEngine.grid);
        const maxTilePosition = this.evaluateMaxTilePosition(testEngine.grid);
        
        return {
            scoreGain,
            emptyTiles,
            monotonicity,
            smoothness,
            cornerWeight,
            maxTilePosition,
            overallScore: scoreGain * 0.25 + emptyTiles * 0.25 + monotonicity * 0.2 + cornerWeight * 0.15 + maxTilePosition * 0.15
        };
    }

    /**
     * 高度な単調性評価（グラデーション評価）
     */
    calculateAdvancedMonotonicity(grid) {
        let score = 0;
        const size = grid.length;
        
        // 左上から右下へのグラデーション評価
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const value = grid[row][col] ? grid[row][col].value : 0;
                
                // 位置による重み（左上が最重要）
                const positionWeight = (size - row) + (size - col);
                score += Math.log2(value + 1) * positionWeight;
            }
        }
        
        return score;
    }

    /**
     * コーナー重み評価（左上・左下コーナーの重要性）
     */
    calculateCornerWeight(grid) {
        const size = grid.length;
        const topLeft = grid[0][0] ? grid[0][0].value : 0;
        const bottomLeft = grid[size-1][0] ? grid[size-1][0].value : 0;
        
        // 最大タイルがコーナーにある場合の高評価
        const maxTile = this.getMaxTileValue(grid);
        
        let score = 0;
        if (topLeft === maxTile) score += 1000;
        if (bottomLeft === maxTile) score += 800;
        
        return score;
    }

    /**
     * 最大タイルの位置評価
     */
    evaluateMaxTilePosition(grid) {
        const size = grid.length;
        const maxTile = this.getMaxTileValue(grid);
        
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const tile = grid[row][col];
                if (tile && tile.value === maxTile) {
                    // 左端・上端ほど高評価
                    return (size - col) * 100 + (size - row) * 50;
                }
            }
        }
        
        return 0;
    }

    /**
     * グリッドの最大タイル値を取得
     */
    getMaxTileValue(grid) {
        let maxValue = 0;
        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[0].length; col++) {
                const tile = grid[row][col];
                if (tile && tile.value > maxValue) {
                    maxValue = tile.value;
                }
            }
        }
        return maxValue;
    }

    /**
     * 危険な手かどうか判定（改良版）
     */
    isDangerousMove(direction) {
        const evaluation = this.evaluateMove(direction);
        
        // より厳格な危険判定
        if (evaluation.emptyTiles <= 3) return true;
        
        // 最大タイルがコーナーから離れる手は危険
        const originalGrid = this.cloneGrid(this.gameEngine.grid);
        const maxTile = this.getMaxTileValue(originalGrid);
        if (maxTile >= 512) { // 高いタイルがある場合の慎重判定
            if (direction === 'right') return true;
            if (maxTile >= 1024 && direction === 'up') return true;
        }
        
        return false;
    }

    /**
     * グリッドをクローン
     */
    cloneGrid(grid) {
        return grid.map(row => [...row]);
    }

    /**
     * 空きタイル数をカウント
     */
    countEmptyTiles(grid) {
        let count = 0;
        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[0].length; col++) {
                if (grid[row][col] === null) {
                    count++;
                }
            }
        }
        return count;
    }

    /**
     * モノトニシティ（単調性）を計算
     * 大きなタイルが一方向に並んでいるほど高い値
     */
    calculateMonotonicity(grid) {
        let monotonicity = 0;
        const size = grid.length;
        
        // 各行・各列の単調性をチェック
        for (let i = 0; i < size; i++) {
            // 行の単調性
            for (let j = 0; j < size - 1; j++) {
                const current = grid[i][j] ? grid[i][j].value : 0;
                const next = grid[i][j + 1] ? grid[i][j + 1].value : 0;
                
                if (current >= next) {
                    monotonicity += 1;
                }
            }
            
            // 列の単調性
            for (let j = 0; j < size - 1; j++) {
                const current = grid[j][i] ? grid[j][i].value : 0;
                const next = grid[j + 1][i] ? grid[j + 1][i].value : 0;
                
                if (current >= next) {
                    monotonicity += 1;
                }
            }
        }
        
        return monotonicity;
    }

    /**
     * スムーズネス（隣接タイルの値の差）を計算
     */
    calculateSmoothness(grid) {
        let smoothness = 0;
        const size = grid.length;
        
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const current = grid[row][col] ? grid[row][col].value : 0;
                
                // 右隣との差
                if (col < size - 1) {
                    const right = grid[row][col + 1] ? grid[row][col + 1].value : 0;
                    smoothness -= Math.abs(current - right);
                }
                
                // 下隣との差
                if (row < size - 1) {
                    const down = grid[row + 1][col] ? grid[row + 1][col].value : 0;
                    smoothness -= Math.abs(current - down);
                }
            }
        }
        
        return smoothness;
    }

    /**
     * 速度設定
     */
    setSpeed(speedMultiplier) {
        this.speed = 1000 / speedMultiplier;
        console.log(`⚡ デモ速度設定: ${speedMultiplier}倍速 (${this.speed}ms間隔)`);
    }

    /**
     * 戦略設定
     */
    setStrategy(strategy) {
        this.strategy = strategy;
        console.log(`🎯 デモ戦略変更: ${strategy}`);
    }

    /**
     * 睡眠関数
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * デモ状況を取得
     */
    getDemoStatus() {
        return {
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            moveCount: this.moveCount,
            strategy: this.strategy,
            speed: this.speed
        };
    }
}