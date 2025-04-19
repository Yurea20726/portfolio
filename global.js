// global.js
console.log("IT’S ALIVE!");

/* ========= 1. 網站頁面清單 ========= */
const pages = [
  { url: '',               title: 'Home'     },
  { url: 'projects/',      title: 'Projects' },
  { url: 'contact/',       title: 'Contact'  },
  { url: 'resume.html',    title: 'Resume'   },
  { url: 'https://github.com/Yurea20726', title: 'Profile' }
];

/* ========= 2. 本機 vs GitHub Pages 路徑前綴 ========= */
const BASE_PATH =
  (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? '/'
    : '/portfolio/';   // ← 若 repo 名不同請改這裡

/* ========= 3. 動態產生 <nav> ========= */
const nav = document.createElement('nav');
document.body.prepend(nav);

for (const p of pages) {
  const href = p.url.startsWith('http') ? p.url : BASE_PATH + p.url;
  const a = document.createElement('a');
  a.href = href;
  a.textContent = p.title;

  // 外部連結開新分頁
  if (a.host !== location.host) {
    a.target = '_blank';
    a.rel = 'noopener';
  }

  // 高亮當前頁
  const samePage =
    new URL(a.href).pathname.replace(/index\.html$/, '') ===
    location.pathname.replace(/index\.html$/, '');
  a.classList.toggle('current', samePage);

  nav.append(a);
}

/* ========= 4. 主題切換 (Auto / Light / Dark) ========= */

// 4‑1. 動態插入下拉選單到 <body> 最前 (放在 nav 之上)
document.body.insertAdjacentHTML(
  'afterbegin',
  `
  <label id="theme-control" style="display:inline-block;float:right;margin:0.5rem 1rem">
    Theme:
    <select>
      <option value="auto">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>
  `
);

const select = document.querySelector('#theme-control select');

// 4‑2. 讀取 saved or default(auto)，並立即套用
const savedTheme = localStorage.getItem('theme') || 'auto';
select.value = savedTheme;
applyTheme(savedTheme);

// 4‑3. 監聽變更 → 套用並存入 localStorage
select.addEventListener('change', e => {
  const mode = e.target.value;    // auto | light | dark
  localStorage.setItem('theme', mode);
  applyTheme(mode);
});

// 4‑4. 套用主題函式
function applyTheme(mode) {
  const root = document.documentElement;

  // reset
  root.style.colorScheme = '';
  root.removeAttribute('data-theme');

  if (mode === 'auto') {
    // 由 CSS `color-scheme: light dark` + 系統設定 決定
    return;
  }
  // 強制 light 或 dark
  root.style.colorScheme = mode;
  root.setAttribute('data-theme', mode);  // 若你在 CSS 需要用 [data-theme]
}
