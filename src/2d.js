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

		this.leftView = null;
		this.leftCamera = null;
		this.leftRenderer = null;

		this.rightView = null;
		this.rightCamera = null;
		this.rightRenderer = null;

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
		//var leftView = this.createView(leftChild,viewWidth);
		//var rightView = this.createView(rightChild,viewWidth);

		// Init gui
		gui.init("2D",this.callbacks,this);
		this.gui = gui;

		this.leftView = new THREE.Scene();
		this.leftCamera = new THREE.PerspectiveCamera( 75, viewWidth / window.innerHeight, 0.1, 1000 );
		this.leftRenderer = new THREE.WebGLRenderer();
		this.leftRenderer.setClearColor(0xffffff);
		this.leftRenderer.setSize( viewWidth, window.innerHeight );
		leftChild.appendChild( this.leftRenderer.domElement );

		var geometry = new THREE.BoxGeometry( 1, 1, 1 );
		var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
		var cube = new THREE.Mesh( geometry, material );
		this.leftView.add( cube );

		this.leftCamera.position.z = 5;

		this.rightView = new THREE.Scene();
		this.rightCamera = new THREE.PerspectiveCamera( 75, viewWidth / window.innerHeight, 0.1, 1000 );
		this.rightRenderer = new THREE.WebGLRenderer();
		this.rightRenderer.setClearColor(0xffffff);
		this.rightRenderer.setSize( viewWidth, window.innerHeight );
		rightChild.appendChild( this.rightRenderer.domElement );

		geometry = new THREE.BoxGeometry( 1, 1, 1 );
		material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
		cube = new THREE.Mesh( geometry, material );
		this.rightView.add( cube );

		this.rightCamera.position.z = 5;

		this.animate();
		// Set up left view
		// var camera = leftView.camera({
		// 	proxy: true, // this alows interactive camera controls to override the position
		// 	position: [0, 0, 3],
		// })
		// leftView = leftView.cartesian({
		// 	range: [[-10, 10], [-10, 10]],
		// 	scale: [1, 1],
		// });
		// leftView
		// .axis({
		// 	axis: 1,
		// 	width: 4,
		// 	color:'black',
		// })
		// .axis({
		// 	axis: 2,
		// 	width: 4,
		// 	color:'black',
		// })
		// .grid({
		// 	width: 1,
		// 	divideX: 10,
		// 	divideY: 10
		// });
		//
		// // Add text
		// leftView.array({
		// 	data: [[11,1], [0,12]],
		// 	channels: 2, // necessary
		// 	live: false,
		// }).text({
		// 	data: ["x", "y"],
		// }).label({
		// 	color: 0x000000,
		// });
		//
		// this.leftView = leftView;
		// this.CreateViewLine();

		// // Set up right view
		// rightView = rightView.cartesian({
		// 	range: [[-10, 10],[-10,10]],
		// 	scale: [1, 1],
		// });
		// rightView.camera({
		// 	proxy: true, // this alows interactive camera controls to override the position
		// 	position: [0, 0, 3],
		// })
		// this.rightView = rightView
		//
		// this.axis_object  = this.CreateViewAxis(this.rightView,1,[11,1],"x")
		//
		// // Set up right view intersection shader
		// this.SetupIntersection();
		//
		// // Draw our main shape
		// this.setMode()
		// console.log(this.geometry_id);
		//
		// // Hide the slices at start
		// if(this.numCartesianObjects != 0){
		// 	for(var i=0;i<this.numCartesianObjects;i++){
		// 		this.rightView.select('#'+this.geometry_id+ String(i)).set("opacity",0)
		// 	}
		// } else {
		// 	this.rightView.select('#'+this.geometry_id).set("opacity",0)
		// }

	}

	function hexToRgb(hex) {
		// from: http://stackoverflow.com/a/5624139/1278023
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16)/255,
			g: parseInt(result[2], 16)/255,
			b: parseInt(result[3], 16)/255
		} : null;
	}


	Mode2D.prototype.SetupIntersection = function(){
		var params = this.gui.params
		// Apply the intersection shader
		// Run vertex shader to get fragment positions, then fragment shader to discard pixels
		this.rightView = this.rightView.shader({
			code : [
				"#define POSITION_STPQ",
				"uniform float axis_value;",
				"uniform float axis;",
				"void getPosition(inout vec4 xyzw, inout vec4 stpq) {",
				"if(axis == 1.0) xyzw.y -= axis_value - 1.0;",
				"if(axis == 0.0) xyzw.x -= axis_value - 1.0;",
				"stpq = xyzw;",
				"}"
			].join("\n")
		}, {
			axis_value: function(){ return params.axis_value },
			axis: function(){
				if( params.axis == "X") return 0;
				if( params.axis == "Y") return 1;
			}
		}).vertex({pass: 'data'})

		var rgb_color = hexToRgb(this.gui.colors.data)
		// Make it a little darker
		var factor = 0.8;
		rgb_color.r *= factor;
		rgb_color.g *= factor;
		rgb_color.b *= factor;

		this.rightView = this.rightView.shader({
			code: [
				"#define POSITION_STPQ",
				"uniform float axis_value;",
				"uniform float axis;",
				"vec4 getColor(vec4 xyzw, inout vec4 stpq) {",
				"if(axis == 1.0 && abs(stpq.y - 1.0) > 0.1) discard;", // Y axis
				"if(axis == 0.0 && abs(stpq.x - 1.0) > 0.1) discard;", // X axis
				"return vec4("+rgb_color.r+","+rgb_color.g+","+rgb_color.b+",1.0);",
				"}"
			].join("\n")
		}, {
			axis_value: function(){ return params.axis_value },
			axis: function(){
				if( params.axis == "X") return 0;
				if( params.axis == "Y") return 1;
			}
		})
		.fragment()

	}

	Mode2D.prototype.CreateViewAxis = function(view,axisNum,pos,labelName){
		view.axis({
			axis: axisNum,
			width: 4,
			color:'black',
			id:'viewing_1d_axis',
		})

		view.array({
			data: [pos],
			channels: 2, // necessary
			live: false,
			id:"viewing_1d_axis_pos"
		}).text({
			data: [labelName],
			id:"viewing_1d_axis_text"
		}).label({
			color: 0x000000,
			id:'viewing_1d_axis_label',
		});

		return view;
	}

	Mode2D.prototype.CreateViewLine = function(){
		//The line on the left to show you what it's intersecting
		var params = this.gui.params
		var thickness = this.thicknessValuesTable[params.thickness]
		this.leftView.interval({
			expr: function(emit,x,i,t){
				if(!this.gui.params.render_slices) return;
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
		self.initParametric(self.leftView);
		self.initParametric(self.rightView);
	}

	function updateRenderShape(self,val,opacity_val){
		if(opacity_val === undefined){
			opacity_val = val ? 1 : 0;
		}
		// Toggle opacity
		if(self.geometry_id == "") return;
		// If it's cartesian, there might be more objects
		if(self.numCartesianObjects != 0){
			for(var i=0;i<self.numCartesianObjects;i++){
				var flipped_opacity = self.leftView.select('#'+self.geometry_id + String(i)).get("opacity") == 1 ? 0 : 1 ;
				if(opacity_val != undefined) flipped_opacity = opacity_val; // opacity_val can override the toggle
				self.leftView.select('#'+self.geometry_id+ String(i)).set("opacity",flipped_opacity)
			}

		} else {
			var flipped_opacity = self.leftView.select('#'+self.geometry_id).get("opacity") == 1 ? 0 : 1 ;
			if(opacity_val != undefined) flipped_opacity = opacity_val; // opacity_val can override the toggle
			self.leftView.select('#'+self.geometry_id).set("opacity",flipped_opacity)
		}
	}

	function updateRenderSlices(self,val,opacity_val){
		if(opacity_val === undefined){
			opacity_val = val ? 1 : 0;
		}
		// Toggle opacity
		if(self.geometry_id == "") return;
		// If it's cartesian, there might be more objects
		if(self.numCartesianObjects != 0){
			for(var i=0;i<self.numCartesianObjects;i++){
				var flipped_opacity = self.rightView.select('#'+self.geometry_id + String(i)).get("opacity") == 1 ? 0 : 1 ;
				if(opacity_val != undefined) flipped_opacity = opacity_val; // opacity_val can override the toggle
				self.rightView.select('#'+self.geometry_id+ String(i)).set("opacity",flipped_opacity)
			}

		} else {
			var flipped_opacity = self.rightView.select('#'+self.geometry_id).get("opacity") == 1 ? 0 : 1 ;
			if(opacity_val != undefined) flipped_opacity = opacity_val; // opacity_val can override the toggle
			self.rightView.select('#'+self.geometry_id).set("opacity",flipped_opacity)
		}
	}

	Mode2D.prototype.callbacks = {
		'axis': function(self,val){
			if(val == "X"){
				self.axis_object.select("#viewing_1d_axis").set("axis",2);
				self.axis_object.select("#viewing_1d_axis_pos").set("data",[1,12]);
				self.axis_object.select("#viewing_1d_axis_text").set("data",["y"]);
			}
			if(val == "Y"){
				self.axis_object.select("#viewing_1d_axis").set("axis",1);
				self.axis_object.select("#viewing_1d_axis_pos").set("data",[11,1]);
				self.axis_object.select("#viewing_1d_axis_text").set("data",["x"]);
			}

			// self.axis_object.remove("#viewing_1d_axis")
			//   	self.axis_object.remove("#viewing_1d_axis_label")
			// if(val == "Y") self.axis_object = self.CreateViewAxis(self.rightView,1,[11,1],"x")
			// if(val == "X") self.axis_object = self.CreateViewAxis(self.rightView,2,[1,12],"y")
		},
		'thickness': function(self,val){
			// need to change the line's property when thickness changes
			self.leftView.select("#viewing_axis_line").set("width",5+5*self.thicknessValuesTable[self.gui.params.thickness])
		},
		'source': function(self,val){
			self.setMode();
			self.gui.params.render_shape = true; //Reset this back to true
			self.gui.params.render_slices = false; //Reset this back to true
			updateRenderShape(self,val,1);
			updateRenderSlices(self,val,0);

			// if(self.numCartesianObjects != 0){
			// 	for(var i=0;i<self.numCartesianObjects;i++){
			// 		self.rightView.select('#'+self.geometry_id+ String(i)).set("opacity",0)
			// 	}
			// } else {
			// 	self.rightView.select('#'+self.geometry_id).set("opacity",0)
			// }


		},
		'resolution': function(self,val){
			self.cleanupCartesian();
			self.initCartesian(self.leftView);
			self.initCartesian(self.rightView);
		},
		'fill': function(self,val){
			self.cleanupCartesian();

			// console.log(" == LEFT == ");
			// self.leftView.print();f
			// console.log(" == RIGHT == ");
			// self.rightView.print();

			self.initCartesian(self.leftView);
			self.initCartesian(self.rightView);
		},
		'equation': function(self,val){
			self.cleanupCartesian();
			self.initCartesian(self.leftView);
			self.initCartesian(self.rightView);
		},
		'points': function(self,val){
			self.updateConvexHull()
		},
		'axis_value': function(self,val){


		},
		'param_eq_x': updateParametricCallback,
		'param_eq_y': updateParametricCallback,
		'param_a': updateParametricCallback,
		'param_b': updateParametricCallback,
		'render_shape': function(self,val){
			updateRenderShape(self,val);

		},
		'render_slices': function(self,val){
			updateRenderSlices(self,val);

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
		if(this.current_mode == "cartesian") {
			this.initCartesian(this.leftView);
			this.initCartesian(this.rightView);
		}
		if(this.current_mode == "parametric") {
			this.initParametric(this.leftView);
			this.initParametric(this.rightView);
		}
		if(this.current_mode == "convex-hull") {
			this.initConvexHull(this.leftView);
			this.initConvexHull(this.rightView);
		}

	}

	// >>>>>>>>>> Cartesian mode functions
	Mode2D.prototype.initCartesian = function(view){
		this.polygonizeCartesian();
		if(this.objectArray == null) return; //Failed to parse
		var params = this.gui.params

		// To draw filled in, put all the edges into one big edge array!
		var edgeArray = [];
		for(var i=0;i<this.objectArray.length;i++){
			for(var j=0;j<this.objectArray[i].length;j++) edgeArray.push(this.objectArray[i][j])
		}

		view.array({
			items:edgeArray.length,
			width: 1,
			channels:2,
			expr: function(emit,i){
				for(var j=0;j<edgeArray.length;j++) emit(edgeArray[j][0],edgeArray[j][1])
			},
			live:false,
			id:'cartesian_edge_data'
		})

		view.face({
			color:this.gui.colors.data,
			points:'#cartesian_edge_data',
			opacity:1,
			id:'cartesian_geometry'
		})

		this.numCartesianObjects = 0;

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
	Mode2D.prototype.cleanupCartesian = function(view){
		if(this.numCartesianObjects != 0){
			for(var i=0;i<this.numCartesianObjects;i++){
				this.leftView.remove("#cartesian_edge_data" + String(i)); this.rightView.remove("#cartesian_edge_data" + String(i));
				this.leftView.remove("#cartesian_geometry" + String(i)); this.rightView.remove("#cartesian_geometry" + String(i));
				this.leftView.remove("#cartesian_pixel_geometry" + String(i)); this.rightView.remove("#cartesian_pixel_geometry" + String(i));
			}
		} else {
			this.leftView.remove("#cartesian_edge_data" );
			this.leftView.remove("#cartesian_geometry" );
			this.leftView.remove("#cartesian_pixel_geometry" );
			this.rightView.remove("#cartesian_edge_data" );
			this.rightView.remove("#cartesian_geometry" );
			this.rightView.remove("#cartesian_pixel_geometry" );
		}

		this.leftView.remove("#indexbuffer");
		this.rightView.remove("#indexbuffer");
		this.geometry_id = ""
		this.numCartesianObjects = 0;


	}


	// >>>>>>>>>>> Parametric mode functions
	Mode2D.prototype.initParametric = function(view){
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

		var draw_filled = true;

		// If we don't find BOTH a and b as variables, then draw it as a line
		var tokens = Parser.parse(params.param_eq_x).tokens;
		var found_a = false;
		var found_b = false;
		for(var i=0;i<tokens.length;i++){
			if(tokens[i].toString() == "a") found_a = true;
			if(tokens[i].toString() == "b") found_b = true;
		}
		if(!found_a || !found_b) draw_filled = false;
		tokens = Parser.parse(params.param_eq_y).tokens;
		for(var i=0;i<tokens.length;i++){
			if(tokens[i].toString() == "a") found_a = true;
			if(tokens[i].toString() == "b") found_b = true;
		}
		if(!found_a || !found_b) draw_filled = false;

		view.area({
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


		if(draw_filled){
			view.surface({
				color:this.gui.colors.data,
				id:'param_geometry',
				opacity:1
			})
		} else {
			// This is ideal, except when you have only b instead of only a, you see nothing
			// I think that's because of the order the points are in. If they're not orderered right the line won't be drawn right
			// view.line({
			// 	color:this.gui.colors.data,
			// 	width:5,
			// 	id:"param_geometry",
			// 	opacity:1
			// })
			view.point({
				color:this.gui.colors.data,
				size:5,
				id:"param_geometry",
				opacity:1
			})
		}


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

		this.rightView.remove("#param_data");
		this.rightView.remove("#param_geometry");
		this.rightView.remove("#param_pixel_geometry");

		this.geometry_id = ""
	}

	//  >>>>>>>>>>> Convex Hull mode functions
	Mode2D.prototype.initConvexHull = function(view){
		this.parseConvexPoints()
		var pointsArray = this.pointsArray;

		// Set the data
		view.array({
			expr: function (emit, i, t) {
				for(var j=0;j<pointsArray.length;j++) emit(pointsArray[j][0], pointsArray[j][1]);
			},
			width: 1,
			items:pointsArray.length,
			channels: 2,
			id:'hull_data'
		})
		// Draw the geometry
		view.face({
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
	this.initConvexHull(this.leftView);
	this.initConvexHull(this.rightView);
}
Mode2D.prototype.cleanupConvexHull = function(){
	this.leftView.remove("#hull_data")
	this.leftView.remove("#hull_geometry")
	this.leftView.remove("#hull_pixel_geometry")

	this.rightView.remove("#hull_data")
	this.rightView.remove("#hull_geometry")
	this.rightView.remove("#hull_pixel_geometry")

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
// Mode2D.prototype.createView = function(el,width){
// 	var mathbox = mathBox({
// 		element: el,
// 		size: {width:width,height:window.innerHeight-50},
// 		plugins: ['core', 'controls', 'cursor', 'mathbox'],
// 		controls: {
// 			// Orbit controls, i.e. Euler angles, with gimbal lock
// 			klass: THREE.OrbitControls,
// 			// Trackball controls, i.e. Free quaternion rotation
// 			//klass: THREE.TrackballControls,
// 			parameters: {
// 		      noKeys: true // Disable arrow keys to move the view
// 		    }
// 		}
// 	});
// 	if (mathbox.fallback) throw "WebGL not supported"
// 	// Set the renderer color
// 	mathbox.three.renderer.setClearColor(new THREE.Color(0xFFFFFF), 1.0);
// 	return mathbox;
// }
//
// //Destroys everything created
// Mode2D.prototype.cleanup = function(){
// 	// Destroy mathbox overlays
// 	var overlays = this.document.querySelector(".mathbox-overlays");
// 	overlays.parentNode.removeChild(overlays);
// 	// Destroy the canvas element
// 	var canvas = this.document.querySelector("canvas");
// 	canvas.parentNode.removeChild(canvas);
// 	// Remove the two child divs
// 	this.leftChild.parentNode.removeChild(this.leftChild);
// 	this.rightChild.parentNode.removeChild(this.rightChild);
//
// 	// Destroy gui
// 	this.gui.cleanup();
// }

Mode2D.prototype.animate = function(){
	requestAnimationFrame( this.animate.bind(this) );
	this.leftRenderer.render( this.leftView, this.leftCamera );
	this.rightRenderer.render( this.rightView, this.rightCamera );
}

scope.Mode2D = Mode2D;
return Mode2D;
})(typeof exports === 'undefined' ? {} : exports);
