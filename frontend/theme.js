import { dom } from "./state.js";

export function initTheme() {
  const saved = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (saved === "dark" || (!saved && systemPrefersDark)) {
    document.documentElement.setAttribute("data-theme", "dark");
    dom.themeToggle.textContent = "☀️";
  } else {
    document.documentElement.removeAttribute("data-theme");
    dom.themeToggle.textContent = "🌙";
  }
}

export function setupThemeListeners() {
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem("theme")) {
      if (e.matches) {
        document.documentElement.setAttribute("data-theme", "dark");
        dom.themeToggle.textContent = "☀️";
      } else {
        document.documentElement.removeAttribute("data-theme");
        dom.themeToggle.textContent = "🌙";
      }
    }
  });

  dom.themeToggle.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    if (isDark) {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
      dom.themeToggle.textContent = "🌙";
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
      dom.themeToggle.textContent = "☀️";
    }
  });
}
