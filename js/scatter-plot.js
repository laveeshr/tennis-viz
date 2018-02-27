/**
 * Created by laveeshrohra on 26/02/18.
 */

//Reference - https://bl.ocks.org/d3noob/6f082f0e3b820b6bf68b78f2f7786084

function scatterPlot(container) {

    const el = $(container);

    let margin = {top: 20, right: 50, bottom: 30, left: 50},
        width = el.width() - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    let tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-5, 0])
        .html(function(d) {
            return "<strong>Year: </strong><span class='details'>" + (d.year) +"</span><br>"
                    + "<strong>Winner: </strong><span class='details'>" + (d.player) +"</span><br>"
                    + "<strong>Wins: </strong><span class='details'>" + d.count + "</span>";
        });

// parse the date / time
    let parseTime = d3.timeParse("%d-%b-%y");

// set the ranges
    let x = d3.scaleLinear().range([0, width]);
    let y = d3.scaleLinear().range([height, 0]);

// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
    let svg = d3.select(container).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    svg.call(tip);

// Get the data
    d3.csv("data/10yearAUSOpenMatches.csv", function(error, csv_data) {
        if (error) throw error;

        let groupByYear = {};

        // format the data
        csv_data.forEach(function(d) {
            let year = d['year'];
            let winner = d['winner'];
            if(year in groupByYear){
                if(winner in groupByYear[year]){
                    groupByYear[year][winner] += 1;
                }
                else{
                    groupByYear[year][winner] = 1;
                }
            }
            else{
                groupByYear[year] = {};
                groupByYear[year][winner] = 1;
            }
        });

        let data = [];

        Object.keys(groupByYear).forEach(year => {
            let maxPlayer = d3.entries(groupByYear[year])
                .sort((a, b) => { return d3.descending(a.value.count, b.value.count); })[0];
            data.push({
                year: year,
                player: maxPlayer.key,
                count: maxPlayer.value
            });
        });

        // Scale the range of the data
        // x.domain(d3.extent(data, function(d) { return d.year; }));
        x.domain([2003, 2015]);
        y.domain([0, d3.max(data, function(d) { return d.count; }) + 3]);

        let node = svg.selectAll("g")
            .data(data)
            .enter()
            .append("g");

        node.append("circle")
            .attr("class", "dot")
            .attr("cx", function(d) { return x(d.year); })
            .attr("cy", function(d) { return y(d.count); })
            .attr("r", 30)
            .style("fill", "red")
            .on("mouseover", (d) => tip.show(d))
            .on("mouseout", d => tip.hide());

        node.append("text")
            .attr("x", function(d) { return x(d.year)-50; })
            .attr("y", function(d) { return y(d.count); })
            .text(d => d.player)
            .on("mouseover", (d) => tip.show(d))
            .on("mouseout", d => tip.hide());

        // Add the X Axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // Add the Y Axis
        svg.append("g")
            .call(d3.axisLeft(y));

    });
}