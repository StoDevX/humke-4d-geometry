// All logic & rendering of the 2D mode is contained here
// depends on Mathbox existing in the scope as well as the gui class

/* 

*/

var Mode2D = (function (scope) {
	//Constructor 
	function Mode2D(document){
		this.document = document; 
		this.thicknessValuesTable = {'thin':0.2,'medium':0.5,'thick':1}

		this.geometry_id = "" //ID of active geometry in the left view

		// Cartesian properties
		this.objectArray = null;
		this.numCartesianObjects = 0; //Allow drawing multiple equations at the same time 
		this.current_mode = null;
		// Convex Hull points
		this.pointsArray = [];
		
	}

	// Creates the scene and everything
	Mode2D.prototype.init = function(div,gui){
		// Create two child divs 
		var leftChild = document.createElement("div");
		var rightChild = document.createElement("div");
		div.appendChild(leftChild); leftChild.id = "left-view";
		div.appendChild(rightChild); rightChild.id = "right-view";
		var style = "display:inline-block;"
		leftChild.style = style;
		rightChild.style = style;
		this.leftChild = leftChild; this.rightChild = rightChild;
		
		var viewWidth = (window.innerWidth-20)/2;
		var leftView = this.createView(leftChild,viewWidth);
		var rightView = this.createView(rightChild,viewWidth);
		this.leftView = leftView;
		this.rightView = rightView;

		// Init gui 
	    gui.init("2D",this.callbacks,this);
	    this.gui = gui;


		// Set up left view
		var camera = leftView.camera({
		  proxy: true, // this alows interactive camera controls to override the position
		  position: [0, 0, 3],
		})
		leftView = leftView.cartesian({
		  range: [[-10, 10], [-10, 10]],
		  scale: [1, 1],
		});
		leftView
		  .axis({
		    axis: 1,
		    width: 4,
		    color:'black',
		  })
		  .axis({
		    axis: 2,
		    width: 4,
		    color:'black',
		  })
		  .grid({
		    width: 1,
		    divideX: 10,
		    divideY: 10
		  });

		 // Add text
		leftView.array({
		  data: [[11,1], [0,12]],
		  channels: 2, // necessary
		  live: false,
		}).text({
		  data: ["x", "y"],
		}).label({
		  color: 0x000000,
		});

		this.leftView = leftView;
		this.CreateViewLine();

		// Draw our main shape
		this.setMode()

		// Set up right view
		rightView = rightView.cartesian({
		  range: [[-10, 10],[-10,10]],
		  scale: [1, 1],
		});
		rightView.camera({
		  proxy: true, // this alows interactive camera controls to override the position
		  position: [0, 0, 3],
		})
		this.rightView = rightView

	    this.CreateViewAxis(1,[11,1],"x")
	    this.CalculateIntersection();
	}

	Mode2D.prototype.CalculateIntersection = function(){
		var params = this.gui.params;
		if(this.readback == undefined) return;
		// Remove if it already exists
		if(this.rightView.select("#intersection_plot")){
			this.rightView.remove("#intersection_plot");
			this.rightView.remove("#intersection_data");
		}

		var points = [];
		// Calculate intersection from pixel data
		var data = this.readback.get('data');
		var w = this.readback.get('width');
		var h = this.readback.get('height');
		var ratio = w/h;

		function checkPixel(x,y){
			var index = Math.round((x + w * (y)) * 4);
			var r = data[index];
			var g = data[index+1];
			var b = data[index+2];
			var avg = (r+g+b)/3;
			if(avg == 0) {
				var p = [x,y];
				//Convert back to grid coordinates 
				p[0] = (p[0] / w) * ratio * 20 - 10;
				p[1] = (p[1] / h) * 20 - 10;
				return p;
			}
			return false;
		}

		if(params.axis == "X"){
			var x = Math.round( ((params.axis_value + 10) / 20) * (w-35) );
			for(var y=0;y<h;y+=5){
				var p = checkPixel(x,y);
				if(p){
					p[0] = p[1];
					p[1] = 1;
					points.push(p);
				}
			}
		}
		if(params.axis == "Y"){
			var y = Math.round( ((params.axis_value + 10) / 20) * h );
			for(var x=0;x<w;x+=5) {
				var p = checkPixel(x,y);
				if(p){
					p[1] = 1;
					points.push(p);
				}
			}
		}

		

		// for(var y=0;y<h;y++){
		// 	for(var x=0;x<w;x++){
		// 		var index = Math.round((x + w * (h - y)) * 4);
		// 		var r = data[index];
		// 		var g = data[index+1];
		// 		var b = data[index+2];
		// 		var avg = (r+g+b)/3;
		// 		if(avg == 0) {
		// 			var p = [x,y];
		// 			//Convert back to grid coordinates 
		// 			p[0] = (p[0] / w) * ratio * 20 - 10;
		// 			p[1] = (p[1] / h) * 20 - 10;
		// 			points.push(p)
		// 		}
		// 	}
		// }

		// Split into lines 
		var dist_to_split = 1;
		var new_points = []
		new_points.push(points[0]);
		var last_point = points[0];
		for(var i=1;i<points.length;i++){
			var curr_p = points[i];
			if(Math.abs(curr_p[0] - last_point[0]) > dist_to_split){
				new_points.push(last_point);
				last_point = curr_p;
				new_points.push(curr_p);
			} else {
				if(i == points.length-1) new_points.push(curr_p)
				last_point = curr_p;
			}
		}
		points = new_points;

		this.rightView.array({
			channels:2,
			items:2,
			width:points.length/2,
			live:false,
			data:points,
			id:'intersection_data'
		})
		.vector({
			color:this.gui.colors.data,
			points:"#intersection_data",
			id:'intersection_plot',
			width:10,
			start:false
		})
	}

	Mode2D.prototype.CreateViewAxis = function(axisNum,pos,labelName){
		this.rightView.axis({
		    axis: axisNum,
		    width: 4,
		    color:'black',
		    id:'viewing_1d_axis',
		  })

		this.rightView.array({
	      data: [pos],
	      channels: 2, // necessary
	      live: false,
	    }).text({
	      data: [labelName],
	    }).label({
	      color: 0x000000,
	      id:'viewing_1d_axis_label',
	    });

	}

	Mode2D.prototype.CreateViewLine = function(){
		//The line on the left to show you what it's intersecting 
		var params = this.gui.params
		var thickness = this.thicknessValuesTable[params.thickness]
		this.leftView.interval({
			expr: function(emit,x,i,t){
				if(params.axis == "Y")
					emit(x,params.axis_value);
				else
					emit(params.axis_value,x);
			},
			width:2,
			channels:2,
			id:"viewing_axis"
		}).line({
			width:5 + 5 * thickness,
			color:this.gui.colors.viewing,
			id:"viewing_axis_line"
		})
	}

	// define a function to be called when each param is updated
	function updateParametricCallback(self,val){
		self.cleanupParametric();
		self.initParametric()
	}

	Mode2D.prototype.callbacks = {
		'axis': function(self,val){
			self.rightView.remove("#viewing_1d_axis")
	    	self.rightView.remove("#viewing_1d_axis_label")
			if(val == "Y") self.CreateViewAxis(1,[11,1],"x")
			if(val == "X") self.CreateViewAxis(1,[11,1],"y")
		},
		'thickness': function(self,val){
			// need to change the line's property when thickness changes
			self.leftView.select("#viewing_axis_line").set("width",5+5*self.thicknessValuesTable[self.gui.params.thickness])
		},
		'source': function(self,val){
			self.setMode();
			self.gui.params.render_shape = true; //Reset this back to true
		}, 
		'resolution': function(self,val){
			self.cleanupCartesian();
			self.initCartesian();
		},
		'fill': function(self,val){
			self.cleanupCartesian();
			self.initCartesian();
		},
		'equation': function(self,val){
			self.cleanupCartesian();
			self.initCartesian();
		},
		'points': function(self,val){
			self.updateConvexHull()
		},
		'axis_value': function(self,val){
			self.CalculateIntersection();
			// if(self.readback == null) return;
			// var data = self.readback.get('data');
			// var w = self.readback.get('width');
			// var h = self.readback.get('height');

			// // Check if there is at least one hit on this the horizontal axis 
			// var hit = false; 
			// var y = Math.round( ((val + 10) / 20) * h );
			// for(var x=0;x<w;x++){
			// 	var index = Math.round((x + w * (h - y)) * 4);
			// 	var r = data[index];
			// 	var g = data[index+1];
			// 	var b = data[index+2];
			// 	var avg = (r+g+b)/3;
			// 	//console.log("Alpha: " + String(alpha) + " at pixel (" + String(x) + "," + String(y) + ")")
			// 	if(avg == 0){ // 0 is black, so there is something there
			// 		hit = true;
			// 		console.log("HIT! at (" + String(x) + "," + String(y) + ")")
			// 		break;
			// 	}
			// }

			// // Create canvas and draw the thing 
			// var canvas  = document.querySelector("#debug_canvas")
			// var ctx = canvas.getContext('2d');
			// canvas.width = w
			// canvas.height = h
			// canvas.style.width = w + "px"; 
			// canvas.style.height = h + "px";
			// var id = ctx.getImageData(0, 0, 1, 1);

			// for(var x=0;x<w;x+=5){
			// 	for(y=0;y<h;y+=5){
			// 		var index = Math.round((x + w * (h - y)) * 4);
			// 		var r = data[index];
			// 		var g = data[index+1];
			// 		var b = data[index+2];
			// 		var a = data[index+3];
			// 		id.data[0] = r;
			// 		id.data[1] = g;
			// 		id.data[2] = b;
			// 		id.data[3] = a;
			// 		ctx.putImageData(id,x,y);
			// 	}
			// }			

			// for(var y=0;y<h;y++){
			// 	id.data[0] = 0;
			// 	id.data[1] = 0;
			// 	id.data[2] = 0;
			// 	id.data[3] = 255;
			// 	ctx.putImageData(id,w-35,y);
			// }

		},
		'param_eq_x': updateParametricCallback, 
		'param_eq_y': updateParametricCallback, 
		'param_a': updateParametricCallback, 
		'param_b': updateParametricCallback, 
		'render_shape': function(self,val){
			// Toggle opacity 
			if(self.geometry_id == "") return;
			// If it's cartesian, there might be more objects 
			if(self.numCartesianObjects != 0){
				for(var i=0;i<self.numCartesianObjects;i++){
					var flipped_opacity = self.leftView.select('#'+self.geometry_id + String(i)).get("opacity") == 1 ? 0 : 1 ;
					self.leftView.select('#'+self.geometry_id+ String(i)).set("opacity",flipped_opacity)
				}
				
			} else {
				var flipped_opacity = self.leftView.select('#'+self.geometry_id).get("opacity") == 1 ? 0 : 1 ;
				self.leftView.select('#'+self.geometry_id).set("opacity",flipped_opacity)
			}
			
		}
	};

	Mode2D.prototype.setMode = function(){
		var params = this.gui.params
		//Switch the mode based on the gui value 
		if(this.current_mode != null){
			//Clean up previous 
			if(this.current_mode == "cartesian") this.cleanupCartesian();
			if(this.current_mode == "parametric") this.cleanupParametric();
			if(this.current_mode == "convex-hull") this.cleanupConvexHull();
		}
		this.current_mode = params.source;
		//Init new 
		if(this.current_mode == "cartesian") this.initCartesian();
		if(this.current_mode == "parametric") this.initParametric();
		if(this.current_mode == "convex-hull") this.initConvexHull();

	}

	// >>>>>>>>>> Cartesian mode functions 
	Mode2D.prototype.initCartesian = function(){
		this.polygonizeCartesian();
		if(this.objectArray == null) return; //Failed to parse 
		var params = this.gui.params
		if(params.fill==false){
			// Create the edge data 
			for(var i=0;i<this.objectArray.length;i++){
				var edgeArray = this.objectArray[i];
				this.leftView.array({
					width: edgeArray.length/2,
					items: 2,
					channels: 2,
					data: edgeArray,
					live:false,
					id: "cartesian_edge_data" + String(i)
				});
				// Draw the geometry
				this.leftView.vector({
					points: "#cartesian_edge_data" + String(i),
					color: this.gui.colors.data,
					width: 10,
					start: false,
					opacity:1,
					id: "cartesian_geometry" + String(i)
				});
			}
			this.numCartesianObjects = this.objectArray.length;
			// Save to pixels 
			var objectArray = this.objectArray;
			this.readback =  this.convertToPixels(function(v){
				for(var i=0;i<objectArray.length;i++){
					var edgeArray = objectArray[i];
					v = v.vector({
						points: "#cartesian_edge_data" + String(i),
						color: '#000000',
						width: 5,
						start: false,
						id: "cartesian_pixel_geometry" + String(i)
					});
				}
				return v; 
			},"indexbuffer")
			
		} else {
			// To draw filled in, put all the edges into one big edge array!
			var edgeArray = [];
			for(var i=0;i<this.objectArray.length;i++){
				for(var j=0;j<this.objectArray[i].length;j++) edgeArray.push(this.objectArray[i][j])
			}

			this.leftView.array({
				items:edgeArray.length,
				width: 1,
				channels:2,
				expr: function(emit,i){
					for(var j=0;j<edgeArray.length;j++) emit(edgeArray[j][0],edgeArray[j][1])
				},
				live:false,
				id:'cartesian_edge_data'
			})

			this.leftView.face({
				color:this.gui.colors.data,
				points:'#cartesian_edge_data',
				opacity:1,
				id:'cartesian_geometry'
			})

			this.readback =  this.convertToPixels(function(v){
				return v.face({
					color:'#000000',
					points:'#cartesian_edge_data',
					id:'cartesian_pixel_geometry'
				})
			},"indexbuffer")

			this.numCartesianObjects = 0;
		}


		this.geometry_id = "cartesian_geometry"
	}
	
	Mode2D.prototype.polygonizeCartesian = function(){
		var params = this.gui.params

		var equation_string = this.gui.params.equation;
		var equations = equation_string.split(",");
		var equationFuncArray = [];
		for(var i=0;i<equations.length;i++){
			let sides = equations[i].split('=');
			let LHS = sides[0];
			let RHS = sides[1];
			let LHSfunc = Parser.parse(LHS).toJSFunction(['x','y']);
			let RHSfunc = Parser.parse(RHS).toJSFunction(['x','y']);
			equationFuncArray.push(function(x,y) { return LHSfunc(x,y) - RHSfunc(x,y); });
		}
		

		//Parses the equation, and polygonizes it 
		try {
			this.objectArray = [];
			for(var i=0;i<equationFuncArray.length;i++){
				var edgeArray = Polygonize.generate(equationFuncArray[i], [[-10, 10], [-10, 10]], params.resolution);
				this.objectArray.push(edgeArray);
			}
		
			

		} catch(err){
			console.log("Error rendering equation",err);
			this.objectArray = null;
		}
	}
	Mode2D.prototype.cleanupCartesian = function(){
		if(this.numCartesianObjects != 0){
			for(var i=0;i<this.numCartesianObjects;i++){
				this.leftView.remove("#cartesian_edge_data" + String(i));
				this.leftView.remove("#cartesian_geometry" + String(i));
				this.leftView.remove("#cartesian_pixel_geometry" + String(i));
			}
		} else {
			this.leftView.remove("#cartesian_edge_data" );
			this.leftView.remove("#cartesian_geometry" );
			this.leftView.remove("#cartesian_pixel_geometry" );
		}
		
		this.leftView.remove("#indexbuffer");
		this.geometry_id = ""
		this.numCartesianObjects = 0;
	}
	

	// >>>>>>>>>>> Parametric mode functions
	Mode2D.prototype.initParametric = function(){
		var a_range = [0,1];
		var b_range = [0,1];
		var params = this.gui.params
		// get range from string 
		var splitArrayA = params.param_a.split("<"); // should return 3 pieces. We want the first and last 
		a_range[0] = Parser.evaluate(splitArrayA[0]);
		a_range[1] = Parser.evaluate(splitArrayA[2]);
		var splitArrayB = params.param_b.split("<");
		b_range[0] = Parser.evaluate(splitArrayB[0]);
		b_range[1] = Parser.evaluate(splitArrayB[2]);

		this.leftView.area({
			rangeX: a_range,
			rangeY: b_range,
			width: 30,
			height: 30,
			expr: function(emit, a,b,i,j){
				var x = Parser.evaluate(params.param_eq_x,{a:a,b:b});
				var y = Parser.evaluate(params.param_eq_y,{a:a,b:b});

				emit(x,y);
			},
			channels:2,
			id:'param_data',
			live:false
		})

		this.leftView.surface({
			color:this.gui.colors.data,
			id:'param_geometry',
			opacity:1
		})

		// Render to texture 
		this.readback =  this.convertToPixels(function(v){
			return v.surface({
				points:'#param_data',
				id:'param_pixel_geometry',
				color: '#000000',
	        	blending: 'no',
			})
		},"indexbuffer")
		

		this.geometry_id = "param_geometry"

		// this.leftView.line({
		// 	color:this.gui.colors.data,
		// 	width:5,
		// 	id:'param_geometry',
		// 	points:'#param_data'
		// })

	}

	Mode2D.prototype.cleanupParametric = function(){
		this.leftView.remove("#param_data");
		this.leftView.remove("#param_geometry");
		this.leftView.remove("#param_pixel_geometry");
		this.leftView.remove("#indexbuffer");
		this.geometry_id = ""
	}

	//  >>>>>>>>>>> Convex Hull mode functions
	Mode2D.prototype.initConvexHull = function(){
		this.parseConvexPoints()
		var pointsArray = this.pointsArray;

		// Set the data
		this.leftView.array({
			expr: function (emit, i, t) {
				for(var j=0;j<pointsArray.length;j++) emit(pointsArray[j][0], pointsArray[j][1]);
		    },
		    width: 1,
		    items:pointsArray.length,
		    channels: 2,
		    id:'hull_data'
		})
		// Draw the geometry 
		this.leftView.face({
			color:this.gui.colors.data,
			id:'hull_geometry',
			points:'#hull_data',
			opacity:1,
		})

		// Render to texture 
		this.readback =  this.convertToPixels(function(v){
			return v.face({
				points:'#hull_data',
				id:'hull_pixel_geometry',
				color: '#000000',
	        	blending: 'no',
			})
		},"indexbuffer")

		this.geometry_id = "hull_geometry"
	}
	Mode2D.prototype.parseConvexPoints = function(){
		var params = this.gui.params
		// Get string of points and parse it 
		// Remove whitespace 
		var points_str = params.points.replace(/\s+/g, '');
		// Split based on the pattern (digits,digits)
		var points_split = points_str.match(/\(-*[.\d]+,-*[.\d]+\)/g);
		this.pointsArray = []

		for(var i=0;i<points_split.length;i++){
			var p = points_split[i];
			// Remove parenthesis 
			p = p.replace(/[\(\)]/g,'');
			// Split by comma
			var comma_split = p.split(",") 
			var point = []
			for(var j=0;j<comma_split.length;j++) point.push(Number(comma_split[j]))
			this.pointsArray.push(point)
		}
		
	}
	Mode2D.prototype.updateConvexHull = function(){
		/*
		// Re-parse
		this.parseConvexPoints();
		var pointsArray = this.pointsArray;
		// Update the data 
		this.leftView.select("#hull_data").set("items",pointsArray.length)
		this.leftView.select("#hull_data").set("expr",function(emit,i,t){
			for(var j=0;j<pointsArray.length;j++) emit(pointsArray[j][0], pointsArray[j][1]);
		}) */
		this.cleanupConvexHull();
		this.initConvexHull();
	}
	Mode2D.prototype.cleanupConvexHull = function(){
		this.leftView.remove("#hull_data")
		this.leftView.remove("#hull_geometry")
		this.leftView.remove("#hull_pixel_geometry")
		this.leftView.remove("#indexbuffer");
		this.geometry_id = ""
	}

	Mode2D.prototype.convertToPixels = function(geom_func,id){
		//This converts some geometry to pixel data by rendering it to a texture and grabbing that data 
		var scale = 1 / 4;
		var view = this.leftView
		.rtt({
			size:   'relative',
			width:  scale,
			height: scale,
		})
		.camera({
		  position: [2, 0, 18],// I just found this experimentally, seems to make it fit the best? 
		})
		view = geom_func(view);
		view
		.end();
		// Readback RTT pixels
	    var readback =
	      this.leftView
	      .readback({
	        id: id,
	        type: 'unsignedByte',
	      });
	   return readback;
	}

	// Creates a new mathbox view
	Mode2D.prototype.createView = function(el,width){
		var mathbox = mathBox({
		  element: el,
		  size: {width:width,height:window.innerHeight-50},
	      plugins: ['core', 'controls', 'cursor', 'mathbox'],
	      controls: {
	        // Orbit controls, i.e. Euler angles, with gimbal lock
	        klass: THREE.OrbitControls,
	        // Trackball controls, i.e. Free quaternion rotation
	        //klass: THREE.TrackballControls,
	      },
	    });
	    if (mathbox.fallback) throw "WebGL not supported"
	    // Set the renderer color 
		mathbox.three.renderer.setClearColor(new THREE.Color(0xFFFFFF), 1.0);
		return mathbox;
	}

	//Destroys everything created
	Mode2D.prototype.cleanup = function(){
		// Destroy mathbox overlays
		var overlays = this.document.querySelector(".mathbox-overlays");
		overlays.parentNode.removeChild(overlays);
		// Destroy the canvas element 
		var canvas = this.document.querySelector("canvas");
		canvas.parentNode.removeChild(canvas);
		// Remove the two child divs 
		this.leftChild.parentNode.removeChild(this.leftChild);
		this.rightChild.parentNode.removeChild(this.rightChild);

		// Destroy gui 
		this.gui.cleanup();
	}


	scope.Mode2D = Mode2D;
	return Mode2D;
})(typeof exports === 'undefined' ? {} : exports);