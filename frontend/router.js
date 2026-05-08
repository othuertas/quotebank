import { state } from "./state.js";
import { renderFeed } from "./feed.js";
import { renderAuth } from "./auth.js";
import { renderProfile, renderAdmin } from "./pages.js";

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
    switchText.textContent = "switch to QuoteBank!";
    if (logo) logo.innerHTML = "Meme<span>Bank</span>";
    document.title = "MemeBank";
  } else {
    switchBtn.href = "#memes";
    switchText.textContent = "switch to MemeBank!";
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
