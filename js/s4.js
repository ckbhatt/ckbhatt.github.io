(function() {
	var d3 = d3v3;
	var n = 6, // number of layers
	    m = 13; // number of samples per layer
	
	var margin = {top: 20, right: 50, bottom: 150, left: 75},
	    width = 960 - margin.left - margin.right,
	    height = 550 - margin.top - margin.bottom;
	
	var svg = d3.select("#chart-svg").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	    .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
	d3.csv("./AccidentsByLightAndWeather1.csv", function (data){
	    
	    var headers = ["Darkeness: No street lighting","Darkness: Street lighting unknown",
	    	"Darkness: Street lights present and lit", "Darkness: Street lights present but unlit",
	    	"Daylight: Street light present"];
	    
	    var layers = d3.layout.stack()(headers.map(function(weatherType) {
	        return data.map(function(d) {
	          return {x: d.Weather, y: +d[weatherType]};
	        });
	    }));
	    
	    var yGroupMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y; }); });
	    var yStackMax = d3.max(layers, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); });
	
	    var xScale = d3.scale.ordinal()
	        .domain(layers[0].map(function(d) { return d.x; }))
	        .rangeRoundBands([25, width], .25);
	
	    var y = d3.scale.linear()
	        .domain([0, yStackMax])
	        .range([height, 0]);
	
	    var color = d3.scale.ordinal()
	        .domain(headers)
	        .range(["#2678B2", "#FD7F28", "#339E34", "#D42A2F", "#9369BB"]);
	      
	    var xAxis = d3.svg.axis()
	        .scale(xScale)
//	        .tickSize(0)
//	        .tickPadding(6)
	        .orient("bottom");
	
	    var yAxis = d3.svg.axis()
	        .scale(y)
	        .orient("left")
	        .tickFormat(d3.format(".2s"));
	
	    var layer = svg.selectAll(".layer")
	        .data(layers)
	        .enter().append("g")
	        .attr("class", "layer")
	        .style("fill", function(d, i) { return color(i); });
	
	    var rect = layer.selectAll("rect")
	        .data(function(d) { return d; })
	        .enter().append("rect")
	        .attr("x", function(d) { return xScale(d.x); })
	        .attr("y", height)
	        .attr("width", xScale.rangeBand())
	        .attr("height", 0);
	
	    rect.transition()
	        .delay(function(d, i) { return i * 10; })
	        .attr("y", function(d) { return y(d.y0 + d.y); })
	        .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); });
	
	    //********** AXES ************
	    svg.append("g")
	        .attr("class", "axis")
	        .attr("transform", "rotate(90)")
	        .attr("transform", "translate(0," + height + ")")
	        .call(xAxis)
	        .selectAll("text")
	        	.style("text-anchor", "start")
	        	.attr("y", 0)
	        	.attr("x", 9)
	            .attr("dx", "-.2em")
	            .attr("dy", ".35em")
	            .attr("font-family", "sans-serif")
	            .attr("font-size", 12)
	            .attr("transform", function(d) {
	                  return "rotate(90)" 
	                });
	    
	    svg.append("g")
	        .attr("class", "axis")
	        .attr("transform", "translate(20,0)")
	        .attr("font-family", "sans-serif")
            .attr("font-size", 12)
	        .call(yAxis)
	      .append("text")
	        .attr("transform", "rotate(-90)")
	        .attr({"x": -150, "y": -70})
	        .attr("dy", ".15em")
	        .attr("font-family", "sans-serif")
            .attr("font-size", 12)
	        .style("text-anchor", "end")
	        .text("Log(# of Accidents)");
	
	   svg.selectAll('path')
    	.style({ 'stroke': 'black', 'fill': 'none', 'stroke-width': '1px'});
    
	    
	    var legend = svg.selectAll(".legend")
	        .data(headers.slice().reverse())
	            .enter().append("g")
	            .attr("class", "legend")
	            .attr("transform", function(d, i) { return "translate(-20," + i * 20 + ")"; })
	            .attr("font-family", "sans-serif")
	            .attr("font-size", 10);
	       
	        legend.append("rect")
	            .attr("x", width - 18)
	            .attr("width", 18)
	            .attr("height", 18)
	            .style("fill", color);
	    
	        legend.append("text")
	              .attr("x", width - 24)
	              .attr("y", 9)
	              .attr("dy", ".35em")
	              .style("text-anchor", "end")
	              .text(function(d) { return d;  });
	
	
	    d3.selectAll("input").on("change", change);
	
	    var timeout = setTimeout(function() {
	      d3.select("input[value=\"grouped\"]").property("checked", true).each(change);
	    }, 2000);
	
	    function change() {
	      clearTimeout(timeout);
	      if (this.value === "grouped") transitionGrouped();
	      else transitionStacked();
	    }
	
	    function transitionGrouped() {
	      y.domain([0, yGroupMax]);
	
	      rect.transition()
	          .duration(500)
	          .delay(function(d, i) { return i * 10; })
	          .attr("x", function(d, i, j) { return xScale(d.x) + xScale.rangeBand() / n * j; })
	          .attr("width", xScale.rangeBand() / n)
	        .transition()
	          .attr("y", function(d) { return y(d.y); })
	          .attr("height", function(d) { return height - y(d.y); });
	    };
	
	    function transitionStacked() {
	      y.domain([0, yStackMax]);
	
	      rect.transition()
	          .duration(500)
	          .delay(function(d, i) { return i * 10; })
	          .attr("y", function(d) { return y(d.y0 + d.y); })
	          .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); })
	        .transition()
	          .attr("x", function(d) { return xScale(d.x); })
	          .attr("width", xScale.rangeBand());
	    };
	});
})();