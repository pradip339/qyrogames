window.addEventListener('load', function () {
    setTimeout(function () {
        const preloader = document.getElementById('preloader');
        preloader.style.opacity = '0';
        preloader.style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        createBackgroundParticles();
    }, 2000); 
});

const style = document.createElement('style');
style.innerHTML = `
    @keyframes pulse {
        from { opacity: 1; }
        to { opacity: 0.5; }
    }
    
    @keyframes scorePop {
        0% { transform: scale(1); }
        50% { transform: scale(1.5); }
        100% { transform: scale(1); }
    }
    
    #score {
        transition: transform 0.2s ease-out;
    }
    
    .health-fill {
        transition: width 0.3s ease, opacity 0.3s ease;
    }
`;
document.head.appendChild(style);

function createBackgroundParticles() {
    const colors = ['#FFD700', '#FFA500', '#9370DB', '#8A2BE2', '#ffffff'];

    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        
        const size = Math.random() * 5 + 2;
        const posX = Math.random() * window.innerWidth;
        const posY = Math.random() * window.innerHeight;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const duration = Math.random() * 15 + 10;
        const delay = Math.random() * 5;

        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}px`;
        particle.style.top = `${posY}px`;
        particle.style.backgroundColor = color;
        particle.style.opacity = Math.random() * 0.5 + 0.1;
        particle.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;

        
        document.body.appendChild(particle);

        if (i === 0) {
            
            const keyframes = `
                @keyframes float {
                    0% {
                        transform: translate(0, 0);
                    }
                    50% {
                        transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px);
                    }
                    100% {
                        transform: translate(0, 0);
                    }
                }
            `;

            const style = document.createElement('style');
            style.innerHTML = keyframes;
            document.head.appendChild(style);
        }
    }
}

let canvas, ctx;
let gameRunning = false;
let score = 0;
let health = 100;
let animationId;
let enemies = [];
let bullets = [];
let particles = [];
let muzzleFlashes = [];
let screenShake = { x: 0, y: 0, intensity: 0, duration: 0 };
let lastEnemyTime = 0;
let enemySpawnRate = 1500; 
let targetX = null;
let targetY = null;
let isUsingMouse = false;

const SoundManager = {
    audioCtx: null,
    enabled: true,

    init() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioCtx = new AudioContext();
            }
        }
    },

    toggle() {
        this.enabled = !this.enabled;
        const iconOn = document.getElementById('sound-icon-on');
        const iconOff = document.getElementById('sound-icon-off');
        if (iconOn && iconOff) {
            iconOn.style.display = this.enabled ? 'block' : 'none';
            iconOff.style.display = this.enabled ? 'none' : 'block';
        }
    },

    playShoot() {
        if (!this.enabled || !this.audioCtx) return;
        const o = this.audioCtx.createOscillator();
        const g = this.audioCtx.createGain();
        o.type = 'square';
        o.frequency.setValueAtTime(400, this.audioCtx.currentTime);
        o.frequency.exponentialRampToValueAtTime(100, this.audioCtx.currentTime + 0.1);
        g.gain.setValueAtTime(0.05, this.audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);
        o.connect(g);
        g.connect(this.audioCtx.destination);
        o.start();
        o.stop(this.audioCtx.currentTime + 0.1);
    },

    playHit() {
        if (!this.enabled || !this.audioCtx) return;
        const o = this.audioCtx.createOscillator();
        const g = this.audioCtx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(100, this.audioCtx.currentTime);
        o.frequency.exponentialRampToValueAtTime(50, this.audioCtx.currentTime + 0.1);
        g.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);
        o.connect(g);
        g.connect(this.audioCtx.destination);
        o.start();
        o.stop(this.audioCtx.currentTime + 0.1);
    },

    playExplosion() {
        if (!this.enabled || !this.audioCtx) return;
        const o = this.audioCtx.createOscillator();
        const g = this.audioCtx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(100, this.audioCtx.currentTime);
        o.frequency.exponentialRampToValueAtTime(10, this.audioCtx.currentTime + 0.3);
        g.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.3);
        o.connect(g);
        g.connect(this.audioCtx.destination);
        o.start();
        o.stop(this.audioCtx.currentTime + 0.3);
    },

    playGameOver() {
        if (!this.enabled || !this.audioCtx) return;
        const o = this.audioCtx.createOscillator();
        const g = this.audioCtx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(150, this.audioCtx.currentTime);
        o.frequency.exponentialRampToValueAtTime(30, this.audioCtx.currentTime + 1.0);
        g.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 1.0);
        o.connect(g);
        g.connect(this.audioCtx.destination);
        o.start();
        o.stop(this.audioCtx.currentTime + 1.0);
    }
};

const player = {
    x: 0,
    y: 0,
    width: 50,
    height: 60,
    speed: 8,
    color: '#FFD700', 
    isShooting: false,
    lastShot: 0,
    shootDelay: 300, 

    draw: function () {
        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;

        
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2); 
        ctx.lineTo(this.width / 6, -this.height / 4);
        ctx.lineTo(this.width / 6, this.height / 2);
        ctx.lineTo(-this.width / 6, this.height / 2);
        ctx.lineTo(-this.width / 6, -this.height / 4);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();

        
        ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
        ctx.beginPath();
        ctx.moveTo(this.width / 6, 0); 
        ctx.lineTo(this.width / 2 + 15, this.height / 3); 
        ctx.lineTo(this.width / 6, this.height / 3); 
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-this.width / 6, 0); 
        ctx.lineTo(-this.width / 2 - 15, this.height / 3); 
        ctx.lineTo(-this.width / 6, this.height / 3); 
        ctx.closePath();
        ctx.fill();

        
        ctx.beginPath();
        ctx.ellipse(0, -this.height / 8, 4, 10, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fill();

        
        if (Math.random() > 0.3) {
            ctx.beginPath();
            ctx.moveTo(-8, this.height / 2);
            ctx.lineTo(0, this.height / 2 + 15 + Math.random() * 10);
            ctx.lineTo(8, this.height / 2);
            ctx.closePath();
            ctx.fillStyle = '#FFA500'; 
            ctx.shadowColor = '#FFA500';
            ctx.shadowBlur = 10;
            ctx.fill();
        }

        ctx.restore();
    },

    update: function () {
        const bufferX = 0; 
        const bufferY = 40; 

        if (this.x < bufferX) this.x = bufferX;
        if (this.x > canvas.width - bufferX) this.x = canvas.width - bufferX;
        if (this.y < bufferY) this.y = bufferY;
        if (this.y > canvas.height - bufferY) this.y = canvas.height - bufferY;

        
        if (this.isShooting && Date.now() - this.lastShot > this.shootDelay) {
            this.shoot();
            this.lastShot = Date.now();
        }
    },

    shoot: function () {
        
        bullets.push({
            x: this.x,
            y: this.y - this.height / 2,
            width: 5,
            height: 15,
            speed: 10,
            color: '#ffffff',
            trail: []
        });

        createMuzzleFlash(this.x, this.y - this.height / 2);
        createFireParticles(this.x, this.y - this.height / 2);
        addScreenShake(1, 100);
        SoundManager.playShoot();
    }
};

function createMuzzleFlash(x, y) {
    muzzleFlashes.push({
        x: x,
        y: y,
        size: 30,
        opacity: 1,
        life: 0,
        maxLife: 5
    });
}

function createFireParticles(x, y) {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y + Math.random() * 10,
            vx: (Math.random() - 0.5) * 4,
            vy: -Math.random() * 3 - 2,
            size: Math.random() * 4 + 2,
            color: `hsl(${Math.random() * 40 + 30}, 100%, 60%)`, 
            life: 0,
            maxLife: 15 + Math.random() * 10,
            type: 'fire'
        });
    }
}

function addScreenShake(intensity, duration) {
    screenShake.intensity = Math.max(screenShake.intensity, intensity);
    screenShake.duration = Math.max(screenShake.duration, duration);
}

function initGame() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');

    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    
    player.x = canvas.width / 2;
    player.y = canvas.height - 100;

    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    
    document.getElementById('start-button').addEventListener('click', startGame);
    document.getElementById('restart-button').addEventListener('click', restartGame);

    const soundToggle = document.getElementById('sound-toggle');
    if (soundToggle) {
        soundToggle.addEventListener('click', () => SoundManager.toggle());
    }

    
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);

    
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
}

function handleKeyDown(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a') player.isMovingLeft = true;
    if (e.key === 'ArrowRight' || e.key === 'd') player.isMovingRight = true;
    if (e.key === 'ArrowUp' || e.key === 'w') player.isMovingUp = true;
    if (e.key === 'ArrowDown' || e.key === 's') player.isMovingDown = true;
    if (e.key === ' ') player.isShooting = true;
}

function handleKeyUp(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a') player.isMovingLeft = false;
    if (e.key === 'ArrowRight' || e.key === 'd') player.isMovingRight = false;
    if (e.key === 'ArrowUp' || e.key === 'w') player.isMovingUp = false;
    if (e.key === 'ArrowDown' || e.key === 's') player.isMovingDown = false;
    if (e.key === ' ') player.isShooting = false;
}

function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    targetX = e.clientX - rect.left;
    targetY = e.clientY - rect.top;
    isUsingMouse = true;
}

function handleMouseDown() { player.isShooting = true; }
function handleMouseUp() { player.isShooting = false; }

function handleTouchStart(e) {
    e.preventDefault();
    player.isShooting = true;
    updateTouchPos(e);
}
function handleTouchMove(e) {
    e.preventDefault();
    updateTouchPos(e);
}
function handleTouchEnd(e) {
    e.preventDefault();
    player.isShooting = false;
}

function updateTouchPos(e) {
    if (gameRunning && e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        targetX = touch.clientX - rect.left;
        targetY = touch.clientY - rect.top;
        isUsingMouse = true;
    }
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function startGame() {
    const startScreen = document.getElementById('start-screen');
    startScreen.style.animation = 'fadeOut 0.5s forwards';
    setTimeout(() => {
        startScreen.style.display = 'none';
    }, 500);

    gameRunning = true;
    score = 0;
    health = 100;
    enemies = [];
    bullets = [];
    particles = [];
    muzzleFlashes = [];
    screenShake = { x: 0, y: 0, intensity: 0, duration: 0 };
    player.x = canvas.width / 2;
    player.y = canvas.height - 100;

    SoundManager.init();

    updateHealthBar();
    updateScore();
    cancelAnimationFrame(animationId);
    gameLoop();
}

function restartGame() {
    document.getElementById('game-over-screen').style.display = 'none';
    startGame();
}

function gameOver() {
    const gameOverScreen = document.getElementById('game-over-screen');
    gameOverScreen.style.display = 'flex';
    gameOverScreen.style.animation = 'fadeIn 0.5s forwards';

    gameRunning = false;
    cancelAnimationFrame(animationId);
    document.getElementById('final-score').textContent = score;
    SoundManager.playGameOver();
}

function gameLoop() {
    if (!gameRunning) return;

    
    if (player.isMovingLeft) { player.x -= player.speed; isUsingMouse = false; }
    if (player.isMovingRight) { player.x += player.speed; isUsingMouse = false; }
    if (player.isMovingUp) { player.y -= player.speed; isUsingMouse = false; }
    if (player.isMovingDown) { player.y += player.speed; isUsingMouse = false; }

    
    if (isUsingMouse && targetX !== null && targetY !== null) {
        player.x += (targetX - player.x) * 0.15;
        player.y += (targetY - player.y) * 0.15;
    }

    
    if (screenShake.duration > 0) {
        screenShake.x = (Math.random() - 0.5) * screenShake.intensity;
        screenShake.y = (Math.random() - 0.5) * screenShake.intensity;
        screenShake.duration--;
        screenShake.intensity *= 0.95;
    } else {
        screenShake.x = 0;
        screenShake.y = 0;
    }

    ctx.save();
    ctx.translate(screenShake.x, screenShake.y);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();

    player.update();
    player.draw();

    spawnEnemies();
    updateEnemies();
    updateBullets();
    updateParticles();
    updateMuzzleFlashes();
    checkCollisions();

    ctx.restore();

    animationId = requestAnimationFrame(gameLoop);
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];

        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life++;

        if (particle.type === 'fire') {
            particle.vy += 0.1;
        }

        const alpha = Math.max(0, 1 - (particle.life / particle.maxLife));
        let drawSize = particle.size * alpha;

        if (particle.type === 'shockwave') {
            drawSize = particle.size * (particle.life / particle.maxLife);
        }

        drawSize = Math.max(0.1, drawSize);

        if (alpha > 0 && drawSize > 0) {
            ctx.save();
            ctx.globalAlpha = alpha;

            if (particle.type === 'shockwave') {
                ctx.strokeStyle = particle.color;
                ctx.lineWidth = 2;
                ctx.shadowColor = particle.color;
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, drawSize, 0, Math.PI * 2);
                ctx.stroke();
            } else {
                ctx.fillStyle = particle.color;
                ctx.shadowColor = particle.color;
                ctx.shadowBlur = Math.max(1, particle.size);
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, drawSize, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        if (particle.life >= particle.maxLife || alpha <= 0) {
            particles.splice(i, 1);
        }
    }
}

function updateMuzzleFlashes() {
    for (let i = muzzleFlashes.length - 1; i >= 0; i--) {
        const flash = muzzleFlashes[i];
        flash.life++;

        const alpha = Math.max(0, 1 - (flash.life / flash.maxLife));
        const size = Math.max(0.1, flash.size * (1 + flash.life * 0.2));

        if (alpha > 0 && size > 0) {
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(flash.x, flash.y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        if (flash.life >= flash.maxLife || alpha <= 0) {
            muzzleFlashes.splice(i, 1);
        }
    }
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1f013d');
    gradient.addColorStop(1, '#080012');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'white';
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 2;
        ctx.fillRect(x, y, size, size);
    }
}

function spawnEnemies() {
    const now = Date.now();
    if (now - lastEnemyTime > enemySpawnRate) {
        const size = Math.random() * 30 + 20;
        enemies.push({
            x: Math.random() * (canvas.width - size) + size / 2,
            y: -size,
            width: size,
            height: size,
            speed: Math.random() * 2 + 1,
            color: `hsl(${Math.random() * 60 + 260}, 80%, 60%)`, 
            health: Math.floor(size / 10)
        });
        lastEnemyTime = now;

        if (score > 0 && score % 500 === 0 && enemySpawnRate > 500) {
            enemySpawnRate -= 100;
        }
    }
}

function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

        enemy.y += enemy.speed;

        ctx.save();
        ctx.fillStyle = enemy.color;
        ctx.shadowColor = enemy.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(enemy.x - enemy.width * 0.2, enemy.y - enemy.height * 0.1, enemy.width * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(enemy.x + enemy.width * 0.2, enemy.y - enemy.height * 0.1, enemy.width * 0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(enemy.x - enemy.width * 0.2, enemy.y - enemy.height * 0.1, enemy.width * 0.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(enemy.x + enemy.width * 0.2, enemy.y - enemy.height * 0.1, enemy.width * 0.05, 0, Math.PI * 2);
        ctx.fill();

        if (enemy.y > canvas.height + enemy.height) {
            enemies.splice(i, 1);
        }
    }
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];

        bullet.y -= bullet.speed;
        if (bullet.vx) bullet.x += bullet.vx;

        bullet.trail.push({ x: bullet.x, y: bullet.y + bullet.height });
        if (bullet.trail.length > 8) {
            bullet.trail.shift();
        }

        for (let j = 0; j < bullet.trail.length; j++) {
            const trailPoint = bullet.trail[j];
            const alpha = (j + 1) / bullet.trail.length * 0.5;
            const size = Math.max(0.1, (j + 1) / bullet.trail.length * 3);

            if (alpha > 0 && size > 0) {
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = '#FFA500';
                ctx.shadowColor = '#FFA500';
                ctx.shadowBlur = 5;
                ctx.beginPath();
                ctx.arc(trailPoint.x, trailPoint.y, size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        ctx.save();
        ctx.fillStyle = bullet.color;
        ctx.shadowColor = bullet.color;
        ctx.shadowBlur = 15;
        ctx.fillRect(bullet.x - bullet.width / 2, bullet.y, bullet.width, bullet.height);

        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 5;
        ctx.fillRect(bullet.x - bullet.width / 4, bullet.y + 2, bullet.width / 2, bullet.height - 4);
        ctx.restore();

        if (bullet.y + bullet.height < 0) {
            bullets.splice(i, 1);
        }
    }
}

function checkCollisions() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];

        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];

            const dx = bullet.x - enemy.x;
            const dy = (bullet.y + bullet.height / 2) - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < enemy.width / 2) {
                enemy.health--;
                bullets.splice(i, 1);
                createEnhancedHitEffect(enemy.x, enemy.y, enemy.color);
                SoundManager.playHit();

                if (enemy.health <= 0) {
                    score += Math.floor(enemy.width);
                    updateScore();
                    enemies.splice(j, 1);
                    createEnhancedExplosion(enemy.x, enemy.y, enemy.color, enemy.width);
                    addScreenShake(3, 200);
                    SoundManager.playExplosion();
                }
                break;
            }
        }
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < (player.width / 2 + enemy.width / 2)) {
            health -= 10;
            updateHealthBar();
            enemies.splice(i, 1);

            createEnhancedExplosion(enemy.x, enemy.y, enemy.color, enemy.width);
            addScreenShake(5, 300);
            SoundManager.playExplosion();

            if (health <= 0) {
                health = 0;
                updateHealthBar();
                gameOver();
            }
        }
    }
}

function createEnhancedHitEffect(x, y, color) {
    for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;

        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 3 + 1,
            color: '#ffffff',
            life: 0,
            maxLife: 8 + Math.random() * 5,
            type: 'spark'
        });
    }

    for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;

        particles.push({
            x: x + (Math.random() - 0.5) * 10,
            y: y + (Math.random() - 0.5) * 10,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 4 + 2,
            color: color,
            life: 0,
            maxLife: 12 + Math.random() * 8,
            type: 'hit'
        });
    }
}

function createEnhancedExplosion(x, y, color, size) {
    const particleCount = Math.floor(size / 2) + 15;

    particles.push({
        x: x,
        y: y,
        vx: 0,
        vy: 0,
        size: size * 0.3,
        color: '#ffffff',
        life: 0,
        maxLife: 20,
        type: 'shockwave'
    });

    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 3;
        const particleSize = Math.random() * 6 + 2;

        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: particleSize,
            color: `hsl(${Math.random() * 40 + 260}, 100%, ${50 + Math.random() * 30}%)`,
            life: 0,
            maxLife: 25 + Math.random() * 15,
            type: 'explosion'
        });
    }

    for (let i = 0; i < 6; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 2;

        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1,
            size: Math.random() * 3 + 1,
            color: color,
            life: 0,
            maxLife: 40 + Math.random() * 20,
            type: 'debris'
        });
    }
}

function updateHealthBar() {
    const healthFill = document.getElementById('health-fill');
    if (healthFill) healthFill.style.width = `${health}%`;
}

function updateScore() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.textContent = score;
        scoreElement.style.transform = 'scale(1.5)';
        setTimeout(() => {
            scoreElement.style.transform = 'scale(1)';
        }, 150);
    }
}

initGame();
