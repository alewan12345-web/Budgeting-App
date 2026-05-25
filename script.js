const buildWeek = [
  {
    day: "Sunday",
    focus: "Kickoff: Intro to Lua and the game development cycle.",
    morning:
      "10:00 AM breakfast, community welcome, and beginner Lua foundations. Students learn brainstorming, planning, prototyping, and testing basics.",
    noon:
      "Lunch, then a simple starter build project in Roblox Studio. Build Hub challenge: teams complete one short educational creation quest.",
    evening:
      "Dinner and recap circle. Students share what they built, what broke, and how they fixed it.",
    milestone: "Milestone: Every student publishes a tiny first build and reflection note."
  },
  {
    day: "Monday",
    focus: "Systems Day: Mechanics, scripting patterns, and playtest loops.",
    morning:
      "Breakfast, script structures, variables, functions, and events. Students iterate on mini mechanics with guided checks.",
    noon:
      "Lunch, feature-building sprint, and Build Hub challenge with a fresh prompt tied to design thinking.",
    evening:
      "Dinner plus team retro. Students track wins, blockers, and action steps for tomorrow.",
    milestone: "Milestone: Students ship a functional mini game mechanic with test feedback."
  },
  {
    day: "Tuesday",
    focus: "Team Formation (Day 3): Groups form and plan a larger project.",
    morning:
      "Breakfast, role assignment (designer, coder, tester, storyteller), and project scoping with mentor support.",
    noon:
      "Lunch, then each group starts building core systems. Build Hub challenge keeps collaboration energy high.",
    evening:
      "Dinner and project board review. Groups report progress and adjust scope for realistic delivery.",
    milestone: "Milestone: Team project scope and first playable version approved."
  },
  {
    day: "Wednesday",
    focus: "Production Sprint: Build, test, and improve with peer feedback.",
    morning:
      "Breakfast and deep work sprint. Teams develop gameplay flow, UI, story beats, and balancing.",
    noon:
      "Lunch, bug-fix blocks, and Build Hub challenge focused on quick iteration and speed-to-feedback.",
    evening:
      "Dinner plus structured demo sessions where teams receive actionable review from mentors and peers.",
    milestone: "Milestone: Teams complete vertical slice with clear gameplay objective."
  },
  {
    day: "Thursday",
    focus: "Polish + Business Lens: User value, retention, and communication.",
    morning:
      "Breakfast and polish sprint. Teams refine visuals, onboarding, and clarity for first-time players.",
    noon:
      "Lunch, entrepreneurship mini-lesson, and Build Hub challenge on player empathy and communication.",
    evening:
      "Dinner and pitch prep. Teams summarize who their game serves and what makes it useful or fun.",
    milestone: "Milestone: Teams complete polished beta and one-minute product pitch draft."
  },
  {
    day: "Friday",
    focus: "Launch Readiness: QA, final improvements, and presentation practice.",
    morning:
      "Breakfast, advanced debugging, and quality assurance checklist execution across all groups.",
    noon:
      "Lunch, final build sprint, and Build Hub challenge designed around stability and teamwork under time limits.",
    evening:
      "Dinner plus full run-through rehearsal for final showcase and peer testing day.",
    milestone: "Milestone: Final candidate build locked and showcase-ready."
  },
  {
    day: "Saturday",
    focus: "Final Day: Showcase, cross-testing, and celebration.",
    morning:
      "Breakfast and final tuning. Teams prepare showcase booths, instructions, and test goals.",
    noon:
      "Lunch, full activity block, and cross-group game testing where every team tests and reviews other teams' projects.",
    evening:
      "Dinner celebration, awards, and reflection on coding growth, teamwork, communication, and future career paths.",
    milestone: "Milestone: Public showcase completed with peer testing reports from every group."
  }
];

const tabsRoot = document.getElementById("dayTabs");
const dayTitle = document.getElementById("dayTitle");
const dayFocus = document.getElementById("dayFocus");
const morningPlan = document.getElementById("morningPlan");
const noonPlan = document.getElementById("noonPlan");
const eveningPlan = document.getElementById("eveningPlan");
const dayMilestone = document.getElementById("dayMilestone");

const studentsInput = document.getElementById("students");
const budgetInput = document.getElementById("budgetPerStudent");
const hotelInput = document.getElementById("hotelRate");

const studentsOut = document.getElementById("studentsOut");
const budgetOut = document.getElementById("budgetOut");
const hotelOut = document.getElementById("hotelOut");
const costPerStudentOut = document.getElementById("costPerStudent");
const budgetPerStudentText = document.getElementById("budgetPerStudentText");
const budgetStatus = document.getElementById("budgetStatus");

function renderDay(index) {
  const day = buildWeek[index];
  dayTitle.textContent = day.day;
  dayFocus.textContent = day.focus;
  morningPlan.textContent = day.morning;
  noonPlan.textContent = day.noon;
  eveningPlan.textContent = day.evening;
  dayMilestone.textContent = day.milestone;

  const allTabs = tabsRoot.querySelectorAll(".tab");
  allTabs.forEach((button, i) => {
    button.setAttribute("aria-selected", String(i === index));
  });
}

function buildTabs() {
  buildWeek.forEach((day, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tab";
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", "false");
    button.textContent = day.day;
    button.addEventListener("click", () => renderDay(index));
    tabsRoot.append(button);
  });
}

function updateBudget() {
  const students = Number(studentsInput.value);
  const budgetPerStudent = Number(budgetInput.value);
  const hotelRate = Number(hotelInput.value) / 100;

  // Program targets a low operational footprint for school partnership.
  const baseProgramCost = 58;
  const averageHotelCost = 10 * hotelRate;
  const costPerStudent = baseProgramCost + averageHotelCost;

  studentsOut.textContent = students.toString();
  budgetOut.textContent = budgetPerStudent.toString();
  hotelOut.textContent = Math.round(hotelRate * 100).toString();
  costPerStudentOut.textContent = `$${costPerStudent.toFixed(2)}`;
  budgetPerStudentText.textContent = `$${budgetPerStudent.toFixed(2)}`;

  const margin = budgetPerStudent - costPerStudent;

  if (margin >= 0) {
    budgetStatus.classList.remove("warn");
    budgetStatus.classList.add("good");
    budgetStatus.textContent = `Estimated to stay under budget by $${margin.toFixed(2)} per student.`;
  } else {
    budgetStatus.classList.remove("good");
    budgetStatus.classList.add("warn");
    budgetStatus.textContent = `Over budget by $${Math.abs(margin).toFixed(2)} per student. Adjust hotel rate or school budget target.`;
  }
}

buildTabs();
renderDay(0);
updateBudget();

[studentsInput, budgetInput, hotelInput].forEach((input) => {
  input.addEventListener("input", updateBudget);
});

if (window.lucide) {
  window.lucide.createIcons();
}
