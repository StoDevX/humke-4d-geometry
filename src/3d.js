var Mode3D = (function (scope) {
	//Constructor
	function Mode3D(document){
		this.document = document;

		this.animId = null;

		this.leftView = null;
		this.leftCamera = null;
		this.leftRenderer = null;
		this.leftControls = null;
		this.leftMesh = null;

		this.rightView = null;
		this.rightCamera = null;
		this.rightRenderer = null;
		this.rightControls = null;

		this.leftMesh = null;
	}

	// Creates the scene and everything
	Mode3D.prototype.init = function(div,gui){
		// Create two child divs
		var leftCanvas = document.getElementById("left-view").getElementsByTagName("canvas")[0];
		var rightCanvas = document.getElementById("right-view").getElementsByTagName("canvas")[0];

		var viewWidth = (window.innerWidth-50)/2;

		// Init gui
		gui.init("3D",this.callbacks,this);
		this.gui = gui;

		this.leftView = new THREE.Scene();
		this.leftCamera = new THREE.PerspectiveCamera( 75, viewWidth / window.innerHeight, 0.1, 1000 );
		this.leftCamera.position.set(5,10,20);
		this.leftRenderer = new THREE.WebGLRenderer({ canvas: leftCanvas, antialias: true });
		this.leftRenderer.setClearColor(0xffffff);
		this.leftRenderer.setSize( viewWidth, window.innerHeight );

		this.leftControls = new THREE.OrbitControls( this.leftCamera, this.leftRenderer.domElement );
		this.leftControls.enableKeys  = false;

		var GridHelper = new Grid();
		var grid = GridHelper.CreateGrid("XZ");
		this.leftView.add(grid);

		var axis = GridHelper.CreateAxis("X");
		this.leftView.add(axis);
		axis = GridHelper.CreateAxis("Y");
		this.leftView.add(axis);
		axis = GridHelper.CreateAxis("Z");
		this.leftView.add(axis);

		var leftXLabel = GridHelper.CreateLabel("X",12,0,0);
		this.leftView.add(leftXLabel);
		var leftYLabel = GridHelper.CreateLabel("Y",0,12,0);
		this.leftView.add(leftYLabel);
		var leftZLabel = GridHelper.CreateLabel("Z",0,0,12);
		this.leftView.add(leftZLabel);

		this.rightView = new THREE.Scene();
		this.rightCamera = new THREE.PerspectiveCamera( 75, viewWidth / window.innerHeight, 0.1, 1000 );
		this.rightCamera.position.set(0,0,20);
		this.rightRenderer = new THREE.WebGLRenderer({ canvas: rightCanvas, antialias: true });
		this.rightRenderer.setClearColor(0xffffff);
		this.rightRenderer.setSize( viewWidth, window.innerHeight );

		this.rightControls = new THREE.OrbitControls( this.rightCamera, this.rightRenderer.domElement );
		this.rightControls.enableRotate = false;
		this.rightControls.enableKeys  = false;

		grid = GridHelper.CreateGrid("XY");
		this.rightView.add(grid);

		axis = GridHelper.CreateAxis("X");
		this.rightView.add(axis);
		axis = GridHelper.CreateAxis("Y");
		this.rightView.add(axis);

		var rightXLabel = GridHelper.CreateLabel("X",12,0,0);
		this.rightView.add(rightXLabel);
		var rightYLabel = GridHelper.CreateLabel("Y",0,12,0);
		this.rightView.add(rightYLabel);
		// Add lights to the scene
		var lightSky = new THREE.HemisphereLight( 0xffffbb, 0x080820, .7 );
		this.leftView.add( lightSky );
		var lightGround = new THREE.HemisphereLight( 0xffffbb, 0x080820, .4 );
		this.leftView.add( lightGround );
		lightGround.position.y = -5;
		lightGround.position.x = 2;

		this.util = new Util();
		this.projector = new Projecting();
		this.slicer = new Slicing();

		this.intersectionPlane = this.CreateIntersectionPlane();
		this.intersectionPlane.position.y = this.gui.params.axis_value;
		this.leftView.add(this.intersectionPlane);

		this.animate();

		this.setMode();

		}

	Mode3D.prototype.CreateIntersectionPlane = function(){
		var color =  this.gui.colors.slices;

		var v1 = new THREE.Vector3( 10, 0, 10 );
		var v2 = new THREE.Vector3( -10, 0, 10 );
		var v3 = new THREE.Vector3( -10, 0, -10 );
		var v4 = new THREE.Vector3( 10, 0, -10 );

		var geometry = new THREE.Geometry();
		geometry.vertices.push( v1 );
		geometry.vertices.push( v2 );
		geometry.vertices.push( v3 );
		geometry.vertices.push( v4 );
		geometry.faces.push(new THREE.Face3(0,1,2));
		geometry.faces.push(new THREE.Face3(2,3,0));

		var material = new THREE.MeshPhongMaterial( {color: color, flatShading:true, transparent:true, opacity:0.5, side:THREE.DoubleSide} );
		var mesh = new THREE.Mesh( geometry, material );

		mesh.updatePosition = function(val){
			if(this.axis == "Y")
				this.position.y = val;
			if(this.axis == "X")
				this.position.x = val;
			if(this.axis == "Z")
				this.position.z = val;
		}

		mesh.flip = function(newAxis){
			this.rotation.z = 0;
			this.rotation.x = 0;
			this.position.x = 0;
			this.position.y = 0;
			this.position.z = 0;

			if(newAxis == "Y"){
				
			}
			if(newAxis == "X"){
				this.rotation.z = Math.PI/2;
			}
			if(newAxis == "Z"){
				this.rotation.x = Math.PI/2;
			}

			this.axis = newAxis;
		}

		mesh.axis = "Y";

		return mesh;
	}

	Mode3D.prototype.CalculateIntersection = function(){
		// TODO: Compute and render intersection
	}

	// define a function to be called when each param is updated
	function updateParametricCallback(self,val){
		self.cleanupLeftMesh();
		self.initParametric()
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
		var params = self.gui.params;
		var source = params.source;

		// TODO: Toggle making the slices hidden
	}

	Mode3D.prototype.callbacks = {
		'axis': function(self,val) {
			self.intersectionPlane.flip(val);

			self.CalculateIntersection();
		},
		'axis_value': function(self,val){
			self.intersectionPlane.updatePosition(val);

			self.CalculateIntersection();
		},
		'render_shape': function(self,val){
			// Toggle opacity
			if(self.current_mode == null) return;

			updateRenderShape(self,val);

		},
		'render_slices': function(self,val){
			// Toggle opacity
			if(self.current_mode == null) return;

			updateRenderSlices(self,val);

		},
		'fill': function(self,val){

			self.CalculateIntersection();
		},
		'source': function(self,val){
			self.setMode();

			self.gui.params.render_shape = true; //Reset this back to true
			self.gui.params.render_slices = false; //Reset this back to false
			updateRenderShape(self,val,1);
			updateRenderSlices(self,val,0);

			self.CalculateIntersection();

		},
		'resolution': function(self,val){
			self.cleanupLeftMesh();
			self.initCartesian();
		},
		'equation': function(self,val){
			self.cleanupLeftMesh();
			self.initCartesian();
		},
		'points': function(self,val){
			self.cleanupLeftMesh()
			self.initConvexHull()
		},
		'param_eq_x': updateParametricCallback,
		'param_eq_y': updateParametricCallback,
		'param_eq_z': updateParametricCallback,
		'param_a': updateParametricCallback,
		'param_b': updateParametricCallback,
		'param_c': updateParametricCallback,
	};

	Mode3D.prototype.setMode = function(){
		var params = this.gui.params
		//Switch the mode based on the gui value
		if(this.current_mode != null){
			//Clean up previous
			this.cleanupLeftMesh();
		}
		this.current_mode = params.source;
		//Init new
		if(this.current_mode == "cartesian") this.initCartesian();
		if(this.current_mode == "parametric") this.initParametric();
		if(this.current_mode == "convex-hull") this.initConvexHull();
	}


	Mode3D.prototype.initCartesian = function(){
		var projectingColor = this.gui.colors.projections;
		var equation = this.gui.params.equation;
		var resolution = this.gui.params.resolution;

		var mesh = this.projector.PolygonizeCartesian3D(equation,resolution,projectingColor);
		if(mesh){
			this.leftMesh = mesh;
			this.leftView.add(this.leftMesh);
		}
	}

	Mode3D.prototype.tesselateParametric = function(a_range,b_range,c_value){
		var params = this.gui.params
		// Returns a triangle array
		var slices = 25;
		var stacks = 25;
		var vertices = [];

		for(var i=0;i<=stacks;i++){
			var v = i / stacks;
			for(var j=0;j<=slices;j++){
				var u = j / slices;
				var a = u * (a_range[1] - a_range[0]) + a_range[0];
				var b = v * (b_range[1] - b_range[0]) + b_range[0];
				var x = Parser.evaluate(params.param_eq_x,{a:a,b:b,c:c_value});
				var y = Parser.evaluate(params.param_eq_y,{a:a,b:b,c:c_value});
				var z = Parser.evaluate(params.param_eq_z,{a:a,b:b,c:c_value});
				vertices.push([x,y,z]);
			}
		}

		// Create the triangles
		var sliceCount = slices+1;

		var indices  = [];
		for ( i = 0; i < stacks; i ++ ) {
			for ( j = 0; j < slices; j ++ ) {
				var a = i * sliceCount + j;
				var b = i * sliceCount + j + 1;
				var c = ( i + 1 ) * sliceCount + j + 1;
				var d = ( i + 1 ) * sliceCount + j;

				// faces one and two

				indices.push( [a, b, d] );
				indices.push( [b, c, d] );

			}
		}



		for(var i=0;i<indices.length;i++){
			var v1 = vertices[indices[i][0]];
			var v2 = vertices[indices[i][1]];
			var v3 = vertices[indices[i][2]];
			this.triangleArray.push(v1);
			this.triangleArray.push(v2);
			this.triangleArray.push(v3);
		}

		return [vertices,indices];
	}

	Mode3D.prototype.initParametric = function(){
		function paramFunc ( u, t, optionalTarget ) {

		var result = optionalTarget || new THREE.Vector3();

		// volumetric mobius strip

		u *= Math.PI;
		t *= 2 * Math.PI;

		u = u * 2;
		var phi = u / 2;
		var major = 2.25, a = 0.125, b = 0.65;

		var x, y, z;

		x = a * Math.cos( t ) * Math.cos( phi ) - b * Math.sin( t ) * Math.sin( phi );
		z = a * Math.cos( t ) * Math.sin( phi ) + b * Math.sin( t ) * Math.cos( phi );
		y = ( major + x ) * Math.sin( u );
		x = ( major + x ) * Math.cos( u );

		return result.set( x, y, z );

}

		this.leftMesh = this.projector.ParametricMesh3D(paramFunc);
		this.leftView.add( this.leftMesh );

	}

	Mode3D.prototype.initConvexHull = function(){
		var pointsRaw = this.util.ParseConvexPoints(this.gui.params.points);
		// Convert the points into Vector3 objects:
		var points = [];
		for(var i=0;i<pointsRaw.length;i++){
			var rawPoint = pointsRaw[i];
			var newPoint = new THREE.Vector3(rawPoint.x,rawPoint.y,rawPoint.z);
			points.push(newPoint);
		}

		var projectingColor = this.gui.colors.projections;

		this.leftMesh = this.projector.ConvexHullMesh3D(points,projectingColor);
		this.leftView.add( this.leftMesh );
	}

	//  >>>>>>>>>>> Destroy the shared leftMesh mesh.
	Mode3D.prototype.cleanupLeftMesh = function(){
		console.log("CLEANING UP");
		if(this.leftMesh){
			this.leftView.remove(this.leftMesh);
			this.leftMesh = null;
		}
	}

	//Destroys everything created
	Mode3D.prototype.cleanup = function(){
		cancelAnimationFrame(this.animId); // stop the animation loop

		this.util.CleanUpScene(this.leftView);

		this.leftView = null;
		this.leftRenderer.dispose();
		this.leftRenderer = null;
		this.leftCamera = null;
		this.leftControls = null;
		this.leftMesh = null;
		this.intersectionPlane = null;

		this.util.CleanUpScene(this.rightView);

		this.rightView = null;
		this.rightRenderer.dispose();
		this.rightRenderer = null;
		this.rightCamera = null;
		this.rightControls = null;

		// Destroy gui
		this.gui.cleanup();
	}

	Mode3D.prototype.handleEvent = function(event) {
		if(event.type == 'resize') {
			this.util.ResizeScenes(this);
		}
	}

	Mode3D.prototype.animate = function(){
		this.animId = requestAnimationFrame( this.animate.bind(this) );
		this.leftRenderer.render( this.leftView, this.leftCamera );
		this.rightRenderer.render( this.rightView, this.rightCamera );
	}

	scope.Mode3D = Mode3D;
	return Mode3D;

})(typeof exports === 'undefined' ? {} : exports);
