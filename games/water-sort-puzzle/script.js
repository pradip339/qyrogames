var game, level,
    color = ["#ef4444", "#3b82f6", "#eab308", "#22c55e", "#a855f7", "#84cc16", "#06b6d4", "#f97316", "#78350f", "#ec4899"],
    water = [], w = [], currentLevel, clicked = [],
    transferring = false, won = false, moves = 0, soundEnabled = true;

var testTubePosition = {
    0: [[-110, 180], [-20, 180], [70, 180], [-65, 360], [15, 360]],
    1: [[-110, 180], [-20, 180], [70, 180], [-110, 360], [-20, 360], [70, 360]],
    2: [[-140, 180], [-60, 180], [20, 180], [100, 180], [-110, 360], [-20, 360], [70, 360]],
    3: [[-140, 180], [-60, 180], [20, 180], [100, 180], [-140, 360], [-60, 360], [20, 360], [100, 360]]
};

let audioCtx = null;

function getAudioCtx() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playTone(freq, duration, type = 'sine', volume = 0.3) {
    if (!soundEnabled) return;
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
}

function playClickSound() {
    playTone(400, 0.1, 'sine', 0.2);
}

function playSelectSound() {
    playTone(600, 0.1, 'sine', 0.2);
    setTimeout(() => playTone(800, 0.08, 'sine', 0.15), 50);
}

function playWaterSound() {
    if (!soundEnabled) return;
    const ctx = getAudioCtx();

    
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            const startFreq = 200 + Math.random() * 100;
            const endFreq = 400 + Math.random() * 200;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.3);

            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.3);
        }, i * 150);
    }
}

function playWinSound() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
        setTimeout(() => playTone(freq, 0.4, 'sine', 0.2), idx * 100);
    });
}

function playErrorSound() {
    playTone(200, 0.15, 'triangle', 0.2);
    setTimeout(() => playTone(150, 0.2, 'triangle', 0.15), 100);
}

window.ToggleSound = function () {
    soundEnabled = !soundEnabled;
    document.getElementById("sound-toggle").textContent = soundEnabled ? "🔊" : "🔇";
    if (soundEnabled) getAudioCtx(); 
};

window.onload = function () {
    game = document.getElementById("game");
    level = document.getElementById("level");

    
    const resumeAudio = () => {
        getAudioCtx();
        window.removeEventListener('click', resumeAudio);
        window.removeEventListener('touchstart', resumeAudio);
    };
    window.addEventListener('click', resumeAudio);
    window.addEventListener('touchstart', resumeAudio);

    setTimeout(() => {
        document.getElementById("preloader").classList.add("hidden");
    }, 1000);
};

window.OpenLevel = function (x) {
    playSelectSound();
    moves = 0;
    currentLevel = x;
    won = false;

    document.getElementById("menu").style.display = "none";
    level.style.display = "block";
    level.innerHTML = "";

    water = [];
    let a = [], c = 0;

    for (let i = 0; i < x + 3; i++) {
        for (let j = 0; j < 4; j++) {
            a.push(color[i]);
        }
    }

    a = shuffle(a);

    for (let i = 0; i < x + 3; i++) {
        water[i] = [];
        for (let j = 0; j < 4; j++) {
            water[i].push(a[c]);
            c++;
        }
    }

    water.push(
        ["transparent", "transparent", "transparent", "transparent"],
        ["transparent", "transparent", "transparent", "transparent"]
    );

    w = water.map((a) => [...a]);
    ApplyInfo();
};

function ApplyInfo(a = water) {
    if (!won) {
        let d = 0,
            heading = ["EASY", "MEDIUM", "HARD", "VERY HARD"][currentLevel];

        level.innerHTML = `<div id='lvl-heading'>${heading}</div>`;

        for (let i of testTubePosition[currentLevel]) {
            level.innerHTML += `
                        <div class="test-tube" style="top:${i[1]}px;left:calc(50vw + ${i[0]}px);" onclick="Clicked(${d});">
                            <div class="colors" style="background-color:${a[d][0]};top:108px;"></div>
                            <div class="colors" style="background-color:${a[d][1]};top:76px;"></div>
                            <div class="colors" style="background-color:${a[d][2]};top:44px;"></div>
                            <div class="colors" style="background-color:${a[d][3]};top:12px;"></div>
                        </div>`;
            d++;
        }

        level.innerHTML += `
                    <div id="restart" class="game-buttons" onclick="Restart();">RESTART</div>
                    <div id="home" class="game-buttons" onclick="ShowMenu();">HOME</div>
                    <div id="moves">Moves: ${moves}</div>`;
    }
}

window.Clicked = function (x) {
    if (!transferring) {
        if (clicked.length == 0) {
            playSelectSound();
            clicked.push(x);
            document.getElementsByClassName("test-tube")[x].classList.add("selected");
            document.getElementsByClassName("test-tube")[x].style.transition = "0.2s ease";
            document.getElementsByClassName("test-tube")[x].style.transform = "scale(1.15)";
        } else {
            playClickSound();
            clicked.push(x);
            let el = document.getElementsByClassName("test-tube")[clicked[0]];
            el.classList.remove("selected");
            el.style.transform = "scale(1)";

            if (clicked[0] != clicked[1]) {
                el.style.transition = "1s ease";
                moves++;
                document.getElementById("moves").innerHTML = "Moves: " + moves;
                Transfer(...clicked);
            }
            clicked = [];
        }
    }
};

function TransferAnim(a, b) {
    let el = document.getElementsByClassName("test-tube")[a];
    transferring = true;
    el.style.zIndex = "100";
    el.style.top = `calc(${testTubePosition[currentLevel][b][1]}px - 90px)`;
    el.style.left = `calc(50vw + ${testTubePosition[currentLevel][b][0]}px - 70px)`;
    el.style.transform = "rotate(75deg)";

    playWaterSound();

    setTimeout(() => el.style.transform = "rotate(90deg)", 1000);
    setTimeout(() => {
        el.style.left = `calc(50vw + ${testTubePosition[currentLevel][a][0]}px)`;
        el.style.top = `calc(${testTubePosition[currentLevel][a][1]}px)`;
        el.style.transform = "rotate(0deg)";
    }, 2000);
    setTimeout(() => {
        el.style.zIndex = "0";
        transferring = false;
    }, 3000);
}

function Transfer(a, b) {
    if (!water[b].includes("transparent") ||
        JSON.stringify(water[a]) == JSON.stringify(["transparent", "transparent", "transparent", "transparent"])) {
        moves -= 1;
        document.getElementById("moves").innerHTML = "Moves: " + moves;
        playErrorSound();
        return;
    }

    let p, q, r = false, s = false, count = 0, c = 0;

    for (let i = 0; i < 4; i++) {
        if (((water[a][i] != "transparent" && water[a][i + 1] == "transparent") || i === 3) && !r) {
            r = true;
            p = [water[a][i], i];

            if (water[a].map(x => (x == "transparent" || x == p[0]) ? 1 : 0).reduce((x, y) => x + y) === 4) {
                p.push(i + 1);
            } else {
                for (let j = 1; j < 4; j++) {
                    if (i - j >= 0 && water[a][i - j] != p[0]) {
                        p.push(j);
                        break;
                    }
                }
            }
        }

        if (((water[b][i] != "transparent" && water[b][i + 1] == "transparent") || water[b][0] == "transparent") && !s) {
            s = true;
            q = [water[b][i], i, water[b].map(x => x == "transparent" ? 1 : 0).reduce((x, y) => x + y)];
        }
    }

    if (q[0] != "transparent" && p[0] != q[0]) {
        moves -= 1;
        document.getElementById("moves").innerHTML = "Moves: " + moves;
        playErrorSound();
        return;
    }

    for (let i = 3; i >= 0; i--) {
        if ((water[a][i] == p[0] || water[a][i] == "transparent") && count < q[2]) {
            if (water[a][i] == p[0]) count++;
            water[a][i] = "transparent";
        } else break;
    }

    c = count;
    setTimeout(() => WaterDec(p, a, c), 1010);
    setTimeout(() => WaterInc(p, q, b, c), 1010);

    for (let i = 0; i < 4; i++) {
        if (water[b][i] == "transparent" && count > 0) {
            count--;
            water[b][i] = p[0];
        }
    }

    setTimeout(() => ApplyInfo(), 3020);
    setTimeout(() => TransferAnim(a, b), 10);
    setTimeout(Won, 3000);
}

function WaterDec(p, a, count) {
    p[1] = 3 - p[1];
    document.getElementsByClassName("test-tube")[a].innerHTML += `<div id="white-bg" style="top:calc(12px + ${p[1] * 32}px);height:0;background:rgba(255,255,255,0.3);"></div>`;

    setTimeout(() => {
        document.getElementById("white-bg").style.height = count * 32 + "px";
    }, 50);

    setTimeout(() => {
        document.getElementsByClassName("test-tube")[a].innerHTML = `
                    <div class="colors" style="background-color:${water[a][0]};top:108px;"></div>
                    <div class="colors" style="background-color:${water[a][1]};top:76px;"></div>
                    <div class="colors" style="background-color:${water[a][2]};top:44px;"></div>
                    <div class="colors" style="background-color:${water[a][3]};top:12px;"></div>`;
    }, 1050);
}

function WaterInc(p, q, b, count) {
    q[1] = 4 - q[1];
    q[1] -= (q[0] != "transparent" ? 1 : 0);

    document.getElementsByClassName("test-tube")[b].innerHTML += `<div id="colorful-bg" style="background-color:${p[0]};top:calc(12px + ${q[1] * 32}px);height:0;"></div>`;

    setTimeout(() => {
        document.getElementById("colorful-bg").style.height = count * 32 + "px";
        document.getElementById("colorful-bg").style.top = `calc(12px + ${q[1] * 32}px - ${count * 32}px)`;
    }, 50);
}

window.Restart = function () {
    playClickSound();
    moves = 0;
    water = w.map((a) => [...a]);
    won = false;
    ApplyInfo(w);
};

window.ShowMenu = function () {
    playClickSound();
    document.getElementById("menu").style.display = "flex";
    level.style.display = "none";
};

function Won() {
    for (let i of water) {
        if (i[0] != i[1] || i[1] != i[2] || i[2] != i[3]) return;
    }
    won = true;
    playWinSound();
    level.innerHTML = `
                <div id="won">YOU WON! 🎉</div>
                <div id="restart" class="game-buttons" onclick="Restart();">RESTART</div>
                <div id="home" class="game-buttons" onclick="ShowMenu();">HOME</div>`;
}

function shuffle(x) {
    let a = [], len = x.length;
    for (let i = 0; i < len; i++) {
        let n = Math.floor(Math.random() * x.length);
        a.push(x[n]);
        x.splice(n, 1);
    }
    return a;
}

window.ShowRules = function () {
    playClickSound();
    document.getElementById("rules-page").style.display = "block";
    setTimeout(() => {
        document.getElementById("rules-page").style.opacity = "1";
    }, 50);
};

window.HideRules = function () {
    playClickSound();
    document.getElementById("rules-page").style.opacity = "0";
    setTimeout(() => {
        document.getElementById("rules-page").style.display = "none";
    }, 500);
};
