var delayTime = 1000,
    updateTime = 500;

var margin = {top: 20, right: 20, bottom: 30, left: 40};

var width = 500 - margin.left - margin.right;
var height = 300 - margin.top - margin.bottom;

var xScale = d3.scaleBand()        
        .rangeRound([0, width])    
		.padding(.1);    

var yScale = d3.scaleLinear().range([height, 0]);

var xAxis = d3.axisBottom(xScale);
var yAxis = d3.axisLeft(yScale).ticks(10); 

var arrayValue = ["A","B","C","D"];

var jsonObjectSVG = {};

var i = 0;

var order = "";

var dataGlobal;

var svg;

function incrementCounter(){
	i = i + 1;
	return i;
}  

function sortAscending(){
	order = "ascending";
	updateGraph();
}      

function sortDescending(){
	order = "descending";
	updateGraph();
}

function sortMaximumMinimum(){
	order = "maxmin";
	updateGraph();
}

function sortNear500(){
	order = "near500";
	updateGraph();
}

function updateAxes(element){
	svg = d3.select(".svg" + element);
    svg.select(".yaxis" + element).transition().duration(updateTime).call(yAxis);
    svg.select(".xaxis" + element).transition().duration(updateTime).call(xAxis);
}

function updateXScaleDomain(){
	xScale.domain([1,2,3,4,5,6,7,8,9,10]);
}

function updateYScaleDomain(element){
	yScale.domain([0, d3.max(dataGlobal, function(d) { return d[element]; })]);
}

function setSvg(element){
	svg = d3.select("div." + element).append("svg")
	    .attr("width", width + margin.left + margin.right)     
	    .attr("height", height + margin.top + margin.bottom)   
		.attr("class", "svg" + element)
	    .append("g")                                        
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	
}

function drawAxes(element){
    svg.append("g")
        .attr("class", "xaxis"+ element)
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

   
    svg.append("g")
        .attr("class", "yaxis" + element)
        .call(yAxis);
}

function customOrderMaxMin(entries){
	
	var copyEntries = entries.slice();
	var resultEntries = [];
	
	while (copyEntries.length>0){
		maxValue = d3.max(copyEntries);
		minValue = d3.min(copyEntries);
		resultEntries.push(maxValue);
		resultEntries.push(minValue);
		var indexMax = copyEntries.indexOf(maxValue);
		copyEntries.splice(indexMax,1);
		var indexMin = copyEntries.indexOf(minValue);
		copyEntries.splice(indexMin,1);
	}
		
	return resultEntries;
}

function customOrderNear500(entries){
	
	var copyEntries = entries.slice();
	var resultEntries = [];
	
	while (copyEntries.length>0){
		resultDiffMin = 1000;
		entryDiffMin = null;
		for (let index=0; index < copyEntries.length; ++index){
			resultDiff = Math.abs(copyEntries[index] - 500);
			if (resultDiff < resultDiffMin){
				resultDiffMin = resultDiff;
				entryDiffMin = copyEntries[index];
			}
		}
		
		resultEntries.push(entryDiffMin);
		var indexDiffMin = copyEntries.indexOf(entryDiffMin);
		copyEntries.splice(indexDiffMin,1);
	}
			
	return resultEntries;
}


function drawRects(element){
	i = 0;	
	var entries = Array.from(d3.group(dataGlobal,d => d[element]).keys());	
			
	if (order == "ascending"){
		entries.sort(d3.ascending);
	} else if (order == "descending"){
		entries.sort(d3.descending);
	} else if (order=="maxmin"){
		entries = customOrderMaxMin(entries);
	} else if (order=="near500"){
		entries = customOrderNear500(entries);
	}

	
	var bars = svg.selectAll(".bar" + element).data(entries);
	
	
	bars.exit().remove();

	
	bars.enter().append("rect")
    .attr("class", "bar" + element)
    .attr("x", function(d) { return xScale(incrementCounter()); })
    .attr("y", function(d) { return yScale(d); })
    .attr("width", xScale.bandwidth())
    .attr("height", function(d) { return height - yScale(d); }); 

	bars.transition().duration(updateTime)
        .attr("x", function(d) { return xScale(incrementCounter()); })
        .attr("y", function(d) { return yScale(d); })
        .attr("width", xScale.bandwidth())
        .attr("height", function(d) { return height - yScale(d); })
}

function drawGraph(){
	arrayValue.forEach(function(element,index,array){
		setSvg(element);
		updateXScaleDomain();
		updateYScaleDomain(element)
		drawAxes(element);
		drawRects(element);
	})
}

function updateGraph(){
	arrayValue.forEach(function(element,index,array){
		updateXScaleDomain();
		updateYScaleDomain(element)
		updateAxes(element);
		drawRects(element);
	})
}



d3.json("data/dataset.json")
	.then(function(data) {
		dataGlobal = data;
		drawGraph();
   	})
	.catch(function(error) {
		console.log(error);
  	});