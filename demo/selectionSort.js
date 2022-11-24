function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function selectionSort(array) {
    let messages = []
    let minIndex;
    let message;
    for (let k = 0; k < array.length - 1; k++) {
        minIndex = k;
        let isSwap = false
        for (let i = k + 1; i < array.length; i++) {


            if (array[i] < array[minIndex]) {
                minIndex = i;
            }           
            
            message = {
                "left": k,
                "right": i,
                "result": array.slice(),
                "isSwap": isSwap,
                "minValue":minIndex,
                "finished": null
            }
            messages.push(JSON.stringify(message))

        }
        // 交换array
        [array[k], array[minIndex]] = [array[minIndex], array[k]];

        // 交换矩形
        isSwap = true;
        message = {
            "left": k,
            "right": minIndex,
            "result": array.slice(),
            "isSwap": isSwap,
            "minValue":minIndex,
            "finished": null
        }
        messages.push(JSON.stringify(message))
    }
    return messages
}

const svg = d3.select('svg')
const width = svg.attr('width')
const height = svg.attr('height')
const margin = { top: 60, right: 30, bottom: 60, left: 30 }
const innerWidth = width - margin.right - margin.left
const innerHeight = height - margin.top - margin.bottom
const rectWidth = 30
const padding = 10
const mainGroup = svg.append('g')
    .attr('id', 'mainGroup')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

const origin = Array.from({ length: 4 }, () => Math.floor(Math.random() * 100) + 20)
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

function complete(key) {
    mainGroup.select(`#textRect${key}`).select('rect').attr('fill', 'orange');
}

function minValue(key) {
    mainGroup.select(`#textRect${key}`).select('rect').attr('fill', 'blue');
}


async function run() {
    init()
    let messages = selectionSort(origin.slice());

    for (const msg of messages) {
        const message = JSON.parse(msg)

        const left = message.left
        const right = message.right
        const isSwap = message.isSwap
        const finished = message.finished
        const minValue = message.minValue

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

        complete(finished);

        minValue(minValue);
    }
    await sleep(500);
    complete(0)
}

run()
