
const app = Vue.createApp({
  data() {
    return {
      userInput: `{
  "algorithm": "bubbleSort",
  "data": [35, 12, 34, 45, 23, 10]
}`,
      errorMsg: ''
    }
  },
  methods: {
    initSvg() {
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
  mounted() {
    const svg = d3.select('svg')
    const width = svg.attr('width')
    const height = svg.attr('height')
    const margin = {top: 60, right: 30, bottom: 60, left: 30}
    const innerWidth = width - margin.right - margin.left
    const innerHeight = height - margin.top - margin.bottom
    const mainGroup = svg.append('g')
    .attr('id', 'mainGroup')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
  },
}).mount('#app')