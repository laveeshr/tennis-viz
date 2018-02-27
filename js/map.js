/**
 * Created by laveeshrohra on 10/02/18.
 */

//Reference - http://bl.ocks.org/micahstubbs/8e15870eb432a21f0bc4d3d527b2d14f

const renderWorldMap = (mapContainer) => {
    let format = d3.format(",");

// Set tooltips
    let tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-5, 0])
        .html(function(d) {
            return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>"
                + "<strong>No of Players: </strong><span class='details'>" + format(d.players) +"</span>";
        });

    const el = $(mapContainer);

    let margin = {top: 0, right: 0, bottom: 0, left: 0},
        width = el.width() - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    let color = d3.scaleThreshold()
        .domain([1,5,10,15,20,25,30])
        .range(['#f2f0f7', '#dadaeb', '#bcbddc', '#9e9ac8', '#807dba', '#6a51a3', '#4a1486']);

    let legend = d3.legendColor()
        .labelFormat(d3.format(".0f"))
        .title("Number of Players")
        .labels(d3.legendHelpers.thresholdLabels)
        .scale(color);

    let svg = d3.select(mapContainer)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "background-color");

    svg.append("g")
        .attr("class", "legendQuant")
        .attr("transform", "translate(10,50)");

    svg.append('g')
        .attr('class', 'map');

    svg.select('.legendQuant')
        .call(legend);

    let projection = d3.geoMercator()
        .scale(130)
        .translate( [width / 2, height / 1.5]);

    let path = d3.geoPath().projection(projection);

    svg.call(tip);

    queue()
        .defer(d3.json, "world_countries.json")
        .defer(d3.csv, "data/10yearAUSOpenMatches.csv")
        // .defer(d3.tsv, "world_population.tsv")
        .await(ready);

    function ready(error, data, matchData){
        let playerCountByCountry = {};

        matchData.forEach(d => {
            let playerName = d['player1'];
            if(d['country1'] in playerCountByCountry){
                if(playerName in playerCountByCountry[d['country1']]){
                    playerCountByCountry[d['country1']][playerName].push(d);
                }
                else{
                    playerCountByCountry[d['country1']][playerName] = [d];
                }
            }
            else{
                playerCountByCountry[d['country1']] = {};
                playerCountByCountry[d['country1']][playerName] = [d];
            }
        });
        data.features.forEach(function(d) {
            d.players = d.id in playerCountByCountry ? size(playerCountByCountry[d.id]) : 0;
            d.data = playerCountByCountry[d.id];
        });

        svg.append("g")
            .attr("class", "countries")
            .selectAll("path")
            .data(data.features)
            .enter().append("path")
            .attr("d", path)
            .style("fill", function(d) {
                return color(d.id in playerCountByCountry ? size(playerCountByCountry[d.id]) : 0);
            })
            .style('stroke', 'white')
            .style('stroke-width', 1.5)
            .style("opacity",0.8)
            // tooltips
            .style("stroke","white")
            .style('stroke-width', 0.3)
            .on('mouseover',function(d){
                tip.show(d);

                d3.select(this)
                    .style("opacity", 1)
                    .style("stroke","white")
                    .style("stroke-width",3);

                if(d.players > 0){
                    d3.select(this)
                        .style('cursor', 'pointer');
                }
            })
            .on('mouseout', function(d){
                tip.hide(d);

                d3.select(this)
                    .style("opacity", 0.8)
                    .style("stroke","white")
                    .style("stroke-width",0.3);
            })
            .on('click', function (data) {
                if(data.players > 0){
                    d3.select('.selected-country')
                        .classed('selected-country', false);
                    d3.select(this)
                        .classed('selected-country', true);
                    callback(data);
                }
            });

        svg.append("path")
            .datum(topojson.mesh(data.features, function(a, b) { return a.id !== b.id; }))
            // .datum(topojson.mesh(data.features, function(a, b) { return a !== b; }))
            .attr("class", "names")
            .attr("d", path);
    }
};

const size = obj => Object.keys(obj).length;