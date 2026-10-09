import { state } from "./state.js";
import { renderFeed } from "./feed.js";
import { renderAuth } from "./auth.js";
import { renderProfile, renderAdmin } from "./pages.js";
import { t } from "./i18n.js";
import { updateFeedSwitcher } from "./switcher.js";

export function getRoute() {
  const hash = location.hash.replace("#", "") || "quotes";
  return hash;
}

export function setActiveNav() {
  const r = getRoute();
  updateFeedSwitcher(r);
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
