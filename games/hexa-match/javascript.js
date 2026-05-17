window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('preloader').classList.add('hidden');
        playSound('start');
    }, 2000);
});

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score-display');
const uiLayer = document.getElementById('ui-layer');

let soundEnabled = true;
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (!soundEnabled) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    switch (type) {
        case 'rotate':
            osc.frequency.value = 300;
            osc.type = 'square';
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.1);
            break;
        case 'land':
            osc.frequency.value = 200;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.15);
            break;
        case 'combo':
            osc.frequency.value = 500;
            osc.type = 'triangle';
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            osc.start(audioCtx.currentTime);
            const osc2 = audioCtx.createOscillator();
            osc2.connect(gain);
            osc2.frequency.value = 700;
            osc2.type = 'triangle';
            osc2.start(audioCtx.currentTime + 0.1);
            osc2.stop(audioCtx.currentTime + 0.4);
            osc.stop(audioCtx.currentTime + 0.3);
            break;
        case 'gameOver':
            osc.frequency.value = 400;
            osc.type = 'sawtooth';
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.5);
            break;
        case 'start':
            osc.frequency.value = 600;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            osc.start(audioCtx.currentTime);
            osc.stop(audioCtx.currentTime + 0.2);
            break;
    }
}

document.getElementById('sound-toggle').addEventListener('click', (e) => {
    soundEnabled = !soundEnabled;
    e.target.textContent = soundEnabled ? '🔊 SOUND ON' : '🔇 SOUND OFF';
    e.target.classList.toggle('muted');
    if (soundEnabled) playSound('start');
});

function createParticles(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = '8px';
        particle.style.height = '8px';
        particle.style.background = color;
        particle.style.boxShadow = `0 0 10px ${color}`;

        const angle = (Math.PI * 2 * i) / count;
        const distance = 50 + Math.random() * 50;
        particle.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
        particle.style.setProperty('--ty', Math.sin(angle) * distance + 'px');

        uiLayer.appendChild(particle);
        setTimeout(() => particle.remove(), 1000);
    }
}

function showScorePopup(x, y, points, color) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = '+' + points;
    popup.style.left = x + 'px';
    popup.style.top = y + 'px';
    popup.style.color = color;
    uiLayer.appendChild(popup);
    setTimeout(() => popup.remove(), 1000);
}

function showComboText(x, y) {
    const combo = document.createElement('div');
    combo.className = 'combo-text';
    combo.textContent = 'COMBO!';
    combo.style.left = x + 'px';
    combo.style.top = y + 'px';
    uiLayer.appendChild(combo);
    setTimeout(() => combo.remove(), 800);
}

const HEX_RADIUS = 60;
const BLOCK_HEIGHT = 15;
const COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#C06C84', '#6A0572'];
const ROTATION_SPEED = 0.12;

let state = {
    score: 0,
    highScore: localStorage.getItem('hexaBest') || 0,
    gameOver: false,
    gameStarted: false,
    rotation: 0,
    targetRotation: 0,
    blocks: [],
    stacks: [[], [], [], [], [], []],
    spawnRate: 1500,
    lastSpawn: 0,
    speedMultiplier: 1
};

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const keys = {};
window.addEventListener('keydown', e => {
    if (!keys[e.code] && (e.code === 'ArrowLeft' || e.code === 'ArrowRight')) {
        keys[e.code] = true;
        playSound('rotate');
    }
});
window.addEventListener('keyup', e => keys[e.code] = false);

window.addEventListener('pointerdown', e => {
    if (e.target.tagName === 'BUTTON' || e.target.closest('.overlay.active')) return;

    if (e.clientX < window.innerWidth / 2) {
        state.targetRotation -= Math.PI / 3;
    } else {
        state.targetRotation += Math.PI / 3;
    }
    playSound('rotate');
});

function drawSlab(ctx, side, dist, height, color, rotation) {
    const angle = (side * Math.PI / 3) + rotation;
    const offset = Math.PI / 3;

    ctx.save();
    ctx.fillStyle = color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(
        dist * Math.cos(angle - offset / 2 + 0.02),
        dist * Math.sin(angle - offset / 2 + 0.02)
    );
    ctx.lineTo(
        dist * Math.cos(angle + offset / 2 - 0.02),
        dist * Math.sin(angle + offset / 2 - 0.02)
    );
    ctx.lineTo(
        (dist + height) * Math.cos(angle + offset / 2 - 0.02),
        (dist + height) * Math.sin(angle + offset / 2 - 0.02)
    );
    ctx.lineTo(
        (dist + height) * Math.cos(angle - offset / 2 + 0.02),
        (dist + height) * Math.sin(angle - offset / 2 + 0.02)
    );

    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}

function spawnBlock() {
    state.blocks.push({
        dist: Math.max(canvas.width, canvas.height) / 1.2,
        side: Math.floor(Math.random() * 6),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        speed: 2 * state.speedMultiplier
    });
}

function checkCombo(sideIndex) {
    const stack = state.stacks[sideIndex];
    if (stack.length < 3) return;

    for (let i = 0; i <= stack.length - 3; i++) {
        if (stack[i] === stack[i + 1] && stack[i] === stack[i + 2]) {
            const color = stack[i];
            stack.splice(i, 3);
            state.score += 30;

            playSound('combo');
            showComboText(canvas.width / 2, canvas.height / 2);
            createParticles(canvas.width / 2, canvas.height / 2, color, 12);

            checkCombo(sideIndex);
            return;
        }
    }
}

function update(time) {
    if (!state.gameStarted || state.gameOver) return;

    
    if (keys['ArrowLeft']) state.targetRotation -= ROTATION_SPEED;
    if (keys['ArrowRight']) state.targetRotation += ROTATION_SPEED;

    const rotDiff = state.targetRotation - state.rotation;
    state.rotation += rotDiff * 0.15;

    state.speedMultiplier = 1 + (state.score / 1000);
    state.spawnRate = Math.max(700, 1600 - (state.score / 5));

    if (time - state.lastSpawn > state.spawnRate) {
        spawnBlock();
        state.lastSpawn = time;
    }

    for (let i = state.blocks.length - 1; i >= 0; i--) {
        const b = state.blocks[i];
        b.dist -= b.speed;

        let normRotation = state.rotation % (Math.PI * 2);
        if (normRotation < 0) normRotation += Math.PI * 2;

        const currentSide = (b.side - Math.round(state.rotation / (Math.PI / 3)) % 6 + 6) % 6;
        const stackHeight = state.stacks[currentSide].length * BLOCK_HEIGHT;

        if (b.dist <= HEX_RADIUS + stackHeight) {
            state.stacks[currentSide].push(b.color);
            state.blocks.splice(i, 1);
            state.score += 10;

            playSound('land');
            showScorePopup(canvas.width / 2, canvas.height / 2 - 50, 10, b.color);
            createParticles(canvas.width / 2, canvas.height / 2, b.color, 6);

            checkCombo(currentSide);

            if (HEX_RADIUS + (state.stacks[currentSide].length * BLOCK_HEIGHT) > 180) {
                endGame();
            }
        }
    }
    scoreEl.innerText = `SCORE: ${state.score}`;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(state.rotation);

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI / 3);
        const x = HEX_RADIUS * Math.cos(angle - Math.PI / 6);
        const y = HEX_RADIUS * Math.sin(angle - Math.PI / 6);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
    ctx.stroke();

    
    for (let i = 0; i < 6; i++) {
        state.stacks[i].forEach((color, depth) => {
            drawSlab(ctx, i, HEX_RADIUS + (depth * BLOCK_HEIGHT), BLOCK_HEIGHT, color, 0);
        });
    }
    ctx.restore();

    
    ctx.save();
    ctx.translate(cx, cy);
    state.blocks.forEach(b => {
        drawSlab(ctx, b.side, b.dist, BLOCK_HEIGHT, b.color, 0);
    });
    ctx.restore();

    requestAnimationFrame((t) => {
        update(t);
        draw();
    });
}

function startGame() {
    state = {
        score: 0,
        highScore: localStorage.getItem('hexaBest') || 0,
        gameOver: false,
        gameStarted: true,
        rotation: 0,
        targetRotation: 0,
        blocks: [],
        stacks: [[], [], [], [], [], []],
        spawnRate: 1500,
        lastSpawn: performance.now(),
        speedMultiplier: 1
    };
    document.querySelectorAll('.overlay').forEach(el => el.classList.remove('active'));
    playSound('start');
}

function endGame() {
    state.gameOver = true;
    playSound('gameOver');

    if (state.score > state.highScore) {
        state.highScore = state.score;
        localStorage.setItem('hexaBest', state.highScore);
    }
    document.getElementById('final-score').innerText = `Score: ${state.score}`;
    document.getElementById('high-score').innerText = `Best: ${state.highScore}`;
    document.getElementById('game-over-screen').classList.add('active');
}

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);

requestAnimationFrame(draw);
