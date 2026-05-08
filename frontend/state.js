export const state = {
  auth: { token: null, username: null, is_admin: false },
  currentSort: "new",
  currentPage: 1,
  isLoading: false,
  searchTimeout: null,
  currentSearch: ""
};

export const dom = {
  get app() { return document.getElementById("app"); },
  get authArea() { return document.getElementById("auth-area"); },
  get modalOverlay() { return document.getElementById("modal-overlay"); },
  get modalContent() { return document.getElementById("modal-content"); },
  get toastContainer() { return document.getElementById("toast-container"); },
  get themeToggle() { return document.getElementById("theme-toggle"); }
};
