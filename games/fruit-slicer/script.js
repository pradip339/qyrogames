var playing = false;
var score = 0;
var trialsleft = 3;
var step = 3;
var action = null;
var isMuted = false;
var isSlicing = false;   
var lastX = 0, lastY = 0;

var FRUIT_SIZE = 80;   
var fruits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

var audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } else if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function playSliceSound() {
  if (!audioCtx || isMuted) return;
  var now = audioCtx.currentTime;

  
  var bufSize = Math.round(audioCtx.sampleRate * 0.14);
  var buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
  var d = buf.getChannelData(0);
  for (var i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
  var swoosh = audioCtx.createBufferSource();
  swoosh.buffer = buf;
  var hpf = audioCtx.createBiquadFilter();
  hpf.type = "highpass";
  hpf.frequency.value = 2000;
  var sg = audioCtx.createGain();
  sg.gain.setValueAtTime(0.5, now);
  sg.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
  swoosh.connect(hpf); hpf.connect(sg); sg.connect(audioCtx.destination);
  swoosh.start(now); swoosh.stop(now + 0.15);

  
  var sq = audioCtx.createOscillator();
  var sqG = audioCtx.createGain();
  var lpf = audioCtx.createBiquadFilter();
  sq.type = "triangle";
  sq.frequency.setValueAtTime(320, now + 0.03);
  sq.frequency.exponentialRampToValueAtTime(120, now + 0.22);
  lpf.type = "lowpass"; lpf.frequency.value = 700;
  sqG.gain.setValueAtTime(0.55, now + 0.03);
  sqG.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
  sq.connect(lpf); lpf.connect(sqG); sqG.connect(audioCtx.destination);
  sq.start(now + 0.03); sq.stop(now + 0.26);

  
  var ping = audioCtx.createOscillator();
  var pgG = audioCtx.createGain();
  ping.type = "sine";
  ping.frequency.setValueAtTime(1600, now);
  ping.frequency.exponentialRampToValueAtTime(700, now + 0.1);
  pgG.gain.setValueAtTime(0.18, now);
  pgG.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  ping.connect(pgG); pgG.connect(audioCtx.destination);
  ping.start(now); ping.stop(now + 0.14);
}

function playMissSound() {
  if (!audioCtx || isMuted) return;
  var now = audioCtx.currentTime;
  var osc = audioCtx.createOscillator();
  var g = audioCtx.createGain();
  var lpf = audioCtx.createBiquadFilter();
  osc.type = "sine";
  osc.frequency.setValueAtTime(180, now);
  osc.frequency.exponentialRampToValueAtTime(55, now + 0.22);
  lpf.type = "lowpass"; lpf.frequency.value = 350;
  g.gain.setValueAtTime(0.45, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
  osc.connect(lpf); lpf.connect(g); g.connect(audioCtx.destination);
  osc.start(now); osc.stop(now + 0.28);
}

var canvas, ctx2d, trailPoints = [];

function initCanvas() {
  canvas = document.getElementById("sliceCanvas");
  if (!canvas) return;
  resizeCanvas();
  ctx2d = canvas.getContext("2d");
}

function resizeCanvas() {
  if (!canvas) return;
  var fc = document.getElementById("fruitcontainer");
  canvas.width = fc.offsetWidth;
  canvas.height = fc.offsetHeight;
}

function addTrailPoint(x, y) {
  trailPoints.push({ x: x, y: y, t: Date.now() });
  if (trailPoints.length > 28) trailPoints.shift();
  drawTrail();
}

var trailRaf = null;
function drawTrail() {
  if (!ctx2d) return;
  ctx2d.clearRect(0, 0, canvas.width, canvas.height);
  var now = Date.now();
  for (var i = 1; i < trailPoints.length; i++) {
    var age = (now - trailPoints[i].t) / 280;
    var alpha = Math.max(0, 1 - age);
    if (alpha <= 0) continue;
    ctx2d.beginPath();
    ctx2d.moveTo(trailPoints[i - 1].x, trailPoints[i - 1].y);
    ctx2d.lineTo(trailPoints[i].x, trailPoints[i].y);
    ctx2d.strokeStyle = isSlicing
      ? "rgba(255, 230, 100, " + (alpha * 0.9) + ")"
      : "rgba(200, 200, 200, " + (alpha * 0.3) + ")";
    ctx2d.lineWidth = isSlicing ? 4 * alpha : 1.5 * alpha;
    ctx2d.lineCap = "round";
    ctx2d.stroke();
  }
  
  if (isSlicing && trailPoints.length > 0) {
    var last = trailPoints[trailPoints.length - 1];
    var grad = ctx2d.createRadialGradient(last.x, last.y, 0, last.x, last.y, 16);
    grad.addColorStop(0, "rgba(255,220,60,0.55)");
    grad.addColorStop(1, "rgba(255,220,60,0)");
    ctx2d.beginPath();
    ctx2d.arc(last.x, last.y, 16, 0, Math.PI * 2);
    ctx2d.fillStyle = grad;
    ctx2d.fill();
  }
  trailPoints = trailPoints.filter(function (p) { return Date.now() - p.t < 350; });
  if (trailRaf) cancelAnimationFrame(trailRaf);
  if (trailPoints.length > 0) trailRaf = requestAnimationFrame(drawTrail);
  else ctx2d.clearRect(0, 0, canvas.width, canvas.height);
}

var bladeCursor = null;

function initCursor() {
  bladeCursor = document.getElementById("blade-cursor");
  if (!bladeCursor) return;

  var fc = document.getElementById("fruitcontainer");

  fc.addEventListener("mouseenter", function () {
    bladeCursor.classList.add("visible");
  });
  fc.addEventListener("mouseleave", function () {
    bladeCursor.classList.remove("visible");
    isSlicing = false;
    bladeCursor.classList.remove("slicing");
  });
}

function moveCursor(x, y) {
  if (!bladeCursor) return;
  bladeCursor.style.left = x + "px";
  bladeCursor.style.top = y + "px";

  
  var dx = x - lastX;
  var dy = y - lastY;
  if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
    var angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    bladeCursor.style.transform = "translate(-50%,-50%) rotate(" + angle + "deg)";
  }
}

function distPointToSegment(px, py, ax, ay, bx, by) {
  var dx = bx - ax, dy = by - ay;
  var lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - ax, py - ay);
  var t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function checkSliceCollision(x1, y1, x2, y2) {
  if (!playing) return;
  var fruit = document.getElementById("fruit1");
  if (!fruit || fruit.style.display === "none") return;

  var rect = fruit.getBoundingClientRect();
  var fcRect = document.getElementById("fruitcontainer").getBoundingClientRect();

  
  var cx = (rect.left + rect.right) / 2 - fcRect.left;
  var cy = (rect.top + rect.bottom) / 2 - fcRect.top;
  var r = FRUIT_SIZE / 2 + 4; 

  var dist = distPointToSegment(cx, cy, x1, y1, x2, y2);
  if (dist < r) {
    doSlice(cx, cy);
  }
}

function doSlice(cx, cy) {
  score++;
  document.getElementById("scoreValue").textContent = score;
  playSliceSound();

  clearInterval(action);

  
  showScorePop(cx, cy);

  
  showJuiceSplat(cx, cy);

  
  sliceFruit();

  setTimeout(startAction, 480);
}

function sliceFruit() {
  var fruit = document.getElementById("fruit1");
  if (!fruit) return;

  var fc = document.getElementById("fruitcontainer");
  var fruitRect = fruit.getBoundingClientRect();
  var fcRect = fc.getBoundingClientRect();

  var x = fruitRect.left - fcRect.left;
  var y = fruitRect.top - fcRect.top;
  var W = FRUIT_SIZE;
  var H = FRUIT_SIZE;
  var hw = Math.ceil(W / 2);
  var src = fruit.getAttribute("src");

  fruit.style.display = "none";

  function makeHalf(side) {
    var el = document.createElement("div");
    el.className = "fruit-half";
    el.style.cssText = [
      "left:" + (side === "left" ? x : x + hw) + "px",
      "top:" + y + "px",
      "width:" + hw + "px",
      "height:" + H + "px",
      "overflow:hidden",
      "background-image:url(" + src + ")",
      "background-size:" + W + "px " + H + "px",
      "background-position:" + (side === "left" ? "0 0" : "-" + hw + "px 0"),
      "background-repeat:no-repeat",
      "filter:drop-shadow(0 4px 8px rgba(0,0,0,0.5))"
    ].join(";");
    fc.appendChild(el);
    return el;
  }

  var left = makeHalf("left");
  var right = makeHalf("right");

  
  left.style.backgroundImage = "url(" + src + ")";
  right.style.backgroundImage = "url(" + src + ")";

  
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      left.style.transform = "translate(-42px, 65px) rotate(-30deg)";
      left.style.opacity = "0";
      right.style.transform = "translate(42px, 65px) rotate(30deg)";
      right.style.opacity = "0";
    });
  });

  setTimeout(function () { left.remove(); right.remove(); }, 600);
}

var splatColors = ["#e53e3e", "#dd6b20", "#d69e2e", "#38a169", "#e91e8c", "#4299e1"];

function showJuiceSplat(cx, cy) {
  var splat = document.getElementById("juice-splat");
  if (!splat) return;
  var color = splatColors[Math.floor(Math.random() * splatColors.length)];
  var size = 60 + Math.random() * 40;
  splat.style.cssText = [
    "left:" + (cx - size / 2) + "px",
    "top:" + (cy - size / 2) + "px",
    "width:" + size + "px",
    "height:" + size + "px",
    "background:" + color
  ].join(";");
  splat.classList.remove("active");
  void splat.offsetWidth; 
  splat.classList.add("active");
}

function showScorePop(cx, cy) {
  var pop = document.createElement("div");
  pop.className = "score-pop";
  pop.textContent = "+1";
  pop.style.left = (cx - 16) + "px";
  pop.style.top = (cy - 16) + "px";
  document.getElementById("fruitcontainer").appendChild(pop);
  setTimeout(function () { pop.remove(); }, 720);
}

function renderLives() {
  for (var i = 0; i < 3; i++) {
    var el = document.getElementById("life" + i);
    if (!el) continue;
    el.className = "life" + (i >= trialsleft ? " lost" : "");
  }
}

function showGameOver() {
  var go = document.getElementById("gameOver");
  go.innerHTML =
    '<div class="go-title">Game Over!</div>' +
    '<div class="go-label">SCORE</div>' +
    '<div class="go-score-num">' + score + '</div>' +
    '<div id="playAgainBtn">Play Again 🍓</div>';
  go.style.display = "flex";
  document.getElementById("playAgainBtn").addEventListener("click", function () {
    location.reload();
  });
}

function startAction() {
  var fruit = document.getElementById("fruit1");
  var fcW = document.getElementById("fruitcontainer").offsetWidth;
  var margin = FRUIT_SIZE + 10;

  fruit.style.display = "block";
  chooseRandom();
  fruit.style.left = Math.round((fcW - margin) * Math.random()) + "px";
  fruit.style.top = "-" + (FRUIT_SIZE + 10) + "px";
  step = 1.8 + Math.random() * 3.5;

  action = setInterval(function () {
    var top = parseFloat(fruit.style.top) + step;
    fruit.style.top = top + "px";

    var fcH = document.getElementById("fruitcontainer").offsetHeight;
    if (top > fcH - 20) {
      playMissSound();
      trialsleft--;
      renderLives();

      if (trialsleft > 0) {
        var fcW2 = document.getElementById("fruitcontainer").offsetWidth;
        fruit.style.left = Math.round((fcW2 - margin) * Math.random()) + "px";
        fruit.style.top = "-" + (FRUIT_SIZE + 10) + "px";
        step = 1.8 + Math.random() * 3.5;
        chooseRandom();
      } else {
        playing = false;
        clearInterval(action);
        fruit.style.display = "none";
        setTimeout(showGameOver, 300);
      }
    }
  }, 10);
}

function chooseRandom() {
  var fruit = document.getElementById("fruit1");
  fruit.setAttribute("src",
    "https://raw.githubusercontent.com/Saumya-07/Fruit-Slicer/master/images/" +
    fruits[Math.floor(Math.random() * fruits.length)] + ".png"
  );
}

function toggleSound() {
  isMuted = !isMuted;
  var btn = document.getElementById("btn-sound");
  var iconOn = document.getElementById("icon-snd-on");
  var iconOff = document.getElementById("icon-snd-off");
  btn.classList.toggle("muted", isMuted);
  if (iconOn) iconOn.style.display = isMuted ? "none" : "block";
  if (iconOff) iconOff.style.display = isMuted ? "block" : "none";
}

window.addEventListener("DOMContentLoaded", function () {
  initCanvas();
  initCursor();
  window.addEventListener("resize", resizeCanvas);

  var fc = document.getElementById("fruitcontainer");
  var startBtn = document.getElementById("startReset");
  var soundBtn = document.getElementById("btn-sound");

  
  document.getElementById("front").style.display = "flex";

  
  soundBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    initAudio();
    toggleSound();
  });

  
  startBtn.addEventListener("click", function () {
    initAudio();
    startBtn.classList.add("hidden");
    document.getElementById("front").style.display = "none";
    document.getElementById("score-overlay").style.display = "block";
    playing = true;
    score = 0;
    trialsleft = 3;
    document.getElementById("scoreValue").textContent = "0";
    renderLives();
    startAction();
  });

  
  fc.addEventListener("mousedown", function (e) {
    if (!playing) return;
    initAudio();
    isSlicing = true;
    if (bladeCursor) bladeCursor.classList.add("slicing");
    var rect = fc.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
    e.preventDefault();
  });

  document.addEventListener("mouseup", function () {
    isSlicing = false;
    if (bladeCursor) bladeCursor.classList.remove("slicing");
  });

  fc.addEventListener("mousemove", function (e) {
    var rect = fc.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;

    moveCursor(x, y);
    addTrailPoint(x, y);

    if (isSlicing && playing) {
      checkSliceCollision(lastX, lastY, x, y);
    }

    lastX = x;
    lastY = y;
  });

  
  fc.addEventListener("touchstart", function (e) {
    e.preventDefault();
    if (!playing) return;
    initAudio();
    var t = e.touches[0];
    var rect = fc.getBoundingClientRect();
    isSlicing = true;
    lastX = t.clientX - rect.left;
    lastY = t.clientY - rect.top;
    addTrailPoint(lastX, lastY);
  }, { passive: false });

  fc.addEventListener("touchmove", function (e) {
    e.preventDefault();
    if (!playing) return;
    var t = e.touches[0];
    var rect = fc.getBoundingClientRect();
    var x = t.clientX - rect.left;
    var y = t.clientY - rect.top;

    addTrailPoint(x, y);

    if (isSlicing) {
      checkSliceCollision(lastX, lastY, x, y);
    }

    lastX = x;
    lastY = y;
  }, { passive: false });

  fc.addEventListener("touchend", function () {
    isSlicing = false;
  });
});
