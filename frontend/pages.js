import { state, dom } from "./state.js";
import { api, toast } from "./api.js";
import { escHtml } from "./utils.js";
import { renderAuthArea, saveAuth } from "./auth.js";
import { route } from "./router.js";

export async function renderProfile() {
  if (!state.auth.token) { location.hash = "#login"; return; }

  dom.app.innerHTML = `
    <div class="profile-page">
      <div class="profile-header">
        <h2>Your Profile</h2>
        <p class="subtitle" id="profile-info">Loading...</p>
      </div>
      <div class="profile-grid">
        <div class="card profile-section">
          <h3 class="section-title">Change Password</h3>
          <form id="pw-form">
            <div class="form-group">
              <label for="pw-current">Current Password</label>
              <input type="password" id="pw-current" required minlength="4">
            </div>
            <div class="form-group">
              <label for="pw-new">New Password</label>
              <input type="password" id="pw-new" required minlength="4" maxlength="128">
            </div>
            <p class="form-error" id="pw-error"></p>
            <button type="submit" class="form-submit">Update Password</button>
          </form>
        </div>
        <div class="card profile-section profile-danger">
          <h3 class="section-title" style="color:var(--negative)">Danger Zone</h3>
          <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:16px">Permanently delete your account and all associated data. This cannot be undone.</p>
          <button class="form-submit" id="btn-delete-account" style="background:var(--negative)">Delete My Account</button>
        </div>
      </div>
    </div>
  `;

  try {
    const p = await api("GET", "/auth/me");
    document.getElementById("profile-info").innerHTML =
      `<strong>${escHtml(p.username)}</strong>${p.is_admin ? ' <span style="color:var(--accent)">(admin)</span>' : ''}<br>` +
      `Joined ${new Date(p.created_at).toLocaleDateString()}<br>` +
      `${p.quote_count} quotes · ${p.meme_count} memes`;
  } catch (_) { }

  document.getElementById("pw-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const errEl = document.getElementById("pw-error");
    errEl.classList.remove("visible");
    try {
      await api("PUT", "/auth/me/password", {
        current_password: document.getElementById("pw-current").value,
        new_password: document.getElementById("pw-new").value,
      });
      toast("Password changed!");
      document.getElementById("pw-form").reset();
    } catch (err) {
      errEl.textContent = err.message;
      errEl.classList.add("visible");
    }
  });

  let deleteStep = 0;
  const delBtn = document.getElementById("btn-delete-account");
  delBtn.addEventListener("click", async () => {
    if (deleteStep === 0) {
      delBtn.textContent = "Are you sure? Click again to confirm.";
      deleteStep = 1;
      setTimeout(() => { delBtn.textContent = "Delete My Account"; deleteStep = 0; }, 4000);
    } else {
      try {
        await api("DELETE", "/auth/me");
        state.auth = { token: null, username: null, is_admin: false };
        saveAuth();
        renderAuthArea();
        toast("Account deleted");
        location.hash = "#quotes";
        if (location.hash === "#quotes") route();
      } catch (err) { toast(err.message, "error"); }
    }
  });
}

export async function renderAdmin() {
  if (!state.auth.token || !state.auth.is_admin) {
    toast("Admin access required", "error");
    location.hash = "#quotes";
    return;
  }

  dom.app.innerHTML = `
    <h2 style="font-family:var(--font-heading);margin-bottom:24px;display:flex;align-items:center;gap:8px">
      ⚙️ Admin Panel
    </h2>
    <div id="admin-users-list">Loading users...</div>
  `;

  try {
    const users = await api("GET", "/admin/users");
    const list = document.getElementById("admin-users-list");

    if (users.length === 0) {
      list.innerHTML = "<p>No users found.</p>";
      return;
    }

    list.innerHTML = users.map(u => `
      <div class="card" style="padding:16px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px">
        <div>
          <strong style="font-size:1.1rem;color:var(--accent)">${escHtml(u.username)}</strong>
          ${u.is_admin ? '<span style="font-size:0.8rem;color:var(--text-secondary);margin-left:8px;text-transform:uppercase">ADMIN</span>' : ''}
          <div style="font-size:0.85rem;color:var(--text-muted);margin-top:4px">
            Joined ${new Date(u.created_at).toLocaleDateString()} · ${u.quote_count} quotes · ${u.meme_count} memes
          </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <button class="btn-ghost admin-reset-pw" data-id="${u.id}" style="font-size:0.8rem">🔑 Reset PW</button>
          <button class="btn-ghost admin-toggle-role" data-id="${u.id}" style="font-size:0.8rem">
            ${u.is_admin ? '👤 Remove Admin' : '🛡️ Make Admin'}
          </button>
          <button class="btn-logout admin-delete-user" data-id="${u.id}" data-name="${escHtml(u.username)}" style="font-size:0.8rem">
            🗑️ Delete
          </button>
        </div>
      </div>
    `).join("");

    list.querySelectorAll(".admin-reset-pw").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const card = btn.closest(".card");
        const existing = card.querySelector(".reset-pw-inline");
        if (existing) { existing.remove(); return; }

        const wrap = document.createElement("div");
        wrap.className = "reset-pw-inline";
        wrap.style.cssText = "display:flex;gap:8px;align-items:center;margin-top:12px;width:100%";
        wrap.innerHTML = `
          <input type="password" placeholder="New password" style="flex:1;padding:8px 12px;border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg-input);color:var(--text-primary);font-size:0.85rem">
          <button class="btn-accent" style="padding:8px 14px;font-size:0.8rem;white-space:nowrap">Save</button>
          <button class="btn-ghost" style="padding:8px;font-size:0.8rem">✕</button>
        `;
        card.appendChild(wrap);

        const input = wrap.querySelector("input");
        const saveBtn = wrap.querySelector(".btn-accent");
        const cancelBtn = wrap.querySelector(".btn-ghost");
        input.focus();

        cancelBtn.addEventListener("click", () => wrap.remove());
        saveBtn.addEventListener("click", async () => {
          const newPw = input.value.trim();
          if (!newPw) { input.style.borderColor = "var(--negative)"; return; }
          try {
            await api("PUT", `/admin/users/${btn.dataset.id}/password`, { new_password: newPw });
            toast("Password reset successfully");
            wrap.remove();
          } catch (err) { toast(err.message, "error"); }
        });

        input.addEventListener("keydown", (ev) => {
          if (ev.key === "Enter") saveBtn.click();
          if (ev.key === "Escape") wrap.remove();
        });
      });
    });

    list.querySelectorAll(".admin-toggle-role").forEach(btn => {
      btn.addEventListener("click", async () => {
        try {
          await api("PUT", `/admin/users/${btn.dataset.id}/role`);
          toast("Role updated");
          renderAdmin();
        } catch (err) { toast(err.message, "error"); }
      });
    });

    list.querySelectorAll(".admin-delete-user").forEach(btn => {
      let step = 0;
      btn.addEventListener("click", async () => {
        if (step === 0) {
          btn.innerHTML = "Sure?";
          btn.style.color = "var(--negative)";
          btn.style.borderColor = "var(--negative)";
          step = 1;
          setTimeout(() => { btn.innerHTML = "🗑️ Delete"; btn.style.color = ""; btn.style.borderColor = ""; step = 0; }, 3000);
        } else {
          try {
            await api("DELETE", `/admin/users/${btn.dataset.id}`);
            toast("User deleted");
            renderAdmin();
          } catch (err) { toast(err.message, "error"); }
        }
      });
    });

  } catch (err) {
    document.getElementById("admin-users-list").innerHTML = `<p style="color:var(--negative)">${escHtml(err.message)}</p>`;
  }
}
