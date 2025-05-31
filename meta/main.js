// ✅ meta.js
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

let xScale, yScale, commits;
let commitProgress = 100;
let commitMaxTime;
let timeScale;
let data;

const colors = d3.scaleOrdinal(d3.schemeTableau10);

async function loadData() {
  const data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: +row.line,
    depth: +row.depth,
    length: +row.length,
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));
  return data;
}

function processCommits(data) {
  return d3.groups(data, (d) => d.commit).map(([commit, lines]) => {
    let { author, date, time, timezone, datetime } = lines[0];
    let ret = {
      id: commit,
      url: 'https://github.com/vis-society/lab-7/commit/' + commit,
      author,
      date,
      time,
      timezone,
      datetime,
      hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
      totalLines: lines.length,
    };
    Object.defineProperty(ret, 'lines', { value: lines });
    return ret;
  });
}

function renderCommitInfo(filteredData, filteredCommits) {
  const dl = d3.select('#stats');
  dl.html('');
  dl.append('dt').text('Commits');
  dl.append('dd').text(filteredCommits.length);
  dl.append('dt').text('Files');
  dl.append('dd').text(d3.group(filteredData, d => d.file).size);
  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(filteredData.length);
  dl.append('dt').text('Max Depth');
  dl.append('dd').text(d3.max(filteredData, d => d.depth));
  dl.append('dt').text('Longest line');
  dl.append('dd').text(d3.max(filteredData, d => d.length));
  dl.append('dt').text('Max lines in a file');
  dl.append('dd').text(d3.max(d3.rollups(filteredData, v => v.length, d => d.file), d => d[1]));
}

function renderTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  if (!commit) return;
  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', { dateStyle: 'full' });
}

function updateTooltipVisibility(isVisible) {
  document.getElementById('commit-tooltip').hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;
}

function isCommitSelected(selection, commit) {
  if (!selection) return false;
  const [[x0, y0], [x1, y1]] = selection;
  const x = xScale(commit.datetime);
  const y = yScale(commit.hourFrac);
  return x0 <= x && x <= x1 && y0 <= y && y <= y1;
}

function renderSelectionCount(selection) {
  const selectedCommits = selection ? commits.filter((d) => isCommitSelected(selection, d)) : [];
  const countElement = document.querySelector('#selection-count');
  countElement.textContent = `${selectedCommits.length || 'No'} commits selected`;
  return selectedCommits;
}

function renderLanguageBreakdown(selection) {
  const selectedCommits = selection ? commits.filter((d) => isCommitSelected(selection, d)) : [];
  const container = document.getElementById('language-breakdown');

  if (selectedCommits.length === 0) {
    container.innerHTML = '';
    return;
  }

  const lines = selectedCommits.flatMap((d) => d.lines);
  const breakdown = d3.rollup(
    lines,
    (v) => v.length,
    (d) => d.type
  );

  container.innerHTML = '';
  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format('.1%')(proportion);
    container.innerHTML += `
      <dt>${language}</dt>
      <dd>${count} lines (${formatted})</dd>
    `;
  }
}

function renderScatterPlot(data, commitData) {
  commits = commitData;
  const width = 1000, height = 600;
  const margin = { top: 10, right: 10, bottom: 30, left: 20 };
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  const svg = d3.select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  xScale = d3.scaleTime()
    .domain(d3.extent(commits, d => d.datetime))
    .range([usableArea.left, usableArea.right])
    .nice();

  yScale = d3.scaleLinear()
    .domain([0, 24])
    .range([usableArea.bottom, usableArea.top]);

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale).tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

  svg.append('g').attr('class', 'x-axis').attr('transform', `translate(0, ${usableArea.bottom})`).call(xAxis);
  svg.append('g').attr('transform', `translate(${usableArea.left}, 0)`).call(yAxis);
  svg.append('g').attr('class', 'dots');

  timeScale = d3.scaleTime()
    .domain(d3.extent(commits, d => d.datetime))
    .range([0, 100]);
}

function updateScatterPlot(data, filteredCommits) {
  const svg = d3.select('#chart').select('svg');
  const rScale = d3.scaleSqrt()
    .domain(d3.extent(commits, d => d.totalLines))
    .range([2, 30]);

  if (filteredCommits.length === 0) {
    console.warn("No commits to display");
    svg.select('g.dots').selectAll('circle').remove();
    return;
  }

  xScale.domain(d3.extent(filteredCommits, d => d.datetime));
  svg.selectAll('g.x-axis').remove();
  svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, 570)`)
    .call(d3.axisBottom(xScale));

  const dots = svg.select('g.dots')
    .selectAll('circle')
    .data(filteredCommits.sort((a, b) => d3.descending(a.totalLines, b.totalLines)), d => d.id);

  dots.join(
    enter => enter.append('circle')
      .attr('cx', d => xScale(d.datetime))
      .attr('cy', d => yScale(d.hourFrac))
      .attr('r', 0)
      .attr('fill', d => d.hourFrac < 6 || d.hourFrac > 18 ? 'steelblue' : 'orange')
      .style('fill-opacity', 0.7)
      .call(enter => enter.transition().duration(300).attr('r', d => rScale(d.totalLines))),
    update => update.transition().duration(300)
      .attr('cx', d => xScale(d.datetime))
      .attr('cy', d => yScale(d.hourFrac))
      .attr('r', d => rScale(d.totalLines)),
    exit => exit.remove()
  )
  .on('mouseenter', (event, commit) => {
    d3.select(event.currentTarget).style('fill-opacity', 1);
    renderTooltipContent(commit);
    updateTooltipVisibility(true);
    updateTooltipPosition(event);
  })
  .on('mouseleave', (event) => {
    d3.select(event.currentTarget).style('fill-opacity', 0.7);
    updateTooltipVisibility(false);
  });

  svg.call(d3.brush().on('start brush end', brushed));
  svg.selectAll('.dots, .overlay ~ *').raise();
}

function onTimeSliderChange() {
  const slider = document.getElementById('commit-progress');
  const timeDisplay = document.getElementById('commit-time');

  commitProgress = +slider.value;
  commitMaxTime = timeScale.invert(commitProgress);
  timeDisplay.textContent = commitMaxTime.toLocaleString('en', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  const filteredCommits = commits.filter((d) => d.datetime <= commitMaxTime);
  const filteredData = data.filter((d) => d.datetime <= commitMaxTime);

  if (filteredCommits.length === 0 || filteredData.length === 0) return;

  updateScatterPlot(data, filteredCommits);
  renderCommitInfo(filteredData, filteredCommits);
  updateFileDisplay(filteredCommits);
}

function updateFileDisplay(filteredCommits) {
  const lines = filteredCommits.flatMap((d) => d.lines);
  const files = d3.groups(lines, d => d.file)
    .map(([name, lines]) => ({ name, lines }))
    .sort((a, b) => b.lines.length - a.lines.length);

  const container = d3.select('#files')
    .selectAll('div')
    .data(files, d => d.name)
    .join('div');

  container.selectAll('dt').data(d => [d]).join('dt')
    .html(d => `<code>${d.name}</code><br><small>${d.lines.length} lines</small>`);

  const dd = container.selectAll('dd').data(d => [d]).join('dd');
  dd.selectAll('div')
    .data(d => d.lines)
    .join('div')
    .attr('class', 'loc')
    .attr('style', d => `--color: ${colors(d.type)}`);
}

function brushed(event) {
  const selection = event.selection;
  d3.selectAll('circle').classed('selected', (d) => isCommitSelected(selection, d));
  renderSelectionCount(selection);
  renderLanguageBreakdown(selection);
}

// ✅ Main
data = await loadData();
let commitList = processCommits(data);
renderCommitInfo(data, commitList);
renderScatterPlot(data, commitList);
document.getElementById('commit-progress').value = 100;
document.getElementById('commit-progress').addEventListener('input', onTimeSliderChange);
onTimeSliderChange();
