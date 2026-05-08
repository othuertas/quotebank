import { t } from "./i18n.js";
import { state } from "./state.js";

export function escHtml(str) {
  const d = document.createElement("div");
  d.textContent = str || "";
  return d.innerHTML;
}

export function timeAgo(dateStr) {
  if (!dateStr.endsWith("Z")) dateStr += "Z";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = (now - then) / 1000;
  
  if (diff < 60) return t("time_just_now");
  
  let val = '';
  if (diff < 3600) val = `${Math.floor(diff / 60)}${t("time_m")}`;
  else if (diff < 86400) val = `${Math.floor(diff / 3600)}${t("time_h")}`;
  else if (diff < 2592000) val = `${Math.floor(diff / 86400)}${t("time_d")}`;
  else return new Date(dateStr).toLocaleDateString(state.lang === 'en' ? 'en-US' : (state.lang === 'es' ? 'es-ES' : 'ca-ES'));

  if (state.lang === 'es') return `hace ${val}`;
  if (state.lang === 'ca') return `fa ${val}`;
  return `${val} ago`;
}
export function scoreClass(score) {
  if (score > 0) return "positive";
  if (score < 0) return "negative";
  return "zero";
}
