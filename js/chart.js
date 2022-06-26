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

var i = 0;

var firstView = true;
var dataGlobal;

var svg;

var newKeyOrder=[];
var mapA = {};
var mapB = {};
var mapC = {};
var mapD = {};

function incrementCounter(){
	i = i + 1;
	return i;
}  

function sortAscendingVarA(){
	updateGraph("A",true);
	updateGraph("B",false);
	updateGraph("C",false);
	updateGraph("D",false);
}  

function sortAscendingVarB(){
	updateGraph("B",true);
	updateGraph("A",false);
	updateGraph("C",false);
	updateGraph("D",false);
}  

function sortAscendingVarC(){
	updateGraph("C",true);
	updateGraph("A",false);
	updateGraph("B",false);
	updateGraph("D",false);
}  

function sortAscendingVarD(){
	updateGraph("D",true);
	updateGraph("A",false);
	updateGraph("B",false);
	updateGraph("C",false);
}      


function updateAxes(element){
	svg = d3.select(".svg" + element);
    svg.select(".yaxis" + element).transition().duration(updateTime).call(yAxis);
    svg.select(".xaxis" + element).transition().duration(updateTime).call(xAxis);
}

function updateXScaleDomain(){
	if (firstView){
		xScale.domain([1,2,3,4,5,6,7,8,9,10]);
	} else {
		xScale.domain(newKeyOrder);
	}
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


function drawRects(variable,sortAsc){
	i = 0;	
	var map;
		
	var entries = Array.from(d3.group(dataGlobal,d => d[variable]).keys());	
	
	if (firstView){
		entries.forEach(function(element,index,array){	
			if (variable == "A"){
				mapA[index+1] = element;
			} else if (variable == "B"){
				mapB[index+1] = element;
			}else if (variable == "C"){
				mapC[index+1] = element;
			}else {
				mapD[index+1] = element;
			}
		});
	} else {
		entries = [];
		if (variable == "A"){
			map = mapA;
		} else if (variable == "B"){
			map = mapB;
		} else if (variable =="C"){
			map = mapC;
		} else {
			map = mapD;
		}
		newKeyOrder.forEach(function(element,index,array){	
			entries.push(map[element]);
		})
	}
	
	copyNewKeyOrder = newKeyOrder.slice();
	
	var bars = svg.selectAll(".bar" + variable).data(entries);	
	bars.exit().remove();

	if (firstView){
		bars.enter().append("rect")
	    .attr("class", "bar" + variable)
	    .attr("x", function(d) { return xScale(incrementCounter()); })
	    .attr("y", function(d) { return yScale(d); })
	    .attr("width", xScale.bandwidth())
	    .attr("height", function(d) { return height - yScale(d); }); 
	
		bars.transition().duration(updateTime)
	        .attr("x", function(d) { return xScale(incrementCounter()); })
	        .attr("y", function(d) { return yScale(d); })
	        .attr("width", xScale.bandwidth())
	        .attr("height", function(d) { return height - yScale(d); })
	} else {
		bars.enter().append("rect")
	    .attr("class", "bar" + variable)
		.attr("x", function(d) { return xScale(newKeyOrder.shift()); })
	    .attr("y", function(d) { return yScale(d); })
	    .attr("width", xScale.bandwidth())
	    .attr("height", function(d) { return height - yScale(d); }); 
	
		bars.transition().duration(updateTime)
		    .attr("x", function(d) { return xScale(copyNewKeyOrder.shift()); })
	        .attr("y", function(d) { return yScale(d); })
	        .attr("width", xScale.bandwidth())
	        .attr("height", function(d) { return height - yScale(d); })
	}
}

function setNewDomainOrder(variable,sortAsc){
	var map;	
	var entries = Array.from(d3.group(dataGlobal,d => d[variable]).keys());	
	
	if (sortAsc){
		newKeyOrder = [];
		entries.sort(d3.ascending);
		if (variable == "A"){
			map = mapA;
		} else if (variable == "B"){
			map = mapB;
		} else if (variable =="C"){
			map = mapC;
		} else {
			map = mapD;
		}
		entries.forEach(function(element,index,array){
			var key = parseInt(Object.keys(map).find(key => map[key] === element));
			newKeyOrder.push(key);
		})	
	}
}

function drawGraph(){
	arrayValue.forEach(function(element,index,array){
		setSvg(element);
		updateXScaleDomain();
		updateYScaleDomain(element)
		drawAxes(element);
		drawRects(element,false);
	})
		firstView = false;
}

function updateGraph(variable,sortAsc){
	setNewDomainOrder(variable,sortAsc)
	updateXScaleDomain();
	updateYScaleDomain(variable)
	updateAxes(variable);
	drawRects(variable,sortAsc);	
}

d3.json("data/dataset.json")
	.then(function(data) {
		dataGlobal = data;
		drawGraph();
   	})
	.catch(function(error) {
		console.log(error);
  	});