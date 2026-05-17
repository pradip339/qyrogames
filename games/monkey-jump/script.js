function createClouds() {
    const clouds = document.getElementById('clouds');
    const cloudCount = 8;

    for (let i = 0; i < cloudCount; i++) {
        const cloud = document.createElement('div');
        cloud.classList.add('cloud');

        const size = Math.random() * 60 + 40;
        cloud.style.width = `${size}px`;
        cloud.style.height = `${size * 0.6}px`;

        cloud.style.top = `${Math.random() * 40}%`;
        cloud.style.animationDuration = `${Math.random() * 20 + 15}s`;
        cloud.style.animationDelay = `${Math.random() * 20}s`;

        
        const before = document.createElement('div');
        before.style.position = 'absolute';
        before.style.background = 'white';
        before.style.borderRadius = '50px';
        before.style.width = `${size * 0.5}px`;
        before.style.height = `${size * 0.5}px`;
        before.style.top = `-${size * 0.25}px`;
        before.style.left = `${size * 0.1}px`;
        cloud.appendChild(before);

        clouds.appendChild(cloud);
    }
}

createClouds();

function createParticles(x, y, color, count, type = 'default') {
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        let content = '';
        let size = Math.random() * 5 + 3;

        if (type === 'banana') {
            content = ' 🍌 ';
            size = 15;
            particle.style.fontSize = '15px';
        } else if (type === 'leaf') {
            content = ' 🍃 ';
            size = 12;
            particle.style.fontSize = '12px';
        } else if (type === 'star') {
            content = ' ⭐ ';
            size = 10;
            particle.style.fontSize = '10px';
        } else {
            particle.style.backgroundColor = color || `hsl(${Math.random() * 60 + 60}, 100%, 70%)`;
        }

        particle.innerHTML = content;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;

        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 3;
        const dx = Math.cos(angle) * speed;
        const dy = Math.sin(angle) * speed;

        document.body.appendChild(particle);

        let opacity = 1;
        let posX = x;
        let posY = y;

        const animateParticle = () => {
            opacity -= 0.02;
            posX += dx;
            posY += dy + Math.sin(posX * 0.01) * 0.5; 

            particle.style.opacity = opacity;
            particle.style.left = `${posX}px`;
            particle.style.top = `${posY}px`;

            if (opacity > 0) {
                requestAnimationFrame(animateParticle);
            } else {
                document.body.removeChild(particle);
            }
        };

        requestAnimationFrame(animateParticle);
    }
}

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame || window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

var canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d');

var containerElement = document.querySelector('.container');
var width = containerElement.clientWidth || window.innerWidth,
    height = containerElement.clientHeight || window.innerHeight;

if (width === 0) width = window.innerWidth;
if (height === 0) height = window.innerHeight;

canvas.width = width;
canvas.height = height;

function resizeCanvas() {
    width = containerElement.clientWidth || window.innerWidth;
    height = containerElement.clientHeight || window.innerHeight;
    if (width === 0) width = window.innerWidth;
    if (height === 0) height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    if (base) {
        base.width = width;
        base.y = height - base.height;
    }
}

window.addEventListener('resize', resizeCanvas);

setTimeout(resizeCanvas, 50);
setTimeout(resizeCanvas, 300);

var btnLeft = document.getElementById('btn-left');
var btnRight = document.getElementById('btn-right');

function moveLeft() {
    dir = "left";
    if (player) {
        player.isMovingLeft = true;
        player.isMovingRight = false;
    }
}

function moveRight() {
    dir = "right";
    if (player) {
        player.isMovingRight = true;
        player.isMovingLeft = false;
    }
}

function stopMove() {
    if (player) {
        player.isMovingLeft = false;
        player.isMovingRight = false;
    }
}

if (btnLeft && btnRight) {
    btnLeft.addEventListener('touchstart', function (e) { e.preventDefault(); moveLeft(); }, { passive: false });
    btnLeft.addEventListener('touchend', function (e) { e.preventDefault(); stopMove(); }, { passive: false });
    btnLeft.addEventListener('mousedown', function (e) { e.preventDefault(); moveLeft(); });
    btnLeft.addEventListener('mouseup', stopMove);
    btnLeft.addEventListener('mouseleave', stopMove);

    btnRight.addEventListener('touchstart', function (e) { e.preventDefault(); moveRight(); }, { passive: false });
    btnRight.addEventListener('touchend', function (e) { e.preventDefault(); stopMove(); }, { passive: false });
    btnRight.addEventListener('mousedown', function (e) { e.preventDefault(); moveRight(); });
    btnRight.addEventListener('mouseup', stopMove);
    btnRight.addEventListener('mouseleave', stopMove);
}

var platforms = [],
    player, platformCount = 10,
    position = 0,
    gravity = 0.25,
    animloop,
    flag = 0,
    menuloop, broken = 0,
    dir = "left", score = 0, firstRun = true;

setTimeout(() => {
    const preloader = document.getElementById('preloader');
    preloader.style.opacity = '0';

    setTimeout(() => {
        preloader.style.display = 'none';
    }, 500);
}, 1500);

function drawMonkey(x, y, w, h, direction, state) {
    ctx.save();

    
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + w * 0.2, y + h * 0.4, w * 0.6, h * 0.5);

    
    ctx.fillStyle = '#CD853F';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h * 0.3, w * 0.3, 0, Math.PI * 2);
    ctx.fill();

    
    ctx.fillStyle = '#F5DEB3';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h * 0.35, w * 0.2, 0, Math.PI * 2);
    ctx.fill();

    
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x + w * 0.4, y + h * 0.25, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + w * 0.6, y + h * 0.25, 2, 0, Math.PI * 2);
    ctx.fill();

    
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h * 0.4, 3, 0, Math.PI);
    ctx.stroke();

    
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(x + (direction === 'left' ? w * 0.1 : w * 0.7), y + h * 0.5, w * 0.2, h * 0.3);
    ctx.fillRect(x + (direction === 'right' ? w * 0.1 : w * 0.7), y + h * 0.5, w * 0.2, h * 0.3);

    
    ctx.fillRect(x + w * 0.25, y + h * 0.8, w * 0.2, h * 0.2);
    ctx.fillRect(x + w * 0.55, y + h * 0.8, w * 0.2, h * 0.2);

    
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x + w * 0.8, y + h * 0.6, 15, 0, Math.PI * 1.5);
    ctx.stroke();

    ctx.restore();
}

function drawPlatform(x, y, w, h, type) {
    ctx.save();

    if (type === 1) {
        
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x, y, w, h);

        
        ctx.fillStyle = '#228B22';
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(x + (i * w / 3) + 10, y - 5, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (type === 2) {
        
        ctx.fillStyle = '#654321';
        ctx.fillRect(x, y, w, h);

        ctx.fillStyle = '#32CD32';
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.arc(x + (i * w / 4) + 8, y - 3, 6, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (type === 3) {
        
        ctx.fillStyle = '#A0522D';
        ctx.fillRect(x, y, w, h);

        
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + w * 0.3, y);
        ctx.lineTo(x + w * 0.3, y + h);
        ctx.stroke();
    } else if (type === 4) {
        
        ctx.fillStyle = '#90EE90';
        ctx.fillRect(x, y, w, h);

        ctx.fillStyle = '#FFD700';
        for (let i = 0; i < 2; i++) {
            ctx.beginPath();
            ctx.arc(x + (i * w / 2) + w / 4, y - 5, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    ctx.restore();
}

function drawBanana(x, y, w, h, state) {
    ctx.save();
    ctx.fillStyle = state === 0 ? '#FFD700' : '#FFA500';

    
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2);
    ctx.fill();

    
    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 5, y + h / 3);
    ctx.lineTo(x + w - 5, y + h / 3);
    ctx.moveTo(x + 5, y + 2 * h / 3);
    ctx.lineTo(x + w - 5, y + 2 * h / 3);
    ctx.stroke();

    ctx.restore();
}

var Base = function () {
    this.height = 8;
    this.width = width;
    this.moved = 0;
    this.x = 0;
    this.y = height - this.height;

    this.draw = function () {
        ctx.fillStyle = '#228B22';
        ctx.fillRect(this.x, this.y, this.width, this.height);

        
        ctx.fillStyle = '#32CD32';
        for (let i = 0; i < this.width; i += 10) {
            ctx.fillRect(i, this.y - 2, 2, 4);
        }
    };
};

var base = new Base();

var Player = function () {
    this.vy = 11;
    this.vx = 0;
    this.isMovingLeft = false;
    this.isMovingRight = false;
    this.isDead = false;
    this.width = 55;
    this.height = 40;
    this.dir = "left";
    this.x = width / 2 - this.width / 2;
    this.y = height;

    this.draw = function () {
        drawMonkey(this.x, this.y, this.width, this.height, this.dir, 'normal');
    };

    this.jump = function () {
        this.vy = -8;
        createParticles(this.x + this.width / 2, this.y + this.height, "#32CD32", 8, 'leaf');
    };

    this.jumpHigh = function () {
        this.vy = -16;
        createParticles(this.x + this.width / 2, this.y + this.height, "#FFD700", 12, 'banana');
    };
};

player = new Player();

function Platform() {
    this.width = 70;
    this.height = 17;
    this.x = Math.random() * (width - this.width);
    this.y = position;
    position += (height / platformCount);
    this.flag = 0;
    this.state = 0;

    
    if (score >= 5000) this.types = [2, 3, 3, 3, 4, 4, 4, 4];
    else if (score >= 2000 && score < 5000) this.types = [2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4];
    else if (score >= 1000 && score < 2000) this.types = [2, 2, 2, 3, 3, 3, 3, 3];
    else if (score >= 500 && score < 1000) this.types = [1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3];
    else if (score >= 100 && score < 500) this.types = [1, 1, 1, 1, 2, 2];
    else this.types = [1];

    this.type = this.types[Math.floor(Math.random() * this.types.length)];

    if (this.type == 3 && broken < 1) {
        broken++;
    } else if (this.type == 3 && broken >= 1) {
        this.type = 1;
        broken = 0;
    }

    this.moved = 0;
    this.vx = 1;

    this.draw = function () {
        if (this.flag === 1 && this.type === 3) return;
        if (this.state === 1 && this.type === 4) return;

        drawPlatform(this.x, this.y, this.width, this.height, this.type);
    };
}

for (var i = 0; i < platformCount; i++) {
    platforms.push(new Platform());
}

var Platform_broken_substitute = function () {
    this.height = 30;
    this.width = 70;
    this.x = 0;
    this.y = 0;
    this.appearance = false;

    this.draw = function () {
        if (this.appearance === true) {
            ctx.save();
            ctx.fillStyle = '#8B4513';
            ctx.globalAlpha = 0.7;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.restore();
        }
    };
};

var platform_broken_substitute = new Platform_broken_substitute();

var Spring = function () {
    this.x = 0;
    this.y = 0;
    this.width = 26;
    this.height = 30;
    this.state = 0;

    this.draw = function () {
        drawBanana(this.x, this.y, this.width, this.height, this.state);
    };
};

var spring = new Spring();

function init() {
    var jumpCount = 0;
    firstRun = false;

    function paintCanvas() {
        
        
        var gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#1f4037'); 
        gradient.addColorStop(0.6, '#4da481'); 
        gradient.addColorStop(1, '#99f2c8'); 
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    function playerCalc() {
        if (dir == "left") {
            player.dir = "left";
        } else if (dir == "right") {
            player.dir = "right";
        }

        
        document.onkeydown = function (e) {
            var key = e.keyCode;

            if (key == 37) {
                dir = "left";
                player.isMovingLeft = true;
            } else if (key == 39) {
                dir = "right";
                player.isMovingRight = true;
            }

            if (key == 32) {
                if (firstRun === true) init();
                else reset();
            }
        };

        document.onkeyup = function (e) {
            var key = e.keyCode;

            if (key == 37) {
                dir = "left";
                player.isMovingLeft = false;
            } else if (key == 39) {
                dir = "right";
                player.isMovingRight = false;
            }
        };

        
        if (player.isMovingLeft === true) {
            player.x += player.vx;
            player.vx -= 0.15;
        } else {
            player.x += player.vx;
            if (player.vx < 0) player.vx += 0.1;
        }

        if (player.isMovingRight === true) {
            player.x += player.vx;
            player.vx += 0.15;
        } else {
            player.x += player.vx;
            if (player.vx > 0) player.vx -= 0.1;
        }

        
        if ((player.y + player.height) > base.y && base.y < height) player.jump();

        
        if (base.y > height && (player.y + player.height) > height && player.isDead != "lol") {
            player.isDead = true;
        }

        
        if (player.x > width) player.x = 0 - player.width;
        else if (player.x < 0 - player.width) player.x = width;

        
        if (player.y >= (height / 2) - (player.height / 2)) {
            player.y += player.vy;
            player.vy += gravity;
        } else {
            platforms.forEach(function (p, i) {
                if (player.vy < 0) {
                    p.y -= player.vy;
                }

                if (p.y > height) {
                    platforms[i] = new Platform();
                    platforms[i].y = p.y - height;
                }
            });

            base.y -= player.vy;
            player.vy += gravity;

            if (player.vy >= 0) {
                player.y += player.vy;
                player.vy += gravity;
            }

            score++;
        }

        collides();
        if (player.isDead === true) gameOver();
    }

    function springCalc() {
        var s = spring;
        var p = platforms[0];

        if (p.type == 1 || p.type == 2) {
            s.x = p.x + p.width / 2 - s.width / 2;
            s.y = p.y - p.height - 10;

            if (s.y > height / 1.1) s.state = 0;
            s.draw();
        } else {
            s.x = 0 - s.width;
            s.y = 0 - s.height;
        }
    }

    function platformCalc() {
        var subs = platform_broken_substitute;

        platforms.forEach(function (p, i) {
            if (p.type == 2) {
                if (p.x < 0 || p.x + p.width > width) p.vx *= -1;
                p.x += p.vx;
            }

            if (p.flag == 1 && subs.appearance === false && jumpCount === 0) {
                subs.x = p.x;
                subs.y = p.y;
                subs.appearance = true;
                jumpCount++;
            }

            p.draw();
        });

        if (subs.appearance === true) {
            subs.draw();
            subs.y += 8;
        }

        if (subs.y > height) subs.appearance = false;
    }

    function collides() {
        
        platforms.forEach(function (p, i) {
            if (player.vy > 0 && p.state === 0 &&
                (player.x + 15 < p.x + p.width) &&
                (player.x + player.width - 15 > p.x) &&
                (player.y + player.height > p.y) &&
                (player.y + player.height < p.y + p.height)) {

                if (p.type == 3 && p.flag === 0) {
                    p.flag = 1;
                    jumpCount = 0;
                    createParticles(p.x + p.width / 2, p.y + p.height / 2, "#8B4513", 15, 'leaf');
                    return;
                } else if (p.type == 4 && p.state === 0) {
                    player.jump();
                    p.state = 1;
                    createParticles(p.x + p.width / 2, p.y + p.height / 2, "#90EE90", 12, 'star');
                } else if (p.flag == 1) {
                    return;
                } else {
                    player.jump();
                    createParticles(p.x + p.width / 2, p.y, "#32CD32", 8, 'leaf');
                }
            }
        });

        
        var s = spring;
        if (player.vy > 0 && (s.state === 0) &&
            (player.x + 15 < s.x + s.width) &&
            (player.x + player.width - 15 > s.x) &&
            (player.y + player.height > s.y) &&
            (player.y + player.height < s.y + s.height)) {
            s.state = 1;
            player.jumpHigh();
            createParticles(s.x + s.width / 2, s.y + s.height / 2, "#FFD700", 20, 'banana');
        }
    }

    function updateScore() {
        var scoreText = document.getElementById("score");
        scoreText.innerHTML = score;

        
        if (score % 100 === 0 && score > 0) {
            const scoreBoard = document.getElementById("scoreBoard");
            scoreBoard.classList.add("pulse");
            setTimeout(() => {
                scoreBoard.classList.remove("pulse");
            }, 500);
            createParticles(width / 2, 30, "#FFD700", 15, 'banana');
        }
    }

    function gameOver() {
        platforms.forEach(function (p, i) {
            p.y -= 12;
        });

        if (player.y > height / 2 && flag === 0) {
            player.y -= 8;
            player.vy = 0;
        } else if (player.y < height / 2) {
            flag = 1;
        } else if (player.y + player.height > height) {
            showGoMenu();
            hideScore();
            player.isDead = "lol";
        }
    }

    function update() {
        paintCanvas();
        platformCalc();
        springCalc();
        playerCalc();
        player.draw();
        base.draw();
        updateScore();
    }

    menuLoop = function () { return; };
    animloop = function () {
        update();
        requestAnimFrame(animloop);
    };

    animloop();
    hideMenu();
    showScore();
}

function reset() {
    hideGoMenu();
    showScore();
    player.isDead = false;
    flag = 0;
    position = 0;
    score = 0;

    base = new Base();
    player = new Player();
    spring = new Spring();
    platform_broken_substitute = new Platform_broken_substitute();

    platforms = [];
    for (var i = 0; i < platformCount; i++) {
        platforms.push(new Platform());
    }

    createParticles(width / 2, height / 2, "#32CD32", 30, 'leaf');
    init();
}

function hideMenu() {
    var menu = document.getElementById("mainMenu");
    menu.style.opacity = "0";
    setTimeout(() => {
        menu.style.zIndex = -1;
    }, 500);

    var mc = document.querySelector('.mobile-controls');
    if (mc) mc.classList.add('active');
}

function showGoMenu() {
    var menu = document.getElementById("gameOverMenu");
    menu.classList.add("visible");
    menu.style.zIndex = 3;

    var mc = document.querySelector('.mobile-controls');
    if (mc) mc.classList.remove('active');

    var scoreText = document.getElementById("go_score");
    scoreText.innerHTML = "You collected " + score + " bananas!";

    createParticles(width / 2, height / 2, "#8B4513", 40, 'leaf');
}

function hideGoMenu() {
    var menu = document.getElementById("gameOverMenu");
    menu.classList.remove("visible");
    setTimeout(() => {
        menu.style.zIndex = -1;
    }, 500);
}

function showScore() {
    var menu = document.getElementById("scoreBoard");
    menu.style.zIndex = 1;
}

function hideScore() {
    var menu = document.getElementById("scoreBoard");
    menu.style.zIndex = -1;
}

function playerJump() {
    player.y += player.vy;
    player.vy += gravity;

    if (player.vy > 0 &&
        (player.x + 15 < 260) &&
        (player.x + player.width - 15 > 155) &&
        (player.y + player.height > 475) &&
        (player.y + player.height < 500))
        player.jump();

    if (dir == "left") {
        player.dir = "left";
    } else if (dir == "right") {
        player.dir = "right";
    }

    
    document.onkeydown = function (e) {
        var key = e.keyCode;

        if (key == 37) {
            dir = "left";
            player.isMovingLeft = true;
        } else if (key == 39) {
            dir = "right";
            player.isMovingRight = true;
        }

        if (key == 32) {
            if (firstRun === true) {
                init();
                firstRun = false;
            } else {
                reset();
            }
        }
    };

    document.onkeyup = function (e) {
        var key = e.keyCode;

        if (key == 37) {
            dir = "left";
            player.isMovingLeft = false;
        } else if (key == 39) {
            dir = "right";
            player.isMovingRight = false;
        }
    };

    if (player.isMovingLeft === true) {
        player.x += player.vx;
        player.vx -= 0.15;
    } else {
        player.x += player.vx;
        if (player.vx < 0) player.vx += 0.1;
    }

    if (player.isMovingRight === true) {
        player.x += player.vx;
        player.vx += 0.15;
    } else {
        player.x += player.vx;
        if (player.vx > 0) player.vx -= 0.1;
    }

    if ((player.y + player.height) > base.y && base.y < height) player.jump();

    if (player.x > width) player.x = 0 - player.width;
    else if (player.x < 0 - player.width) player.x = width;

    player.draw();
}

function menuUpdate() {
    
    
    var gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1f4037');
    gradient.addColorStop(0.6, '#4da481');
    gradient.addColorStop(1, '#99f2c8');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    playerJump();
}

menuLoop = function () {
    menuUpdate();
    requestAnimFrame(menuLoop);
};

menuLoop();
