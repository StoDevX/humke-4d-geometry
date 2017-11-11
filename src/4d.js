var Mode4D = (function (scope) {
	//Constructor
	function Mode4D(document){
		this.document = document;

		this.leftView = null;
		this.leftCamera = null;
		this.leftRenderer = null;
		this.leftControls = null;
		this.labels = [];
		this.leftAxes = [];
		this.keysDown = {};
		this.keyMap = {'A':65,'D':68,'S':83,'W':87,'Q':81,'E':69}

		this.rightView = null;
		this.rightCamera = null;
		this.rightRenderer = null;
		this.rightControls = null;

		this.leftMesh = null;
		this.rightMesh = null;
	}

	// Creates the scene and everything
	Mode4D.prototype.init = function(div,gui){
		// Create two child divs
		var leftCanvas = document.getElementById("left-view").getElementsByTagName("canvas")[0];
		var rightCanvas = document.getElementById("right-view").getElementsByTagName("canvas")[0];

		var viewWidth = (window.innerWidth-50)/2;

		// Init gui
		gui.init("4D",this.callbacks,this);
		this.gui = gui;

		// Set up left view
		this.leftView = new THREE.Scene();
		this.leftCamera = new THREE.PerspectiveCamera( 75, viewWidth / window.innerHeight, 0.1, 1000 );
		this.leftCamera.position.set(5,10,20);
		this.leftRenderer = new THREE.WebGLRenderer({ canvas: leftCanvas, antialias: true });
		this.leftRenderer.setClearColor(0xffffff);
		this.leftRenderer.setSize( viewWidth, window.innerHeight );

		this.leftControls = new THREE.OrbitControls( this.leftCamera, this.leftRenderer.domElement );
		this.leftControls.enableKeys = false;

		var GridHelper = new Grid();

		var grid = GridHelper.CreateGrid("XZ");
		//this.leftView.add(grid);

		var axis = GridHelper.CreateAxis("X");
		this.leftView.add(axis); this.leftAxes.push(axis);
		axis = GridHelper.CreateAxis("Y");
		this.leftView.add(axis); this.leftAxes.push(axis);
		axis = GridHelper.CreateAxis("Z");
		this.leftView.add(axis); this.leftAxes.push(axis);
		axis = GridHelper.CreateAxis("W");
		this.leftView.add(axis);  this.leftAxes.push(axis);
		

		var leftXLabel = GridHelper.CreateLabel("X",12,0,0); this.addLabel(leftXLabel,this.leftCamera);
		this.leftView.add(leftXLabel);
		var leftYLabel = GridHelper.CreateLabel("Y",0,12,0); this.addLabel(leftYLabel,this.leftCamera);
		this.leftView.add(leftYLabel);
		var leftZLabel = GridHelper.CreateLabel("Z",0,0,12); this.addLabel(leftZLabel,this.leftCamera);
		this.leftView.add(leftZLabel);
		var leftWLabel = GridHelper.CreateLabel("W",5,10,-5); this.addLabel(leftWLabel,this.leftCamera);
		this.leftView.add(leftWLabel);

		this.rightView = new THREE.Scene();
		this.rightCamera = new THREE.PerspectiveCamera( 75, viewWidth / window.innerHeight, 0.1, 1000 );
		this.rightCamera.position.set(5,10,20);
		this.rightRenderer = new THREE.WebGLRenderer({ canvas: rightCanvas, antialias: true });
		this.rightRenderer.setClearColor(0xffffff);
		this.rightRenderer.setSize( viewWidth, window.innerHeight );

		this.rightControls = new THREE.OrbitControls( this.rightCamera, this.rightRenderer.domElement );
		this.rightControls.enableKeys = false;

		grid = GridHelper.CreateGrid("XZ");
		this.rightView.add(grid);

		axis = GridHelper.CreateAxis("X");
		this.rightView.add(axis);
		axis = GridHelper.CreateAxis("Y");
		this.rightView.add(axis);
		axis = GridHelper.CreateAxis("Z");
		this.rightView.add(axis);

		var rightXLabel = GridHelper.CreateLabel("X",12,0,0); this.addLabel(rightXLabel,this.rightCamera);
		this.rightView.add(rightXLabel);
		var rightYLabel = GridHelper.CreateLabel("Y",0,12,0); this.addLabel(rightYLabel,this.rightCamera);
		this.rightView.add(rightYLabel);
		var rightZLabel = GridHelper.CreateLabel("Z",0,0,12); this.addLabel(rightZLabel,this.rightCamera);
		this.rightView.add(rightZLabel);
		// Add lights to the scene
		var lightSky = new THREE.HemisphereLight( 0xffffbb, 0x080820, .7 );
		this.leftView.add( lightSky );
		var lightGround = new THREE.HemisphereLight( 0xffffbb, 0x080820, .4 );
		this.leftView.add( lightGround );
		lightGround.position.y = -5;
		lightGround.position.x = 2;

		this.rightView.add(lightSky.clone());
		this.rightView.add(lightGround.clone());

		this.util = new Util();
		this.projector = new Projecting();

		this.animate();

		// Draw our main shape
		this.setMode()

		this.util = new Util();
		this.projector = new Projecting();
		this.slicer = new Slicing();

		// Key down 
		document.addEventListener("keydown", onDocumentKeyDown, false);
		document.addEventListener("keyup", onDocumentKeyUp, false);
		var self = this;
		function onDocumentKeyDown(event) {
		    var keyCode = event.which;
		    self.keysDown[keyCode] = true;

		    if(keyCode == 66){
		    	// Toggle axis visibility
		    	for(var i=0;i<self.leftAxes.length;i++){
		    		var axis = self.leftAxes[i];
		    		axis.visible = !axis.visible;
		    	}
		    }

		    if (keyCode == 87) {
		        // W
		    } else if (keyCode == 83) {
		        // S
		    } else if (keyCode == 65) {
		        // A
		    } else if (keyCode == 68) {
		        // D
		    } else if (keyCode == 32) {
		        // Enter
		    }
		};
		function onDocumentKeyUp(event) {
		    var keyCode = event.which;
		    delete self.keysDown[keyCode];
		    if (keyCode == 87) {
		        // W
		    } else if (keyCode == 83) {
		        // S
		    } else if (keyCode == 65) {
		        // A
		    } else if (keyCode == 68) {
		        // D
		    } else if (keyCode == 32) {
		        // Enter
		    }
		};
	}

	Mode4D.prototype.addLabel = function(label,camera){
		//Add the label and its camera to the label array 
		this.labels.push({l:label,c:camera});
	}

	Mode4D.prototype.setMode = function(){
		var params = this.gui.params
		//Switch the mode based on the gui value
		if(this.current_mode != null){
			//Clean up previous
			this.cleanupLeftMesh();
		}
		this.current_mode = params.source;
		//Init new
		if(this.current_mode == "cartesian") this.initCartesian();
		if(this.current_mode == "convex-hull") this.initConvexHull();
	}

	Mode4D.prototype.callbacks = {
		'axis':function(self,val) {
			if(self.current_mode == "cartesian") {
				self.cleanupLeftmesh();
				self.initCartesian();
			}
		},
		'source': function(self,val){
			self.setMode();
			self.gui.params.render_shape = true; //Reset this back to true
		},
		'resolution': function(self,val){
			self.cleanupLeftMesh();
			self.initCartesian();
		},
		'equation': function(self,val){
			self.cleanupLeftMesh();
			self.initCartesian();
		},
		'axis_value': function(self,val){
			if(self.current_mode == "cartesian"){
				self.cleanupLeftMesh();
				self.initCartesian();
			}
		},
		'points': function(self,val){
			self.cleanupLeftMesh()
			self.initConvexHull()
		},
	};

	// Generalizing the 3D cartesian drawing
	Mode4D.prototype.polygonizeCartesian = function(equation_string,resolution,variables){

		let sides = equation_string.split('=');
		let LHS = sides[0];
		let RHS = sides[1];
		let LHSfunc = Parser.parse(LHS).toJSFunction(variables);
		let RHSfunc = Parser.parse(RHS).toJSFunction(variables);
		var eq = function(x,y,z) { return LHSfunc(x,y,z) - RHSfunc(x,y,z); };

		//Parses the equation, and polygonizes it
		try {
			var triangleArray = [];
			triangleArray = Polygonize.generate(eq, [[-10, 10], [-10, 10], [-10, 10]], resolution);
			return triangleArray;

		} catch(err){
			console.log("Error rendering equation",err);
			return []
		}

	}

	Mode4D.prototype.initCartesian = function(){
		/* To draw a section of a 4d cartesian:
			- Grab the equation
			- Replace the axis variable with the axis value
			- Draw that 3D shape
		*/
		var equation = this.gui.params.equation
		var resolution = this.gui.params.resolution;
		var axis_variable = this.gui.params.axis.toLowerCase()
		equation = equation.replace(new RegExp(axis_variable,'g'), "(" + this.gui.params.axis_value + ")")
		var variables = ["x","y","z","w"];
		for(var i=0;i<variables.length;i++){
			if(variables[i] == axis_variable)
				variables.splice(i,1);
		}

		var projectingColor = this.gui.colors.projections;

		var mesh = this.projector.PolygonizeCartesian3D(equation,resolution,projectingColor,variables);
		if(mesh){
			this.rightMesh = mesh;
			this.rightView.add(this.rightMesh);
		}

		

	}

	Mode4D.prototype.initConvexHull = function(){
		var pointsRaw = this.util.ParseConvexPoints(this.gui.params.points);
		// Convert the points into Vector3 objects:
		var points = [];
		for(var i=0;i<pointsRaw.length;i++){
			var rawPoint = pointsRaw[i];
			var newPoint = new THREE.Vector4(rawPoint.x,rawPoint.y,rawPoint.z,rawPoint.w);
			points.push(newPoint);
		}

		// We should be passing these points into the 4D projection function
		// But just for testing, we're going to just manually define and pass a tesseract
		var CHull4D = new ConvexHull4D();
		// Generate tesseract points
		var start = -5;
		var end = 5;

		var vectorArray = [];
		// Generate the tesseract points
		for(var x=start;x<=end;x+=(end-start)){
			for(var y=start;y<=end;y+=(end-start)){
				for(var z=start;z<=end;z+=(end-start)){
					for(var w=start;w<=end;w+=(end-start)){
						vectorArray.push(new THREE.Vector4(x,y,z,w));
					}
				}
			}
		}

		// Generate the pairs of points that create the edges
		var edgesArray = [];
		for(var i=0;i<vectorArray.length;i++){
			var p = vectorArray[i];
			for(var j=0;j<vectorArray.length;j++){
				if(i == j) continue;
				var p2 = vectorArray[j];
				// For two points to be connected, they must share exactly 3 coordinates
				// xyz, xyw, xzw, yzw
				if(p.x == p2.x && p.y == p2.y && p.z == p2.z ||
				   p.x == p2.x && p.y == p2.y && p.w == p2.w ||
				   p.y == p2.y && p.z == p2.z && p.w == p2.w ||
				   p.x == p2.x && p.z == p2.z && p.w == p2.w ){

					edgesArray.push(p);
					edgesArray.push(p2);
				}
			}
		}

		// Flatten the vectorArray
		var tesseract = [];
		for(var i=0;i<vectorArray.length;i++){
			var v = vectorArray[i];
			tesseract.push([v.x,v.y,v.z,v.w]);
		}

		// Obtain facets that cover the surface 
		var facets = CHull4D.ConvexHull4D(tesseract);
		var edges_arr = this.util.FlattenFacets(facets, tesseract);

		// Format the points so the projector can render them 
		var edges = [];
		for(var i=0;i<edges_arr.length;i+=4){
			var e = edges_arr;
			var p = {x:e[i],y:e[i+1],z:e[i+2],w:e[i+3]}
			edges.push(p);
		}

		var tesseractMesh = this.projector.Wireframe4D(vectorArray,edges);
		this.leftMesh = tesseractMesh;
		this.leftView.add(this.leftMesh);



	}


	Mode4D.prototype.cleanupLeftMesh = function(){
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
	Mode4D.prototype.cleanup = function(){
		cancelAnimationFrame(this.animId); // stop the animation loop

		this.util.CleanUpScene(this.leftView);

		this.leftView = null;
		this.leftRenderer.dispose();
		this.leftRenderer = null;
		this.leftCamera = null;
		this.leftControls = null;
		this.leftMesh = null;
		this.intersectionPlane = null;
		this.labels = [];
		this.rightXLabel = null;
		this.rightYLabel = null;

		this.util.CleanUpScene(this.rightView);

		this.rightView = null;
		this.rightRenderer.dispose();
		this.rightRenderer = null;
		this.rightCamera = null;
		this.rightControls = null;
		this.leftAxes = [];

		// Destroy gui
		this.gui.cleanup();
	}

	Mode4D.prototype.handleEvent = function(event) {
		if(event.type == 'resize') {
			this.util.ResizeScenes(this);
		}
	}

	

	Mode4D.prototype.animate = function(){
		if(this.current_mode == "convex-hull"){
			// XW rotation
			if(this.keysDown[this.keyMap['A']]){
				this.leftMesh.angleSpeed.x ++;
			}
			if(this.keysDown[this.keyMap['D']]){
				this.leftMesh.angleSpeed.x --;
			}
			// YW rotation
			if(this.keysDown[this.keyMap['W']]){
				this.leftMesh.angleSpeed.y ++; 
			}
			if(this.keysDown[this.keyMap['S']]){
				this.leftMesh.angleSpeed.y --;
			}
			// ZW rotation 
			if(this.keysDown[this.keyMap['Q']]){
				this.leftMesh.angleSpeed.z ++; 
			}
			if(this.keysDown[this.keyMap['E']]){
				this.leftMesh.angleSpeed.z --;
			}
			
			var friction = 0.8;
			this.leftMesh.angleSpeed.x *= friction;
			this.leftMesh.angleSpeed.y *= friction;
			this.leftMesh.angleSpeed.z *= friction;

			var scaleFactor = 0.01;
			this.leftMesh.uniforms.anglesW.value.x += this.leftMesh.angleSpeed.x * scaleFactor;
			this.leftMesh.uniforms.anglesW.value.y += this.leftMesh.angleSpeed.y * scaleFactor;
			this.leftMesh.uniforms.anglesW.value.z += this.leftMesh.angleSpeed.z * scaleFactor;
		}

		for(var i=0;i<this.labels.length;i++)
			this.labels[i].l.quaternion.copy(this.labels[i].c.quaternion);

		requestAnimationFrame( this.animate.bind(this) );
		this.leftRenderer.render( this.leftView, this.leftCamera );
		this.rightRenderer.render( this.rightView, this.rightCamera );
	}

	scope.Mode4D = Mode4D;
	return Mode4D;

})(typeof exports === 'undefined' ? {} : exports);