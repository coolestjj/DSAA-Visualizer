const svg = d3.select('svg')
const width = svg.node().getBoundingClientRect().width 
const height = svg.node().getBoundingClientRect().height
const margin = {top: 60, right: 80, bottom: 200, left: 80}
const innerWidth = width - margin.right - margin.left
const innerHeight = height - margin.top - margin.bottom
const mainGroup = svg.append('g')
.attr('id', 'mainGroup')
.attr('transform', `translate(${margin.left}, ${margin.top})`)

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

function renderBubbleSort(messages) {

}

function initArray(array) {
  const yScale = d3.scaleLinear()
                   .domain([d3.max(array), 0])
                   .range([0, innerHeight])
  const xScale = d3.scaleLinear()
                   .domain(Array.from(array.keys()))
                   .range([0, innerWidth])
  
  console.log(innerHeight)
  console.log(innerWidth)

  const yAxis = d3.axisLeft(yScale)
  d3.select('svg g').call(yAxis)
  
}

const algorithmTable = {
  "bubbleSort": bubbleSort,
}

const renderTable = {
  "bubbleSort": renderBubbleSort,
}

const dataType = {
  "bubbleSort": "array"
}

const initTable = {
  "array": initArray
}

function render(msg) {
  const messages = algorithmTable[msg.algorithm](msg.data)
  console.log(messages)
  renderTable[msg.algorithm](messages)
}

function init(msg) {
  const type = dataType[msg.algorithm]
  const data = msg.data
  initTable[type](data)
}


const app = Vue.createApp({
  data() {
    return {
      userInput: JSON.stringify({
        algorithm: "bubbleSort",
        data: Array.from({length: 7}, () => Math.floor(Math.random() * 100) + 20)
      }, null, 2),
      errorMsg: ''
    }
  },
  methods: {
    checkInput() {
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
    start() {
      const originMsg = JSON.parse(this.userInput)
      init(originMsg)
    },
    next() {

    },
    stop() {

    }
  },
}).mount('#app')