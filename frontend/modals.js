import { state, dom } from "./state.js";
import { api, toast } from "./api.js";
import { renderFeed } from "./feed.js";
import { t } from "./i18n.js";
import { escHtml } from "./utils.js";

export function openModal(html) {
  dom.modalContent.innerHTML = html;
  dom.modalOverlay.classList.add("open");
}

export function closeModal() {
  dom.modalOverlay.classList.remove("open");
  setTimeout(() => { dom.modalContent.innerHTML = ""; }, 300);
}

export function setupModalListeners() {
  dom.modalOverlay.addEventListener("click", (e) => {
    if (e.target === dom.modalOverlay) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

export function openQuoteModal() {
  openModal(`
    <div class="modal-header">
      <h2>${t("post_quote")}</h2>
      <button class="modal-close" id="modal-close-btn">✕</button>
    </div>
    <form id="quote-form">
      <div class="form-group">
        <label for="quote-text">${t("quote_label")}</label>
        <textarea id="quote-text" placeholder="${t("quote_placeholder")}" required></textarea>
      </div>
      <div class="form-group">
        <label for="quote-author">${t("who_said_it")}</label>
        <input type="text" id="quote-author" placeholder="${t("author_placeholder")}" required>
      </div>
      <div class="form-group">
        <label for="quote-said-at">${t("when_said")}</label>
        <input type="text" id="quote-said-at" placeholder="${t("date_placeholder")}">
      </div>
      <div class="form-group checkbox-group">
        <label class="checkbox-container">
          <input type="checkbox" id="quote-anon">
          <span class="checkbox-label">${t("post_anonymous")}</span>
        </label>
      </div>
      <p class="form-error" id="quote-error"></p>
      <button type="submit" class="form-submit">${t("btn_post_quote")}</button>
    </form>
  `);

  document.getElementById("modal-close-btn").addEventListener("click", closeModal);

  document.getElementById("quote-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("quote-error");
    errorEl.classList.remove("visible");

    try {
      await api("POST", "/quotes", {
        text: document.getElementById("quote-text").value.trim(),
        attributed_author: document.getElementById("quote-author").value.trim(),
        said_at: document.getElementById("quote-said-at").value.trim() || null,
        is_anonymous: document.getElementById("quote-anon").checked,
      });
      closeModal();
      toast(t("quote_posted"));
      state.currentPage = 1;
      state.currentSort = "new";
      renderFeed("quotes");
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.add("visible");
    }
  });
}

export function openEditQuoteModal(quote) {
  openModal(`
    <div class="modal-header">
      <h2>${t("edit_quote")}</h2>
      <button class="modal-close" id="modal-close-btn">✕</button>
    </div>
    <form id="quote-edit-form">
      <div class="form-group">
        <label for="quote-text">${t("quote_label")}</label>
        <textarea id="quote-text" required>${escHtml(quote.text)}</textarea>
      </div>
      <div class="form-group">
        <label for="quote-author">${t("who_said_it")}</label>
        <input type="text" id="quote-author" value="${escHtml(quote.attributed_author)}" required>
      </div>
      <div class="form-group">
        <label for="quote-said-at">${t("when_said")}</label>
        <input type="text" id="quote-said-at" value="${escHtml(quote.said_at || '')}">
      </div>
      <p class="form-error" id="quote-edit-error"></p>
      <button type="submit" class="form-submit">${t("save")}</button>
    </form>
  `);

  document.getElementById("modal-close-btn").addEventListener("click", closeModal);

  document.getElementById("quote-edit-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("quote-edit-error");
    errorEl.classList.remove("visible");

    try {
      await api("PATCH", `/quotes/${quote.id}`, {
        text: document.getElementById("quote-text").value.trim(),
        attributed_author: document.getElementById("quote-author").value.trim(),
        said_at: document.getElementById("quote-said-at").value.trim() || null,
      });
      closeModal();
      toast(t("save"));
      renderFeed("quotes");
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.add("visible");
    }
  });
}

export function openMemeModal() {
  openModal(`
    <div class="modal-header">
      <h2>${t("post_meme")}</h2>
      <button class="modal-close" id="modal-close-btn">✕</button>
    </div>
    <form id="meme-form">
      <div class="form-group">
        <label>${t("image_label")}</label>
        <div class="file-input-wrap">
          <input type="file" id="meme-file" accept="image/*" required>
          <div class="file-input-label" id="file-label">${t("choose_image")}</div>
        </div>
      </div>
      <div class="form-group">
        <label for="meme-caption">${t("caption_label")}</label>
        <input type="text" id="meme-caption" placeholder="${t("caption_placeholder")}">
      </div>
      <div class="form-group">
        <label for="meme-credited">${t("credited_to")}</label>
        <input type="text" id="meme-credited" placeholder="${t("credited_placeholder")}">
      </div>
      <div class="form-group checkbox-group">
        <label class="checkbox-container">
          <input type="checkbox" id="meme-anon">
          <span class="checkbox-label">${t("post_anonymous")}</span>
        </label>
      </div>
      <p class="form-error" id="meme-error"></p>
      <button type="submit" class="form-submit">${t("btn_post_meme")}</button>
    </form>
  `);

  document.getElementById("modal-close-btn").addEventListener("click", closeModal);

  const fileInput = document.getElementById("meme-file");
  const fileLabel = document.getElementById("file-label");

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length) {
      fileLabel.textContent = `📎 ${fileInput.files[0].name}`;
      fileLabel.classList.add("has-file");
    } else {
      fileLabel.textContent = t("choose_image");
      fileLabel.classList.remove("has-file");
    }
  });

  document.getElementById("meme-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("meme-error");
    errorEl.classList.remove("visible");

    const file = fileInput.files[0];
    if (!file) {
      errorEl.textContent = t("please_select_image");
      errorEl.classList.add("visible");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("caption", document.getElementById("meme-caption").value.trim());
    formData.append("credited_author", document.getElementById("meme-credited").value.trim());
    formData.append("is_anonymous", document.getElementById("meme-anon").checked);

    try {
      await api("POST", "/memes", formData, true);
      closeModal();
      toast(t("meme_posted"));
      state.currentPage = 1;
      state.currentSort = "new";
      renderFeed("memes");
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.add("visible");
    }
  });
}

export function openEditMemeModal(meme) {
  openModal(`
    <div class="modal-header">
      <h2>${t("edit_meme")}</h2>
      <button class="modal-close" id="modal-close-btn">✕</button>
    </div>
    <form id="meme-edit-form">
      <div class="form-group">
        <label for="meme-caption">${t("caption_label")}</label>
        <input type="text" id="meme-caption" value="${escHtml(meme.caption || '')}" placeholder="${t("caption_placeholder")}">
      </div>
      <p class="form-error" id="meme-edit-error"></p>
      <button type="submit" class="form-submit">${t("save")}</button>
    </form>
  `);

  document.getElementById("modal-close-btn").addEventListener("click", closeModal);

  document.getElementById("meme-edit-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("meme-edit-error");
    errorEl.classList.remove("visible");

    try {
      await api("PATCH", `/memes/${meme.id}`, {
        caption: document.getElementById("meme-caption").value.trim() || null,
      });
      closeModal();
      toast(t("save"));
      renderFeed("memes");
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.add("visible");
    }
  });
}
