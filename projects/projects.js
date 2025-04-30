;import { fetchJSON, renderProjects } from '../global.js';

async function main() {
  // 1. 載入 JSON 專案資料
  const projects = await fetchJSON('../lib/projects.json');

  // 2. 找到專案容器與標題欄位
  const container = document.querySelector('.projects');
  const titleEl = document.querySelector('.projects-title');

  // 3. 設定專案數量到 h1 上
  if (titleEl && Array.isArray(projects)) {
    titleEl.textContent = `${projects.length} Projects`;
  }

  // 4. 渲染卡片
  renderProjects(projects, container, 'h2');
}

main();

