import { state } from "./state.js";
import { api, toast } from "./api.js";
import { escHtml, timeAgo, scoreClass } from "./utils.js";
import { t } from "./i18n.js";

export function quoteCard(q, index) {
  const delay = index * 0.04;
  const isAuthor = state.auth.token && q.posted_by_user_id === state.auth.userId;
  const canModify = state.auth.token && (isAuthor || state.auth.is_admin);
  
  const editBtn = canModify
    ? `<button class="card-edit-btn" data-id="${q.id}" data-type="quotes">✏️</button>`
    : "";
  const deleteBtn = canModify
    ? `<button class="card-delete-btn" data-id="${q.id}" data-type="quotes">🗑️</button>`
    : "";

  const authorDisplay = q.is_anonymous ? t("anonymous") : `@${escHtml(q.posted_by_username)}`;
  const editedMark = q.edited_at ? ` (${t("edited")} ${timeAgo(q.edited_at)})` : "";

  return `
    <article class="card quote-card" style="animation-delay:${delay}s" data-content-type="quote" data-content-id="${q.id}">
      <p class="quote-text">“${escHtml(q.text)}”</p>
      <div class="expanded-content">
        <div>
          <span class="quote-author">— ${escHtml(q.attributed_author)}</span>
          ${q.said_at ? `<span class="quote-said-at"> · ${escHtml(q.said_at)}</span>` : ""}
        </div>
      </div>
      <div class="card-footer-minimal">
        <div class="meta-minimal">
          ${authorDisplay} · ${timeAgo(q.publish_date)}${editedMark}
        </div>
        <div class="controls-minimal">
          <div class="vote-controls-minimal">
            <button class="vote-btn upvote ${q.user_vote === 1 ? 'active' : ''}" data-value="1" aria-label="Upvote">▲</button>
            <span class="vote-score ${scoreClass(q.score)}">${q.score}</span>
            <button class="vote-btn downvote ${q.user_vote === -1 ? 'active' : ''}" data-value="-1" aria-label="Downvote">▼</button>
          </div>
          ${editBtn}
          ${deleteBtn}
        </div>
      </div>
    </article>
  `;
}

export function memeCard(m, index) {
  const delay = index * 0.04;
  const isAuthor = state.auth.token && m.posted_by_user_id === state.auth.userId;
  const canModify = state.auth.token && (isAuthor || state.auth.is_admin);
  
  const editBtn = canModify
    ? `<button class="card-edit-btn" data-id="${m.id}" data-type="memes">✏️</button>`
    : "";
  const deleteBtn = canModify
    ? `<button class="card-delete-btn" data-id="${m.id}" data-type="memes">🗑️</button>`
    : "";

  const authorDisplay = m.is_anonymous ? t("anonymous") : `@${escHtml(m.posted_by_username)}`;
  const editedMark = m.edited_at ? ` (${t("edited")} ${timeAgo(m.edited_at)})` : "";

  return `
    <article class="card" style="animation-delay:${delay}s" data-content-type="meme" data-content-id="${m.id}">
      <div class="meme-image-wrap">
        <img class="meme-image" src="/uploads/${escHtml(m.image_filename)}" alt="${escHtml(m.caption || 'Meme')}" loading="lazy">
      </div>
      ${m.caption ? `<p class="meme-caption">${escHtml(m.caption)}</p>` : ""}
      ${m.credited_author ? `<p class="meme-credited">${t("by")} ${escHtml(m.credited_author)}</p>` : ""}
      <div class="card-footer-minimal">
        <div class="meta-minimal">
          ${authorDisplay} · ${timeAgo(m.publish_date)}${editedMark}
        </div>
        <div class="controls-minimal">
          <div class="vote-controls-minimal">
            <button class="vote-btn upvote ${m.user_vote === 1 ? 'active' : ''}" data-value="1" aria-label="Upvote">▲</button>
            <span class="vote-score ${scoreClass(m.score)}">${m.score}</span>
            <button class="vote-btn downvote ${m.user_vote === -1 ? 'active' : ''}" data-value="-1" aria-label="Downvote">▼</button>
          </div>
          ${editBtn}
          ${deleteBtn}
        </div>
      </div>
    </article>
  `;
}

// Dynamic import used in attachEditListeners to avoid circular dependency

export function attachEditListeners(container, type) {
  container.querySelectorAll(".card-edit-btn:not([data-bound])").forEach(btn => {
    btn.setAttribute("data-bound", "1");
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const { openEditQuoteModal, openEditMemeModal } = await import("./modals.js");
      const id = btn.dataset.id;
      const endpointType = btn.dataset.type;
      
      const card = btn.closest(".card");
      if (endpointType === "quotes") {
        const text = card.querySelector(".quote-text").textContent.replace(/^“|”$/g, "");
        const author = card.querySelector(".quote-author").textContent.replace(/^— /, "");
        const saidAtEl = card.querySelector(".quote-said-at");
        const saidAt = saidAtEl ? saidAtEl.textContent.replace(/^ · /, "") : "";
        openEditQuoteModal({ id, text, attributed_author: author, said_at: saidAt });
      } else {
        const captionEl = card.querySelector(".meme-caption");
        const caption = captionEl ? captionEl.textContent : "";
        openEditMemeModal({ id, caption });
      }
    });
  });
}

export function attachVoteListeners(container, type) {
  container.querySelectorAll(".vote-btn:not([data-bound])").forEach(btn => {
    btn.setAttribute("data-bound", "1");
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const card = btn.closest(".card");
      const contentType = card.dataset.contentType;
      const contentId = parseInt(card.dataset.contentId, 10);
      const value = parseInt(btn.dataset.value, 10);

      const scoreEl = card.querySelector(".vote-score");
      const upBtn = card.querySelector(".vote-btn.upvote");
      const downBtn = card.querySelector(".vote-btn.downvote");
      const oldScore = parseInt(scoreEl.textContent, 10);

      const wasActive = btn.classList.contains("active");
      let newScore = oldScore;

      if (wasActive) {
        btn.classList.remove("active");
        newScore -= value;
      } else {
        const opposite = value === 1 ? downBtn : upBtn;
        if (opposite.classList.contains("active")) {
          opposite.classList.remove("active");
          newScore -= (value === 1 ? -1 : 1);
        }
        btn.classList.add("active");
        newScore += value;
      }

      scoreEl.textContent = newScore;
      scoreEl.className = `vote-score ${scoreClass(newScore)}`;

      try {
        const result = await api("POST", "/vote", {
          content_type: contentType,
          content_id: contentId,
          value: value,
        });

        scoreEl.textContent = result.new_score;
        scoreEl.className = `vote-score ${scoreClass(result.new_score)}`;
        upBtn.classList.toggle("active", result.user_vote === 1);
        downBtn.classList.toggle("active", result.user_vote === -1);
      } catch (err) {
        scoreEl.textContent = oldScore;
        scoreEl.className = `vote-score ${scoreClass(oldScore)}`;
        if (wasActive) btn.classList.add("active");
        else btn.classList.remove("active");
        toast(err.message, "error");
      }
    });
  });
}

export function attachDeleteListeners(container, type) {
  container.querySelectorAll(".card-delete-btn:not([data-bound])").forEach(btn => {
    btn.setAttribute("data-bound", "1");
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (btn.dataset.confirming === "1") return;
      if (!btn.dataset.confirmed) {
        btn.dataset.confirming = "1";
        const orig = btn.innerHTML;
        btn.innerHTML = t("sure");
        btn.style.color = "var(--negative)";
        btn.style.borderColor = "var(--negative)";
        const timer = setTimeout(() => { btn.innerHTML = orig; btn.style.color = ""; btn.style.borderColor = ""; delete btn.dataset.confirming; }, 2500);
        btn.addEventListener("click", async function confirmClick(e2) {
          e2.stopPropagation();
          clearTimeout(timer);
          btn.removeEventListener("click", confirmClick);
          delete btn.dataset.confirming;
          const id = btn.dataset.id;
          const endpointType = btn.dataset.type;
          try {
            await api("DELETE", `/${endpointType}/${id}`);
            btn.closest(".card").remove();
            toast(t("deleted"));
          } catch (err) {
            toast(err.message, "error");
            btn.innerHTML = orig;
            btn.style.color = "";
            btn.style.borderColor = "";
          }
        }, { once: true });
        return;
      }
    });
  });
}

export function attachExpandListeners(container) {
  container.querySelectorAll(".quote-card:not([data-expand-bound])").forEach(card => {
    card.setAttribute("data-expand-bound", "1");
    card.addEventListener("click", (e) => {
      if (e.target.closest("button") || e.target.closest("a")) return;
      card.classList.toggle("expanded");
    });
  });
}
