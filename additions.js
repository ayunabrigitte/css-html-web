/* ============================================================
   ADDITIONS.JS — All new interactive features
   Load AFTER script.js
   ============================================================ */

/* ============================================================
   LIVE CODE EDITOR
   ============================================================ */

(function initLiveEditor() {
  const input   = document.getElementById('live-html-input');
  const frame   = document.getElementById('live-preview-frame');
  const runBtn  = document.getElementById('run-code-btn');
  if (!input || !frame) return;

  function runCode() {
    const code = input.value;
    const doc = frame.contentDocument || frame.contentWindow.document;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head>
      <meta charset="UTF-8">
      <style>
        body { margin: 12px; font-family: Georgia, serif; background: #fff; }
      </style>
    </head><body>${code}</body></html>`);
    doc.close();
  }

  runBtn?.addEventListener('click', runCode);
  input.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') runCode();
    if (e.key === 'Tab') {
      e.preventDefault();
      const s = input.selectionStart, en = input.selectionEnd;
      input.value = input.value.substring(0, s) + '  ' + input.value.substring(en);
      input.selectionStart = input.selectionEnd = s + 2;
    }
  });

  // Run on load
  setTimeout(runCode, 100);
})();

/* ============================================================
   FLEXBOX PLAYGROUND
   ============================================================ */

(function initFlexPlayground() {
  const container = document.getElementById('flex-pg-container');
  const codeEl    = document.getElementById('flex-pg-code');
  if (!container) return;

  const controls = {
    direction: document.getElementById('pg-direction'),
    justify:   document.getElementById('pg-justify'),
    align:     document.getElementById('pg-align'),
    wrap:      document.getElementById('pg-wrap'),
    gap:       document.getElementById('pg-gap'),
    items:     document.getElementById('pg-items'),
  };

  function update() {
    const dir   = controls.direction?.value || 'row';
    const jc    = controls.justify?.value   || 'flex-start';
    const ai    = controls.align?.value     || 'stretch';
    const wrap  = controls.wrap?.value      || 'nowrap';
    const gap   = controls.gap?.value       || '8';
    const count = parseInt(controls.items?.value || '4');

    if (document.getElementById('pg-gap-val'))   document.getElementById('pg-gap-val').textContent = gap;
    if (document.getElementById('pg-items-val')) document.getElementById('pg-items-val').textContent = count;

    container.style.cssText = `
      display:flex;
      flex-direction:${dir};
      justify-content:${jc};
      align-items:${ai};
      flex-wrap:${wrap};
      gap:${gap}px;
    `;

    container.innerHTML = '';
    for (let i = 1; i <= count; i++) {
      const el = document.createElement('div');
      el.className = 'pg-item';
      el.textContent = `Item ${i}`;
      if (i % 3 === 0) el.style.padding = '10px 22px';
      container.appendChild(el);
    }

    if (codeEl) {
      codeEl.textContent =
`.container {
  display: flex;
  flex-direction: ${dir};
  justify-content: ${jc};
  align-items: ${ai};
  flex-wrap: ${wrap};
  gap: ${gap}px;
}`;
    }
  }

  Object.values(controls).forEach(el => el?.addEventListener('input', update));
  update();
})();

/* ============================================================
   UNITS CONVERTER
   ============================================================ */

(function initUnitsConverter() {
  const BASE = 16;
  const VP   = 1280;

  const ids = ['unit-px', 'unit-rem', 'unit-em', 'unit-pt', 'unit-vw'];
  const els = {};
  ids.forEach(id => { els[id] = document.getElementById(id); });
  if (!els['unit-px']) return;

  function fromPx(px) {
    if (els['unit-px'])  els['unit-px'].value  = round(px);
    if (els['unit-rem']) els['unit-rem'].value  = round(px / BASE);
    if (els['unit-em'])  els['unit-em'].value   = round(px / BASE);
    if (els['unit-pt'])  els['unit-pt'].value   = round(px * 0.75);
    if (els['unit-vw'])  els['unit-vw'].value   = round((px / VP) * 100);
  }

  function round(n) { return Math.round(n * 1000) / 1000; }

  els['unit-px']?.addEventListener('input',  e => fromPx(parseFloat(e.target.value) || 0));
  els['unit-rem']?.addEventListener('input', e => fromPx((parseFloat(e.target.value) || 0) * BASE));
  els['unit-em']?.addEventListener('input',  e => fromPx((parseFloat(e.target.value) || 0) * BASE));
  els['unit-pt']?.addEventListener('input',  e => fromPx((parseFloat(e.target.value) || 0) / 0.75));
  els['unit-vw']?.addEventListener('input',  e => fromPx((parseFloat(e.target.value) || 0) / 100 * VP));
})();

/* ============================================================
   BEZIER EDITOR
   ============================================================ */

(function initBezierEditor() {
  const canvas = document.getElementById('bezier-canvas');
  if (!canvas) return;

  const ctx    = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const PAD = 20;

  const ids = { x1:'bz-x1', y1:'bz-y1', x2:'bz-x2', y2:'bz-y2' };
  const sliders = {};
  Object.entries(ids).forEach(([k, id]) => { sliders[k] = document.getElementById(id); });

  function getVals() {
    return {
      x1: parseFloat(sliders.x1?.value || 0.25),
      y1: parseFloat(sliders.y1?.value || 0.1),
      x2: parseFloat(sliders.x2?.value || 0.25),
      y2: parseFloat(sliders.y2?.value || 1.0),
    };
  }

  function toCanvas(x, y) {
    return {
      cx: PAD + x * (W - PAD * 2),
      cy: H - PAD - y * (H - PAD * 2),
    };
  }

  function drawCurve() {
    const { x1, y1, x2, y2 } = getVals();
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

    ctx.clearRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const x = PAD + i * (W - PAD*2) / 4;
      const y = PAD + i * (H - PAD*2) / 4;
      ctx.beginPath(); ctx.moveTo(x, PAD); ctx.lineTo(x, H - PAD); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(W - PAD, y); ctx.stroke();
    }

    // Curve
    const p0 = toCanvas(0, 0);
    const p1 = toCanvas(x1, y1);
    const p2 = toCanvas(x2, y2);
    const p3 = toCanvas(1, 1);

    ctx.beginPath();
    ctx.moveTo(p0.cx, p0.cy);
    ctx.bezierCurveTo(p1.cx, p1.cy, p2.cx, p2.cy, p3.cx, p3.cy);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Control lines
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = isDark ? 'rgba(155,89,182,0.5)' : 'rgba(74,43,140,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(p0.cx, p0.cy); ctx.lineTo(p1.cx, p1.cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(p3.cx, p3.cy); ctx.lineTo(p2.cx, p2.cy); ctx.stroke();
    ctx.setLineDash([]);

    // Points
    [[p0,'#87ABE8'], [p1,'#CF87E8'], [p2,'#CF87E8'], [p3,'#87ABE8']].forEach(([p, col]) => {
      ctx.beginPath();
      ctx.arc(p.cx, p.cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
    });

    // Update output
    const out = document.getElementById('bz-output');
    if (out) out.textContent = `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;

    // Update val labels
    ['x1','y1','x2','y2'].forEach(k => {
      const el = document.getElementById(`bz-${k}-val`);
      if (el) el.textContent = getVals()[k];
    });
  }

  Object.values(sliders).forEach(s => s?.addEventListener('input', drawCurve));

  // Presets
  document.getElementById('bz-preset')?.addEventListener('change', e => {
    const [x1,y1,x2,y2] = e.target.value.split(',').map(Number);
    if (sliders.x1) sliders.x1.value = x1;
    if (sliders.y1) sliders.y1.value = y1;
    if (sliders.x2) sliders.x2.value = x2;
    if (sliders.y2) sliders.y2.value = y2;
    drawCurve();
  });

  // Preview ball animation
  document.getElementById('bz-play')?.addEventListener('click', () => {
    const ball  = document.getElementById('bz-ball');
    const track = ball?.parentElement;
    if (!ball || !track) return;
    const { x1, y1, x2, y2 } = getVals();
    ball.style.transition = 'none';
    ball.style.left = '0px';
    const maxLeft = track.clientWidth - 12;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ball.style.transition = `left 1s cubic-bezier(${x1},${y1},${x2},${y2})`;
        ball.style.left = `${maxLeft}px`;
        setTimeout(() => {
          ball.style.transition = 'left 0.6s ease-out';
          ball.style.left = '0px';
        }, 1200);
      });
    });
  });

  drawCurve();
  // Redraw on theme change
  document.getElementById('theme-toggle')?.addEventListener('click', () => setTimeout(drawCurve, 50));
})();

/* ============================================================
   COLOR PALETTE BUILDER
   ============================================================ */

(function initPaletteBuilder() {
  const inputs = {
    primary: document.getElementById('pal-primary'),
    accent:  document.getElementById('pal-accent'),
    neutral: document.getElementById('pal-neutral'),
  };
  const output = document.getElementById('palette-output');
  if (!inputs.primary) return;

  function hexToHsl(hex) {
    let r = parseInt(hex.slice(1,3),16)/255,
        g = parseInt(hex.slice(3,5),16)/255,
        b = parseInt(hex.slice(5,7),16)/255;
    const max = Math.max(r,g,b), min = Math.min(r,g,b);
    let h, s, l = (max+min)/2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d/(2-max-min) : d/(max+min);
      switch(max) {
        case r: h = ((g-b)/d + (g<b?6:0))/6; break;
        case g: h = ((b-r)/d + 2)/6; break;
        default: h = ((r-g)/d + 4)/6;
      }
    }
    return [Math.round(h*360), Math.round(s*100), Math.round(l*100)];
  }

  function hslToHex(h,s,l) {
    h/=360; s/=100; l/=100;
    const hue2rgb = (p,q,t) => {
      if(t<0) t+=1; if(t>1) t-=1;
      if(t<1/6) return p+(q-p)*6*t;
      if(t<1/2) return q;
      if(t<2/3) return p+(q-p)*(2/3-t)*6;
      return p;
    };
    const q = l<0.5 ? l*(1+s) : l+s-l*s, p = 2*l-q;
    const r = hue2rgb(p,q,h+1/3), g = hue2rgb(p,q,h), b = hue2rgb(p,q,h-1/3);
    return '#'+ [r,g,b].map(x => Math.round(x*255).toString(16).padStart(2,'0')).join('');
  }

  function generateShades(hex) {
    const [h,s] = hexToHsl(hex);
    return [95,85,70,55,40,30,20,12,6].map(l => hslToHex(h, Math.min(s,90), l));
  }

  function buildSwatches(hex, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    const shades = generateShades(hex);
    shades.forEach((color, i) => {
      const wrap = document.createElement('div');
      wrap.className = 'builder-swatch';
      wrap.style.background = color;
      wrap.title = color;
      const label = document.createElement('span');
      label.className = 'swatch-hex';
      label.textContent = color;
      wrap.appendChild(label);
      wrap.addEventListener('click', () => navigator.clipboard?.writeText(color));
      container.appendChild(wrap);
    });
  }

  function updateOutput() {
    const { primary: pEl, accent: aEl, neutral: nEl } = inputs;
    const p = pEl?.value || '#7B2FBE';
    const a = aEl?.value || '#D4AF37';
    const n = nEl?.value || '#2D2D3F';
    const ps = generateShades(p);
    const as = generateShades(a);
    const ns = generateShades(n);
    buildSwatches(p, 'pal-primary-swatches');
    buildSwatches(a, 'pal-accent-swatches');
    buildSwatches(n, 'pal-neutral-swatches');
    if (output) {
      output.textContent = `:root {
  /* Primary */
  --primary-50:  ${ps[0]};
  --primary-100: ${ps[1]};
  --primary-200: ${ps[2]};
  --primary-300: ${ps[3]};
  --primary-400: ${ps[4]};
  --primary-500: ${p};
  --primary-600: ${ps[5]};
  --primary-700: ${ps[6]};
  --primary-800: ${ps[7]};
  --primary-900: ${ps[8]};

  /* Accent */
  --accent-500:  ${a};
  --accent-300:  ${as[3]};
  --accent-700:  ${as[6]};

  /* Neutral */
  --neutral-50:  ${ns[0]};
  --neutral-500: ${n};
  --neutral-900: ${ns[8]};
}`;
    }
  }

  Object.values(inputs).forEach(el => el?.addEventListener('input', updateOutput));
  updateOutput();
})();

/* ============================================================
   SPECIFICITY BATTLE
   ============================================================ */

(function initSpecBattle() {
  const aInput  = document.getElementById('battle-a');
  const bInput  = document.getElementById('battle-b');
  const aScore  = document.getElementById('battle-a-score');
  const bScore  = document.getElementById('battle-b-score');
  const result  = document.getElementById('battle-result');
  if (!aInput) return;

  function calcSpec(sel) {
    if (!sel.trim()) return [0,0,0];
    let a=0,b=0,c=0;
    const s = sel.replace(/<[^>]*>/g,'').replace(/::?[a-zA-Z-]+\([^)]*\)/g, s => {
      const m = s.match(/:[a-zA-Z-]+\(([^)]*)\)/);
      if (m && !['not','is','has','where'].some(p => s.includes(':'+p))) b++;
      return '';
    });
    b += (s.match(/#[a-zA-Z][\w-]*/g)||[]).length;
    b += (s.match(/\.[a-zA-Z][\w-]*/g)||[]).length;
    b += (s.match(/\[[^\]]+\]/g)||[]).length;
    b += (s.match(/:[a-zA-Z][\w-]*/g)||[]).length;
    c += (s.match(/(?<![#.[:])(?<![:\w])[a-zA-Z][\w-]*/g)||[]).filter(e=>!['html','body','not','is','has','where'].includes(e)).length;
    c += (s.match(/::[a-zA-Z][\w-]*/g)||[]).length;
    return [a,b,c];
  }

  function scoreVal([a,b,c]) { return a*10000 + b*100 + c; }

  function update() {
    const sa = calcSpec(aInput.value);
    const sb = calcSpec(bInput.value);
    if (aScore) aScore.textContent = `(${sa.join(',')})`;
    if (bScore) bScore.textContent = `(${sb.join(',')})`;
    const va = scoreVal(sa), vb = scoreVal(sb);
    if (result) {
      result.className = 'spec-battle-result';
      if (!aInput.value.trim() && !bInput.value.trim()) { result.textContent = '—'; return; }
      if (va > vb) { result.textContent = '🏆 Selector A wins!'; result.classList.add('win-a'); }
      else if (vb > va) { result.textContent = '🏆 Selector B wins!'; result.classList.add('win-b'); }
      else { result.textContent = '⚖️ Tie — source order decides'; result.classList.add('tie'); }
    }
  }

  aInput.addEventListener('input', update);
  bInput.addEventListener('input', update);
  update();
})();

/* ============================================================
   HTML ENTITIES TABLE
   ============================================================ */

(function initEntityGrid() {
  const grid  = document.getElementById('entity-grid');
  const toast = document.getElementById('entity-toast');
  if (!grid) return;

  const entities = [
    ['©','&copy;','Copyright'],['®','&reg;','Registered'],['™','&trade;','Trademark'],
    ['€','&euro;','Euro'],['£','&pound;','Pound'],['¥','&yen;','Yen'],['¢','&cent;','Cent'],
    ['&','&amp;','Ampersand'],['<','&lt;','Less-than'],['>', '&gt;','Greater-than'],
    ['"','&quot;','Quote'],[' ','&nbsp;','Non-break space'],
    ['→','&rarr;','Right arrow'],['←','&larr;','Left arrow'],['↑','&uarr;','Up arrow'],['↓','&darr;','Down arrow'],
    ['↔','&harr;','Horiz arrow'],['↕','&varr;','Vert arrow'],
    ['•','&bull;','Bullet'],['·','&middot;','Middle dot'],['…','&hellip;','Ellipsis'],
    ['—','&mdash;','Em dash'],['–','&ndash;','En dash'],
    ['«','&laquo;','Left guillemet'],['»','&raquo;','Right guillemet'],
    [''','&lsquo;','Left single quote'],[''','&rsquo;','Right single quote'],
    ['"','&ldquo;','Left double quote'],['"','&rdquo;','Right double quote'],
    ['★','&#9733;','Star filled'],['☆','&#9734;','Star empty'],
    ['♥','&hearts;','Heart'],['♠','&spades;','Spade'],['♣','&clubs;','Club'],['♦','&diams;','Diamond'],
    ['✓','&#10003;','Check'],['✗','&#10007;','Cross'],['✔','&#10004;','Heavy check'],['✘','&#10008;','Heavy cross'],
    ['π','&pi;','Pi'],['∞','&infin;','Infinity'],['±','&plusmn;','Plus-minus'],['÷','&divide;','Divide'],
    ['×','&times;','Times'],['≠','&ne;','Not equal'],['≤','&le;','Less or equal'],['≥','&ge;','Greater or equal'],
    ['°','&deg;','Degree'],['½','&frac12;','Half'],['¼','&frac14;','Quarter'],['¾','&frac34;','3/4'],
    ['α','&alpha;','Alpha'],['β','&beta;','Beta'],['γ','&gamma;','Gamma'],['Ω','&Omega;','Omega'],
    ['⚡','&#9889;','Lightning'],['❄','&#10052;','Snowflake'],['☀','&#9728;','Sun'],['☁','&#9729;','Cloud'],
  ];

  entities.forEach(([char, code, name]) => {
    const item = document.createElement('div');
    item.className = 'entity-item';
    item.innerHTML = `<span class="entity-char">${char === '&' ? '&amp;' : char === '<' ? '&lt;' : char === '>' ? '&gt;' : char}</span>
      <span class="entity-name">${code}</span>
      <span class="entity-code">${name}</span>`;
    item.addEventListener('click', async () => {
      await navigator.clipboard?.writeText(code).catch(()=>{});
      if (toast) {
        toast.textContent = `Copied ${code}`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 1800);
      }
    });
    grid.appendChild(item);
  });
})();

/* ============================================================
   CSS NAMED COLORS
   ============================================================ */

(function initColorNames() {
  const grid = document.getElementById('color-names-grid');
  if (!grid) return;

  const colors = [
    'aliceblue','antiquewhite','aqua','aquamarine','azure','beige','bisque','black',
    'blanchedalmond','blue','blueviolet','brown','burlywood','cadetblue','chartreuse',
    'chocolate','coral','cornflowerblue','cornsilk','crimson','cyan','darkblue',
    'darkcyan','darkgoldenrod','darkgray','darkgreen','darkkhaki','darkmagenta',
    'darkolivegreen','darkorange','darkorchid','darkred','darksalmon','darkseagreen',
    'darkslateblue','darkslategray','darkturquoise','darkviolet','deeppink','deepskyblue',
    'dimgray','dodgerblue','firebrick','floralwhite','forestgreen','fuchsia','gainsboro',
    'ghostwhite','gold','goldenrod','gray','green','greenyellow','honeydew','hotpink',
    'indianred','indigo','ivory','khaki','lavender','lavenderblush','lawngreen',
    'lemonchiffon','lightblue','lightcoral','lightcyan','lightgoldenrodyellow','lightgray',
    'lightgreen','lightpink','lightsalmon','lightseagreen','lightskyblue','lightslategray',
    'lightsteelblue','lightyellow','lime','limegreen','linen','magenta','maroon',
    'mediumaquamarine','mediumblue','mediumorchid','mediumpurple','mediumseagreen',
    'mediumslateblue','mediumspringgreen','mediumturquoise','mediumvioletred','midnightblue',
    'mintcream','mistyrose','moccasin','navajowhite','navy','oldlace','olive','olivedrab',
    'orange','orangered','orchid','palegoldenrod','palegreen','paleturquoise','palevioletred',
    'papayawhip','peachpuff','peru','pink','plum','powderblue','purple','rebeccapurple',
    'red','rosybrown','royalblue','saddlebrown','salmon','sandybrown','seagreen','seashell',
    'sienna','silver','skyblue','slateblue','slategray','snow','springgreen','steelblue',
    'tan','teal','thistle','tomato','turquoise','violet','wheat','white','whitesmoke',
    'yellow','yellowgreen',
  ];

  colors.forEach(name => {
    const chip = document.createElement('div');
    chip.className = 'color-name-chip';
    const bg = name === 'white' || name === 'snow' || name.includes('white') || name.includes('ivory') || name.includes('lemon')
      ? '#f0f0f0' : 'var(--bg-code)';
    chip.style.background = bg;
    chip.innerHTML = `<div class="chip-swatch" style="background:${name}"></div><div class="chip-name">${name}</div>`;
    chip.addEventListener('click', async () => {
      await navigator.clipboard?.writeText(name).catch(()=>{});
      chip.style.outline = '2px solid gold';
      setTimeout(() => chip.style.outline = '', 1000);
    });
    grid.appendChild(chip);
  });
})();

/* ============================================================
   CLIP-PATH COPY
   ============================================================ */

document.querySelectorAll('.clip-shape[data-clip]').forEach(el => {
  el.addEventListener('click', async () => {
    const val = el.getAttribute('data-clip');
    await navigator.clipboard?.writeText(val).catch(()=>{});
    const label = el.nextElementSibling;
    if (label) { const orig = label.textContent; label.textContent = 'copied!'; setTimeout(() => label.textContent = orig, 1200); }
  });
});

/* ============================================================
   PATTERN LIBRARY
   ============================================================ */

(function initPatternLibrary() {
  const grid = document.getElementById('pattern-grid');
  if (!grid) return;

  const patterns = [
    {
      name: 'Card Component',
      preview: `<div style="background:#2D1B55;border:1px solid rgba(212,175,55,0.3);border-radius:10px;padding:12px;font-family:serif;color:#FAF5E4;font-size:0.7rem"><strong style="color:#D4AF37">Card Title</strong><p style="margin-top:4px;color:#C39BD3">Card description text goes here.</p><button style="margin-top:8px;background:#7B2FBE;border:none;color:#D4AF37;padding:4px 12px;border-radius:4px;font-size:0.65rem;cursor:pointer">Action</button></div>`,
      code: `<div class="card">
  <h3 class="card__title">Card Title</h3>
  <p class="card__body">Description text.</p>
  <button class="card__btn">Action</button>
</div>

<style>
.card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}
.card__title { font-size: 1.2rem; margin-bottom: 8px; }
.card__btn {
  background: purple;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 12px;
}
</style>`
    },
    {
      name: 'Navbar',
      preview: `<nav style="display:flex;justify-content:space-between;align-items:center;background:#1A0A2E;padding:8px 12px;border-radius:6px;font-family:serif;font-size:0.7rem"><span style="color:#D4AF37;font-weight:bold">⚜ Brand</span><div style="display:flex;gap:10px"><a href="#" style="color:#C39BD3;text-decoration:none">Home</a><a href="#" style="color:#C39BD3;text-decoration:none">About</a><a href="#" style="color:#C39BD3;text-decoration:none">Contact</a></div></nav>`,
      code: `<header>
  <nav class="navbar">
    <a class="navbar__brand" href="/">⚜ Brand</a>
    <ul class="navbar__links">
      <li><a href="/">Home</a></li>
      <li><a href="/about">About</a></li>
      <li><a href="/contact">Contact</a></li>
    </ul>
  </nav>
</header>

<style>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #1A0A2E;
  position: sticky;
  top: 0;
  z-index: 100;
}
.navbar__brand { color: gold; text-decoration: none; font-weight: bold; }
.navbar__links { display: flex; gap: 24px; list-style: none; }
.navbar__links a { color: #C39BD3; text-decoration: none; transition: color 0.2s; }
.navbar__links a:hover { color: gold; }
</style>`
    },
    {
      name: 'Hero Section',
      preview: `<div style="background:linear-gradient(135deg,#1A0A2E,#2D1B55);padding:20px;text-align:center;border-radius:8px;font-family:serif"><h2 style="color:#D4AF37;font-size:1rem;margin-bottom:6px">Your Headline Here</h2><p style="color:#C39BD3;font-size:0.7rem;margin-bottom:10px">Supporting description text</p><a href="#" style="background:#7B2FBE;color:#D4AF37;padding:5px 14px;border-radius:20px;text-decoration:none;font-size:0.65rem">Get Started</a></div>`,
      code: `<section class="hero">
  <h1>Your Headline Here</h1>
  <p>Supporting description for your hero section.</p>
  <a href="#" class="btn-primary">Get Started</a>
</section>

<style>
.hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #1A0A2E, #2D1B55);
}
.hero h1 { font-size: clamp(2rem, 5vw, 4rem); color: gold; }
.hero p  { font-size: 1.2rem; color: #C39BD3; max-width: 600px; margin: 16px auto; }
.btn-primary {
  background: #7B2FBE;
  color: gold;
  padding: 14px 32px;
  border-radius: 50px;
  text-decoration: none;
  font-size: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(123,47,190,0.4);
}
</style>`
    },
    {
      name: 'Modal',
      preview: `<div style="position:relative;background:rgba(0,0,0,0.5);padding:8px;border-radius:6px;display:flex;align-items:center;justify-content:center"><div style="background:#1A0A2E;border:1px solid rgba(212,175,55,0.4);border-radius:10px;padding:14px 16px;font-family:serif;width:140px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><strong style="color:#D4AF37;font-size:0.75rem">Modal Title</strong><span style="color:#6B5080;cursor:pointer;font-size:0.8rem">✕</span></div><p style="color:#C39BD3;font-size:0.6rem">Modal content here.</p></div></div>`,
      code: `<!-- Toggle class "open" to show/hide -->
<div class="modal-backdrop" id="modal">
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="modal__header">
      <h2 id="modal-title">Modal Title</h2>
      <button class="modal__close" aria-label="Close">✕</button>
    </div>
    <div class="modal__body">
      <p>Modal content goes here.</p>
    </div>
  </div>
</div>

<style>
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 400;
  opacity: 0; pointer-events: none;
  transition: opacity 0.25s;
}
.modal-backdrop.open { opacity: 1; pointer-events: all; }
.modal {
  background: white;
  border-radius: 16px;
  padding: 24px;
  max-width: 500px; width: 90%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
}
.modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
</style>`
    },
    {
      name: 'Input Group',
      preview: `<div style="font-family:serif;padding:8px"><label style="font-size:0.65rem;color:#C39BD3;display:block;margin-bottom:4px">Email Address</label><input type="email" placeholder="hello@example.com" style="width:100%;background:#0D0820;border:1px solid rgba(212,175,55,0.3);color:#FAF5E4;padding:6px 10px;border-radius:6px;font-size:0.7rem;outline:none;box-sizing:border-box"><p style="font-size:0.55rem;color:#6B5080;margin-top:3px">We never share your email.</p></div>`,
      code: `<div class="field">
  <label class="field__label" for="email">Email Address</label>
  <input class="field__input" type="email" id="email" 
         placeholder="hello@example.com" required>
  <p class="field__hint">We never share your email.</p>
</div>

<style>
.field { display: flex; flex-direction: column; gap: 4px; }
.field__label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #444;
}
.field__input {
  border: 1.5px solid #ddd;
  border-radius: 8px;
  padding: 10px 14px;
  font: inherit;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.field__input:focus {
  border-color: purple;
  box-shadow: 0 0 0 3px rgba(128,0,128,0.1);
}
.field__hint { font-size: 0.75rem; color: #888; }
</style>`
    },
    {
      name: 'Tag / Badge',
      preview: `<div style="display:flex;gap:6px;flex-wrap:wrap;padding:10px;font-family:serif"><span style="background:rgba(123,47,190,0.2);border:1px solid rgba(123,47,190,0.4);color:#C39BD3;padding:2px 10px;border-radius:20px;font-size:0.65rem">HTML</span><span style="background:rgba(212,175,55,0.15);border:1px solid rgba(212,175,55,0.4);color:#D4AF37;padding:2px 10px;border-radius:20px;font-size:0.65rem">CSS</span><span style="background:rgba(87,212,100,0.12);border:1px solid rgba(87,212,100,0.35);color:#87E8AB;padding:2px 10px;border-radius:20px;font-size:0.65rem">New</span></div>`,
      code: `<span class="badge badge--primary">HTML</span>
<span class="badge badge--gold">CSS</span>
<span class="badge badge--green">New</span>

<style>
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
}
.badge--primary {
  background: rgba(128,0,128,0.15);
  border: 1px solid rgba(128,0,128,0.35);
  color: purple;
}
.badge--gold {
  background: rgba(212,175,55,0.12);
  border: 1px solid rgba(212,175,55,0.35);
  color: goldenrod;
}
</style>`
    },
  ];

  patterns.forEach(p => {
    const card = document.createElement('div');
    card.className = 'pattern-card';
    card.innerHTML = `
      <div class="pattern-preview">${p.preview}</div>
      <div class="pattern-meta">
        <span class="pattern-name">${p.name}</span>
        <button class="pattern-copy-btn" title="Copy code">Copy</button>
      </div>`;
    card.querySelector('.pattern-copy-btn').addEventListener('click', async () => {
      await navigator.clipboard?.writeText(p.code).catch(()=>{});
      const btn = card.querySelector('.pattern-copy-btn');
      btn.textContent = '✓ Copied';
      setTimeout(() => btn.textContent = 'Copy', 2000);
    });
    grid.appendChild(card);
  });
})();

/* ============================================================
   FAVORITES SYSTEM
   ============================================================ */

(function initFavorites() {
  const list  = document.getElementById('fav-list');
  const empty = document.getElementById('fav-empty');
  if (!list) return;

  let favs = JSON.parse(localStorage.getItem('enc_favs') || '[]');

  function saveFavs() { localStorage.setItem('enc_favs', JSON.stringify(favs)); }

  function renderFavs() {
    list.innerHTML = '';
    if (favs.length === 0) {
      if (empty) empty.style.display = '';
      return;
    }
    if (empty) empty.style.display = 'none';
    favs.forEach(({ id, title }) => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="#${id}">${title}</a>`;
      list.appendChild(li);
    });
  }

  // Add fav buttons to all section headers
  document.querySelectorAll('section.doc-section').forEach(section => {
    const id    = section.id;
    const title = section.querySelector('h2')?.textContent?.trim().replace(/[▼↓]/g,'').trim() || id;
    const header = section.querySelector('.section-header');
    if (!header || !id) return;

    const btn = document.createElement('button');
    btn.className = 'fav-btn';
    btn.title = 'Add to favorites';
    btn.innerHTML = favs.some(f => f.id === id) ? '★' : '☆';
    btn.classList.toggle('faved', favs.some(f => f.id === id));

    btn.addEventListener('click', e => {
      e.stopPropagation();
      const idx = favs.findIndex(f => f.id === id);
      if (idx === -1) { favs.push({ id, title }); btn.innerHTML = '★'; btn.classList.add('faved'); }
      else            { favs.splice(idx,1);         btn.innerHTML = '☆'; btn.classList.remove('faved'); }
      saveFavs();
      renderFavs();
    });

    header.querySelector('h2')?.after(btn);
  });

  renderFavs();
})();

/* ============================================================
   READING PROGRESS TRACKER
   ============================================================ */

(function initReadingProgress() {
  const fill  = document.getElementById('progress-fill');
  const label = document.getElementById('progress-label');
  if (!fill) return;

  const sections = document.querySelectorAll('section.doc-section[id]');
  const total    = sections.length;
  let seen       = new Set(JSON.parse(localStorage.getItem('enc_seen') || '[]'));

  function updateProgress() {
    const pct = total ? Math.round((seen.size / total) * 100) : 0;
    fill.style.width = `${pct}%`;
    if (label) label.textContent = `${pct}%`;
    localStorage.setItem('enc_seen', JSON.stringify([...seen]));
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting && e.target.id) { seen.add(e.target.id); updateProgress(); } });
  }, { threshold: 0.3 });

  sections.forEach(s => io.observe(s));
  updateProgress();
})();

/* ============================================================
   KEYBOARD SHORTCUT: ? for help overlay
   ============================================================ */

(function initKbdOverlay() {
  const overlay = document.getElementById('kbd-overlay');
  if (!overlay) return;

  document.addEventListener('keydown', e => {
    if (e.key === '?' && !['INPUT','TEXTAREA'].includes(e.target.tagName)) {
      overlay.classList.toggle('open');
    }
    if (e.key === 'Escape') overlay.classList.remove('open');
  });

  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open'); });
})();

/* ============================================================
   UPDATE SIDEBAR NAV with new sections
   ============================================================ */

(function addNavLinks() {
  // Find the CSS nav category and add new items
  const navCats = document.querySelectorAll('.nav-category');
  navCats.forEach(cat => {
    const title = cat.querySelector('.nav-category-title')?.textContent.trim();
    if (title && title.includes('CSS')) {
      const ul = cat.querySelector('.nav-links');
      const newLinks = [
        ['#typography',       'Typography'],
        ['#backgrounds',      'Backgrounds'],
        ['#borders-shadows',  'Borders & Shadows'],
        ['#positioning',      'Positioning'],
        ['#css-values',       'Values & Units'],
        ['#scroll-snap',      'Scroll Snap'],
        ['#clip-path',        'Shapes & clip-path'],
        ['#logical-properties','Logical Properties'],
        ['#css-nesting',      'CSS Nesting'],
        ['#css-layers',       '@layer'],
        ['#css-property',     '@property'],
        ['#sass-scss',        'Sass / SCSS'],
        ['#interactive-tools','⚙ Tools'],
        ['#html-entities',    'HTML Entities'],
        ['#color-names',      'Color Names'],
        ['#css-resets',       'CSS Resets'],
        ['#common-mistakes',  'Common Mistakes'],
        ['#pattern-library',  'Pattern Library'],
        ['#accessibility',    'Accessibility'],
      ];
      newLinks.forEach(([href, text]) => {
        if (!document.querySelector(`.nav-links a[href="${href}"]`)) {
          const li = document.createElement('li');
          li.innerHTML = `<a href="${href}">${text}</a>`;
          ul?.appendChild(li);
        }
      });
    }
  });
})();