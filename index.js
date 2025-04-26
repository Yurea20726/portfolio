import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';

async function main() {
  // 最新專案（前3個）
  const projects = await fetchJSON('./lib/projects.json');
  const latestProjects = projects.slice(0, 3);
  const container = document.querySelector('.projects');
  renderProjects(latestProjects, container, 'h2');

  // GitHub 資料
  const githubData = await fetchGitHubData('Yurea20726'); // ⬅️ 請改成你自己的 GitHub 帳號
  const profileStats = document.querySelector('#profile-stats');

  if (profileStats) {
    profileStats.innerHTML = `
      <h2>My GitHub Stats</h2>
      <dl class="github-grid">
        <dt>Followers</dt><dd>${githubData.followers}</dd>
        <dt>Following</dt><dd>${githubData.following}</dd>
        <dt>Public Repos</dt><dd>${githubData.public_repos}</dd>
        <dt>Public Gists</dt><dd>${githubData.public_gists}</dd>
      </dl>
    `;
  }
}

main();
