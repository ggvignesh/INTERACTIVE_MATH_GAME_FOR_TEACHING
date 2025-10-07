// LCM Balloon Pop - Grades 4-7 friendly
(function () {
  "use strict";

  // --- DOM references
  const el = (id) => document.getElementById(id);
  const gameArea = el("gameArea");
  const levelEl = el("level");
  const scoreEl = el("score");
  const livesEl = el("lives");
  const timerEl = el("timer");
  const numAEl = el("numA");
  const numBEl = el("numB");
  const btnStart = el("btnStart");
  const btnPause = el("btnPause");
  const btnHow = el("btnHow");
  const btnSettings = el("btnSettings");
  const btnSaveScore = el("btnSaveScore");
  const overlay = el("overlay");
  const overlayContent = el("overlayContent");
  const btnCloseOverlay = el("btnCloseOverlay");

  const balloonTemplate = document.getElementById("tmpl-balloon");

  // --- Game state
  const state = {
    level: 1,
    score: 0,
    lives: 3,
    timeLeft: 60,
    isRunning: false,
    isPaused: false,
    spawnIntervalMs: 1400,
    fallDurationMs: 8000,
    numberA: 4,
    numberB: 6,
    maxNumberOnBalloon: 72,
    targetClicksPerLevel: 6,
    correctClicksThisLevel: 0,
    timers: [],
  };

  // --- Utility functions
  function lcm(a, b) {
    return (a * b) / gcd(a, b);
  }
  function gcd(a, b) {
    while (b !== 0) {
      const t = b; b = a % b; a = t;
    }
    return Math.abs(a);
  }
  function isCommonMultiple(n, a, b) {
    return n % a === 0 && n % b === 0;
  }
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function clamp(min, v, max) { return Math.max(min, Math.min(v, max)); }
  function setText(elm, v) { elm.textContent = String(v); }
  function clearTimers() {
    state.timers.forEach((t) => clearTimeout(t));
    state.timers.length = 0;
  }
  function every(ms, fn) {
    let alive = true;
    function tick() {
      if (!alive) return;
      const id = setTimeout(() => { fn(); tick(); }, ms);
      state.timers.push(id);
    }
    tick();
    return () => { alive = false; };
  }

  // --- Layout helpers
  function spawnBalloon() {
    const clone = balloonTemplate.content.firstElementChild.cloneNode(true);
    const balloon = clone;
    const value = randomInt(2, state.maxNumberOnBalloon);
    balloon.querySelector(".label").textContent = String(value);

    const areaWidth = gameArea.clientWidth;
    const startX = randomInt(10, Math.max(10, areaWidth - 82));
    balloon.style.left = `${startX}px`;

    const duration = randomInt(Math.max(4200, state.fallDurationMs - 1500), state.fallDurationMs + 1000);
    const start = performance.now();

    function frame(now) {
      if (!state.isRunning || state.isPaused) return;
      const t = clamp(0, (now - start) / duration, 1);
      const y = (gameArea.clientHeight + 110) * (1 - t) - 80; // from bottom to top
      balloon.style.transform = `translateY(${y}px)`;
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        // Missed click: if correct balloon, penalize
        const wasCommon = isCommonMultiple(value, state.numberA, state.numberB);
        if (wasCommon) loseLife();
        balloon.remove();
      }
    }

    balloon.addEventListener("click", () => {
      if (!state.isRunning || state.isPaused) return;
      const wasCommon = isCommonMultiple(value, state.numberA, state.numberB);
      if (wasCommon) {
        balloon.classList.add("correct");
        addScore(10);
        state.correctClicksThisLevel += 1;
        if (state.correctClicksThisLevel >= state.targetClicksPerLevel) {
          nextLevel();
        }
      } else {
        balloon.classList.add("wrong");
        loseLife();
        showQuickTip(`${value} is not a common multiple of ${state.numberA} and ${state.numberB}.`);
      }
      setTimeout(() => balloon.remove(), 250);
    });

    gameArea.appendChild(balloon);
    requestAnimationFrame(frame);
  }

  function showQuickTip(message) {
    const box = document.createElement("div");
    box.className = "tip";
    box.textContent = message;
    overlayContent.innerHTML = "";
    overlayContent.appendChild(box);
    overlay.classList.remove("hidden");
  }

  function showHowTo() {
    const a = state.numberA, b = state.numberB, theLcm = lcm(a, b);
    overlayContent.innerHTML = `
      <h2>How to Play</h2>
      <p>We are finding <strong>common multiples</strong> of <strong>${a}</strong> and <strong>${b}</strong>.
      A common multiple is a number that both ${a} and ${b} can divide into with no remainder.</p>
      <div class="tip">
        Example: Multiples of ${a} are ${a}, ${a*2}, ${a*3}, ...<br />
        Multiples of ${b} are ${b}, ${b*2}, ${b*3}, ...<br />
        Common multiples are numbers in <em>both</em> lists. The smallest one is the <strong>LCM</strong> = ${theLcm}.
      </div>
      <p>Click balloons that show a common multiple. Be careful—wrong clicks cost a life!</p>
    `;
    overlay.classList.remove("hidden");
  }

  function showLevelUp() {
    const a = state.numberA, b = state.numberB, theLcm = lcm(a, b);
    overlayContent.innerHTML = `
      <h2>Level ${state.level - 1} Complete! 🎉</h2>
      <p>You found enough common multiples of ${a} and ${b}.</p>
      <p>Their <strong>LCM</strong> is <strong>${theLcm}</strong> because it's the smallest number that both ${a} and ${b} divide into exactly.</p>
      <div>
        <span class="stat">+50 level bonus</span>
      </div>
    `;
    overlay.classList.remove("hidden");
  }

  // --- Game flow
  function startGame() {
    resetGame();
    state.isRunning = true;
    loopSpawn();
    startTimer();
    updateHud();
  }

  function resetGame() {
    state.level = 1;
    state.score = 0;
    state.lives = 3;
    state.timeLeft = 60;
    state.isPaused = false;
    state.correctClicksThisLevel = 0;
    state.numberA = 4;
    state.numberB = 6;
    state.spawnIntervalMs = 1400;
    state.fallDurationMs = 8000;
    gameArea.innerHTML = "";
    clearTimers();
  }

  function updateHud() {
    setText(levelEl, state.level);
    setText(scoreEl, state.score);
    setText(livesEl, state.lives);
    setText(timerEl, state.timeLeft);
    setText(numAEl, state.numberA);
    setText(numBEl, state.numberB);
  }

  function loopSpawn() {
    if (!state.isRunning) return;
    const cancel = every(state.spawnIntervalMs, () => {
      if (state.isPaused) return;
      spawnBalloon();
    });
    state.timers.push({ cancel });
  }

  function startTimer() {
    const id = setInterval(() => {
      if (!state.isRunning || state.isPaused) return;
      state.timeLeft -= 1;
      updateHud();
      if (state.timeLeft <= 0) {
        clearInterval(id);
        gameOver();
      }
    }, 1000);
    state.timers.push(id);
  }

  function addScore(points) {
    state.score += points;
    updateHud();
  }

  function loseLife() {
    state.lives -= 1;
    updateHud();
    if (state.lives <= 0) gameOver();
  }

  function nextLevel() {
    state.score += 50; // level bonus
    state.level += 1;
    state.correctClicksThisLevel = 0;
    // Make it a bit harder and change numbers
    const choices = [
      [3, 4], [4, 6], [5, 10], [6, 8], [7, 9], [8, 12], [9, 12], [10, 12], [12, 15]
    ];
    const pick = choices[(state.level - 1) % choices.length];
    state.numberA = pick[0];
    state.numberB = pick[1];
    state.spawnIntervalMs = Math.max(700, state.spawnIntervalMs - 120);
    state.fallDurationMs = Math.max(3800, state.fallDurationMs - 300);
    state.timeLeft = Math.min(75, state.timeLeft + 10);
    updateHud();
    showLevelUp();
  }

  function gameOver() {
    state.isRunning = false;
    clearTimers();
    overlayContent.innerHTML = `
      <h2>Game Over</h2>
      <p>Your score: <strong>${state.score}</strong></p>
      <p>Tip: The <strong>LCM</strong> of two numbers is the smallest number that both divide exactly. Look for numbers that are in both multiplication tables!</p>`;
    overlay.classList.remove("hidden");
  }

  // --- Settings
  function openSettings() {
    overlayContent.innerHTML = `
      <h2>Settings</h2>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <label>Number A <input id="inpA" type="number" min="2" max="20" value="${state.numberA}"></label>
        <label>Number B <input id="inpB" type="number" min="2" max="20" value="${state.numberB}"></label>
        <label>Spawn (ms) <input id="inpSpawn" type="number" min="400" max="4000" value="${state.spawnIntervalMs}"></label>
        <label>Fall Duration (ms) <input id="inpFall" type="number" min="2000" max="12000" value="${state.fallDurationMs}"></label>
        <label>Target correct per level <input id="inpTarget" type="number" min="3" max="12" value="${state.targetClicksPerLevel}"></label>
      </div>
      <div class="modal-actions" style="justify-content: flex-start; gap: 8px; padding-top:12px;">
        <button id="btnApply" class="btn primary">Apply</button>
      </div>
    `;
    overlay.classList.remove("hidden");
    setTimeout(() => {
      const get = (id) => overlayContent.querySelector(id);
      get('#btnApply').addEventListener('click', () => {
        const a = parseInt(get('#inpA').value, 10);
        const b = parseInt(get('#inpB').value, 10);
        const spawn = parseInt(get('#inpSpawn').value, 10);
        const fall = parseInt(get('#inpFall').value, 10);
        const target = parseInt(get('#inpTarget').value, 10);
        if (Number.isFinite(a) && Number.isFinite(b) && a >= 2 && b >= 2) {
          state.numberA = a; state.numberB = b;
        }
        if (Number.isFinite(spawn)) state.spawnIntervalMs = clamp(400, spawn, 4000);
        if (Number.isFinite(fall)) state.fallDurationMs = clamp(2000, fall, 12000);
        if (Number.isFinite(target)) state.targetClicksPerLevel = clamp(3, target, 12);
        updateHud();
        overlay.classList.add('hidden');
      });
    });
  }

  async function saveScore() {
    try {
      const name = prompt("Enter your name:") || "Player";
      const body = new URLSearchParams();
      body.set('name', name);
      body.set('score', String(state.score));
      body.set('level', String(state.level));

      const res = await fetch('php/save_score.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      const data = await res.json();
      if (data && data.ok) {
        showQuickTip(`Saved! Rank #${data.rank} / ${data.total}. High score: ${data.highest}.`);
      } else {
        showQuickTip('Could not save. PHP not available?');
      }
    } catch (err) {
      showQuickTip('Could not save. Is PHP server running?');
    }
  }

  // --- Events
  btnStart.addEventListener("click", startGame);
  btnPause.addEventListener("click", () => {
    if (!state.isRunning) return;
    state.isPaused = !state.isPaused;
    btnPause.textContent = state.isPaused ? 'Resume' : 'Pause';
  });
  btnHow.addEventListener("click", showHowTo);
  btnSettings.addEventListener("click", openSettings);
  btnSaveScore.addEventListener("click", saveScore);
  btnCloseOverlay.addEventListener("click", () => overlay.classList.add("hidden"));

  // Welcome overlay on first load
  overlayContent.innerHTML = `
    <h2>Welcome!</h2>
    <p>Click <strong>Start Game</strong> and pop balloons that show <strong>common multiples</strong> of the two numbers.</p>
    <p>Smallest common multiple is called the <strong>LCM</strong>. We'll celebrate it at every level up!</p>
  `;
  overlay.classList.remove("hidden");

  updateHud();
})();


