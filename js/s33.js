(function() {
	var section = d3.selectAll("#s3");
	var div = section.append("div");
	div.html("Hello, world2!");

	var svg = d3.select("#svg3"), margin = {
		top : 20,
		right : 20,
		bottom : 30,
		left : 40
	}, width = +svg.attr("width") - margin.left - margin.right, height = +svg
			.attr("height")
			- margin.top - margin.bottom, g = svg.append("g").attr("transform",
			"translate(" + margin.left + "," + margin.top + ")");

	var x = d3.scaleBand().rangeRound([ 0, width ]).paddingInner(0.05).align(
			0.1);

	var y = d3.scaleLinear().rangeRound([ height, 0 ]);

	var z = d3.scaleOrdinal().range(
			[ "#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56" ]);

	d3.csv("./AccidentsByLightAndWeather.csv", function(d, i, columns) {
		for (i = 1, t = 0; i < columns.length; ++i)
			t += d[columns[i]] = +d[columns[i]];
		d.total = t;
		return d;
	}, function(error, data) {
		if (error)
			throw error;

		var keys = data.columns.slice(1);

		data.sort(function(a, b) {
			return b.total - a.total;
		});
		x.domain(data.map(function(d) {
			return d.State;
		}));
		y.domain([ 0, d3.max(data, function(d) {
			return d.total;
		}) ]).nice();
		z.domain(keys);

		g.append("g").selectAll("g").data(d3.stack().keys(keys)(data)).enter()
				.append("g").attr("fill", function(d) {
					return z(d.key);
				}).selectAll("rect").data(function(d) {
					return d;
				}).enter().append("rect").attr("x", function(d) {
					return x(d.data.State);
				}).attr("y", function(d) {
					return y(d[1]);
				}).attr("height", function(d) {
					return y(d[0]) - y(d[1]);
				}).attr("width", x.bandwidth());

		g.append("g").attr("class", "axis").attr("transform",
				"translate(0," + height + ")").call(d3.axisBottom(x));

		g.append("g").attr("class", "axis").call(
				d3.axisLeft(y).ticks(null, "s")).append("text").attr("x", 2)
				.attr("y", y(y.ticks().pop()) + 0.5).attr("dy", "0.32em").attr(
						"fill", "#000").attr("font-weight", "bold").attr(
						"text-anchor", "start").text("Population");

		var legend = g.append("g").attr("font-family", "sans-serif").attr(
				"font-size", 10).attr("text-anchor", "end").selectAll("g")
				.data(keys.slice().reverse()).enter().append("g").attr(
						"transform", function(d, i) {
							return "translate(0," + i * 20 + ")";
						});

		legend.append("rect").attr("x", width - 19).attr("width", 19).attr(
				"height", 19).attr("fill", z);

		legend.append("text").attr("x", width - 24).attr("y", 9.5).attr("dy",
				"0.32em").text(function(d) {
			return d;
		});
	});

	
	
	
	var rect = svg3.selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
    .attr("x", function(d) { return xScale(d.x); })
    .attr("y", height)
    .attr("width", xScale.range())
    .attr("height", 0);

	rect.transition()
    .delay(function(d, i) { return i * 10; })
    .attr("y", function(d) { return y(d.y0 + d.y); })
    .attr("height", function(d) { return y(d.y0) - y(d.y0 + d.y); });
	
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
          .attr("x", function(d, i, j) { return xScale(d.x) + xScale.range() / n * j; })
          .attr("width", xScale.range() / n)
        .transition()
          .attr("y", function(d) { return y(d.y); })
          .attr("height", function(d) { return height - y(d.y); });

      rect.on("mouseover", function() { tooltip.style("display", null); })
        .on("mouseout", function() { tooltip.style("display", "none"); })
        .on("mousemove", function(d) {
          var xPosition = d3.mouse(this)[0] - 15;
          var yPosition = d3.mouse(this)[1] - 25;
          tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
          tooltip.select("text").text("hello world");
        });
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
          .attr("width", xScale.range());

      rect.on("mouseover", function() { tooltip.style("display", null); })
        .on("mouseout", function() { tooltip.style("display", "none"); })
        .on("mousemove", function(d) {
          var xPosition = d3.mouse(this)[0] - 15;
          var yPosition = d3.mouse(this)[1] - 25;
          // console.log(xPosition);
          tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
          tooltip.select("text").text("hello world");
        });
    };
	
})();
