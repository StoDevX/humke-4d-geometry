var Mode3D = (function (scope) {
	//Constructor
	function Mode3D(document){
		this.document = document;

		this.leftView = null;
		this.leftCamera = null;
		this.leftRenderer = null;
		this.leftControls = null;

		this.rightView = null;
		this.rightCamera = null;
		this.rightRenderer = null;
		this.rightControls = null;
	}

	// Creates the scene and everything
	Mode3D.prototype.init = function(div,gui){
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
		gui.init("3D",this.callbacks,this);
		this.gui = gui;

		this.leftView = new THREE.Scene();
		this.leftCamera = new THREE.PerspectiveCamera( 75, viewWidth / window.innerHeight, 0.1, 1000 );
		this.leftCamera.position.set(5,10,20);
		this.leftRenderer = new THREE.WebGLRenderer({ antialias: true });
		this.leftRenderer.setClearColor(0xffffff);
		this.leftRenderer.setSize( viewWidth, window.innerHeight );
		leftChild.appendChild( this.leftRenderer.domElement );

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
		this.rightRenderer = new THREE.WebGLRenderer();
		this.rightRenderer.setClearColor(0xffffff);
		this.rightRenderer.setSize( viewWidth, window.innerHeight );
		rightChild.appendChild( this.rightRenderer.domElement );

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

		this.animate();
		}

	Mode3D.prototype.CalculateIntersection = function(){
		// TODO: Compute and render intersection
	}

	// define a function to be called when each param is updated
	function updateParametricCallback(self,val){
		self.cleanupParametric();
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
			// TODO: Set axis to val

			self.CalculateIntersection();
		},
		'axis_value': function(self,val){
			

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
			self.cleanupCartesian();
			self.initCartesian();
		},
		'equation': function(self,val){
			self.cleanupCartesian();
			self.initCartesian();
		},
		'points': function(self,val){
			self.cleanupConvexHull()
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


	Mode3D.prototype.initCartesian = function(){
		this.polygonizeCartesian();
		if(this.triangleArray == null) return; //Failed to parse
		var triangleArray = this.triangleArray;
		
		// TODO: Render triangles
	}
	Mode3D.prototype.polygonizeCartesian = function(){
		var params = this.gui.params

		var equation_string = params.equation;
		let sides = equation_string.split('=');
		let LHS = sides[0];
		let RHS = sides[1];
		let LHSfunc = Parser.parse(LHS).toJSFunction(['x','y','z']);
		let RHSfunc = Parser.parse(RHS).toJSFunction(['x','y','z']);
		var eq = function(x,y,z) { return LHSfunc(x,y,z) - RHSfunc(x,y,z); };

		//Parses the equation, and polygonizes it
		try {
			var triangleArray = [];
			triangleArray = Polygonize.generate(eq, [[-10, 10], [-10, 10], [-10, 10]], params.resolution);
			this.triangleArray = triangleArray;


		} catch(err){
			console.log("Error rendering equation",err);
		}
	}

	Mode3D.prototype.cleanupCartesian = function(){
		//TODO: Cleanup cartesian
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
		var params = this.gui.params
		var a_range = [0,1];
		var b_range = [0,1];
		var c_range = [0,1];
		// get range from string
		var splitArrayA = params.param_a.split("<"); // should return 3 pieces. We want the first and last
		a_range[0] = Parser.evaluate(splitArrayA[0]);
		a_range[1] = Parser.evaluate(splitArrayA[2]);
		var splitArrayB = params.param_b.split("<");
		b_range[0] = Parser.evaluate(splitArrayB[0]);
		b_range[1] = Parser.evaluate(splitArrayB[2]);
		var splitArrayC = params.param_c.split("<");
		c_range[0] = Parser.evaluate(splitArrayC[0]);
		c_range[1] = Parser.evaluate(splitArrayC[2]);

		this.triangleArray = []

		var upperData = this.tesselateParametric(a_range,b_range,c_range[1]);
		var upperBoundVerticies = upperData[0];
		var upperIndices = upperData[1];

		var lowerData = this.tesselateParametric(a_range,b_range,c_range[0]);
		var lowerBoundVerticies = lowerData[0];
		var lowerIndices = lowerData[1];

		// If we don't find BOTH a and b as variables, then draw it as a line
		var draw_filled = true;
		var tokens = Parser.parse(params.param_eq_x).tokens;
		var found_a = false;
		var found_b = false;
		var found_c = false;
		for(var i=0;i<tokens.length;i++){
			if(tokens[i].toString() == "a") found_a = true;
			if(tokens[i].toString() == "b") found_b = true;
			if(tokens[i].toString() == "c") found_c = true;
		}
		tokens = Parser.parse(params.param_eq_y).tokens;
		for(var i=0;i<tokens.length;i++){
			if(tokens[i].toString() == "a") found_a = true;
			if(tokens[i].toString() == "b") found_b = true;
			if(tokens[i].toString() == "c") found_c = true;
		}
		tokens = Parser.parse(params.param_eq_z).tokens;
		for(var i=0;i<tokens.length;i++){
			if(tokens[i].toString() == "a") found_a = true;
			if(tokens[i].toString() == "b") found_b = true;
			if(tokens[i].toString() == "c") found_c = true;
		}
		if(!found_a || !found_b || !found_c) draw_filled = false;

		// TODO: Render parametric

	}
	Mode3D.prototype.cleanupParametric = function(){
		// TODO: Cleanup parametric
	}


	Mode3D.prototype.initConvexHull = function(){
		var pointsRaw = this.parseConvexPoints(this.gui.params.points);
		// Convert the points into Vector3 objects:
		var points = [];
		for(var i=0;i<pointsRaw.length;i++){
			var rawPoint = pointsRaw[i];
			var newPoint = new THREE.Vector3(rawPoint.x,rawPoint.y,rawPoint.z);
			points.push(newPoint);
		}

		var geometry = new THREE.ConvexGeometry( points );
		var material = new THREE.MeshPhongMaterial( {color: 0x00ff00, flatShading:false} );
		var mesh = new THREE.Mesh( geometry, material );
		this.convexMesh = mesh;
		this.leftView.add( mesh );


	}
	Mode3D.prototype.parseConvexPoints = function(string){
		/* Takes in a string a points, and returns an array of points [p1,p2] 
			where pi = {x:[Number],y:[Number],z:[Number]} 
		*/

		// Remove whitespace
		var points_str = string.replace(/\s+/g, '');
		// Split based on the pattern (digits,digits)
		var points_split = points_str.match(/\(-*[.\d]+,-*[.\d]+,-*[.\d]+\)/g);
		var pointsArray = [];

		for(var i=0;i<points_split.length;i++){
			var p = points_split[i];
			// Remove parenthesis
			p = p.replace(/[\(\)]/g,'');
			// Split by comma
			var comma_split = p.split(",")
			var point = {};
			var map = ['x','y','z','w'];
			for(var j=0;j<comma_split.length;j++){
				point[map[j]] = Number(comma_split[j]);
			}
			pointsArray.push(point)
		}

		return pointsArray;
	}
	Mode3D.prototype.cleanupConvexHull = function(){
		this.leftView.remove(this.convexMesh);
		
	}

	//Destroys everything created
	Mode3D.prototype.cleanup = function(){
		// TODO: Proper clean up to remove animationFrame and all that 

		// Remove the two child divs
		this.leftChild.parentNode.removeChild(this.leftChild);
		this.rightChild.parentNode.removeChild(this.rightChild);

		// Destroy gui
		this.gui.cleanup();
	}

	Mode3D.prototype.animate = function(){
		requestAnimationFrame( this.animate.bind(this) );
		this.leftRenderer.render( this.leftView, this.leftCamera );
		this.rightRenderer.render( this.rightView, this.rightCamera );
	}

	scope.Mode3D = Mode3D;
	return Mode3D;

})(typeof exports === 'undefined' ? {} : exports);
