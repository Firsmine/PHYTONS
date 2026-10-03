const BOARD_W = 48;
const BOARD_H = 30;
const CELL = 20;
// State Game
let snake = [];
let pellets = [];
let direction = { x: 1, y: 0, name: "RIGHT" };
let nextDirection = { x: 1, y: 0, name: "RIGHT" }; // cegah bug tekan 2 tombol cepat
let totalTicks = 0; // 1 tick = 250ms. 4 tick = 1 detik
let history = [];
let gameInterval = null;
let isRewinding = false;
let playerName = "";
// State UI & Rewind
let backupState = null;
// DOM Elements
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const screenInstruction = document.getElementById("instructionScreen");
const screenGame = document.getElementById("gameScreen");
const screenGameOver = document.getElementById("gameOverScreen");

function startGame(name) {
  playerName = name;
  snake = [];
  for (let i = 0; i < 6; i++) {
    snake.push({ x: 24 - i, y: 15 }); // Mulai dari tengah, panjang 6
  }
  pellets = [];
  direction = { x: 1, y: 0, name: "RIGHT" };
  nextDirection = { x: 1, y: 0, name: "RIGHT" };
  totalTicks = 0;
  history = [];
  isRewinding = false;

  screenInstruction.classList.remove("active");
  screenGameOver.classList.remove("active");
  screenGame.classList.add("active");

  document.getElementById("normalControl").classList.add("active");
  document.getElementById("rewindControl").classList.remove("active");

  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, 250);
  spawnPelletIfNeeded();
}

function gameLoop() {
  if (isRewinding) return;
  totalTicks++;
  direction = nextDirection;
  saveHistory();
  managePellets();
  moveSnake();
  if (checkCollision()) {
    gameOver();
  } else {
    drawGame();
    updateHUD();
  }
}

function moveSnake() {
  const head = snake[0];
  const newX = (head.x + direction.x + BOARD_W) % BOARD_W;
  const newY = (head.y + direction.y + BOARD_H) % BOARD_H;
  const newHead = { x: newX, y: newY };
  const pelletIndex = pellets.findIndex((p) => p.x === newX && p.y === newY);
  const hasEaten = pelletIndex !== -1;
  snake.unshift(newHead);
  if (hasEaten) {
    pellets.splice(pelletIndex, 1);
  } else {
    snake.pop();
  }
}

function checkCollision() {
  const head = snake[0];
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) return true;
  }
  return false;
}
function managePellets() {
  pellets = pellets.filter((p) => totalTicks - p.spawnTick < 20);
  spawnPelletIfNeeded();
}
function spawnPelletIfNeeded() {
  while (pellets.length < 3) {
    createNewPellet();
  }
  if (pellets.length < 5 && totalTicks % 12 === 0) {
    createNewPellet();
  }
}
function createNewPellet() {
  let freePos = null;
  let attempts = 0;
  while (!freePos && attempts < 100) {
    let rx = Math.floor(Math.random() * BOARD_W);
    let ry = Math.floor(Math.random() * BOARD_H);
    let isOccupied =
      snake.some((s) => s.x === rx && s.y === ry) ||
      pellets.some((p) => p.x === rx && p.y === ry);
    if (!isOccupied) freePos = { x: rx, y: ry };
    attempts++;
  }
  if (freePos) {
    pellets.push({ x: freePos.x, y: freePos.y, spawnTick: totalTicks });
  }
}

function drawGame() {
  ctx.fillStyle = "#111b2d";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // grid
  ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
  ctx.beginPath();
  for (let x = 0; x <= canvas.width; x += CELL) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
  }
  for (let y = 0; y <= canvas.height; y += CELL) {
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
  }
  ctx.stroke();

  // gambar pellet
  pellets.forEach((p) => {
    let ticksLeft = 20 - (totalTicks - p.spawnTick);
    // Berkedip jika sisa umur kurang dari 1 detik (4 tick)
    if (ticksLeft <= 4 && totalTicks % 2 === 0) {
      ctx.fillStyle = "rgba(245, 158, 11, 0.3)";
    } else {
      ctx.fillStyle = "#f59e0b";
    }
    ctx.fillRect(p.x * CELL + 2, p.y * CELL + 2, CELL - 4, CELL - 4);
  });

  // gambar ular
  snake.forEach((s, i) => {
    ctx.fillStyle = i === 0 ? "#5d96d4" : "#3b82f6";
    ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
  });
}
