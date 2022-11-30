const svg = d3.select('svg')
const width = svg.attr('width')
const height = svg.attr('height')
const margin = {top: 60, right: 30, bottom: 60, left: 30}
const innerWidth = width - margin.right - margin.left
const innerHeight = height - margin.top - margin.bottom
const mainGroup = svg.append('g')
.attr('id', 'mainGroup')
.attr('transform', `translate(${margin.left}, ${margin.top})`)

const app = Vue.createApp({
  data() {
    return {
      userInput: JSON.stringify({
        algorithm: "bubbleSort",
        data: Array.from({length: 5}, () => Math.floor(Math.random() * 100) + 20)
      }, null, 2),
      errorMsg: ''
    }
  },
  methods: {
    updateInput() {
      this.errorMsg = ''
      let originData = null
      try {
        originData = JSON.parse(this.userInput)
      } catch (error) {
        this.errorMsg = error.toString()
      }
      if (originData !== null) {
        console.log(originData)
      }
    },
  },
}).mount('#app')