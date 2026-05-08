import { initTheme, setupThemeListeners } from "./theme.js";
import { loadAuth, renderAuthArea } from "./auth.js";
import { setupRouter, route } from "./router.js";
import { setupModalListeners } from "./modals.js";

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

// ── Init ──────────────────────────────────────────────────────────────────
initTheme();
setupThemeListeners();
loadAuth();
renderAuthArea();
setupRouter();
setupModalListeners();
route();
console.log('App.js is running!');
