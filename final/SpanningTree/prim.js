// dynamic resize for width and height
var width = d3.select("#svgdiv").node().getBoundingClientRect().width;
var height = d3.select("#svgdiv").node().getBoundingClientRect().height;

let svg = d3.select("#svgdiv").append("svg");
    svg.attr("height", height)
       .attr("width", width);

// add heading text - fade later
svg.append("svg:text")
.text("Prim最小生成树算法")
.attr("class", "heading")
.attr("x", "50%")
.attr("y", "40%")
.attr("text-anchor", "middle")
.attr("fill", "black");

svg.append("svg:text")
.text("点击开始")
.attr("class", "subheading")
.attr("x", "50%")
.attr("y", "75%")
.attr("text-anchor", "middle")
.style("fill", "black");

// algorithm global values
points = []
pointcount = 50;
started = false;
growtree = false;
startindex = 0;

// start loading points once clicked
d3.select("body")
  .on('click', function(){
      if(started == false){
          started = true;

          // start loading points
          startanimation();

          // fade heading away and descriptions
          d3.timeout(function fadeheading(){
              d3.select(".heading")
              .transition()
              .style("fill-opacity", "0")
              .duration("500");

              d3.select(".subheading")
              .transition()
              .style("fill-opacity", "0")
              .duration("500");

            //   d3.selectAll(".description")
            //   .transition()
            //   .style("fill-opacity", "0")
            //   .remove()
            //   .duration("500");

              console.log("Heading Faded");
          });

      }
  });

function startanimation()
{
    // add points one-by-one
    timer = d3.timer(function() {
        let point = {x: 30 + (Math.random() * (width - 60)),
                     y: 30 + (Math.random() * (height - 60))};

        // the actual black circles
        svg.append("circle")
            .attr("id", "point" + (points.length).toString())
            .attr("cx", point.x)
            .attr("cy", point.y)
            .attr("r", 0)
            .transition()
             .attr("r", 4);

        // transparent circles on top
        svg.append("circle")
            .attr("id", "transcircle" + (points.length).toString())
            .attr("cx", point.x)
            .attr("cy", point.y)
            .attr("r", 10)
            .attr("fill-opacity", "0")
            .on("mouseover", function(){
                console.log(this.id);
                d3.select(this.id.replace("transcircle", "#point")).attr("r", 6);
            })
            .on("mouseout", function(){
                d3.select(this.id.replace("transcircle", "#point")).attr("r", 4);
            })
            .on("click", function(){
                if(points.length == pointcount && !growtree)
                {
                    growtree = true;
                    startindex = parseInt(d3.select(this).attr("id").replace("transcircle", ""), 10);

                    console.log(startindex);

                    // start growing the tree when clicked
                    findMST();

                    // remove prompt when point clicked
                    d3.select(".subheading")
                    .transition()
                     .style("fill-opacity", "0")
                     .duration("500");

                    // show the button now
                    d3.select("#pausebutton")
                    .text("暂停")
                    .style("visibility", "visible")
                    .transition()
                     .style("opacity", "1")
                     .duration("1000");

                    // fade distances in
                    for(let i = 0; i < points.length; ++i)
                    {
                        if(i != startindex)
                        {
                            d3.select("#distance" + i.toString())
                            .transition()
                            .attr("fill-opacity", "0.8")
                            .duration("1000");
                        }
                    }
                }
            });

        svg.append("svg:text")
            .text("Inf")
            .attr("id", "distance" +  (points.length).toString())
            .attr("class", "distance")
            .attr("x", point.x)
            .attr("y", point.y)
            .attr("dy", -10)
            .attr("text-anchor", "middle")
            .attr("fill-opacity", "0")
            .attr("fill", "gray");

        points.push(point);
        if(points.length == pointcount)
        {
                timer.stop();

                // show prompt to click on a point
                d3.select(".subheading")
                .text("点击任意点作为生成树的起点")
                .attr("y", "10%")
                .transition()
                 .style("fill-opacity", "1")
                 .duration("500");
        }
    }, 500);
}

function findMST(){
    current_tree = [];
    distance = [];
    in_tree = [];
    parent = [];

    for(let i = 0; i < points.length; ++i)
    {
        if(i != startindex)
        {
            distance.push(Infinity);
            in_tree.push(false);
            parent.push(null);
        }
        else {
            distance.push(0);
            in_tree.push(false);
            parent.push(null);
        }
    }

    stopped = false;
    edgetimer = d3.interval(addnextedge, 800);

    // to pause and continue
    d3.select("#pausebutton")
    .on("click", function(){
        if(stopped)
        {
            edgetimer = d3.interval(addnextedge, 800);
            stopped = false;
            d3.select(this).text("暂停");
        }
        else {
            edgetimer.stop();
            stopped = true;
            d3.select(this).text("继续");
        }
    });

    // actual Prim's algorithm
    var mindistpoint;
    var mindist;
    function addnextedge()
    {
        if(current_tree.length == pointcount)
        {
            edgetimer.stop();
            console.log("MST complete");
            clearscreen();
        }

        // find point with closest distance
        mindist = Infinity;
        for(let i = 0; i < points.length; ++i)
        {
            if(!in_tree[i])
            {
                if(mindist > distance[i])
                {
                    mindist = distance[i];
                    mindistpoint = i;
                }
            }
        }

        // add closest point and the edge to its parent
        console.log("point" + mindistpoint.toString() + " added to MST");
        in_tree[mindistpoint] = true;
        current_tree.push(points[mindistpoint]);

        d3.select("#point" + mindistpoint.toString())
          .attr("r", 3)
          .style("fill", "gray");

        d3.select("#distance" + mindistpoint.toString())
          .transition()
           .attr("fill-opacity", "0")
           .duration("500");

        if(parent[mindistpoint] != null)
        {
            svg.append("line")
               .style("stroke", "red")
               .attr("x1", points[parent[mindistpoint]].x)
               .attr("y1", points[parent[mindistpoint]].y)
               .attr("x2", points[parent[mindistpoint]].x)
               .attr("y2", points[parent[mindistpoint]].y)
               .transition()
                   .attr("x2", points[mindistpoint].x)
                   .attr("y2", points[mindistpoint].y)
               .transition()
                   .style("stroke", "gray");
            }

        // update distances to neighbours - here, all other points
        for(let i = 0; i < points.length; ++i)
        {
            if(!in_tree[i])
            {
                newdistance = Math.sqrt(Math.pow(points[i].x - points[mindistpoint].x, 2) + Math.pow(points[i].y - points[mindistpoint].y, 2));
                if(distance[i] > newdistance)
                {
                    distance[i] = newdistance;
                    parent[i] = mindistpoint;

                    d3.select("#distance" + i.toString())
                      .transition()
                       .text(Math.round(distance[i]))
                       .duration("300");
                }
            }
        }
    }
}

// clear the screen eventually
function clearscreen(){
    d3.timeout(function(){

            // show the button now
            d3.select("#pausebutton")
            .attr("float", "initial")
            .attr("position", "relative")
            .on("click", function restart(){
                d3.selectAll("line")
                .transition()
                 .style("stroke-opacity", "0")
                 .duration("1000");

                d3.timeout(function removeedges(){
                    d3.selectAll("line")
                    .remove();
                }, 1100);

                // show prompt to click on a point
                d3.select(".subheading")
                .text("点击任意点作为生成树的起点")
                .attr("y", "10%")
                .transition()
                 .style("fill-opacity", "1")
                 .duration("500");

                growtree = false;

            })
            .transition()
             .text("重试")
             .duration("1000");

            d3.select(".heading")
            .text("最小生成树完成")
            .attr("y", "10%")
            .transition()
                .style("fill-opacity", "1")
                .duration("500")
            .transition()
                .style("fill-opacity", "0")
                .duration("1500");

    }, 1000);
}