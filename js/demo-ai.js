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
            const result = this.gameEngine.move(bestMove);
            console.log('📈 移動結果:', result);
            
            if (result.moved) {
                this.moveCount++;
                
                // UI更新
                this.updateDemoUI();
                
                // 勝利判定
                if (this.gameEngine.hasWon()) {
                    console.log('🎉 デモプレイで2048達成！');
                    this.stopDemo();
                    break;
                }
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
     * 指定した手が有効かどうかチェック
     */
    isValidMove(direction) {
        // グリッドの現在状態を保存
        const originalGrid = this.cloneGrid(this.gameEngine.grid);
        
        // 仮想的に手を実行
        const testEngine = new GameEngine(this.gameEngine.difficulty);
        testEngine.grid = this.cloneGrid(originalGrid);
        testEngine.score = this.gameEngine.score;
        
        const result = testEngine.move(direction, false); // UIを更新せずに実行
        
        return result && result.moved;
    }

    /**
     * コーナー戦略での手選択（左下コーナーに大きなタイルを集約）
     */
    selectCornerStrategyMove(validMoves) {
        // 優先順位: left > down > up > right
        for (const preferredMove of this.preferredOrder) {
            if (validMoves.includes(preferredMove)) {
                // 追加評価: この手で危険な状況になるかチェック
                if (!this.isDangerousMove(preferredMove)) {
                    return preferredMove;
                }
            }
        }
        
        // 全て危険な場合は、スコア最大化で選択
        return this.selectBestScoreMove(validMoves);
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
     * 手の評価を行う
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
        const monotonicity = this.calculateMonotonicity(testEngine.grid);
        const smoothness = this.calculateSmoothness(testEngine.grid);
        
        return {
            scoreGain,
            emptyTiles,
            monotonicity,
            smoothness,
            overallScore: scoreGain * 0.4 + emptyTiles * 0.3 + monotonicity * 0.2 + smoothness * 0.1
        };
    }

    /**
     * 危険な手かどうか判定
     */
    isDangerousMove(direction) {
        const evaluation = this.evaluateMove(direction);
        
        // 空きマスが2個以下になる手は危険とみなす
        return evaluation.emptyTiles <= 2;
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