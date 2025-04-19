// global.js

// 確認腳本載入成功
console.log("IT’S ALIVE!");

// 小 helper：快速抓取 NodeList 並轉成 Array
function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// === Step 2: Automatic current page link ===

// 2.1 先把所有 <nav> 裡的 <a> 都抓出來
const navLinks = $$("nav a");

// 2.2 找到那個 href (或 host+pathname) 和目前頁面一樣的 <a>
const currentLink = navLinks.find(
  (a) =>
    a.host === location.host &&
    // a.pathname 會自動把相對路徑解析成絕對路徑，比較保險
    a.pathname === location.pathname
);

// 2.3 如果找到就加上 current class
currentLink?.classList.add("current");
