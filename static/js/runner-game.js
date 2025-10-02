// Avoidance Runner Game Logic
class RunnerGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        
        this.gameState = {
            isPlaying: false,
            isPaused: false,
            score: 0,
            speed: 2,
            startTime: null,
            player: {
                x: 50,
                y: this.canvas.height / 2,
                width: 20,
                height: 20,
                targetY: this.canvas.height / 2
            },
            obstacles: [],
            lastObstacleTime: 0
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.draw();
    }
    
    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.pauseGame());
        
        this.canvas.addEventListener('mousemove', (e) => this.updatePlayerPosition(e));
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.updatePlayerPosition(e.touches[0]);
        });
    }
    
    updatePlayerPosition(event) {
        if (!this.gameState.isPlaying) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const y = event.clientY - rect.top;
        this.gameState.player.targetY = Math.max(10, Math.min(y, this.canvas.height - 30));
    }
    
    startGame() {
        this.gameState.isPlaying = true;
        this.gameState.isPaused = false;
        this.gameState.score = 0;
        this.gameState.speed = 2;
        this.gameState.startTime = Date.now();
        this.gameState.obstacles = [];
        this.gameState.lastObstacleTime = 0;
        
        this.gameState.player.y = this.canvas.height / 2;
        this.gameState.player.targetY = this.canvas.height / 2;
        
        this.startBtn.style.display = 'none';
        this.pauseBtn.style.display = 'inline-block';
        
        this.gameLoop();
    }
    
    spawnObstacle() {
        const now = Date.now();
        if (now - this.gameState.lastObstacleTime < 1000 / this.gameState.speed) return;
        
        const obstacle = {
            x: this.canvas.width,
            y: Math.random() * (this.canvas.height - 60) + 10,
            width: 20 + Math.random() * 40,
            height: 40 + Math.random() * 80
        };
        
        this.gameState.obstacles.push(obstacle);
        this.gameState.lastObstacleTime = now;
    }
    
    update() {
        if (!this.gameState.isPlaying || this.gameState.isPaused) return;
        
        // Smooth player movement
        const dy = this.gameState.player.targetY - this.gameState.player.y;
        this.gameState.player.y += dy * 0.1;
        
        // Update obstacles
        this.gameState.obstacles.forEach(obstacle => {
            obstacle.x -= this.gameState.speed * 2;
        });
        
        // Remove off-screen obstacles and add score
        this.gameState.obstacles = this.gameState.obstacles.filter(obstacle => {
            if (obstacle.x + obstacle.width < 0) {
                this.gameState.score += 10;
                return false;
            }
            return true;
        });
        
        // Spawn new obstacles
        this.spawnObstacle();
        
        // Check collisions
        const player = this.gameState.player;
        for (let obstacle of this.gameState.obstacles) {
            if (player.x < obstacle.x + obstacle.width &&
                player.x + player.width > obstacle.x &&
                player.y < obstacle.y + obstacle.height &&
                player.y + player.height > obstacle.y) {
                this.gameOver();
                return;
            }
        }
        
        // Increase speed over time
        this.gameState.speed += 0.001;
        
        // Update UI
        document.getElementById('score').textContent = this.gameState.score;
        document.getElementById('speed').textContent = this.gameState.speed.toFixed(1);
        document.getElementById('time').textContent = Math.floor((Date.now() - this.gameState.startTime) / 1000);
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw player
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(
            this.gameState.player.x,
            this.gameState.player.y,
            this.gameState.player.width,
            this.gameState.player.height
        );
        
        // Draw obstacles
        this.ctx.fillStyle = '#fff';
        this.gameState.obstacles.forEach(obstacle => {
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
        
        // Draw ground and ceiling lines
        this.ctx.strokeStyle = '#333';
        this.ctx.beginPath();
        this.ctx.moveTo(0, 10);
        this.ctx.lineTo(this.canvas.width, 10);
        this.ctx.moveTo(0, this.canvas.height - 10);
        this.ctx.lineTo(this.canvas.width, this.canvas.height - 10);
        this.ctx.stroke();
    }
    
    gameLoop() {
        if (this.gameState.isPlaying) {
            this.update();
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
        }
    }
    
    pauseGame() {
        this.gameState.isPaused = !this.gameState.isPaused;
        this.pauseBtn.textContent = this.gameState.isPaused ? 'RESUME' : 'PAUSE';
        if (!this.gameState.isPaused) {
            this.gameLoop();
        }
    }
    
    gameOver() {
        this.gameState.isPlaying = false;
        const timeElapsed = Math.floor((Date.now() - this.gameState.startTime) / 1000);
        
        // Save score
        saveScore('Avoidance Runner', this.gameState.score, timeElapsed);
        
        // Show game over screen
        showGameOver(this.gameState.score, timeElapsed);
        
        this.startBtn.style.display = 'inline-block';
        this.pauseBtn.style.display = 'none';
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new RunnerGame();
});