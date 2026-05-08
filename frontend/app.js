import { initTheme, setupThemeListeners } from "./theme.js";
import { loadAuth, renderAuthArea } from "./auth.js";
import { setupRouter, route } from "./router.js";
import { setupModalListeners } from "./modals.js";
import { initI18n, updateStaticTranslations } from "./i18n.js";
import { state } from "./state.js";

// ── Scroll to Top ─────────────────────────────────────────────────────────
const goTopBtn = document.getElementById("go-to-top");
if (goTopBtn) {
  window.addEventListener("scroll", () => {
    goTopBtn.classList.toggle("visible", window.scrollY > 300);
  });
  goTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ── I18n Setup ────────────────────────────────────────────────────────────
initI18n();
const langSwitcher = document.getElementById("lang-switcher");
if (langSwitcher) {
  langSwitcher.value = state.lang;
  langSwitcher.addEventListener("change", (e) => {
    state.lang = e.target.value;
    localStorage.setItem("qb_lang", state.lang);
    updateStaticTranslations();
    renderAuthArea();
    route(); // re-render current view
  });
}
updateStaticTranslations();

// ── Init ──────────────────────────────────────────────────────────────────
initTheme();
setupThemeListeners();
loadAuth();
renderAuthArea();
setupRouter();
setupModalListeners();
route();
console.log('App.js is running!');

