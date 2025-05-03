import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

async function main() {
  const projects = await fetchJSON('../lib/projects.json');
  const container = document.querySelector('.projects');
  const titleEl = document.querySelector('.projects-title');

  if (titleEl && Array.isArray(projects)) {
    titleEl.textContent = `${projects.length} Projects`;
  }

  renderProjects(projects, container, 'h2');

  // ✅ 專案資料分類：根據 year 統計個數
  const yearCounts = d3.rollup(
    projects,
    v => v.length,
    d => d.year
  );

  const data = Array.from(yearCounts, ([label, value]) => ({ label, value }));

  const svg = d3.select('#projects-plot');
  const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  const pie = d3.pie().value(d => d.value);
  const arcData = pie(data);
  const colors = d3.scaleOrdinal(d3.schemeTableau10);

  // ✅ 畫出圓餅圖
  svg.selectAll('path')
    .data(arcData)
    .enter()
    .append('path')
    .attr('d', arcGenerator)
    .attr('fill', (_, i) => colors(i))
    .attr('transform', 'translate(50, 50)');

  // ✅ 畫出圖例
  const legend = d3.select('.legend');
  data.forEach((d, i) => {
    legend.append('li')
      .attr('style', `--color:${colors(i)}`)
      .attr('class', 'legend-item')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

main();
