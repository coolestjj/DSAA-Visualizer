function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const svg = d3.select('svg')
const width = svg.node().getBoundingClientRect().width 
const height = svg.node().getBoundingClientRect().height
const margin = {top: 30, right: 60, bottom: 200, left: 30}
const innerWidth = width - margin.right - margin.left
const innerHeight = height - margin.top - margin.bottom
svg.append('g')
.attr('id', 'mainGroup')
.attr('transform', `translate(${margin.left}, ${margin.top})`)

function parseLink(link) {
  const left = /^[a-zA-Z0-9]+<-*[0-9]*-+[a-zA-Z0-9]+$/g
  const right = /^[a-zA-Z0-9]+-+[0-9]*-*>[a-zA-Z0-9]+$/g
  const unary = /^[a-zA-Z0-9]+-+[0-9]*-+[a-zA-Z0-9]+$/g
  const firstWord = /^[a-zA-Z0-9]+/g
  const lastWord = /[a-zA-Z0-9]$/g
  const number = /[0-9]+/g

  if(link.match(left)) {
    return {
      source: link.match(lastWord).at(0),
      target: link.match(firstWord).at(0),
      weight: link.match(number) ? parseInt(link.match(number).at(0)) : 1,
      isDirected: true,
    }
  } else if (link.match(right)) {
    return {
      source: link.match(firstWord).at(0),
      target: link.match(lastWord).at(0),
      weight: link.match(number) ? parseInt(link.match(number).at(0)) : 1,
      isDirected: true,
    }
  } else if (link.match(unary)) {
    return {
      source: link.match(firstWord).at(0),
      target: link.match(lastWord).at(0),
      weight: link.match(number) ? parseInt(link.match(number).at(0)) : 1,
      isDirected: false,
    }
  } else {
    throw new SyntaxError("invalid link syntax")
  }
}

function parseGraph(graphStrings) {
  const links = graphStrings.map(parseLink)
  const currentNodes = new Set()
  links.forEach((link) => {
    currentNodes.add(link.source)
    currentNodes.add(link.target)
  })
  const nodes = Array.from(currentNodes)
    .map((node) => {
      return {id: node, color: "black"}
    })
  return {
    links: links,
    nodes: nodes
  }
}

function swap(leftId, rightId) {
  const leftTextRect = d3.select('#' + leftId)
  const rightTextRect = d3.select('#' + rightId)

  const leftRect = leftTextRect.select('rect')
  const leftText = leftTextRect.select('text')

  const rightRect = rightTextRect.select('rect')
  const rightText = rightTextRect.select('text')

  leftTextRect.attr('id', rightId)
  leftRect.transition().attr('x', rightRect.attr('x'))
  leftText.transition().attr('x', rightText.attr('x'))

  rightTextRect.attr('id', leftId)
  rightRect.transition().attr('x', leftRect.attr('x'))
  rightText.transition().attr('x', leftText.attr('x'))
}

function coloring(id, color) {
  d3.select('#' + id).transition().attr('fill', color)
}

function bubbleSort(array) {
  let messages = []
  for (let k = 0; k < array.length; k++) {
    for (let i = 0 ; i < array.length - 1 - k; i++) {
      let isSwap = false

      if (array[i] > array[i + 1]) {
        [array[i], array[i + 1]] = [array[i + 1], array[i]];
        isSwap = true
      }
      
      let message;
      if (i == array.length - 2 - k) {
        message = {
          "left": i,
          "right": i + 1,
          "result": array.slice(),
          "isSwap": isSwap,
          "finished": array.length - 1 - k
        }
      } else {
        message = {
          "left": i,
          "right": i + 1,
          "result": array.slice(),
          "isSwap": isSwap,
          "finished": null
        }
      }
      messages.push(JSON.stringify(message))
    }
  }
  return messages
}

function selectionSort(array) {
  let messages = [];
  
  for(let i = 0; i < array.length - 1; i++) {
    let minIndex = i;
    
    for(let j = i + 1; j < array.length; j++) {
      if(array[j] < array[minIndex]) {
        minIndex = j;
      }
      
      messages.push(JSON.stringify({
        "left": j,
        "right": minIndex,
        "result": array.slice(),
        "isSwap": false,
        "finished": null
      }));
    }
    
    if(minIndex !== i) {
      [array[i], array[minIndex]] = [array[minIndex], array[i]];
      
      messages.push(JSON.stringify({
        "left": i,
        "right": minIndex,
        "result": array.slice(),
        "isSwap": true,
        "finished": null
      }));
    }
    
    messages.push(JSON.stringify({
      "left": null,
      "right": null,
      "result": array.slice(),
      "isSwap": false,
      "finished": i
    }));
  }
  
  messages.push(JSON.stringify({
    "left": null,
    "right": null,
    "result": array.slice(),
    "isSwap": false,
    "finished": array.length - 1
  }));
  
  return messages;
}

async function renderSelectionSort(messages) {
  for(const msg of messages) {
    const message = JSON.parse(msg);

    const left = message.left;
    const right = message.right;
    const isSwap = message.isSwap;
    const finished = message.finished;

    if(finished !== null) {
      const finishId = `textRect${finished}`;
      coloring(finishId, 'orange');
    }

    if(left !== null && right !== null) {
      const leftId = `textRect${left}`;
      const rightId = `textRect${right}`;
      
      coloring(leftId, 'red');
      coloring(rightId, 'red');

      await sleep(500);

      if(isSwap) {
        swap(leftId, rightId);
      }

      await sleep(500);

      coloring(leftId, 'black');
      coloring(rightId, 'black');
    }
  }
  
  coloring('textRect0', 'orange');
}


function updateNodesColor(nodes) {
  d3.selectAll("circle")
    .data(nodes, d => d.id)
    .join(
      () => {return},
      update => update.transition().attr("stroke", d => d.color)
    )
}

function BFS(data) {
  const graph = parseGraph(data.graph)
  const start = data.start
  const messages = []
  const currentNodes = graph.nodes.map((node) => {
    if (node.id === start)
      node.color = 'orange'
    return node
  })
  messages.push(currentNodes.map(a => ({...a})))
  const queue = [start]
  while(queue.length > 0) {
    const u = queue.shift()
    const neighborsId = graph.links.filter(link => link.isDirected ? link.source === u : link.source === u || link.target ===u)
    .map((link) => link.source === u ? link.target : link.source)
    const neighbors = currentNodes.filter(node => neighborsId.includes(node.id))
    neighbors.forEach(neighbor =>{
      if (neighbor.color === 'black') {
        neighbor.color = 'orange'
        queue.push(neighbor.id)
      }
    })
    currentNodes.find(node => node.id === u).color = 'red'
    messages.push(currentNodes.map(a => ({...a})))
  }
  return messages
}

function DFS(data) {
  const graph = parseGraph(data.graph)
  const start = data.start
  const messages = []
  const currentNodes = graph.nodes.map((node) => {
    if (node.id === start)
      node.color = 'orange'
    return node
  })
  messages.push(currentNodes.map(a => ({...a})))
  const stack = [start]
  while(stack.length > 0) {
    const u = stack.pop()
    const neighborsId = graph.links.filter(link => link.isDirected ? link.source === u : link.source === u || link.target ===u)
    .map((link) => link.source === u ? link.target : link.source)
    const neighbors = currentNodes.filter(node => neighborsId.includes(node.id))
    neighbors.forEach(neighbor =>{
      if (neighbor.color === 'black') {
        neighbor.color = 'orange'
        stack.push(neighbor.id)
      }
    })
    currentNodes.find(node => node.id === u).color = 'red'
    messages.push(currentNodes.map(a => ({...a})))
  }
  return messages
}

async function renderBubbleSort(messages) {
  for(const msg of messages) {
    const message = JSON.parse(msg)

    const left = message.left
    const right = message.right
    const isSwap = message.isSwap
    const finished = message.finished

    let leftId = `textRect${left}`
    let rightId = `textRect${right}`
    let finishId = `textRect${finished}`

    coloring(leftId, 'red')
    coloring(rightId, 'red')

    await sleep(500)

    if (isSwap)
      swap(leftId, rightId)

    await sleep(500)

    coloring(leftId, 'black')
    coloring(rightId, 'black')
    coloring(finishId, 'orange')
    await sleep(500)
  }
  coloring('textRect0', 'orange')
}

async function renderBFS(messages) {
  console.log(messages)
  for (const msg of messages) {
    updateNodesColor(msg)
    await sleep(1000)
  }
}

function initArray(array) {
  const mainGroup = d3.select('#mainGroup')

  let textRects = mainGroup.selectAll('g')
  .data(array, (d, i) => `${d} ${i}`)
  .join('g')
  .attr('id', (_, i) => `textRect${i}`)
  .attr('class', 'textRect')
  .attr('fill', 'black')

  mainGroup.append('g')
  .attr('id', 'left')
  .attr('transform', `translate(${margin.left}, ${margin.top})`)
  mainGroup.append('g')
  .attr('id', 'bottom')
  .attr('transform', `translate(${margin.left}, ${margin.top + innerHeight})`)

  const yScale = d3.scaleLinear()
                   .domain([d3.max(array), 0])
                   .range([0, innerHeight])
  const xScale = d3.scaleBand()
                   .domain(Array.from(array.keys()))
                   .range([0, innerWidth])
  xScale.paddingInner(0.05)
  xScale.paddingOuter(0.05)
  const yAxis = d3.axisLeft(yScale)
  const xAxis = d3.axisBottom(xScale)
  d3.select('#left').call(yAxis)
  d3.select('#bottom').call(xAxis)

  textRects.append('rect')
  .attr('x', (_, i) => xScale(i) + margin.left)
  .attr('y', (d) => yScale(d) + margin.top)
  .attr('width', xScale.bandwidth())
  .attr('height', (d) => innerHeight - yScale(d))

  textRects.append('text')
  .attr('x', (_, i) => xScale(i) + margin.left + xScale.bandwidth() / 2 - 12)
  .attr('y', (d) => yScale(d) + margin.top - 2)
  .text(d => d)
}

function intersection(x1, y1, x2, y2, r) {
  const θ = Math.atan((y2 - y1) / (x2 - x1))
  const a = θ >= 0 ? (y2 > y1 ? -1 : 1) : (y2 > y1 ? 1 : -1)
  return {x: x2 + a * r * Math.cos(θ), y: y2 + a * r * Math.sin(θ)}
}

function initGraph(graphData) {
  let graph = parseGraph(graphData.graph)
  const mainGroup = d3.select('#mainGroup')
  const radius = 20
  const nodes = graph.nodes
  const links = graph.links.map((link) => {
    return {
      source: nodes.find((node) => node.id === link.source),
      target: nodes.find((node) => node.id === link.target),
      weight: link.weight,
      isDirected: link.isDirected
    }
  })

  const simulation = d3.forceSimulation(nodes)
  .force("charge", d3.forceManyBody().strength(-2024))
  .force("center", d3.forceCenter(innerWidth / 2, innerHeight / 2))
  .force("collision", d3.forceCollide().radius(radius))
  .force("link", d3.forceLink(links))
  .force("x", d3.forceX())
  .force("y", d3.forceY())
  .stop();

  const loading = mainGroup.append("text")
  .attr("dy", "0.35em")
  .attr("text-anchor", "middle")
  .attr("font-family", "sans-serif")
  .attr("font-size", 10)
  .text("Simulating. One moment please…");

  d3.timeout(() => {
    loading.remove();

    for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
      simulation.tick();
    }

    mainGroup.selectAll("line")
    .data(links)
    .join("line")
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.isDirected ? intersection(d.source.x, d.source.y, d.target.x, d.target.y, radius+7).x : d.target.x)
      .attr("y2", (d) => d.isDirected ? intersection(d.source.x, d.source.y, d.target.x, d.target.y, radius+7).y : d.target.y)
      .attr("id", (_, i) => `link-${i}`)
      .attr("stroke", "#000")
      .attr("stroke-width", 2)
      .attr("marker-end", (d) => d.isDirected ? "url(#arrowhead)" : "")

    mainGroup.selectAll(".line-weight")
      .data(links)
      .join("text")
        .attr("class", "line-weight")
        .attr("x", (d) => (d.source.x + d.target.x) / 2)
        .attr("y", (d) => (d.source.y + d.target.y) / 2)
        .text((d) => d.weight)

    mainGroup.selectAll("circle")
      .data(nodes, d => d.id)
      .join(
        enter => enter.append("circle")
          .attr("cx", d => d.x)
          .attr("cy", d => d.y)
          .attr("r", radius)
          .attr("id", (d) => `node-${d.id}`)
          .attr("fill", "#fff")
          .attr("stroke", d => d.color)
          .attr("stroke-width", 3),
        update => update.attr("stroke", d => d.color)
      )
        

    mainGroup.selectAll(".node-label")
      .data(nodes)
      .join("text")
        .attr("class", "node-label")
        .attr("x", (d) => d.x - 5)
        .attr("y", (d) => d.y + 5)
        .text((d) => d.id)

  })
  
}


const algorithmMap = {
  bubbleSort: bubbleSort,
  selectionSort: selectionSort,
  bfs: BFS,
  dfs: DFS,
}

const renderMap = {
  bubbleSort: renderBubbleSort,
  selectionSort: renderSelectionSort,
  bfs: renderBFS,
  dfs: renderBFS,
}

const dataType = {
  bubbleSort: "array",
  selectionSort: "array",
  bfs: "graph",
  dfs: "graph"
}

const initMap = {
  array: initArray,
  graph: initGraph,
}

function render(msg) {
  const messages = algorithmMap[msg.algorithm](msg.data)
  renderMap[msg.algorithm](messages)
}

function init(msg) {
  const type = dataType[msg.algorithm]
  if (type === undefined) return
  const data = msg.data
  initMap[type](data)
}


const app = Vue.createApp({
  data() {
    return {
      userInput: JSON.stringify({
        algorithm: "bubbleSort",
        data: Array.from({length: 20}, () => Math.floor(Math.random() * 100) + 20)
      }, null, 2),

      errorMsg: ''
    }
  },
  methods: {
    checkInput() {
      d3.select('#mainGroup').selectAll('*').remove()
      let originMsg = null
      this.errorMsg = ''
      try {
        originMsg = JSON.parse(this.userInput)
      } catch (error) {
        this.errorMsg = error.toString()
      }

      if (originMsg === null)
        return

      try {
        init(originMsg)
      } catch (error) {
        this.errorMsg = error.toString()
      }
    },
    share() {
      navigator.clipboard.writeText(this.userInput).then(() => {
        alert('json copy to clipboard')
      }, () => {
        alert('cannot copy to clipboard')
      })
    },
    start() {
      const originMsg = JSON.parse(this.userInput)
      render(originMsg)
    },
    next() {

    },
    stop() {

    }
  },
  mounted() {
    init(JSON.parse(this.userInput))
  }
}).mount('#app')