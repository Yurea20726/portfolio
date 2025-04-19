// global.js

console.log("IT’S ALIVE!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// 取得所有 <nav><a>
const navLinks = $$("nav a");

// 正規化路徑：把 index.html 去掉，保留末端的 /
function normalize(path) {
  return path.replace(/index\.html$/, "");
}

const currentLink = navLinks.find((a) => {
  // 比對 host 以外，pathname 都先 normalize
  const aPath = normalize(a.pathname);
  const locPath = normalize(location.pathname);
  return a.host === location.host && aPath === locPath;
});

currentLink?.classList.add("current");
