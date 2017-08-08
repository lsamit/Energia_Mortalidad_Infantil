// Aquí se define el tamaño del gráfico. 
var margin = {top: 30, right: 40, bottom: 50, left: 50},
    width = 960 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom; // Establece los márgenes

//Radio de los circulos mostrados
var circlerad = 5;

//Pais Resaltado
var Focus = "ARG"

//Año Mostradó
var YearShown = 1984

// Duración de las transiciones en ms
var tr = 2000;

var x;
var y;
// var z;
var color;
var xAxis;
var yAxis;

var chart = d3.select(".chart")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
    		.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
				.classed("topgroup",true)

				
				
				

d3.csv("Correlacion.csv",type, function(error,data) {

	var ChartData = {'Data': data};
	d3.select(".chart").datum(ChartData);

	var imp = d3.selectAll(".yearinput");
	imp.nodes()[0].checked = true;
	drawyear(YearShown);

	imp.on("change",function(d,i) {
			YearShown = this.value;
			drawyear(this.value);});


	var CountryList = data.map(function(d){return [d.Country_Name, d.Country_Code];}) 
						.sort(function(a,b){ return a[0].localeCompare(b[0]);}) 
						.filter(function(data,index,self){ return (index>0)?self[index][0]!=self[index-1][0]:1;}) 
	var CountrySelector = d3.selectAll(".selectcountry");

	CountryList.forEach(function(d,i) {
				CountrySelector.append("option")
					.attr("value",d[1])
					.text(d[0])
					.filter(function(){return d[1] == Focus;})
						.attr("selected","selected");});

	CountrySelector.on("change", function(d,i) {
					Focus = this.value;
					drawyear(YearShown);});
							
});


function type(d) { 
	d.Watts_per_Person = +d.Watts_per_Person;
	d.Infant_Mortality = +d.Infant_Mortality
	return d;
} 


function drawchart(data) {

	x = d3.scaleLog()
			.range([circlerad+10,width-circlerad-1])
			.domain ([10,40000]);
			
	y = d3.scaleLog()
			.range([height-circlerad-5, circlerad])  
			.domain ([1,200]);

	color = d3.scaleOrdinal(d3.schemeCategory10)
				.domain([1984,1999,2013]);


	data.forEach(function(d) {
		d.xc = x(d.Watts_per_Person);
		d.yc = y(d.Infant_Mortality);
		d.r = d.Country_Code==Focus?circlerad*2.5:circlerad;
		d.key= d.Country_Code; 
		return d;
		});


	var chart = d3.select(".topgroup"); 

	var point = chart.selectAll("g.datapoint")
    			.data(data,function(d){return d.key;});

//Exit
	point.exit().remove(); 

//Enter
    var enterpoint = point.enter().append("g") 
		.attr("class","datapoint")
		.attr("transform", function(d, i) { return "translate("+ d.xc + ", "+ d.yc +" )"; });

		enterpoint.append("circle")
			.attr("r",0.0001)
			.attr("fill", function(d){return color(d.Year);});
		enterpoint.append("title");

// Update + Enter. 

	var updatepoint = chart.selectAll("g.datapoint").data(data)
		updatepoint.select("circle")
			.attr("cx",0)
			.attr("cy",0)
			.attr("stroke","black")
			.attr("class",function(d){return d.Country_Code;})
			.transition().duration(tr) 
				.attr("r",function(d){return(d.r);})
				.attr("fill", function(d){return color(d.Year);});
		updatepoint.select("title")
			.text(function(d) {return d.Country_Code + "\n" + d.Country_Name + "\n" + d.Region + "\n" + d.IncomeGroup 
			+ "\nUso de Energía: "	+ Math.round(d.Watts_per_Person) +" Watts por persona \nMortalidad Infantil: "+d.Infant_Mortality +"\nAño: " +d.Year;});

// Eje y
	yAxis = d3.axisLeft(y);
	yAxis.tickFormat(d3.format(".1f"));
	chart.selectAll(".yaxis").remove(); 
	chart.append("g")
			.attr("class", "yaxis")
			.attr("transform","translate(-1,0)")
			.call(yAxis);
	
	chart.append("g")
			.attr("class","yaxis")
			.attr("transform", function() {return "translate("+ 0 +"," + 10 + ")"})
			.append ("text")
				.attr("dy","1em")
				.attr("transform", "rotate(270)")
				.style("text-anchor","end")
				.text("Mortalidad Infantil - Casos cada 1000 nacimientos vivos");
				
//Eje x
	xAxis = d3.axisBottom(x);
	xAxis.tickFormat(d3.format(".0f"));
	chart.selectAll(".xaxis").remove();
	chart.append("g")
			.attr("class", "xaxis")
			.attr("transform",function() {return "translate(0," + (height+1) + ")"})
			.call(xAxis)
		.selectAll("text")
			.attr("y", 0)
			.attr("x", -9)
			.attr("dy", ".35em")
			.attr("transform", "rotate(270)")
			.style("text-anchor", "end");
			
			
	chart.append("g")
			.attr("class","xaxis")
			.attr("transform", function() {return "translate("+(width-5)+"," + (height-2) + ")"})
			.attr("dy","-0.75em")
			.append ("text")
				.style("text-anchor","end")
				.text("Uso de Energía en Watts por persona");
				
		updatepoint.transition().duration(tr) 
			.attr("transform", function(d, i) { return "translate("+ d.xc + ", "+ d.yc +" )"; });
			
}


function drawyear(k) {
	kData = d3.select(".chart").datum().Data.filter(function(d,i){return (d.Year==k);});
		drawchart(kData);
}
