// Stack Game Logic
class StackGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        
        this.gameState = {
            isPlaying: false,
            isPaused: false,
            score: 0,
            level: 1,
            startTime: null,
            blocks: [],
            currentBlock: null,
            baseWidth: 100,
            blockHeight: 30,
            speed: 2,
            direction: 1
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.createBaseBlock();
        this.draw();
    }
    
    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.pauseGame());
        this.canvas.addEventListener('click', () => this.dropBlock());
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.dropBlock();
        });
    }
    
    createBaseBlock() {
        const baseBlock = {
            x: this.canvas.width / 2 - this.gameState.baseWidth / 2,
            y: this.canvas.height - this.gameState.blockHeight,
            width: this.gameState.baseWidth,
            height: this.gameState.blockHeight
        };
        this.gameState.blocks = [baseBlock];
    }
    
    startGame() {
        this.gameState.isPlaying = true;
        this.gameState.isPaused = false;
        this.gameState.score = 0;
        this.gameState.level = 1;
        this.gameState.startTime = Date.now();
        this.gameState.blocks = [];
        this.gameState.speed = 2;
        
        this.createBaseBlock();
        this.spawnNewBlock();
        
        this.startBtn.style.display = 'none';
        this.pauseBtn.style.display = 'inline-block';
        
        this.gameLoop();
    }
    
    spawnNewBlock() {
        const lastBlock = this.gameState.blocks[this.gameState.blocks.length - 1];
        this.gameState.currentBlock = {
            x: 0,
            y: lastBlock.y - this.gameState.blockHeight - 10,
            width: lastBlock.width,
            height: this.gameState.blockHeight,
            moving: true
        };
        this.gameState.direction = 1;
    }
    
    dropBlock() {
        if (!this.gameState.isPlaying || !this.gameState.currentBlock || !this.gameState.currentBlock.moving) return;
        
        const currentBlock = this.gameState.currentBlock;
        const lastBlock = this.gameState.blocks[this.gameState.blocks.length - 1];
        
        // Calculate overlap
        const leftEdge = Math.max(currentBlock.x, lastBlock.x);
        const rightEdge = Math.min(currentBlock.x + currentBlock.width, lastBlock.x + lastBlock.width);
        const overlap = rightEdge - leftEdge;
        
        if (overlap <= 0) {
            this.gameOver();
            return;
        }
        
        // Perfect alignment bonus
        const tolerance = 5;
        const perfectAlignment = Math.abs(currentBlock.x - lastBlock.x) <= tolerance;
        
        if (perfectAlignment) {
            this.gameState.score += 50; // Perfect bonus
            currentBlock.x = lastBlock.x;
            currentBlock.width = lastBlock.width;
        } else {
            // Trim the block
            currentBlock.x = leftEdge;
            currentBlock.width = overlap;
            this.gameState.score += 10;
        }
        
        // Stop the block movement
        currentBlock.moving = false;
        currentBlock.y = lastBlock.y - this.gameState.blockHeight;
        
        this.gameState.blocks.push(currentBlock);
        this.gameState.level++;
        
        // Increase speed every 5 levels
        if (this.gameState.level % 5 === 0) {
            this.gameState.speed += 0.5;
        }
        
        // Check if block is too small
        if (currentBlock.width < 20) {
            this.gameOver();
            return;
        }
        
        this.spawnNewBlock();
    }
    
    update() {
        if (!this.gameState.isPlaying || this.gameState.isPaused) return;
        
        // Update current moving block
        if (this.gameState.currentBlock && this.gameState.currentBlock.moving) {
            this.gameState.currentBlock.x += this.gameState.speed * this.gameState.direction;
            
            // Bounce off walls
            if (this.gameState.currentBlock.x <= 0 || 
                this.gameState.currentBlock.x + this.gameState.currentBlock.width >= this.canvas.width) {
                this.gameState.direction *= -1;
            }
        }
        
        // Update UI
        document.getElementById('score').textContent = this.gameState.score;
        document.getElementById('level').textContent = this.gameState.level;
        document.getElementById('time').textContent = Math.floor((Date.now() - this.gameState.startTime) / 1000);
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw blocks
        this.ctx.fillStyle = '#fff';
        this.gameState.blocks.forEach(block => {
            this.ctx.fillRect(block.x, block.y, block.width, block.height);
            this.ctx.strokeStyle = '#fff';
            this.ctx.strokeRect(block.x, block.y, block.width, block.height);
        });
        
        // Draw current moving block
        if (this.gameState.currentBlock) {
            this.ctx.fillStyle = this.gameState.currentBlock.moving ? '#ccc' : '#fff';
            this.ctx.fillRect(
                this.gameState.currentBlock.x,
                this.gameState.currentBlock.y,
                this.gameState.currentBlock.width,
                this.gameState.currentBlock.height
            );
            this.ctx.strokeStyle = '#fff';
            this.ctx.strokeRect(
                this.gameState.currentBlock.x,
                this.gameState.currentBlock.y,
                this.gameState.currentBlock.width,
                this.gameState.currentBlock.height
            );
        }
        
        // Draw center line for guidance
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeStyle = '#333';
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
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
        saveScore('Stack Game', this.gameState.score, timeElapsed);
        
        // Show game over screen
        showGameOver(this.gameState.score, timeElapsed);
        
        this.startBtn.style.display = 'inline-block';
        this.pauseBtn.style.display = 'none';
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new StackGame();
});