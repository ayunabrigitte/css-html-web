/* ============================================================
   HTML & CSS ENCYCLOPEDIA — BAROQUE PURPLE × GOLD
   script.js — All interactive behaviors
   ============================================================ */

'use strict';

/* ============================================================
   THEME
   ============================================================ */

const html = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');
const themeIcon   = document.getElementById('theme-icon');
const themeLabel  = document.getElementById('theme-label');

function setTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  if (themeIcon)  themeIcon.textContent  = theme === 'dark' ? '☀️' : '🌙';
  if (themeLabel) themeLabel.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
}

function initTheme() {
  const saved = localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  setTheme(saved);
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme') || 'dark';
    setTheme(current === 'dark' ? 'light' : 'dark');
  });
}

initTheme();

/* ============================================================
   SIDEBAR COLLAPSE / EXPAND (category groups)
   ============================================================ */

document.querySelectorAll('.nav-category-title').forEach(title => {
  title.addEventListener('click', () => {
    const cat = title.closest('.nav-category');
    cat.classList.toggle('collapsed');
    const saved = JSON.parse(localStorage.getItem('navCollapsed') || '{}');
    const key = title.textContent.trim().replace(/\s+/g, '_');
    saved[key] = cat.classList.contains('collapsed');
    localStorage.setItem('navCollapsed', JSON.stringify(saved));
  });
});

// Restore collapse state
(function restoreNavCollapsed() {
  const saved = JSON.parse(localStorage.getItem('navCollapsed') || '{}');
  document.querySelectorAll('.nav-category-title').forEach(title => {
    const key = title.textContent.trim().replace(/\s+/g, '_');
    if (saved[key]) title.closest('.nav-category').classList.add('collapsed');
  });
})();

/* ============================================================
   SECTION COLLAPSE/EXPAND
   ============================================================ */

document.querySelectorAll('.section-header').forEach(header => {
  header.addEventListener('click', () => {
    header.closest('section.doc-section').classList.toggle('collapsed');
  });
});

document.querySelectorAll('.chapter-header').forEach(header => {
  header.addEventListener('click', () => {
    header.closest('.chapter').classList.toggle('collapsed');
  });
});

/* ============================================================
   MOBILE SIDEBAR
   ============================================================ */

const sidebar  = document.getElementById('sidebar');
const hamburger = document.getElementById('hamburger');
const overlay   = document.getElementById('sidebar-overlay');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
  });
}

if (overlay) {
  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
  });
}

/* ============================================================
   ACTIVE NAV LINK (Intersection Observer)
   ============================================================ */

const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { rootMargin: '-10% 0px -85% 0px', threshold: 0 });

document.querySelectorAll('section[id], article[id]').forEach(el => observer.observe(el));

/* ============================================================
   SIDEBAR SEARCH
   ============================================================ */

const searchInput = document.getElementById('sidebar-search');
if (searchInput) {
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase().trim();
    navLinks.forEach(a => {
      const text = a.textContent.toLowerCase();
      const li   = a.closest('li');
      if (li) li.style.display = (!q || text.includes(q)) ? '' : 'none';
    });
    // Show all categories if searching
    if (q) {
      document.querySelectorAll('.nav-category').forEach(c => c.classList.remove('collapsed'));
    }
  });
}

/* ============================================================
   COPY BUTTONS
   ============================================================ */

document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const targetId = btn.getAttribute('data-copy');
    let text = '';

    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) text = el.textContent;
    } else {
      const pre = btn.closest('.code-block')?.querySelector('pre code');
      if (pre) text = pre.textContent;
    }

    try {
      await navigator.clipboard.writeText(text.trim());
      btn.textContent = '✓ Copied';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = 'Copy';
        btn.classList.remove('copied');
      }, 2000);
    } catch {
      btn.textContent = 'Error';
    }
  });
});

/* ============================================================
   SCROLL PROGRESS BAR
   ============================================================ */

const progressBar = document.getElementById('scroll-progress');
if (progressBar) {
  window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    progressBar.style.width = docHeight ? `${(scrollTop / docHeight) * 100}%` : '0%';
  }, { passive: true });
}

/* ============================================================
   BACK TO TOP
   ============================================================ */

const backToTop = document.getElementById('back-to-top');
if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   TABS
   ============================================================ */

document.querySelectorAll('.tab-bar').forEach(bar => {
  bar.addEventListener('click', e => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    const tabGroup = bar.closest('.tab-group');
    const target   = btn.getAttribute('data-tab');

    bar.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    tabGroup.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.getAttribute('data-panel') === target);
    });
  });
});

/* ============================================================
   LANGUAGE SWITCHER
   ============================================================ */

const langSelect = document.getElementById('lang-select');
const translations = {
  en: {
    'lang-html-fund':   'HTML Fundamentals',
    'lang-semantic':    'Semantic HTML',
    'lang-forms':       'Forms & Input',
    'lang-tables':      'Tables & Data',
    'lang-media':       'Media & Embed',
    'lang-graphics':    'Graphics & SVG',
    'lang-interact':    'Interactive',
    'lang-metadata':    'Metadata & SEO',
    'lang-access':      'Accessibility',
    'lang-adv-html':    'Advanced HTML',
    'lang-css-fund':    'CSS Fundamentals',
    'lang-selectors':   'CSS Selectors',
    'lang-variables':   'CSS Variables',
    'lang-values':      'Values & Units',
    'lang-boxmodel':    'Box Model',
    'lang-typography':  'Typography',
    'lang-backgrounds': 'Backgrounds',
    'lang-borders':     'Borders & Shadows',
    'lang-layout':      'Layout Systems',
    'lang-position':    'Positioning',
    'lang-flexbox':     'Flexbox',
    'lang-grid':        'CSS Grid',
    'lang-transforms':  'Transforms',
    'lang-transitions': 'Transitions',
    'lang-animations':  'Animations',
    'lang-responsive':  'Responsive Design',
    'lang-functions':   'CSS Functions',
    'lang-adv-css':     'Advanced CSS',
    'lang-best':        'Best Practices',
    'lang-header-title': 'HTML & CSS Encyclopedia',
    'lang-header-sub':   'A complete baroque compendium of web standards & styles',
  },
  zh_s: {
    'lang-html-fund':   'HTML 基础',
    'lang-semantic':    '语义化 HTML',
    'lang-forms':       '表单与输入',
    'lang-tables':      '表格与数据',
    'lang-media':       '媒体与嵌入',
    'lang-graphics':    '图形与 SVG',
    'lang-interact':    '交互元素',
    'lang-metadata':    '元数据与 SEO',
    'lang-access':      '无障碍访问',
    'lang-adv-html':    '高级 HTML',
    'lang-css-fund':    'CSS 基础',
    'lang-selectors':   'CSS 选择器',
    'lang-variables':   'CSS 变量',
    'lang-values':      '值与单位',
    'lang-boxmodel':    '盒模型',
    'lang-typography':  '字体排印',
    'lang-backgrounds': '背景样式',
    'lang-borders':     '边框与阴影',
    'lang-layout':      '布局系统',
    'lang-position':    '定位',
    'lang-flexbox':     '弹性布局',
    'lang-grid':        '网格布局',
    'lang-transforms':  '变换',
    'lang-transitions': '过渡动画',
    'lang-animations':  'CSS 动画',
    'lang-responsive':  '响应式设计',
    'lang-functions':   'CSS 函数',
    'lang-adv-css':     '高级 CSS',
    'lang-best':        '最佳实践',
    'lang-header-title': 'HTML 与 CSS 百科全书',
    'lang-header-sub':   '网络标准与样式的完整手册',
  },
  zh_t: {
    'lang-html-fund':   'HTML 基礎',
    'lang-semantic':    '語義化 HTML',
    'lang-forms':       '表單與輸入',
    'lang-tables':      '表格與資料',
    'lang-media':       '媒體與嵌入',
    'lang-graphics':    '圖形與 SVG',
    'lang-interact':    '互動元素',
    'lang-metadata':    '元資料與 SEO',
    'lang-access':      '無障礙訪問',
    'lang-adv-html':    '進階 HTML',
    'lang-css-fund':    'CSS 基礎',
    'lang-selectors':   'CSS 選擇器',
    'lang-variables':   'CSS 變數',
    'lang-values':      '值與單位',
    'lang-boxmodel':    '盒子模型',
    'lang-typography':  '字體排印',
    'lang-backgrounds': '背景樣式',
    'lang-borders':     '邊框與陰影',
    'lang-layout':      '佈局系統',
    'lang-position':    '定位',
    'lang-flexbox':     '彈性佈局',
    'lang-grid':        '網格佈局',
    'lang-transforms':  '轉換',
    'lang-transitions': '過渡動畫',
    'lang-animations':  'CSS 動畫',
    'lang-responsive':  '響應式設計',
    'lang-functions':   'CSS 函數',
    'lang-adv-css':     '進階 CSS',
    'lang-best':        '最佳實踐',
    'lang-header-title': 'HTML 與 CSS 百科全書',
    'lang-header-sub':   '網路標準與樣式的完整手冊',
  },
  ja: {
    'lang-html-fund':   'HTML 基礎',
    'lang-semantic':    'セマンティック HTML',
    'lang-forms':       'フォームと入力',
    'lang-tables':      'テーブルとデータ',
    'lang-media':       'メディアと埋め込み',
    'lang-graphics':    'グラフィックと SVG',
    'lang-interact':    'インタラクティブ要素',
    'lang-metadata':    'メタデータと SEO',
    'lang-access':      'アクセシビリティ',
    'lang-adv-html':    '高度な HTML',
    'lang-css-fund':    'CSS 基礎',
    'lang-selectors':   'CSS セレクター',
    'lang-variables':   'CSS 変数',
    'lang-values':      '値と単位',
    'lang-boxmodel':    'ボックスモデル',
    'lang-typography':  'タイポグラフィ',
    'lang-backgrounds': '背景スタイル',
    'lang-borders':     '境界線と影',
    'lang-layout':      'レイアウトシステム',
    'lang-position':    '位置指定',
    'lang-flexbox':     'フレックスボックス',
    'lang-grid':        'CSS グリッド',
    'lang-transforms':  'トランスフォーム',
    'lang-transitions': 'トランジション',
    'lang-animations':  'CSS アニメーション',
    'lang-responsive':  'レスポンシブデザイン',
    'lang-functions':   'CSS 関数',
    'lang-adv-css':     '高度な CSS',
    'lang-best':        'ベストプラクティス',
    'lang-header-title': 'HTML と CSS 百科事典',
    'lang-header-sub':   'ウェブ標準とスタイルの完全手引き',
  },
  ko: {
    'lang-html-fund':   'HTML 기초',
    'lang-semantic':    '시맨틱 HTML',
    'lang-forms':       '폼 & 입력',
    'lang-tables':      '테이블 & 데이터',
    'lang-media':       '미디어 & 임베드',
    'lang-graphics':    '그래픽 & SVG',
    'lang-interact':    '인터랙티브',
    'lang-metadata':    '메타데이터 & SEO',
    'lang-access':      '접근성',
    'lang-adv-html':    '고급 HTML',
    'lang-css-fund':    'CSS 기초',
    'lang-selectors':   'CSS 선택자',
    'lang-variables':   'CSS 변수',
    'lang-values':      '값 & 단위',
    'lang-boxmodel':    '박스 모델',
    'lang-typography':  '타이포그래피',
    'lang-backgrounds': '배경 스타일',
    'lang-borders':     '테두리 & 그림자',
    'lang-layout':      '레이아웃 시스템',
    'lang-position':    '위치 지정',
    'lang-flexbox':     '플렉스박스',
    'lang-grid':        'CSS 그리드',
    'lang-transforms':  '변환',
    'lang-transitions': '트랜지션',
    'lang-animations':  'CSS 애니메이션',
    'lang-responsive':  '반응형 디자인',
    'lang-functions':   'CSS 함수',
    'lang-adv-css':     '고급 CSS',
    'lang-best':        '모범 사례',
    'lang-header-title': 'HTML & CSS 백과사전',
    'lang-header-sub':   '웹 표준 및 스타일의 완전한 안내서',
  },
  fr: {
    'lang-html-fund':   'Bases HTML',
    'lang-semantic':    'HTML Sémantique',
    'lang-forms':       'Formulaires & Saisie',
    'lang-tables':      'Tableaux & Données',
    'lang-media':       'Médias & Intégration',
    'lang-graphics':    'Graphiques & SVG',
    'lang-interact':    'Éléments Interactifs',
    'lang-metadata':    'Métadonnées & SEO',
    'lang-access':      'Accessibilité',
    'lang-adv-html':    'HTML Avancé',
    'lang-css-fund':    'Bases CSS',
    'lang-selectors':   'Sélecteurs CSS',
    'lang-variables':   'Variables CSS',
    'lang-values':      'Valeurs & Unités',
    'lang-boxmodel':    'Modèle de Boîte',
    'lang-typography':  'Typographie',
    'lang-backgrounds': 'Arrière-plans',
    'lang-borders':     'Bordures & Ombres',
    'lang-layout':      'Systèmes de Mise en Page',
    'lang-position':    'Positionnement',
    'lang-flexbox':     'Flexbox',
    'lang-grid':        'CSS Grid',
    'lang-transforms':  'Transformations',
    'lang-transitions': 'Transitions',
    'lang-animations':  'Animations CSS',
    'lang-responsive':  'Design Responsive',
    'lang-functions':   'Fonctions CSS',
    'lang-adv-css':     'CSS Avancé',
    'lang-best':        'Meilleures Pratiques',
    'lang-header-title': 'Encyclopédie HTML & CSS',
    'lang-header-sub':   'Un compendium complet des standards et styles du web',
  },
  es: {
    'lang-html-fund':   'Fundamentos HTML',
    'lang-semantic':    'HTML Semántico',
    'lang-forms':       'Formularios & Entrada',
    'lang-tables':      'Tablas & Datos',
    'lang-media':       'Medios & Embed',
    'lang-graphics':    'Gráficos & SVG',
    'lang-interact':    'Elementos Interactivos',
    'lang-metadata':    'Metadatos & SEO',
    'lang-access':      'Accesibilidad',
    'lang-adv-html':    'HTML Avanzado',
    'lang-css-fund':    'Fundamentos CSS',
    'lang-selectors':   'Selectores CSS',
    'lang-variables':   'Variables CSS',
    'lang-values':      'Valores & Unidades',
    'lang-boxmodel':    'Modelo de Caja',
    'lang-typography':  'Tipografía',
    'lang-backgrounds': 'Fondos',
    'lang-borders':     'Bordes & Sombras',
    'lang-layout':      'Sistemas de Diseño',
    'lang-position':    'Posicionamiento',
    'lang-flexbox':     'Flexbox',
    'lang-grid':        'CSS Grid',
    'lang-transforms':  'Transformaciones',
    'lang-transitions': 'Transiciones',
    'lang-animations':  'Animaciones CSS',
    'lang-responsive':  'Diseño Responsivo',
    'lang-functions':   'Funciones CSS',
    'lang-adv-css':     'CSS Avanzado',
    'lang-best':        'Mejores Prácticas',
    'lang-header-title': 'Enciclopedia HTML & CSS',
    'lang-header-sub':   'Un compendio completo de estándares y estilos web',
  },
  de: {
    'lang-html-fund':   'HTML Grundlagen',
    'lang-semantic':    'Semantisches HTML',
    'lang-forms':       'Formulare & Eingabe',
    'lang-tables':      'Tabellen & Daten',
    'lang-media':       'Medien & Einbettung',
    'lang-graphics':    'Grafiken & SVG',
    'lang-interact':    'Interaktive Elemente',
    'lang-metadata':    'Metadaten & SEO',
    'lang-access':      'Barrierefreiheit',
    'lang-adv-html':    'Fortgeschrittenes HTML',
    'lang-css-fund':    'CSS Grundlagen',
    'lang-selectors':   'CSS Selektoren',
    'lang-variables':   'CSS Variablen',
    'lang-values':      'Werte & Einheiten',
    'lang-boxmodel':    'Box-Modell',
    'lang-typography':  'Typografie',
    'lang-backgrounds': 'Hintergründe',
    'lang-borders':     'Rahmen & Schatten',
    'lang-layout':      'Layout-Systeme',
    'lang-position':    'Positionierung',
    'lang-flexbox':     'Flexbox',
    'lang-grid':        'CSS Grid',
    'lang-transforms':  'Transformationen',
    'lang-transitions': 'Übergänge',
    'lang-animations':  'CSS Animationen',
    'lang-responsive':  'Responsives Design',
    'lang-functions':   'CSS Funktionen',
    'lang-adv-css':     'Fortgeschrittenes CSS',
    'lang-best':        'Best Practices',
    'lang-header-title': 'HTML & CSS Enzyklopädie',
    'lang-header-sub':   'Ein vollständiges Kompendium von Web-Standards & Stilen',
  },
};

function applyTranslation(lang) {
  const dict = translations[lang] || translations.en;
  Object.keys(dict).forEach(key => {
    const els = document.querySelectorAll(`[data-i18n="${key}"]`);
    els.forEach(el => { el.textContent = dict[key]; });
  });
  document.documentElement.lang = lang === 'zh_s' ? 'zh-Hans' :
                                   lang === 'zh_t' ? 'zh-Hant' : lang;
}

if (langSelect) {
  langSelect.addEventListener('change', () => {
    applyTranslation(langSelect.value);
    localStorage.setItem('lang', langSelect.value);
  });
  const savedLang = localStorage.getItem('lang') || 'en';
  langSelect.value = savedLang;
  applyTranslation(savedLang);
}

/* ============================================================
   ANIMATE ON SCROLL (IntersectionObserver)
   ============================================================ */

const animObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.animationDelay = `${i * 0.05}s`;
      entry.target.classList.add('animate-in');
      animObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('article.prop-card, section.doc-section').forEach(el => {
  animObserver.observe(el);
});

/* ============================================================
   LIVE CSS PREVIEW (for CSS try-it boxes)
   ============================================================ */

document.querySelectorAll('.live-preview-wrap').forEach(wrap => {
  const textarea = wrap.querySelector('textarea.try-it');
  const preview  = wrap.querySelector('.live-preview-frame');
  if (!textarea || !preview) return;

  function updatePreview() {
    try {
      const html = textarea.value || textarea.placeholder;
      preview.innerHTML = html;
    } catch {}
  }

  textarea.addEventListener('input', updatePreview);
  updatePreview();
});

/* ============================================================
   SPECIFICITY CALCULATOR INTERACTIVITY
   ============================================================ */

const specInput = document.getElementById('spec-input');
if (specInput) {
  specInput.addEventListener('input', () => {
    const sel = specInput.value.trim();
    const scores = calculateSpecificity(sel);
    const display = document.getElementById('spec-display');
    if (display) {
      display.textContent = `(${scores.a}, ${scores.b}, ${scores.c})`;
    }
  });
}

function calculateSpecificity(selector) {
  let a = 0, b = 0, c = 0;
  if (!selector) return { a, b, c };
  // Inline styles
  if (selector.includes('style=')) a++;
  // IDs
  const ids = (selector.match(/#[a-zA-Z][\w-]*/g) || []).length;
  b += ids;
  // Classes, attributes, pseudo-classes
  const classes = (selector.match(/\.[a-zA-Z][\w-]*/g) || []).length;
  const attrs   = (selector.match(/\[[^\]]+\]/g) || []).length;
  const pseudo  = (selector.match(/:[a-zA-Z][\w-]*/g) || []).filter(p => !p.startsWith('::')).length;
  b += classes + attrs + pseudo;
  // Elements and pseudo-elements
  const elems   = (selector.match(/(?<![#.\[])(?<![:\w])\b[a-zA-Z][\w-]*/g) || []).filter(e => !['not','is','has','where'].includes(e)).length;
  const pseudo2 = (selector.match(/::[a-zA-Z][\w-]*/g) || []).length;
  c += elems + pseudo2;
  return { a, b, c };
}

/* ============================================================
   PALETTE STRIP (hover expand)
   — just CSS, but ensure elements are rendered
   ============================================================ */

/* ============================================================
   SMOOTH CLOSE SIDEBAR ON NAV CLICK (mobile)
   ============================================================ */

navLinks.forEach(a => {
  a.addEventListener('click', () => {
    if (window.innerWidth < 900) {
      sidebar.classList.remove('open');
      overlay?.classList.remove('active');
    }
  });
});

/* ============================================================
   KEYBOARD SHORTCUTS
   ============================================================ */

document.addEventListener('keydown', e => {
  // Ctrl/Cmd + K → focus search
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    searchInput?.focus();
  }
  // Escape → close mobile sidebar
  if (e.key === 'Escape') {
    sidebar.classList.remove('open');
    overlay?.classList.remove('active');
    searchInput?.blur();
  }
});

/* ============================================================
   CONSOLE EASTER EGG
   ============================================================ */

console.log(
  '%c⚜ HTML & CSS Encyclopedia ⚜\n%cBaroque Purple × Gold Edition\nBuilt with ❤ and CSS Custom Properties',
  'font-size:18px; color:#D4AF37; font-family:serif;',
  'font-size:11px; color:#9B59B6;'
);