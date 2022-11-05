function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function bubbleSort(array) {
  let messages = []
  for (let k = 0; k < array.length; k++) {
    for (let i = 0; i < array.length - 1 - k; i++) {
      if (array[i] > array[i + 1]) {
        let tmp = array[i]
        array[i] = array[i + 1]
        array[i + 1] = tmp
      }
      let message = {
        "i": i,
        "j": i + 1,
        "res": array.slice()
      }
      messages.push(JSON.stringify(message))
    }
  }
  return messages
}

function paintOrigin(svg) {

  svg.selectAll('rect')
    .data(origin, (d) => d)
    .join('rect')
    .attr('width', 25)
    .attr('height', (d) => d)
    .attr('x', (_, i) => i * 30)
    .attr('y', 20)

  svg.selectAll('text')
    .data(origin, (d) => d)
    .join('text')
    .attr('x', (_, i) => i * 30 + 3)
    .attr('y', 32)
    .attr('fill', 'white')
    .text((d) => d)

}

async function paintMsg(svg, msg) {
  const message = JSON.parse(msg)
  const i = message.i + 1
  const j = message.j + 1
  const res = message.res

  await sleep(500)

  svg.selectAll('rect')
    .filter(`:nth-child(${i}), :nth-child(${j})`)
    .attr('fill', 'red')


  await sleep(500)


  svg.selectAll('rect')
    .data(res, (d) => d)
    .join(
      enter => enter,
      update =>
        update.call(update => update.transition(svg.transition().duration(500))
          .attr("x", (_, i) => i * 30)),
      exit => exit
    )

  svg.selectAll('text')
    .data(res, (d) => d)
    .join(
      enter => enter,
      update => update.call(update => update.transition(svg.transition().duration(500))
        .attr('x', (_, i) => i * 30 + 3)),
      exit => exit
    )
  await sleep(500)

  svg.selectAll('rect')
    .filter(`:nth-child(${i}), :nth-child(${j})`)
    .attr('fill', 'black')
}

const width = 500
const height = 500

const origin = Array.from({ length: 10 }, () => Math.floor(Math.random() * 100) + 20)

async function run() {

  const svg = d3.select('body')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
  paintOrigin(svg)
  const messages = bubbleSort(origin)
  for (let i = 0; i < messages.length; i++) {
    paintMsg(svg, messages[i])
    await sleep(2000)
  }
}

run()