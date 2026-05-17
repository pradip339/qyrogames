console.clear();
var Stage =  (function () {
  function Stage() {
    
    var _this = this;
    this.render = function () {
      this.renderer.render(this.scene, this.camera);
    };
    this.add = function (elem) {
      this.scene.add(elem);
    };
    this.remove = function (elem) {
      this.scene.remove(elem);
    };
    this.container = document.getElementById("game");
    
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setClearColor(0x000000, 0);
    this.container.appendChild(this.renderer.domElement);
    
    this.scene = new THREE.Scene();
    
    var aspect = this.container.clientWidth / this.container.clientHeight;
    var d = 20;
    this.camera = new THREE.OrthographicCamera(
      -d * aspect,
      d * aspect,
      d,
      -d,
      -100,
      1000
    );
    this.camera.position.x = 2;
    this.camera.position.y = 2;
    this.camera.position.z = 2;
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    
    this.light = new THREE.DirectionalLight(0xffffff, 0.5);
    this.light.position.set(0, 499, 0);
    this.scene.add(this.light);
    this.softLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(this.softLight);
    window.addEventListener("resize", function () {
      return _this.onResize();
    });
    this.onResize();
  }
  Stage.prototype.setCamera = function (y, speed) {
    if (speed === void 0) {
      speed = 0.3;
    }
    TweenLite.to(this.camera.position, speed, {
      y: y + 4,
      ease: Power1.easeInOut,
    });
    TweenLite.to(this.camera.lookAt, speed, { y: y, ease: Power1.easeInOut });
  };
  Stage.prototype.onResize = function () {
    var viewSize = 30;
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.camera.left = this.container.clientWidth / -viewSize;
    this.camera.right = this.container.clientWidth / viewSize;
    this.camera.top = this.container.clientHeight / viewSize;
    this.camera.bottom = this.container.clientHeight / -viewSize;
    this.camera.updateProjectionMatrix();
  };
  return Stage;
})();
var Block =  (function () {
  function Block(block) {
    
    this.STATES = { ACTIVE: "active", STOPPED: "stopped", MISSED: "missed" };
    this.MOVE_AMOUNT = 12;
    this.dimension = { width: 0, height: 0, depth: 0 };
    this.position = { x: 0, y: 0, z: 0 };
    this.targetBlock = block;
    this.index = (this.targetBlock ? this.targetBlock.index : 0) + 1;
    this.workingPlane = this.index % 2 ? "x" : "z";
    this.workingDimension = this.index % 2 ? "width" : "depth";
    
    this.dimension.width = this.targetBlock
      ? this.targetBlock.dimension.width
      : 10;
    this.dimension.height = this.targetBlock
      ? this.targetBlock.dimension.height
      : 2;
    this.dimension.depth = this.targetBlock
      ? this.targetBlock.dimension.depth
      : 10;
    this.position.x = this.targetBlock ? this.targetBlock.position.x : 0;
    this.position.y = this.dimension.height * this.index;
    this.position.z = this.targetBlock ? this.targetBlock.position.z : 0;
    this.colorOffset = this.targetBlock
      ? this.targetBlock.colorOffset
      : Math.round(Math.random() * 100);
    
    if (!this.targetBlock) {
      this.color = 0x333344;
    } else {
      var offset = this.index + this.colorOffset;
      var r = Math.sin(0.3 * offset) * 55 + 200;
      var g = Math.sin(0.3 * offset + 2) * 55 + 200;
      var b = Math.sin(0.3 * offset + 4) * 55 + 200;
      this.color = new THREE.Color(r / 255, g / 255, b / 255);
    }
    
    this.state = this.index > 1 ? this.STATES.ACTIVE : this.STATES.STOPPED;
    
    this.speed = -0.13 - this.index * 0.008;
    if (this.speed < -4) this.speed = -4;
    this.direction = this.speed;
    
    var geometry = new THREE.BoxGeometry(
      this.dimension.width,
      this.dimension.height,
      this.dimension.depth
    );
    geometry.applyMatrix(
      new THREE.Matrix4().makeTranslation(
        this.dimension.width / 2,
        this.dimension.height / 2,
        this.dimension.depth / 2
      )
    );
    this.material = new THREE.MeshToonMaterial({
      color: this.color,
      shading: THREE.FlatShading,
    });
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.position.set(
      this.position.x,
      this.position.y + (this.state == this.STATES.ACTIVE ? 0 : 0),
      this.position.z
    );
    if (this.state == this.STATES.ACTIVE) {
      this.position[this.workingPlane] =
        Math.random() > 0.5 ? -this.MOVE_AMOUNT : this.MOVE_AMOUNT;
    }
  }
  Block.prototype.reverseDirection = function () {
    this.direction = this.direction > 0 ? this.speed : Math.abs(this.speed);
  };
  Block.prototype.place = function () {
    this.state = this.STATES.STOPPED;
    var overlap =
      this.targetBlock.dimension[this.workingDimension] -
      Math.abs(
        this.position[this.workingPlane] -
        this.targetBlock.position[this.workingPlane]
      );
    var blocksToReturn = {
      plane: this.workingPlane,
      direction: this.direction,
    };
    if (this.dimension[this.workingDimension] - overlap < 0.3) {
      overlap = this.dimension[this.workingDimension];
      blocksToReturn.bonus = true;
      this.position.x = this.targetBlock.position.x;
      this.position.z = this.targetBlock.position.z;
      this.dimension.width = this.targetBlock.dimension.width;
      this.dimension.depth = this.targetBlock.dimension.depth;
    }
    if (overlap > 0) {
      var choppedDimensions = {
        width: this.dimension.width,
        height: this.dimension.height,
        depth: this.dimension.depth,
      };
      choppedDimensions[this.workingDimension] -= overlap;
      this.dimension[this.workingDimension] = overlap;
      var placedGeometry = new THREE.BoxGeometry(
        this.dimension.width,
        this.dimension.height,
        this.dimension.depth
      );
      placedGeometry.applyMatrix(
        new THREE.Matrix4().makeTranslation(
          this.dimension.width / 2,
          this.dimension.height / 2,
          this.dimension.depth / 2
        )
      );
      var placedMesh = new THREE.Mesh(placedGeometry, this.material);
      var choppedGeometry = new THREE.BoxGeometry(
        choppedDimensions.width,
        choppedDimensions.height,
        choppedDimensions.depth
      );
      choppedGeometry.applyMatrix(
        new THREE.Matrix4().makeTranslation(
          choppedDimensions.width / 2,
          choppedDimensions.height / 2,
          choppedDimensions.depth / 2
        )
      );
      var choppedMesh = new THREE.Mesh(choppedGeometry, this.material);
      var choppedPosition = {
        x: this.position.x,
        y: this.position.y,
        z: this.position.z,
      };
      if (
        this.position[this.workingPlane] <
        this.targetBlock.position[this.workingPlane]
      ) {
        this.position[this.workingPlane] = this.targetBlock.position[
          this.workingPlane
        ];
      } else {
        choppedPosition[this.workingPlane] += overlap;
      }
      placedMesh.position.set(
        this.position.x,
        this.position.y,
        this.position.z
      );
      choppedMesh.position.set(
        choppedPosition.x,
        choppedPosition.y,
        choppedPosition.z
      );
      blocksToReturn.placed = placedMesh;
      if (!blocksToReturn.bonus) blocksToReturn.chopped = choppedMesh;
    } else {
      this.state = this.STATES.MISSED;
    }
    this.dimension[this.workingDimension] = overlap;
    return blocksToReturn;
  };
  Block.prototype.tick = function () {
    if (this.state == this.STATES.ACTIVE) {
      var value = this.position[this.workingPlane];
      if (value > this.MOVE_AMOUNT || value < -this.MOVE_AMOUNT)
        this.reverseDirection();
      this.position[this.workingPlane] += this.direction;
      this.mesh.position[this.workingPlane] = this.position[this.workingPlane];
    }
  };
  return Block;
})();
var Game =  (function () {
  function Game() {
    var _this = this;
    this.STATES = {
      LOADING: "loading",
      PLAYING: "playing",
      READY: "ready",
      ENDED: "ended",
      RESETTING: "resetting",
    };
    this.blocks = [];
    this.state = this.STATES.LOADING;
    this.stage = new Stage();
    
    this.audioCtx = null;
    this._initAudioContext();
    this.isMuted = false;
    this.isPaused = false;

    this.mainContainer = document.getElementById("container");
    this.scoreContainer = document.getElementById("score");
    this.startButton = document.getElementById("start-button");
    this.instructions = document.getElementById("instructions");
    this.scoreContainer.innerHTML = "0";
    this.newBlocks = new THREE.Group();
    this.placedBlocks = new THREE.Group();
    this.choppedBlocks = new THREE.Group();
    this.stage.add(this.newBlocks);
    this.stage.add(this.placedBlocks);
    this.stage.add(this.choppedBlocks);
    this.addBlock();
    this.tick();
    this.updateState(this.STATES.READY);

    
    document.getElementById("btn-sound").addEventListener("click", (e) => {
      e.stopPropagation();
      _this.toggleSound();
    });
    document.getElementById("btn-pause").addEventListener("click", (e) => {
      e.stopPropagation();
      _this.togglePause();
    });
    document.getElementById("btn-resume").addEventListener("click", (e) => {
      e.stopPropagation();
      _this.togglePause();
    });

    document.addEventListener("keydown", function (e) {
      if (e.keyCode == 32) _this.onAction();
    });

    
    document.getElementById("start-button").addEventListener("click", (e) => {
      e.stopPropagation();
      _this.onAction();
    });

    
    document.querySelector(".action-text").addEventListener("click", (e) => {
      e.stopPropagation();
      _this.onAction();
    });

    
    document.getElementById("game").addEventListener("click", (e) => {
      if (_this.state === _this.STATES.PLAYING) {
        _this.onAction();
      }
    });

    document.getElementById("game").addEventListener("touchstart", (e) => {
      e.preventDefault();
      if (_this.state === _this.STATES.PLAYING) {
        _this.onAction();
      }
    });
  }

  
  Game.prototype._initAudioContext = function () {
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      this.audioCtx = null;
    }
  };

  
  Game.prototype._masterGain = function () {
    var g = this.audioCtx.createGain();
    g.gain.value = 0.55;
    g.connect(this.audioCtx.destination);
    return g;
  };

  
  Game.prototype._soundPlace = function () {
    var ctx = this.audioCtx;
    var score = this.blocks.length;
    var master = this._masterGain();

    
    var osc = ctx.createOscillator();
    var oscGain = ctx.createGain();
    var baseFreq = 80 + score * 4; 
    osc.type = "sine";
    osc.frequency.setValueAtTime(baseFreq * 2.5, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq, ctx.currentTime + 0.08);
    oscGain.gain.setValueAtTime(0.7, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    osc.connect(oscGain);
    oscGain.connect(master);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.22);

    
    var bufSize = ctx.sampleRate * 0.04;
    var noiseBuffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    var data = noiseBuffer.getChannelData(0);
    for (var i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    var noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    var noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 1200;
    noiseFilter.Q.value = 0.5;
    var noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);
    noise.start(ctx.currentTime);
    noise.stop(ctx.currentTime + 0.04);
  };

  
  Game.prototype._soundBonus = function () {
    var ctx = this.audioCtx;
    var master = this._masterGain();
    var notes = [523.25, 659.25, 783.99]; 
    notes.forEach(function (freq, i) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      var t = ctx.currentTime + i * 0.1;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.5, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc.connect(gain);
      gain.connect(master);
      osc.start(t);
      osc.stop(t + 0.5);
    });
  };

  
  Game.prototype._soundLevelUp = function () {
    var ctx = this.audioCtx;
    var master = this._masterGain();
    var notes = [440, 554.37, 659.25, 880]; 
    notes.forEach(function (freq, i) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      var t = ctx.currentTime + i * 0.08;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.38, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(gain);
      gain.connect(master);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  };

  
  Game.prototype._soundMiss = function () {
    var ctx = this.audioCtx;
    var master = this._masterGain();
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.45, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(master);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  };

  
  Game.prototype._soundGameOver = function () {
    var ctx = this.audioCtx;
    var master = this._masterGain();

    
    var osc1 = ctx.createOscillator();
    var gain1 = ctx.createGain();
    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(220, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.8);
    gain1.gain.setValueAtTime(0.5, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
    osc1.connect(gain1);
    gain1.connect(master);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.9);

    
    var bufSize = ctx.sampleRate * 0.5;
    var noiseBuffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    var data = noiseBuffer.getChannelData(0);
    for (var i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.15));
    var noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    var noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.value = 400;
    var noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6, ctx.currentTime + 0.05);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);
    noise.start(ctx.currentTime + 0.05);
    noise.stop(ctx.currentTime + 0.6);

    
    var sadNotes = [330, 277.18, 220, 185]; 
    sadNotes.forEach(function (freq, i) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      var t = ctx.currentTime + 0.2 + i * 0.13;
      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      osc.connect(gain);
      gain.connect(master);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  };

  
  Game.prototype.playSound = function (type, extra) {
    if (this.isMuted) return;
    
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    if (!this.audioCtx) return;
    if (type === "place") {
      this._soundPlace();
      
      if (this.blocks.length > 1 && (this.blocks.length - 1) % 5 === 0) {
        setTimeout(() => this._soundLevelUp(), 200);
      }
    } else if (type === "bonus") {
      this._soundBonus();
    } else if (type === "miss") {
      this._soundMiss();
    } else if (type === "fail") {
      this._soundGameOver();
    }
  };

  Game.prototype.toggleSound = function () {
    this.isMuted = !this.isMuted;
    var btn = document.getElementById("btn-sound");
    var iconOn = document.getElementById("icon-sound-on");
    var iconOff = document.getElementById("icon-sound-off");

    if (this.isMuted) {
      
      btn.classList.add("muted");
      if (iconOn) iconOn.style.display = "none";
      if (iconOff) iconOff.style.display = "block";
    } else {
      
      btn.classList.remove("muted");
      if (iconOn) iconOn.style.display = "block";
      if (iconOff) iconOff.style.display = "none";
    }
  };

  Game.prototype.togglePause = function () {
    if (this.state !== this.STATES.PLAYING) return;
    this.isPaused = !this.isPaused;
    const overlay = document.querySelector(".pause-overlay");
    const btn = document.getElementById("btn-pause");

    if (this.isPaused) {
      overlay.classList.add("visible");
      btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>'; 
    } else {
      overlay.classList.remove("visible");
      btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'; 
    }
  };

  Game.prototype.updateState = function (newState) {
    for (var key in this.STATES)
      this.mainContainer.classList.remove(this.STATES[key]);
    this.mainContainer.classList.add(newState);
    this.state = newState;
  };
  Game.prototype.onAction = function () {
    if (this.isPaused) return;
    switch (this.state) {
      case this.STATES.READY:
        this.startGame();
        break;
      case this.STATES.PLAYING:
        this.placeBlock();
        break;
      case this.STATES.ENDED:
        this.restartGame();
        break;
    }
  };
  Game.prototype.startGame = function () {
    if (this.state != this.STATES.PLAYING) {
      this.scoreContainer.innerHTML = "0";
      this.updateState(this.STATES.PLAYING);
      this.addBlock();
    }
  };
  Game.prototype.restartGame = function () {
    var _this = this;
    this.updateState(this.STATES.RESETTING);
    var oldBlocks = this.placedBlocks.children;
    var removeSpeed = 0.2;
    var delayAmount = 0.02;
    var _loop_1 = function (i) {
      TweenLite.to(oldBlocks[i].scale, removeSpeed, {
        x: 0,
        y: 0,
        z: 0,
        delay: (oldBlocks.length - i) * delayAmount,
        ease: Power1.easeIn,
        onComplete: function () {
          return _this.placedBlocks.remove(oldBlocks[i]);
        },
      });
      TweenLite.to(oldBlocks[i].rotation, removeSpeed, {
        y: 0.5,
        delay: (oldBlocks.length - i) * delayAmount,
        ease: Power1.easeIn,
      });
    };
    for (var i = 0; i < oldBlocks.length; i++) {
      _loop_1(i);
    }
    var cameraMoveSpeed = removeSpeed * 2 + oldBlocks.length * delayAmount;
    this.stage.setCamera(2, cameraMoveSpeed);
    var countdown = { value: this.blocks.length - 1 };
    TweenLite.to(countdown, cameraMoveSpeed, {
      value: 0,
      onUpdate: function () {
        _this.scoreContainer.innerHTML = String(Math.round(countdown.value));
      },
    });
    this.blocks = this.blocks.slice(0, 1);
    setTimeout(function () {
      _this.startGame();
    }, cameraMoveSpeed * 1000);
  };
  Game.prototype.placeBlock = function () {
    var _this = this;
    var currentBlock = this.blocks[this.blocks.length - 1];
    var newBlocks = currentBlock.place();
    this.newBlocks.remove(currentBlock.mesh);
    if (newBlocks.placed) this.placedBlocks.add(newBlocks.placed);
    if (newBlocks.bonus) {
      this.playSound("bonus"); 
    } else if (newBlocks.chopped) {
      this.playSound("place"); 
      this.choppedBlocks.add(newBlocks.chopped);
      var positionParams = {
        y: "-=30",
        ease: Power1.easeIn,
        onComplete: function () {
          return _this.choppedBlocks.remove(newBlocks.chopped);
        },
      };
      var rotateRandomness = 10;
      var rotationParams = {
        delay: 0.05,
        x:
          newBlocks.plane == "z"
            ? Math.random() * rotateRandomness - rotateRandomness / 2
            : 0.1,
        z:
          newBlocks.plane == "x"
            ? Math.random() * rotateRandomness - rotateRandomness / 2
            : 0.1,
        y: Math.random() * 0.1,
      };
      if (
        newBlocks.chopped.position[newBlocks.plane] >
        newBlocks.placed.position[newBlocks.plane]
      ) {
        positionParams[newBlocks.plane] =
          "+=" + 40 * Math.abs(newBlocks.direction);
      } else {
        positionParams[newBlocks.plane] =
          "-=" + 40 * Math.abs(newBlocks.direction);
      }
      TweenLite.to(newBlocks.chopped.position, 1, positionParams);
      TweenLite.to(newBlocks.chopped.rotation, 1, rotationParams);
    } else {
      this.playSound("miss"); 
    }

    this.addBlock();
  };
  Game.prototype.addBlock = function () {
    var lastBlock = this.blocks[this.blocks.length - 1];
    if (lastBlock && lastBlock.state == lastBlock.STATES.MISSED) {
      return this.endGame();
    }
    this.scoreContainer.innerHTML = String(this.blocks.length - 1);
    var newKidOnTheBlock = new Block(lastBlock);
    this.newBlocks.add(newKidOnTheBlock.mesh);
    this.blocks.push(newKidOnTheBlock);
    this.stage.setCamera(this.blocks.length * 2);
    if (this.blocks.length >= 5) this.instructions.classList.add("hide");
  };
  Game.prototype.endGame = function () {
    this.playSound("fail");
    this.updateState(this.STATES.ENDED);
  };
  Game.prototype.tick = function () {
    if (this.isPaused) {
      requestAnimationFrame(() => this.tick());
      return;
    }
    var _this = this;
    this.blocks[this.blocks.length - 1].tick();
    this.stage.render();
    requestAnimationFrame(function () {
      _this.tick();
    });
  };
  return Game;
})();
var game = new Game();
