// projects.js
import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

async function main() {
  // 1. 載入所有專案資料
  const projects = await fetchJSON('../lib/projects.json');

  // 2. 先渲染一次標題與所有卡片
  const titleEl = document.querySelector('.projects-title');
  const container = document.querySelector('.projects');
  function updateTitle(count) {
    if (titleEl) titleEl.textContent = `${count} Projects`;
  }
  updateTitle(projects.length);
  renderProjects(projects, container, 'h2');

  // 3. 選出 SVG、圖例容器、以及搜尋欄
  const svg    = d3.select('#projects-plot');
  const legend = d3.select('.legend');
  const input  = document.querySelector('.searchBar');

  // 4. 計算一組 projects 的年分統計
  function computeData(arr) {
    const roll = d3.rollup(
      arr,
      v => v.length,
      d => d.year
    );
    const out = Array.from(roll, ([label, value]) => ({ label, value }));
    // 按年排序
    out.sort((a,b) => a.label.localeCompare(b.label));
    return out;
  }

  // 5. 畫圓餅並更新圖例
  function updateChart(arr) {
    const data = computeData(arr);

    // pie + arc generator
    const pie = d3.pie()
      .value(d => d.value)
      .sort((a, b) => a.label.localeCompare(b.label));
    const arcGen = d3.arc()
      .innerRadius(0)
      .outerRadius(50);

    // color scale domain ＝ 所有年度
    const color = d3.scaleOrdinal(d3.schemeTableau10)
      .domain(data.map(d => d.label));

    // join path
    svg.selectAll('path')
      .data(pie(data), d => d.data.label)
      .join(
        enter => enter.append('path')
          .attr('transform', 'translate(50,50)')
          .attr('fill', d => color(d.data.label))
          .attr('d', arcGen),
        update => update
          .transition().duration(400)
          .attr('fill', d => color(d.data.label))
          .attr('d', arcGen),
        exit => exit
          .transition().duration(200)
          .attrTween('d', d => {
            const interpolate = d3.interpolate(d.startAngle, d.startAngle);
            return t => {
              d.endAngle = interpolate(t);
              return arcGen(d);
            };
          })
          .remove()
      );

    // 重繪 legend
    legend.html('');
    data.forEach(d => {
      legend.append('li')
        .attr('class', 'legend-item')
        .html(`
          <span class="swatch" style="background-color: ${color(d.label)}"></span>
          ${d.label} <em>(${d.value})</em>
        `);
    });
  }

  // 6. 初次繪製完整資料的圖表
  updateChart(projects);

  // 7. 監聽搜尋欄，每次輸入就過濾＋重繪
  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    // case-insensitive、跨欄位搜尋
    const filtered = projects.filter(proj => {
      return Object.values(proj)
        .join(' ')
        .toLowerCase()
        .includes(q);
    });

    // 更新標題、卡片、圖表
    updateTitle(filtered.length);
    renderProjects(filtered, container, 'h2');
    updateChart(filtered);
  });
}

main();
