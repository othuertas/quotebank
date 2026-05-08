import { state, dom } from "./state.js";

const API = "/api";

export function headers(json = true) {
  const h = {};
  if (json) h["Content-Type"] = "application/json";
  if (state.auth.token) h["Authorization"] = `Bearer ${state.auth.token}`;
  return h;
}

export async function api(method, path, body, isFormData = false) {
  const opts = { method, headers: isFormData ? {} : headers(!isFormData) };
  if (state.auth.token && isFormData) {
    opts.headers["Authorization"] = `Bearer ${state.auth.token}`;
  }
  if (body) {
    opts.body = isFormData ? body : JSON.stringify(body);
  }
  const res = await fetch(`${API}${path}`, opts);
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Something went wrong");
  return data;
}

export function toast(message, type = "success") {
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = message;
  dom.toastContainer.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}
