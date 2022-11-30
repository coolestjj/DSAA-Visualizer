const margin = { top: 100, bottom: 100, left: 100, right: 100 };
const width = 800;
const height = 400;

let data = [];

random = x => Math.floor(Math.random() * x);

for (let i = 0; i < 10; i++) {
    data.push({
        x: random(width),
        y: random(height),
        d: random(100)
    })
}

const svg = d3.select('.container')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

const G = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


let idx = 0

function update() {
    G.selectAll('circle')
        .data(data)
        .join('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', 20)
        .style('stroke', 'black')
        .style('fill', (d, i) => i < idx ? 'orange' : 'none');

    G.selectAll('text')
        .data(data)
        .join('text')
        .attr('class', 'text')
        .attr('x', d => d.x - 5)
        .attr('y', d => d.y + 5)
        .text(d => d.d);
}

function step() {
    idx++;
    update();
}

function play() {
    G.selectAll('circle').style('fill', 'none');
    G.selectAll('circle')
        .data(data)
        .join('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', 20)
        .style('stroke', 'black')
        .transition()
        .delay((d, i) => i * 500 + 500)
        .style('fill', 'orange');
}

update();

d3.select('.step')
    .on('click', step);
d3.select('.play')
    .on('click', play);