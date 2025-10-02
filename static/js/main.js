// Main JavaScript for Retro Arcade
console.log('Retro Arcade loaded');

// Global variables
let gameState = {
    isPlaying: false,
    score: 0,
    startTime: null
};

// Utility functions
function startTimer() {
    gameState.startTime = Date.now();
}

function getElapsedTime() {
    if (!gameState.startTime) return 0;
    return Math.floor((Date.now() - gameState.startTime) / 1000);
}

function saveScore(gameName, score, timeElapsed) {
    fetch('/save_score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            game_name: gameName,
            score: score,
            time_taken: timeElapsed
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Score saved:', data);
    })
    .catch(error => {
        console.error('Error saving score:', error);
    });
}

function showGameOver(score, timeElapsed) {
    const gameOverDiv = document.createElement('div');
    gameOverDiv.className = 'game-over';
    gameOverDiv.innerHTML = `
        <h2>GAME OVER</h2>
        <p>Score: ${score}</p>
        <p>Time: ${timeElapsed}s</p>
        <button class="btn" onclick="restartGame()">PLAY AGAIN</button>
        <button class="btn" onclick="window.location.href='game_select'">BACK</button>
    `;
    gameOverDiv.style.display = 'block';
    document.body.appendChild(gameOverDiv);
}

function restartGame() {
    const gameOver = document.querySelector('.game-over');
    if (gameOver) {
        gameOver.remove();
    }
    location.reload();
}