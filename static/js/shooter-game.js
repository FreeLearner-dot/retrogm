// Target Shooter Game Logic
class ShooterGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        
        this.gameState = {
            isPlaying: false,
            isPaused: false,
            score: 0,
            hits: 0,
            startTime: null,
            crosshair: { x: 0, y: 0 },
            targets: [],
            bullets: [],
            lastTargetTime: 0,
            gameTime: 60 // 60 seconds game
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
        
        this.canvas.addEventListener('mousemove', (e) => this.updateCrosshair(e));
        this.canvas.addEventListener('click', (e) => this.shoot(e));
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.updateCrosshair(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.shoot(e.changedTouches[0]);
        });
    }
    
    updateCrosshair(event) {
        const rect = this.canvas.getBoundingClientRect();
        this.gameState.crosshair.x = event.clientX - rect.left;
        this.gameState.crosshair.y = event.clientY - rect.top;
    }
    
    shoot(event) {
        if (!this.gameState.isPlaying) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const bullet = {
            x: this.canvas.width / 2,
            y: this.canvas.height,
            targetX: event.clientX - rect.left,
            targetY: event.clientY - rect.top,
            speed: 10,
            active: true
        };
        
        // Calculate direction
        const dx = bullet.targetX - bullet.x;
        const dy = bullet.targetY - bullet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        bullet.velocityX = (dx / distance) * bullet.speed;
        bullet.velocityY = (dy / distance) * bullet.speed;
        
        this.gameState.bullets.push(bullet);
    }
    
    startGame() {
        this.gameState.isPlaying = true;
        this.gameState.isPaused = false;
        this.gameState.score = 0;
        this.gameState.hits = 0;
        this.gameState.startTime = Date.now();
        this.gameState.targets = [];
        this.gameState.bullets = [];
        this.gameState.lastTargetTime = 0;
        
        this.startBtn.style.display = 'none';
        this.pauseBtn.style.display = 'inline-block';
        
        this.gameLoop();
    }
    
    spawnTarget() {
        const now = Date.now();
        if (now - this.gameState.lastTargetTime < 1500) return;
        
        const targetTypes = [
            { size: 30, speed: 1, points: 10, color: '#fff' },
            { size: 20, speed: 2, points: 20, color: '#ccc' },
            { size: 15, speed: 3, points: 50, color: '#aaa' }
        ];
        
        const type = targetTypes[Math.floor(Math.random() * targetTypes.length)];
        const isFromLeft = Math.random() < 0.5;
        const target = {
            x: isFromLeft ? -type.size : this.canvas.width + type.size,
            y: Math.random() * (this.canvas.height / 2) + 50,
            ...type,
            velocityX: (isFromLeft ? 1 : -1) * type.speed,
            velocityY: (Math.random() - 0.5) * 2,
            active: true
        };
        
        this.gameState.targets.push(target);
        this.gameState.lastTargetTime = now;
    }
    
    update() {
        if (!this.gameState.isPlaying || this.gameState.isPaused) return;
        
        // Check game time
        const elapsed = (Date.now() - this.gameState.startTime) / 1000;
        if (elapsed >= this.gameState.gameTime) {
            this.gameOver();
            return;
        }
        
        // Update bullets
        this.gameState.bullets = this.gameState.bullets.filter(bullet => {
            if (!bullet.active) return false;
            
            bullet.x += bullet.velocityX;
            bullet.y += bullet.velocityY;
            
            // Remove bullets that go off screen
            if (bullet.x < 0 || bullet.x > this.canvas.width || 
                bullet.y < 0 || bullet.y > this.canvas.height) {
                return false;
            }
            
            return true;
        });
        
        // Update targets
        this.gameState.targets.forEach(target => {
            if (!target.active) return;
            
            target.x += target.velocityX;
            target.y += target.velocityY;
            
            // Bounce off top and bottom
            if (target.y <= 0 || target.y >= this.canvas.height / 2) {
                target.velocityY *= -1;
            }
        });
        
        // Remove off-screen targets
        this.gameState.targets = this.gameState.targets.filter(target => 
            target.active && target.x > -target.size - 100 && target.x < this.canvas.width + target.size + 100
        );
        
        // Check bullet-target collisions
        this.gameState.bullets.forEach(bullet => {
            this.gameState.targets.forEach(target => {
                if (!bullet.active || !target.active) return;
                
                const dx = bullet.x - target.x;
                const dy = bullet.y - target.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < target.size / 2 + 3) {
                    // Hit!
                    this.gameState.score += target.points;
                    this.gameState.hits++;
                    bullet.active = false;
                    target.active = false;
                }
            });
        });
        
        // Spawn new targets
        this.spawnTarget();
        
        // Update UI
        document.getElementById('score').textContent = this.gameState.score;
        document.getElementById('hits').textContent = this.gameState.hits;
        document.getElementById('time').textContent = Math.max(0, this.gameState.gameTime - Math.floor(elapsed));
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw targets
        this.gameState.targets.forEach(target => {
            if (!target.active) return;
            
            this.ctx.fillStyle = target.color;
            this.ctx.beginPath();
            this.ctx.arc(target.x, target.y, target.size / 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw target rings
            this.ctx.strokeStyle = target.color;
            this.ctx.beginPath();
            this.ctx.arc(target.x, target.y, target.size / 3, 0, Math.PI * 2);
            this.ctx.stroke();
        });
        
        // Draw bullets
        this.ctx.fillStyle = '#fff';
        this.gameState.bullets.forEach(bullet => {
            if (!bullet.active) return;
            this.ctx.beginPath();
            this.ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw crosshair
        const ch = this.gameState.crosshair;
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(ch.x - 10, ch.y);
        this.ctx.lineTo(ch.x + 10, ch.y);
        this.ctx.moveTo(ch.x, ch.y - 10);
        this.ctx.lineTo(ch.x, ch.y + 10);
        this.ctx.stroke();
        this.ctx.lineWidth = 1;
        
        // Draw cannon at bottom center
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(this.canvas.width / 2 - 15, this.canvas.height - 20, 30, 20);
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
        const timeElapsed = this.gameState.gameTime;
        
        // Save score
        saveScore('Target Shooter', this.gameState.score, timeElapsed);
        
        // Show game over screen
        showGameOver(this.gameState.score, timeElapsed);
        
        this.startBtn.style.display = 'inline-block';
        this.pauseBtn.style.display = 'none';
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new ShooterGame();
});