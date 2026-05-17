const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let soundEnabled = true;
let audioCtx = null;

const state = {
    gameRunning: false,
    player: null,
    traffic: [],
    frame: 0,
    highScore: localStorage.getItem('neonHighscore') || 0,
    particles: []
};

const THEME = {
    primary: '#00f5ff',   
    secondary: '#aaff00', 
    highlight: '#ff2d78', 
    road: '#050a14',      
    skyTop: '#000d1f',    
    skyBottom: '#001040'  
};

function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playSound(type) {
    if (!soundEnabled || !audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    switch (type) {
        case 'start':
            osc.frequency.value = 200;
            osc.type = 'square';
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.3);
            break;

        case 'move':
            osc.frequency.value = 400;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.1);
            break;

        case 'crash':
            osc.frequency.value = 100;
            osc.type = 'sawtooth';
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.5);
            break;
    }
}

function playEngineSound() {
    if (!soundEnabled || !audioCtx || !state.gameRunning) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const freq = 80 + (state.player.speed * 3);
    osc.frequency.value = freq;
    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 5;
        this.vy = (Math.random() - 0.5) * 5;
        this.life = 1;
        this.color = color;
        this.size = Math.random() * 3 + 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.02;
        this.size *= 0.96;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function createExplosion(x, y, color) {
    for (let i = 0; i < 30; i++) {
        state.particles.push(new Particle(x, y, color));
    }
}

class Player {
    constructor() {
        this.width = 50;
        this.height = 90;
        this.lane = 1;
        this.x = 0;
        this.y = canvas.height - 180;
        this.speed = 6;
        this.score = 0;
        this.targetX = 0;
    }

    update() {
        const laneWidth = canvas.width / 3;
        this.targetX = (laneWidth * this.lane) + (laneWidth / 2) - (this.width / 2);
        this.x += (this.targetX - this.x) * 0.25;

        if (state.gameRunning) {
            this.speed += 0.002;
            this.score += this.speed / 10;

            if (state.frame % 20 === 0) {
                playEngineSound();
            }
        }
    }

    draw() {
        const cx = this.x + this.width / 2;
        const top = this.y;
        const bot = this.y + this.height;
        const W = this.width;
        const H = this.height;

        ctx.save();

        
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(cx, bot + 6, W * 0.55, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        
        const ug = ctx.createRadialGradient(cx, bot, 0, cx, bot, W * 0.8);
        ug.addColorStop(0, 'rgba(0,245,255,0.35)');
        ug.addColorStop(1, 'transparent');
        ctx.fillStyle = ug;
        ctx.beginPath();
        ctx.ellipse(cx, bot, W * 0.8, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        
        const wheelR = W * 0.14;
        const wheelCy = [
            { x: this.x + wheelR, y: top + wheelR * 1.5 },  
            { x: this.x + W - wheelR, y: top + wheelR * 1.5 },  
            { x: this.x + wheelR, y: bot - wheelR * 1.5 },  
            { x: this.x + W - wheelR, y: bot - wheelR * 1.5 },  
        ];
        wheelCy.forEach(w => {
            
            ctx.fillStyle = '#1a1a1a';
            ctx.beginPath(); ctx.arc(w.x, w.y, wheelR, 0, Math.PI * 2); ctx.fill();
            
            const rg = ctx.createRadialGradient(w.x - wheelR * 0.25, w.y - wheelR * 0.25, 0, w.x, w.y, wheelR * 0.65);
            rg.addColorStop(0, '#ccc'); rg.addColorStop(0.6, '#777'); rg.addColorStop(1, '#333');
            ctx.fillStyle = rg;
            ctx.beginPath(); ctx.arc(w.x, w.y, wheelR * 0.65, 0, Math.PI * 2); ctx.fill();
            
            ctx.strokeStyle = '#aaa'; ctx.lineWidth = 1.2;
            for (let s = 0; s < 5; s++) {
                const a = (s / 5) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(w.x, w.y);
                ctx.lineTo(w.x + Math.cos(a) * wheelR * 0.6, w.y + Math.sin(a) * wheelR * 0.6);
                ctx.stroke();
            }
            
            ctx.fillStyle = '#eee';
            ctx.beginPath(); ctx.arc(w.x, w.y, wheelR * 0.15, 0, Math.PI * 2); ctx.fill();
        });

        
        const bodyGrad = ctx.createLinearGradient(this.x, top, this.x + W, top);
        bodyGrad.addColorStop(0, '#0a1a3a');
        bodyGrad.addColorStop(0.25, '#1a3a6e');
        bodyGrad.addColorStop(0.5, '#2050a0');
        bodyGrad.addColorStop(0.75, '#1a3a6e');
        bodyGrad.addColorStop(1, '#0a1a3a');

        ctx.shadowBlur = 22;
        ctx.shadowColor = THEME.primary;
        ctx.fillStyle = bodyGrad;

        ctx.beginPath();
        ctx.moveTo(this.x + W * 0.18, top);
        ctx.lineTo(this.x + W * 0.82, top);
        ctx.quadraticCurveTo(this.x + W, top + H * 0.08, this.x + W, top + H * 0.22);
        ctx.lineTo(this.x + W, bot - H * 0.18);
        ctx.quadraticCurveTo(this.x + W, bot, this.x + W * 0.82, bot);
        ctx.lineTo(this.x + W * 0.18, bot);
        ctx.quadraticCurveTo(this.x, bot, this.x, bot - H * 0.18);
        ctx.lineTo(this.x, top + H * 0.22);
        ctx.quadraticCurveTo(this.x, top + H * 0.08, this.x + W * 0.18, top);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        
        const cabinL = this.x + W * 0.14;
        const cabinR = this.x + W * 0.86;
        const cabinT = top + H * 0.12;
        const cabinB = top + H * 0.62;

        const cabinGrad = ctx.createLinearGradient(cabinL, cabinT, cabinR, cabinB);
        cabinGrad.addColorStop(0, 'rgba(5,15,40,0.95)');
        cabinGrad.addColorStop(1, 'rgba(10,30,70,0.85)');
        ctx.fillStyle = cabinGrad;
        ctx.beginPath();
        ctx.moveTo(cabinL + 4, cabinT); ctx.lineTo(cabinR - 4, cabinT);
        ctx.lineTo(cabinR, cabinT + 8); ctx.lineTo(cabinR, cabinB - 6);
        ctx.lineTo(cabinR - 4, cabinB); ctx.lineTo(cabinL + 4, cabinB);
        ctx.lineTo(cabinL, cabinB - 6); ctx.lineTo(cabinL, cabinT + 8);
        ctx.closePath();
        ctx.fill();

        
        const rwT = cabinT + 3, rwB = cabinT + (cabinB - cabinT) * 0.48;
        const windGrad = ctx.createLinearGradient(0, rwT, 0, rwB);
        windGrad.addColorStop(0, 'rgba(60,150,255,0.5)');
        windGrad.addColorStop(1, 'rgba(20,80,200,0.25)');
        ctx.fillStyle = windGrad;
        ctx.strokeStyle = 'rgba(0,220,255,0.3)'; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cabinL + 5, rwT); ctx.lineTo(cabinR - 5, rwT);
        ctx.lineTo(cabinR - 3, rwB); ctx.lineTo(cabinL + 3, rwB);
        ctx.closePath(); ctx.fill(); ctx.stroke();

        
        ctx.strokeStyle = 'rgba(0,220,255,0.12)'; ctx.lineWidth = 0.6;
        for (let d = 1; d < 5; d++) {
            const dy = rwT + (rwB - rwT) * d / 5;
            ctx.beginPath();
            ctx.moveTo(cabinL + 6, dy); ctx.lineTo(cabinR - 6, dy);
            ctx.stroke();
        }

        
        ctx.strokeStyle = THEME.primary + 'aa';
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 8; ctx.shadowColor = THEME.primary;
        ctx.beginPath();
        ctx.moveTo(this.x + 3, top + H * 0.68);
        ctx.lineTo(this.x + W - 3, top + H * 0.68);
        ctx.stroke();
        ctx.shadowBlur = 0;

        
        ctx.fillStyle = '#0d2248';
        ctx.fillRect(this.x - 6, top + H * 0.22, 6, H * 0.08);
        ctx.fillRect(this.x + W, top + H * 0.22, 6, H * 0.08);

        
        ctx.shadowBlur = 18; ctx.shadowColor = '#ff0000';
        ctx.fillStyle = '#ff2222';
        ctx.beginPath(); ctx.ellipse(this.x + W * 0.2, bot - 4, W * 0.14, 3.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(this.x + W * 0.8, bot - 4, W * 0.14, 3.5, 0, 0, Math.PI * 2); ctx.fill();

        
        ctx.shadowBlur = 14; ctx.shadowColor = THEME.primary;
        ctx.fillStyle = 'rgba(180,240,255,0.9)';
        ctx.beginPath(); ctx.ellipse(this.x + W * 0.2, top + 3, W * 0.12, 3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(this.x + W * 0.8, top + 3, W * 0.12, 3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;

        
        if (this.speed > 8) {
            ctx.globalAlpha = Math.min((this.speed - 8) / 10, 0.45);
            ctx.strokeStyle = THEME.primary;
            ctx.lineWidth = 2.5;
            ctx.shadowBlur = 10; ctx.shadowColor = THEME.primary;
            for (let i = 1; i <= 5; i++) {
                ctx.beginPath();
                ctx.moveTo(this.x + W * 0.22, bot + i * 13);
                ctx.lineTo(this.x + W * 0.22, bot + i * 13 + 9);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(this.x + W * 0.78, bot + i * 13);
                ctx.lineTo(this.x + W * 0.78, bot + i * 13 + 9);
                ctx.stroke();
            }
        }

        ctx.restore();
    }
}

const ENEMY_PALETTE = [
    { body: '#5a0000', accent: '#ff4444' },
    { body: '#003055', accent: '#00aaff' },
    { body: '#1a3a1a', accent: '#44ff88' },
    { body: '#3a2800', accent: '#ffbb00' },
    { body: '#28003a', accent: '#cc44ff' },
    { body: '#333344', accent: '#aaaacc' },
    { body: '#2a2a00', accent: '#ffff44' },
    { body: '#003025', accent: '#00ffaa' },
];

class Enemy {
    constructor() {
        const laneWidth = canvas.width / 3;
        this.width = 48;
        this.height = 85;
        this.lane = Math.floor(Math.random() * 3);
        this.x = (laneWidth * this.lane) + (laneWidth / 2) - (this.width / 2);
        this.y = -120;
        this.speed = 2 + Math.random() * 3;
        const p = ENEMY_PALETTE[Math.floor(Math.random() * ENEMY_PALETTE.length)];
        this.bodyColor = p.body;
        this.accentColor = p.accent;
    }

    update(playerSpeed) {
        this.y += playerSpeed - this.speed;
    }

    draw() {
        const cx = this.x + this.width / 2;
        const top = this.y;
        const bot = this.y + this.height;
        const W = this.width;
        const H = this.height;

        ctx.save();

        
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(cx, bot + 4, W * 0.5, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        
        const wR = W * 0.13;
        [
            { x: this.x + wR, y: top + wR * 1.5 },
            { x: this.x + W - wR, y: top + wR * 1.5 },
            { x: this.x + wR, y: bot - wR * 1.5 },
            { x: this.x + W - wR, y: bot - wR * 1.5 },
        ].forEach(w => {
            ctx.fillStyle = '#111';
            ctx.beginPath(); ctx.arc(w.x, w.y, wR, 0, Math.PI * 2); ctx.fill();
            const rg = ctx.createRadialGradient(w.x - wR * 0.2, w.y - wR * 0.2, 0, w.x, w.y, wR * 0.6);
            rg.addColorStop(0, '#bbb'); rg.addColorStop(1, '#333');
            ctx.fillStyle = rg;
            ctx.beginPath(); ctx.arc(w.x, w.y, wR * 0.6, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#999'; ctx.lineWidth = 1;
            for (let s = 0; s < 5; s++) {
                const a = (s / 5) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(w.x, w.y);
                ctx.lineTo(w.x + Math.cos(a) * wR * 0.55, w.y + Math.sin(a) * wR * 0.55);
                ctx.stroke();
            }
        });

        
        const bg = ctx.createLinearGradient(this.x, top, this.x + W, top);
        bg.addColorStop(0, this.bodyColor);
        bg.addColorStop(0.4, lighten(this.bodyColor, 30));
        bg.addColorStop(0.6, lighten(this.bodyColor, 30));
        bg.addColorStop(1, this.bodyColor);
        ctx.shadowBlur = 12; ctx.shadowColor = this.accentColor;
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.moveTo(this.x + W * 0.18, top);
        ctx.lineTo(this.x + W * 0.82, top);
        ctx.quadraticCurveTo(this.x + W, top + H * 0.1, this.x + W, top + H * 0.22);
        ctx.lineTo(this.x + W, bot - H * 0.18);
        ctx.quadraticCurveTo(this.x + W, bot, this.x + W * 0.82, bot);
        ctx.lineTo(this.x + W * 0.18, bot);
        ctx.quadraticCurveTo(this.x, bot, this.x, bot - H * 0.18);
        ctx.lineTo(this.x, top + H * 0.22);
        ctx.quadraticCurveTo(this.x, top + H * 0.1, this.x + W * 0.18, top);
        ctx.closePath(); ctx.fill();
        ctx.shadowBlur = 0;

        
        const cL = this.x + W * 0.15, cR = this.x + W * 0.85;
        const cT = top + H * 0.1, cB = top + H * 0.62;
        ctx.fillStyle = 'rgba(5,15,35,0.92)';
        ctx.beginPath();
        ctx.moveTo(cL + 3, cT); ctx.lineTo(cR - 3, cT);
        ctx.lineTo(cR, cT + 7); ctx.lineTo(cR, cB - 5);
        ctx.lineTo(cR - 3, cB); ctx.lineTo(cL + 3, cB);
        ctx.lineTo(cL, cB - 5); ctx.lineTo(cL, cT + 7);
        ctx.closePath(); ctx.fill();

        
        const wsT = cT + 3, wsB = cT + (cB - cT) * 0.52;
        const wg = ctx.createLinearGradient(0, wsT, 0, wsB);
        wg.addColorStop(0, 'rgba(30,80,150,0.35)');
        wg.addColorStop(1, 'rgba(80,160,255,0.5)');
        ctx.fillStyle = wg;
        ctx.strokeStyle = 'rgba(80,180,255,0.3)'; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cL + 4, wsT); ctx.lineTo(cR - 4, wsT);
        ctx.lineTo(cR - 2, wsB); ctx.lineTo(cL + 2, wsB);
        ctx.closePath(); ctx.fill(); ctx.stroke();

        
        ctx.strokeStyle = this.accentColor + '99';
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 6; ctx.shadowColor = this.accentColor;
        ctx.beginPath();
        ctx.moveTo(this.x + 3, top + H * 0.7);
        ctx.lineTo(this.x + W - 3, top + H * 0.7);
        ctx.stroke();
        ctx.shadowBlur = 0;

        
        ctx.shadowBlur = 18; ctx.shadowColor = '#ffff88';
        ctx.fillStyle = '#ffffaa';
        ctx.beginPath(); ctx.ellipse(this.x + W * 0.22, bot - 4, W * 0.13, 3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(this.x + W * 0.78, bot - 4, W * 0.13, 3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();
    }
}

function lighten(hex, amount) {
    let r = parseInt(hex.slice(1, 3), 16) || 0;
    let g = parseInt(hex.slice(3, 5), 16) || 0;
    let b = parseInt(hex.slice(5, 7), 16) || 0;
    r = Math.min(255, r + amount);
    g = Math.min(255, g + amount);
    b = Math.min(255, b + amount);
    return `rgb(${r},${g},${b})`;
}

function showPreloader() {
    const preloader = document.getElementById('preloader');
    const progress = document.getElementById('loading-progress');
    let loaded = 0;

    const interval = setInterval(() => {
        loaded += Math.random() * 15;
        if (loaded >= 100) {
            loaded = 100;
            clearInterval(interval);
            setTimeout(() => {
                preloader.style.animation = 'fadeOut 0.5s';
                setTimeout(() => {
                    preloader.classList.add('hidden');
                    document.getElementById('start-screen').classList.remove('hidden');
                }, 500);
            }, 500);
        }
        progress.style.width = loaded + '%';
    }, 150);
}

function init() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    initAudio();
    showPreloader();

    state.player = new Player();
    state.traffic = [];
    state.frame = 0;

    
    document.getElementById('start-btn').onclick = start;
    document.getElementById('restart-btn').onclick = start;

    
    document.getElementById('sound-toggle').onclick = function () {
        soundEnabled = !soundEnabled;
        this.classList.toggle('muted', !soundEnabled);
        document.getElementById('snd-on').style.display = soundEnabled ? 'block' : 'none';
        document.getElementById('snd-off').style.display = soundEnabled ? 'none' : 'block';
    };

    
    window.onkeydown = (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'a') move(-1);
        if (e.key === 'ArrowRight' || e.key === 'd') move(1);
    };

    document.getElementById('left-btn').ontouchstart = (e) => { e.preventDefault(); move(-1); };
    document.getElementById('right-btn').ontouchstart = (e) => { e.preventDefault(); move(1); };

    
    let swipeStartX = null;
    let swipeStartY = null;

    canvas.addEventListener('touchstart', (e) => {
        swipeStartX = e.touches[0].clientX;
        swipeStartY = e.touches[0].clientY;
    }, { passive: true });

    canvas.addEventListener('touchend', (e) => {
        if (swipeStartX === null) return;
        const dx = e.changedTouches[0].clientX - swipeStartX;
        const dy = e.changedTouches[0].clientY - swipeStartY;
        
        if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) {
            move(dx > 0 ? 1 : -1);
        }
        swipeStartX = null;
        swipeStartY = null;
    }, { passive: true });

    window.addEventListener('resize', () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        if (state.player) state.player.y = canvas.height - 180;
    });
}

function move(dir) {
    if (!state.gameRunning) return;
    const oldLane = state.player.lane;
    state.player.lane = Math.max(0, Math.min(2, state.player.lane + dir));
    if (oldLane !== state.player.lane) playSound('move');
}

function start() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    state.player = new Player();
    state.traffic = [];
    state.particles = [];
    state.gameRunning = true;

    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');

    playSound('start');
    loop();
}

function gameOver() {
    state.gameRunning = false;
    playSound('crash');

    createExplosion(
        state.player.x + state.player.width / 2,
        state.player.y + state.player.height / 2,
        THEME.highlight
    );

    if (state.player.score > state.highScore) {
        state.highScore = Math.floor(state.player.score);
        localStorage.setItem('neonHighscore', state.highScore);
    }

    setTimeout(() => {
        document.getElementById('final-score').innerText = `Distance: ${Math.floor(state.player.score)} m`;
        document.getElementById('best-score').innerText = `Best: ${state.highScore} m`;
        document.getElementById('game-over').classList.remove('hidden');
        document.getElementById('hud').classList.add('hidden');
    }, 500);
}

function drawRoad() {
    const W = canvas.width, H = canvas.height;

    
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, THEME.skyTop);
    gradient.addColorStop(0.6, THEME.skyBottom);
    gradient.addColorStop(1, '#050a14');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);

    
    ctx.fillStyle = 'white';
    for (let i = 0; i < 60; i++) {
        const x = (i * 37) % W;
        const y = ((i * 71 + state.frame * 2) % (H * 0.45));
        const size = (i % 3) * 0.4 + 0.5;
        ctx.globalAlpha = Math.sin(state.frame * 0.05 + i) * 0.4 + 0.5;
        ctx.fillRect(x, y, size, size);
    }
    ctx.globalAlpha = 1;

    
    ctx.strokeStyle = THEME.primary;
    ctx.lineWidth = 4;
    ctx.shadowBlur = 20;
    ctx.shadowColor = THEME.primary;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W, 0); ctx.lineTo(W, H); ctx.stroke();

    
    ctx.strokeStyle = THEME.secondary;
    ctx.lineWidth = 3;
    ctx.setLineDash([30, 30]);
    ctx.lineDashOffset = -(state.frame * state.player.speed * 0.5);
    ctx.shadowColor = THEME.secondary;

    for (let i = 1; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(i * (W / 3), 0);
        ctx.lineTo(i * (W / 3), H);
        ctx.stroke();
    }

    ctx.setLineDash([]);
    ctx.shadowBlur = 0;
}

function loop() {
    if (!state.gameRunning && state.particles.length === 0) return;

    state.frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawRoad();

    
    if (state.gameRunning && state.frame % Math.max(30, Math.floor(800 / state.player.speed)) === 0) {
        state.traffic.push(new Enemy());
    }

    
    state.particles = state.particles.filter(p => { p.update(); p.draw(); return p.life > 0; });

    
    if (state.gameRunning) state.player.update();
    state.player.draw();

    
    state.traffic.forEach((enemy, i) => {
        enemy.update(state.player.speed);
        enemy.draw();

        
        if (state.gameRunning &&
            state.player.x < enemy.x + enemy.width - 10 &&
            state.player.x + state.player.width > enemy.x + 10 &&
            state.player.y < enemy.y + enemy.height - 10 &&
            state.player.y + state.player.height > enemy.y + 10
        ) {
            gameOver();
        }

        if (enemy.y > canvas.height) state.traffic.splice(i, 1);
    });

    
    if (state.gameRunning) {
        document.getElementById('score-display').innerText = `${Math.floor(state.player.score)} m`;
        document.getElementById('speed-display').innerText = `${Math.floor(state.player.speed * 15)} KM/H`;
    }

    requestAnimationFrame(loop);
}

window.onload = init;
