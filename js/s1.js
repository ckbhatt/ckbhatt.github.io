(function() {
	var section = d3.selectAll("#s1");
	var div = section.append("div");
	var timeDD = document.getElementById("timeUnit");
	var timeUnit = timeDD.options[timeDD.selectedIndex].text; 
	
	generateCode = function(timeunit){
		switch(timeunit){
			case "Hour":
				code = 
`library(plyr)
acc_month = data.frame(Date = accidents[,'Date'])
woo = data.frame(do.call('rbind', strsplit(as.character(acc_month$Date),'/',fixed=TRUE)))
monthlyDF1 = count(woo, "X2")
colnames(monthlyDF1) = c('timeunit', 'accidents')
monthlyDF1$timeunit = month.abb[monthlyDF1$timeunit]
write.csv(monthlyDF1, "~/dv/AccidentsByMonth.csv", row.names=FALSE)`;	
				break;
			case "Day":
				code = `c
				d`; 
				break;
			case "Month":
				break; 
			case "Year":
				break; 
		}
		return code;
	}
	
	timeDD.onchange = function(){
		timeUnit = timeDD.options[timeDD.selectedIndex].text;		
			
		var svg = d3.select("#svg1");
		svg.selectAll("*").remove();
		var margin = {
			top : 20,
			right : 20,
			bottom : 30,
			left : 40
		}, width = +svg.attr("width") - margin.left - margin.right, height = +svg
				.attr("height")
				- margin.top - margin.bottom;
		
		div.html("Hello, world! " + timeUnit);
		var x = d3.scaleBand().rangeRound([ 0, width ]).padding(0.1);
		var y = d3.scaleLinear().rangeRound([ height, 0 ]);
	
		var g = svg.append("g").attr("transform",
				"translate(" + margin.left + "," + margin.top + ")");
	
		d3.csv(`./AccidentsBy${timeUnit}.csv`, function(d) {
			d.accidents = +d.accidents;
			return d;
		}, function(error, data) {
			if (error)
				throw error;
	
			x.domain(data.map(function(d) {
				return d.timeunit;
			}));
			y.domain([ 0, d3.max(data, function(d) {
				return d.accidents;
			}) ]);
	
			g.append("g").attr("class", "axis axis--x").attr("transform",
					"translate(0," + height + ")").call(d3.axisBottom(x));
	
			g.append("g").attr("class", "axis axis--y").call(
					d3.axisLeft(y).ticks(10, "%")).append("text").attr("transform",
					"rotate(-90)").attr("y", 6).attr("dy", "0.71em").attr(
					"text-anchor", "end").text("Number of Accidents");
	
			g.selectAll(".bar").data(data).enter().append("rect").attr("class",
					"bar").attr("x", function(d) {
				return x(d.timeunit);
			}).attr("y", function(d) {
				return y(d.accidents);
			}).attr("width", x.bandwidth()).attr("height", function(d) {
				return height - y(d.accidents);
			});
		});
		
		var code = generateCode(timeUnit);
		d3.select("#timeUnitCode").html(
			hljs.highlight("R", code, true).value
		);
	}
	timeDD.onchange();
})();
