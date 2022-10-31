function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const width = 500
const height = 500

const svg = d3.select('body')
              .append('svg')
              .attr('width', width)
              .attr('height', height)


const array1 = [35, 70, 24, 86, 59]
const array2 = [35, 24, 70, 86, 59]

async function run() {

  svg.selectAll('rect')
    .data(array1, (d) => d)
    .join('rect')
    .attr('width', 25)
    .attr('height', (d) => d)
    .attr('x', (_, i) => i * 30)
    .attr('y', 20)

  svg.selectAll('text')
     .data(array1, (d) => d)
     .join('text')
     .attr('x', (_, i) => i * 30 + 3)
     .attr('y', 32)
     .attr('fill', 'white')
     .text((d) => d)

  await sleep(1000)

  svg.selectAll('rect')
     .filter(':nth-child(2), :nth-child(3)')
     .attr('fill', 'red')

  await sleep(500)

  svg.selectAll('rect')
    .data(array2, (d) => d)
    .join(
      enter => enter,
      update =>
          update.call(update => update.transition(svg.transition().duration(750))
                                .attr("x", (_, i) => i * 30)),
      exit => exit
    )

  svg.selectAll('text')
     .data(array2, (d) => d)
     .join(
        enter => enter,
        update => update.call(update => update.transition(svg.transition().duration(750))
                                              .attr('x', (_, i) => i * 30 + 3)),
        exit => exit
     )
}

run()