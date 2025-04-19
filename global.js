// global.js
console.log("IT’S ALIVE!");

// === 1. 網站頁面資料 ===
const pages = [
  { url: '',               title: 'Home'     },
  { url: 'projects/',      title: 'Projects' },
  { url: 'contact/',       title: 'Contact'  },
  { url: 'resume.html',    title: 'Resume'   },
  { url: 'https://github.com/Yurea20726', title: 'Profile' }
];

// === 2. 判斷本機或 GitHub Pages 路徑前綴 ===
const BASE_PATH =
  (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
    ? '/'
    : '/portfolio/';   // ← 若 repo 名不同請改這裡

// === 3. 動態建立 <nav> 並插入頁面頂端 ===
const nav = document.createElement('nav');
document.body.prepend(nav);

// === 4. 迭代 pages 產生 <a>，同時處理高亮與外部連結 ===
for (const p of pages) {
  // 4‑1. 組 href：外部連結保持原樣，內部連結加 BASE_PATH
  const href = p.url.startsWith('http') ? p.url : BASE_PATH + p.url;

  // 4‑2. 建立 <a>
  const a = document.createElement('a');
  a.href = href;
  a.textContent = p.title;

  // 4‑3. 若指向外部網站 → 開新分頁
  const isExternal = a.host !== location.host;
  if (isExternal) {
    a.target = '_blank';
    a.rel = 'noopener';
  }

  // 4‑4. 判斷是否為當前頁 → toggle 'current'
  const samePath =
    new URL(a.href).pathname.replace(/index\.html$/, '') ===
    location.pathname.replace(/index\.html$/, '');
  a.classList.toggle('current', samePath);

  // 4‑5. 加入 nav
  nav.append(a);
}
