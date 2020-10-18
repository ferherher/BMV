(function ( $ ){

	var fieldList= [{field:5,mycolor:'#1760FF', scales:d3.scale.linear().domain([0, 100]).nice() , id:'SOC'}, 
					{field:4,mycolor:'#48995C', scales:d3.scale.linear().domain([-500, 0]).nice(), id:'CE'},
					{field:2,mycolor:'#2F9C9E', scales:d3.scale.linear().domain([-100, 100]).nice(), id:'I'},   
					{field:1,mycolor:'#FFD462', scales:d3.scale.linear().domain([9, 17]).nice(), id:'V'}
					];
	var mySeries = new Array();
	
	// get TSid and TSkey from url
    var parameters = location.search.substring(1).split("&");
    var temp = parameters[0].split("=");
    var TSid = unescape(temp[1]);
    temp = parameters[1].split("=");
    var TSkey = unescape(temp[1]);
	var lastLogDate = new Date();
	var firstLogDate = new Date();
		
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
	document.getElementById("myButton6hours").style.width = buttonWidth;


	// adding font size
	var legendElement = document.querySelector("#legend");
	var valuesFontSize = Math.floor(x/26);
	legendElement.style.height =  (x*0.065*(Math.ceil(fieldList.length/3))+valuesFontSize).toString() + "px" ;
	legendElement.style.fontSize =  valuesFontSize.toString() + "px" ;


	
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
	

		
	function createGraph() {
		//console.log('starting createGraph');
		// wait for the request to arrive before continuing
		var myInterval = setInterval(function(){
			if(mySeries.length == fieldList.length) {
				clearInterval(myInterval);
				
				
				// Initialize Graph DOM Element
				$('#content .graph-group .graph').empty();
				$('#content .graph-group .legendSwitch').empty();
				$('#content .legend').empty();
				
				var allMins = [];
				
				
				var legend = document.querySelector('#legend');
				var legendDate = document.createElement('div');
				
				legendDate.className = 'legendDate';
				legendDate.style.margin =  ("0 0 0"  + (valuesFontSize/4).toString() + "px") ;


				mySeries.forEach(function(thisSeries) {
					//console.log(thisSeries.name + ' length '+ thisSeries.data.length);	
					if (thisSeries.data.length >= 8){
					
						allMins.push(thisSeries.minmax.min);
						var lastValue  = thisSeries.data[thisSeries.data.length -1].y;
						
						var utcSeconds = thisSeries.data[thisSeries.data.length -1].x;
						var dateString = convertToDate(utcSeconds) ;
						
						legendDate.innerHTML = dateString;
						
						var line = document.createElement('li');
						line.id = 'valuesNowLi';
						line.style.width = '33%'
						
						var swatch = document.createElement('div');
						swatch.className = 'swatch';
						swatch.style.backgroundColor = thisSeries.color;
						swatch.innerHTML =  thisSeries.name;
						swatch.style.width  = (x*0.05).toString() + "px" ;
						swatch.style.height = (x*0.05).toString() + "px" ;
						
						
						var Tvalue = document.createElement('div');
						Tvalue.className = 'Tvalue';
						Tvalue.id = 'Tvalue_' +  thisSeries.name;
						//console.log( 'Tvalue_' +  thisSeries.name)
						Tvalue.innerHTML =  lastValue;
						
						var AveValue = document.createElement('div');
						AveValue.className = 'AveValue';
						AveValue.id = 'AveValue_' +  thisSeries.name;
						AveValue.style.paddingLeft = (valuesFontSize/4).toString() + "px" ;
						AveValue.innerHTML =  '(' + thisSeries.minmax.min  + ' | '  + thisSeries.minmax.max + ')';
						
						
						line.appendChild(swatch);
						line.appendChild(Tvalue);
						line.appendChild(AveValue);
						
						legend.insertBefore(line, legend.firstChild);
						
									
					};
				});
				
				//console.log( 'allmins ' +  allMins)
				// highlight date if last log is not from the current day
				currentDay = new Date().getDate();
				lastLogDay = lastLogDate.getDate();
				if(currentDay != lastLogDay)
					{
					legendDate.style.background =  "#e9002f";
					};
					
				
				legend.insertBefore(legendDate, legend.firstChild);


				//console.log( [{x:firstLogDate, y:0}, {x:lastLogDate, y:0}]);
				var minVal  = Math.min.apply(Math, allMins.filter(isFinite));
				/*
				mySeries.unshift({
						name: 'minus0',
						data: [{x:firstLogDate.getTime()/1000.0, y:minVal - 1}, {x:lastLogDate.getTime()/1000.0, y:minVal - 1}],
						color: '#74AFE3',
						renderer : 'stack',
						opacity: 0.1
						});
				*/
						
				//console.log('minval '+ minVal);
				// Build Graph
				var graph = new Rickshaw.Graph( {
					element: document.querySelector('#graph'),
					width: x*0.9,
					height: y*0.5,
					renderer: 'multi',
					interpolation: 'linear',
					//min: minVal - 1,
					padding: {
						top: 0.02,
						right: 0.02,
						bottom: 0.02,
						left: 0.02
						},
					series: mySeries
				});
				
				graph.render();
				
				
				var Hover = Rickshaw.Class.create(Rickshaw.Graph.HoverDetail, {
					render: function(args) {
						
						//console.log(args)
						utcSeconds = args.detail[1].value.x;
						var dateString = convertToDate(utcSeconds) ;
						legendDate.innerHTML = dateString;
						
						args.detail.sort(function(a, b) { return a.order - b.order }).forEach( function(d) {

							if(d.series.name != 'minus0'){
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
							};

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
				
				/*
				// Enable Datapoint Hover Values
				
				var hoverDetail = new Rickshaw.Graph.HoverDetail({
					graph: graph,
					formatter: function(series, x, y) {
						var swatch = '<span class="detail_swatch" style="background-color: ' + series.color + '"></span>';
						var content = swatch + series.name + ": " + parseInt(y) + '<br>' ;
						return content;
					}
				});
					
				
				var slider = new Rickshaw.Graph.RangeSlider({
					graph: graph,
					element: $('#slider')
				});
				*/
				
			}
		}, 500);
	}

	function updateFeeds(numberOfDays,interval) {
		var jsonString = 'https://api.thingspeak.com/channels/'+TSid+'/feeds.json?api_key='+TSkey+';offset=0;round=1;status=0;metadata=0;location=0;results='+numberOfDays*24*12
		if(interval != 0) {jsonString = jsonString+';median='+interval};
		//console.log(jsonString);
		
		$.getJSON(jsonString, function(data) 
		{

		if(data != -1){
			//console.log( data.feeds.length )
			
			for (var fieldIndex=0; fieldIndex<fieldList.length; fieldIndex++)  // iterate through each field
				{
				fieldList[fieldIndex].data =[];
				var thisTemp = [];
				for (var h=0; h<data.feeds.length; h++)  // iterate through each feed (data point)
					{
					var p = []
					var fieldStr = "data.feeds["+h+"].field"+fieldList[fieldIndex].field;
					var v = eval(fieldStr);
	
					p[0] = new Date(data.feeds[h].created_at).getTime()/1000.0
					p[1] = parseFloat(v);
					thisTemp.push(p[1]);
					// if a numerical value exists add it
					if (!isNaN(parseInt(v))) { fieldList[fieldIndex].data.push({x:p[0], y:p[1]}); }
					else {fieldList[fieldIndex].data.push({x:p[0], y:null});}
					}
				var minVal  = Math.min.apply(Math, thisTemp.filter(isFinite));
				var maxVal = Math.max.apply(Math, thisTemp.filter(isFinite));
				fieldList[fieldIndex].name = eval("data.channel.field"+fieldList[fieldIndex].field);
				fieldList[fieldIndex].minmax = {min:minVal, max:maxVal};
				};
				
				
			for (var fieldIndex=0; fieldIndex<fieldList.length; fieldIndex++)
				{
					var mycolor = 'steelblue';
					var myrenderer = 'line';

					// Add Datapoints Array to Graph Series Array
					mySeries.push({
							name: fieldList[fieldIndex].name.substring(0,2),
							data: fieldList[fieldIndex].data,
							color: fieldList[fieldIndex].mycolor,
							renderer : myrenderer,
							minmax: fieldList[fieldIndex].minmax,
							scale: fieldList[fieldIndex].scales
					});
				};
			//draw rectangle on minus 0
			lastLogDate =  new Date(data.feeds[data.feeds.length - 1].created_at);
			firstLogDate = new Date(data.feeds[0].created_at);
			
			// Add Datapoints Array to Graph Series Array


			} else {
						console.log('no data from request!!');
			}
			});
					//console.log(mySeries);
			createGraph();


		};

	function setFeeds() {
		
			$('#content .duration-6hours').click(function() {
				mySeries = []
				highlight('myButton6hours')
				updateFeeds(0.5,0);
				return false;
			});
			 
			$('#content .duration-day').click(function() {
				mySeries = []
				highlight('myButtonDay')
				updateFeeds(1,0);
				return false;
			});
			
			$('#content .duration-2days').click(function() {
				mySeries = []
				highlight('myButton2Day')
				updateFeeds(2,0);
				return false;
			});
			
			$('#content .duration-week').click(function() {
				mySeries = []
				highlight('myButtonWeek')
				updateFeeds(7,30);
				return false;
			});

			$('#content .duration-month').click(function() {
				mySeries = []
				highlight('myButtonMonth')
				updateFeeds(30,60);
				return false;
			});


			// initial duration to 2 days
			highlight('myButtonDay')
			updateFeeds(1,0);

	}
// END Function Declarations
// BEGIN Initialization

	setFeeds();

// END Initialization

})( jQuery );
