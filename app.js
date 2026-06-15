const loginScreen = document.querySelector("#loginScreen");
const app = document.querySelector("#app");
const toast = document.querySelector("#toast");
const propertySelect = document.querySelector("#propertySelect");

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

document.querySelectorAll(".sort-button").forEach(button => {
  button.addEventListener("click", () => {
    const table = button.closest("table");
    const column = Array.from(button.closest("tr").children).indexOf(button.closest("th"));
    const rows = Array.from(table.querySelectorAll("tbody tr"));
    const descending = button.dataset.direction !== "desc";
    rows.sort((a, b) => {
      const clean = value => value.replace(/[,%+]/g, "").trim();
      const left = clean(a.children[column].textContent);
      const right = clean(b.children[column].textContent);
      const result = Number.isNaN(Number(left)) || Number.isNaN(Number(right))
        ? left.localeCompare(right)
        : Number(left) - Number(right);
      return descending ? -result : result;
    });
    rows.forEach(row => table.tBodies[0].appendChild(row));
    table.querySelectorAll(".sort-button").forEach(item => {
      item.textContent = item.textContent.replace(/[↓↑]/g, "").trim();
      delete item.dataset.direction;
    });
    button.dataset.direction = descending ? "desc" : "asc";
    button.textContent += descending ? " ↓" : " ↑";
  });
});

initializeAuth();
