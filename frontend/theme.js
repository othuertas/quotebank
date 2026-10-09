import { dom } from "./state.js";

const ICON_MOON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
const ICON_SUN = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;

function syncThemeColor(isDark) {
  const color = isDark ? "#161513" : "#f3efe9";
  let meta = document.getElementById("meta-theme-color") || document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", color);
    // Re-inserting triggers Android Chromium WebAPK to notify Activity.setStatusBarColor
    const parent = meta.parentNode;
    if (parent) {
      parent.removeChild(meta);
      parent.appendChild(meta);
    }
  }

  const appleMeta = document.getElementById("meta-apple-status-bar") || document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (appleMeta) {
    appleMeta.setAttribute("content", isDark ? "black-translucent" : "default");
  }
}

export function initTheme() {
  const saved = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (saved === "dark" || (!saved && systemPrefersDark)) {
    document.documentElement.setAttribute("data-theme", "dark");
    dom.themeToggle.innerHTML = ICON_SUN;
    syncThemeColor(true);
  } else {
    document.documentElement.removeAttribute("data-theme");
    dom.themeToggle.innerHTML = ICON_MOON;
    syncThemeColor(false);
  }
}

export function setupThemeListeners() {
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem("theme")) {
      if (e.matches) {
        document.documentElement.setAttribute("data-theme", "dark");
        dom.themeToggle.innerHTML = ICON_SUN;
        syncThemeColor(true);
      } else {
        document.documentElement.removeAttribute("data-theme");
        dom.themeToggle.innerHTML = ICON_MOON;
        syncThemeColor(false);
      }
    }
  });

  dom.themeToggle.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    if (isDark) {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
      dom.themeToggle.innerHTML = ICON_MOON;
      syncThemeColor(false);
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
      dom.themeToggle.innerHTML = ICON_SUN;
      syncThemeColor(true);
    }
  });
}
