const guessForm = document.getElementById("guessForm");
const guessInput = document.getElementById("guessInput");
const messageBox = document.getElementById("messageBox");
const attemptsEl = document.getElementById("attempts");
const rangeEl = document.getElementById("range");
const bestSessionEl = document.getElementById("bestSession");
const sessionGamesEl = document.getElementById("sessionGames");
const submitBtn = document.getElementById("submitBtn");
const newGameBtn = document.getElementById("newGameBtn");
const leaderboardBtn = document.getElementById("leaderboardBtn");
const closeLeaderboardBtn = document.getElementById("closeLeaderboardBtn");
const leaderboardModal = document.getElementById("leaderboardModal");
const leaderboardList = document.getElementById("leaderboardList");
const difficultyButtons = document.querySelectorAll(".difficulty-btn");

let currentRange = 50;
let gameActive = false;
let currentAttempts = 0;
let sessionScores = [];
let currentGameId = null;

function updateMessage(text, type = "") {
  messageBox.textContent = text;
  messageBox.className = "message";
  if (type) messageBox.classList.add(type);
}

function updateSessionStats() {
  sessionGamesEl.textContent = sessionScores.length;
  bestSessionEl.textContent = sessionScores.length
    ? Math.min(...sessionScores.map((s) => s.attempts))
    : "—";
}

function loadLeaderboard() {
  try {
    return JSON.parse(localStorage.getItem("numguessLeaderboard")) || [];
  } catch {
    return [];
  }
}

function saveLeaderboard(data) {
  localStorage.setItem("numguessLeaderboard", JSON.stringify(data));
}

function renderLeaderboard() {
  const leaderboard = loadLeaderboard()
    .sort((a, b) => a.attempts - b.attempts)
    .slice(0, 10);

  if (!leaderboard.length) {
    leaderboardList.innerHTML =
      "<p class='empty-message'>no scores yet. play a game to earn a spot!</p>";
    return;
  }

  leaderboardList.innerHTML = leaderboard
    .map(
      (entry, index) => `
    <div class="leaderboard-item">
      <span class="leaderboard-rank">#${index + 1}</span>
      <div class="leaderboard-info">
        <span class="leaderboard-difficulty">${entry.range === 50 ? "easy" : entry.range === 100 ? "medium" : "hard"}</span>
      </div>
      <span class="leaderboard-attempts">${entry.attempts}</span>
    </div>
  `
    )
    .join("");
}

function setDifficulty(range) {
  currentRange = range;
  rangeEl.textContent = `1-${range}`;
  difficultyButtons.forEach((btn) => {
    btn.classList.toggle("active", Number(btn.dataset.range) === range);
  });
  updateMessage("ready to start? click new game.");
}

difficultyButtons.forEach((btn) => {
  btn.addEventListener("click", () => setDifficulty(Number(btn.dataset.range)));
});

async function startNewGame() {
  const response = await fetch("/api/new-game", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ range: currentRange }),
  });

  const data = await response.json();
  currentGameId = data.game_id;

  currentAttempts = 0;
  attemptsEl.textContent = "0";
  guessInput.value = "";
  guessInput.disabled = false;
  guessInput.focus();
  gameActive = true;
  submitBtn.disabled = false;

  updateMessage(`guess a number between 1 and ${currentRange}`);
}

async function submitGuess(event) {
  event.preventDefault();

  if (!gameActive) {
    updateMessage("start a new game first.", "error");
    return;
  }

  const guess = Number(guessInput.value);

  if (!guess || guess < 1 || guess > currentRange) {
    updateMessage(`enter a number between 1 and ${currentRange}.`, "error");
    return;
  }

  const response = await fetch("/api/guess", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ guess }),
  });

  const data = await response.json();

  if (data.attempts !== undefined) {
    currentAttempts = data.attempts;
    attemptsEl.textContent = currentAttempts;
  }

  updateMessage(data.message, data.type || "");

  if (data.type === "success") {
    gameActive = false;
    guessInput.disabled = true;
    submitBtn.disabled = true;

    sessionScores.push({ attempts: currentAttempts, range: currentRange });
    updateSessionStats();

    const leaderboard = loadLeaderboard();
    leaderboard.push({ attempts: currentAttempts, range: currentRange });
    leaderboard.sort((a, b) => a.attempts - b.attempts);
    saveLeaderboard(leaderboard);
    renderLeaderboard();
  }

  guessInput.value = "";
}

guessForm.addEventListener("submit", submitGuess);
newGameBtn.addEventListener("click", startNewGame);
leaderboardBtn.addEventListener("click", () => {
  renderLeaderboard();
  leaderboardModal.classList.add("show");
});
closeLeaderboardBtn.addEventListener("click", () => {
  leaderboardModal.classList.remove("show");
});
leaderboardModal.addEventListener("click", (e) => {
  if (e.target === leaderboardModal) {
    leaderboardModal.classList.remove("show");
  }
});

setDifficulty(50);
updateSessionStats();
renderLeaderboard();