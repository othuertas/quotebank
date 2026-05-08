import { state } from "./state.js";
import { renderFeed } from "./feed.js";
import { renderAuth } from "./auth.js";
import { renderProfile, renderAdmin } from "./pages.js";
import { t } from "./i18n.js";

export function getRoute() {
  const hash = location.hash.replace("#", "") || "quotes";
  return hash;
}

export function setActiveNav() {
  const r = getRoute();
  const switchBtn = document.getElementById("switch-feed-btn");
  const logo = document.getElementById("main-logo");
  if (!switchBtn) return;
  const switchText = switchBtn.querySelector(".switch-text");
  if (r === "memes") {
    switchBtn.href = "#quotes";
    switchText.setAttribute("data-i18n", "switch_to_quote");
    switchText.textContent = t("switch_to_quote");
    if (logo) logo.innerHTML = "Meme<span>Bank</span>";
    document.title = "MemeBank";
  } else {
    switchBtn.href = "#memes";
    switchText.setAttribute("data-i18n", "switch_to_meme");
    switchText.textContent = t("switch_to_meme");
    if (logo) logo.innerHTML = "Quote<span>Bank</span>";
    document.title = "QuoteBank";
  }
}

export function route() {
  state.currentPage = 1;
  state.currentSort = "new";
  setActiveNav();

  const r = getRoute();
  switch (r) {
    case "quotes": renderFeed("quotes"); break;
    case "memes":  renderFeed("memes");  break;
    case "login":  renderAuth("login");  break;
    case "register": renderAuth("register"); break;
    case "profile": renderProfile(); break;
    case "admin": renderAdmin(); break;
    default: renderFeed("quotes"); break;
  }
}

export function setupRouter() {
  window.addEventListener("hashchange", route);
}
