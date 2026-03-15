'use strict';
/* ============================================================
   FIXES.JS v5 — load LAST
   ============================================================ */

/* ─────────────────────────────────────────────
   1. SIDEBAR TOGGLE — desktop push, mobile overlay
   ─────────────────────────────────────────────*/
(function initSidebar() {
  const sidebar   = document.getElementById('sidebar');
  const hamburger = document.getElementById('hamburger');
  const overlay   = document.getElementById('sidebar-overlay');
  if (!sidebar) return;

  const BP = 960;

  // Inject desktop toggle button
  const btn = document.createElement('button');
  btn.id = 'sidebar-toggle-btn';
  btn.setAttribute('aria-label', 'Toggle sidebar');
  document.body.appendChild(btn);

  let open = localStorage.getItem('sidebarOpen') !== 'false';

  function isMobile() { return window.innerWidth < BP; }

  function apply(animate) {
    const mc   = document.getElementById('main-content');
    const foot = document.querySelector('.site-footer');

    if (!animate) {
      const dur = '0s';
      [sidebar, mc, foot, btn].forEach(el => el && (el.style.transition = dur));
    }

    if (isMobile()) {
      btn.style.display = 'none';
      if (open) {
        sidebar.classList.remove('sidebar-collapsed');
        sidebar.classList.add('open');
        overlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
        hamburger?.classList.add('is-open');
      } else {
        sidebar.classList.remove('open');
        sidebar.classList.add('sidebar-collapsed');
        overlay?.classList.remove('active');
        document.body.style.overflow = '';
        hamburger?.classList.remove('is-open');
      }
      document.body.classList.remove('sidebar-closed');
    } else {
      btn.style.display = 'flex';
      overlay?.classList.remove('active');
      document.body.style.overflow = '';
      hamburger?.classList.remove('is-open');
      sidebar.classList.remove('open');
      if (open) {
        sidebar.classList.remove('sidebar-collapsed');
        document.body.classList.remove('sidebar-closed');
      } else {
        sidebar.classList.add('sidebar-collapsed');
        document.body.classList.add('sidebar-closed');
      }
    }

    if (!animate) {
      requestAnimationFrame(() => {
        [sidebar, mc, foot, btn].forEach(el => el && (el.style.transition = ''));
      });
    }
  }

  function toggle() {
    open = !open;
    localStorage.setItem('sidebarOpen', open);
    apply(true);
  }

  btn.addEventListener('click', toggle);
  hamburger?.addEventListener('click', e => { e.stopPropagation(); toggle(); });
  overlay?.addEventListener('click', () => { if (isMobile() && open) toggle(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isMobile() && open) toggle(); });
  sidebar.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => { if (isMobile() && open) toggle(); }));

  let resizeT;
  window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(() => apply(false), 120); }, { passive: true });
  apply(false);
})();

/* ─────────────────────────────────────────────
   2. BRAND LOGO — Chinese name only
   ─────────────────────────────────────────────*/
(function injectBrandLogo() {
  const wrap = document.getElementById('sidebar-logo-wrap');
  if (!wrap) return;
  wrap.innerHTML = '';

  const link = document.createElement('a');
  link.href = '/';
  link.className = 'brand-mark';
  link.setAttribute('aria-label', '林元薇 — Home');
  link.title = '林元薇';

  link.innerHTML = `<svg viewBox="0 0 120 72" xmlns="http://www.w3.org/2000/svg" width="160" height="72">
    <defs>
      <linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#B8860B"/>
        <stop offset="40%" stop-color="#FFD700"/>
        <stop offset="100%" stop-color="#B8860B"/>
      </linearGradient>
      <linearGradient id="lg2" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#D4AF37" stop-opacity="0"/>
        <stop offset="50%" stop-color="#D4AF37" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#D4AF37" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <!-- decorative top line -->
    <line x1="10" y1="10" x2="110" y2="10" stroke="url(#lg2)" stroke-width="0.75"/>
    <!-- small ornament left & right -->
    <polygon points="10,10 14,7 14,13" fill="#D4AF37" opacity="0.5"/>
    <polygon points="110,10 106,7 106,13" fill="#D4AF37" opacity="0.5"/>
    <!-- main Chinese name -->
    <text x="60" y="46" text-anchor="middle"
      font-family="'Noto Serif SC','SimSun','STSong',serif"
      font-size="28" font-weight="500" fill="url(#lg1)"
      letter-spacing="8">林元薇</text>
    <!-- decorative bottom line -->
    <line x1="10" y1="58" x2="110" y2="58" stroke="url(#lg2)" stroke-width="0.75"/>
    <!-- subtitle -->
    <text x="60" y="68" text-anchor="middle"
      font-family="'Cinzel',serif" font-size="6.5" fill="#D4AF37" opacity="0.55"
      letter-spacing="4">CHEATSHEET</text>
  </svg>`;

  wrap.appendChild(link);
})();

/* ─────────────────────────────────────────────
   3. GLOBAL SEARCH OVERLAY
   ─────────────────────────────────────────────*/
(function initSearch() {
  const overlay = document.createElement('div');
  overlay.id = 'search-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = `
    <div class="search-box">
      <div class="search-input-row">
        <div class="search-icon-wrap" aria-hidden="true"></div>
        <input id="global-search-input" type="search" placeholder="Search sections, properties, elements…" autocomplete="off" spellcheck="false">
        <button class="search-close-btn" id="search-close-btn">ESC</button>
      </div>
      <div id="search-results"></div>
      <div class="search-hint"><span><kbd>↑↓</kbd> navigate</span><span><kbd>↵</kbd> go</span><span><kbd>ESC</kbd> close</span></div>
    </div>`;
  document.body.appendChild(overlay);

  const input   = document.getElementById('global-search-input');
  const results = document.getElementById('search-results');

  // Build search index
  const index = [];
  document.querySelectorAll('section.doc-section, article.prop-card').forEach(el => {
    const sec   = el.closest('section.doc-section') || el;
    const secT  = sec.querySelector('h2')?.textContent.replace(/[▼↓★☆]/g,'').trim() || '';
    const title = el.querySelector('h2,h3')?.textContent.replace(/[▼↓★☆]/g,'').trim() || '';
    const snip  = Array.from(el.querySelectorAll('.prop-description p, p')).slice(0,2).map(p=>p.textContent).join(' ').slice(0,200);
    const id    = el.id || sec.id;
    if (!id || !title) return;
    index.push({ id, title, section: secT, snippet: snip });
  });

  let hi = -1;

  function esc(s) { return s.replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function mark(txt, q) {
    if (!q) return esc(txt);
    return esc(txt).replace(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi'), '<mark>$1</mark>');
  }

  function render(q) {
    const qn = q.trim().toLowerCase();
    results.innerHTML = '';
    hi = -1;
    if (!qn) { results.innerHTML = '<p class="search-empty">Start typing to search…</p>'; return; }
    const hits = index.filter(i =>
      i.title.toLowerCase().includes(qn) || i.section.toLowerCase().includes(qn) || i.snippet.toLowerCase().includes(qn)
    ).slice(0,18);
    if (!hits.length) { results.innerHTML = `<p class="search-empty">No results for "<strong>${esc(q)}</strong>"</p>`; return; }
    hits.forEach(item => {
      const a = document.createElement('a');
      a.className = 'search-result-item';
      a.href = `#${item.id}`;
      a.innerHTML = `<span class="result-section">${mark(item.section||'Section',q)}</span><span class="result-title">${mark(item.title,q)}</span>${item.snippet?`<span class="result-snippet">${mark(item.snippet.slice(0,100),q)}</span>`:''}`;
      a.addEventListener('click', () => { closeSearch(); currentSection = item.section || item.title; updateCtx(); });
      results.appendChild(a);
    });
  }

  function openSearch()  { overlay.classList.add('open'); input?.focus(); render(''); document.body.style.overflow = 'hidden'; }
  function closeSearch() { overlay.classList.remove('open'); document.body.style.overflow = ''; if(input) input.value=''; }

  input?.addEventListener('input', e => render(e.target.value));
  input?.addEventListener('keydown', e => {
    const items = results.querySelectorAll('.search-result-item');
    if (e.key==='ArrowDown')  { e.preventDefault(); hi=Math.min(hi+1,items.length-1); }
    else if(e.key==='ArrowUp'){ e.preventDefault(); hi=Math.max(hi-1,0); }
    else if(e.key==='Enter'&&hi>=0){ e.preventDefault(); items[hi]?.click(); return; }
    items.forEach((el,i)=>el.classList.toggle('highlighted',i===hi));
    if(hi>=0) items[hi]?.scrollIntoView({block:'nearest'});
  });

  document.getElementById('search-close-btn')?.addEventListener('click', closeSearch);
  overlay.addEventListener('click', e=>{ if(e.target===overlay) closeSearch(); });
  document.addEventListener('keydown', e=>{
    if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();openSearch();}
    if(e.key==='Escape'&&overlay.classList.contains('open')) closeSearch();
  });
  const ss = document.getElementById('sidebar-search');
  if(ss){ ss.placeholder='Search… (⌘K)'; ss.addEventListener('focus',()=>{ss.blur();openSearch();}); }
})();

/* ─────────────────────────────────────────────
   4. NOTES SYSTEM
   ─────────────────────────────────────────────*/

let currentSection = 'General';
let notesOpen = false;
let notesExpanded = false;

function updateCtx() {
  const el = document.getElementById('notes-context-label');
  if (el) el.textContent = currentSection;
}

// Track visible section
(function trackSection() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const h2 = e.target.querySelector('h2');
        currentSection = h2?.textContent.replace(/[▼↓★☆]/g,'').trim() || e.target.id;
        updateCtx();
      }
    });
  }, { rootMargin: '-10% 0px -70% 0px' });
  document.querySelectorAll('section.doc-section[id]').forEach(s => io.observe(s));
})();

(function initNotes() {
  const panel = document.createElement('div');
  panel.id = 'notes-panel';
  panel.innerHTML = `
    <div class="notes-header">
      <span class="notes-header-title">Notes</span>
      <div class="notes-header-actions">
        <button class="notes-icon-btn" id="notes-expand-btn" title="Expand / Shrink">⤢</button>
        <button class="notes-icon-btn" id="notes-close-btn" title="Close">✕</button>
      </div>
    </div>
    <div class="notes-add-form">
      <span class="notes-context-label" id="notes-context-label">General</span>
      <textarea class="notes-textarea" id="notes-input" placeholder="Add a note for this section… (⌘+Enter to save)" rows="3"></textarea>
      <div class="notes-form-actions">
        <button class="notes-add-btn" id="notes-save-btn">Save Note</button>
      </div>
    </div>
    <div class="notes-bulk-bar">
      <button class="notes-bulk-btn" id="notes-copy-all">Copy All</button>
      <button class="notes-bulk-btn" id="notes-collapse-all">Collapse All</button>
      <button class="notes-bulk-btn" id="notes-expand-all">Expand All</button>
      <button class="notes-bulk-btn danger" id="notes-delete-all">Delete All</button>
    </div>
    <div id="notes-list"></div>`;
  document.body.appendChild(panel);

  const fab = document.createElement('button');
  fab.id = 'notes-fab';
  fab.setAttribute('aria-label', 'Notes');
  fab.title = 'Notes (N)';
  const badge = document.createElement('span');
  badge.id = 'notes-count-badge';
  fab.appendChild(badge);
  document.body.appendChild(fab);

  const notesList  = document.getElementById('notes-list');
  const notesInput = document.getElementById('notes-input');

  function load()         { return JSON.parse(localStorage.getItem('enc_notes_v3') || '[]'); }
  function save(notes)    { localStorage.setItem('enc_notes_v3', JSON.stringify(notes)); updateBadge(); }
  function updateBadge()  { const n=load().length; badge.textContent=n; badge.classList.toggle('visible',n>0); }
  function esc(s)         { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function render() {
    const notes = load();
    notesList.innerHTML = '';
    if (!notes.length) {
      notesList.innerHTML = '<p class="notes-empty">No notes yet. Add your first note above.</p>';
      return;
    }

    notes.slice().reverse().forEach((note, ri) => {
      const idx = notes.length - 1 - ri;
      const card = document.createElement('div');
      card.className = 'note-card';
      const when = new Date(note.ts).toLocaleDateString(undefined, { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });

      card.innerHTML = `
        <div class="note-card-header">
          <span class="note-section-tag" title="${esc(note.section)}">${esc(note.section)}</span>
          <div class="note-card-actions">
            <button class="note-action-btn jump" title="Jump to section">
              <svg viewBox="0 0 24 24"><path d="M12 2l-1 1 7 7H2v2h16l-7 7 1 1 9-9z"/></svg>
            </button>
            <button class="note-action-btn copy-one" title="Copy note">
              <svg viewBox="0 0 24 24"><path d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z"/></svg>
            </button>
            <button class="note-action-btn delete" title="Delete note">
              <svg viewBox="0 0 24 24"><path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
            </button>
          </div>
          <span class="note-collapse-arrow">▼</span>
        </div>
        <div class="note-card-body">${esc(note.text)}<span class="note-time">${when}</span></div>`;

      // Collapse header click
      card.querySelector('.note-card-header').addEventListener('click', e => {
        if (e.target.closest('.note-action-btn')) return;
        card.classList.toggle('collapsed');
      });

      // Jump
      card.querySelector('.jump').addEventListener('click', e => {
        e.stopPropagation();
        const target = [...document.querySelectorAll('section.doc-section,article.prop-card')]
          .find(el => el.querySelector('h2,h3')?.textContent.replace(/[▼↓★☆]/g,'').trim() === note.section);
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Close panel on mobile
        if (window.innerWidth < 700) { notesOpen = false; panel.classList.remove('open'); }
      });

      // Copy one
      card.querySelector('.copy-one').addEventListener('click', e => {
        e.stopPropagation();
        navigator.clipboard?.writeText(`[${note.section}]\n${note.text}`).catch(()=>{});
        const btn = card.querySelector('.copy-one');
        const orig = btn.innerHTML;
        btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>`;
        setTimeout(() => btn.innerHTML = orig, 1500);
      });

      // Delete
      card.querySelector('.delete').addEventListener('click', e => {
        e.stopPropagation();
        card.style.opacity = '0'; card.style.transform = 'scaleY(0)'; card.style.transition = 'all 0.2s';
        setTimeout(() => {
          const notes2 = load(); notes2.splice(idx,1); save(notes2); render();
        }, 200);
      });

      notesList.appendChild(card);
    });
  }

  // Save
  document.getElementById('notes-save-btn')?.addEventListener('click', () => {
    const t = notesInput?.value.trim();
    if (!t) return;
    const notes = load();
    notes.push({ section: currentSection, text: t, ts: Date.now() });
    save(notes); render();
    if (notesInput) { notesInput.value = ''; notesInput.focus(); }
  });
  notesInput?.addEventListener('keydown', e => {
    if ((e.ctrlKey||e.metaKey) && e.key==='Enter') document.getElementById('notes-save-btn')?.click();
  });

  // Bulk: copy all
  document.getElementById('notes-copy-all')?.addEventListener('click', () => {
    const notes = load();
    if (!notes.length) return;
    const text = notes.map(n => `[${n.section}]\n${n.text}`).join('\n\n---\n\n');
    navigator.clipboard?.writeText(text).catch(()=>{});
    const btn = document.getElementById('notes-copy-all');
    const orig = btn.textContent; btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = orig, 1800);
  });

  // Bulk: collapse all
  document.getElementById('notes-collapse-all')?.addEventListener('click', () => {
    notesList.querySelectorAll('.note-card').forEach(c => c.classList.add('collapsed'));
  });

  // Bulk: expand all
  document.getElementById('notes-expand-all')?.addEventListener('click', () => {
    notesList.querySelectorAll('.note-card').forEach(c => c.classList.remove('collapsed'));
  });

  // Bulk: delete all
  document.getElementById('notes-delete-all')?.addEventListener('click', () => {
    if (!confirm('Delete all notes? This cannot be undone.')) return;
    save([]); render();
  });

  // Expand toggle
  document.getElementById('notes-expand-btn')?.addEventListener('click', () => {
    notesExpanded = !notesExpanded;
    panel.classList.toggle('expanded', notesExpanded);
    const btn = document.getElementById('notes-expand-btn');
    btn.textContent = notesExpanded ? '⤡' : '⤢';
    btn.title = notesExpanded ? 'Shrink' : 'Expand';
  });

  // Close
  document.getElementById('notes-close-btn')?.addEventListener('click', () => {
    notesOpen = false; notesExpanded = false;
    panel.classList.remove('open','expanded');
    const btn = document.getElementById('notes-expand-btn');
    if (btn) { btn.textContent = '⤢'; btn.title = 'Expand'; }
  });

  // FAB
  fab.addEventListener('click', () => {
    notesOpen = !notesOpen;
    panel.classList.toggle('open', notesOpen);
    if (notesOpen) { render(); updateCtx(); }
  });

  // Keyboard N
  document.addEventListener('keydown', e => {
    if (e.key==='n' && !['INPUT','TEXTAREA'].includes(e.target.tagName)) {
      notesOpen = !notesOpen;
      panel.classList.toggle('open', notesOpen);
      if (notesOpen) { render(); updateCtx(); }
    }
  });

  updateBadge();
  updateCtx();
})();

/* ─────────────────────────────────────────────
   5. THEME ICON (SVG)
   ─────────────────────────────────────────────*/
(function themeIcon() {
  const el = document.getElementById('theme-icon');
  if (!el) return;
  function set(theme) {
    el.innerHTML = theme==='dark'
      ? `<span class="toggle-icon--sun" aria-hidden="true"></span>`
      : `<span class="toggle-icon--moon" aria-hidden="true"></span>`;
  }
  set(document.documentElement.getAttribute('data-theme')||'dark');
  document.getElementById('theme-toggle')?.addEventListener('click', () =>
    setTimeout(()=>set(document.documentElement.getAttribute('data-theme')||'dark'), 10));
})();

/* ─────────────────────────────────────────────
   6. SOCIAL ICON CLASSES
   ─────────────────────────────────────────────*/
(function socialIcons() {
  const map = { Instagram:'social-icon--instagram', TikTok:'social-icon--tiktok', LinkedIn:'social-icon--linkedin', Email:'social-icon--email' };
  document.querySelectorAll('.social-link').forEach(link => {
    const platform = link.querySelector('.social-platform')?.textContent.trim();
    const icon     = link.querySelector('.social-icon');
    if (!icon||!platform||!map[platform]) return;
    icon.innerHTML = '';
    icon.className = 'social-icon ' + map[platform];
  });
})();

/* ─────────────────────────────────────────────
   7. MISC CLEANUP
   ─────────────────────────────────────────────*/
// Remove lang label emoji
const ll = document.querySelector('.lang-switcher label');
if (ll) ll.textContent = 'Language';