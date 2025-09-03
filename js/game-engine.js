/**
 * Puzzle2048 ゲームエンジン
 * 
 * 4x4グリッドでの2048パズルゲームのコアロジックを管理します。
 * タイル移動、合体、スコア計算、ゲーム状態管理を担当します。
 */

class GameEngine {
    constructor(difficulty = 'easy') {
        // 難易度設定
        this.difficulty = difficulty;
        this.gridSize = this.getDifficultyConfig(difficulty).size;
        this.targetTile = this.getDifficultyConfig(difficulty).target;
        
        this.grid = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(null));
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem(`puzzle2048_best_score_${difficulty}`) || '0');
        this.moves = 0;
        this.gameStarted = false;
        this.gameOver = false;
        this.status = 'playing';
        this.startTime = 0;
        this.mergeCount = 0;
        this.maxTile = 0;
        this.lastMoveValid = false;
        
        this.initializeGame();
    }

    /**
     * 難易度設定を取得
     */
    getDifficultyConfig(difficulty) {
        const configs = {
            easy: { size: 4, target: 2048, name: 'Easy' },
            normal: { size: 5, target: 4096, name: 'Normal' },
            hard: { size: 6, target: 8192, name: 'Hard' },
            expert: { size: 8, target: 16384, name: 'Expert' }
        };
        
        return configs[difficulty] || configs.easy;
    }

    /**
     * ゲーム初期化
     */
    initializeGame() {
        this.clearGrid();
        this.addRandomTile();
        this.addRandomTile();
        this.gameStarted = true;
        this.startTime = Date.now();
        this.status = 'playing';
    }

    /**
     * グリッドをクリア
     */
    clearGrid() {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                this.grid[row][col] = null;
            }
        }
    }

    /**
     * ランダムな空きマスに新しいタイル（2または4）を追加
     * @returns {Object|null} 追加されたタイルの情報、追加できない場合はnull
     */
    addRandomTile() {
        const emptyCells = [];
        
        // 空きマスを探す
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col] === null) {
                    emptyCells.push({ row, col });
                }
            }
        }

        if (emptyCells.length === 0) {
            return null; // 空きマスなし
        }

        // ランダムな空きマスを選択
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        const { row, col } = emptyCells[randomIndex];
        
        // 90%の確率で2、10%の確率で4を生成
        const value = Math.random() < 0.9 ? 2 : 4;
        
        const tile = {
            value: value,
            row: row,
            col: col,
            isNew: true,
            justMerged: false,
            id: `tile_${Date.now()}_${Math.random()}`
        };

        this.grid[row][col] = tile;
        this.updateMaxTile(value);
        
        return tile;
    }

    /**
     * 指定方向にタイルを移動
     * @param {string} direction - 移動方向 ('left', 'right', 'up', 'down')
     * @param {boolean} updateUI - UIを更新するかどうか（デモモード用）
     * @returns {Object} 移動結果 { moved, scoreIncrease, mergeOccurred, mergedTiles }
     */
    move(direction, updateUI = true) {
        if (this.gameOver) {
            return { moved: false, scoreIncrease: 0, mergeOccurred: false, mergedTiles: [] };
        }

        // 前のターンのフラグをクリア
        this.clearPreviousFlags();

        let moved = false;
        let scoreIncrease = 0;
        let mergeOccurred = false;
        let mergedTiles = [];

        // 方向に応じて処理
        switch (direction) {
            case 'left':
                ({ moved, scoreIncrease, mergeOccurred, mergedTiles } = this.moveLeft());
                break;
            case 'right':
                ({ moved, scoreIncrease, mergeOccurred, mergedTiles } = this.moveRight());
                break;
            case 'up':
                ({ moved, scoreIncrease, mergeOccurred, mergedTiles } = this.moveUp());
                break;
            case 'down':
                ({ moved, scoreIncrease, mergeOccurred, mergedTiles } = this.moveDown());
                break;
            default:
                return { moved: false, scoreIncrease: 0, mergeOccurred: false, mergedTiles: [] };
        }

        if (moved) {
            this.score += scoreIncrease;
            this.moves++;
            this.lastMoveValid = true;
            
            if (mergeOccurred) {
                this.mergeCount++;
            }

            // ベストスコア更新
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                localStorage.setItem(`puzzle2048_best_score_${this.difficulty}`, this.bestScore.toString());
            }

            // 新しいタイルを追加（デモモード時はUIなし）
            if (updateUI) {
                this.addRandomTile();
            } else {
                this.addRandomTileForDemo();
            }

            // 勝利判定
            if (this.checkVictory()) {
                this.status = 'won';
            }

            // 敗北判定
            if (this.checkGameOver()) {
                this.gameOver = true;
                this.status = 'lost';
            }
        } else {
            this.lastMoveValid = false;
        }

        return { moved, scoreIncrease, mergeOccurred, mergedTiles };
    }

    /**
     * 左方向への移動処理
     */
    moveLeft() {
        let moved = false;
        let scoreIncrease = 0;
        let mergeOccurred = false;
        let mergedTiles = [];

        for (let row = 0; row < this.gridSize; row++) {
            const { newRow, rowMoved, rowScore, rowMerged } = this.processRow(this.getRow(row));
            
            if (rowMoved) {
                moved = true;
                this.setRow(row, newRow);
            }
            
            scoreIncrease += rowScore;
            if (rowMerged.length > 0) {
                mergeOccurred = true;
                mergedTiles.push(...rowMerged);
            }
        }

        return { moved, scoreIncrease, mergeOccurred, mergedTiles };
    }

    /**
     * 右方向への移動処理
     */
    moveRight() {
        let moved = false;
        let scoreIncrease = 0;
        let mergeOccurred = false;
        let mergedTiles = [];

        for (let row = 0; row < this.gridSize; row++) {
            const originalRow = this.getRow(row);
            const reversedRow = [...originalRow].reverse();
            const { newRow, rowMoved, rowScore, rowMerged } = this.processRow(reversedRow);
            
            if (rowMoved) {
                moved = true;
                this.setRow(row, newRow.reverse());
            }
            
            scoreIncrease += rowScore;
            if (rowMerged.length > 0) {
                mergeOccurred = true;
                mergedTiles.push(...rowMerged);
            }
        }

        return { moved, scoreIncrease, mergeOccurred, mergedTiles };
    }

    /**
     * 上方向への移動処理
     */
    moveUp() {
        let moved = false;
        let scoreIncrease = 0;
        let mergeOccurred = false;
        let mergedTiles = [];

        for (let col = 0; col < this.gridSize; col++) {
            const { newRow, rowMoved, rowScore, rowMerged } = this.processRow(this.getColumn(col));
            
            if (rowMoved) {
                moved = true;
                this.setColumn(col, newRow);
            }
            
            scoreIncrease += rowScore;
            if (rowMerged.length > 0) {
                mergeOccurred = true;
                mergedTiles.push(...rowMerged);
            }
        }

        return { moved, scoreIncrease, mergeOccurred, mergedTiles };
    }

    /**
     * 下方向への移動処理
     */
    moveDown() {
        let moved = false;
        let scoreIncrease = 0;
        let mergeOccurred = false;
        let mergedTiles = [];

        for (let col = 0; col < this.gridSize; col++) {
            const originalCol = this.getColumn(col);
            const reversedCol = [...originalCol].reverse();
            const { newRow, rowMoved, rowScore, rowMerged } = this.processRow(reversedCol);
            
            if (rowMoved) {
                moved = true;
                this.setColumn(col, newRow.reverse());
            }
            
            scoreIncrease += rowScore;
            if (rowMerged.length > 0) {
                mergeOccurred = true;
                mergedTiles.push(...rowMerged);
            }
        }

        return { moved, scoreIncrease, mergeOccurred, mergedTiles };
    }

    /**
     * 1行のタイル処理（移動・合体）
     * @param {Array} row - 処理する行のタイル配列
     * @returns {Object} 処理結果
     */
    processRow(row) {
        // nullを除いた有効なタイルを抽出
        const tiles = row.filter(tile => tile !== null);
        const newRow = Array(4).fill(null);
        let rowMoved = false;
        let rowScore = 0;
        let rowMerged = [];

        let targetIndex = 0;

        for (let i = 0; i < tiles.length; i++) {
            const currentTile = tiles[i];
            
            // 次のタイルと合体可能かチェック
            if (i < tiles.length - 1 && 
                tiles[i + 1] && 
                currentTile.value === tiles[i + 1].value &&
                !currentTile.justMerged && 
                !tiles[i + 1].justMerged) {
                
                // 合体処理
                const mergedValue = currentTile.value * 2;
                const mergedTile = {
                    value: mergedValue,
                    row: currentTile.row,
                    col: targetIndex,
                    isNew: false,
                    justMerged: true,
                    id: `merged_${Date.now()}_${Math.random()}`
                };

                newRow[targetIndex] = mergedTile;
                rowScore += mergedValue;
                rowMerged.push(mergedTile);
                this.updateMaxTile(mergedValue);
                
                // 次のタイルをスキップ
                i++;
                targetIndex++;
                rowMoved = true;
            } else {
                // 通常移動
                const movedTile = {
                    ...currentTile,
                    col: targetIndex,
                    isNew: false,
                    justMerged: false
                };

                newRow[targetIndex] = movedTile;
                
                if (targetIndex !== currentTile.col) {
                    rowMoved = true;
                }
                
                targetIndex++;
            }
        }

        // 元の行と比較して移動があったかチェック
        if (!rowMoved) {
            for (let i = 0; i < this.gridSize; i++) {
                if ((row[i] === null) !== (newRow[i] === null) ||
                    (row[i] && newRow[i] && row[i].value !== newRow[i].value)) {
                    rowMoved = true;
                    break;
                }
            }
        }

        return { newRow, rowMoved, rowScore, rowMerged };
    }

    /**
     * 指定行のタイル配列を取得
     */
    getRow(rowIndex) {
        return [...this.grid[rowIndex]];
    }

    /**
     * 指定行にタイル配列を設定
     */
    setRow(rowIndex, tiles) {
        for (let col = 0; col < this.gridSize; col++) {
            if (tiles[col]) {
                tiles[col].row = rowIndex;
                tiles[col].col = col;
            }
            this.grid[rowIndex][col] = tiles[col];
        }
    }

    /**
     * 指定列のタイル配列を取得
     */
    getColumn(colIndex) {
        const column = [];
        for (let row = 0; row < this.gridSize; row++) {
            column.push(this.grid[row][colIndex]);
        }
        return column;
    }

    /**
     * 指定列にタイル配列を設定
     */
    setColumn(colIndex, tiles) {
        for (let row = 0; row < this.gridSize; row++) {
            if (tiles[row]) {
                tiles[row].row = row;
                tiles[row].col = colIndex;
            }
            this.grid[row][colIndex] = tiles[row];
        }
    }

    /**
     * 前のターンのフラグをクリア
     */
    clearPreviousFlags() {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col]) {
                    this.grid[row][col].isNew = false;
                    this.grid[row][col].justMerged = false;
                }
            }
        }
    }

    /**
     * 最高タイル値を更新
     */
    updateMaxTile(value) {
        if (value > this.maxTile) {
            this.maxTile = value;
        }
    }

    /**
     * 勝利判定（2048達成）
     */
    checkVictory() {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col] && this.grid[row][col].value >= this.targetTile) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * ゲームオーバー判定
     */
    checkGameOver() {
        // 空きマスがある場合は継続可能
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col] === null) {
                    return false;
                }
            }
        }

        // 隣接するタイルで合体可能なペアがあるかチェック
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const currentTile = this.grid[row][col];
                
                // 右隣をチェック
                if (col < this.gridSize - 1) {
                    const rightTile = this.grid[row][col + 1];
                    if (rightTile && currentTile.value === rightTile.value) {
                        return false;
                    }
                }
                
                // 下隣をチェック
                if (row < this.gridSize - 1) {
                    const bottomTile = this.grid[row + 1][col];
                    if (bottomTile && currentTile.value === bottomTile.value) {
                        return false;
                    }
                }
            }
        }

        return true; // 移動不可
    }

    /**
     * ゲームリセット
     */
    resetGame() {
        this.grid = Array(4).fill().map(() => Array(4).fill(null));
        this.score = 0;
        this.moves = 0;
        this.gameStarted = false;
        this.gameOver = false;
        this.status = 'playing';
        this.startTime = 0;
        this.mergeCount = 0;
        this.maxTile = 0;
        this.lastMoveValid = false;
        
        this.initializeGame();
    }

    /**
     * 現在のゲーム状態を取得
     */
    getGameState() {
        return {
            grid: this.grid.map(row => [...row]),
            score: this.score,
            bestScore: this.bestScore,
            moves: this.moves,
            gameStarted: this.gameStarted,
            gameOver: this.gameOver,
            status: this.status,
            startTime: this.startTime,
            mergeCount: this.mergeCount,
            maxTile: this.maxTile,
            lastMoveValid: this.lastMoveValid
        };
    }

    /**
     * プレイ結果データを生成
     */
    getGameResult() {
        const playTimeMs = Date.now() - this.startTime;
        const playTime = this.formatPlayTime(playTimeMs);
        const efficiency = this.moves > 0 ? Math.round((this.score / this.moves) * 10) / 10 : 0;
        const avgMoveTime = this.moves > 0 ? Math.round(playTimeMs / this.moves / 1000 * 10) / 10 : 0;

        return {
            isVictory: this.status === 'won',
            maxTile: this.maxTile,
            finalScore: this.score,
            moves: this.moves,
            playTime: playTime,
            playTimeMs: playTimeMs,
            mergeCount: this.mergeCount,
            efficiency: efficiency,
            avgMoveTime: avgMoveTime,
            endTime: Date.now(),
            isBestScore: this.score === this.bestScore,
            scoreImprovement: this.score - parseInt(localStorage.getItem('puzzle2048_previous_score') || '0')
        };
    }

    /**
     * プレイ時間をフォーマット
     */
    formatPlayTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    /**
     * グリッドの文字列表現（デバッグ用）
     */
    printGrid() {
        console.log('=== Current Grid ===');
        for (let row = 0; row < this.gridSize; row++) {
            const rowStr = this.grid[row].map(tile => 
                tile ? tile.value.toString().padStart(4, ' ') : '   .'
            ).join(' ');
            console.log(rowStr);
        }
        console.log(`Score: ${this.score}, Moves: ${this.moves}, Status: ${this.status}`);
    }

    /**
     * デモモード用のランダムタイル追加（UIアニメーションなし）
     */
    addRandomTileForDemo() {
        const emptyCells = [];
        
        // 空きマスを探す
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col] === null) {
                    emptyCells.push({ row, col });
                }
            }
        }

        if (emptyCells.length === 0) {
            return null;
        }

        // ランダムな空きマスを選択
        const randomIndex = Math.floor(Math.random() * emptyCells.length);
        const { row, col } = emptyCells[randomIndex];
        
        // 90%の確率で2、10%の確率で4を生成
        const value = Math.random() < 0.9 ? 2 : 4;
        
        const tile = {
            value: value,
            row: row,
            col: col,
            isNew: false, // デモモードではアニメーションなし
            justMerged: false,
            id: `demo_tile_${Date.now()}_${Math.random()}`
        };

        this.grid[row][col] = tile;
        this.updateMaxTile(value);
        
        return tile;
    }

    /**
     * 勝利判定（targetTile到達）
     */
    hasWon() {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const tile = this.grid[row][col];
                if (tile && tile.value >= this.targetTile) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 移動可能な手があるかチェック
     */
    hasAvailableMoves() {
        // 空きマスがある
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.grid[row][col] === null) {
                    return true;
                }
            }
        }

        // 合体可能なペアがある
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const current = this.grid[row][col];
                
                // 右隣チェック
                if (col < this.gridSize - 1 && this.grid[row][col + 1] && 
                    current.value === this.grid[row][col + 1].value) {
                    return true;
                }
                
                // 下隣チェック
                if (row < this.gridSize - 1 && this.grid[row + 1][col] && 
                    current.value === this.grid[row + 1][col].value) {
                    return true;
                }
            }
        }

        return false;
    }
}

// グローバルで利用可能にする
window.GameEngine = GameEngine;