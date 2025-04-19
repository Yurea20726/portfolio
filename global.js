// global.js

console.log("IT’S ALIVE!");

// Step 3: Automatic navigation menu & current link
// 1. Define pages data structure
const pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'resume.html', title: 'Resume' },
  { url: 'https://github.com/Yurea20726', title: 'Profile' }
];

// 2. Determine base path for local vs GitHub Pages
const BASE_PATH = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
  ? '/'
  : '/portfolio/';  // replace '/portfolio/' with your repo name if different

// 3. Create and prepend <nav> element
const nav = document.createElement('nav');
document.body.prepend(nav);

// 4. Generate navigation links
for (let p of pages) {
  let href = p.url;
  if (!href.startsWith('http')) {
    href = BASE_PATH + href;
  }
  const link = document.createElement('a');
  link.href = href;
  link.textContent = p.title;

  // 5. Auto-add 'current' class
  const normalizedLink = new URL(link.href).pathname.replace(/index\.html$/, '');
  const normalizedLoc = location.pathname.replace(/index\.html$/, '');
  if (normalizedLink === normalizedLoc) {
    link.classList.add('current');
  }

  nav.append(link);
}
