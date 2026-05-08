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
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function scoreClass(score) {
  if (score > 0) return "positive";
  if (score < 0) return "negative";
  return "zero";
}
