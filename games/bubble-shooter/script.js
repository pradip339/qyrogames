const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const movesEl = document.getElementById('moves');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreEl = document.getElementById('final-score');
const endTitleEl = document.getElementById('end-title');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const swapBtn = document.getElementById('swap-btn');
const messageOverlay = document.getElementById('message-overlay');

const BUBBLE_RADIUS = 22;
const GRID_COLS = 11;
const GRID_ROWS = 15;
const ROW_HEIGHT = BUBBLE_RADIUS * Math.sqrt(3);

const ANIMATION_SPEED = 18;
const BOUNCE_DAMPING = 1;

const COLORS = [
    '#FF4136',
    '#2ECC40',
    '#0074D9',
    '#FFDC00',
    '#B10DC9',
    '#FF851B',
];

const LOGICAL_WIDTH = 480;
const LOGICAL_HEIGHT = 800;

let renderScale = 1;
let renderOffsetX = 0;
let renderOffsetY = 0;

const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;

const Sound = {
    init: () => {
        if (!audioCtx) audioCtx = new AudioContext();
        if (audioCtx.state === 'suspended') audioCtx.resume();
    },
    playTone: (freq, type, duration, vol = 0.1) => {
        if (!audioCtx || isMuted) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        osc.type = type;
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.stop(audioCtx.currentTime + duration);
    },
    shoot: () => {
        Sound.playTone(600, 'sine', 0.15, 0.1);
        Sound.playTone(300, 'triangle', 0.15, 0.05);
    },
    pop: () => {
        if (!audioCtx || isMuted) return;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
        osc.type = 'sine';
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        osc.stop(audioCtx.currentTime + 0.1);
    },
    bounce: () => Sound.playTone(400, 'sine', 0.05, 0.05),
    gameover: () => {
        if (!audioCtx || isMuted) return;
        Sound.playTone(300, 'sawtooth', 0.8, 0.1);
        setTimeout(() => Sound.playTone(250, 'sawtooth', 0.8, 0.1), 300);
    },
    win: () => {
        Sound.playTone(500, 'sine', 0.4, 0.1);
        setTimeout(() => Sound.playTone(700, 'sine', 0.6, 0.1), 200);
    }
};

function updateDarkness() {

    let light = Math.max(10, 30 - (level * 2));
    document.body.style.background = `hsl(225, 20%, ${light}%)`;
}

let grid = [];
let projectile = null;
let nextProjectileInfo = null;
let particles = [];
let messages = [];
let gridShiftY = 0;
let score = 0;
let level = 1;
let moves = 40;
let gameOver = false;
let animationId = null;
let mouseX = 0;
let mouseY = 0;

function resizeCanvas() {
    const container = document.getElementById('game-container');
    const rect = container.getBoundingClientRect();


    const cw = rect.width || window.innerWidth || 320;
    const ch = rect.height || (window.innerHeight * 0.8) || 500;

    canvas.width = cw;
    canvas.height = ch;


    const scaleX = cw / LOGICAL_WIDTH;
    const scaleY = ch / LOGICAL_HEIGHT;
    renderScale = Math.min(scaleX, scaleY);


    renderOffsetX = (cw - LOGICAL_WIDTH * renderScale) / 2;
    renderOffsetY = (ch - LOGICAL_HEIGHT * renderScale) / 2;
}

function getLogicalPos(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const rawX = clientX - rect.left;
    const rawY = clientY - rect.top;

    const x = (rawX - renderOffsetX) / renderScale;
    const y = (rawY - renderOffsetY) / renderScale;

    return { x, y };
}

function updateInput(x, y) {
    const pos = getLogicalPos(x, y);
    mouseX = pos.x;
    mouseY = pos.y;
}

function initGame() {
    resizeCanvas();
    if (AudioContext && !audioCtx) {
        try { audioCtx = new AudioContext(); } catch (e) { }
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();

    score = 0;
    moves = 60;
    shotsFired = 0;
    gameOver = false;
    updateDarkness();

    particles = [];
    messages = [];
    grid = [];
    projectile = null;

    initGrid();
    nextProjectileInfo = getSmartColor();
    prepareProjectile();
    updateUI();

    if (animationId) cancelAnimationFrame(animationId);
    loop();
}

function updateUI() {
    scoreEl.innerText = score;
    levelEl.innerText = level;
    movesEl.innerText = moves;


    const swapCircle = document.querySelector('#swap-btn .swap-circle');
    if (swapCircle && nextProjectileInfo) {
        swapCircle.style.background = nextProjectileInfo;
        swapCircle.style.boxShadow = `0 0 10px ${nextProjectileInfo}`;
        swapCircle.innerText = '';
    }
}

function initGrid() {
    grid = [];
    const rows = 3 + Math.min(level, 4);

    for (let r = 0; r < 20; r++) {
        let row = [];
        let cols = (r % 2 === 0) ? GRID_COLS : GRID_COLS - 1;
        for (let c = 0; c < cols; c++) {
            if (r < rows) {
                row.push({ active: true, color: getRandomColor() });
            } else {
                row.push({ active: false, color: null });
            }
        }
        grid.push(row);
    }
}

function getRandomColor() {

    const cCount = Math.min(COLORS.length, 3 + Math.floor(level / 3));
    return COLORS[Math.floor(Math.random() * cCount)];
}

function getSmartColor(avoidColor = null) {

    const activeColors = new Set();
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            if (grid[r][c].active && grid[r][c].color) {
                activeColors.add(grid[r][c].color);
            }
        }
    }


    if (activeColors.size > 0) {
        let available = Array.from(activeColors);


        if (avoidColor && available.length > 1) {
            const filtered = available.filter(c => c !== avoidColor);
            if (filtered.length > 0) available = filtered;
        }

        return available[Math.floor(Math.random() * available.length)];
    }


    return getRandomColor();
}

function prepareProjectile() {

    const currentColor = nextProjectileInfo ? nextProjectileInfo : getSmartColor();

    projectile = {
        x: LOGICAL_WIDTH / 2,
        y: LOGICAL_HEIGHT - 80,
        dx: 0,
        dy: 0,
        color: currentColor,
        radius: BUBBLE_RADIUS,
        active: true
    };


    nextProjectileInfo = getSmartColor(currentColor);
}

function getAimAngle() {
    if (!projectile) return -Math.PI / 2;

    let angle = Math.atan2(mouseY - projectile.y, mouseX - projectile.x);



    if (mouseY >= projectile.y - 20) {
        if (mouseX < projectile.x) angle = -Math.PI + 0.1;
        else angle = -0.1;
    }
    return angle;
}

function tryShoot() {
    if (!projectile || projectile.dx !== 0 || gameOver) return;

    Sound.shoot();

    const angle = getAimAngle();

    projectile.dx = Math.cos(angle) * ANIMATION_SPEED;
    projectile.dy = Math.sin(angle) * ANIMATION_SPEED;

    moves--;
    shotsFired++;
    updateUI();
}

function addCeiling() {

    const newRows = [];
    for (let r = 0; r < 2; r++) {
        let row = [];
        let cols = (r % 2 === 0) ? GRID_COLS : GRID_COLS - 1;
        for (let c = 0; c < cols; c++) {
            row.push({ active: true, color: getRandomColor() });
        }
        newRows.push(row);
    }

    grid.unshift(...newRows);









    gridShiftY = -2 * ROW_HEIGHT;







}

function doSwap() {
    if (!projectile || projectile.dx !== 0 || gameOver) return;
    Sound.bounce();
    let tmp = projectile.color;
    projectile.color = nextProjectileInfo;
    nextProjectileInfo = tmp;
    createParticles(projectile.x, projectile.y, 5, "#FFF");
    updateUI();
}
swapBtn.addEventListener('click', doSwap);

document.addEventListener('keydown', e => {
    if (e.code === 'Space') {
        doSwap();
    }
});

function update() {
    if (gameOver) return;


    if (projectile && (projectile.dx !== 0 || projectile.dy !== 0)) {
        projectile.x += projectile.dx;
        projectile.y += projectile.dy;


        if (projectile.x - BUBBLE_RADIUS < 0) {
            projectile.x = BUBBLE_RADIUS;
            projectile.dx = Math.abs(projectile.dx);
        } else if (projectile.x + BUBBLE_RADIUS > LOGICAL_WIDTH) {
            projectile.x = LOGICAL_WIDTH - BUBBLE_RADIUS;
            projectile.dx = -Math.abs(projectile.dx);
        }


        if (projectile.y - BUBBLE_RADIUS < 0) {
            projectile.y = BUBBLE_RADIUS;
            snapBubble();
        }




        let hit = false;


        let pRow = Math.floor(projectile.y / ROW_HEIGHT);

        for (let r = Math.max(0, pRow - 2); r <= Math.min(grid.length - 1, pRow + 2); r++) {
            for (let c = 0; c < grid[r].length; c++) {
                let cell = grid[r][c];
                if (!cell.active) continue;

                let bPos = getBubblePos(r, c);
                let distSq = (projectile.x - bPos.x) ** 2 + (projectile.y - bPos.y) ** 2;
                let minDist = (BUBBLE_RADIUS * 2 - 6);

                if (distSq < minDist ** 2) {
                    snapBubble();
                    hit = true;
                    break;
                }
            }
            if (hit) break;
        }
    }


    if (moves <= 0 && !projectile.dx) {

        if (grid[0].some(b => b.active)) {
            endGame(false);
        }
    }


    if (gridShiftY < 0) {
        gridShiftY *= 0.9;
        if (Math.abs(gridShiftY) < 1) gridShiftY = 0;
    }
}

function snapBubble() {

    projectile.dx = 0;
    projectile.dy = 0;



    let best = { r: -1, c: -1, dist: Infinity };


    let pRow = Math.round((projectile.y - BUBBLE_RADIUS) / ROW_HEIGHT);

    for (let r = 0; r < grid.length; r++) {
        let cols = (r % 2 === 0) ? GRID_COLS : GRID_COLS - 1;
        for (let c = 0; c < cols; c++) {
            if (grid[r][c].active) continue;

            let pos = getBubblePos(r, c);
            let dist = (projectile.x - pos.x) ** 2 + (projectile.y - pos.y) ** 2;
            if (dist < best.dist) {
                best = { r, c, dist };
            }
        }
    }

    Sound.pop();

    if (best.r !== -1) {


        while (best.r >= grid.length) {
            let r = grid.length;
            let row = [];
            let cols = (r % 2 === 0) ? GRID_COLS : GRID_COLS - 1;
            for (let c = 0; c < cols; c++) row.push({ active: false, color: null });
            grid.push(row);
        }

        grid[best.r][best.c].active = true;
        grid[best.r][best.c].color = projectile.color;

        resolveMatches(best.r, best.c, projectile.color);



        let rate = Math.max(5, 12 - level);
        if (shotsFired % rate === 0) {
            addCeiling();
        }


        let lowest = -1;
        for (let r = 0; r < grid.length; r++) {
            if (grid[r].some(b => b.active)) lowest = r;
        }
        let limitY = LOGICAL_HEIGHT - 150;
        let lowestY = lowest * ROW_HEIGHT + BUBBLE_RADIUS;

        if (lowestY > limitY) {
            Sound.gameover();
            endGame(false);
        }
        else if (lowest === -1) {

            level++;
            Sound.shoot();
            endGame(true);
        }
    }

    prepareProjectile();
}

function resolveMatches(startR, startC, color) {

    let queue = [{ r: startR, c: startC }];
    let visited = new Set();
    visited.add(`${startR},${startC}`);
    let matches = [];

    while (queue.length > 0) {
        let curr = queue.shift();
        matches.push(curr);

        getNeighbors(curr.r, curr.c).forEach(n => {
            if (!visited.has(`${n.r},${n.c}`) && grid[n.r][n.c].active && grid[n.r][n.c].color === color) {
                visited.add(`${n.r},${n.c}`);
                queue.push(n);
            }
        });
    }

    if (matches.length >= 3) {
        matches.forEach(m => {
            grid[m.r][m.c].active = false;
            let p = getBubblePos(m.r, m.c);
            createParticles(p.x, p.y, 8, color);
        });
        score += matches.length * 100;
        updateUI();


        dropFloating();
    }
}

function dropFloating() {

    let queue = [];
    let visited = new Set();


    let cols = GRID_COLS;
    for (let c = 0; c < cols; c++) {
        if (grid[0][c].active) {
            queue.push({ r: 0, c });
            visited.add(`0,${c}`);
        }
    }

    while (queue.length > 0) {
        let curr = queue.shift();
        getNeighbors(curr.r, curr.c).forEach(n => {
            if (!visited.has(`${n.r},${n.c}`) && grid[n.r][n.c].active) {
                visited.add(`${n.r},${n.c}`);
                queue.push(n);
            }
        });
    }


    for (let r = 0; r < grid.length; r++) {
        let cols = (r % 2 === 0) ? GRID_COLS : GRID_COLS - 1;
        for (let c = 0; c < cols; c++) {
            if (grid[r][c].active && !visited.has(`${r},${c}`)) {
                grid[r][c].active = false;
                let p = getBubblePos(r, c);

                createParticles(p.x, p.y, 5, grid[r][c].color);
                score += 200;
            }
        }
    }
    updateUI();
}

function getNeighbors(r, c) {
    let neighbors = [];

    const offsets = (r % 2 === 0) ?
        [[r - 1, c - 1], [r - 1, c], [r, c - 1], [r, c + 1], [r + 1, c - 1], [r + 1, c]] :
        [[r - 1, c], [r - 1, c + 1], [r, c - 1], [r, c + 1], [r + 1, c], [r + 1, c + 1]];

    for (let o of offsets) {
        let nr = o[0], nc = o[1];
        if (nr >= 0 && nr < grid.length) {
            let ncols = (nr % 2 === 0) ? GRID_COLS : GRID_COLS - 1;
            if (nc >= 0 && nc < ncols) {
                neighbors.push({ r: nr, c: nc });
            }
        }
    }
    return neighbors;
}

function getBubblePos(r, c) {
    let x = (c * BUBBLE_RADIUS * 2) + BUBBLE_RADIUS;
    if (r % 2 === 1) x += BUBBLE_RADIUS;
    let y = (r * ROW_HEIGHT) + BUBBLE_RADIUS;
    return { x, y };
}

function endGame(win) {
    gameOver = true;
    finalScoreEl.innerText = score;
    endTitleEl.innerText = win ? "Level Complete!" : "Game Over";
    gameOverScreen.classList.remove('hidden');
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    ctx.translate(renderOffsetX, renderOffsetY);
    ctx.scale(renderScale, renderScale);


    ctx.beginPath();
    ctx.rect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
    ctx.clip();





    for (let r = 0; r < grid.length; r++) {
        let cols = (r % 2 === 0) ? GRID_COLS : GRID_COLS - 1;
        for (let c = 0; c < cols; c++) {
            if (grid[r][c].active) {
                let pos = getBubblePos(r, c);

                drawBubble(pos.x, pos.y + gridShiftY, grid[r][c].color);
            }
        }
    }


    if (projectile && projectile.dx === 0 && !gameOver) {
        drawAimLine();
    }


    if (projectile) {
        drawBubble(projectile.x, projectile.y, projectile.color);
    }


    drawParticles();

    ctx.restore();


    if (renderOffsetX > 0 || renderOffsetY > 0) {
        ctx.fillStyle = "#222";

        if (renderOffsetX > 0) ctx.fillRect(0, 0, renderOffsetX, canvas.height);

        if (renderOffsetX > 0) ctx.fillRect(canvas.width - renderOffsetX, 0, renderOffsetX, canvas.height);

        if (renderOffsetY > 0) ctx.fillRect(0, 0, canvas.width, renderOffsetY);

        if (renderOffsetY > 0) ctx.fillRect(0, canvas.height - renderOffsetY, canvas.width, renderOffsetY);
    }
}

function drawBubble(x, y, color) {
    const r = BUBBLE_RADIUS - 1;

    let grad = ctx.createRadialGradient(x - r / 3, y - r / 3, r / 4, x, y, r);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.3, color);
    grad.addColorStop(0.9, color);
    grad.addColorStop(1, '#000');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();


    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.beginPath();
    ctx.ellipse(x - r / 3, y - r / 3, r / 3, r / 5, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
}

const drawAimLine = () => {
    if (!projectile || !projectile.color) return;

    const angle = getAimAngle();
    let x = projectile.x;
    let y = projectile.y;
    let dx = Math.cos(angle) * 10;
    let dy = Math.sin(angle) * 10;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 4;
    ctx.strokeStyle = projectile.color;
    ctx.globalAlpha = 0.6;
    ctx.setLineDash([12, 12]);

    for (let i = 0; i < 60; i++) {
        x += dx;
        y += dy;

        if (x < BUBBLE_RADIUS || x > LOGICAL_WIDTH - BUBBLE_RADIUS) {
            dx = -dx;
            x = Math.max(BUBBLE_RADIUS, Math.min(x, LOGICAL_WIDTH - BUBBLE_RADIUS));
            ctx.lineTo(x, y);
        }
        ctx.lineTo(x, y);
        if (y < 0) break;
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
};

function createParticles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            dx: (Math.random() - 0.5) * 10,
            dy: (Math.random() - 0.5) * 10,
            life: 30,
            color: color
        });
    }
}

function drawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 30;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        p.dy += 0.5;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }
    ctx.globalAlpha = 1;
}

function loop() {
    update();
    draw();
    animationId = requestAnimationFrame(loop);
}

const app = document.getElementById('app');
const soundBtn = document.getElementById('sound-btn');
const pauseBtn = document.getElementById('pause-btn');
const pauseScreen = document.getElementById('pause-screen');
const resumeBtn = document.getElementById('resume-btn');

let isPaused = false;
let isMuted = false;

Sound.enabled = true;

const originalPlay = Sound.playTone;
Sound.playTone = (f, t, d, v) => {
    if (!Sound.enabled || isMuted) return;
    originalPlay(f, t, d, v);
};

function isInteractive(target) {
    return target.closest('button') ||
        target.closest('.icon-btn') ||
        target.closest('#swap-btn') ||
        target.closest('.swap-indicator');
}

app.addEventListener('mousemove', e => updateInput(e.clientX, e.clientY));
app.addEventListener('mousedown', e => {
    if (isInteractive(e.target)) return;

    e.preventDefault();
    updateInput(e.clientX, e.clientY);
    tryShoot();
});

app.addEventListener('touchstart', e => {
    if (isInteractive(e.target)) return;
    e.preventDefault();
    updateInput(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });

app.addEventListener('touchmove', e => {
    if (isInteractive(e.target)) return;
    e.preventDefault();
    updateInput(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });

app.addEventListener('touchend', e => {
    if (isInteractive(e.target)) return;
    e.preventDefault();
    tryShoot();
});

window.addEventListener('resize', resizeCanvas);

resizeCanvas();

startBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    initGame();
});

restartBtn.addEventListener('click', () => {
    gameOverScreen.classList.add('hidden');
    initGame();
});

soundBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    soundBtn.innerText = isMuted ? '🔇' : '🔊';
});

function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        pauseScreen.classList.remove('hidden');
    } else {
        pauseScreen.classList.add('hidden');
    }
}

pauseBtn.addEventListener('click', togglePause);
resumeBtn.addEventListener('click', togglePause);

const originalUpdate = update;
update = () => {
    if (isPaused) return;
    originalUpdate();
};

if (!Sound.win) Sound.win = () => {
    if (isMuted) return;
    Sound.playTone(500, 'sine', 0.4, 0.1);
    setTimeout(() => Sound.playTone(700, 'sine', 0.6, 0.1), 200);
};
