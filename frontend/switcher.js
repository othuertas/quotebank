import { getRoute } from "./router.js";
import { t } from "./i18n.js";

let isOpen = false;
let longPressTimer = null;
let isLongPress = false;
let touchStartX = 0;
let touchStartY = 0;

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

  // ── Touch events for mobile long-press ────────────────────────────────────
  logoBtn.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 1) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isLongPress = false;
    logoBtn.classList.add("is-pressing");

    clearTimeout(longPressTimer);
    longPressTimer = setTimeout(() => {
      isLongPress = true;
      logoBtn.classList.remove("is-pressing");
      if (navigator.vibrate) {
        try { navigator.vibrate(35); } catch (_) {}
      }
      openSwitcher();
    }, 380);
  }, { passive: true });

  logoBtn.addEventListener("touchmove", (e) => {
    if (!longPressTimer) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartX);
    const dy = Math.abs(touch.clientY - touchStartY);
    if (dx > 10 || dy > 10) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
      logoBtn.classList.remove("is-pressing");
    }
  }, { passive: true });

  logoBtn.addEventListener("touchend", (e) => {
    clearTimeout(longPressTimer);
    longPressTimer = null;
    logoBtn.classList.remove("is-pressing");

    if (isLongPress) {
      if (e.cancelable) e.preventDefault();
      setTimeout(() => { isLongPress = false; }, 150);
    } else if (isOpen) {
      // If tapped while already open, dismiss
      if (e.cancelable) e.preventDefault();
      closeSwitcher();
    }
  });

  logoBtn.addEventListener("touchcancel", () => {
    clearTimeout(longPressTimer);
    longPressTimer = null;
    logoBtn.classList.remove("is-pressing");
    isLongPress = false;
  });

  // ── Desktop click ─────────────────────────────────────────────────────────
  logoBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (isLongPress) return;
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
