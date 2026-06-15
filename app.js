const recommendations = [
  { icon: "T", title: "Optimize titles on 12 pages", desc: "High impressions, but CTR remains below 2%.", impact: "High impact" },
  { icon: "↗", title: "Move 8 queries into the Top 10", desc: "Currently ranking 11–15, with 3.2K potential clicks.", impact: "High impact" },
  { icon: "⌁", title: "Recover declining traffic", desc: "4 pages lost more than 20% of clicks in 7 days.", impact: "Medium", medium: true },
  { icon: "⛓", title: "Add internal links", desc: "6 important pages are missing internal links.", impact: "Medium", medium: true },
];

const loginScreen = document.querySelector("#loginScreen");
const app = document.querySelector("#app");
const recContainer = document.querySelector("#recommendations");
const toast = document.querySelector("#toast");

function renderRecommendations(limit = 3) {
  recContainer.innerHTML = recommendations.slice(0, limit).map(r => `
    <div class="recommendation">
      <span class="rec-icon">${r.icon}</span>
      <div><strong>${r.title}</strong><p>${r.desc}</p></div>
      <span class="impact ${r.medium ? "medium" : ""}">${r.impact}</span>
    </div>`).join("");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2600);
}

document.querySelector("#googleLogin").addEventListener("click", () => {
  loginScreen.classList.add("hidden");
  app.classList.remove("hidden");
  localStorage.setItem("searchpilot-demo-login", "true");
  showToast("Google Search Console connected");
});

document.querySelector("#aiScan").addEventListener("click", (event) => {
  event.currentTarget.textContent = "✦ Analyzing...";
  setTimeout(() => {
    event.currentTarget.textContent = "✦ Analyze with AI";
    showToast("AI found 6 new growth opportunities");
  }, 1100);
});

document.querySelector("#viewAll").addEventListener("click", (event) => {
  renderRecommendations(4);
  event.currentTarget.textContent = "All recommendations displayed";
});

document.querySelector("#menuButton").addEventListener("click", () => {
  document.querySelector("#sidebar").classList.toggle("open");
});

document.querySelectorAll(".nav-item[data-view]").forEach(item => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".nav-item[data-view]").forEach(i => i.classList.remove("active"));
    item.classList.add("active");
    document.querySelector("#pageTitle").textContent = item.textContent.replace("6", "").trim();
    document.querySelector("#sidebar").classList.remove("open");
    showToast(`Opened ${document.querySelector("#pageTitle").textContent}`);
  });
});

renderRecommendations();
if (localStorage.getItem("searchpilot-demo-login") === "true") {
  loginScreen.classList.add("hidden");
  app.classList.remove("hidden");
}
