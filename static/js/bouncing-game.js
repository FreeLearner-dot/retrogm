// Bouncing Ball Game Logic
class BouncingBallGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        
        this.gameState = {
            isPlaying: false,
            isPaused: false,
            score: 0,
            bounces: 0,
            startTime: null,
            ball: {
                x: this.canvas.width / 2,
                y: this.canvas.height - 100,
                radius: 10,
                velocityY: 0,
                gravity: 0.5,
                bounceForce: -12
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
        
        this.canvas.addEventListener('click', () => this.bounceBall());
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.bounceBall();
        });
    }
    
    bounceBall() {
        if (!this.gameState.isPlaying) return;
        
        this.gameState.ball.velocityY = this.gameState.ball.bounceForce;
        this.gameState.bounces++;
        this.gameState.score += 5;
    }
    
    startGame() {
        this.gameState.isPlaying = true;
        this.gameState.isPaused = false;
        this.gameState.score = 0;
        this.gameState.bounces = 0;
        this.gameState.startTime = Date.now();
        this.gameState.obstacles = [];
        this.gameState.lastObstacleTime = 0;
        
        // Reset ball
        this.gameState.ball.x = this.canvas.width / 2;
        this.gameState.ball.y = this.canvas.height - 300;
        this.gameState.ball.velocityY = 0;
        
        this.startBtn.style.display = 'none';
        this.pauseBtn.style.display = 'inline-block';
        
        this.gameLoop();
    }
    
    spawnObstacle() {
        const now = Date.now();
        if (now - this.gameState.lastObstacleTime < 2000) return;
        
        const obstacle = {
            x: Math.random() * (this.canvas.width - 60) + 30,
            y: -20,
            width: 40 + Math.random() * 40,
            height: 20,
            speed: 1 + Math.random() * 2
        };
        
        this.gameState.obstacles.push(obstacle);
        this.gameState.lastObstacleTime = now;
    }
    
    update() {
        if (!this.gameState.isPlaying || this.gameState.isPaused) return;
        
        // Update ball physics
        const ball = this.gameState.ball;
        ball.velocityY += ball.gravity;
        ball.y += ball.velocityY;
        
        // Check ground collision
        if (ball.y + ball.radius >= this.canvas.height) {
            this.gameOver();
            return;
        }
        
        // Update obstacles
        this.gameState.obstacles.forEach(obstacle => {
            obstacle.y += obstacle.speed;
        });
        
        // Remove off-screen obstacles
        this.gameState.obstacles = this.gameState.obstacles.filter(obstacle => 
            obstacle.y < this.canvas.height + 50
        );
        
        // Spawn new obstacles
        this.spawnObstacle();
        
        // Check collisions with obstacles
        for (let obstacle of this.gameState.obstacles) {
            if (ball.x + ball.radius > obstacle.x &&
                ball.x - ball.radius < obstacle.x + obstacle.width &&
                ball.y + ball.radius > obstacle.y &&
                ball.y - ball.radius < obstacle.y + obstacle.height) {
                this.gameOver();
                return;
            }
        }
        
        // Add survival bonus
        if (Date.now() - this.gameState.startTime > 0) {
            this.gameState.score += 0.1;
        }
        
        // Update UI
        document.getElementById('score').textContent = Math.floor(this.gameState.score);
        document.getElementById('bounces').textContent = this.gameState.bounces;
        document.getElementById('time').textContent = Math.floor((Date.now() - this.gameState.startTime) / 1000);
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw ball
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(this.gameState.ball.x, this.gameState.ball.y, this.gameState.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw obstacles
        this.ctx.fillStyle = '#fff';
        this.gameState.obstacles.forEach(obstacle => {
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });
        
        // Draw ground
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height);
        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.stroke();
        this.ctx.lineWidth = 1;
        
        // Draw tap indicator when ball is high
        if (this.gameState.ball.y < this.canvas.height / 2) {
            this.ctx.fillStyle = '#333';
            this.ctx.font = '20px Orbitron';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('TAP TO BOUNCE', this.canvas.width / 2, this.canvas.height - 30);
        }
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
        saveScore('Bouncing Ball', Math.floor(this.gameState.score), timeElapsed);
        
        // Show game over screen
        showGameOver(Math.floor(this.gameState.score), timeElapsed);
        
        this.startBtn.style.display = 'inline-block';
        this.pauseBtn.style.display = 'none';
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new BouncingBallGame();
});