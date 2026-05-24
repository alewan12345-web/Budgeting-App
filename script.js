const STORAGE_KEY = "budgetCrewDataV1";
const CURRENCY = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const today = new Date();
const isoToday = toISODate(today);
const UNDO_LIMIT = 30;

const WEEKLY_SORT_OPTIONS = new Set(["date-desc", "date-asc", "amount-desc", "amount-asc"]);
const SUB_SORT_OPTIONS = new Set(["day-asc", "day-desc", "name-asc", "amount-desc"]);
const BILL_SORT_OPTIONS = new Set(["due-asc", "due-desc", "amount-desc", "amount-asc", "status"]);
const BILL_FILTER_OPTIONS = new Set(["all", "unpaid", "paid", "overdue", "due-soon", "upcoming"]);
const HISTORY_SORT_OPTIONS = new Set(["date-desc", "date-asc", "amount-desc", "amount-asc"]);
const HISTORY_FILTER_OPTIONS = new Set(["all", "add", "spend", "goal-update"]);
const INCOME_SORT_OPTIONS = new Set(["date-desc", "date-asc", "amount-desc", "amount-asc"]);
const ACTIVITY_SORT_OPTIONS = new Set(["date-desc", "date-asc"]);
const ACTIVITY_FILTER_OPTIONS = new Set(["all", "weekly", "subscription", "bill", "goal", "income"]);

const GOAL_HISTORY_TYPES = new Set(["add", "spend", "goal-update"]);
const ACTIVITY_TYPES = new Set(["weekly", "subscription", "bill", "goal", "income"]);

const defaultUi = {
  weeklySort: "date-desc",
  weeklySearch: "",
  subscriptionSort: "day-asc",
  subscriptionFilter: "",
  billSort: "due-asc",
  billFilter: "all",
  billSearch: "",
  historySort: "date-desc",
  historyFilter: "all",
  incomeSort: "date-desc",
  incomeFilter: "",
  activitySort: "date-desc",
  activityFilter: "all",
  activitySearch: ""
};

function buildDefaultData() {
  return {
    weeklyEntries: [],
    subscriptions: [
      { id: createId(), name: "Netflix", day: 4, amount: 15.49 },
      { id: createId(), name: "Spotify", day: 13, amount: 10.99 },
      { id: createId(), name: "YouTube Premium", day: 22, amount: 13.99 }
    ],
    bills: [
      { id: createId(), name: "Electricity", dueDate: toISODate(addDays(today, 4)), amount: 92.4, paid: false },
      { id: createId(), name: "Water", dueDate: toISODate(addDays(today, 9)), amount: 46.75, paid: false },
      { id: createId(), name: "Internet", dueDate: toISODate(addDays(today, 14)), amount: 64.0, paid: false }
    ],
    incomeEntries: [],
    goal: {
      item: "Laptop",
      target: 1200,
      saved: 0,
      history: []
    },
    budget: {
      weeklyCap: 0
    },
    activity: [],
    calendarView: {
      month: today.getMonth(),
      year: today.getFullYear()
    },
    ui: { ...defaultUi }
  };
}

const defaultData = buildDefaultData();
const data = loadData();
let undoStack = [];

const refs = {
  exportData: document.getElementById("export-data"),
  importData: document.getElementById("import-data"),
  undoAction: document.getElementById("undo-action"),
  resetData: document.getElementById("reset-data"),
  dataMessage: document.getElementById("data-message"),
  snapshotSubTotal: document.getElementById("snapshot-sub-total"),
  snapshotBillTotal: document.getElementById("snapshot-bill-total"),
  snapshotNextBill: document.getElementById("snapshot-next-bill"),
  snapshotGoalLeft: document.getElementById("snapshot-goal-left"),
  snapshotNet: document.getElementById("snapshot-net"),
  snapshotSpendTrend: document.getElementById("snapshot-spend-trend"),
  activityFilter: document.getElementById("activity-filter"),
  activitySort: document.getElementById("activity-sort"),
  activitySearch: document.getElementById("activity-search"),
  clearActivity: document.getElementById("clear-activity"),
  activityList: document.getElementById("activity-list"),
  weeklyForm: document.getElementById("weekly-form"),
  weeklyDate: document.getElementById("weekly-date"),
  weeklyAmount: document.getElementById("weekly-amount"),
  weeklySort: document.getElementById("weekly-sort"),
  weeklySearch: document.getElementById("weekly-search"),
  clearWeekly: document.getElementById("clear-weekly"),
  weeklyCap: document.getElementById("weekly-cap"),
  setWeeklyCap: document.getElementById("set-weekly-cap"),
  clearWeeklyCap: document.getElementById("clear-weekly-cap"),
  weeklyCapStatus: document.getElementById("weekly-cap-status"),
  weeklyList: document.getElementById("weekly-list"),
  weeklyChart: document.getElementById("weekly-chart"),
  monthlySpend: document.getElementById("monthly-spend"),
  weeklyAverage: document.getElementById("weekly-average"),
  prevMonth: document.getElementById("prev-month"),
  nextMonth: document.getElementById("next-month"),
  calendarMonth: document.getElementById("calendar-month"),
  calendarGrid: document.getElementById("calendar-grid"),
  subscriptionForm: document.getElementById("subscription-form"),
  subName: document.getElementById("sub-name"),
  subDay: document.getElementById("sub-day"),
  subAmount: document.getElementById("sub-amount"),
  subSort: document.getElementById("sub-sort"),
  subFilter: document.getElementById("sub-filter"),
  clearSubscriptions: document.getElementById("clear-subscriptions"),
  subscriptionList: document.getElementById("subscription-list"),
  billForm: document.getElementById("bill-form"),
  billName: document.getElementById("bill-name"),
  billDate: document.getElementById("bill-date"),
  billAmount: document.getElementById("bill-amount"),
  billSort: document.getElementById("bill-sort"),
  billFilter: document.getElementById("bill-filter"),
  billSearch: document.getElementById("bill-search"),
  clearPaid: document.getElementById("clear-paid"),
  billSummary: document.getElementById("bill-summary"),
  billList: document.getElementById("bill-list"),
  incomeForm: document.getElementById("income-form"),
  incomeDate: document.getElementById("income-date"),
  incomeSource: document.getElementById("income-source"),
  incomeAmount: document.getElementById("income-amount"),
  incomeSort: document.getElementById("income-sort"),
  incomeFilter: document.getElementById("income-filter"),
  clearIncome: document.getElementById("clear-income"),
  monthlyIncome: document.getElementById("monthly-income"),
  incomeAverage: document.getElementById("income-average"),
  incomeList: document.getElementById("income-list"),
  goalForm: document.getElementById("goal-form"),
  goalItem: document.getElementById("goal-item"),
  goalAmount: document.getElementById("goal-amount"),
  savingsForm: document.getElementById("savings-form"),
  savingsAmount: document.getElementById("savings-amount"),
  spendButton: document.getElementById("spend-button"),
  historySort: document.getElementById("history-sort"),
  historyFilter: document.getElementById("history-filter"),
  clearHistory: document.getElementById("clear-history"),
  goalHistory: document.getElementById("goal-history"),
  goalProgressShell: document.getElementById("goal-progress-shell"),
  progressFill: document.getElementById("progress-fill"),
  goalStatus: document.getElementById("goal-status"),
  goalMessage: document.getElementById("goal-message")
};

bootstrap();

function bootstrap() {
  refs.weeklyDate.value = isoToday;
  refs.billDate.value = isoToday;
  refs.incomeDate.value = isoToday;

  refs.exportData.addEventListener("click", onExportData);
  refs.importData.addEventListener("change", onImportData);
  refs.undoAction.addEventListener("click", onUndoAction);
  refs.resetData.addEventListener("click", onResetData);

  refs.activityFilter.addEventListener("change", onActivityFilterChange);
  refs.activitySort.addEventListener("change", onActivitySortChange);
  refs.activitySearch.addEventListener("input", onActivitySearchInput);
  refs.clearActivity.addEventListener("click", onClearActivity);

  refs.weeklyForm.addEventListener("submit", onWeeklySubmit);
  refs.weeklySort.addEventListener("change", onWeeklySortChange);
  refs.weeklySearch.addEventListener("input", onWeeklySearchInput);
  refs.clearWeekly.addEventListener("click", onClearWeeklyLogs);
  refs.setWeeklyCap.addEventListener("click", onSetWeeklyCap);
  refs.clearWeeklyCap.addEventListener("click", onClearWeeklyCap);

  refs.subscriptionForm.addEventListener("submit", onSubscriptionSubmit);
  refs.subSort.addEventListener("change", onSubSortChange);
  refs.subFilter.addEventListener("input", onSubFilterInput);
  refs.clearSubscriptions.addEventListener("click", onClearSubscriptions);

  refs.billForm.addEventListener("submit", onBillSubmit);
  refs.billSort.addEventListener("change", onBillSortChange);
  refs.billFilter.addEventListener("change", onBillFilterChange);
  refs.billSearch.addEventListener("input", onBillSearchInput);
  refs.clearPaid.addEventListener("click", onClearPaidBills);

  refs.incomeForm.addEventListener("submit", onIncomeSubmit);
  refs.incomeSort.addEventListener("change", onIncomeSortChange);
  refs.incomeFilter.addEventListener("input", onIncomeFilterInput);
  refs.clearIncome.addEventListener("click", onClearIncome);

  refs.goalForm.addEventListener("submit", onGoalSubmit);
  refs.savingsForm.addEventListener("submit", onSavingsAdd);
  refs.spendButton.addEventListener("click", () => adjustSavings(-1));
  refs.historySort.addEventListener("change", onHistorySortChange);
  refs.historyFilter.addEventListener("change", onHistoryFilterChange);
  refs.clearHistory.addEventListener("click", onClearHistory);

  refs.prevMonth.addEventListener("click", () => stepMonth(-1));
  refs.nextMonth.addEventListener("click", () => stepMonth(1));
  document.addEventListener("click", onDocumentClick);

  renderAll();
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return buildDefaultData();
    }
    const parsed = JSON.parse(raw);
    return normalizeData(parsed);
  } catch (error) {
    console.error("Could not load saved data:", error);
    return buildDefaultData();
  }
}

function normalizeData(source) {
  const state = source && typeof source === "object" && source.data && typeof source.data === "object"
    ? source.data
    : source;
  const safe = state && typeof state === "object" ? state : {};
  const defaults = buildDefaultData();

  const weeklyEntries = mapArray(safe.weeklyEntries, normalizeWeeklyEntry);
  const hasSubscriptionsArray = Array.isArray(safe.subscriptions);
  const hasBillsArray = Array.isArray(safe.bills);
  const subscriptions = mapArray(safe.subscriptions, normalizeSubscription);
  const bills = mapArray(safe.bills, normalizeBill);
  const incomeEntries = mapArray(safe.incomeEntries, normalizeIncomeEntry);

  const legacyLaptop = safe.laptop || {};
  const safeGoal = safe.goal && typeof safe.goal === "object" ? safe.goal : {};
  const goalItem = typeof safeGoal.item === "string" && safeGoal.item.trim() ? safeGoal.item.trim() : "Laptop";
  const goalTarget = Number(safeGoal.target) > 0
    ? roundMoney(Number(safeGoal.target))
    : (Number(legacyLaptop.goal) > 0 ? roundMoney(Number(legacyLaptop.goal)) : defaults.goal.target);
  const goalSaved = Number(safeGoal.saved) >= 0
    ? roundMoney(Number(safeGoal.saved))
    : (Number(legacyLaptop.saved) >= 0 ? roundMoney(Number(legacyLaptop.saved)) : defaults.goal.saved);
  const goalHistory = mapArray(safeGoal.history, normalizeGoalHistory);

  const safeBudget = safe.budget && typeof safe.budget === "object" ? safe.budget : {};
  const weeklyCap = Number(safeBudget.weeklyCap) > 0 ? roundMoney(Number(safeBudget.weeklyCap)) : 0;

  const activity = mapArray(safe.activity, normalizeActivity);

  const safeCalendar = safe.calendarView && typeof safe.calendarView === "object" ? safe.calendarView : {};
  const month = Number.isInteger(safeCalendar.month) && safeCalendar.month >= 0 && safeCalendar.month <= 11
    ? safeCalendar.month
    : defaults.calendarView.month;
  const year = Number.isInteger(safeCalendar.year) && safeCalendar.year >= 2000 && safeCalendar.year <= 2100
    ? safeCalendar.year
    : defaults.calendarView.year;

  const safeUi = safe.ui && typeof safe.ui === "object" ? safe.ui : {};
  const ui = {
    weeklySort: WEEKLY_SORT_OPTIONS.has(safeUi.weeklySort) ? safeUi.weeklySort : defaultUi.weeklySort,
    weeklySearch: typeof safeUi.weeklySearch === "string" ? safeUi.weeklySearch : defaultUi.weeklySearch,
    subscriptionSort: SUB_SORT_OPTIONS.has(safeUi.subscriptionSort) ? safeUi.subscriptionSort : defaultUi.subscriptionSort,
    subscriptionFilter: typeof safeUi.subscriptionFilter === "string" ? safeUi.subscriptionFilter : defaultUi.subscriptionFilter,
    billSort: BILL_SORT_OPTIONS.has(safeUi.billSort) ? safeUi.billSort : defaultUi.billSort,
    billFilter: BILL_FILTER_OPTIONS.has(safeUi.billFilter) ? safeUi.billFilter : defaultUi.billFilter,
    billSearch: typeof safeUi.billSearch === "string" ? safeUi.billSearch : defaultUi.billSearch,
    historySort: HISTORY_SORT_OPTIONS.has(safeUi.historySort) ? safeUi.historySort : defaultUi.historySort,
    historyFilter: HISTORY_FILTER_OPTIONS.has(safeUi.historyFilter) ? safeUi.historyFilter : defaultUi.historyFilter,
    incomeSort: INCOME_SORT_OPTIONS.has(safeUi.incomeSort) ? safeUi.incomeSort : defaultUi.incomeSort,
    incomeFilter: typeof safeUi.incomeFilter === "string" ? safeUi.incomeFilter : defaultUi.incomeFilter,
    activitySort: ACTIVITY_SORT_OPTIONS.has(safeUi.activitySort) ? safeUi.activitySort : defaultUi.activitySort,
    activityFilter: ACTIVITY_FILTER_OPTIONS.has(safeUi.activityFilter) ? safeUi.activityFilter : defaultUi.activityFilter,
    activitySearch: typeof safeUi.activitySearch === "string" ? safeUi.activitySearch : defaultUi.activitySearch
  };

  return {
    weeklyEntries,
    subscriptions: hasSubscriptionsArray ? subscriptions : defaults.subscriptions,
    bills: hasBillsArray ? bills : defaults.bills,
    incomeEntries,
    goal: {
      item: goalItem,
      target: goalTarget,
      saved: goalSaved,
      history: goalHistory
    },
    budget: {
      weeklyCap
    },
    activity,
    calendarView: { month, year },
    ui
  };
}

function normalizeWeeklyEntry(entry) {
  if (!entry || typeof entry !== "object") {
    return null;
  }
  const date = normalizeDateOnly(entry.date);
  const amount = Number(entry.amount);
  if (!date || !Number.isFinite(amount) || amount < 0) {
    return null;
  }
  return {
    id: typeof entry.id === "string" ? entry.id : createId(),
    date,
    amount: roundMoney(amount)
  };
}

function normalizeSubscription(entry) {
  if (!entry || typeof entry !== "object") {
    return null;
  }
  const name = typeof entry.name === "string" ? entry.name.trim() : "";
  const day = Number(entry.day);
  const amount = Number(entry.amount);
  if (!name || !Number.isInteger(day) || day < 1 || day > 31 || !Number.isFinite(amount) || amount < 0) {
    return null;
  }
  return {
    id: typeof entry.id === "string" ? entry.id : createId(),
    name,
    day,
    amount: roundMoney(amount)
  };
}

function normalizeBill(entry) {
  if (!entry || typeof entry !== "object") {
    return null;
  }
  const name = typeof entry.name === "string" ? entry.name.trim() : "";
  const dueDate = normalizeDateOnly(entry.dueDate);
  const amount = Number(entry.amount);
  if (!name || !dueDate || !Number.isFinite(amount) || amount < 0) {
    return null;
  }
  return {
    id: typeof entry.id === "string" ? entry.id : createId(),
    name,
    dueDate,
    amount: roundMoney(amount),
    paid: Boolean(entry.paid)
  };
}

function normalizeIncomeEntry(entry) {
  if (!entry || typeof entry !== "object") {
    return null;
  }
  const date = normalizeDateOnly(entry.date);
  const source = typeof entry.source === "string" ? entry.source.trim() : "";
  const amount = Number(entry.amount);
  if (!date || !source || !Number.isFinite(amount) || amount < 0) {
    return null;
  }
  return {
    id: typeof entry.id === "string" ? entry.id : createId(),
    date,
    source,
    amount: roundMoney(amount)
  };
}

function normalizeGoalHistory(entry) {
  if (!entry || typeof entry !== "object") {
    return null;
  }
  const type = typeof entry.type === "string" ? entry.type : "";
  const amount = Number(entry.amount);
  const balanceAfter = Number(entry.balanceAfter);
  const note = typeof entry.note === "string" ? entry.note : "";
  const date = typeof entry.date === "string" && isValidDate(entry.date) ? entry.date : new Date().toISOString();
  if (!GOAL_HISTORY_TYPES.has(type)) {
    return null;
  }
  return {
    id: typeof entry.id === "string" ? entry.id : createId(),
    type,
    amount: Number.isFinite(amount) && amount >= 0 ? roundMoney(amount) : 0,
    balanceAfter: Number.isFinite(balanceAfter) && balanceAfter >= 0 ? roundMoney(balanceAfter) : 0,
    note,
    date
  };
}

function normalizeActivity(entry) {
  if (!entry || typeof entry !== "object") {
    return null;
  }
  const category = typeof entry.category === "string" ? entry.category : "";
  const message = typeof entry.message === "string" ? entry.message : "";
  const amount = Number(entry.amount);
  const date = typeof entry.date === "string" && isValidDate(entry.date) ? entry.date : new Date().toISOString();
  if (!ACTIVITY_TYPES.has(category) || !message) {
    return null;
  }
  return {
    id: typeof entry.id === "string" ? entry.id : createId(),
    category,
    message,
    amount: Number.isFinite(amount) ? roundMoney(amount) : 0,
    date
  };
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function saveUndo(label) {
  undoStack.push({
    label,
    snapshot: JSON.stringify(data)
  });
  if (undoStack.length > UNDO_LIMIT) {
    undoStack = undoStack.slice(-UNDO_LIMIT);
  }
}

function restoreSnapshot(snapshot) {
  const parsed = JSON.parse(snapshot);
  const normalized = normalizeData(parsed);
  replaceState(normalized);
}

function renderAll() {
  syncControlValues();
  renderSnapshot();
  renderActivity();
  renderWeekly();
  renderSubscriptions();
  renderCalendar();
  renderBills();
  renderIncome();
  renderGoal();
}

function syncControlValues() {
  refs.weeklySort.value = data.ui.weeklySort;
  refs.weeklySearch.value = data.ui.weeklySearch;
  refs.subSort.value = data.ui.subscriptionSort;
  refs.subFilter.value = data.ui.subscriptionFilter;
  refs.billSort.value = data.ui.billSort;
  refs.billFilter.value = data.ui.billFilter;
  refs.billSearch.value = data.ui.billSearch;
  refs.historySort.value = data.ui.historySort;
  refs.historyFilter.value = data.ui.historyFilter;
  refs.incomeSort.value = data.ui.incomeSort;
  refs.incomeFilter.value = data.ui.incomeFilter;
  refs.activitySort.value = data.ui.activitySort;
  refs.activityFilter.value = data.ui.activityFilter;
  refs.activitySearch.value = data.ui.activitySearch;
  refs.weeklyCap.value = data.budget.weeklyCap > 0 ? String(data.budget.weeklyCap) : "";
}

function renderSnapshot() {
  const monthlySubTotal = data.subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
  const unpaidBills = data.bills.filter((bill) => !bill.paid);
  const unpaidTotal = unpaidBills.reduce((sum, bill) => sum + bill.amount, 0);
  const nextBill = [...unpaidBills].sort((a, b) => toDateValue(a.dueDate) - toDateValue(b.dueDate))[0];
  const remainingGoal = Math.max(0, roundMoney(data.goal.target - data.goal.saved));

  const monthlyIncome = sumCurrentMonth(data.incomeEntries, "date", "amount");
  const monthlySpending = sumCurrentMonth(data.weeklyEntries, "date", "amount");
  const monthlyBills = data.bills
    .filter((bill) => isCurrentMonth(bill.dueDate))
    .reduce((sum, bill) => sum + bill.amount, 0);
  const monthlyNet = roundMoney(monthlyIncome - monthlySpending - monthlySubTotal - monthlyBills);

  refs.snapshotSubTotal.textContent = CURRENCY.format(roundMoney(monthlySubTotal));
  refs.snapshotBillTotal.textContent = CURRENCY.format(roundMoney(unpaidTotal));
  refs.snapshotNextBill.textContent = nextBill ? `${nextBill.name} (${formatDate(nextBill.dueDate)})` : "None";
  refs.snapshotGoalLeft.textContent = CURRENCY.format(remainingGoal);
  refs.snapshotNet.textContent = `${monthlyNet >= 0 ? "+" : "-"}${CURRENCY.format(Math.abs(monthlyNet))}`;
  refs.snapshotSpendTrend.textContent = buildSpendTrendText();
}

function buildSpendTrendText() {
  if (data.weeklyEntries.length < 2) {
    return "No data yet";
  }
  const chronological = [...data.weeklyEntries].sort((a, b) => toDateValue(a.date) - toDateValue(b.date));
  const last4 = chronological.slice(-4);
  const prev4 = chronological.slice(-8, -4);
  if (!prev4.length) {
    return "Building history";
  }
  const lastAvg = averageOf(last4.map((entry) => entry.amount));
  const prevAvg = averageOf(prev4.map((entry) => entry.amount));
  if (prevAvg <= 0) {
    return "Tracking started";
  }
  const diff = lastAvg - prevAvg;
  const pct = Math.round((Math.abs(diff) / prevAvg) * 100);
  const direction = diff > 0 ? "up" : "down";
  return `${pct}% ${direction} vs previous 4 weeks`;
}

function renderActivity() {
  refs.activityList.innerHTML = "";
  const sort = data.ui.activitySort;
  const filter = data.ui.activityFilter;
  const query = data.ui.activitySearch.trim().toLowerCase();

  let shown = sortActivityEntries(data.activity, sort);
  shown = shown.filter((entry) => (filter === "all" ? true : entry.category === filter));
  if (query) {
    shown = shown.filter((entry) =>
      entry.message.toLowerCase().includes(query)
      || activityLabel(entry.category).toLowerCase().includes(query)
    );
  }

  if (!shown.length) {
    refs.activityList.innerHTML = `<li class="empty-state">No activity matches this view.</li>`;
    return;
  }

  shown.slice(0, 20).forEach((entry) => {
    const li = document.createElement("li");
    li.className = "list-item";
    const amountText = entry.amount > 0 ? ` | ${CURRENCY.format(entry.amount)}` : "";
    li.innerHTML = `
      <div class="item-main">
        <p class="item-title">${escapeHtml(entry.message)}</p>
        <p class="item-subtitle">${formatDateTime(entry.date)} | ${activityLabel(entry.category)}${amountText}</p>
      </div>
      <div style="display:grid;gap:0.32rem;justify-items:end;">
        <span class="pill goal">${activityLabel(entry.category)}</span>
        <button class="remove-btn" data-type="activity" data-id="${entry.id}" type="button">Delete</button>
      </div>
    `;
    refs.activityList.appendChild(li);
  });
}

function activityLabel(category) {
  switch (category) {
    case "weekly":
      return "Weekly";
    case "subscription":
      return "Subscription";
    case "bill":
      return "Bills";
    case "goal":
      return "Goal";
    case "income":
      return "Income";
    default:
      return "General";
  }
}

function onActivityFilterChange() {
  data.ui.activityFilter = refs.activityFilter.value;
  saveData();
  renderActivity();
}

function onActivitySortChange() {
  data.ui.activitySort = refs.activitySort.value;
  saveData();
  renderActivity();
}

function onActivitySearchInput() {
  data.ui.activitySearch = refs.activitySearch.value;
  saveData();
  renderActivity();
}

function onClearActivity() {
  if (!data.activity.length) {
    setDataMessage("Activity history is already empty.", "error");
    return;
  }
  saveUndo("Clear activity history");
  data.activity = [];
  saveData();
  renderAll();
  setDataMessage("Activity history cleared.", "success");
}

function onWeeklySubmit(event) {
  event.preventDefault();
  const date = refs.weeklyDate.value;
  const amount = Number(refs.weeklyAmount.value);
  if (!isValidDate(date) || !Number.isFinite(amount) || amount < 0) {
    return;
  }
  saveUndo("Add weekly spending entry");
  const safeAmount = roundMoney(amount);
  data.weeklyEntries.push({ id: createId(), date: normalizeDateOnly(date), amount: safeAmount });
  addActivity("weekly", `Logged weekly spend for ${formatDate(date)}`, safeAmount);
  refs.weeklyAmount.value = "";
  saveData();
  renderAll();
}

function onWeeklySortChange() {
  data.ui.weeklySort = refs.weeklySort.value;
  saveData();
  renderWeekly();
}

function onWeeklySearchInput() {
  data.ui.weeklySearch = refs.weeklySearch.value;
  saveData();
  renderWeekly();
}

function onClearWeeklyLogs() {
  if (!data.weeklyEntries.length) {
    setDataMessage("No weekly logs to clear.", "error");
    return;
  }
  saveUndo("Clear weekly logs");
  const count = data.weeklyEntries.length;
  data.weeklyEntries = [];
  addActivity("weekly", `Cleared ${count} weekly log${count > 1 ? "s" : ""}`, 0);
  saveData();
  renderAll();
  setDataMessage(`Cleared ${count} weekly log${count > 1 ? "s" : ""}.`, "success");
}

function onSetWeeklyCap() {
  const cap = Number(refs.weeklyCap.value);
  if (!Number.isFinite(cap) || cap <= 0) {
    setDataMessage("Enter a valid weekly cap greater than zero.", "error");
    return;
  }
  saveUndo("Set weekly cap");
  data.budget.weeklyCap = roundMoney(cap);
  addActivity("weekly", "Updated weekly spending cap", data.budget.weeklyCap);
  saveData();
  renderAll();
  setDataMessage("Weekly spending cap saved.", "success");
}

function onClearWeeklyCap() {
  if (data.budget.weeklyCap <= 0) {
    setDataMessage("No weekly cap is currently set.", "error");
    return;
  }
  saveUndo("Clear weekly cap");
  data.budget.weeklyCap = 0;
  addActivity("weekly", "Cleared weekly spending cap", 0);
  saveData();
  renderAll();
  setDataMessage("Weekly cap removed.", "success");
}

function renderWeekly() {
  refs.weeklyList.innerHTML = "";
  const query = data.ui.weeklySearch.trim().toLowerCase();
  let shown = sortWeeklyEntries(data.weeklyEntries, data.ui.weeklySort);

  if (query) {
    shown = shown.filter((entry) =>
      formatDate(entry.date).toLowerCase().includes(query)
      || CURRENCY.format(entry.amount).toLowerCase().includes(query)
      || String(entry.amount).includes(query)
    );
  }

  if (!shown.length) {
    refs.weeklyList.innerHTML = `<li class="empty-state">No weekly totals match this filter.</li>`;
  } else {
    shown.forEach((entry) => {
      const li = document.createElement("li");
      li.className = "list-item";
      li.innerHTML = `
        <div class="item-main">
          <p class="item-title">${formatDate(entry.date)}</p>
          <p class="item-subtitle">Weekly total</p>
        </div>
        <div style="display:grid;gap:0.32rem;justify-items:end;">
          <strong>${CURRENCY.format(entry.amount)}</strong>
          <button class="remove-btn" data-type="weekly" data-id="${entry.id}" type="button">Delete</button>
        </div>
      `;
      refs.weeklyList.appendChild(li);
    });
  }

  const monthTotal = sumCurrentMonth(data.weeklyEntries, "date", "amount");
  const average = data.weeklyEntries.length ? averageOf(data.weeklyEntries.map((entry) => entry.amount)) : 0;
  refs.monthlySpend.textContent = CURRENCY.format(roundMoney(monthTotal));
  refs.weeklyAverage.textContent = CURRENCY.format(roundMoney(average));
  renderWeeklyCapStatus();
  renderWeeklyChart();
}

function renderWeeklyCapStatus() {
  const cap = data.budget.weeklyCap;
  if (cap <= 0) {
    refs.weeklyCapStatus.textContent = "No weekly cap set.";
    return;
  }
  const latest = [...data.weeklyEntries].sort((a, b) => toDateValue(b.date) - toDateValue(a.date))[0];
  if (!latest) {
    refs.weeklyCapStatus.textContent = `Cap set to ${CURRENCY.format(cap)}. Add a weekly log to compare.`;
    return;
  }
  const diff = roundMoney(cap - latest.amount);
  if (diff >= 0) {
    refs.weeklyCapStatus.textContent = `Latest week ${CURRENCY.format(latest.amount)} is ${CURRENCY.format(diff)} under your ${CURRENCY.format(cap)} cap.`;
  } else {
    refs.weeklyCapStatus.textContent = `Latest week ${CURRENCY.format(latest.amount)} is ${CURRENCY.format(Math.abs(diff))} over your ${CURRENCY.format(cap)} cap.`;
  }
}

function renderWeeklyChart() {
  refs.weeklyChart.innerHTML = "";
  const recent = [...data.weeklyEntries]
    .sort((a, b) => toDateValue(a.date) - toDateValue(b.date))
    .slice(-8);
  if (!recent.length) {
    refs.weeklyChart.innerHTML = `<p class="chart-empty">No chart data yet</p>`;
    return;
  }
  const maxValue = Math.max(...recent.map((entry) => entry.amount), 1);
  recent.forEach((entry) => {
    const bar = document.createElement("div");
    bar.className = "chart-bar";
    bar.style.height = `${Math.max(10, Math.round((entry.amount / maxValue) * 100))}%`;
    bar.title = `${formatDate(entry.date)} | ${CURRENCY.format(entry.amount)}`;
    refs.weeklyChart.appendChild(bar);
  });
}

function onSubscriptionSubmit(event) {
  event.preventDefault();
  const name = refs.subName.value.trim();
  const day = Number(refs.subDay.value);
  const amount = Number(refs.subAmount.value);
  if (!name || !Number.isInteger(day) || day < 1 || day > 31 || !Number.isFinite(amount) || amount < 0) {
    return;
  }
  saveUndo("Add subscription");
  const safeAmount = roundMoney(amount);
  data.subscriptions.push({ id: createId(), name, day, amount: safeAmount });
  addActivity("subscription", `Added subscription: ${name} on day ${day}`, safeAmount);
  refs.subscriptionForm.reset();
  saveData();
  renderAll();
}

function onSubSortChange() {
  data.ui.subscriptionSort = refs.subSort.value;
  saveData();
  renderSubscriptions();
}

function onSubFilterInput() {
  data.ui.subscriptionFilter = refs.subFilter.value;
  saveData();
  renderSubscriptions();
}

function onClearSubscriptions() {
  if (!data.subscriptions.length) {
    setDataMessage("No subscriptions to clear.", "error");
    return;
  }
  saveUndo("Clear subscriptions");
  const count = data.subscriptions.length;
  data.subscriptions = [];
  addActivity("subscription", `Cleared ${count} subscription${count > 1 ? "s" : ""}`, 0);
  saveData();
  renderAll();
  setDataMessage(`Cleared ${count} subscription${count > 1 ? "s" : ""}.`, "success");
}

function renderSubscriptions() {
  refs.subscriptionList.innerHTML = "";
  const query = data.ui.subscriptionFilter.trim().toLowerCase();
  let shown = sortSubscriptionEntries(data.subscriptions, data.ui.subscriptionSort);
  if (query) {
    shown = shown.filter((sub) => sub.name.toLowerCase().includes(query));
  }
  if (!shown.length) {
    refs.subscriptionList.innerHTML = `<li class="empty-state">No subscriptions match this filter.</li>`;
    return;
  }
  shown.forEach((sub) => {
    const li = document.createElement("li");
    li.className = "list-item";
    const nextCharge = getNextChargeDate(sub.day);
    li.innerHTML = `
      <div class="item-main">
        <p class="item-title">${escapeHtml(sub.name)} | ${CURRENCY.format(sub.amount)}</p>
        <p class="item-subtitle">Charges on day ${sub.day} | Next: ${formatDate(nextCharge)}</p>
      </div>
      <button class="remove-btn" data-type="sub" data-id="${sub.id}" type="button">Delete</button>
    `;
    refs.subscriptionList.appendChild(li);
  });
}

function renderCalendar() {
  const month = data.calendarView.month;
  const year = data.calendarView.year;
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const weekdayOffset = first.getDay();
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  refs.calendarMonth.textContent = first.toLocaleString("en-US", { month: "long", year: "numeric" });
  refs.calendarGrid.innerHTML = "";

  names.forEach((name) => {
    const label = document.createElement("div");
    label.className = "day-label";
    label.textContent = name;
    refs.calendarGrid.appendChild(label);
  });

  for (let i = 0; i < weekdayOffset; i += 1) {
    const filler = document.createElement("div");
    filler.className = "calendar-cell muted";
    refs.calendarGrid.appendChild(filler);
  }

  for (let day = 1; day <= days; day += 1) {
    const cell = document.createElement("div");
    cell.className = "calendar-cell";
    const now = new Date();
    const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
    if (isToday) {
      cell.classList.add("today");
    }

    const number = document.createElement("span");
    number.className = "day-number";
    number.textContent = String(day);
    cell.appendChild(number);

    const events = data.subscriptions.filter((sub) => Math.min(sub.day, days) === day);
    events.forEach((sub) => {
      const chip = document.createElement("span");
      chip.className = "event-chip";
      chip.textContent = `${sub.name} ${CURRENCY.format(sub.amount)}`;
      cell.appendChild(chip);
    });

    refs.calendarGrid.appendChild(cell);
  }
}

function stepMonth(offset) {
  const date = new Date(data.calendarView.year, data.calendarView.month + offset, 1);
  data.calendarView.month = date.getMonth();
  data.calendarView.year = date.getFullYear();
  saveData();
  renderCalendar();
}

function onBillSubmit(event) {
  event.preventDefault();
  const name = refs.billName.value.trim();
  const dueDate = normalizeDateOnly(refs.billDate.value);
  const amount = Number(refs.billAmount.value);
  if (!name || !dueDate || !Number.isFinite(amount) || amount < 0) {
    return;
  }
  saveUndo("Add bill");
  const safeAmount = roundMoney(amount);
  data.bills.push({ id: createId(), name, dueDate, amount: safeAmount, paid: false });
  addActivity("bill", `Added bill: ${name} due ${formatDate(dueDate)}`, safeAmount);
  refs.billForm.reset();
  refs.billDate.value = isoToday;
  saveData();
  renderAll();
}

function onBillSortChange() {
  data.ui.billSort = refs.billSort.value;
  saveData();
  renderBills();
}

function onBillFilterChange() {
  data.ui.billFilter = refs.billFilter.value;
  saveData();
  renderBills();
}

function onBillSearchInput() {
  data.ui.billSearch = refs.billSearch.value;
  saveData();
  renderBills();
}

function onClearPaidBills() {
  const paidCount = data.bills.filter((bill) => bill.paid).length;
  if (!paidCount) {
    setDataMessage("No paid bills to clear.", "error");
    return;
  }
  saveUndo("Clear paid bills");
  data.bills = data.bills.filter((bill) => !bill.paid);
  addActivity("bill", `Cleared ${paidCount} paid bill${paidCount > 1 ? "s" : ""}`, 0);
  saveData();
  renderAll();
  setDataMessage(`Cleared ${paidCount} paid bill${paidCount > 1 ? "s" : ""}.`, "success");
}

function renderBills() {
  refs.billList.innerHTML = "";
  let shown = filterBills(data.bills, data.ui.billFilter);
  shown = sortBillEntries(shown, data.ui.billSort);
  const query = data.ui.billSearch.trim().toLowerCase();
  if (query) {
    shown = shown.filter((bill) => bill.name.toLowerCase().includes(query));
  }

  const totalCount = data.bills.length;
  const paidCount = data.bills.filter((bill) => bill.paid).length;
  refs.billSummary.textContent = `${shown.length} shown | ${totalCount} total | ${paidCount} paid`;

  if (!shown.length) {
    refs.billList.innerHTML = `<li class="empty-state">No bills match this view.</li>`;
    return;
  }

  shown.forEach((bill) => {
    const li = document.createElement("li");
    li.className = "list-item bill-item";
    if (bill.paid) {
      li.classList.add("paid");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = bill.paid;
    checkbox.addEventListener("change", () => {
      saveUndo("Toggle bill paid status");
      bill.paid = checkbox.checked;
      addActivity("bill", `${bill.paid ? "Marked paid" : "Marked unpaid"}: ${bill.name}`, bill.amount);
      saveData();
      renderAll();
    });

    const main = document.createElement("div");
    main.className = "item-main";
    main.innerHTML = `
      <p class="item-title">${escapeHtml(bill.name)} | ${CURRENCY.format(bill.amount)}</p>
      <p class="item-subtitle">Due ${formatDate(bill.dueDate)}</p>
    `;

    const dueTag = document.createElement("span");
    dueTag.className = `pill ${billTagClass(bill)}`;
    dueTag.textContent = billTagText(bill);

    const right = document.createElement("div");
    right.style.display = "grid";
    right.style.gap = "0.32rem";
    right.style.justifyItems = "end";
    right.innerHTML = `<button class="remove-btn" data-type="bill" data-id="${bill.id}" type="button">Delete</button>`;
    right.prepend(dueTag);

    li.append(checkbox, main, right);
    refs.billList.appendChild(li);
  });
}

function onIncomeSubmit(event) {
  event.preventDefault();
  const date = normalizeDateOnly(refs.incomeDate.value);
  const source = refs.incomeSource.value.trim();
  const amount = Number(refs.incomeAmount.value);
  if (!date || !source || !Number.isFinite(amount) || amount < 0) {
    return;
  }
  saveUndo("Add income entry");
  const safeAmount = roundMoney(amount);
  data.incomeEntries.push({ id: createId(), date, source, amount: safeAmount });
  addActivity("income", `Logged income from ${source}`, safeAmount);
  refs.incomeForm.reset();
  refs.incomeDate.value = isoToday;
  saveData();
  renderAll();
}

function onIncomeSortChange() {
  data.ui.incomeSort = refs.incomeSort.value;
  saveData();
  renderIncome();
}

function onIncomeFilterInput() {
  data.ui.incomeFilter = refs.incomeFilter.value;
  saveData();
  renderIncome();
}

function onClearIncome() {
  if (!data.incomeEntries.length) {
    setDataMessage("No income entries to clear.", "error");
    return;
  }
  saveUndo("Clear income entries");
  const count = data.incomeEntries.length;
  data.incomeEntries = [];
  addActivity("income", `Cleared ${count} income entr${count > 1 ? "ies" : "y"}`, 0);
  saveData();
  renderAll();
  setDataMessage(`Cleared ${count} income entr${count > 1 ? "ies" : "y"}.`, "success");
}

function renderIncome() {
  refs.incomeList.innerHTML = "";
  const monthIncome = sumCurrentMonth(data.incomeEntries, "date", "amount");
  const avg = data.incomeEntries.length ? averageOf(data.incomeEntries.map((entry) => entry.amount)) : 0;
  refs.monthlyIncome.textContent = CURRENCY.format(roundMoney(monthIncome));
  refs.incomeAverage.textContent = CURRENCY.format(roundMoney(avg));

  const query = data.ui.incomeFilter.trim().toLowerCase();
  let shown = sortIncomeEntries(data.incomeEntries, data.ui.incomeSort);
  if (query) {
    shown = shown.filter((entry) => entry.source.toLowerCase().includes(query));
  }

  if (!shown.length) {
    refs.incomeList.innerHTML = `<li class="empty-state">No income entries match this view.</li>`;
    return;
  }

  shown.forEach((entry) => {
    const li = document.createElement("li");
    li.className = "list-item";
    li.innerHTML = `
      <div class="item-main">
        <p class="item-title">${escapeHtml(entry.source)} | ${CURRENCY.format(entry.amount)}</p>
        <p class="item-subtitle">${formatDate(entry.date)}</p>
      </div>
      <button class="remove-btn" data-type="income" data-id="${entry.id}" type="button">Delete</button>
    `;
    refs.incomeList.appendChild(li);
  });
}

function onGoalSubmit(event) {
  event.preventDefault();
  const item = refs.goalItem.value.trim();
  const target = Number(refs.goalAmount.value);
  if (!item || !Number.isFinite(target) || target <= 0) {
    return;
  }
  saveUndo("Update goal");
  const safeTarget = roundMoney(target);
  const changed = item !== data.goal.item || safeTarget !== data.goal.target;
  data.goal.item = item;
  data.goal.target = safeTarget;

  if (changed) {
    addGoalHistory("goal-update", safeTarget, `Goal set to ${item}`, data.goal.saved);
    addActivity("goal", `Updated goal to ${item}`, safeTarget);
  }
  saveData();
  renderAll();
}

function onSavingsAdd(event) {
  event.preventDefault();
  adjustSavings(1);
}

function adjustSavings(direction) {
  const amount = Number(refs.savingsAmount.value);
  if (!Number.isFinite(amount) || amount <= 0) {
    return;
  }

  const safeAmount = roundMoney(amount);
  const change = direction > 0 ? safeAmount : Math.min(safeAmount, data.goal.saved);
  if (change <= 0) {
    setDataMessage("No money available to remove from the goal fund.", "error");
    return;
  }

  saveUndo(direction > 0 ? "Add to goal fund" : "Spend from goal fund");
  if (direction > 0) {
    data.goal.saved = roundMoney(data.goal.saved + change);
    addGoalHistory("add", change, `Added to ${data.goal.item} fund`, data.goal.saved);
    addActivity("goal", `Added money to ${data.goal.item} fund`, change);
  } else {
    data.goal.saved = roundMoney(Math.max(0, data.goal.saved - change));
    addGoalHistory("spend", change, `Spent from ${data.goal.item} fund`, data.goal.saved);
    addActivity("goal", `Spent from ${data.goal.item} fund`, change);
  }

  refs.savingsForm.reset();
  saveData();
  renderAll();
}

function onHistorySortChange() {
  data.ui.historySort = refs.historySort.value;
  saveData();
  renderGoalHistory();
}

function onHistoryFilterChange() {
  data.ui.historyFilter = refs.historyFilter.value;
  saveData();
  renderGoalHistory();
}

function onClearHistory() {
  if (!data.goal.history.length) {
    setDataMessage("Goal history is already empty.", "error");
    return;
  }
  saveUndo("Clear goal history");
  data.goal.history = [];
  addActivity("goal", "Cleared goal history", 0);
  saveData();
  renderAll();
  setDataMessage("Goal history cleared.", "success");
}

function renderGoal() {
  const item = data.goal.item || "Goal";
  const target = data.goal.target > 0 ? data.goal.target : defaultData.goal.target;
  const saved = data.goal.saved >= 0 ? data.goal.saved : 0;
  const ratio = Math.max(0, Math.min(saved / target, 1));
  const percent = Math.round(ratio * 100);

  refs.goalItem.value = item;
  refs.goalAmount.value = String(target);
  refs.goalStatus.textContent = `${CURRENCY.format(saved)} saved for ${item} of ${CURRENCY.format(target)} (${percent}%)`;
  refs.goalProgressShell.setAttribute("aria-valuemax", String(target));
  refs.goalProgressShell.setAttribute("aria-valuenow", String(saved));
  refs.goalProgressShell.setAttribute("aria-label", `${item} savings goal progress`);
  refs.progressFill.style.width = `${percent}%`;
  refs.progressFill.classList.toggle("goal-hit", ratio >= 1);

  if (ratio >= 1) {
    refs.goalMessage.textContent = `${item} unlocked. You did it.`;
  } else if (ratio >= 0.75) {
    refs.goalMessage.textContent = `Final stretch for ${item}. Stay focused.`;
  } else if (ratio >= 0.4) {
    refs.goalMessage.textContent = `Great momentum toward ${item}. Keep stacking.`;
  } else {
    refs.goalMessage.textContent = `Every dollar moved here gets you closer to ${item}.`;
  }

  renderGoalHistory();
}

function renderGoalHistory() {
  refs.goalHistory.innerHTML = "";
  let shown = [...data.goal.history];
  if (data.ui.historyFilter !== "all") {
    shown = shown.filter((entry) => entry.type === data.ui.historyFilter);
  }
  shown = sortGoalHistory(shown, data.ui.historySort);

  if (!shown.length) {
    refs.goalHistory.innerHTML = `<li class="empty-state">No goal history yet. Add or spend from your goal fund.</li>`;
    return;
  }

  shown.slice(0, 24).forEach((entry) => {
    const li = document.createElement("li");
    li.className = "list-item";
    li.innerHTML = `
      <div class="item-main">
        <p class="item-title">${escapeHtml(goalHistoryTitle(entry))}</p>
        <p class="item-subtitle">${formatDateTime(entry.date)} | Balance: ${CURRENCY.format(entry.balanceAfter)}</p>
      </div>
      <div style="display:grid;gap:0.32rem;justify-items:end;">
        <span class="pill goal">${goalHistoryLabel(entry.type)}</span>
        <button class="remove-btn" data-type="goal-history" data-id="${entry.id}" type="button">Delete</button>
      </div>
    `;
    refs.goalHistory.appendChild(li);
  });
}

function goalHistoryTitle(entry) {
  if (entry.type === "add") {
    return `Added ${CURRENCY.format(entry.amount)} (${entry.note})`;
  }
  if (entry.type === "spend") {
    return `Spent ${CURRENCY.format(entry.amount)} (${entry.note})`;
  }
  return `${entry.note} (${CURRENCY.format(entry.amount)})`;
}

function goalHistoryLabel(type) {
  if (type === "add") {
    return "Add";
  }
  if (type === "spend") {
    return "Spend";
  }
  return "Goal";
}

function onExportData() {
  const payload = {
    app: "Budget Crew HQ",
    version: 3,
    exportedAt: new Date().toISOString(),
    data
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `budget-crew-backup-${toISODate(new Date())}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  setDataMessage("Backup exported successfully.", "success");
}

async function onImportData(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const normalized = normalizeData(parsed);
    saveUndo("Import backup");
    replaceState(normalized);
    saveData();
    renderAll();
    setDataMessage(`Imported backup from ${file.name}.`, "success");
  } catch (error) {
    console.error("Import failed", error);
    setDataMessage("Import failed. Please choose a valid backup JSON file.", "error");
  } finally {
    refs.importData.value = "";
  }
}

function onUndoAction() {
  const previous = undoStack.pop();
  if (!previous) {
    setDataMessage("Nothing to undo yet.", "error");
    return;
  }
  try {
    restoreSnapshot(previous.snapshot);
    saveData();
    renderAll();
    setDataMessage(`Undid: ${previous.label}.`, "success");
  } catch (error) {
    console.error("Undo failed", error);
    setDataMessage("Undo failed for that action.", "error");
  }
}

function onResetData() {
  saveUndo("Reset all data");
  replaceState(buildDefaultData());
  saveData();
  renderAll();
  setDataMessage("All data reset to defaults.", "success");
}

function replaceState(next) {
  data.weeklyEntries = next.weeklyEntries;
  data.subscriptions = next.subscriptions;
  data.bills = next.bills;
  data.incomeEntries = next.incomeEntries;
  data.goal = next.goal;
  data.budget = next.budget;
  data.activity = next.activity;
  data.calendarView = next.calendarView;
  data.ui = next.ui;
}

function onDocumentClick(event) {
  const button = event.target.closest(".remove-btn");
  if (!button) {
    return;
  }
  const id = button.dataset.id;
  const type = button.dataset.type;
  if (!id || !type) {
    return;
  }

  if (type === "activity") {
    saveUndo("Delete activity entry");
    data.activity = data.activity.filter((entry) => entry.id !== id);
    saveData();
    renderAll();
    return;
  }

  saveUndo(`Delete ${type} entry`);

  if (type === "weekly") {
    const existing = data.weeklyEntries.find((entry) => entry.id === id);
    data.weeklyEntries = data.weeklyEntries.filter((entry) => entry.id !== id);
    if (existing) {
      addActivity("weekly", `Removed weekly log for ${formatDate(existing.date)}`, existing.amount);
    }
  } else if (type === "sub") {
    const existing = data.subscriptions.find((entry) => entry.id === id);
    data.subscriptions = data.subscriptions.filter((entry) => entry.id !== id);
    if (existing) {
      addActivity("subscription", `Removed subscription: ${existing.name}`, existing.amount);
    }
  } else if (type === "bill") {
    const existing = data.bills.find((entry) => entry.id === id);
    data.bills = data.bills.filter((entry) => entry.id !== id);
    if (existing) {
      addActivity("bill", `Removed bill: ${existing.name}`, existing.amount);
    }
  } else if (type === "income") {
    const existing = data.incomeEntries.find((entry) => entry.id === id);
    data.incomeEntries = data.incomeEntries.filter((entry) => entry.id !== id);
    if (existing) {
      addActivity("income", `Removed income from ${existing.source}`, existing.amount);
    }
  } else if (type === "goal-history") {
    data.goal.history = data.goal.history.filter((entry) => entry.id !== id);
    addActivity("goal", "Deleted one goal history entry", 0);
  }

  saveData();
  renderAll();
}

function addGoalHistory(type, amount, note, balanceAfter) {
  data.goal.history.push({
    id: createId(),
    type,
    amount: roundMoney(amount),
    balanceAfter: roundMoney(balanceAfter),
    note,
    date: new Date().toISOString()
  });
  if (data.goal.history.length > 300) {
    data.goal.history = data.goal.history.slice(-300);
  }
}

function addActivity(category, message, amount) {
  data.activity.push({
    id: createId(),
    category,
    message,
    amount: roundMoney(Math.max(0, Number(amount) || 0)),
    date: new Date().toISOString()
  });
  if (data.activity.length > 400) {
    data.activity = data.activity.slice(-400);
  }
}

function sortWeeklyEntries(entries, sortKey) {
  const items = [...entries];
  if (sortKey === "date-asc") {
    return items.sort((a, b) => toDateValue(a.date) - toDateValue(b.date));
  }
  if (sortKey === "amount-desc") {
    return items.sort((a, b) => b.amount - a.amount);
  }
  if (sortKey === "amount-asc") {
    return items.sort((a, b) => a.amount - b.amount);
  }
  return items.sort((a, b) => toDateValue(b.date) - toDateValue(a.date));
}

function sortSubscriptionEntries(entries, sortKey) {
  const items = [...entries];
  if (sortKey === "day-desc") {
    return items.sort((a, b) => b.day - a.day);
  }
  if (sortKey === "name-asc") {
    return items.sort((a, b) => a.name.localeCompare(b.name));
  }
  if (sortKey === "amount-desc") {
    return items.sort((a, b) => b.amount - a.amount);
  }
  return items.sort((a, b) => a.day - b.day);
}

function filterBills(entries, filterKey) {
  const now = new Date();
  if (filterKey === "unpaid") {
    return entries.filter((bill) => !bill.paid);
  }
  if (filterKey === "paid") {
    return entries.filter((bill) => bill.paid);
  }
  if (filterKey === "overdue") {
    return entries.filter((bill) => !bill.paid && daysUntil(bill.dueDate, now) < 0);
  }
  if (filterKey === "due-soon") {
    return entries.filter((bill) => {
      const diff = daysUntil(bill.dueDate, now);
      return !bill.paid && diff >= 0 && diff <= 3;
    });
  }
  if (filterKey === "upcoming") {
    return entries.filter((bill) => !bill.paid && daysUntil(bill.dueDate, now) > 3);
  }
  return [...entries];
}

function sortBillEntries(entries, sortKey) {
  const items = [...entries];
  if (sortKey === "due-desc") {
    return items.sort((a, b) => toDateValue(b.dueDate) - toDateValue(a.dueDate));
  }
  if (sortKey === "amount-desc") {
    return items.sort((a, b) => b.amount - a.amount);
  }
  if (sortKey === "amount-asc") {
    return items.sort((a, b) => a.amount - b.amount);
  }
  if (sortKey === "status") {
    return items.sort((a, b) => {
      if (a.paid !== b.paid) {
        return Number(a.paid) - Number(b.paid);
      }
      return toDateValue(a.dueDate) - toDateValue(b.dueDate);
    });
  }
  return items.sort((a, b) => toDateValue(a.dueDate) - toDateValue(b.dueDate));
}

function sortIncomeEntries(entries, sortKey) {
  const items = [...entries];
  if (sortKey === "date-asc") {
    return items.sort((a, b) => toDateValue(a.date) - toDateValue(b.date));
  }
  if (sortKey === "amount-desc") {
    return items.sort((a, b) => b.amount - a.amount);
  }
  if (sortKey === "amount-asc") {
    return items.sort((a, b) => a.amount - b.amount);
  }
  return items.sort((a, b) => toDateValue(b.date) - toDateValue(a.date));
}

function sortGoalHistory(entries, sortKey) {
  const items = [...entries];
  if (sortKey === "date-asc") {
    return items.sort((a, b) => toDateValue(a.date) - toDateValue(b.date));
  }
  if (sortKey === "amount-desc") {
    return items.sort((a, b) => b.amount - a.amount);
  }
  if (sortKey === "amount-asc") {
    return items.sort((a, b) => a.amount - b.amount);
  }
  return items.sort((a, b) => toDateValue(b.date) - toDateValue(a.date));
}

function sortActivityEntries(entries, sortKey) {
  const items = [...entries];
  if (sortKey === "date-asc") {
    return items.sort((a, b) => toDateValue(a.date) - toDateValue(b.date));
  }
  return items.sort((a, b) => toDateValue(b.date) - toDateValue(a.date));
}

function billTagClass(bill) {
  if (bill.paid) {
    return "ok";
  }
  const diff = daysUntil(bill.dueDate);
  if (diff < 0) {
    return "overdue";
  }
  if (diff <= 3) {
    return "soon";
  }
  return "ok";
}

function billTagText(bill) {
  if (bill.paid) {
    return "Paid";
  }
  const diff = daysUntil(bill.dueDate);
  if (diff < 0) {
    return "Overdue";
  }
  if (diff === 0) {
    return "Due today";
  }
  if (diff <= 3) {
    return `Due in ${diff}d`;
  }
  return "Upcoming";
}

function getNextChargeDate(day) {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();
  let maxDay = new Date(year, month + 1, 0).getDate();
  let targetDay = Math.min(day, maxDay);
  let candidate = new Date(year, month, targetDay);
  if (candidate < startOfDay(now)) {
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
    maxDay = new Date(year, month + 1, 0).getDate();
    targetDay = Math.min(day, maxDay);
    candidate = new Date(year, month, targetDay);
  }
  return candidate;
}

function setDataMessage(message, type) {
  refs.dataMessage.textContent = message;
  refs.dataMessage.classList.remove("success", "error");
  if (type === "success" || type === "error") {
    refs.dataMessage.classList.add(type);
  }
}

function sumCurrentMonth(entries, dateKey, amountKey) {
  const now = new Date();
  return roundMoney(entries.reduce((sum, entry) => {
    const date = parseDateLike(entry[dateKey]);
    const isMatch = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    return isMatch ? sum + Number(entry[amountKey] || 0) : sum;
  }, 0));
}

function isCurrentMonth(dateLike) {
  const now = new Date();
  const date = parseDateLike(dateLike);
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

function mapArray(value, mapper) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map(mapper).filter(Boolean);
}

function averageOf(values) {
  if (!values.length) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function isValidDate(value) {
  if (typeof value !== "string" && !(value instanceof Date)) {
    return false;
  }
  const test = new Date(value);
  return !Number.isNaN(test.getTime());
}

function daysUntil(dateLike, referenceDate = new Date()) {
  const due = startOfDay(parseDateLike(dateLike));
  const nowDay = startOfDay(referenceDate);
  return Math.round((due - nowDay) / 86400000);
}

function formatDate(dateLike) {
  return parseDateLike(dateLike).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function formatDateTime(dateLike) {
  return parseDateLike(dateLike).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function normalizeDateOnly(value) {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return toISODate(parsed);
}

function parseDateLike(value) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(value);
}

function toDateValue(value) {
  return parseDateLike(value).getTime();
}

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(text) {
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
