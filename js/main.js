// ─── Traversy Media Feedback App — main.js ───────────────────────────────

const API_BASE = 'api'; // relative path — works with php -S localhost:8000

// ══════════════════════════════════════════════════════════════════════════
//  FEEDBACK FORM (feedback.html)
// ══════════════════════════════════════════════════════════════════════════
const feedbackForm = document.getElementById('feedback-form');

if (feedbackForm) {
    feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        const name    = document.getElementById('name').value.trim();
        const email   = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        // Client-side validation
        let valid = true;
        if (!name)                     { showError('name-error',    'Name is required.');           valid = false; }
        if (!email)                    { showError('email-error',   'Email is required.');          valid = false; }
        else if (!isValidEmail(email)) { showError('email-error',   'Enter a valid email address.'); valid = false; }
        if (!message)                  { showError('message-error', 'Please write your feedback.'); valid = false; }

        if (!valid) return;

        // Submit
        const btn = feedbackForm.querySelector('button[type="submit"]');
        setLoading(btn, true);

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('message', message);

            const res  = await fetch(`${API_BASE}/submit.php`, { method: 'POST', body: formData });
            const data = await res.json();

            if (data.success) {
                showToast('Feedback sent! Thank you.', 'success');
                feedbackForm.reset();
            } else {
                const msgs = data.errors || [data.error || 'Something went wrong.'];
                msgs.forEach(m => showToast(m, 'error'));
            }
        } catch (err) {
            showToast('Network error — is the PHP server running?', 'error');
        } finally {
            setLoading(btn, false);
        }
    });
}

// ══════════════════════════════════════════════════════════════════════════
//  FEEDBACK LIST PAGE (feedback-list.html)
// ══════════════════════════════════════════════════════════════════════════
const feedbackList = document.getElementById('feedback-list');

if (feedbackList) {
    loadFeedback();
}

async function loadFeedback() {
    feedbackList.innerHTML = `<div class="loading-state"><div class="spinner"></div><p>Loading feedback…</p></div>`;

    try {
        const res  = await fetch(`${API_BASE}/feedback.php`);
        const data = await res.json();

        if (!data.success) throw new Error(data.error);

        if (data.data.length === 0) {
            feedbackList.innerHTML = `<div class="empty-state"><p>No feedback yet. Be the first!</p></div>`;
            return;
        }

        feedbackList.innerHTML = data.data.map(renderCard).join('');
        // Stagger card entrance
        document.querySelectorAll('.feedback-card').forEach((card, i) => {
            card.style.animationDelay = `${i * 60}ms`;
        });
    } catch (err) {
        feedbackList.innerHTML = `<div class="empty-state error"><p>Could not load feedback: ${err.message}</p></div>`;
    }
}

function renderCard({ name, email, message, created_at }) {
    const date    = new Date(created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const initial = name.charAt(0).toUpperCase();
    // mask email for privacy: k***@gmail.com
    const masked  = maskEmail(email);

    return `
    <article class="feedback-card fade-in">
      <div class="card-header">
        <div class="avatar">${initial}</div>
        <div class="card-meta">
          <span class="card-name">${escHtml(name)}</span>
          <span class="card-email">${masked}</span>
        </div>
        <time class="card-date">${date}</time>
      </div>
      <p class="card-message">${escHtml(message)}</p>
    </article>`;
}

// ══════════════════════════════════════════════════════════════════════════
//  UTILITIES
// ══════════════════════════════════════════════════════════════════════════
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(id, msg) {
    const el = document.getElementById(id);
    if (el) { el.textContent = msg; el.classList.add('visible'); }
}

function clearErrors() {
    document.querySelectorAll('.field-error').forEach(el => {
        el.textContent = ''; el.classList.remove('visible');
    });
}

function setLoading(btn, loading) {
    btn.disabled     = loading;
    btn.textContent  = loading ? 'Sending…' : 'Send Feedback';
}

function maskEmail(email) {
    const [user, domain] = email.split('@');
    return user.charAt(0) + '***@' + domain;
}

function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Toast notification
function showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3500);
}

function createToastContainer() {
    const div = document.createElement('div');
    div.id = 'toast-container';
    document.body.appendChild(div);
    return div;
}
