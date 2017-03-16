// All logic & rendering of the 2D mode is contained here
// depends on Mathbox existing in the scope as well as the gui class

/* 
todo:

- Make intersection work (with samples)
- Apply same to 3D 
- Create barebones 4D
- Apply hash when clicking on any of the modes 
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
			if(val == "X") self.CreateViewAxis(2,[0,12],"y")
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
		'param_eq_x': updateParametricCallback, 
		'param_eq_y': updateParametricCallback, 
		'param_a': updateParametricCallback, 
		'param_b': updateParametricCallback, 
		'render_shape': function(self,val){
			// Toggle opacity 
			if(self.geometry_id == "") return;
			// If it's cartesian, there might be more objects 
			if(self.current_mode == "cartesian"){
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
					width: 5,
					start: false,
					opacity:1,
					id: "cartesian_geometry" + String(i)
				});
			}
			this.numCartesianObjects = this.objectArray.length;
			
		} else {
			// Filled in 
			var edgeArray = this.edgeArray

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
		for(var i=0;i<this.numCartesianObjects;i++){
			this.leftView.remove("#cartesian_edge_data" + String(i));
			this.leftView.remove("#cartesian_geometry" + String(i));
		}
		
		this.geometry_id = ""
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

		this.geometry_id = "hull_geometry"
	}
	Mode2D.prototype.parseConvexPoints = function(){
		var params = this.gui.params
		// Get string of points and parse it 
		// Remove whitespace 
		var points_str = params.points.replace(/\s+/g, '');
		// Split based on the pattern (digits,digits)
		var points_split = points_str.match(/\(-*\d+,-*\d+\)/g);
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
		// Re-parse
		this.parseConvexPoints();
		var pointsArray = this.pointsArray;
		// Update the data 
		this.leftView.select("#hull_data").set("items",pointsArray.length)
		this.leftView.select("#hull_data").set("expr",function(emit,i,t){
			for(var j=0;j<pointsArray.length;j++) emit(pointsArray[j][0], pointsArray[j][1]);
		})
	}
	Mode2D.prototype.cleanupConvexHull = function(){
		this.leftView.remove("#hull_data")
		this.leftView.remove("#hull_geometry")
		this.geometry_id = ""
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