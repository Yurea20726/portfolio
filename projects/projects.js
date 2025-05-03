import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

async function main() {
  const projects = await fetchJSON('../lib/projects.json');
  const svg       = d3.select('#projects-plot');
  const legendEl  = d3.select('.legend');
  const searchBar = document.querySelector('.searchBar');
  const cardsCont = document.querySelector('.projects');
  const titleEl   = document.querySelector('.projects-title');

  let selectedIndex = -1;  // -1 表示「沒選任何片」

  // 初次 render
  updateView();
  // 搜尋欄也觸發 updateView
  searchBar.addEventListener('input', updateView);

  function updateView() {
    // 1) 通用的 search 过滤
    const q = searchBar.value.trim().toLowerCase();
    const searchFiltered = projects.filter(p =>
      Object.values(p).join(' ').toLowerCase().includes(q)
    );
  
    // 2) 卡片要同时受 year filter
    let cardsData = searchFiltered;
    if (selectedIndex >= 0) {
      const years = Array.from(
        d3.rollup(searchFiltered, v => v.length, d => d.year),
        ([y]) => y
      ).sort(d3.ascending);
      const targetYear = years[selectedIndex];
      cardsData = searchFiltered.filter(p => p.year === targetYear);
    }
    // 重绘标题＆卡片
    titleEl.textContent = `${cardsData.length} Projects`;
    renderProjects(cardsData, cardsCont, 'h2');
  
    // 3) 饼图只用 searchFiltered（不加 year filter）
    drawPie(searchFiltered);
  }
  

  function drawPie(dataArr) {
    // 清空舊圖
    svg.selectAll('*').remove();
    legendEl.selectAll('*').remove();

    // rollup + sort → [{label,value}, ...]
    const rolled = Array.from(
      d3.rollup(dataArr, v => v.length, d => d.year),
      ([label, value]) => ({ label, value })
    ).sort((a, b) => d3.ascending(a.label, b.label));

    const radius = 50;
    const arcGen  = d3.arc().innerRadius(0).outerRadius(radius);
    const pieGen  = d3.pie().value(d => d.value);
    const color   = d3.scaleOrdinal(d3.schemeTableau10);

    // 畫 slices
    const g = svg
      .attr('width', 100)
      .attr('height', 100)
      .append('g')
      .attr('transform', 'translate(50,50)');

      g.selectAll('path')
      .data(pieGen(rolled))
      .enter().append('path')
        .attr('d', arcGen)
        .attr('style', (d,i) => `--color:${color(i)}`)
        .classed('selected', (d,i) => i===selectedIndex)
        .on('click', function(event, d) {
          // d.index 才是正確的 slice index
          const idx = d.index;
          selectedIndex = selectedIndex === idx ? -1 : idx;
          updateView();
        });

    // 畫 legend
    rolled.forEach((d,i) => {
      legendEl.append('li')
        .attr('class','legend-item')
        .classed('selected', i===selectedIndex)
        .attr('style', `--color:${color(i)}`)
        .html(`<span class="swatch"></span>${d.label} (${d.value})`)
        // 直接用閉包裡的 i
        .on('click', () => {
          selectedIndex = selectedIndex === i ? -1 : i;
          updateView();
        });
    });
  }
}

main();
