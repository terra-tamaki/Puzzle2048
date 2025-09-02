/**
 * Puzzle2048 結果画面コントローラー
 * 
 * ゲーム結果の表示、統計分析、改善アドバイス生成を管理します。
 * 関西弁での親しみやすいアドバイス提供機能付き。
 */

class ResultController {
    constructor() {
        this.gameResult = null;
        this.previousScore = 0;
        this.bestScore = 0;
        
        // DOM要素の参照
        this.finalScoreElement = document.getElementById('final-score');
        this.previousScoreElement = document.getElementById('previous-score');
        this.bestScoreElement = document.getElementById('best-score');
        this.totalMovesElement = document.getElementById('total-moves');
        this.mergeCountElement = document.getElementById('merge-count');
        this.maxTileElement = document.getElementById('max-tile');
        this.playTimeElement = document.getElementById('play-time');
        this.efficiencyElement = document.getElementById('efficiency');
        this.finalStatusElement = document.getElementById('final-status');
        this.adviceContentElement = document.getElementById('advice-content');
        
        this.initializeEventListeners();
    }

    /**
     * 初期化処理
     */
    initialize() {
        this.loadGameResult();
        this.loadStoredData();
        this.displayResults();
        this.generateAdvice();
        this.animateEntrance();
    }

    /**
     * ゲーム結果データの読み込み
     */
    loadGameResult() {
        try {
            const storedResult = localStorage.getItem('puzzle2048_last_result');
            if (storedResult) {
                this.gameResult = JSON.parse(storedResult);
            } else {
                // デフォルトデータ（テスト用）
                this.gameResult = {
                    finalScore: 0,
                    moves: 0,
                    mergeCount: 0,
                    maxTile: 2,
                    playTime: 0,
                    status: 'lost',
                    efficiency: 0
                };
            }
        } catch (error) {
            console.error('ゲーム結果の読み込みエラー:', error);
            this.gameResult = this.getDefaultResult();
        }
    }

    /**
     * 保存されたデータの読み込み
     */
    loadStoredData() {
        // 難易度を取得
        const difficulty = this.gameResult.difficulty || 'easy';
        
        // 前回スコア（難易度別）
        const prevScore = localStorage.getItem(`puzzle2048_previous_score_${difficulty}`);
        this.previousScore = prevScore ? parseInt(prevScore) : 0;
        
        // ベストスコア（難易度別）
        const bestScore = localStorage.getItem(`puzzle2048_best_score_${difficulty}`);
        this.bestScore = bestScore ? parseInt(bestScore) : 0;
        
        // ベストスコア更新チェック
        if (this.gameResult.finalScore > this.bestScore) {
            this.bestScore = this.gameResult.finalScore;
            localStorage.setItem(`puzzle2048_best_score_${difficulty}`, this.bestScore.toString());
        }
    }

    /**
     * 結果表示
     */
    displayResults() {
        // スコア表示
        this.finalScoreElement.textContent = this.gameResult.finalScore.toLocaleString();
        this.previousScoreElement.textContent = this.previousScore > 0 
            ? this.previousScore.toLocaleString() 
            : '-';
        this.bestScoreElement.textContent = this.bestScore.toLocaleString();

        // 統計表示
        this.totalMovesElement.textContent = this.gameResult.moves.toLocaleString();
        this.mergeCountElement.textContent = this.gameResult.mergeCount.toLocaleString();
        this.maxTileElement.textContent = this.gameResult.maxTile.toLocaleString();
        this.playTimeElement.textContent = this.formatPlayTime(this.gameResult.playTime);
        this.efficiencyElement.textContent = `${this.calculateEfficiency()}%`;
        this.finalStatusElement.textContent = this.getStatusText(this.gameResult.status);

        // スコア改善時のハイライト
        if (this.gameResult.finalScore > this.previousScore) {
            this.finalScoreElement.classList.add('score-highlight');
        }
    }

    /**
     * プレイ時間のフォーマット
     */
    formatPlayTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    /**
     * 効率性の計算（スコア/手数）
     */
    calculateEfficiency() {
        if (this.gameResult.moves === 0) return 0;
        const efficiency = (this.gameResult.finalScore / this.gameResult.moves) * 10;
        return Math.round(efficiency);
    }

    /**
     * ゲーム状態のテキスト表示
     */
    getStatusText(status) {
        const statusMap = {
            'won': '🏆 勝利',
            'lost': '😅 敗北',
            'playing': '🎮 継続中'
        };
        return statusMap[status] || '🤔 不明';
    }

    /**
     * 改善アドバイス生成
     */
    generateAdvice() {
        const advices = [];
        const result = this.gameResult;
        const efficiency = this.calculateEfficiency();

        // スコアベースのアドバイス
        if (result.finalScore < 1000) {
            advices.push({
                type: 'tip',
                message: 'まずは角を有効活用してみ！大きいタイルは端っこに置くのがコツやで。'
            });
        } else if (result.finalScore < 5000) {
            advices.push({
                type: 'normal',
                message: 'ええ感じやな！次は128や256タイルをもっと計画的に作ってみよう。'
            });
        } else if (result.finalScore < 20000) {
            advices.push({
                type: 'normal',
                message: 'かなり上達しとるやん！512タイル目指して戦略を練り直してみ。'
            });
        } else {
            advices.push({
                type: 'tip',
                message: 'めっちゃ上手やな！2048タイル目指して、慎重に進めていこう。'
            });
        }

        // 効率性アドバイス
        if (efficiency < 20) {
            advices.push({
                type: 'warning',
                message: '手数が多めやな。一手一手をもう少し考えて打ってみよう。'
            });
        } else if (efficiency > 50) {
            advices.push({
                type: 'tip',
                message: '効率ええやん！この調子で計算力アップや！'
            });
        }

        // 合体回数アドバイス
        if (result.mergeCount < result.moves * 0.3) {
            advices.push({
                type: 'normal',
                message: 'もう少し積極的に合体を狙ってみ。タイルを揃える動きを意識しよう。'
            });
        }

        // 最高タイルアドバイス
        if (result.maxTile >= 2048) {
            advices.push({
                type: 'tip',
                message: '2048達成おめでとう！次は4096目指してチャレンジや！'
            });
        } else if (result.maxTile >= 1024) {
            advices.push({
                type: 'normal',
                message: '1024まで行けたんは立派やで！あと一歩で2048や。'
            });
        }

        // プレイ時間アドバイス
        if (result.playTime > 600) { // 10分以上
            advices.push({
                type: 'tip',
                message: '集中力すごいな！長時間プレイは脳トレにもってこいや。'
            });
        }

        // スコア改善アドバイス
        if (result.finalScore > this.previousScore) {
            advices.push({
                type: 'tip',
                message: 'スコアアップしとるやん！この調子で頑張ろう！'
            });
        }

        // アドバイスが少ない場合の補完
        if (advices.length < 2) {
            advices.push({
                type: 'normal',
                message: '集中力と論理思考が鍛えられる良いゲームやで。継続は力なりや！'
            });
        }

        this.displayAdvice(advices);
    }

    /**
     * アドバイス表示
     */
    displayAdvice(advices) {
        this.adviceContentElement.innerHTML = '';
        
        advices.forEach((advice, index) => {
            const adviceElement = document.createElement('div');
            adviceElement.className = `advice-item ${advice.type}`;
            adviceElement.textContent = advice.message;
            
            // アニメーション遅延
            adviceElement.style.animationDelay = `${index * 0.2}s`;
            adviceElement.classList.add('result-appear');
            
            this.adviceContentElement.appendChild(adviceElement);
        });
    }

    /**
     * 入場アニメーション
     */
    animateEntrance() {
        const sections = document.querySelectorAll('.score-results, .game-stats, .advice-section');
        sections.forEach((section, index) => {
            section.style.animationDelay = `${index * 0.3}s`;
            section.classList.add('result-appear');
        });
    }

    /**
     * イベントリスナー初期化
     */
    initializeEventListeners() {
        // もう一度プレイボタン
        document.getElementById('play-again').addEventListener('click', () => {
            this.playAgain();
        });

        // 結果保存ボタン
        document.getElementById('save-result').addEventListener('click', () => {
            this.saveResult();
        });

        // 結果シェアボタン
        document.getElementById('share-result').addEventListener('click', () => {
            this.shareResult();
        });

        // キーボードショートカット
        document.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'Enter':
                case ' ':
                    this.playAgain();
                    break;
                case 'Escape':
                    this.playAgain();
                    break;
                case 's':
                case 'S':
                    this.saveResult();
                    break;
            }
        });
    }

    /**
     * ゲーム再開
     */
    playAgain() {
        // 現在のスコアを前回スコアとして保存
        localStorage.setItem('puzzle2048_previous_score', this.gameResult.finalScore.toString());
        
        // ゲーム画面に戻る
        window.location.href = 'index.html';
    }

    /**
     * 結果をテキスト形式で保存
     */
    saveResult() {
        const resultText = this.generateResultText();
        
        try {
            // ブラウザのダウンロード機能を使用
            const blob = new Blob([resultText], { type: 'text/plain; charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `puzzle2048-result-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            console.log('📁 結果をファイルに保存しました');
        } catch (error) {
            console.error('結果保存エラー:', error);
            alert('結果の保存に失敗しました。');
        }
    }

    /**
     * 結果をシェア用テキストとして生成
     */
    generateResultText() {
        const date = new Date().toLocaleDateString('ja-JP');
        const time = new Date().toLocaleTimeString('ja-JP');
        
        return `🎮 Puzzle2048 ゲーム結果
プレイ日時: ${date} ${time}

📊 スコア結果
・最終スコア: ${this.gameResult.finalScore.toLocaleString()}
・前回スコア: ${this.previousScore > 0 ? this.previousScore.toLocaleString() : '-'}
・ベストスコア: ${this.bestScore.toLocaleString()}

📈 ゲーム統計
・手数: ${this.gameResult.moves.toLocaleString()}
・合体回数: ${this.gameResult.mergeCount.toLocaleString()}
・最高タイル: ${this.gameResult.maxTile.toLocaleString()}
・プレイ時間: ${this.formatPlayTime(this.gameResult.playTime)}
・効率性: ${this.calculateEfficiency()}%
・最終状態: ${this.getStatusText(this.gameResult.status)}

🎯 改善ポイント
${this.getTextAdvice()}

Generated by Puzzle2048 - BlueLamp学習プラットフォーム`;
    }

    /**
     * テキスト用アドバイス生成
     */
    getTextAdvice() {
        const result = this.gameResult;
        const efficiency = this.calculateEfficiency();
        let advice = '';

        if (result.finalScore < 1000) {
            advice += '・角の活用：大きいタイルは端に配置しましょう\n';
        }
        
        if (efficiency < 20) {
            advice += '・効率改善：一手ずつ慎重に考えて進めましょう\n';
        }
        
        if (result.mergeCount < result.moves * 0.3) {
            advice += '・合体重視：積極的にタイルを揃える動きを心がけましょう\n';
        }
        
        if (result.maxTile >= 2048) {
            advice += '・素晴らしい！2048達成おめでとうございます！\n';
        }

        return advice || '・継続的な練習で集中力と論理思考を鍛えましょう';
    }

    /**
     * 結果をクリップボードにコピー
     */
    async shareResult() {
        try {
            const shareText = `🎮 Puzzle2048で${this.gameResult.finalScore.toLocaleString()}点獲得！
最高タイル: ${this.gameResult.maxTile} | 効率性: ${this.calculateEfficiency()}%
#Puzzle2048 #脳トレ #BlueLamp`;

            if (navigator.clipboard) {
                await navigator.clipboard.writeText(shareText);
                this.showToast('クリップボードにコピーしました！');
            } else {
                // フォールバック: テキストエリアを使用
                const textarea = document.createElement('textarea');
                textarea.value = shareText;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                this.showToast('クリップボードにコピーしました！');
            }
        } catch (error) {
            console.error('シェアエラー:', error);
            this.showToast('シェアに失敗しました。');
        }
    }

    /**
     * トースト通知表示
     */
    showToast(message) {
        const toast = document.createElement('div');
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #00b894;
            color: white;
            padding: 12px 20px;
            border-radius: 15px;
            font-weight: 700;
            z-index: 1000;
            animation: toast-appear 0.3s ease-out;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toast-disappear 0.3s ease-in';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 2000);
    }

    /**
     * デフォルト結果データ
     */
    getDefaultResult() {
        return {
            finalScore: 0,
            moves: 0,
            mergeCount: 0,
            maxTile: 2,
            playTime: 0,
            status: 'lost',
            efficiency: 0
        };
    }

    /**
     * 結果データの検証
     */
    validateResult(result) {
        return result && 
               typeof result.finalScore === 'number' &&
               typeof result.moves === 'number' &&
               typeof result.mergeCount === 'number' &&
               typeof result.maxTile === 'number';
    }
}

// トーストアニメーション追加
const toastStyles = `
@keyframes toast-appear {
    from {
        opacity: 0;
        transform: translateX(100px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes toast-disappear {
    from {
        opacity: 1;
        transform: translateX(0);
    }
    to {
        opacity: 0;
        transform: translateX(100px);
    }
}
`;

const toastStyleSheet = document.createElement('style');
toastStyleSheet.textContent = toastStyles;
document.head.appendChild(toastStyleSheet);

// グローバルで利用可能にする
window.ResultController = ResultController;