function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function bubbleSort(array) {
  let messages = []
  for (let k = 0; k < array.length; k++) {
    for (let i = 0 ; i < array.length - 1 - k; i++) {
      if (array[i] > array[i + 1]) {
        let tmp = array[i]
        array[i] = array[i + 1]
        array[i + 1] = tmp
      }
      let message = {
        "left": i,
        "right": i + 1,
        "result": array.slice()
      }
      messages.push(JSON.stringify(message))
    }
  }
  return messages
}

async function run() {

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

  let messages = bubbleSort(origin.slice())
  
  for(const msg of messages) {
    const message = JSON.parse(msg)

    const left = message.left
    const right = message.right
    const result = message.result

    const textRectLeft = mainGroup.select(`#textRect${left}`)
    const textRectRight = mainGroup.select(`#textRect${right}`)

    textRects.data(result, (d, i) => `${d} ${i}`)
      .join(
        enter => {
          const textRect = enter.append('g')
              .attr('id', (_, i) => `textRect${i}`)
              .attr('class', 'textRect')
              .attr('fill', 'black')

          textRect.append('rect')
           .attr('x', (_, i) => ( i === left ? textRectRight : textRectLeft ).select('rect').attr('x'))
           .attr('y', (d) => innerHeight - d)
           .attr('width', rectWidth)
           .attr('height', (d) => d)
           .transition()
           .attr('x', (_, i) => i * (rectWidth + padding))

          textRect.append('text')
           .attr('x', (_, i) => ( i === left ? textRectRight : textRectLeft ).select('text').attr('x'))
           .attr('y', (d) => innerHeight - d - 2)
           .text(d => d)
           .transition()
           .attr('x', (_, i) => i * (rectWidth + padding) + 4)

          return textRect
        },
        update => update.select('rect'),
        exit => exit.remove()
      )

    await sleep(1000)
  }


}

// mainGroup.selectAll('.textRect')
// .data(res)


// async function run() {
// }
//
run()
