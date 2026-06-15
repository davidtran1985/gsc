const recommendations = [
  { icon: "T", title: "Optimize titles on 12 pages", desc: "High impressions, but CTR remains below 2%.", impact: "High impact" },
  { icon: "+", title: "Move 8 queries into the Top 10", desc: "Currently ranking 11-15, with 3.2K potential clicks.", impact: "High impact" },
  { icon: "-", title: "Recover declining traffic", desc: "4 pages lost more than 20% of clicks in 7 days.", impact: "Medium", medium: true },
  { icon: "#", title: "Add internal links", desc: "6 important pages are missing internal links.", impact: "Medium", medium: true },
];

const loginScreen = document.querySelector("#loginScreen");
const app = document.querySelector("#app");
const recContainer = document.querySelector("#recommendations");
const toast = document.querySelector("#toast");
const propertySelect = document.querySelector("#propertySelect");

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

function showLogin(error = "") {
  app.classList.add("hidden");
  loginScreen.classList.remove("hidden");
  const errorBox = document.querySelector("#loginError");
  errorBox.textContent = error;
  errorBox.classList.toggle("hidden", !error);
}

function showApp(user) {
  loginScreen.classList.add("hidden");
  app.classList.remove("hidden");
  const name = user.name || user.email || "Google user";
  const initials = name.split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase();
  document.querySelector("#userName").textContent = name;
  document.querySelector("#userEmail").textContent = user.email || "";
  document.querySelector("#userAvatar").textContent = initials;
  document.querySelector("#headerAvatar").textContent = initials;
}

async function apiRequest(path, options) {
  const response = await fetch(path, { credentials: "same-origin", ...options });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "Request failed");
  return body;
}

async function loadProperties() {
  propertySelect.innerHTML = "<option>Loading websites...</option>";
  try {
    const { sites } = await apiRequest("/api/gsc/sites");
    propertySelect.innerHTML = "";
    if (!sites.length) {
      propertySelect.innerHTML = "<option>No Search Console properties found</option>";
      propertySelect.disabled = true;
      return;
    }
    sites.forEach(site => {
      const option = document.createElement("option");
      option.value = site.siteUrl;
      option.textContent = `${site.siteUrl} (${site.permissionLevel})`;
      propertySelect.appendChild(option);
    });
    const savedProperty = localStorage.getItem("searchpilot-active-property");
    if (savedProperty && sites.some(site => site.siteUrl === savedProperty)) {
      propertySelect.value = savedProperty;
    }
  } catch (error) {
    propertySelect.innerHTML = "<option>Unable to load websites</option>";
    propertySelect.disabled = true;
    showToast(error.message);
  }
}

async function initializeAuth() {
  const params = new URLSearchParams(window.location.search);
  if (params.has("auth_error")) {
    history.replaceState({}, "", window.location.pathname);
    showLogin(params.get("auth_error"));
    return;
  }

  try {
    const { authenticated, user } = await apiRequest("/api/session");
    if (!authenticated) {
      showLogin();
      return;
    }
    showApp(user);
    await loadProperties();
  } catch {
    showLogin("Unable to verify your session. Please try again.");
  }
}

document.querySelector("#googleLogin").addEventListener("click", () => {
  window.location.assign("/api/auth/google");
});

document.querySelector("#logoutButton").addEventListener("click", async () => {
  try {
    await apiRequest("/api/auth/logout", { method: "POST" });
  } finally {
    showLogin();
  }
});

propertySelect.addEventListener("change", () => {
  localStorage.setItem("searchpilot-active-property", propertySelect.value);
  showToast(`Selected ${propertySelect.value}`);
});

document.querySelector("#aiScan").addEventListener("click", (event) => {
  event.currentTarget.textContent = "Analyzing...";
  setTimeout(() => {
    event.currentTarget.textContent = "Analyze with AI";
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
  });
});

renderRecommendations();
initializeAuth();
