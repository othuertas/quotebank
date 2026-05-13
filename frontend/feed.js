import { state, dom } from "./state.js";
import { api, toast } from "./api.js";
import { quoteCard, memeCard, attachVoteListeners, attachDeleteListeners, attachEditListeners, attachExpandListeners } from "./cards.js";
import { openQuoteModal, openMemeModal } from "./modals.js";
import { t } from "./i18n.js";

export function renderFeed(type) {
  const isQuotes = type === "quotes";
  const postLabel = isQuotes ? t("add_quote") : t("add_meme");

  dom.app.innerHTML = `
    <div class="feed-controls-container">
      <div class="feed-controls-top">
        <div class="sort-buttons" id="sort-buttons">
          <button class="sort-btn active" data-sort="new"><span class="sort-icon">🆕</span><span class="sort-label">${t("sort_new")}</span></button>
          <button class="sort-btn" data-sort="top"><span class="sort-icon">🔥</span><span class="sort-label">${t("sort_top")}</span></button>
          <button class="sort-btn" data-sort="old"><span class="sort-icon">📅</span><span class="sort-label">${t("sort_old")}</span></button>
          <button class="sort-btn" data-sort="random"><span class="sort-icon">🎲</span><span class="sort-label">${t("sort_random")}</span></button>
        </div>
        ${isQuotes ? `<input type="text" id="search-input" class="search-input" placeholder="${t("search_placeholder")}">` : ''}
      </div>
      ${state.auth.token ? `<button class="btn-post full-width" id="btn-open-post">${postLabel}</button>` : ""}
    </div>
    <div id="feed-list"></div>
    <div id="feed-loading"></div>
    <div class="load-more-wrap hidden" id="load-more-wrap">
      <button class="btn-load-more" id="btn-load-more">${t("load_more")}</button>
    </div>
  `;

  document.querySelectorAll("#sort-buttons .sort-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      state.currentSort = btn.dataset.sort;
      state.currentPage = 1;
      document.querySelectorAll("#sort-buttons .sort-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("feed-list").innerHTML = "";
      loadFeedPage(type);
    });
  });

  const postBtn = document.getElementById("btn-open-post");
  if (postBtn) {
    postBtn.addEventListener("click", () => {
      if (!state.auth.token) { location.hash = "#login"; return; }
      isQuotes ? openQuoteModal() : openMemeModal();
    });
  }

  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.value = state.currentSearch;
    searchInput.addEventListener("input", (e) => {
      state.currentSearch = e.target.value;
      if (state.searchTimeout) clearTimeout(state.searchTimeout);
      state.searchTimeout = setTimeout(() => {
        state.currentPage = 1;
        document.getElementById("feed-list").innerHTML = "";
        loadFeedPage(type);
      }, 500);
    });
  }

  document.getElementById("btn-load-more").addEventListener("click", () => {
    state.currentPage++;
    loadFeedPage(type, true);
  });

  loadFeedPage(type);
}

export async function loadFeedPage(type, append = false) {
  if (state.isLoading) return;
  state.isLoading = true;

  const loadingEl = document.getElementById("feed-loading");
  loadingEl.innerHTML = '<div class="spinner"></div>';

  try {
    let url = `/${type}?sort=${state.currentSort}&page=${state.currentPage}`;
    if (state.currentSearch && type === "quotes") {
      url += `&search=${encodeURIComponent(state.currentSearch)}`;
    }
    url += `&_t=${Date.now()}`;
    const items = await api("GET", url);

    loadingEl.innerHTML = "";
    const list = document.getElementById("feed-list");
    if (!append) list.innerHTML = "";

    if (items.length === 0 && state.currentPage === 1) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="emoji">${type === "quotes" ? "💬" : "🖼️"}</div>
          <h3>${type === "quotes" ? t("no_quotes") : t("no_memes")}</h3>
          <p>${t("be_first")}</p>
        </div>
      `;
      document.getElementById("load-more-wrap").classList.add("hidden");
      return;
    }

    items.forEach((item, i) => {
      const card = type === "quotes" ? quoteCard(item, i) : memeCard(item, i);
      list.insertAdjacentHTML("beforeend", card);
    });

    attachVoteListeners(list, type);
    attachDeleteListeners(list, type);
    attachEditListeners(list, type);
    attachExpandListeners(list);

    document.getElementById("load-more-wrap").classList.toggle("hidden", items.length < 20);

  } catch (err) {
    loadingEl.innerHTML = "";
    toast(err.message, "error");
  } finally {
    state.isLoading = false;
  }
}
