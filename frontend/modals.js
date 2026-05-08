import { state, dom } from "./state.js";
import { api, toast } from "./api.js";
import { renderFeed } from "./feed.js";

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
      <h2>Post a Quote</h2>
      <button class="modal-close" id="modal-close-btn">✕</button>
    </div>
    <form id="quote-form">
      <div class="form-group">
        <label for="quote-text">Quote</label>
        <textarea id="quote-text" placeholder="Enter the quote..." required></textarea>
      </div>
      <div class="form-group">
        <label for="quote-author">Who said it?</label>
        <input type="text" id="quote-author" placeholder="e.g. Albert Einstein" required>
      </div>
      <div class="form-group">
        <label for="quote-said-at">When was it said?</label>
        <input type="text" id="quote-said-at" placeholder="e.g. June 2023, last Tuesday">
      </div>
      <p class="form-error" id="quote-error"></p>
      <button type="submit" class="form-submit">Post Quote</button>
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
      });
      closeModal();
      toast("Quote posted!");
      state.currentPage = 1;
      state.currentSort = "new";
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
      <h2>Post a Meme</h2>
      <button class="modal-close" id="modal-close-btn">✕</button>
    </div>
    <form id="meme-form">
      <div class="form-group">
        <label>Image</label>
        <div class="file-input-wrap">
          <input type="file" id="meme-file" accept="image/*" required>
          <div class="file-input-label" id="file-label">📁 Choose an image or drag & drop</div>
        </div>
      </div>
      <div class="form-group">
        <label for="meme-caption">Caption</label>
        <input type="text" id="meme-caption" placeholder="Add a caption (optional)">
      </div>
      <div class="form-group">
        <label for="meme-credited">Credited to</label>
        <input type="text" id="meme-credited" placeholder="Original author (optional)">
      </div>
      <p class="form-error" id="meme-error"></p>
      <button type="submit" class="form-submit">Post Meme</button>
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
      fileLabel.textContent = "📁 Choose an image or drag & drop";
      fileLabel.classList.remove("has-file");
    }
  });

  document.getElementById("meme-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById("meme-error");
    errorEl.classList.remove("visible");

    const file = fileInput.files[0];
    if (!file) {
      errorEl.textContent = "Please select an image";
      errorEl.classList.add("visible");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    formData.append("caption", document.getElementById("meme-caption").value.trim());
    formData.append("credited_author", document.getElementById("meme-credited").value.trim());

    try {
      await api("POST", "/memes", formData, true);
      closeModal();
      toast("Meme posted!");
      state.currentPage = 1;
      state.currentSort = "new";
      renderFeed("memes");
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.classList.add("visible");
    }
  });
}
