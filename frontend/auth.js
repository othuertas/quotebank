import { state, dom } from "./state.js";
import { api, toast } from "./api.js";
import { escHtml } from "./utils.js";
import { route } from "./router.js";
import { t } from "./i18n.js";

export function loadAuth() {
  try {
    const saved = localStorage.getItem("qb_auth");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.token && parsed.username) {
        state.auth = {
          token: parsed.token,
          username: parsed.username,
          userId: parsed.userId || null, // ensure userId is properly mapped
          is_admin: !!parsed.is_admin
        };
      }
    }
  } catch (_) { /* ignore */ }
}

export function saveAuth() {
  if (state.auth.token) {
    localStorage.setItem("qb_auth", JSON.stringify(state.auth));
  } else {
    localStorage.removeItem("qb_auth");
  }
}

export function renderAuthArea() {
  if (state.auth.token) {
    const initial = state.auth.username.charAt(0).toUpperCase();
    const adminLink = state.auth.is_admin
      ? `<a href="#admin" class="user-dropdown-item"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> <span>${t("admin_uppercase")}</span></a>`
      : '';

    dom.authArea.innerHTML = `
      <div class="user-menu-wrap" id="user-menu-wrap">
        <button class="user-dropdown-btn" id="user-dropdown-btn" aria-expanded="false">
          <span class="username">${escHtml(state.auth.username)}</span>
          <span class="dropdown-arrow">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </span>
        </button>

        <div class="user-dropdown" id="user-dropdown-shared" aria-hidden="true">
          <span class="user-dropdown-name">${escHtml(state.auth.username)}</span>
          <a href="#profile" class="user-dropdown-item"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> <span>${t("user_settings")}</span></a>
          ${adminLink}
          <button class="user-dropdown-item user-dropdown-logout" id="btn-logout-shared"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg> <span>${t("logout")}</span></button>
        </div>
      </div>
    `;

    // Shared logout logic
    const doLogout = () => {
      state.auth = { token: null, username: null, userId: null, is_admin: false };
      saveAuth();
      renderAuthArea();
      setTimeout(async () => {
        const { loadFeedPage } = await import("./feed.js");
        state.currentPage = 1;
        document.getElementById("feed-list").innerHTML = "";
        loadFeedPage(location.hash.replace("#", "") || "quotes");
      }, 0);
      toast(t("logged_out"));
    };

    const logoutBtn = document.getElementById("btn-logout-shared");
    logoutBtn.addEventListener("click", doLogout);

    // Dropdown toggle logic
    const dropdownBtn = document.getElementById("user-dropdown-btn");
    const dropdown = document.getElementById("user-dropdown-shared");
    const menuWrap = document.getElementById("user-menu-wrap");

    const toggleDropdown = (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.toggle("open");
      dropdownBtn.setAttribute("aria-expanded", String(isOpen));
      dropdown.setAttribute("aria-hidden", String(!isOpen));
    };

    dropdownBtn.addEventListener("click", toggleDropdown);

    // Close dropdown when any link inside it is tapped
    dropdown.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        dropdown.classList.remove("open");
        dropdownBtn.setAttribute("aria-expanded", "false");
      });
    });

    // Close on outside tap
    const closeOnOutside = (e) => {
      if (!menuWrap.contains(e.target)) {
        if (dropdown.classList.contains("open")) {
          dropdown.classList.remove("open");
          dropdownBtn.setAttribute("aria-expanded", "false");
          dropdown.setAttribute("aria-hidden", "true");
        }
      }
    };
    document.addEventListener("click", closeOnOutside);

  } else {
    dom.authArea.innerHTML = `
      <!-- Desktop layout -->
      <div class="auth-links">
        <a href="#register" class="btn-ghost">${t("sign_up")}</a>
        <a href="#login" class="btn-accent">${t("log_in")}</a>
      </div>

      <!-- Mobile guest menu -->
      <div class="user-menu-mobile" id="guest-menu-mobile">
        <button class="user-access-btn" id="guest-access-btn" aria-expanded="false">
          ${t("log_in")}
        </button>
        <div class="user-dropdown" id="guest-dropdown" aria-hidden="true">
          <span class="user-dropdown-name">${t("welcome_guest")}</span>
          <a href="#login" class="user-dropdown-item"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg> <span>${t("log_in")}</span></a>
          <a href="#register" class="user-dropdown-item"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg> <span>${t("sign_up")}</span></a>
        </div>
      </div>
    `;

    // Mobile guest menu toggle
    const guestBtn = document.getElementById("guest-access-btn");
    const guestDropdown = document.getElementById("guest-dropdown");
    const guestMenuWrap = document.getElementById("guest-menu-mobile");

    if (guestBtn) {
      guestBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = guestDropdown.classList.toggle("open");
        guestBtn.setAttribute("aria-expanded", String(isOpen));
        guestDropdown.setAttribute("aria-hidden", String(!isOpen));
      });

      guestDropdown.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
          guestDropdown.classList.remove("open");
          guestBtn.setAttribute("aria-expanded", "false");
        });
      });

      const closeGuestOnOutside = (e) => {
        if (!guestMenuWrap.contains(e.target)) {
          guestDropdown.classList.remove("open");
          guestBtn.setAttribute("aria-expanded", "false");
          document.removeEventListener("click", closeGuestOnOutside);
        }
      };
      document.addEventListener("click", closeGuestOnOutside);
    }
  }
}

export function renderAuth(mode) {
  const isLogin = mode === "login";
  dom.app.innerHTML = `
    <div class="auth-page">
      <div class="auth-card">
        <h2>${isLogin ? t("welcome_back") : t("create_account")}</h2>
        <p class="subtitle">${isLogin ? t("login_subtitle") : t("signup_subtitle")}</p>
        <form id="auth-form">
          <div class="form-group">
            <label for="auth-username">${t("username")}</label>
            <input type="text" id="auth-username" placeholder="${t("username_placeholder")}" required minlength="2" maxlength="64" autocomplete="username">
          </div>
          <div class="form-group">
            <label for="auth-password">${t("password")}</label>
            <input type="password" id="auth-password" placeholder="${t("password_placeholder")}" required minlength="4" maxlength="128" autocomplete="${isLogin ? "current-password" : "new-password"}">
          </div>
          <p class="form-error" id="auth-error"></p>
          <button type="submit" class="form-submit">${isLogin ? t("log_in") : t("sign_up")}</button>
        </form>
        <p class="auth-switch">
          ${isLogin
      ? `${t("no_account")} <a href='#register'>${t("sign_up")}</a>`
      : `${t("has_account")} <a href='#login'>${t("log_in")}</a>`
    }
        </p>
      </div>
    </div>
  `;

  document.getElementById("auth-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("auth-username").value.trim();
    const password = document.getElementById("auth-password").value;
    const errorEl = document.getElementById("auth-error");

    errorEl.classList.remove("visible");

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const data = await api("POST", endpoint, { username, password });
      state.auth = {
        token: data.access_token,
        username: data.username,
        userId: data.user_id,
        is_admin: !!data.is_admin
      };
      saveAuth();
      renderAuthArea();
      toast(isLogin ? t("welcome_back_toast") : t("account_created"));
      location.hash = "#quotes";
      setTimeout(async () => {
        const { loadFeedPage } = await import("./feed.js");
        state.currentPage = 1;
        document.getElementById("feed-list").innerHTML = "";
        loadFeedPage("quotes");
      }, 0);
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.add("visible");
    }
  });
}
