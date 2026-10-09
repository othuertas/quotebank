import { getRoute } from "./router.js";

let isOpen = false;
let pressTimer = null;
let longPressTriggered = false;
let ignoreNextClick = false;
let pressStartX = 0;
let pressStartY = 0;

export function isSwitcherOpen() {
  return isOpen;
}

export function openSwitcher() {
  const dropdown = document.getElementById("feed-switcher-dropdown");
  const logoBtn = document.getElementById("main-logo");
  const wrap = document.getElementById("logo-switcher-wrap");
  if (!dropdown || !logoBtn) return;
  isOpen = true;
  dropdown.classList.add("open");
  wrap?.classList.add("is-open");
  logoBtn.classList.add("is-open");
  logoBtn.setAttribute("aria-expanded", "true");
}

export function closeSwitcher() {
  const dropdown = document.getElementById("feed-switcher-dropdown");
  const logoBtn = document.getElementById("main-logo");
  const wrap = document.getElementById("logo-switcher-wrap");
  if (!dropdown || !logoBtn) return;
  isOpen = false;
  dropdown.classList.remove("open");
  wrap?.classList.remove("is-open");
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

  if (logoText) {
    logoText.innerHTML = isMeme ? "Meme<span>Bank</span>" : "Quote<span>Bank</span>";
  }
  if (mainLogo) {
    mainLogo.setAttribute("aria-label", isMeme ? "MemeBank" : "QuoteBank");
  }

  if (otherLink && otherText) {
    if (isMeme) {
      otherLink.href = "#quotes";
      otherText.innerHTML = "Quote<span>Bank</span>";
    } else {
      otherLink.href = "#memes";
      otherText.innerHTML = "Meme<span>Bank</span>";
    }
  }

  document.title = isMeme ? "MemeBank" : "QuoteBank";
}

export function setupFeedSwitcher() {
  const logoBtn = document.getElementById("main-logo");
  const otherLink = document.getElementById("feed-switcher-other");
  const wrap = document.getElementById("logo-switcher-wrap");

  if (!logoBtn || !wrap) return;

  logoBtn.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "touch") return;
    pressStartX = e.clientX;
    pressStartY = e.clientY;
    longPressTriggered = false;
    logoBtn.classList.add("is-pressing");
    pressTimer = setTimeout(() => {
      longPressTriggered = true;
      logoBtn.classList.remove("is-pressing");
      openSwitcher();
    }, 380);
    logoBtn.setPointerCapture?.(e.pointerId);
  });

  logoBtn.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "touch" || !pressTimer) return;
    const movedX = Math.abs(e.clientX - pressStartX);
    const movedY = Math.abs(e.clientY - pressStartY);
    if (movedX > 10 || movedY > 10) {
      clearTimeout(pressTimer);
      pressTimer = null;
      logoBtn.classList.remove("is-pressing");
    }
  });

  logoBtn.addEventListener("pointerup", (e) => {
    if (e.pointerType !== "touch") return;
    clearTimeout(pressTimer);
    pressTimer = null;
    logoBtn.classList.remove("is-pressing");
    if (longPressTriggered) {
      ignoreNextClick = true;
      setTimeout(() => { ignoreNextClick = false; }, 400);
    }
    longPressTriggered = false;
  });

  logoBtn.addEventListener("pointercancel", () => {
    clearTimeout(pressTimer);
    pressTimer = null;
    longPressTriggered = false;
    logoBtn.classList.remove("is-pressing");
  });

  logoBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (ignoreNextClick) return;
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
