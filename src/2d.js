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


		this.leftScene = null;
		this.leftCamera = null;
		this.leftRenderer = null;
		this.leftControls = null;
		this.leftMesh = null;
		this.leftAxes = [];

		this.rightScene = null;
		this.rightCamera = null;
		this.rightRenderer = null;
		this.rightControls = null;
		this.rightAxes = [];

		this.gridIsVisible = true;
	}

	// Creates the scene and everything
	Mode2D.prototype.init = function(div,gui){
		var leftCanvas = document.getElementById("left-view").getElementsByTagName("canvas")[0];
		var rightCanvas = document.getElementById("right-view").getElementsByTagName("canvas")[0];

		var viewWidth = (window.innerWidth-50)/2;

		// Init gui
		gui.init("2D",this.callbacks,this);
		this.gui = gui;

		this.leftScene = new THREE.Scene();
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
		this.leftScene.add(grid); this.leftAxes.push(grid);

		var axis = GridHelper.CreateAxis("X");
		this.leftScene.add(axis); this.leftAxes.push(axis);
		axis = GridHelper.CreateAxis("Y");
		this.leftScene.add(axis); this.leftAxes.push(axis);

		var leftXLabel = GridHelper.CreateLabel("X",11,-0.25,0);
		this.leftScene.add(leftXLabel); this.leftAxes.push(leftXLabel);
		var leftYLabel = GridHelper.CreateLabel("Y",-0.25,11,0);
		this.leftScene.add(leftYLabel); this.leftAxes.push(leftYLabel);

		this.rightScene = new THREE.Scene();
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
		this.leftScene.add(this.intersectionLine);

		this.animate();

		// Draw our main shape
		this.setMode();

	}

	// define a function to be called when each param is updated
	function updateParametricCallback(self,val){
		self.cleanupLeftMesh();
		self.initParametric(self.leftScene);
		//self.initParametric(self.rightScene);
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
		
		},
		'resolution': function(self,val){
			self.cleanupLeftMesh();
			self.initCartesian(self.leftScene);
		},
		'fill': function(self,val){
			self.cleanupLeftMesh();
			self.initParametric(this.leftScene);
		},
		'equation': function(self,val){
			self.cleanupLeftMesh();
			self.initCartesian(self.leftScene);
		},
		'points': function(self,val){
			self.updateConvexHull()
		},
		'axis_value': function(self,val){

			if(self.gui.params.axis == 'Y'){
				self.uniforms.axisValue.value.y = val;
				self.intersectionLine.position.y = val;
				if(self.current_mode == "convex-hull" || self.current_mode == "parametric"){
					self.rightMesh.position.y = -val;
				}
			}
			if(self.gui.params.axis == 'X'){
				self.uniforms.axisValue.value.x = val;
				self.intersectionLine.position.x = val;
				if(self.current_mode == "convex-hull" || self.current_mode == "parametric"){
					self.rightMesh.position.x = -val;
				}
			}



		},
		'param_eq_x': updateParametricCallback,
		'param_eq_y': updateParametricCallback,
		'param_a': updateParametricCallback,
		'param_b': updateParametricCallback,
		'whole_shape_slicing': function(self,val){
			self.uniforms.renderWholeShape.value = Number(val);

		},
		'show left view': function(self,val){
			self.util.SetLeftDivVisibility(val);
		},
		'show right view': function(self,val){
			self.util.SetRightDivVisibility(val);
		}
	};

	Mode2D.prototype.SetGridAndAxesVisible = function(visible){
		this.gridIsVisible = visible;
		for(var i=0;i<this.leftAxes.length;i++)
			this.leftAxes[i].visible = visible;
		for(var i=0;i<this.rightAxes.length;i++)
			this.rightAxes[i].visible = visible;
	}

	Mode2D.prototype.setRightAxis = function(type){
		// first delete the axis if it exists
		if(this.rightAxis){
			this.rightScene.remove(this.rightAxis);
			this.rightScene.remove(this.rightLabel);
		}
		var GridHelper = new Grid();
		this.rightAxis = GridHelper.CreateAxis(type);
		// Offset the axes a bit
		if(type == "X")
			this.rightAxis.position.y -= 0.5;
		if(type == "Y")
			this.rightAxis.position.x -= 0.5;
		this.rightScene.add(this.rightAxis);
		this.rightAxes = [];


		var LabelPositions = {'X':{x:11,y:-0.75,z:0},'Y':{x:-0.75,y:11,z:0}}
		var p = LabelPositions[type];
		this.rightLabel = GridHelper.CreateLabel(type,p.x,p.y,p.z);
		this.rightScene.add(this.rightLabel);

		this.rightAxes.push(this.rightAxis);
		this.rightAxes.push(this.rightLabel);

		this.SetGridAndAxesVisible(this.gridIsVisible);
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
			this.initCartesian(this.leftScene);
		}
		if(this.current_mode == "parametric") {
			this.cleanupLeftMesh();
			this.initParametric(this.leftScene);
			//this.initParametric(this.rightScene);
		}
		if(this.current_mode == "convex-hull") {
			this.initConvexHull(this.leftScene);
		}

	}

	// >>>>>>>>>> Cartesian mode functions
	Mode2D.prototype.initCartesian = function(view){
		var params = this.gui.params
		var equation = this.gui.params.equation;
		var res = 20;
		if (this.gui.params.resolution == "high") var res = 112;
		else if (this.gui.params.resolution == "medium") var res = 60;
		
		var output = this.util.ConstructGLSLFunction(equation);
		var glslFuncString = output[0];
		var operator = output[1];

		var renderWholeShape = Number(this.gui.params.whole_shape_slicing);
		var projectingColor = this.util.HexToRgb(this.gui.colors.projections);
		var slicingColor = this.util.HexToRgb(this.gui.colors.slices);

		var defaultUniforms = {
			axis: { type: "f", value: 0 } ,
			axisValue: { type: "v2", value: new THREE.Vector2( 0, 0 ) },
			slice: {type: "f", value: 0},
			renderWholeShape: {type:"f", value:renderWholeShape }
		};
		this.leftMesh = this.projector.CartesianShaderMesh2D(glslFuncString,operator,defaultUniforms,projectingColor,res);
		this.leftMesh.position.z = 0.1;
		this.leftScene.add(this.leftMesh);

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
		this.rightScene.add(this.rightMesh);
	}

	// >>>>>>>>>>> Parametric mode functions
	Mode2D.prototype.initParametric = function(view){
		// get parameters a and b
		var a_range = [0,1];
		var b_range = [0,1];

		var params = this.gui.params;
		var splitArrayA = params.param_a.split("<");
		a_range[0] = Parser.evaluate(splitArrayA[0]);
		a_range[1] = Parser.evaluate(splitArrayA[2]);
		var splitArrayB = params.param_b.split("<");
		b_range[0] = Parser.evaluate(splitArrayB[0]);
		b_range[1] = Parser.evaluate(splitArrayB[2]);

		// get x function and y function
		var xFunction = this.gui.params.param_eq_x;
		var yFunction = this.gui.params.param_eq_y;

		// create parametric function string
		xFunction = Parser.parse(xFunction).toJSFunction(['a','b']);
		yFunction = Parser.parse(yFunction).toJSFunction(['a','b']);
		
		this.leftMesh = this.projector.ParametricMesh2D(xFunction,yFunction,a_range,b_range,this.gui.colors.projections,!this.gui.params.fill);
		this.leftMesh.position.z = 0.1;
		this.leftScene.add(this.leftMesh);

		var slicingColor = this.util.HexToRgb(this.gui.colors.slices);
		var axis = this.gui.params.axis;
		var axisValue = new THREE.Vector2(this.gui.params.axis_value,this.gui.params.axis_value);
		var renderWholeShape = Number(this.gui.params.whole_shape_slicing);
		this.uniforms = {
			axis: { type: "f", value: axis == "Y" ? 1 : 0 } ,
			axisValue: { type: "v2", value: axisValue},
			slice: {type: "f", value: 1},
			renderWholeShape: {type:"f", value:renderWholeShape }
		};
		this.rightMesh = this.slicer.Slice2DMesh(this.leftMesh,this.uniforms,slicingColor);
		this.rightMesh.position.z = 0.2;
		if(axis == "Y")
			this.rightMesh.position.y = -axisValue.y;
		if(axis == "X")
			this.rightMesh.position.x = -axisValue.x;
		this.rightScene.add(this.rightMesh);
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
		this.leftScene.add(this.leftMesh);

		var slicingColor = this.util.HexToRgb(this.gui.colors.slices);
		var axis = this.gui.params.axis;
		var axisValue = new THREE.Vector2(this.gui.params.axis_value,this.gui.params.axis_value);
		var renderWholeShape = Number(this.gui.params.whole_shape_slicing);
		this.uniforms = {
			axis: { type: "f", value: axis == "Y" ? 1 : 0 } ,
			axisValue: { type: "v2", value: axisValue},
			slice: {type: "f", value: 1},
			renderWholeShape: {type:"f", value:renderWholeShape }
		};
		this.rightMesh = this.slicer.Slice2DMesh(this.leftMesh,this.uniforms,slicingColor);
		this.rightMesh.position.z = 0.2;
		this.rightScene.add(this.rightMesh);
	}

	Mode2D.prototype.updateConvexHull = function(){
		this.cleanupLeftMesh();
		this.initConvexHull(this.leftScene);
	}

	//  >>>>>>>>>>> Destroy the shared leftMesh mesh.
	Mode2D.prototype.cleanupLeftMesh = function(){
		console.log("CLEANING UP");
		if(this.leftMesh){
			this.leftScene.remove(this.leftMesh);
			this.leftMesh = null;
		}
		if(this.rightMesh){
			this.rightScene.remove(this.rightMesh);
			this.rightMesh = null;
		}
	}

	//Destroys everything created
	Mode2D.prototype.cleanup = function(){
		cancelAnimationFrame(this.animId); // stop the animation loop

		this.util.CleanUpScene(this.leftScene);

		this.intersectionLine = null;
		this.leftScene = null;
		this.leftRenderer.dispose();
		this.leftRenderer = null;
		this.leftCamera = null;
		this.leftControls = null;
		this.leftMesh = null;
		this.leftAxes = [];

		this.util.CleanUpScene(this.rightScene);

		this.rightScene = null;
		this.rightRenderer.dispose();
		this.rightRenderer = null;
		this.rightCamera = null;
		this.rightControls = null;
		this.rightAxes = [];
		this.gridIsVisible = true;

		// Destroy gui
		this.gui.cleanup();
	}

	Mode2D.prototype.handleEvent = function(event) {
		if(event.type == 'resize') {
			this.util.ResizeScenes(this);
		}
	}

	Mode2D.prototype.animate = function(){
		// Toggle axes visibility
		if(window.Keyboard.isKeyDown("G") && !this.pressedHide){
			this.pressedHide = true;
			this.SetGridAndAxesVisible(!this.gridIsVisible);
		}
		if(!window.Keyboard.isKeyDown("G"))
			this.pressedHide = false;

		this.animId = requestAnimationFrame( this.animate.bind(this) );
		this.leftRenderer.render( this.leftScene, this.leftCamera );
		this.rightRenderer.render( this.rightScene, this.rightCamera );
	}

	scope.Mode2D = Mode2D;
	return Mode2D;
})(typeof exports === 'undefined' ? {} : exports);