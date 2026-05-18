const storageKey = "pac_task_maze_v1";

const appState = {
  tasks: [],
  xp: 0,
  streak: 0,
  tickets: 0,
  currentTaskId: null
};

const els = {
  form: document.getElementById("taskForm"),
  taskInput: document.getElementById("taskInput"),
  rewardSelect: document.getElementById("rewardSelect"),
  taskList: document.getElementById("taskList"),
  pendingCount: document.getElementById("pendingCount"),
  doneCount: document.getElementById("doneCount"),
  missionCard: document.getElementById("missionCard"),
  currentMission: document.getElementById("currentMission"),
  currentReward: document.getElementById("currentReward"),
  spinBtn: document.getElementById("spinBtn"),
  completeBtn: document.getElementById("completeBtn"),
  skipBtn: document.getElementById("skipBtn"),
  xpValue: document.getElementById("xpValue"),
  levelValue: document.getElementById("levelValue"),
  streakValue: document.getElementById("streakValue"),
  ticketsValue: document.getElementById("ticketsValue"),
  progressBar: document.getElementById("progressBar"),
  statusMessage: document.getElementById("statusMessage"),
  confettiRoot: document.getElementById("confettiRoot")
};

function getLevel(xp) {
  return Math.floor(xp / 100) + 1;
}

function getTaskById(taskId) {
  return appState.tasks.find((task) => task.id === taskId) || null;
}

function getPendingTasks() {
  return appState.tasks.filter((task) => !task.done);
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(appState));
}

function loadState() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    return;
  }

  try {
    const parsed = JSON.parse(saved);
    appState.tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
    appState.xp = Number.isFinite(parsed.xp) ? parsed.xp : 0;
    appState.streak = Number.isFinite(parsed.streak) ? parsed.streak : 0;
    appState.tickets = Number.isFinite(parsed.tickets) ? parsed.tickets : 0;
    appState.currentTaskId = typeof parsed.currentTaskId === "string" ? parsed.currentTaskId : null;
  } catch {
    appState.tasks = [];
  }
}

function setStatus(text) {
  els.statusMessage.textContent = text;
}

function updateMissionCard() {
  const task = getTaskById(appState.currentTaskId);

  if (!task || task.done) {
    appState.currentTaskId = null;
    els.currentMission.textContent = getPendingTasks().length
      ? 'Press "Start Chase" to lock your next dot.'
      : "Add tasks and tap \"Start Chase\"";
    els.currentReward.textContent = "";
    els.completeBtn.disabled = true;
    els.skipBtn.disabled = true;
    return;
  }

  els.currentMission.textContent = task.text;
  els.currentReward.textContent = `Dot value: +${task.reward} score`;
  els.completeBtn.disabled = false;
  els.skipBtn.disabled = false;
}

function renderStats() {
  const level = getLevel(appState.xp);
  const progress = appState.xp % 100;
  els.xpValue.textContent = String(appState.xp);
  els.levelValue.textContent = String(level);
  els.streakValue.textContent = String(appState.streak);
  els.ticketsValue.textContent = String(appState.tickets);
  els.progressBar.style.width = `${progress}%`;
}

function renderTasks() {
  els.taskList.innerHTML = "";

  const pending = getPendingTasks();
  const done = appState.tasks.filter((task) => task.done);
  els.pendingCount.textContent = String(pending.length);
  els.doneCount.textContent = String(done.length);

  const orderedTasks = [...pending, ...done];
  orderedTasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = `task-item ${task.done ? "done" : ""}`;

    const pill = document.createElement("span");
    pill.className = "task-pill";
    pill.textContent = `+${task.reward} score`;

    const text = document.createElement("span");
    text.className = `task-text ${task.done ? "done" : ""}`;
    text.textContent = task.text;

    const remove = document.createElement("button");
    remove.className = "delete-btn";
    remove.type = "button";
    remove.textContent = "x";
    remove.setAttribute("aria-label", `Delete dot ${task.text}`);
    remove.addEventListener("click", () => {
      const wasCurrent = appState.currentTaskId === task.id;
      appState.tasks = appState.tasks.filter((item) => item.id !== task.id);
      if (wasCurrent) {
        appState.currentTaskId = null;
      }
      setStatus("Dot removed from the maze.");
      sync();
    });

    li.appendChild(pill);
    li.appendChild(text);
    li.appendChild(remove);
    els.taskList.appendChild(li);
  });
}

function animateMissionCard() {
  els.missionCard.classList.remove("active");
  requestAnimationFrame(() => {
    els.missionCard.classList.add("active");
  });
}

function spinMission() {
  const pending = getPendingTasks();
  if (!pending.length) {
    appState.currentTaskId = null;
    setStatus("No dots in the maze yet. Add one first.");
    sync();
    return;
  }

  let pool = pending;
  if (appState.currentTaskId && pending.length > 1) {
    pool = pending.filter((task) => task.id !== appState.currentTaskId);
  }

  const chosen = pool[Math.floor(Math.random() * pool.length)];
  appState.currentTaskId = chosen.id;
  setStatus("Target locked. Clear this one dot only.");
  animateMissionCard();
  sync();
}

function confettiBurst() {
  const colors = ["#ffe261", "#58f8ff", "#ff8ccd", "#ff4a5b", "#7bea35"];
  for (let i = 0; i < 40; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = `${1.8 + Math.random() * 1.4}s`;
    piece.style.animationDelay = `${Math.random() * 0.25}s`;
    els.confettiRoot.appendChild(piece);
    setTimeout(() => piece.remove(), 3600);
  }
}

function completeMission() {
  const task = getTaskById(appState.currentTaskId);
  if (!task || task.done) {
    return;
  }

  task.done = true;
  appState.xp += task.reward;
  appState.streak += 1;
  appState.tickets += Math.max(1, Math.round(task.reward / 10));

  const previousLevel = getLevel(appState.xp - task.reward);
  const currentLevel = getLevel(appState.xp);
  if (currentLevel > previousLevel) {
    setStatus(`Stage up! You reached Stage ${currentLevel}.`);
  } else {
    setStatus(`Dot cleared! +${task.reward} score`);
  }

  appState.currentTaskId = null;
  confettiBurst();
  sync();
}

function skipMission() {
  const task = getTaskById(appState.currentTaskId);
  if (!task || task.done) {
    return;
  }

  appState.streak = 0;
  setStatus("Combo reset. Rerouting to a new dot...");
  appState.currentTaskId = null;
  spinMission();
}

function addTask(text, reward) {
  const task = {
    id: `${Date.now()}-${Math.round(Math.random() * 10000)}`,
    text,
    reward,
    done: false
  };

  appState.tasks.push(task);
}

function sync() {
  updateMissionCard();
  renderStats();
  renderTasks();
  saveState();
}

els.form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = els.taskInput.value.trim();
  if (!text) {
    return;
  }

  const reward = Number(els.rewardSelect.value) || 20;
  addTask(text, reward);
  els.taskInput.value = "";
  setStatus("Dot dropped into the maze. Start chase when ready.");
  sync();
});

els.spinBtn.addEventListener("click", spinMission);
els.completeBtn.addEventListener("click", completeMission);
els.skipBtn.addEventListener("click", skipMission);

loadState();
sync();
