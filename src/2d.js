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

		// Init gui
		gui.init("2D",this.callbacks,this);
		this.gui = gui;

		this.leftView = new THREE.Scene();
		this.leftCamera = new THREE.PerspectiveCamera( 75, viewWidth / window.innerHeight, 0.1, 1000 );
		this.leftCamera.position.set(0,0,20);
		this.leftRenderer = new THREE.WebGLRenderer({ antialias: true });
		this.leftRenderer.setClearColor(0xffffff);
		this.leftRenderer.setSize( viewWidth, window.innerHeight );
		this.leftChild.appendChild( this.leftRenderer.domElement );

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
		this.rightRenderer = new THREE.WebGLRenderer({ antialias: true });
		this.rightRenderer.setClearColor(0xffffff);
		this.rightRenderer.setSize( viewWidth, window.innerHeight );
		this.rightChild.appendChild( this.rightRenderer.domElement );

		this.rightControls = new THREE.OrbitControls( this.rightCamera, this.rightRenderer.domElement );
		this.rightControls.enableRotate = false;
		this.rightControls.enableKeys = false;

		axis = GridHelper.CreateAxis("X");
		this.rightView.add(axis);

		var rightXLabel = GridHelper.CreateLabel("X",11,-0.25,0);
		this.rightView.add(rightXLabel);

		this.util = new Util();
		this.projector = new Projecting();
		this.slicer = new Slicing();

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

		// TODO: Toggle projection visibility

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
				// TODO: Set axis to X
			}
			if(val == "Y"){
				// TODO: Set axis to Y
			}

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
		var sides = equation.split("=");
		var LHS = sides[0];
		var RHS = sides[1];
		var LHSfunc = Parser.parse(LHS).toJSFunction(['x','y']);
		var RHSfunc = Parser.parse(RHS).toJSFunction(['x','y']);
		var equationFunc = function(x,y){ return LHSfunc(x,y) - RHSfunc(x,y);}

		this.leftMesh = this.projector.CartesianMesh2D(equationFunc);
		this.leftMesh.position.z = 0.1;
		this.leftView.add(this.leftMesh);
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

		this.leftMesh = this.projector.ConvexHullMesh2D(points);
		this.leftMesh.position.z = 0.1;
		this.leftView.add(this.leftMesh);
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
	}

//Destroys everything created
Mode2D.prototype.cleanup = function(){
	cancelAnimationFrame(this.animId); // stop the animation loop

	this.util.CleanUpScene(this.leftView);

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

	// Remove the two child divs
	this.leftChild.parentNode.removeChild(this.leftChild);
	this.rightChild.parentNode.removeChild(this.rightChild);

	// Destroy gui
	this.gui.cleanup();
}

Mode2D.prototype.animate = function(){
	this.animId = requestAnimationFrame( this.animate.bind(this) );
	this.leftRenderer.render( this.leftView, this.leftCamera );
	this.rightRenderer.render( this.rightView, this.rightCamera );
}

scope.Mode2D = Mode2D;
return Mode2D;
})(typeof exports === 'undefined' ? {} : exports);
