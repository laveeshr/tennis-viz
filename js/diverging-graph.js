/**
 * Created by laveeshrohra on 20/02/18.
 */

//Referenced - http://bl.ocks.org/wpoely86/e285b8e4c7b84710e463

function initDivGraph(container, colorDomain, initialData) {
    const el = $(container);
    el.empty();

    let margin = {top: 50, right: 10, bottom: 10, left: 75},
        width = el.width() - margin.left - margin.right,
        height = 550 - margin.top - margin.bottom;

    let svg = d3.select(container).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("id", "d3-plot")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    makeDivergingGraph(initialData, colorDomain, width, height, svg);
}

function makeDivergingGraph(data, colorDomain, width, height, svg) {

    //Helper Functions
    const modifyData = (d) => {

        let index = 1;
        let colorDomain = color.domain();

        colorDomain.forEach(color => {
            d[color] = +d[index++]*100/d.N;
        });

        let x0 = -1*(d[colorDomain[0]]);
        let idx = 0;
        let type = d.type;
        d.boxes = color.domain().map(function(name) { return {name: name, type: type, x0: x0, x1: x0 += +d[name], N: +d.N, n: +d[idx += 1]}; });
    };

    const getMinMax = (data) => {
        let min_val = d3.min(data, function(d) {
            return d.boxes["0"].x0;
        });

        let max_val = d3.max(data, function(d) {
            return d.boxes["1"].x1;
        });

        return [-100, 100];
    };

    const modifyColorDomain = domain => color.domain(domain);

    const mouseOver = d => {
        tip.show(d);
    };

    const mouseOut = d => {
        tip.hide(d);
    };

    let tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-5, 0])
        .html(function(d) {
            return "<strong>" + d.name + " </strong><br>"
                + "<strong>Attribute: </strong><span class='details'>" + d.type +"</span><br>"
                + "<strong>Value: </strong><span class='details'>" + d3.format(",")(d.n) +"</span>";
        });

    //Set up Graph
    let y = d3.scaleBand()
        .rangeRound([0, height])
        .padding(.3);

    let x = d3.scaleLinear()
        .rangeRound([0, width]);

    let color = d3.scaleOrdinal()
        .domain(colorDomain)
        .range(["#0c2350", "#f15a22"]);

    let xAxis = d3.axisTop(x);

    let yAxis = d3.axisLeft(y);

    data.forEach(modifyData);
    let [min_val, max_val] = getMinMax(data);

    x.domain([min_val, max_val]).nice();
    y.domain(data.map(function(d) { return d.type; }));

    let t = d3.transition()
        .duration(750)
        .ease(d3.easeExp);

    svg.append("g")
        .attr("class", "x_axis")
        .call(xAxis.tickFormat((d, i) => Math.abs(d) + "%"));

    svg.append("g")
        .attr("class", "y_axis")
        .call(yAxis);

    svg.call(tip);

    let vakken = svg.selectAll("bar")   //Bars
        .data(data, (d, i) => d.type)
        .enter().append("g")
        .attr("class", "bar")
        .attr("transform", function(d) { return "translate(0," + y(d.type) + ")"; });

    let bars = vakken.selectAll("rect") //Rectangles
        .data(function(d) { return d.boxes; })
        .enter().append("g").attr("class", "subbar");

    bars.append("rect")
        .attr("height", y.bandwidth())
        .attr("x", function(d) { return x(d.x0); })
        .attr("width", function(d) { return x(d.x1) - x(d.x0); })
        .style("fill", function(d) { return color(d.name); })
        .on("mouseover", mouseOver)
        .on("mouseout", mouseOut);

    bars.append("text")     //Text inside rectangles
        .attr("x", function(d) { return x(d.x0); })
        .attr("y", y.bandwidth()/2)
        .attr("dy", "0.5em")
        .attr("dx", "0.5em")
        .style("font" ,"11px sans-serif")
        .style("fill", "white")
        .style("text-anchor", "begin")
        .text(function(d) { return d.n !== 0 && (d.x1-d.x0)>3 ? d.n : "" });

    svg.append("g")     //Middle vertical axis
        .attr("class", "y axis")
        .append("line")
        .attr("x1", x(0))
        .attr("x2", x(0))
        .attr("y2", height);

    let startp = svg.append("g").attr("class", "legendbox").attr("id", "mylegendbox");  //Legend
    // this is not nice, we should calculate the bounding box and use that
    let legend_tabs = [0, 160];
    let legend = startp.selectAll(".legend")
        .data(color.domain().slice())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(" + legend_tabs[i] + ",-45)"; });

    legend.append("rect")
        .attr("x", 0)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("class", (d, i) => "legend"+i)
        .attr("x", 22)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "begin")
        .style("font" ,"11px sans-serif")
        .text(function(d) { return d; });

    d3.selectAll(".axis path")
        .style("fill", "none")
        .style("stroke", "#000")
        .style("shape-rendering", "crispEdges");

    d3.selectAll(".axis line")
        .style("fill", "none")
        .style("stroke", "#000")
        .style("shape-rendering", "crispEdges");

    let movesize = width/2 - startp.node().getBBox().width/2;
    d3.selectAll(".legendbox").attr("transform", "translate(" + movesize  + ",0)");


    d3.selectAll('.playerListEl')
        .on('click', (error, i, els) => {

            document.querySelector('#playerData').scrollIntoView({
                behavior: 'smooth'
            });

            let curEl = els[i];
            $('#playerList a.active').removeClass('active');
            $(curEl).addClass('active');
            let playerName = $(curEl).find('.playerName').html();
            let data = parseData($(curEl).data('data'));
            modifyColorDomain([playerName + " Avg", "Opponent[s] Avg"]);

            //Update Graph
            data.forEach(modifyData);
            let [min_val, max_val] = getMinMax(data);

            //Update Axis
            x.domain([min_val, max_val]).nice();
            y.domain(data.map(function(d) { return d.type; }));

            svg.select(".x_axis")
                .transition(t)
                .call(xAxis);

            svg.select(".y_axis")
                .transition(t)
                .call(yAxis);

            let vakken = svg.selectAll(".bar")
                .data(data, (d, i) => d.type);

            vakken.exit()
                .transition()
                .duration(300)
                .style("opacity", 0)
                .remove();

            let merged = vakken
                .enter().append("g")
                .attr("class", "bar")
                .merge(vakken)
                .attr("transform", function(d) { return "translate(0," + y(d.type) + ")"; });

            merged.selectAll(".subbar")
                .remove();

            let bars = merged.selectAll("rect") //Rectangles
                .data(function(d) { return d.boxes; })
                .enter().append("g").attr("class", "subbar");

            let rects = bars.append("rect")
                .on("mouseover", d => {
                    tip.show(d);
                })
                .on("mouseout", d => {
                    tip.hide(d);
                });

            rects
                .transition(t)
                .attr("height", y.bandwidth())
                .attr("x", function(d) { return x(d.x0); })
                .attr("width", function(d) { return x(d.x1) - x(d.x0); })
                .style("fill", function(d) { return color(d.name); });

            bars.append("text")     //Text inside rectangles
                .attr("x", function(d) { return x(d.x0); })
                .attr("y", y.bandwidth()/2)
                .attr("dy", "0.5em")
                .attr("dx", "0.5em")
                .style("font" ,"11px sans-serif")
                .style("fill", "white")
                .style("text-anchor", "begin")
                .text(function(d) { return d.n !== 0 && (d.x1-d.x0)>3 ? d.n : "" });

            svg.select(".y.axis").remove();

            svg.append("g")     //Middle vertical axis
                .attr("class", "y axis")
                .append("line")
                .attr("x1", x(0))
                .attr("x2", x(0))
                .attr("y2", height);

            svg.select(".legend0").text(playerName + " Avg");
        });


    // });
}