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
          userId: parsed.userId,
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
    const adminLinkDesktop = state.auth.is_admin
      ? `<a href="#admin" class="btn-ghost" style="font-size:0.8rem">⚙️ ${t("admin_uppercase")}</a>`
      : '';
    const adminLinkMobile = state.auth.is_admin
      ? `<a href="#admin" class="user-dropdown-item">⚙️ ${t("admin_uppercase")}</a>`
      : '';

    dom.authArea.innerHTML = `
      <!-- Desktop layout -->
      <div class="user-info">
        <a href="#profile" class="username">${escHtml(state.auth.username)}</a>
        ${adminLinkDesktop}
        <button class="btn-logout" id="btn-logout">${t("logout")}</button>
      </div>

      <!-- Mobile avatar menu -->
      <div class="user-menu-mobile" id="user-menu-mobile">
        <button class="user-avatar-btn" id="user-avatar-btn" aria-label="${t("your_profile")}" aria-expanded="false">
          ${initial}
        </button>
        <div class="user-dropdown" id="user-dropdown" aria-hidden="true">
          <span class="user-dropdown-name">${escHtml(state.auth.username)}</span>
          <a href="#profile" class="user-dropdown-item">👤 ${t("your_profile")}</a>
          ${adminLinkMobile}
          <button class="user-dropdown-item user-dropdown-logout" id="btn-logout-mobile">${t("logout")}</button>
        </div>
      </div>
    `;

    // Shared logout logic
    const doLogout = () => {
      state.auth = { token: null, username: null, is_admin: false };
      saveAuth();
      renderAuthArea();
      route();
      toast(t("logged_out"));
    };

    document.getElementById("btn-logout").addEventListener("click", doLogout);
    document.getElementById("btn-logout-mobile").addEventListener("click", doLogout);

    // Mobile menu toggle
    const avatarBtn = document.getElementById("user-avatar-btn");
    const dropdown  = document.getElementById("user-dropdown");
    const menuWrap  = document.getElementById("user-menu-mobile");

    avatarBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.toggle("open");
      avatarBtn.setAttribute("aria-expanded", String(isOpen));
      dropdown.setAttribute("aria-hidden", String(!isOpen));
    });

    // Close dropdown when any link inside it is tapped
    dropdown.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        dropdown.classList.remove("open");
        avatarBtn.setAttribute("aria-expanded", "false");
      });
    });

    // Close on outside tap
    const closeOnOutside = (e) => {
      if (!menuWrap.contains(e.target)) {
        dropdown.classList.remove("open");
        avatarBtn.setAttribute("aria-expanded", "false");
        document.removeEventListener("click", closeOnOutside);
      }
    };
    document.addEventListener("click", closeOnOutside);

  } else {
    dom.authArea.innerHTML = `
      <!-- Desktop layout -->
      <div class="auth-links">
        <a href="#login" class="btn-ghost">${t("log_in")}</a>
        <a href="#register" class="btn-accent">${t("sign_up")}</a>
      </div>

      <!-- Mobile guest menu -->
      <div class="user-menu-mobile" id="guest-menu-mobile">
        <button class="user-access-btn" id="guest-access-btn" aria-expanded="false">
          ${t("access")}
        </button>
        <div class="user-dropdown" id="guest-dropdown" aria-hidden="true">
          <span class="user-dropdown-name">${t("welcome_guest")}</span>
          <a href="#login" class="user-dropdown-item">🔑 ${t("log_in")}</a>
          <a href="#register" class="user-dropdown-item">✨ ${t("sign_up")}</a>
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

      // Close dropdown when any link inside it is tapped
      guestDropdown.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
          guestDropdown.classList.remove("open");
          guestBtn.setAttribute("aria-expanded", "false");
        });
      });

      // Close on outside tap
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
      if (location.hash === "#quotes") route(); // Force route if hash doesn't change
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.add("visible");
    }
  });
}
