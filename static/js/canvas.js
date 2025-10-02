const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const bgm = document.getElementById('bgm');
let musicStarted = false;

let balls = [];
const blastParticles = [];

class Ball {
  constructor(x, y, radius = 8) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.dx = (Math.random() - 0.5) * 2;
    this.dy = (Math.random() - 0.5) * 2;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;

    if (this.x + this.radius > canvas.width || this.x - this.radius < 0) this.dx *= -1;
    if (this.y + this.radius > canvas.height || this.y - this.radius < 0) this.dy *= -1;

    this.draw();
  }
}

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 2;
    this.dx = (Math.random() - 0.5) * 6;
    this.dy = (Math.random() - 0.5) * 6;
    this.life = 60;
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;
    this.life--;
    this.draw();
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();
  }
}

// Create balls
for (let i = 0; i < 30; i++) {
  let x = Math.random() * canvas.width;
  let y = Math.random() * canvas.height;
  balls.push(new Ball(x, y));
}

// Click event
canvas.addEventListener('click', function(e) {
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  for (let i = balls.length - 1; i >= 0; i--) {
    const b = balls[i];
    const dist = Math.hypot(mouseX - b.x, mouseY - b.y);

    if (dist < b.radius) {
      // Blast
      for (let j = 0; j < 20; j++) {
        blastParticles.push(new Particle(b.x, b.y));
      }
      balls.splice(i, 1);

      // Start music once
      if (!musicStarted) {
        bgm.play();
        musicStarted = true;
      }

      break;
    }
  }
});

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  balls.forEach(ball => ball.update());

  for (let i = blastParticles.length - 1; i >= 0; i--) {
    const p = blastParticles[i];
    p.update();
    if (p.life <= 0) {
      blastParticles.splice(i, 1);
    }
  }

  requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
