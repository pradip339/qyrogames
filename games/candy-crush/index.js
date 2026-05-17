(() => {
    "use strict";

    const COLS = 8, ROWS = 8;
    const SWAP_DUR = 200, DROP_DUR = 90, POP_DUR = 280;
    const MIN_MATCH = 3;

    const SP_NONE = 0, SP_STRIPED_H = 1, SP_STRIPED_V = 2, SP_BOMB = 3;

    const CC = [
        { name: 'red', fill: '#e53935', dark: '#b71c1c', light: '#ff8a80', glow: 'rgba(229,57,53,.5)' },
        { name: 'orange', fill: '#fb8c00', dark: '#e65100', light: '#ffcc02', glow: 'rgba(251,140,0,.5)' },
        { name: 'yellow', fill: '#fdd835', dark: '#f9a825', light: '#fff9c4', glow: 'rgba(253,216,53,.5)' },
        { name: 'green', fill: '#43a047', dark: '#1b5e20', light: '#a5d6a7', glow: 'rgba(67,160,71,.5)' },
        { name: 'blue', fill: '#1e88e5', dark: '#0d47a1', light: '#90caf9', glow: 'rgba(30,136,229,.5)' },
        { name: 'purple', fill: '#8e24aa', dark: '#4a148c', light: '#ce93d8', glow: 'rgba(142,36,170,.5)' },
    ];

    
    function getLevelConfig(lv) {
        const numTypes = 6; 
        const moves = Math.max(12, 35 - lv * 2);
        
        const target = 1000 + (lv - 1) * 800 + Math.floor((lv - 1) * (lv - 1) * 100);
        return { numTypes, moves, target };
    }

    
    const SFX = (() => {
        let ctx, muted = false;
        const get = () => { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); return ctx; };
        const tone = (f, d, t = 'sine', v = .12) => {
            if (muted) return;
            try {
                const c = get(), o = c.createOscillator(), g = c.createGain();
                o.type = t; o.frequency.setValueAtTime(f, c.currentTime);
                g.gain.setValueAtTime(v, c.currentTime);
                g.gain.exponentialRampToValueAtTime(.001, c.currentTime + d);
                o.connect(g); g.connect(c.destination);
                o.start(c.currentTime); o.stop(c.currentTime + d);
            } catch (e) { }
        };
        return {
            pop() { tone(880, .12, 'sine', .1); setTimeout(() => tone(1100, .1, 'sine', .08), 50); },
            combo(n) { const b = 500 + n * 120; tone(b, .08); setTimeout(() => tone(b + 200, .08), 70); setTimeout(() => tone(b + 400, .12), 140); },
            swap() { tone(440, .06, 'triangle', .06); },
            bad() { tone(200, .18, 'sawtooth', .04); },
            click() { tone(660, .04, 'sine', .04); },
            special() { tone(1200, .08, 'sine', .1); setTimeout(() => tone(1500, .1), 60); setTimeout(() => tone(1800, .15), 120); },
            bomb() { tone(300, .3, 'sine', .15); tone(150, .4, 'sine', .1); setTimeout(() => tone(600, .2), 100); },
            over() { tone(400, .3, 'sine', .1); setTimeout(() => tone(300, .3), 180); setTimeout(() => tone(200, .45), 360); },
            win() { tone(523, .12); setTimeout(() => tone(659, .12), 130); setTimeout(() => tone(784, .12), 260); setTimeout(() => tone(1047, .25, 'sine', .14), 390); },
            toggle() { muted = !muted; return muted; },
            isMuted() { return muted; }
        };
    })();

    
    let grid = [], special = [];
    let score = 0, moves = 0, level = 1, target = 0, numTypes = 6;
    let mode = 'levels';
    let highScore = +(localStorage.getItem('cc_hi') || 0);
    let selected = null, busy = false;
    let hintTimer = null, hintCells = null;

    const canvas = document.getElementById('board-canvas');
    const ctx2 = canvas.getContext('2d');
    let cellSize = 50;

    const $id = id => document.getElementById(id);
    const screens = {
        menu: $id('screen-menu'), game: $id('screen-game'),
        over: $id('screen-over'), level: $id('screen-level'),
    };

    function showScreen(name) {
        Object.values(screens).forEach(s => s.classList.remove('active'));
        screens[name].classList.add('active');
    }

    
    
    

    const candyImages = [];  
    let candiesLoaded = 0;

    
    const CANDY_SVGS = [
        
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <defs>
            <radialGradient id="g0" cx="42%" cy="35%" r="50%"><stop offset="0%" stop-color="#ff8a80"/><stop offset="35%" stop-color="#e53935"/><stop offset="100%" stop-color="#b71c1c"/></radialGradient>
            <radialGradient id="s0" cx="35%" cy="28%" r="32%"><stop offset="0%" stop-color="rgba(255,255,255,.8)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></radialGradient>
          </defs>
          <!-- Wrapper left twist -->
          <path d="M8 44 Q15 35, 22 42 Q15 50, 8 56Z" fill="#ff5252" opacity=".7"/>
          <path d="M8 44 Q15 38, 20 44" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="1.5"/>
          <!-- Wrapper right twist -->
          <path d="M92 44 Q85 35, 78 42 Q85 50, 92 56Z" fill="#ff5252" opacity=".7"/>
          <path d="M92 44 Q85 38, 80 44" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="1.5"/>
          <!-- Main candy body (rounded pill) -->
          <rect x="20" y="26" width="60" height="48" rx="24" fill="url(#g0)"/>
          <rect x="20" y="26" width="60" height="48" rx="24" fill="url(#s0)"/>
          <!-- Shine stripe -->
          <rect x="32" y="30" width="8" height="40" rx="4" fill="rgba(255,255,255,.15)"/>
          <!-- Glossy highlight -->
          <ellipse cx="42" cy="36" rx="14" ry="6" fill="rgba(255,255,255,.4)" transform="rotate(-8 42 36)"/>
          <circle cx="36" cy="34" r="3" fill="rgba(255,255,255,.7)"/>
        </svg>`,

        
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <defs>
            <radialGradient id="g1" cx="40%" cy="32%" r="55%"><stop offset="0%" stop-color="#ffcc80"/><stop offset="30%" stop-color="#ffa726"/><stop offset="100%" stop-color="#e65100"/></radialGradient>
            <radialGradient id="s1" cx="35%" cy="25%" r="30%"><stop offset="0%" stop-color="rgba(255,255,255,.75)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></radialGradient>
          </defs>
          <!-- Bean shape -->
          <ellipse cx="50" cy="50" rx="38" ry="30" fill="url(#g1)" transform="rotate(-12 50 50)"/>
          <ellipse cx="50" cy="50" rx="38" ry="30" fill="url(#s1)" transform="rotate(-12 50 50)"/>
          <!-- Center crease line -->
          <path d="M18 52 Q50 44, 82 52" fill="none" stroke="rgba(180,80,0,.2)" stroke-width="1.5"/>
          <!-- Glossy highlights -->
          <ellipse cx="38" cy="36" rx="16" ry="7" fill="rgba(255,255,255,.45)" transform="rotate(-18 38 36)"/>
          <circle cx="33" cy="33" r="3.5" fill="rgba(255,255,255,.7)"/>
          <!-- Bottom shadow -->
          <ellipse cx="54" cy="68" rx="20" ry="5" fill="rgba(0,0,0,.08)"/>
        </svg>`,

        
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <defs>
            <radialGradient id="g2" cx="40%" cy="35%" r="50%"><stop offset="0%" stop-color="#fff9c4"/><stop offset="30%" stop-color="#ffee58"/><stop offset="100%" stop-color="#f9a825"/></radialGradient>
            <radialGradient id="s2" cx="35%" cy="28%" r="35%"><stop offset="0%" stop-color="rgba(255,255,255,.7)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></radialGradient>
          </defs>
          <!-- Stick -->
          <rect x="47" y="72" width="6" height="20" rx="3" fill="#ddd" opacity=".6"/>
          <!-- Main round candy -->
          <circle cx="50" cy="44" r="34" fill="url(#g2)"/>
          <circle cx="50" cy="44" r="34" fill="url(#s2)"/>
          <!-- Spiral swirl -->
          <path d="M50 18 A8 8 0 0 1 58 26 A14 14 0 0 1 44 40 A20 20 0 0 1 70 44 A26 26 0 0 1 32 56" fill="none" stroke="rgba(245,180,0,.4)" stroke-width="3" stroke-linecap="round"/>
          <!-- Glossy highlights -->
          <ellipse cx="40" cy="32" rx="12" ry="6" fill="rgba(255,255,255,.5)" transform="rotate(-15 40 32)"/>
          <circle cx="36" cy="30" r="3" fill="rgba(255,255,255,.75)"/>
        </svg>`,

        
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <defs>
            <radialGradient id="g3" cx="42%" cy="35%" r="55%"><stop offset="0%" stop-color="#a5d6a7"/><stop offset="35%" stop-color="#43a047"/><stop offset="100%" stop-color="#1b5e20"/></radialGradient>
            <radialGradient id="s3" cx="35%" cy="25%" r="32%"><stop offset="0%" stop-color="rgba(255,255,255,.7)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></radialGradient>
          </defs>
          <!-- Gumdrop body -->
          <path d="M18 78 Q18 30, 50 16 Q82 30, 82 78 Z" fill="url(#g3)"/>
          <path d="M18 78 Q18 30, 50 16 Q82 30, 82 78 Z" fill="url(#s3)"/>
          <!-- Flat bottom -->
          <rect x="18" y="72" width="64" height="8" rx="2" fill="rgba(27,94,32,.3)"/>
          <!-- Sugar dots -->
          <circle cx="35" cy="50" r="2" fill="rgba(255,255,255,.3)"/>
          <circle cx="55" cy="42" r="1.5" fill="rgba(255,255,255,.25)"/>
          <circle cx="42" cy="62" r="1.8" fill="rgba(255,255,255,.2)"/>
          <circle cx="62" cy="56" r="1.5" fill="rgba(255,255,255,.2)"/>
          <circle cx="48" cy="35" r="1.5" fill="rgba(255,255,255,.25)"/>
          <circle cx="58" cy="65" r="2" fill="rgba(255,255,255,.15)"/>
          <!-- Glossy highlights -->
          <ellipse cx="40" cy="32" rx="12" ry="6" fill="rgba(255,255,255,.45)" transform="rotate(-10 40 32)"/>
          <circle cx="36" cy="30" r="3" fill="rgba(255,255,255,.7)"/>
        </svg>`,

        
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <defs>
            <radialGradient id="g4" cx="42%" cy="35%" r="50%"><stop offset="0%" stop-color="#bbdefb"/><stop offset="35%" stop-color="#42a5f5"/><stop offset="100%" stop-color="#0d47a1"/></radialGradient>
            <radialGradient id="s4" cx="35%" cy="28%" r="30%"><stop offset="0%" stop-color="rgba(255,255,255,.75)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></radialGradient>
          </defs>
          <!-- Left crimp wrapper -->
          <polygon points="4,38 18,32 18,68 4,62" fill="#64b5f6" opacity=".6"/>
          <line x1="10" y1="38" x2="10" y2="62" stroke="rgba(255,255,255,.2)" stroke-width="1"/>
          <line x1="14" y1="35" x2="14" y2="65" stroke="rgba(255,255,255,.15)" stroke-width="1"/>
          <!-- Right crimp wrapper -->
          <polygon points="96,38 82,32 82,68 96,62" fill="#64b5f6" opacity=".6"/>
          <line x1="90" y1="38" x2="90" y2="62" stroke="rgba(255,255,255,.2)" stroke-width="1"/>
          <line x1="86" y1="35" x2="86" y2="65" stroke="rgba(255,255,255,.15)" stroke-width="1"/>
          <!-- Main toffee body -->
          <rect x="16" y="28" width="68" height="44" rx="10" fill="url(#g4)"/>
          <rect x="16" y="28" width="68" height="44" rx="10" fill="url(#s4)"/>
          <!-- Wrapper fold lines -->
          <line x1="18" y1="50" x2="28" y2="50" stroke="rgba(255,255,255,.15)" stroke-width="1.5"/>
          <line x1="72" y1="50" x2="82" y2="50" stroke="rgba(255,255,255,.15)" stroke-width="1.5"/>
          <!-- Glossy highlights -->
          <ellipse cx="42" cy="38" rx="18" ry="6" fill="rgba(255,255,255,.4)" transform="rotate(-5 42 38)"/>
          <circle cx="36" cy="36" r="3" fill="rgba(255,255,255,.7)"/>
        </svg>`,

        
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <defs>
            <radialGradient id="g5" cx="42%" cy="35%" r="52%"><stop offset="0%" stop-color="#e1bee7"/><stop offset="35%" stop-color="#ab47bc"/><stop offset="100%" stop-color="#4a148c"/></radialGradient>
            <radialGradient id="s5" cx="35%" cy="25%" r="30%"><stop offset="0%" stop-color="rgba(255,255,255,.75)"/><stop offset="100%" stop-color="rgba(255,255,255,0)"/></radialGradient>
          </defs>
          <!-- Main round bonbon -->
          <circle cx="50" cy="50" r="36" fill="url(#g5)"/>
          <circle cx="50" cy="50" r="36" fill="url(#s5)"/>
          <!-- Stamped swirl pattern -->
          <path d="M50 38 A6 6 0 0 1 56 44 A10 10 0 0 1 42 52 A14 14 0 0 1 62 54" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="2.5" stroke-linecap="round"/>
          <!-- Glossy highlights -->
          <ellipse cx="38" cy="36" rx="13" ry="6" fill="rgba(255,255,255,.5)" transform="rotate(-20 38 36)"/>
          <circle cx="34" cy="34" r="3.5" fill="rgba(255,255,255,.75)"/>
          <!-- Subtle bottom shadow -->
          <ellipse cx="54" cy="76" rx="18" ry="4" fill="rgba(0,0,0,.06)"/>
        </svg>`
    ];

    
    function loadCandyImages() {
        CANDY_SVGS.forEach((svg, i) => {
            const img = new Image();
            const blob = new Blob([svg], { type: 'image/svg+xml' });
            img.src = URL.createObjectURL(blob);
            img.onload = () => { candiesLoaded++; };
            candyImages[i] = img;
        });
    }
    loadCandyImages();

    
    function drawCandyAt(x, y, size, type, sp, scale = 1, alpha = 1) {
        if (type < 0 || !candyImages[type]) return;
        const cc = CC[type];

        ctx2.save();
        ctx2.globalAlpha = alpha;
        ctx2.shadowColor = cc.glow;
        ctx2.shadowBlur = 6 * scale;

        const drawSize = size * scale;
        const pad = size * 0.08; 
        const ox = x + (size - drawSize) / 2 + pad / 2;
        const oy = y + (size - drawSize) / 2 + pad / 2;
        const ds = drawSize - pad;

        ctx2.drawImage(candyImages[type], ox, oy, ds, ds);

        
        ctx2.shadowBlur = 0;
        const cx = x + size / 2, cy = y + size / 2;
        const r = size * 0.38 * scale;
        if (sp === SP_STRIPED_H) drawStripedH(cx, cy, r);
        else if (sp === SP_STRIPED_V) drawStripedV(cx, cy, r);
        else if (sp === SP_BOMB) drawBombOverlay(cx, cy, r);

        ctx2.restore();
    }

    
    function drawStripedH(cx, cy, r) {
        ctx2.strokeStyle = 'rgba(255,255,255,.7)';
        ctx2.lineWidth = 2;
        for (let i = -2; i <= 2; i++) {
            const yy = cy + i * (r * 0.25);
            ctx2.beginPath(); ctx2.moveTo(cx - r * .75, yy); ctx2.lineTo(cx + r * .75, yy); ctx2.stroke();
        }
    }

    function drawStripedV(cx, cy, r) {
        ctx2.strokeStyle = 'rgba(255,255,255,.7)';
        ctx2.lineWidth = 2;
        for (let i = -2; i <= 2; i++) {
            const xx = cx + i * (r * 0.25);
            ctx2.beginPath(); ctx2.moveTo(xx, cy - r * .75); ctx2.lineTo(xx, cy + r * .75); ctx2.stroke();
        }
    }

    function drawBombOverlay(cx, cy, r) {
        const colors = ['#e53935', '#fb8c00', '#fdd835', '#43a047', '#1e88e5', '#8e24aa'];
        const segAngle = Math.PI * 2 / colors.length;
        ctx2.lineWidth = 3;
        colors.forEach((col, i) => {
            ctx2.strokeStyle = col;
            ctx2.beginPath(); ctx2.arc(cx, cy, r * .75, i * segAngle, (i + 1) * segAngle); ctx2.stroke();
        });
        ctx2.fillStyle = 'rgba(255,255,255,.7)';
        ctx2.font = `${r * .6}px sans-serif`;
        ctx2.textAlign = 'center'; ctx2.textBaseline = 'middle';
        ctx2.fillText('✦', cx, cy);
    }

    
    function makeGrid() {
        grid = []; special = [];
        for (let r = 0; r < ROWS; r++) {
            grid[r] = []; special[r] = [];
            for (let c = 0; c < COLS; c++) {
                let t; do { t = randInt(0, numTypes - 1); } while (initialMatch(r, c, t));
                grid[r][c] = t; special[r][c] = SP_NONE;
            }
        }
    }
    function initialMatch(r, c, t) {
        if (c >= 2 && grid[r][c - 1] === t && grid[r][c - 2] === t) return true;
        if (r >= 2 && grid[r - 1]?.[c] === t && grid[r - 2]?.[c] === t) return true;
        return false;
    }
    function randInt(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

    
    function findMatchGroups() {
        const groups = [];
        for (let r = 0; r < ROWS; r++) {
            let c = 0;
            while (c < COLS) {
                const t = grid[r][c]; if (t < 0) { c++; continue; }
                let e = c; while (e + 1 < COLS && grid[r][e + 1] === t) e++;
                if (e - c + 1 >= MIN_MATCH) { const cells = []; for (let i = c; i <= e; i++) cells.push({ r, c: i }); groups.push({ cells, len: e - c + 1, dir: 'h' }); }
                c = e + 1;
            }
        }
        for (let c = 0; c < COLS; c++) {
            let r = 0;
            while (r < ROWS) {
                const t = grid[r][c]; if (t < 0) { r++; continue; }
                let e = r; while (e + 1 < ROWS && grid[e + 1][c] === t) e++;
                if (e - r + 1 >= MIN_MATCH) { const cells = []; for (let i = r; i <= e; i++) cells.push({ r: i, c }); groups.push({ cells, len: e - r + 1, dir: 'v' }); }
                r = e + 1;
            }
        }
        return groups;
    }
    function findAllMatchCells() {
        const g = findMatchGroups(), set = new Set();
        g.forEach(gr => gr.cells.forEach(c => set.add(`${c.r},${c.c}`)));
        return [...set].map(s => { const [r, c] = s.split(',').map(Number); return { r, c }; });
    }

    
    function applyGravity() {
        const drops = [];
        for (let c = 0; c < COLS; c++) {
            let wr = ROWS - 1;
            for (let r = ROWS - 1; r >= 0; r--) {
                if (grid[r][c] >= 0) {
                    if (wr !== r) { grid[wr][c] = grid[r][c]; grid[r][c] = -1; special[wr][c] = special[r][c]; special[r][c] = SP_NONE; drops.push({ r: wr, c, fromR: r }); }
                    wr--;
                }
            }
            for (let r = wr; r >= 0; r--) { grid[r][c] = randInt(0, numTypes - 1); special[r][c] = SP_NONE; drops.push({ r, c, fromR: r - (wr - r) - 1 }); }
        }
        return drops;
    }

    
    function swap(r1, c1, r2, c2) { let t = grid[r1][c1]; grid[r1][c1] = grid[r2][c2]; grid[r2][c2] = t; t = special[r1][c1]; special[r1][c1] = special[r2][c2]; special[r2][c2] = t; }
    function hasAnyMove() {
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
            if (c + 1 < COLS) { swap(r, c, r, c + 1); if (findAllMatchCells().length > 0) { swap(r, c, r, c + 1); return true; } swap(r, c, r, c + 1); }
            if (r + 1 < ROWS) { swap(r, c, r + 1, c); if (findAllMatchCells().length > 0) { swap(r, c, r + 1, c); return true; } swap(r, c, r + 1, c); }
        }
        return false;
    }
    function findHintMove() {
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
            if (c + 1 < COLS) { swap(r, c, r, c + 1); if (findAllMatchCells().length > 0) { swap(r, c, r, c + 1); return { r1: r, c1: c, r2: r, c2: c + 1 }; } swap(r, c, r, c + 1); }
            if (r + 1 < ROWS) { swap(r, c, r + 1, c); if (findAllMatchCells().length > 0) { swap(r, c, r + 1, c); return { r1: r, c1: c, r2: r + 1, c2: c }; } swap(r, c, r + 1, c); }
        }
        return null;
    }
    function shuffleBoard() {
        let tries = 0;
        do { const f = grid.flat(); for (let i = f.length - 1; i > 0; i--) { const j = randInt(0, i);[f[i], f[j]] = [f[j], f[i]]; } for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { grid[r][c] = f[r * COLS + c]; special[r][c] = SP_NONE; } tries++; } while (!hasAnyMove() && tries < 100);
        if (!hasAnyMove()) makeGrid();
    }

    
    function sizeCanvas() {
        const wrap = $id('board-wrap');
        const maxW = Math.min(wrap.clientWidth - 8, 680), maxH = wrap.clientHeight - 8;
        cellSize = Math.floor(Math.min(maxW, maxH) / COLS);
        const W = cellSize * COLS, H = cellSize * ROWS;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = W * dpr; canvas.height = H * dpr;
        canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
        ctx2.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    
    function drawGridBg() {
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
            ctx2.fillStyle = (r + c) % 2 === 0 ? 'rgba(255,255,255,.04)' : 'rgba(0,0,0,.04)';
            ctx2.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
        }
        ctx2.strokeStyle = 'rgba(255,255,255,.06)'; ctx2.lineWidth = 1;
        for (let r = 1; r < ROWS; r++) { ctx2.beginPath(); ctx2.moveTo(0, r * cellSize); ctx2.lineTo(COLS * cellSize, r * cellSize); ctx2.stroke(); }
        for (let c = 1; c < COLS; c++) { ctx2.beginPath(); ctx2.moveTo(c * cellSize, 0); ctx2.lineTo(c * cellSize, ROWS * cellSize); ctx2.stroke(); }
    }
    function drawSel(r, c) {
        ctx2.save(); ctx2.strokeStyle = 'rgba(255,255,255,.8)'; ctx2.lineWidth = 3;
        ctx2.shadowColor = '#fff'; ctx2.shadowBlur = 12;
        ctx2.beginPath(); ctx2.roundRect(c * cellSize + 2, r * cellSize + 2, cellSize - 4, cellSize - 4, 6); ctx2.stroke();
        ctx2.restore();
    }
    function drawHint() {
        if (!hintCells) return;
        const t = (Date.now() % 1000) / 1000, pulse = .8 + .2 * Math.sin(t * Math.PI * 2);
        [{ r: hintCells.r1, c: hintCells.c1 }, { r: hintCells.r2, c: hintCells.c2 }].forEach(({ r, c }) => {
            ctx2.save(); ctx2.strokeStyle = `rgba(255,220,50,${.4 * pulse})`; ctx2.lineWidth = 3;
            ctx2.shadowColor = '#fdd835'; ctx2.shadowBlur = 15 * pulse;
            ctx2.beginPath(); ctx2.roundRect(c * cellSize + 2, r * cellSize + 2, cellSize - 4, cellSize - 4, 6); ctx2.stroke();
            ctx2.restore();
        });
    }
    function drawBoard() {
        ctx2.clearRect(0, 0, canvas.width, canvas.height); drawGridBg();
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++)
            if (grid[r][c] >= 0) drawCandyAt(c * cellSize, r * cellSize, cellSize, grid[r][c], special[r][c]);
        if (selected) drawSel(selected.r, selected.c);
        if (hintCells) drawHint();
    }

    
    let hintAnimFrame = null;
    function startHintAnim() { function loop() { if (!hintCells) { hintAnimFrame = null; return; } drawBoard(); hintAnimFrame = requestAnimationFrame(loop); } if (!hintAnimFrame) hintAnimFrame = requestAnimationFrame(loop); }
    function stopHintAnim() { hintCells = null; if (hintAnimFrame) { cancelAnimationFrame(hintAnimFrame); hintAnimFrame = null; } $id('hint-label').classList.remove('show'); }

    
    function animateSwap(r1, c1, r2, c2) {
        return new Promise(resolve => {
            const start = performance.now(), t1 = grid[r1][c1], t2 = grid[r2][c2], s1 = special[r1][c1], s2 = special[r2][c2];
            function frame(now) {
                let p = Math.min((now - start) / SWAP_DUR, 1); p = p < .5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
                ctx2.clearRect(0, 0, canvas.width, canvas.height); drawGridBg();
                for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
                    if ((r === r1 && c === c1) || (r === r2 && c === c2)) continue;
                    if (grid[r][c] >= 0) drawCandyAt(c * cellSize, r * cellSize, cellSize, grid[r][c], special[r][c]);
                }
                const dx = (c2 - c1) * cellSize * p, dy = (r2 - r1) * cellSize * p;
                drawCandyAt(c1 * cellSize + dx, r1 * cellSize + dy, cellSize, t1, s1, 1.05);
                drawCandyAt(c2 * cellSize - dx, r2 * cellSize - dy, cellSize, t2, s2, 1.05);
                if (p < 1) requestAnimationFrame(frame); else resolve();
            }
            requestAnimationFrame(frame);
        });
    }
    function animatePop(matches) {
        return new Promise(resolve => {
            const start = performance.now(), set = new Set(matches.map(m => `${m.r},${m.c}`)), types = {}, specs = {};
            matches.forEach(m => { types[`${m.r},${m.c}`] = grid[m.r][m.c]; specs[`${m.r},${m.c}`] = special[m.r][m.c]; });
            function frame(now) {
                let p = Math.min((now - start) / POP_DUR, 1);
                ctx2.clearRect(0, 0, canvas.width, canvas.height); drawGridBg();
                for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
                    const key = `${r},${c}`;
                    if (set.has(key)) drawCandyAt(c * cellSize, r * cellSize, cellSize, types[key], specs[key], 1 + .35 * Math.sin(p * Math.PI), 1 - p);
                    else if (grid[r][c] >= 0) drawCandyAt(c * cellSize, r * cellSize, cellSize, grid[r][c], special[r][c]);
                }
                if (p < 1) requestAnimationFrame(frame); else resolve();
            }
            requestAnimationFrame(frame);
        });
    }
    function animateDrop(drops) {
        return new Promise(resolve => {
            if (!drops.length) { resolve(); return; }
            const maxDist = Math.max(...drops.map(d => d.r - d.fromR)), dur = Math.max(maxDist * DROP_DUR, 120);
            const start = performance.now(), dm = {}; drops.forEach(d => { dm[`${d.r},${d.c}`] = d; });
            function frame(now) {
                let p = Math.min((now - start) / dur, 1);
                let bp; const pp = p;
                if (pp < 1 / 2.75) bp = 7.5625 * pp * pp;
                else if (pp < 2 / 2.75) { const q = pp - 1.5 / 2.75; bp = 7.5625 * q * q + .75; }
                else if (pp < 2.5 / 2.75) { const q = pp - 2.25 / 2.75; bp = 7.5625 * q * q + .9375; }
                else { const q = pp - 2.625 / 2.75; bp = 7.5625 * q * q + .984375; }
                ctx2.clearRect(0, 0, canvas.width, canvas.height); drawGridBg();
                for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
                    if (grid[r][c] < 0) continue; const key = `${r},${c}`;
                    if (dm[key]) { const d = dm[key]; drawCandyAt(c * cellSize, d.fromR * cellSize + (d.r - d.fromR) * cellSize * bp, cellSize, grid[r][c], special[r][c]); }
                    else drawCandyAt(c * cellSize, r * cellSize, cellSize, grid[r][c], special[r][c]);
                }
                if (p < 1) requestAnimationFrame(frame); else resolve();
            }
            requestAnimationFrame(frame);
        });
    }

    
    function showLineBlast(r, c, dir) {
        const rect = canvas.getBoundingClientRect(), el = document.createElement('div');
        el.className = 'line-blast ' + dir;
        if (dir === 'horizontal') { el.style.top = (rect.top + r * cellSize + cellSize / 2) + 'px'; el.style.left = rect.left + 'px'; el.style.width = rect.width + 'px'; el.style.height = '4px'; }
        else { el.style.left = (rect.left + c * cellSize + cellSize / 2) + 'px'; el.style.top = rect.top + 'px'; el.style.height = rect.height + 'px'; el.style.width = '4px'; }
        document.body.appendChild(el); setTimeout(() => el.remove(), 500);
    }

    
    let dragStart = null;
    canvas.addEventListener('pointerdown', e => {
        if (busy) return; stopHintAnim(); resetHintTimer();
        const rect = canvas.getBoundingClientRect(), c = Math.floor((e.clientX - rect.left) / cellSize), r = Math.floor((e.clientY - rect.top) / cellSize);
        if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
        dragStart = { r, c, x: e.clientX, y: e.clientY };
        if (!selected) { selected = { r, c }; SFX.click(); drawBoard(); }
        else {
            const dr = Math.abs(selected.r - r), dc = Math.abs(selected.c - c);
            if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) trySwap(selected.r, selected.c, r, c);
            else { selected = { r, c }; SFX.click(); drawBoard(); }
        }
    });
    canvas.addEventListener('pointermove', e => {
        if (!dragStart || busy) return;
        const dx = e.clientX - dragStart.x, dy = e.clientY - dragStart.y;
        if (Math.abs(dx) < cellSize * .3 && Math.abs(dy) < cellSize * .3) return;
        let tr = dragStart.r, tc = dragStart.c;
        if (Math.abs(dx) > Math.abs(dy)) tc += dx > 0 ? 1 : -1; else tr += dy > 0 ? 1 : -1;
        if (tr >= 0 && tr < ROWS && tc >= 0 && tc < COLS) { stopHintAnim(); selected = null; trySwap(dragStart.r, dragStart.c, tr, tc); }
        dragStart = null;
    });
    canvas.addEventListener('pointerup', () => { dragStart = null; });
    canvas.addEventListener('pointerleave', () => { dragStart = null; });

    
    async function trySwap(r1, c1, r2, c2) {
        busy = true; selected = null; stopHintAnim();
        const sp1 = special[r1][c1], sp2 = special[r2][c2];
        if (sp1 === SP_BOMB || sp2 === SP_BOMB) {
            swap(r1, c1, r2, c2); SFX.bomb(); await animateSwap(r2, c2, r1, c1);
            await handleBombSwap(r1, c1, r2, c2);
            if (mode !== 'endless') { moves--; updateHUD(); }
            await cascadeLoop(); drawBoard(); checkEndState(); resetHintTimer(); busy = false; return;
        }
        swap(r1, c1, r2, c2); SFX.swap(); await animateSwap(r2, c2, r1, c1);
        let groups = findMatchGroups();
        if (!groups.length) { swap(r1, c1, r2, c2); SFX.bad(); await animateSwap(r2, c2, r1, c1); drawBoard(); resetHintTimer(); busy = false; return; }
        if (mode !== 'endless') { moves--; updateHUD(); }
        await processGroups(groups, r1, c1, r2, c2);
        await cascadeLoop();
        drawBoard(); checkEndState(); resetHintTimer(); busy = false;
    }

    async function processGroups(groups, swR1, swC1, swR2, swC2) {
        let allCells = []; groups.forEach(g => g.cells.forEach(c => allCells.push(c)));
        const uSet = new Set(allCells.map(c => `${c.r},${c.c}`));
        const uCells = [...uSet].map(s => { const [r, c] = s.split(',').map(Number); return { r, c }; });
        const pts = uCells.length * 10; score += pts; SFX.pop(); showFloat(uCells, pts);
        const spTrig = []; uCells.forEach(({ r, c }) => { if (special[r][c] !== SP_NONE) spTrig.push({ r, c, sp: special[r][c] }); });
        await animatePop(uCells);
        for (const { r, c, sp } of spTrig) await triggerSpecial(r, c, sp);
        for (const g of groups) {
            if (g.len === 4) {
                const sc = g.cells.find(c => (c.r === swR1 && c.c === swC1) || (c.r === swR2 && c.c === swC2)) || g.cells[1];
                const ot = grid[sc.r]?.[sc.c] >= 0 ? grid[sc.r][sc.c] : randInt(0, numTypes - 1);
                g.cells.forEach(c => { grid[c.r][c.c] = -1; special[c.r][c.c] = SP_NONE; });
                grid[sc.r][sc.c] = ot; special[sc.r][sc.c] = g.dir === 'h' ? SP_STRIPED_V : SP_STRIPED_H; SFX.special();
            } else if (g.len >= 5) {
                const sc = g.cells.find(c => (c.r === swR1 && c.c === swC1) || (c.r === swR2 && c.c === swC2)) || g.cells[2];
                g.cells.forEach(c => { grid[c.r][c.c] = -1; special[c.r][c.c] = SP_NONE; });
                grid[sc.r][sc.c] = randInt(0, numTypes - 1); special[sc.r][sc.c] = SP_BOMB; SFX.bomb();
            } else { g.cells.forEach(c => { grid[c.r][c.c] = -1; special[c.r][c.c] = SP_NONE; }); }
        }
        updateHUD(); const drops = applyGravity(); await animateDrop(drops);
    }

    async function cascadeLoop() {
        let combo = 1, groups = findMatchGroups();
        while (groups.length > 0) {
            combo++;
            let allCells = []; groups.forEach(g => g.cells.forEach(c => allCells.push(c)));
            const uSet = new Set(allCells.map(c => `${c.r},${c.c}`));
            const uCells = [...uSet].map(s => { const [r, c] = s.split(',').map(Number); return { r, c }; });
            const pts = uCells.length * 10 * Math.min(combo, 5); score += pts; SFX.pop();
            if (combo >= 2) { SFX.combo(combo); showCombo(combo); } showFloat(uCells, pts);
            const spTrig = []; uCells.forEach(({ r, c }) => { if (special[r][c] !== SP_NONE) spTrig.push({ r, c, sp: special[r][c] }); });
            await animatePop(uCells);
            for (const { r, c, sp } of spTrig) await triggerSpecial(r, c, sp);
            for (const g of groups) {
                if (g.len === 4) { const sc = g.cells[1]; const ot = grid[sc.r]?.[sc.c] >= 0 ? grid[sc.r][sc.c] : randInt(0, numTypes - 1); g.cells.forEach(c => { grid[c.r][c.c] = -1; special[c.r][c.c] = SP_NONE; }); grid[sc.r][sc.c] = ot; special[sc.r][sc.c] = g.dir === 'h' ? SP_STRIPED_V : SP_STRIPED_H; SFX.special(); }
                else if (g.len >= 5) { const sc = g.cells[2]; g.cells.forEach(c => { grid[c.r][c.c] = -1; special[c.r][c.c] = SP_NONE; }); grid[sc.r][sc.c] = randInt(0, numTypes - 1); special[sc.r][sc.c] = SP_BOMB; SFX.bomb(); }
                else { g.cells.forEach(c => { grid[c.r][c.c] = -1; special[c.r][c.c] = SP_NONE; }); }
            }
            updateHUD(); const drops = applyGravity(); await animateDrop(drops); groups = findMatchGroups();
        }
    }

    async function triggerSpecial(r, c, sp) {
        const toClear = [];
        if (sp === SP_STRIPED_H) { showLineBlast(r, c, 'horizontal'); for (let cc = 0; cc < COLS; cc++) toClear.push({ r, c: cc }); SFX.special(); }
        else if (sp === SP_STRIPED_V) { showLineBlast(r, c, 'vertical'); for (let rr = 0; rr < ROWS; rr++) toClear.push({ r: rr, c }); SFX.special(); }
        const chain = [];
        for (const cell of toClear) {
            if (special[cell.r][cell.c] !== SP_NONE && (cell.r !== r || cell.c !== c)) chain.push({ r: cell.r, c: cell.c, sp: special[cell.r][cell.c] });
            grid[cell.r][cell.c] = -1; special[cell.r][cell.c] = SP_NONE; score += 5;
        }
        await sleep(100);
        for (const ch of chain) await triggerSpecial(ch.r, ch.c, ch.sp);
    }

    async function handleBombSwap(r1, c1, r2, c2) {
        let bombR, bombC, targetType;
        if (special[r1][c1] === SP_BOMB) { bombR = r1; bombC = c1; targetType = grid[r2][c2]; }
        else { bombR = r2; bombC = c2; targetType = grid[r1][c1]; }
        const toClear = [];
        for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (grid[r][c] === targetType) toClear.push({ r, c });
        toClear.push({ r: bombR, c: bombC });
        score += toClear.length * 15; showFloat(toClear, toClear.length * 15); showComboMsg('💥 COLOR BOMB!', '#fdd835');
        await animatePop(toClear);
        for (const cell of toClear) {
            if (special[cell.r][cell.c] !== SP_NONE && special[cell.r][cell.c] !== SP_BOMB) await triggerSpecial(cell.r, cell.c, special[cell.r][cell.c]);
            grid[cell.r][cell.c] = -1; special[cell.r][cell.c] = SP_NONE;
        }
        updateHUD(); const drops = applyGravity(); await animateDrop(drops);
    }

    function checkEndState() {
        if (mode === 'levels' && score >= target) { setTimeout(() => winLevel(), 400); return; }
        if (mode === 'levels' && moves <= 0) { setTimeout(() => gameOver(), 400); return; }
        if (!hasAnyMove()) { shuffleBoard(); drawBoard(); showComboMsg('Shuffled!', '#64b5f6'); }
    }

    
    function resetHintTimer() { clearTimeout(hintTimer); stopHintAnim(); if (!busy && screens.game.classList.contains('active')) hintTimer = setTimeout(showHint, 4000); }
    function showHint() { if (busy) return; const h = findHintMove(); if (h) { hintCells = h; $id('hint-label').classList.add('show'); startHintAnim(); } }
    function manualHint() { if (busy) return; stopHintAnim(); const h = findHintMove(); if (h) { hintCells = h; $id('hint-label').classList.add('show'); startHintAnim(); } }

    
    function updateHUD() {
        $id('hud-score').textContent = score.toLocaleString();
        $id('hud-moves').textContent = mode === 'endless' ? '∞' : moves;
        $id('hud-level').textContent = mode === 'endless' ? 'Endless' : 'Level ' + level;
        $id('hud-target').textContent = mode === 'endless' ? 'No Limit' : 'Goal: ' + target.toLocaleString();
        const pct = Math.min(score / target * 100, 100);
        $id('target-bar').style.width = pct + '%';
        const stars = document.querySelectorAll('.p-star');
        if (stars.length >= 3) { stars[0].classList.toggle('lit', pct >= 33); stars[1].classList.toggle('lit', pct >= 66); stars[2].classList.toggle('lit', pct >= 100); }
    }

    
    function showFloat(matches, pts) {
        const rect = canvas.getBoundingClientRect();
        const avgC = matches.reduce((s, m) => s + m.c, 0) / matches.length, avgR = matches.reduce((s, m) => s + m.r, 0) / matches.length;
        const el = document.createElement('div'); el.className = 'float-text'; el.textContent = '+' + pts;
        el.style.left = (rect.left + (avgC + .5) * cellSize) + 'px'; el.style.top = (rect.top + avgR * cellSize) + 'px';
        $id('floats').appendChild(el); setTimeout(() => el.remove(), 900);
    }
    function showCombo(n) {
        const t = ['', '', 'Sweet!', 'Tasty!', 'Delicious!', 'Divine!', 'Sugar Rush!'], c = ['', '', '#64b5f6', '#81c784', '#fdd835', '#ff7043', '#ce93d8'];
        showComboMsg(t[Math.min(n, 6)] || 'Incredible!', c[Math.min(n, 6)] || '#fff');
    }
    function showComboMsg(text, color) {
        const el = $id('combo-popup'); el.textContent = text; el.style.color = color;
        el.style.textShadow = `0 3px 0 rgba(0,0,0,.3), 0 0 20px ${color}`;
        el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
    }

    
    function startGame(m) {
        mode = m; score = 0; level = 1;
        if (mode === 'levels') { const cfg = getLevelConfig(level); numTypes = cfg.numTypes; moves = cfg.moves; target = cfg.target; }
        else { numTypes = 6; moves = 999; target = 99999; }
        selected = null; busy = false; makeGrid();
        let s = 0; while (findAllMatchCells().length > 0 && s < 50) { makeGrid(); s++; }
        if (!hasAnyMove()) shuffleBoard();
        showScreen('game'); sizeCanvas(); updateHUD(); drawBoard(); resetHintTimer();
    }
    function gameOver() {
        clearTimeout(hintTimer); stopHintAnim(); SFX.over();
        if (score > highScore) { highScore = score; localStorage.setItem('cc_hi', String(highScore)); }
        $id('over-score-val').textContent = score.toLocaleString();
        $id('over-best-val').textContent = highScore.toLocaleString();
        showScreen('over');
    }
    function winLevel() {
        clearTimeout(hintTimer); stopHintAnim(); SFX.win();
        if (score > highScore) { highScore = score; localStorage.setItem('cc_hi', String(highScore)); }
        $id('lv-score-val').textContent = score.toLocaleString();
        const ratio = score / target;
        ['star1', 'star2', 'star3'].forEach(id => $id(id).classList.remove('earned'));
        setTimeout(() => { if (ratio >= 1) $id('star1').classList.add('earned'); }, 200);
        setTimeout(() => { if (ratio >= 1.5) $id('star2').classList.add('earned'); }, 500);
        setTimeout(() => { if (ratio >= 2) $id('star3').classList.add('earned'); }, 800);
        showScreen('level');
    }
    function nextLevel() {
        level++; score = 0;
        const cfg = getLevelConfig(level); numTypes = cfg.numTypes; moves = cfg.moves; target = cfg.target;
        selected = null; busy = false; makeGrid();
        let s = 0; while (findAllMatchCells().length > 0 && s < 50) { makeGrid(); s++; }
        if (!hasAnyMove()) shuffleBoard();
        showScreen('game'); sizeCanvas(); updateHUD(); drawBoard(); resetHintTimer();
    }
    function goHome() { clearTimeout(hintTimer); stopHintAnim(); $id('menu-high').textContent = highScore.toLocaleString(); showScreen('menu'); }
    function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

    
    $id('btn-play').addEventListener('click', () => { SFX.click(); startGame('levels'); });
    $id('btn-endless').addEventListener('click', () => { SFX.click(); startGame('endless'); });
    $id('btn-retry').addEventListener('click', () => { SFX.click(); startGame(mode); });
    $id('btn-home').addEventListener('click', () => { SFX.click(); goHome(); });
    $id('btn-next').addEventListener('click', () => { SFX.click(); nextLevel(); });
    $id('btn-lv-home').addEventListener('click', () => { SFX.click(); goHome(); });
    $id('btn-quit').addEventListener('click', () => { SFX.click(); goHome(); });
    $id('btn-hint').addEventListener('click', () => { SFX.click(); manualHint(); });
    $id('btn-sound').addEventListener('click', () => {
        const m = SFX.toggle();
        $id('sound-icon').textContent = m ? '🔇' : '🔊';
        $id('sound-label').textContent = m ? 'Muted' : 'Sound';
        $id('btn-sound').classList.toggle('muted', m);
    });
    window.addEventListener('resize', () => { if (screens.game.classList.contains('active')) { sizeCanvas(); drawBoard(); } });
    $id('menu-high').textContent = highScore.toLocaleString();

})();
