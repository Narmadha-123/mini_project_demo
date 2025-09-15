// Load data from localStorage
const names = JSON.parse(localStorage.getItem("playerNames")) || ["P1", "P2"];
const emojis = JSON.parse(localStorage.getItem("playerEmojis")) || ["😀", "😎"];
const winCondition = parseInt(localStorage.getItem("winCondition")) || 3;

const playerInfo = document.getElementById("playerInfo");
const scoreboard = document.getElementById("scoreboard");
const turnText = document.getElementById("turn");
const winnerText = document.getElementById("winner");
const board = document.getElementById("board");

const undoBtn = document.getElementById("undo");
const resetBtn = document.getElementById("reset");

const victoryTab = document.createElement("div");
victoryTab.id = "victoryTab";
victoryTab.classList.add("hidden");
document.body.appendChild(victoryTab);

let players = names.map((n, i) => ({ name: n, emoji: emojis[i] }));
let scores = Array(players.length).fill(0);
let currentPlayer = 0;
let gameBoard = [];
let history = [];
const size = 5;

// Init Game
displayPlayerInfo();
updateScoreboard();
createBoard();

function displayPlayerInfo() {
  playerInfo.innerHTML = players
    .map((p) => `<b>${p.emoji}</b> ${p.name}`)
    .join(" | ");
}

function updateScoreboard() {
  scoreboard.innerHTML = players
    .map((p, i) => `${p.emoji} ${p.name}: <b>${scores[i]}</b>`)
    .join(" | ");
}

function createBoard() {
  board.innerHTML = "";
  gameBoard = Array(size)
    .fill()
    .map(() => Array(size).fill(""));
  history = [];
  winnerText.textContent = "";
  victoryTab.classList.add("hidden");

  for (let i = 0; i < size * size; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.addEventListener("click", handleCellClick);
    board.appendChild(cell);
  }
  updateTurnText();
}

function updateTurnText() {
  turnText.innerHTML = `👉 Turn: <b>${players[currentPlayer].name}</b> ${players[currentPlayer].emoji}`;
}

function handleCellClick(e) {
  const index = e.target.dataset.index;
  const row = Math.floor(index / size);
  const col = index % size;

  if (gameBoard[row][col] !== "" || winnerText.textContent !== "") return;

  gameBoard[row][col] = players[currentPlayer].emoji;
  e.target.textContent = players[currentPlayer].emoji;
  e.target.classList.add("filled");

  history.push({ row, col });

  if (checkWin(row, col)) {
    winnerText.textContent = `🎉 ${players[currentPlayer].name} ${players[currentPlayer].emoji} wins!`;
    scores[currentPlayer]++;
    updateScoreboard();
    showVictory(players[currentPlayer]);
    return;
  }

  currentPlayer = (currentPlayer + 1) % players.length;
  updateTurnText();
}

function checkWin(row, col) {
  const symbol = players[currentPlayer].emoji;
  function count(dx, dy) {
    let r = row + dx,
      c = col + dy,
      cnt = 0;
    while (
      r >= 0 &&
      r < size &&
      c >= 0 &&
      c < size &&
      gameBoard[r][c] === symbol
    ) {
      cnt++;
      r += dx;
      c += dy;
    }
    return cnt;
  }
  return (
    1 + count(1, 0) + count(-1, 0) >= winCondition ||
    1 + count(0, 1) + count(0, -1) >= winCondition ||
    1 + count(1, 1) + count(-1, -1) >= winCondition ||
    1 + count(1, -1) + count(-1, 1) >= winCondition
  );
}

function showVictory(player) {
  victoryTab.innerHTML = `
    <div class="victory-card">
      <h2>🎉 Hurray! We Have a Winner 🎉</h2>
      <p><b>${player.name}</b> ${player.emoji} is the champion!</p>
      <button id="playAgain">Play Again</button>
    </div>
  `;
  victoryTab.classList.remove("hidden");
  document.getElementById("playAgain").addEventListener("click", () => {
    createBoard();
  });
}

// Controls
undoBtn.addEventListener("click", () => {
  if (!history.length || winnerText.textContent !== "") return;
  const last = history.pop();
  gameBoard[last.row][last.col] = "";
  const cell = board.children[last.row * size + last.col];
  cell.textContent = "";
  cell.classList.remove("filled");
  currentPlayer = (currentPlayer - 1 + players.length) % players.length;
  updateTurnText();
});
resetBtn.addEventListener("click", createBoard);
