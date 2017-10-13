/*
All logic to running 2D mode resides here. This file merely orchestrates various functions.
The actual algorithms live in Slicing.js and Projecting.js.
*/

var Mode2D = (function (scope) {
	//Constructor
	function Mode2D(document){
		this.document = document;

		this.animId = null;
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
		this.leftControls = null;
		this.leftMesh = null;

		this.rightView = null;
		this.rightCamera = null;
		this.rightRenderer = null;
		this.rightControls = null;

	}

	// Creates the scene and everything
	Mode2D.prototype.init = function(div,gui){
		var leftCanvas = document.getElementById("left-view").getElementsByTagName("canvas")[0];
		var rightCanvas = document.getElementById("right-view").getElementsByTagName("canvas")[0];

		var viewWidth = (window.innerWidth-50)/2;

		// Init gui
		gui.init("2D",this.callbacks,this);
		this.gui = gui;

		this.leftView = new THREE.Scene();
		this.leftCamera = new THREE.PerspectiveCamera( 75, viewWidth / window.innerHeight, 0.1, 1000 );
		this.leftCamera.position.set(0,0,20);
		this.leftRenderer = new THREE.WebGLRenderer({ canvas: leftCanvas, antialias: true });
		this.leftRenderer.setClearColor(0xffffff);
		this.leftRenderer.setSize( viewWidth, window.innerHeight );

		this.leftControls = new THREE.OrbitControls( this.leftCamera, this.leftRenderer.domElement );
		this.leftControls.enableRotate = false;
		this.leftControls.enableKeys = false;

		var GridHelper = new Grid();
		var grid = GridHelper.CreateGrid("XY");
		this.leftView.add(grid);

		var axis = GridHelper.CreateAxis("X");
		this.leftView.add(axis);
		axis = GridHelper.CreateAxis("Y");
		this.leftView.add(axis);

		var leftXLabel = GridHelper.CreateLabel("X",11,-0.25,0);
		this.leftView.add(leftXLabel);
		var leftYLabel = GridHelper.CreateLabel("Y",-0.25,11,0);
		this.leftView.add(leftYLabel);

		this.rightView = new THREE.Scene();
		this.rightCamera = new THREE.PerspectiveCamera( 75, viewWidth / window.innerHeight, 0.1, 1000 );
		this.rightCamera.position.set(0,0,20);
		this.rightRenderer = new THREE.WebGLRenderer({ canvas: rightCanvas, antialias: true });
		this.rightRenderer.setClearColor(0xffffff);
		this.rightRenderer.setSize( viewWidth, window.innerHeight );

		this.rightControls = new THREE.OrbitControls( this.rightCamera, this.rightRenderer.domElement );
		this.rightControls.enableRotate = false;
		this.rightControls.enableKeys = false;

		this.setRightAxis("X");

		this.util = new Util();
		this.projector = new Projecting();
		this.slicer = new Slicing();

		// Create intersection line
		var axisY = this.gui.params.axis_value;
		this.intersectionLine = this.util.Line({x:-10,y:axisY,z:0.2},{x:10,y:axisY,z:0.2},this.gui.colors.slices,0.15)
		this.leftView.add(this.intersectionLine);

		this.animate();

		// Draw our main shape
		this.setMode();

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

		/// I'm hijacking this to toggle the visibility of the rest of the shape on the slices
		self.uniforms.renderWholeShape.value = Number(val);

	}

	function updateRenderSlices(self,val,opacity_val){
		if(opacity_val === undefined){
			opacity_val = val ? 1 : 0;
		}
		// TODO: Toggle slices visibility
	}

	Mode2D.prototype.callbacks = {
		'axis': function(self,val){
			if(val == "X"){
				self.uniforms.axis.value = 0;
				self.intersectionLine.rotation.z = Math.PI / 2;
				self.intersectionLine.position.y = 0;
			}
			if(val == "Y"){
				self.uniforms.axis.value = 1;
				self.intersectionLine.rotation.z = 0;
				self.intersectionLine.position.x = 0;
			}
			self.setRightAxis.call(self,val == "X" ? "Y" : "X");
			// Rotate the intersection line


		},
		'thickness': function(self,val){
			// TODO: Adjust slicing line thickness
		},
		'source': function(self,val){
			self.setMode();
			self.gui.params.render_shape = true; //Reset this back to true
			self.gui.params.render_slices = false; //Reset this back to true
			updateRenderShape(self,val,1);
			updateRenderSlices(self,val,0);

		},
		'resolution': function(self,val){
			self.cleanupLeftMesh();
			self.initCartesian(self.leftView);
		},
		'fill': function(self,val){
			self.cleanupLeftMesh();
			self.initCartesian(self.leftView);
		},
		'equation': function(self,val){
			self.cleanupLeftMesh();
			self.initCartesian(self.leftView);
		},
		'points': function(self,val){
			self.updateConvexHull()
		},
		'axis_value': function(self,val){

			if(self.gui.params.axis == 'Y'){
				self.uniforms.axisValue.value.y = val;
				self.intersectionLine.position.y = val;
				if(self.current_mode == "convex-hull"){
					self.rightMesh.position.y = -val;
				}
			}
			if(self.gui.params.axis == 'X'){
				self.uniforms.axisValue.value.x = val;
				self.intersectionLine.position.x = val;
				if(self.current_mode == "convex-hull"){
					self.rightMesh.position.x = -val;
				}
			}



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

	Mode2D.prototype.setRightAxis = function(type){
		// first delete the axis if it exists
		if(this.rightAxis){
			this.rightView.remove(this.rightAxis);
			this.rightView.remove(this.rightLabel);
		}
		var GridHelper = new Grid();
		this.rightAxis = GridHelper.CreateAxis(type);
		// Offset the axes a bit
		if(type == "X")
			this.rightAxis.position.y -= 0.5;
		if(type == "Y")
			this.rightAxis.position.x -= 0.5;
		this.rightView.add(this.rightAxis);

		var LabelPositions = {'X':{x:11,y:-0.75,z:0},'Y':{x:-0.75,y:11,z:0}}
		var p = LabelPositions[type];
		this.rightLabel = GridHelper.CreateLabel(type,p.x,p.y,p.z);
		this.rightView.add(this.rightLabel);
	}

	Mode2D.prototype.setMode = function(){
		var params = this.gui.params
		//Switch the mode based on the gui value
		if(this.current_mode != null){
			//Clean up previous
			this.cleanupLeftMesh();
		}
		this.current_mode = params.source;
		//Init new
		if(this.current_mode == "cartesian") {
			this.initCartesian(this.leftView);
		}
		if(this.current_mode == "parametric") {
			this.initParametric(this.leftView);
			this.initParametric(this.rightView);
		}
		if(this.current_mode == "convex-hull") {
			this.initConvexHull(this.leftView);
		}

	}

	// >>>>>>>>>> Cartesian mode functions


	Mode2D.prototype.initCartesian = function(view){
		var params = this.gui.params
		var equation = this.gui.params.equation;
		
		var output = this.util.ConstructGLSLFunction(equation);
		var glslFuncString = output[0];
		var operator = output[1];

		var renderWholeShape = Number(this.gui.params.render_shape);
		var projectingColor = this.util.HexToRgb(this.gui.colors.projections);
		var slicingColor = this.util.HexToRgb(this.gui.colors.slices);

		var defaultUniforms = {
			axis: { type: "f", value: 0 } ,
			axisValue: { type: "v2", value: new THREE.Vector2( 0, 0 ) },
			slice: {type: "f", value: 0},
			renderWholeShape: {type:"f", value:renderWholeShape }
		};
		this.leftMesh = this.projector.CartesianShaderMesh2D(glslFuncString,operator,defaultUniforms,projectingColor);
		this.leftMesh.position.z = 0.1;
		this.leftView.add(this.leftMesh);

		var axis = this.gui.params.axis;
		var axisValue = new THREE.Vector2(this.gui.params.axis_value,this.gui.params.axis_value);

		this.uniforms = {
			axis: { type: "f", value: axis == "Y" ? 1 : 0 } ,
			axisValue: { type: "v2", value: axisValue},
			slice: {type: "f", value: 1},
			renderWholeShape: {type:"f", value:renderWholeShape }
		};
		this.rightMesh = this.projector.CartesianShaderMesh2D(glslFuncString,operator,this.uniforms,slicingColor);
		this.rightMesh.position.z = 0.1;
		this.rightView.add(this.rightMesh);
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

		// TODO: Render parametric equation
	}

	//  >>>>>>>>>>> Convex Hull mode functions
	Mode2D.prototype.initConvexHull = function(view){
		var pointsRaw = this.util.ParseConvexPoints(this.gui.params.points);

		// Convert the points into Vector2 objects:
		var points = [];
		for(var i=0;i<pointsRaw.length;i++){
			var rawPoint = pointsRaw[i];
			var newPoint = new THREE.Vector2(rawPoint.x,rawPoint.y);
			points.push(newPoint);
		}

		if(points.length < 4){
			return;
		}

		var projectingColor = this.gui.colors.projections;

		this.leftMesh = this.projector.ConvexHullMesh2D(points,projectingColor);
		this.leftMesh.position.z = 0.1;
		this.leftView.add(this.leftMesh);

		var slicingColor = this.util.HexToRgb(this.gui.colors.slices);
		var axis = this.gui.params.axis;
		var axisValue = new THREE.Vector2(this.gui.params.axis_value,this.gui.params.axis_value);
		var renderWholeShape = Number(this.gui.params.render_shape);
		this.uniforms = {
			axis: { type: "f", value: axis == "Y" ? 1 : 0 } ,
			axisValue: { type: "v2", value: axisValue},
			slice: {type: "f", value: 1},
			renderWholeShape: {type:"f", value:renderWholeShape }
		};
		this.rightMesh = this.slicer.Slice2DMesh(this.leftMesh,this.uniforms,slicingColor);
		this.rightMesh.position.z = 0.2;
		this.rightView.add(this.rightMesh);
	}

	Mode2D.prototype.updateConvexHull = function(){
		this.cleanupLeftMesh();
		this.initConvexHull(this.leftView);
	}

	//  >>>>>>>>>>> Destroy the shared leftMesh mesh.
	Mode2D.prototype.cleanupLeftMesh = function(){
		console.log("CLEANING UP");
		if(this.leftMesh){
			this.leftView.remove(this.leftMesh);
			this.leftMesh = null;
		}
		if(this.rightMesh){
			this.rightView.remove(this.rightMesh);
			this.rightMesh = null;
		}
	}

//Destroys everything created
Mode2D.prototype.cleanup = function(){
	cancelAnimationFrame(this.animId); // stop the animation loop

	this.util.CleanUpScene(this.leftView);

	this.intersectionLine = null;
	this.leftView = null;
	this.leftRenderer.dispose();
	this.leftRenderer = null;
	this.leftCamera = null;
	this.leftControls = null;
	this.leftMesh = null;

	this.util.CleanUpScene(this.rightView);

	this.rightView = null;
	this.rightRenderer.dispose();
	this.rightRenderer = null;
	this.rightCamera = null;
	this.rightControls = null;

	// Destroy gui
	this.gui.cleanup();
}

Mode2D.prototype.handleEvent = function(event) {
	if(event.type == 'resize') {
		this.util.ResizeScenes(this);
	}
}

Mode2D.prototype.animate = function(){

	this.animId = requestAnimationFrame( this.animate.bind(this) );
	this.leftRenderer.render( this.leftView, this.leftCamera );
	this.rightRenderer.render( this.rightView, this.rightCamera );
}

scope.Mode2D = Mode2D;
return Mode2D;
})(typeof exports === 'undefined' ? {} : exports);
