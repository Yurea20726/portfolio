console.log("IT’S ALIVE!");

/* ===== 1. 導覽列 (自動產生) ===== */
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
    : '/portfolio/';                    // GitHub Pages 子資料夾

const nav = document.createElement('nav');
document.body.prepend(nav);

for (const p of pages) {
  const href = p.url.startsWith('http') ? p.url : BASE_PATH + p.url;
  const a    = document.createElement('a');
  a.href        = href;
  a.textContent = p.title;

  // 外部連結開新分頁
  if (a.host !== location.host) {
    a.target = '_blank';
    a.rel    = 'noopener';
  }

  // 高亮當前頁
  const same =
    new URL(a.href).pathname.replace(/index\.html$/, '') ===
    location.pathname.replace(/index\.html$/, '');
  a.classList.toggle('current', same);

  nav.append(a);
}

/* ===== 2. 主題切換 (Light / Dark / Auto) ===== */

// (2‑1)  插入控制選單
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

// (2‑2)  清除舊 key，讀取 colorScheme
localStorage.removeItem('theme');                 // ⬅️  確保只剩 colorScheme
const saved = localStorage.getItem('colorScheme') || 'auto';
select.value = saved;
applyTheme(saved);

// (2‑3)  監聽變更並寫入 colorScheme
select.addEventListener('input', (e) => {
  const mode = e.target.value;                   // auto | light | dark
  localStorage.setItem('colorScheme', mode);     // 只存這個 key
  applyTheme(mode);
});

// (2‑4)  套用主題
function applyTheme(mode) {
  const root = document.documentElement;

  root.style.removeProperty('color-scheme');
  root.removeAttribute('data-theme');

  if (mode !== 'auto') {
    root.style.setProperty('color-scheme', mode); // 強制 light / dark
    root.setAttribute('data-theme', mode);        // 如果 CSS 需要用到
  }
}
