const guessForm = document.getElementById("guessForm");
const guessInput = document.getElementById("guessInput");
const messageBox = document.getElementById("messageBox");
const attemptsEl = document.getElementById("attempts");
const newGameBtn = document.getElementById("newGameBtn");
const sessionLogBtn = document.getElementById("sessionLogBtn");
const leaderboardBtn = document.getElementById("leaderboardBtn");
const floatingContainer = document.getElementById("floatingContainer");
const difficultyButtons = document.querySelectorAll(".difficulty-btn");

const sessionLogModal = document.getElementById("sessionLogModal");
const leaderboardModal = document.getElementById("leaderboardModal");
const closeSessionLog = document.getElementById("closeSessionLog");
const closeLeaderboard = document.getElementById("closeLeaderboard");
const closeSessionLogBtn = document.getElementById("closeSessionLogBtn");
const closeLeaderboardBtn = document.getElementById("closeLeaderboardBtn");
const clearLeaderboardBtn = document.getElementById("clearLeaderboardBtn");

const sessionGamesEl = document.getElementById("sessionGames");
const bestSessionEl = document.getElementById("bestSession");
const rangeEl = document.getElementById("range");

let currentDifficulty = "easy";
let currentRange = 50;
let gameActive = false;
let sessionScores = [];

// Generate floating numbers in the background
function generateFloatingNumbers() {
  floatingContainer.innerHTML = "";
  const numbers = [1, 5, 13, 27, 42, 56, 73, 88, 99, 15, 31, 47, 62, 84, 91];
  
  numbers.forEach((num) => {
    const floatingNum = document.createElement("div");
    floatingNum.className = "floating-number";
    floatingNum.textContent = num;
    floatingNum.style.left = Math.random() * 100 + "%";
    floatingNum.style.animationDelay = Math.random() * 5 + "s";
    floatingNum.style.animationDuration = (15 + Math.random() * 15) + "s";
    floatingContainer.appendChild(floatingNum);
  });
}

generateFloatingNumbers();

// Load leaderboard from localStorage
function loadLeaderboard() {
  return JSON.parse(localStorage.getItem("gameLeaderboard")) || [];
}

// Save leaderboard to localStorage
function saveLeaderboard(leaderboard) {
  localStorage.setItem("gameLeaderboard", JSON.stringify(leaderboard));
}

// Update session display
function updateSessionDisplay() {
  sessionGamesEl.textContent = sessionScores.length;
  if (sessionScores.length === 0) {
    bestSessionEl.textContent = "∞";
  } else {
    const bestScore = Math.min(...sessionScores.map(s => s.attempts));
    bestSessionEl.textContent = bestScore;
  }
}

// Handle difficulty selection
difficultyButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    difficultyButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentDifficulty = btn.dataset.difficulty;
    currentRange = parseInt(btn.dataset.range);
    rangeEl.textContent = `1–${currentRange}`;
    updateMessage("Difficulty selected! Click 'New Game' to start.", "");
  });
});

async function startNewGame() {
  const response = await fetch("/api/new-game", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ range: currentRange })
  });

  const data = await response.json();
  attemptsEl.textContent = "0";
  guessInput.value = "";
  guessInput.disabled = false;
  guessInput.focus();
  gameActive = true;

  guessForm.querySelector("button").disabled = false;

  messageBox.textContent = `Game started! Guess a number between 1 and ${currentRange}.`;
  messageBox.className = "message-box";
}

function updateMessage(text, type = "") {
  messageBox.textContent = text;
  messageBox.className = "message-box";
  if (type) {
    messageBox.classList.add(type);
  }
}

guessForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  if (!gameActive) {
    updateMessage("Please start a new game first.", "error");
    return;
  }

  const guess = guessInput.value.trim();

  if (!guess) {
    updateMessage("Please enter a valid number before submitting.", "error");
    return;
  }

  const response = await fetch("/api/guess", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ guess: Number(guess) })
  });

  const data = await response.json();

  if (data.attempts !== undefined) {
    attemptsEl.textContent = data.attempts;
  }

  updateMessage(data.message, data.type || "");

  if (data.type === "success") {
    guessInput.disabled = true;
    guessForm.querySelector("button").disabled = true;
    gameActive = false;

    // Add to session scores
    const sessionScore = {
      attempts: data.attempts,
      difficulty: currentDifficulty,
      range: currentRange,
      timestamp: new Date().toLocaleTimeString()
    };
    sessionScores.push(sessionScore);
    updateSessionDisplay();

    // Add to all-time leaderboard
    const leaderboard = loadLeaderboard();
    leaderboard.push({
      attempts: data.attempts,
      difficulty: currentDifficulty,
      range: currentRange,
      timestamp: new Date().toLocaleString()
    });
    leaderboard.sort((a, b) => a.attempts - b.attempts);
    saveLeaderboard(leaderboard);
  }

  guessInput.value = "";
});

newGameBtn.addEventListener("click", startNewGame);

// Session Log Modal
sessionLogBtn.addEventListener("click", () => {
  sessionLogModal.classList.add("active");
  displaySessionLog();
});

closeSessionLogBtn.addEventListener("click", () => {
  sessionLogModal.classList.remove("active");
});

closeSessionLog.addEventListener("click", () => {
  sessionLogModal.classList.remove("active");
});

sessionLogModal.addEventListener("click", (e) => {
  if (e.target === sessionLogModal) {
    sessionLogModal.classList.remove("active");
  }
});

function displaySessionLog() {
  const sessionLogList = document.getElementById("sessionLogList");

  if (sessionScores.length === 0) {
    sessionLogList.innerHTML = '<p class="empty-message">No games played in this session yet!</p>';
    return;
  }

  sessionLogList.innerHTML = sessionScores.map((score, idx) => `
    <div class="score-item">
      <div class="score-info">
        <div class="score-difficulty">#${idx + 1} - ${score.difficulty.toUpperCase()} (1-${score.range})</div>
        <div class="score-time">${score.timestamp}</div>
      </div>
      <div class="score-attempts">${score.attempts}</div>
    </div>
  `).join("");
}

// Leaderboard Modal
leaderboardBtn.addEventListener("click", () => {
  leaderboardModal.classList.add("active");
  displayLeaderboard();
});

closeLeaderboardBtn.addEventListener("click", () => {
  leaderboardModal.classList.remove("active");
});

closeLeaderboard.addEventListener("click", () => {
  leaderboardModal.classList.remove("active");
});

leaderboardModal.addEventListener("click", (e) => {
  if (e.target === leaderboardModal) {
    leaderboardModal.classList.remove("active");
  }
});

function displayLeaderboard() {
  const leaderboard = loadLeaderboard();
  const leaderboardList = document.getElementById("leaderboardList");

  if (leaderboard.length === 0) {
    leaderboardList.innerHTML = '<p class="empty-message">No records yet. Start playing to earn a spot!</p>';
    return;
  }

  leaderboardList.innerHTML = leaderboard.slice(0, 50).map((score, idx) => {
    let medalEmoji = '';
    let rankClass = '';
    if (idx === 0) {
      medalEmoji = '🥇';
      rankClass = 'rank-1';
    } else if (idx === 1) {
      medalEmoji = '🥈';
      rankClass = 'rank-2';
    } else if (idx === 2) {
      medalEmoji = '🥉';
      rankClass = 'rank-3';
    }

    return `
      <div class="leaderboard-item">
        <div class="leaderboard-rank ${rankClass}">${medalEmoji} #${idx + 1}</div>
        <div class="leaderboard-details">
          <div class="leaderboard-name">${score.difficulty} (1-${score.range})</div>
          <div class="leaderboard-info-small">${score.timestamp}</div>
        </div>
        <div class="leaderboard-attempts">${score.attempts}</div>
      </div>
    `;
  }).join("");
}

clearLeaderboardBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear the entire leaderboard?")) {
    localStorage.removeItem("gameLeaderboard");
    displayLeaderboard();
  }
});

// Initialize
updateSessionDisplay();
