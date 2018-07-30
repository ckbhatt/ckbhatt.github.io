(function() {
	var section = d3.selectAll("#s1");
	var div = section.append("div");
	var timeDD = document.getElementById("timeUnit");
	var timeUnit = timeDD.options[timeDD.selectedIndex].text; 
    var colorScale = d3v3.scale.category20();

	generateCode = function(timeunit){
		switch(timeunit){
			case "Month":
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
				code = 
`library(plyr)
acc_by_day = count(accidents, "Day_of_Week")
colnames(acc_by_day) = c('Day of Week', 'Number of Accidents')
write.csv(acc_by_day, "~/dv/AccidentsByDay.csv", row.names=FALSE)`;
				break;
			case "Hour":
				code =
`library(plyr)
acc_time = data.frame(Time = accidents[,'Time'])
foo = data.frame(do.call('rbind', strsplit(as.character(acc_time$Time),':',fixed=TRUE)))
hourlyDF1 = count(foo, "X1")
colnames(hourlyDF1) = c('Hour of Day', 'Number of Accidents')
hourlyDF1
write.csv(hourlyDF1, "~/dv/AccidentsByHour.csv", row.names=FALSE)`;
				break; 
		}
		return code;
	}
	
	annotate = function(timeunit) {
		switch(timeunit){
		case "Month":
			break;
		case "Day":
			x1 = $('#svg1 rect')[0].x.baseVal.value
			x2 = $('#svg1 rect')[6].x.baseVal.value
			y1 = $('#svg1 rect')[0].y.baseVal.value
			y2 = $('#svg1 rect')[6].y.baseVal.value
			d3.select("#svg1")
				.append("rect")
				.attr("x", x1+40)
				.attr("y", y1-10)
				.attr("width",110)
				.attr("height",20);
			d3.select("#svg1")
			.append("text")
			.attr("x", x1+100)
			.attr("y", y1+5)
			.attr("font-family", "sans-serif")
			.attr("font-size", 10)
			.attr("fill", "#FFF")
			.attr("text-anchor", "middle")
			.text("Less accidents on Sun");
			d3.select("#svg1")
				.append("rect")
				.attr("x", x2+40)
				.attr("y", y2-10)
				.attr("width",110)
				.attr("height",20);
			d3.select("#svg1")
			.append("text")
			.attr("x", x2+100)
			.attr("y", y2+5)
			.attr("font-family", "sans-serif")
			.attr("font-size", 10)
			.attr("fill", "#FFF")
			.attr("text-anchor", "middle")
			.text("Less accidents on Sat");
			break;
		case "Hour":
			x1 = $('#svg1 rect')[8].x.baseVal.value
			x2 = $('#svg1 rect')[18].x.baseVal.value
			y1 = $('#svg1 rect')[8].y.baseVal.value
			y2 = $('#svg1 rect')[18].y.baseVal.value
			d3.select("#svg1")
				.append("rect")
				.attr("x", x1-50)
				.attr("y", y1-10)
				.attr("width",200)
				.attr("height",20);
			d3.select("#svg1")
			.append("text")
			.attr("x", x1+40)
			.attr("y", y1+5)
			.attr("font-family", "sans-serif")
			.attr("font-size", 10)
			.attr("fill", "#FFF")
			.attr("text-anchor", "middle")
			.text("More accidents on morning office hours");
			d3.select("#svg1")
				.append("rect")
				.attr("x", x2+40)
				.attr("y", y2-10)
				.attr("width",200)
				.attr("height",20);
			d3.select("#svg1")
			.append("text")
			.attr("x", x2+130)
			.attr("y", y2+5)
			.attr("font-family", "sans-serif")
			.attr("font-size", 10)
			.attr("fill", "#FFF")
			.attr("text-anchor", "middle")
			.text("More accidents on evening office hours");
			break;
		}
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
		
		div.html("Accidents By " + timeUnit);
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
			colorScale.domain(data.map(function (d){ return d["timeunit"]; }));
			
			g.append("g")
			.attr("class", "axis axis--x")
			.attr("transform","translate(0," + height + ")")
			.call(d3.axisBottom(x));
	
			g.append("g")
				.attr("class", "axis axis--y")
				.call(d3.axisLeft(y))
			.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", -70)
				.attr("x", -150)
				.attr("dy", "0.15em")
				.attr("font-family", "sans-serif")
				.attr("font-size", 12)
				.style("text-anchor", "end")
				.text("Number of Accidents");
	
			g.selectAll(".bar")
				.data(data).enter()
				.append("rect")
				.attr("class","bar")
				.attr("x", function(d) {
					return x(d.timeunit);
				})
				.attr("y", function(d) {
					return y(d.accidents);
				})
				.attr("width", x.bandwidth()).attr("height", function(d) {
					return height - y(d.accidents);
				})
				.attr("fill", function (d){ return colorScale(d["timeunit"]); });
			
			annotate(timeUnit, g, x, y);
		});
		
		var code = generateCode(timeUnit);
		d3.select("#timeUnitCode").html(
			hljs.highlight("R", code, true).value
		);
	}
	timeDD.onchange();
	
	
	
//	const type = d3.annotationLabel
//
//	const annotations = [{
//	  note: {
//	    label: "Longer text to show text wrapping",
//	    bgPadding: 20,
//	    title: "Annotations :)"
//	  },
//	  //can use x, y directly instead of data
//	  data: { date: "18-Sep-09", close: 185.02 },
//	  className: "show-bg",
//	  dy: 137,
//	  dx: 162
//	}]
//
//	const parseTime = d3.timeParse("%d-%b-%y")
//	const timeFormat = d3.timeFormat("%d-%b-%y")
//
//	//Skipping setting domains for sake of example
//	const x = d3.scaleTime().range([0, 800])
//	const y = d3.scaleLinear().range([300, 0])
//
//	const makeAnnotations = d3.annotation()
//	  .editMode(true)
//	  //also can set and override in the note.padding property
//	  //of the annotation object
//	  .notePadding(15)
//	  .type(type)
//	  //accessors & accessorsInverse not needed
//	  //if using x, y in annotations JSON
//	  .accessors({
//	    x: d => x(parseTime(d.date)),
//	    y: d => y(d.close)
//	  })
//	  .accessorsInverse({
//	     date: d => timeFormat(x.invert(d.x)),
//	     close: d => y.invert(d.y)
//	  })
//	  .annotations(annotations)
//
//	d3.select("#svg1")
//	  .append("g")
//	  .attr("class", "annotation-group")
//	  .call(makeAnnotations)
	
	
})();
