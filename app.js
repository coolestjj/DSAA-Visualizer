function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const svg = d3.select('svg')
const width = svg.node().getBoundingClientRect().width 
const height = svg.node().getBoundingClientRect().height
const margin = {top: 30, right: 60, bottom: 200, left: 30}
const innerWidth = width - margin.right - margin.left
const innerHeight = height - margin.top - margin.bottom
const mainGroup = svg.append('g')
.attr('id', 'mainGroup')
.attr('transform', `translate(${margin.left}, ${margin.top})`)

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

const algorithmMap = {
  "bubbleSort": bubbleSort,
}

const renderMap = {
  "bubbleSort": renderBubbleSort,
}

const dataType = {
  "bubbleSort": "array"
}

const initMap = {
  "array": initArray
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
      d3.select('#mainGroup').selectAll('*').html('')
      let originMsg = null
      this.errorMsg = ''
      try {
        originMsg = JSON.parse(this.userInput)
      } catch (error) {
        this.errorMsg = error.toString()
      }
      if (originMsg !== null) {
        init(originMsg)
      }
    },
    share() {
      navigator.clipboard.writeText(this.userInput).then(() => {
        alert('json copy to clipboard')
      }, (error) => {
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