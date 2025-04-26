import { fetchJSON, renderProjects } from './global.js';

async function main() {
  // 1. 讀取所有專案
  const projects = await fetchJSON('./lib/projects.json');

  // 2. 取前三個（或更少）
  const latestProjects = projects.slice(0, 3);

  // 3. 找到 .projects 容器
  const container = document.querySelector('.projects');

  // 4. 渲染最新的專案
  renderProjects(latestProjects, container, 'h2');
}

main();
