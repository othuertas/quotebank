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
        state.auth = { token: parsed.token, username: parsed.username, is_admin: !!parsed.is_admin };
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
    dom.authArea.innerHTML = `
      <div class="user-info">
        <a href="#profile" class="username">${escHtml(state.auth.username)}</a>
        ${state.auth.is_admin ? `<a href="#admin" class="btn-ghost" style="font-size:0.8rem">⚙️ ${t("admin_uppercase")}</a>` : ''}
        <button class="btn-logout" id="btn-logout">${t("logout")}</button>
      </div>
    `;
    document.getElementById("btn-logout").addEventListener("click", () => {
      state.auth = { token: null, username: null, is_admin: false };
      saveAuth();
      renderAuthArea();
      route();
      toast(t("logged_out"));
    });
  } else {
    dom.authArea.innerHTML = `
      <div class="auth-links">
        <a href="#login" class="btn-ghost">${t("log_in")}</a>
        <a href="#register" class="btn-accent">${t("sign_up")}</a>
      </div>
    `;
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
      state.auth = { token: data.access_token, username: data.username, is_admin: !!data.is_admin };
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
