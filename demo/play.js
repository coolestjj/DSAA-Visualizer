function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function bubbleSort(array) {
  let messages = []
  for (let k = 0; k < array.length; k++) {
    for (let i = 0 ; i < array.length - 1 - k; i++) {
      let isSwap = false
      if (array[i] > array[i + 1]) {
        let tmp = array[i]
        array[i] = array[i + 1]
        array[i + 1] = tmp
        isSwap = true
      }
      let message = {
        "left": i,
        "right": i + 1,
        "result": array.slice(),
        "isSwap": isSwap
      }
      messages.push(JSON.stringify(message))
    }
  }
  return messages
}

const svg = d3.select('svg')
const width = svg.attr('width')
const height = svg.attr('height')
const margin = {top: 60, right: 30, bottom: 60, left: 30}
const innerWidth = width - margin.right - margin.left
const innerHeight = height - margin.top - margin.bottom
const rectWidth = 30
const padding = 10
const mainGroup = svg.append('g')
.attr('id', 'mainGroup')
.attr('transform', `translate(${margin.left}, ${margin.top})`)

const origin = Array.from({length: 10}, () => Math.floor(Math.random() * 100) + 20)
origin.push(origin[0])

function init() {

  let textRects = mainGroup.selectAll('g')
                 .data(origin, (d, i) => `${d} ${i}`)
                 .join('g')
                 .attr('id', (_, i) => `textRect${i}`)
                 .attr('class', 'textRect')
                 .attr('fill', 'black')

  textRects.append('rect')
           .attr('x', (_, i) => i * (rectWidth + padding))
           .attr('y', (d) => innerHeight - d)
           .attr('width', rectWidth)
           .attr('height', (d) => d)

  textRects.append('text')
           .attr('x', (_, i) => i * (rectWidth + padding) + 4)
           .attr('y', (d) => innerHeight - d - 2)
           .text(d => d)

}

async function run() {
  init()
  let messages = bubbleSort(origin.slice())
  
  for(const msg of messages) {
    const message = JSON.parse(msg)

    const left = message.left
    const right = message.right
    const isSwap = message.isSwap

    const leftId = `textRect${left}`
    const rightId = `textRect${right}`

    const textRectLeft = mainGroup.select('#' + leftId)
    const rectLeft = textRectLeft.select('rect')
    const textLeft = textRectLeft.select('text')

    const textRectRight = mainGroup.select('#' + rightId)
    const rectRight = textRectRight.select('rect')
    const textRight = textRectRight.select('text')

    await sleep(500)
    rectLeft.attr('fill', 'red')
    rectRight.attr('fill', 'red')

    if (isSwap) {
      const rectLeftX = rectLeft.attr('x')
      const textLeftX = textLeft.attr('x')

      const rectRightX = rectRight.attr('x')
      const textRightX = textRight.attr('x')
      
      textRectLeft.attr('id', rightId)
      rectLeft.transition().attr('x', rectRightX)   
      textLeft.transition().attr('x', textRightX)   

      textRectRight.attr('id', leftId)
      rectRight.transition().attr('x', rectLeftX)
      textRight.transition().attr('x', textLeftX)
    }


    await sleep(500)
    rectLeft.attr('fill', 'black')
    rectRight.attr('fill', 'black')

  }


}

run()
