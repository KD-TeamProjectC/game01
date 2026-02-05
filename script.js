// アスキーアート定義
const ASCII_ART = {
    waiting: `　　　　　∧_∧
　　　　（　・∀・）
　　　　（　　　　）
　　　　｜｜｜
　　　　（_＿_）

　　　　待機中...`,
    
    nullpo: `　　　　　∧_∧
　　　　（　´∀｀）
　　　　（　　　　）　ぬるぽ
　　　　｜｜｜
　　　　（_＿_）`,
    
    gat: `　　　　　∧_∧
　　　　（　　　　）
　　　　（　つ　⌒ヽ　　　∧_∧
　　　　｜　 ＼　　⌒）　（　　　）
　　　　｜　　 ＼/　　　（　　　　）　ガッ
　　　　｜　　　 ）　　　 ｜　｜　｜
　　　　｜　　 /　　　　 （_＿_）
　　　　｜　 /
　　　　（_ノ`,
    
    failure: `　　　　　∧_∧
　　　　（；´Д｀）
　　　　（　　　　）　失敗...
　　　　｜｜｜
　　　　（_＿_）`
};
// ゲーム状態定数
const STATES = {
    IDLE: 'idle',
    WAITING: 'waiting',
    SHOWING: 'showing',
    RESULT: 'result'
};

// 文字列データ
const words = [
    { text: "ぬるぽ", isCorrect: true },
    { text: "ぬるぽ", isCorrect: true },
    { text: "ぬるぽ", isCorrect: true },
    { text: "ぬるぽ", isCorrect: true },
    { text: "NullPointerException", isCorrect: true },
    { text: "NumberFormatException", isCorrect: false },
    { text: "いろはにほへとちりぬるぽ", isCorrect: true },
    { text: "ぬろぽ", isCorrect: false },
    { text: "ぬかぽコォ", isCorrect: false },
    { text: "ぬるほ", isCorrect: false },
    { text: "nullpo", isCorrect: true },
    { text: "ヌルポ", isCorrect: true },
    { text: "ぬるぽい", isCorrect: true },
    { text: "ぬるぼ", isCorrect: false },
    { text: "ぬるぽっぽ", isCorrect: true },
    { text: "ぬるま湯", isCorrect: false }
    
];

// ゲーム変数
let state = STATES.IDLE;
let currentWord = null;
let showTime = 0;
let timerId = null;

// DOM要素
let displayArea, resultArea, startButton;

// DOMが読み込まれてから初期化
document.addEventListener('DOMContentLoaded', function() {
    // DOM要素を取得
    displayArea = document.getElementById('display-area');
    resultArea = document.getElementById('result-area');
    startButton = document.getElementById('start-button');
    
    // イベントリスナー設定
    startButton.addEventListener('click', startGame);
    displayArea.addEventListener('click', handleClick);
    
    // デバッグ用
    console.log('Script loaded');
    console.log('Display area:', displayArea);
    console.log('Start button:', startButton);
    
    // 初期化
    resetDisplay();
    
    // キーボードサポート（スペースキーでスタート/クリック）
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.key === 'Enter') {
            e.preventDefault();
            if (state === STATES.IDLE || state === STATES.RESULT) {
                startGame();
            } else if (state === STATES.SHOWING || state === STATES.WAITING) {
                handleClick();
            }
        }
    });
});

function startGame() {
    console.log('startGame called');
    // 初期化
    state = STATES.WAITING;
    currentWord = null;
    showTime = 0;
    
    // UI更新
    displayArea.innerHTML = '';
    displayArea.textContent = ASCII_ART.waiting;
    displayArea.className = 'display-area waiting';
    resultArea.textContent = '';
    resultArea.className = 'result-area';
    startButton.disabled = true;
    startButton.textContent = '待機中...';
    
    // ランダム待機時間（0.5〜3秒）
    const waitTime = Math.random() * 2500 + 500;
    console.log('Wait time:', waitTime);
    
    timerId = setTimeout(() => {
        showWord();
    }, waitTime);
}

function showWord() {
    // ランダムで文字列選択
    currentWord = words[Math.floor(Math.random() * words.length)];
    showTime = Date.now();
    
    // 状態更新
    state = STATES.SHOWING;
    
    // UI更新 - HTMLをクリアしてからテキストを設定
    displayArea.innerHTML = '';
    if (currentWord.text === "ぬるぽ") {
        displayArea.textContent = ASCII_ART.nullpo;
    } else {
        displayArea.textContent = currentWord.text;
    }
    displayArea.className = 'display-area clickable';
    
    // 失敗文字（誤答語）の場合、3秒後に次の文字列を抽選
    if (!currentWord.isCorrect) {
        timerId = setTimeout(() => {
            if (state === STATES.SHOWING) {
                showWord(); // 次の文字列を表示
            }
        }, 3000);
    }
}

function handleClick() {
    if (state === STATES.WAITING) {
        // フライング
        showResult(false, '早すぎです！');
        clearTimeout(timerId);
        
    } else if (state === STATES.SHOWING) {
        // タイマーをクリア（失敗文字の自動切り替えを停止）
        clearTimeout(timerId);
        
        // 反応時間計測
        const reactionTime = Date.now() - showTime;
        
        if (currentWord.isCorrect) {
            // 正解
            showResult(true, `反応時間：${reactionTime} ms`);
        } else {
            // 誤答
            showResult(false, 'それはぬるぽではありません');
        }
    }
}

function showResult(isSuccess, message) {
    state = STATES.RESULT;
    
    // UI更新
    displayArea.className = 'display-area';
    displayArea.innerHTML = ''; // 既存のコンテンツをクリア
    
    if (isSuccess) {
        // 成功時はnurupo GIFをランダムに表示
        showRandomNurupoGif();
    } else {
        // 失敗時はpugya_01.pngを表示
        const img = document.createElement('img');
        img.src = 'pugya/pugya_01.png';
        img.alt = '失敗！';
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        img.style.objectFit = 'contain';
        
        // 画像読み込みエラー時のフォールバック
        img.onerror = function() {
            // pugya画像が見つからない場合、アスキーアートを表示
            displayArea.innerHTML = '';
            const aaDiv = document.createElement('div');
            aaDiv.innerHTML = ASCII_ART.failure.replace(/\n/g, '<br>');
            aaDiv.style.fontFamily = "'MS Gothic', 'Courier New', monospace";
            aaDiv.style.whiteSpace = 'pre';
            displayArea.appendChild(aaDiv);
        };
        
        displayArea.appendChild(img);
        
        // 失敗時のみ3秒後に元の状態に戻す
        setTimeout(() => {
            if (state === STATES.RESULT) {
                resetDisplay();
            }
        }, 3000);
    }
    
    resultArea.textContent = message;
    resultArea.className = `result-area ${isSuccess ? 'success' : 'failure'}`;
    
    startButton.disabled = false;
    startButton.textContent = isSuccess ? 'もう一度' : 'リトライ';
}

function showRandomNurupoGif() {
    // nurupoフォルダ内のGIFファイル数（01-13）
    const gifCount = 13;
    
    // ランダムに1つ選択（01-13の範囲）
    const randomNumber = Math.floor(Math.random() * gifCount) + 1;
    const paddedNumber = randomNumber.toString().padStart(2, '0'); // 01, 02, ... 13
    
    const img = document.createElement('img');
    img.src = `nurupo/nurupo_${paddedNumber}.gif`;
    img.alt = 'ガッ！';
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.objectFit = 'contain';
    
    // 画像読み込みエラー時のフォールバック
    img.onerror = function() {
        // GIFファイルが見つからない場合、アニメーション付きAAを表示
        displayArea.innerHTML = '';
        const aaDiv = document.createElement('div');
        aaDiv.innerHTML = ASCII_ART.gat.replace(/\n/g, '<br>');
        aaDiv.style.fontFamily = "'MS Gothic', 'Courier New', monospace";
        aaDiv.style.whiteSpace = 'pre';
        
        // ランダムなアニメーション効果
        const animations = ['shake', 'bounce', 'flash', 'swing'];
        const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
        aaDiv.style.animation = `${randomAnimation} 0.8s ease-in-out`;
        
        displayArea.appendChild(aaDiv);
    };
    
    displayArea.appendChild(img);
}

function resetDisplay() {
    state = STATES.IDLE;
    
    // displayAreaの内容をクリアしてテキストに戻す
    displayArea.innerHTML = '';
    displayArea.textContent = ASCII_ART.waiting.replace('待機中...', '……');
    displayArea.className = 'display-area';
    resultArea.textContent = '';
    resultArea.className = 'result-area';
    startButton.textContent = 'スタート';
}

// 初期化は DOMContentLoaded で実行