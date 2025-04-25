import { fetchJSON, renderProjects } from '../global.js';

async function main() {
  // 1. 載入 JSON 資料
  const projects = await fetchJSON('../lib/projects.json');

  // 2. 找到 projects 頁面上的 .projects 區塊
  const container = document.querySelector('.projects');

  // 3. 動態把每個專案渲染出來
  renderProjects(projects, container, 'h2');
}

main();
