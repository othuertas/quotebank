import { getRoute } from "./router.js";
import { t } from "./i18n.js";

let isOpen = false;

export function isSwitcherOpen() {
  return isOpen;
}

export function openSwitcher() {
  const dropdown = document.getElementById("feed-switcher-dropdown");
  const logoBtn = document.getElementById("main-logo");
  if (!dropdown || !logoBtn) return;
  isOpen = true;
  dropdown.classList.add("open");
  logoBtn.classList.add("is-open");
  logoBtn.setAttribute("aria-expanded", "true");
}

export function closeSwitcher() {
  const dropdown = document.getElementById("feed-switcher-dropdown");
  const logoBtn = document.getElementById("main-logo");
  if (!dropdown || !logoBtn) return;
  isOpen = false;
  dropdown.classList.remove("open");
  logoBtn.classList.remove("is-open");
  logoBtn.setAttribute("aria-expanded", "false");
}

export function toggleSwitcher() {
  if (isOpen) {
    closeSwitcher();
  } else {
    openSwitcher();
  }
}

export function updateFeedSwitcher(route) {
  const r = route || getRoute();
  const isMeme = r === "memes";

  const logoText = document.getElementById("logo-text");
  const mainLogo = document.getElementById("main-logo");
  const otherLink = document.getElementById("feed-switcher-other");
  const otherText = document.getElementById("switcher-other-text");
  const otherHint = document.getElementById("switcher-other-hint");

  if (logoText) {
    logoText.innerHTML = isMeme ? "Meme<span>Bank</span>" : "Quote<span>Bank</span>";
  }
  if (mainLogo) {
    mainLogo.setAttribute("aria-label", isMeme ? "MemeBank" : "QuoteBank");
  }

  if (otherLink && otherText && otherHint) {
    if (isMeme) {
      otherLink.href = "#quotes";
      otherText.innerHTML = "Quote<span>Bank</span>";
      otherHint.textContent = t("switch_to_quote");
      otherLink.setAttribute("title", t("switch_to_quote"));
    } else {
      otherLink.href = "#memes";
      otherText.innerHTML = "Meme<span>Bank</span>";
      otherHint.textContent = t("switch_to_meme");
      otherLink.setAttribute("title", t("switch_to_meme"));
    }
  }

  document.title = isMeme ? "MemeBank" : "QuoteBank";
}

export function setupFeedSwitcher() {
  const logoBtn = document.getElementById("main-logo");
  const otherLink = document.getElementById("feed-switcher-other");
  const wrap = document.getElementById("logo-switcher-wrap");

  if (!logoBtn || !wrap) return;

  logoBtn.addEventListener("click", (e) => {
    e.preventDefault();
    toggleSwitcher();
  });

  // ── Click option to switch feed ───────────────────────────────────────────
  if (otherLink) {
    otherLink.addEventListener("click", () => {
      closeSwitcher();
    });
  }

  // ── Dismiss on outside tap/click ──────────────────────────────────────────
  document.addEventListener("pointerdown", (e) => {
    if (isOpen && !wrap.contains(e.target)) {
      closeSwitcher();
    }
  });

  // ── Dismiss on Escape key ─────────────────────────────────────────────────
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) {
      closeSwitcher();
    }
  });
}
