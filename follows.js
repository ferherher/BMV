(function ( $ ){

	var key		= 'vTij3orvHd4oT7dl31HQXaNFap85row4X9CbqD79tSEV8e7b', // Unique master Xively API key to be used as a default
		TH_feed	= '2029082394', 
		TH_datastreams	= ['V','I','SOC','CE'], 
		dataDuration	= '2days', 
		dataInterval	= 900;  
		dataDurationButtonID		= "myButton2Day";
		
// Function Declarations
var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight,
	buttonWidth =   Math.floor(x/5 -1).toString() + "px"  ;
	
	document.getElementById("main").style.width = x.toString() + "px" ;
	document.getElementById("main").style.height = y.toString() + "px" ;
	document.getElementById("button-group").style.height = (y*0.07).toString() + "px" ;
	document.getElementById("button-group").style.lineHeight = (y*0.07).toString() + "px" ;
	document.getElementById("myButtonDay").style.width = buttonWidth;
	document.getElementById("myButton2Day").style.width = buttonWidth;
	document.getElementById("myButtonWeek").style.width = buttonWidth;
	document.getElementById("myButtonMonth").style.width = buttonWidth;
	document.getElementById("myButton90Days").style.width = buttonWidth;


	// adding font size
	var legendElement = document.querySelector("#legend");
	var valuesFontSize = Math.min(50,Math.floor(x/26));
	legendElement.style.height =  (x*0.065*2+valuesFontSize).toString() + "px" ;
	legendElement.style.fontSize =  valuesFontSize.toString() + "px" ;
	

	// Graph Annotations
	function addAnnotation(force) {
		if (messages.length > 0 && (force || Math.random() >= 0.95)) {
			annotator.add(seriesData[2][seriesData[2].length-1].x, messages.shift());
		}
	}
	
	// Add One (1) Day to Date Object
	Date.prototype.addDays = function (d) {
		if (d) {
			var t = this.getTime();
			t = t + (d * 86400000);
			this.setTime(t);
		}
	};

	// Subtract One (1) Day to Date Object
	Date.prototype.subtractDays = function (d) {
		if (d) {
			var t = this.getTime();
			t = t - (d * 86400000);
			this.setTime(t);
		}
	};
	Date.prototype.format=function(e){
			var t="";
			var n=Date.replaceChars;
			for(var r=0;r<e.length;r++){
				var i=e.charAt(r);
				if(r-1>=0&&e.charAt(r-1)=="\\")
					{t+=i}
				else if(n[i])
					{t+=n[i].call(this)}
				else if(i!="\\"){t+=i}
			}
			return t
		};
		Date.replaceChars={
			shortMonths:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
			shortDays:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
			d:function(){return(this.getDate()<10?"0":"")+this.getDate()},
			D:function(){return Date.replaceChars.shortDays[this.getDay()]},
			M:function(){return Date.replaceChars.shortMonths[this.getMonth()]},
			y:function(){return(""+this.getFullYear()).substr(2)},
			H:function(){return(this.getHours()<10?"0":"")+this.getHours()},
			i:function(){return(this.getMinutes()<10?"0":"")+this.getMinutes()},
		}


	// Parse Xively ISO Date Format to Date Object
	Date.prototype.parseISO = function(iso){
		var stamp= Date.parse(iso);
		if(!stamp) throw iso +' Unknown date format';
		return new Date(stamp);
	}

	// Set xively API Key
	function setApiKey(key) {
		xively.setKey(key);
	}

	
	var buttonClicked = null;
	function highlight(id) {
		if(buttonClicked != null)
			{
			buttonClicked.style.background = "#d6d9db";
			}

		buttonClicked  = document.getElementById(id);
		buttonClicked.style.background =  "#eaeced";
	}

	
	function convertToDate(utcSeconds) {
		var myDate = new Date(0);
		myDate.setUTCSeconds(utcSeconds);
		var dateString = myDate.format('D, d M y, H:i');
		return dateString;
		}
		
	var scales = {
		"V":   d3.scale.linear().domain([9, 17]).nice(),
		"I":   d3.scale.linear().domain([-100, 100]).nice(),
		"CE":  d3.scale.linear().domain([-500, 0]).nice(),
		"SOC": d3.scale.linear().domain([0, 100]).nice(),
		}
		
		
	mySeries = new Array();
	function createGraph() {
		var interval = setInterval(function(){
			if(mySeries.length == TH_datastreams.length) {
				clearInterval(interval);
				// Initialize Graph DOM Element
				$('#content .graph-group .graph').empty();
				$('#content .graph-group .legendSwitch').empty();
				$('#content .legend').empty();
				
				var valuesNow 
				var allTemps = [];
				
				
				var legend = document.querySelector('#legend');
				var legendDate = document.createElement('div');
				
				legendDate.className = 'legendDate';
				legendDate.style.margin =  ("0 0 0"  + (valuesFontSize/4).toString() + "px") ;
				legend.appendChild(legendDate);
				myFinalSeries = new Array();

				TH_datastreams.forEach(function(datastreamName){
					mySeries.forEach(function(thisSeries) {
						if (thisSeries.name == datastreamName && thisSeries.data.length >= 50){
							myFinalSeries.push(thisSeries);

							//console.log(thisSeries.name);
							var thisTemp = [];
							thisSeries.data.forEach(function(thisData) {
								allTemps.push(thisData.y);
								thisTemp.push(thisData.y);
							});
							var minVal = Math.min.apply(Math, thisTemp);
							var maxVal = Math.max.apply(Math, thisTemp);
							var lastValue = thisTemp[thisTemp.length - 1];
							
							var lastDate = new Date(0);
							var utcSeconds = thisSeries.data[thisSeries.data.length -1].x;

							var dateString = convertToDate(utcSeconds) ;
						
							
							legendDate.innerHTML = dateString;
							var thisSeriesName =  thisSeries.name;
							if (thisSeriesName == 'BackCabin'){thisSeriesName = 'Bc'}
							else{thisSeriesName = thisSeriesName.substring(0,2) }
							
							var line = document.createElement('li');
							line.id = 'valuesNowLi';
							line.style.width = '50%'
							
							var swatch = document.createElement('div');
							swatch.className = 'swatch';
							swatch.style.backgroundColor = thisSeries.color;
							swatch.innerHTML =  thisSeriesName;
							swatch.style.width  = Math.min(50,(x*0.05).toString()) + "px" ;
							swatch.style.height = Math.min(50,(x*0.05).toString()) + "px" ;
							
							
							var Tvalue = document.createElement('div');
							Tvalue.className = 'Tvalue';
							Tvalue.id = 'Tvalue_' +  thisSeries.name;
							//console.log( 'Tvalue_' +  thisSeries.name)
							Tvalue.innerHTML =  lastValue;
							
							var AveValue = document.createElement('div');
							AveValue.className = 'AveValue';
							AveValue.id = 'AveValue_' +  thisSeries.name;
							AveValue.style.paddingLeft = (valuesFontSize/4).toString() + "px" ;
							AveValue.innerHTML =  '(' + minVal.toFixed(2)  + ' | '  + maxVal.toFixed(2) + ')';
							
							
							line.appendChild(swatch);
							line.appendChild(Tvalue);
							line.appendChild(AveValue);
							
							legend.appendChild(line);
							
							
							$('#content .valuesNow').append('<li id=\"valuesNowLi\" style=\"width: 33%;\"><span style=\"color: ' + thisSeries.color + ';padding-right: 2px; \">' + thisSeriesName +':</span>' + lastValue + '<span style=\"font-size: 0.8em;\"> (' + minVal  + ' | '  + maxVal + ')</span></li>');
							
							//var valueNow =  '<li><span style=\"color: ' + thisSeries.color + '; \">' + thisSeries.name.substring(0,2) +': </span>'  + lastValue  + '</li>';
							
							
						};
					});
				});
				
			
				var minVal  = Math.min.apply(Math, allTemps);
				
				// Build Graph
				var graph = new Rickshaw.Graph( {
					element: document.querySelector('#graph'),
					width: x*0.9,
					height: y*0.5,
					renderer: 'line',
					interpolation: 'linear',
					padding: {
						top: 0.02,
						right: 0.02,
						bottom: 0.02,
						left: 0.02
						},
					series: myFinalSeries
				});
			
				graph.render();
				
				var Hover = Rickshaw.Class.create(Rickshaw.Graph.HoverDetail, {
					render: function(args) {
						
						//console.log(args)
						utcSeconds = args.detail[0].value.x;
						var dateString = convertToDate(utcSeconds) ;
						legendDate.innerHTML = dateString;
						
						args.detail.sort(function(a, b) { return a.order - b.order }).forEach( function(d) {


							var Tvalue = document.querySelector('#Tvalue_' + d.series.name);
							//console.log(Tvalue);
							Tvalue.innerHTML = d.formattedYValue;

							var dot = document.createElement('div');
							dot.className = 'dot';
							dot.style.top = graph.y(d.value.y0 + d.value.y) + 'px';
							dot.style.borderColor = d.series.color;

							this.element.appendChild(dot);

							dot.className = 'dot active';

							this.show();

						}, this );
						}
				});

				var hover = new Hover( { graph: graph } ); 

				var legendSwitch = new Rickshaw.Graph.Legend( {
					graph: graph,
					element: document.getElementById('legendSwitch')
				} );
				
				document.getElementById('legendSwitch').style.fontSize = (valuesFontSize*0.8).toString() + "px" ;
				
				
				var shelving = new Rickshaw.Graph.Behavior.Series.Toggle( {
					graph: graph,
					legend: legendSwitch
				} );

				var ticksTreatment = 'inverse';

				// Define and Render X Axis (Time Values)
				var xAxis = new Rickshaw.Graph.Axis.Time( {
					graph: graph,
					ticksTreatment: ticksTreatment
				});
				
				xAxis.render();

				// Define and Render Y Axis (Datastream Values)
				var yAxis = new Rickshaw.Graph.Axis.Y( {
					graph: graph,
					tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
					ticksTreatment: ticksTreatment
				});
				
				yAxis.render();

				// Enable Datapoint Hover Values
				
				var hoverDetail = new Rickshaw.Graph.HoverDetail({
					graph: graph,
					formatter: function(series, x, y) {
						var swatch = '<span class="detail_swatch" style="background-color: ' + series.color + '"></span>';
						var content = swatch + series.name + ": " + parseFloat(y) + '<br>' ;
						return content;
					}
				});
					
					
				var slider = new Rickshaw.Graph.RangeSlider({
					graph: graph,
					element: $('#slider')
				});
				
			}
		}, 500);
	}


		
	
	function updateFeeds(feedId, datastreamIds, duration, interval) {

		xively.feed.get(feedId, function(feedData) {

			if(feedData.datastreams) {

				feedData.datastreams.forEach(function(datastream) {

					if(datastreamIds && datastreamIds != '' && datastreamIds.indexOf(datastream.id) >= 0) {
						//var now = new Date();
						//var then = new Date();
						//var updated = new Date;
						//updated = updated.parseISO(datastream.at);
						var diff = null;
						if(duration == '1day') diff = 86400000;
						if(duration == '2days') diff = 172800000;
						if(duration == '1week') diff = 604800000;
						if(duration == '1month') diff = 2628000000;
						if(duration == '90days') diff = 7884000000;
						//then.setTime(now.getTime() - diff);
						//if(updated.getTime() > then.getTime()) {

							
						
							xively.datastream.history(feedId, datastream.id, {duration: duration, interval: interval, limit: 1000}, function(datastreamData) {
							points = [];
								// Historical Datapoints
								if(datastreamData.datapoints) {

									// Add Each Datapoint to Array
									datastreamData.datapoints.forEach(function(datapoint) {
										points.push({x: new Date(datapoint.at).getTime()/1000.0, y: parseFloat(datapoint.value)});
									});
								}
								var mycolor = 'steelblue'
								var myrenderer = 'line'
								if(datastream.id ==  'V') {mycolor = '#FFD462'; myrenderer = 'line'}
								if(datastream.id ==  'I') {mycolor = '#2F9C9E'; myrenderer = 'line'}
								if(datastream.id ==  'P') {mycolor = '#FC7D49'; myrenderer = 'line'}
								if(datastream.id ==  'CE') {mycolor = '#48995C'; myrenderer = 'line'}
								if(datastream.id ==  'SOC') {mycolor = '#1760FF'; myrenderer = 'line'}
								//B82A64					
								
								
								// Add Datapoints Array to Graph Series Array
								mySeries.push({
										name:datastream.id,
										data: points,
										color: mycolor,
										renderer : myrenderer,
										scale: scales[datastream.id]
										
								});
								
								
								console.log('Datastream requested! (' + datastream.id + ')');
							});
						//} else {
								//$('#content .datastreams.datastreams .graphWrapper').html('<div class="alert alert-box no-info">Sorry, this datastream does not have any associated data.</div>');
						//}
					} else {
								console.log('Datastream not requested! (' + datastream.id + ')');
					}
				// Create Datastream UI
				//$('.datastreams' ).empty();
				//$('.datastreams' ).remove();
				});
				createGraph();
			}
		});
	}

	function setFeeds(TH_feed, TH_datastreams) {
		id = TH_feed;
		xively.feed.history(id, {  duration: "2days", interval: 900 }, function (data) {
			$('#content .duration-day').click(function() {
				mySeries = []
				highlight('myButtonDay')
				updateFeeds(data.id, TH_datastreams, '1day', 60);
				return false;
			});
			
			$('#content .duration-2days').click(function() {
				mySeries = []
				highlight('myButton2Day')
				updateFeeds(data.id, TH_datastreams, '2days', 180);
				return false;
			});
			
			$('#content .duration-week').click(function() {
				mySeries = []
				highlight('myButtonWeek')
				updateFeeds(data.id, TH_datastreams, '1week', 660);
				return false;
			});

			$('#content .duration-month').click(function() {
				mySeries = []
				highlight('myButtonMonth')
				updateFeeds(data.id, TH_datastreams, '1month', 2400);
				return false;
			});

			$('#content .duration-90').click(function() {
				mySeries = []
				highlight('myButton90Days')
				updateFeeds(data.id, TH_datastreams, '90days', 9600);
				return false;
			});

			// Handle Datastreams
			if(dataDuration != '' && dataInterval != 0) {
				highlight(dataDurationButtonID)
				updateFeeds(data.id, TH_datastreams, dataDuration, dataInterval);

			} else {
				updateFeeds(data.id, TH_datastreams, '1day', 900);
			}
		});
	}
// END Function Declarations

// BEGIN Initialization

	setApiKey(key);
	setFeeds(TH_feed,TH_datastreams);

// END Initialization

})( jQuery );
