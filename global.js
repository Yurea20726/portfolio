// global.js
console.log("IT’S ALIVE!");

/* ===== 1. 導覽列 ===== */
const pages = [
  { url: '',            title: 'Home' },
  { url: 'projects/',   title: 'Projects' },
  { url: 'contact/',    title: 'Contact' },
  { url: 'resume.html', title: 'Resume' },
  { url: 'https://github.com/Yurea20726', title: 'Profile' }
];

const BASE_PATH =
  (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? '/'
    : '/portfolio/';            // ← GitHub Pages 路徑

const nav = document.createElement('nav');
document.body.prepend(nav);

for (const p of pages) {
  const href = p.url.startsWith('http') ? p.url : BASE_PATH + p.url;
  const a = document.createElement('a');
  a.href = href;
  a.textContent = p.title;

  if (a.host !== location.host) { a.target = '_blank'; a.rel = 'noopener'; }

  const same =
    new URL(a.href).pathname.replace(/index\.html$/, '') ===
    location.pathname.replace(/index\.html$/, '');
  a.classList.toggle('current', same);

  nav.append(a);
}

/* ===== 2. 主題切換 (Auto / Light / Dark) ===== */
// 2‑1  插入 UI
const label = document.createElement('label');
label.className = 'color-scheme';
label.innerHTML = `
  Theme:
  <select id="theme-select">
    <option value="auto">Automatic</option>
    <option value="light">Light</option>
    <option value="dark">Dark</option>
  </select>`;
document.body.prepend(label);

const select = document.getElementById('theme-select');

// 2‑2  初始：讀 localStorage
const saved = localStorage.getItem('theme') || 'auto';
select.value = saved;
applyTheme(saved);

// 2‑3  事件監聽
select.addEventListener('input', e => {
  const mode = e.target.value;            // auto | light | dark
  localStorage.setItem('theme', mode);
  applyTheme(mode);
});

// 2‑4  主題套用
function applyTheme(mode) {
  const root = document.documentElement;

  // 先清空
  root.style.removeProperty('color-scheme');
  root.removeAttribute('data-theme');

  if (mode !== 'auto') {
    root.style.setProperty('color-scheme', mode); // 強制
    root.setAttribute('data-theme', mode);        // 若 CSS 需要
  }
}
