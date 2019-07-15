var height = window.innerHeight
var width = window.innerWidth - 360

var l = 0;
const draw = (matrix_) => {
    var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + (width/(2*1.2)) + "," + (height/2) + ")")
    
    // give this matrix to d3.chord(): it will calculates all the info we need to draw arc and ribbon
    var res = d3.chord()
        .padAngle(0.005)
        .sortSubgroups(d3.descending)
        (matrix_)
    // if(l != 0) return;
        console.log("matrix", matrix_, res)
    //  l++
    // Add the links between groups
    svg
        .datum(res)
        .append("g")
        .selectAll("path")
        .data((d) => { return d})
        .enter()
        .append("path")
            .attr("d", d3.ribbon().radius((height - 250)/2))
            .style("fill", d => full[d.target.index].type == 'sdg' ? full[d.target.index].color : full[d.source.index].color)
            .style("opacity", d => d.source.value === 1.001 ? .8 : .6 )
            .style("stroke", "rgba(255,255,255,.2)");
    
    // this group object use each group of the data.groups object
    var group = svg
        .datum(res)
        .append("g")
        .selectAll("g")
        .data((d) => d.groups)
        .enter()
    
    // // add the group arcs on the outer part of the circle
    group.append("g")
        .append("path")
        .style("fill", d => full[d.index].type == 'sdg' ? full[d.index].color : full[d.index].color)
        .style("stroke", "rgba(255,255,255,.2)")
        .attr("d", d3.arc()
            .innerRadius((height - 250)/2 + 2)
            .outerRadius((height - 250)/2 + 12)
        )
    
    // // Add the labels of a few ticks:
    group
        .selectAll(".group-tick-label")
        .data((d) => { return groupTicks(d, 25); })
        .enter()
        .append("g")
        .attr("transform", function(d) { return "rotate(" + (d.angle * 180 / Math.PI - 90) + ") translate(" + ((height - 250)/2 + 15) + ",0)"; })
        .append("text")
            .attr("x", 8)
            .attr("dy", ".35em")
            .attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180) translate(-16)" : null; })
            .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
            .text(d =>  full[d.index].name.length < 30 ? full[d.index].name : (full[d.index].name.substr(0, 30) + '...')) 
            .style("fill", d => full[d.index].type == 'sdg' ? full[d.index].color : full[d.index].color)
            .style("font-size", 11)
}
    
// Returns an array of tick angles and values for a given group and step.
function groupTicks(d, step) {
    var k = (d.endAngle - d.startAngle) / d.value;
    return d3.range(0, d.value, step).map(function(value) {
        return { index: d.index, value: value, angle: value * k + (d.startAngle - (d.startAngle - d.endAngle)/2 )};
    });
}