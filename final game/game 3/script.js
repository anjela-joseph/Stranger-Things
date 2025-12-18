// Stranger Things Match-3 (HTML + CSS + JS) — Full script.js
// Drop this in as script.js. Put images next to index.html (or in /assets and change SPRITE_BASE).
// Required files: eleven.png, mike.png, dustin.png, lucas.png, will.png, demogorgon.png

// ----------------------------
// Game constants
// ----------------------------
const BOARD_SIZE = 8;
const CHARACTERS = ["eleven", "mike", "dustin", "lucas", "will", "demogorgon","steve"];
const INITIAL_MOVES = 30;
const MATCH_SCORE = 10;
const WIN_SCORE = 500;

// ----------------------------
// Sprite paths
// ----------------------------
const SPRITE_BASE = ""; // change to "assets/" if your images are inside an assets folder

const CHARACTER_SPRITES = {
  eleven: `${SPRITE_BASE}eleven.png`,
  mike: `${SPRITE_BASE}mike.png`,
  dustin: `${SPRITE_BASE}dustin.png`,
  lucas: `${SPRITE_BASE}lucas.png`,
  will: `${SPRITE_BASE}will.png`,
  steve: `${SPRITE_BASE}steve.png`,
  demogorgon: `${SPRITE_BASE}demogorgon.png`,
};

// ----------------------------
// Audio (Web Audio API)
// ----------------------------
let audioContext;
let sounds = {};

function initAudio() {
  try {
    addParticleStyles();
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    createSounds();
    setTimeout(createParticles, 100);
  } catch (e) {
    console.log("Web Audio API not supported:", e);
    addParticleStyles();
    setTimeout(createParticles, 100);
  }
}

function createSounds() {
  if (!audioContext) return;

  // Select sound
  sounds.select = () => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  // Match sound
  sounds.match = () => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

    oscillator.start();
    oscillator.frequency.exponentialRampToValueAtTime(
      1046.5,
      audioContext.currentTime + 0.5
    );
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  // Reset sound
  sounds.reset = () => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(329.63, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

    oscillator.start();
    oscillator.frequency.exponentialRampToValueAtTime(
      659.25,
      audioContext.currentTime + 0.8
    );
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
    oscillator.stop(audioContext.currentTime + 0.8);
  };
}

function playSound(soundName) {
  if (sounds[soundName]) {
    try {
      sounds[soundName]();
    } catch (e) {
      console.log(`Error playing sound: ${soundName}`, e);
    }
  }
}

// ----------------------------
// Game state
// ----------------------------
let score = 0;
let moves = INITIAL_MOVES;
let level = 1;

let selectedTile = null; // {row, col}
let board = [];
let isSwapping = false;
let isProcessingMatches = false;

// ----------------------------
// DOM elements
// ----------------------------
const gameBoard = document.getElementById("gameBoard");
const scoreElement = document.getElementById("score");
const movesElement = document.getElementById("moves");
const levelElement = document.getElementById("level");
const resetBtn = document.getElementById("resetBtn");
const hintBtn = document.getElementById("hintBtn");
const upsideDownToggle = document.getElementById("upsideDownToggle");

// ----------------------------
// Init
// ----------------------------
document.addEventListener("DOMContentLoaded", () => {
  initGame();
  setupEventListeners();
  initAudio();
});

// ----------------------------
// Event listeners
// ----------------------------
function setupEventListeners() {
  resetBtn?.addEventListener("click", resetGame);
  hintBtn?.addEventListener("click", showHint);
  upsideDownToggle?.addEventListener("change", toggleUpsideDownMode);
}

// ----------------------------
// Game setup
// ----------------------------
function initGame() {
  createBoard();
  renderBoard();
  updateUI();
}

function createBoard() {
  board = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    board[row] = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      let type;
      let attempts = 0;

      do {
        type = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
        attempts++;
        if (attempts > 60) break;
      } while (
        // horizontal 3
        (col >= 2 && board[row][col - 1] === type && board[row][col - 2] === type) ||
        // vertical 3
        (row >= 2 && board[row - 1][col] === type && board[row - 2][col] === type)
      );

      board[row][col] = type;
    }
  }
}

// ----------------------------
// Rendering (USES FACE IMAGES)
// ----------------------------
function renderBoard() {
  gameBoard.innerHTML = "";

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.dataset.row = String(row);
      tile.dataset.col = String(col);

      const type = board[row][col];

      const img = document.createElement("img");
      img.className = "character-img";
      img.alt = type || "";
      img.draggable = false;
      img.src = type ? (CHARACTER_SPRITES[type] || "") : "";

      // keep old "varied delay" idea
      const delay = (row * BOARD_SIZE + col) % 10;
      img.style.setProperty("--delay", delay);

      img.onerror = () => {
        // if image missing, show fallback letter
        img.style.display = "none";
        tile.textContent = type ? type[0].toUpperCase() : "?";
        tile.style.color = "#fff";
        tile.style.fontWeight = "700";
        tile.style.display = "grid";
        tile.style.placeItems = "center";
      };

      tile.appendChild(img);

      // preserve selection highlight
      if (selectedTile && selectedTile.row === row && selectedTile.col === col) {
        tile.classList.add("selected");
      }

      tile.addEventListener("click", () => handleTileClick(row, col));
      gameBoard.appendChild(tile);
    }
  }
}

// ----------------------------
// Input
// ----------------------------
function handleTileClick(row, col) {
  if (isSwapping || isProcessingMatches) return;

  playSound("select");

  // select first tile
  if (!selectedTile) {
    selectedTile = { row, col };
    renderBoard();
    return;
  }

  // deselect same tile
  if (selectedTile.row === row && selectedTile.col === col) {
    selectedTile = null;
    renderBoard();
    return;
  }

  const isAdjacent =
    (Math.abs(selectedTile.row - row) === 1 && selectedTile.col === col) ||
    (Math.abs(selectedTile.col - col) === 1 && selectedTile.row === row);

  if (isAdjacent) {
    swapTiles(selectedTile.row, selectedTile.col, row, col);
  } else {
    // select new tile
    selectedTile = { row, col };
    renderBoard();
  }
}

// ----------------------------
// Swap + validation
// ----------------------------
function swapTiles(row1, col1, row2, col2) {
  if (isSwapping) return;
  isSwapping = true;

  swapInBoard(row1, col1, row2, col2);
  renderBoard();

  setTimeout(() => {
    const matches = findAllMatches();

    if (matches.length > 0) {
      moves--;
      updateUI();
      selectedTile = null;
      processMatches(matches);
    } else {
      // invalid move -> swap back
      swapInBoard(row1, col1, row2, col2);
      selectedTile = null;
      renderBoard();
      isSwapping = false;
    }
  }, 250);
}

function swapInBoard(r1, c1, r2, c2) {
  const temp = board[r1][c1];
  board[r1][c1] = board[r2][c2];
  board[r2][c2] = temp;
}

// ----------------------------
// Matching
// ----------------------------
function findAllMatches() {
  const matches = [];

  // horizontal
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE - 2; col++) {
      const type = board[row][col];
      if (!type) continue;

      if (type === board[row][col + 1] && type === board[row][col + 2]) {
        let len = 3;
        while (col + len < BOARD_SIZE && board[row][col + len] === type) len++;

        const group = [];
        for (let i = 0; i < len; i++) group.push({ row, col: col + i });
        matches.push(group);

        col += len - 1;
      }
    }
  }

  // vertical
  for (let col = 0; col < BOARD_SIZE; col++) {
    for (let row = 0; row < BOARD_SIZE - 2; row++) {
      const type = board[row][col];
      if (!type) continue;

      if (type === board[row + 1][col] && type === board[row + 2][col]) {
        let len = 3;
        while (row + len < BOARD_SIZE && board[row + len][col] === type) len++;

        const group = [];
        for (let i = 0; i < len; i++) group.push({ row: row + i, col });
        matches.push(group);

        row += len - 1;
      }
    }
  }

  return matches;
}

function processMatches(matches, isChain = false) {
  if (!isChain) {
    if (isProcessingMatches) return;
    isProcessingMatches = true;
  }

  // score
  const count = matches.reduce((sum, group) => sum + group.length, 0);
  score += count * MATCH_SCORE;
  updateUI();

  if (count > 0) playSound("match");

  // animate matched tiles
  const coords = new Set(matches.flat().map((t) => `${t.row},${t.col}`));
  coords.forEach((key) => {
    const [r, c] = key.split(",").map(Number);
    const el = document.querySelector(`.tile[data-row="${r}"][data-col="${c}"]`);
    if (el) el.classList.add("matched");
  });

  setTimeout(() => {
    removeMatches(matches);
    refillBoard();
    renderBoard();

    setTimeout(() => {
      const newMatches = findAllMatches();
      if (newMatches.length > 0) {
        processMatches(newMatches, true);
      } else {
        isSwapping = false;
        isProcessingMatches = false;
        checkGameOver();
      }
    }, 250);
  }, 300);
}

function removeMatches(matches) {
  matches.flat().forEach((t) => {
    board[t.row][t.col] = null;
  });
}

function refillBoard() {
  for (let col = 0; col < BOARD_SIZE; col++) {
    let empty = 0;

    for (let row = BOARD_SIZE - 1; row >= 0; row--) {
      if (board[row][col] === null) {
        empty++;
      } else if (empty > 0) {
        board[row + empty][col] = board[row][col];
        board[row][col] = null;
      }
    }

    // fill top
    for (let row = 0; row < empty; row++) {
      let type;
      let attempts = 0;

      do {
        type = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
        attempts++;
        if (attempts > 60) break;
      } while (
        // prevent instant horizontal 3
        (col >= 2 && board[row][col - 1] === type && board[row][col - 2] === type) ||
        // prevent instant vertical 3
        (row >= 2 && board[row - 1][col] === type && board[row - 2][col] === type)
      );

      board[row][col] = type;
    }
  }
}

// ----------------------------
// Hint system
// ----------------------------
function showHint() {
  // Try every possible adjacent swap
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      // right
      if (col < BOARD_SIZE - 1) {
        swapInBoard(row, col, row, col + 1);
        const ok = wouldCreateMatch(row, col) || wouldCreateMatch(row, col + 1);
        swapInBoard(row, col, row, col + 1);
        if (ok) {
          highlightTile(row, col);
          highlightTile(row, col + 1);
          return;
        }
      }

      // down
      if (row < BOARD_SIZE - 1) {
        swapInBoard(row, col, row + 1, col);
        const ok = wouldCreateMatch(row, col) || wouldCreateMatch(row + 1, col);
        swapInBoard(row, col, row + 1, col);
        if (ok) {
          highlightTile(row, col);
          highlightTile(row + 1, col);
          return;
        }
      }
    }
  }

  // fallback random
  const r = Math.floor(Math.random() * BOARD_SIZE);
  const c = Math.floor(Math.random() * BOARD_SIZE);
  highlightTile(r, c);
}

function wouldCreateMatch(row, col) {
  const type = board[row][col];
  if (!type) return false;

  // horizontal count
  let count = 1;
  for (let c = col - 1; c >= 0 && board[row][c] === type; c--) count++;
  for (let c = col + 1; c < BOARD_SIZE && board[row][c] === type; c++) count++;
  if (count >= 3) return true;

  // vertical count
  count = 1;
  for (let r = row - 1; r >= 0 && board[r][col] === type; r--) count++;
  for (let r = row + 1; r < BOARD_SIZE && board[r][col] === type; r++) count++;
  return count >= 3;
}

function highlightTile(row, col) {
  const tile = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
  if (!tile) return;
  tile.style.boxShadow = "0 0 15px #ffff00";
  setTimeout(() => {
    tile.style.boxShadow = "";
  }, 1000);
}

// ----------------------------
// Upside Down toggle
// ----------------------------
function toggleUpsideDownMode() {
  document.body.classList.toggle("upside-down", upsideDownToggle?.checked);
  playSound(upsideDownToggle?.checked ? "match" : "select");
}

// ----------------------------
// UI + end conditions
// ----------------------------
function updateUI() {
  if (scoreElement) scoreElement.textContent = String(score);
  if (movesElement) movesElement.textContent = String(moves);
  if (levelElement) levelElement.textContent = String(level);
}

function checkGameOver() {
  if (score >= WIN_SCORE) {
    setTimeout(() => {
      alert(`Congratulations! You won with a score of ${score}!`);
      resetGame();
    }, 200);
    return;
  }

  if (moves <= 0) {
    setTimeout(() => {
      alert(`Game Over! Your final score is ${score}`);
    }, 200);
  }
}

function resetGame() {
  score = 0;
  moves = INITIAL_MOVES;
  level = 1;
  selectedTile = null;
  isSwapping = false;
  isProcessingMatches = false;

  initGame();
  playSound("reset");
}

// ----------------------------
// Particles (atmosphere)
// ----------------------------
function createParticles() {
  const container = document.querySelector(".game-container");
  if (!container) return;

  const particleCount = 15;

  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement("div");
    p.className = "particle float";
    p.style.position = "absolute";
    p.style.width = Math.random() * 5 + 2 + "px";
    p.style.height = p.style.width;
    p.style.backgroundColor = i % 3 === 0 ? "#ff0000" : "#ffffff";
    p.style.borderRadius = "50%";
    p.style.opacity = String(Math.random() * 0.5 + 0.1);
    p.style.top = Math.random() * 100 + "%";
    p.style.left = Math.random() * 100 + "%";
    p.style.zIndex = "0";
    p.style.animationDuration = Math.random() * 10 + 5 + "s";
    p.style.animationDelay = Math.random() * 5 + "s";
    container.appendChild(p);
  }
}

function addParticleStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .particle { position:absolute; pointer-events:none; z-index:0; }
    @keyframes floatUp {
      0% { transform: translateY(0) translateX(0); opacity: 0; }
      10% { opacity: .5; }
      90% { opacity: .3; }
      100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
    }
    .float { animation: floatUp linear infinite; }
  `;
  document.head.appendChild(style);
}
