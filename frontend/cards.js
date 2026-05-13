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
    <article class="card quote-card" style="animation-delay:${delay}s" data-content-type="quote" data-content-id="${q.id}" data-user-vote="${q.user_vote ?? 'null'}">
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
          ${deleteBtn}
          ${editBtn}
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
    <article class="card" style="animation-delay:${delay}s" data-content-type="meme" data-content-id="${m.id}" data-user-vote="${m.user_vote ?? 'null'}">
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
          ${deleteBtn}
          ${editBtn}
        </div>
      </div>
    </article>
  `;
}

// Dynamic import used in attachEditListeners to avoid circular dependency

export function attachEditListeners(container) {
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

export function attachVoteListeners(container) {
  container.querySelectorAll(".vote-btn:not([data-bound])").forEach(btn => {
    btn.setAttribute("data-bound", "1");
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (!state.auth.token) {
        toast(t("login_required_vote") || "Log in to vote", "error");
        return;
      }
      
      const card = btn.closest(".card");
      const contentType = card.dataset.contentType;
      const contentId = parseInt(card.dataset.contentId, 10);
      const value = parseInt(btn.dataset.value, 10);

      const currentVote = parseInt(card.dataset.userVote) || null;

      try {
        const result = await api("POST", "/vote", {
          content_type: contentType,
          content_id: contentId,
          value: value,
        });

        // Update the card's dataset
        card.dataset.userVote = result.user_vote ?? "null";

        // Re-render the card's voting DOM elements from the API response
        const scoreEl = card.querySelector(".vote-score");
        const upBtn = card.querySelector(".vote-btn.upvote");
        const downBtn = card.querySelector(".vote-btn.downvote");
        
        scoreEl.textContent = result.new_score;
        scoreEl.className = `vote-score ${scoreClass(result.new_score)}`;
        
        upBtn.classList.remove("active");
        downBtn.classList.remove("active");

        if (result.user_vote === 1) {
          upBtn.classList.add("active");
        } else if (result.user_vote === -1) {
          downBtn.classList.add("active");
        }
      } catch (err) {
        toast(err.message, "error");
      }
    });
  });
}

export function attachDeleteListeners(container) {
  container.querySelectorAll(".card-delete-btn:not([data-bound])").forEach(btn => {
    btn.setAttribute("data-bound", "1");
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (btn.dataset.confirming === "1") {
        const id = btn.dataset.id;
        const endpointType = btn.dataset.type;
        try {
          await api("DELETE", `/${endpointType}/${id}`);
          btn.closest(".card").remove();
          toast(t("deleted"));
        } catch (err) {
          toast(err.message, "error");
          reset();
        }
        return;
      }

      const orig = btn.innerHTML;
      const reset = () => {
        btn.innerHTML = orig;
        btn.classList.remove("confirming");
        delete btn.dataset.confirming;
      };

      btn.dataset.confirming = "1";
      btn.classList.add("confirming");
      btn.innerHTML = "❓"; // Simple question mark emoji for confirmation
      
      setTimeout(() => {
        if (btn.dataset.confirming === "1") reset();
      }, 3000);
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
