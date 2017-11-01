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

		this.leftMesh = this.projector.MakeTesseract();
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
		if(this.current_mode == "convex-hull" && this.leftMesh){
			var mesh = this.leftMesh;
			mesh.geometry.verticesNeedUpdate = true; 

			if(this.keysDown[this.keyMap['A']]){
				mesh.angleSpeed1++; 
			}
			if(this.keysDown[this.keyMap['D']]){
				mesh.angleSpeed1 --;
			}
			mesh.angleSpeed1 *= 0.8;
			mesh.angle1 += mesh.angleSpeed1 * 0.01;
			mesh.cos1 = Math.cos(mesh.angle1);
			mesh.sin1 = Math.sin(mesh.angle1);

			if(this.keysDown[this.keyMap['W']]){
				mesh.angleSpeed2++; 
			}
			if(this.keysDown[this.keyMap['S']]){
				mesh.angleSpeed2 --;
			}
			mesh.angleSpeed2 *= 0.8;
			mesh.angle2 += mesh.angleSpeed2 * 0.01;
			mesh.cos2 = Math.cos(mesh.angle2);
			mesh.sin2 = Math.sin(mesh.angle2);

			if(this.keysDown[this.keyMap['Q']]){
				mesh.angleSpeed3++; 
			}
			if(this.keysDown[this.keyMap['E']]){
				mesh.angleSpeed3 --;
			}
			mesh.angleSpeed3 *= 0.8;
			mesh.angle3 += mesh.angleSpeed3 * 0.01;
			mesh.cos3 = Math.cos(mesh.angle3);
			mesh.sin3 = Math.sin(mesh.angle3);

			// Rotate geometry in 4D 
			for(var i=0;i<mesh.fullVectorArray.length;i++){
				var p = mesh.fullVectorArray[i];
				var Lw = 18	;
				var f = 1 / (Lw - p.w);

				// Save original locations 
				if(p.ox == undefined){
					p.ox = p.x; 
					p.oy = p.y; 
					p.oz = p.z; 
					p.ow = p.w;
				}

				// Rotate in 4D 
				/* 
					You can rotate along: 
					XY
					XZ
					YZ
					----
					XW 
					YW 
					ZW
				*/
				// The top 3 are just the normal ones xyz ones. So I'm only going to do the last 3
				if(mesh.cos1 == undefined){
					mesh.cos1 = Math.cos(mesh.angle1);
					mesh.sin1 = Math.sin(mesh.angle1);
				}
				p.x = p.ox;
				p.y = p.oy; 
				p.z = p.oz; 
				p.w = p.ow;

				// Rotate around angle1
				p.x = p.x * mesh.cos1;
				p.y = p.y; 
				p.z = p.z - p.w * mesh.sin1;
				p.w = p.x * mesh.sin1 + p.w * mesh.cos1;

				// Rotate around angle2
				p.x = p.x;
				p.y = p.y * mesh.cos2; 
				p.z = p.z - p.w * mesh.sin1;
				p.w = p.y * mesh.sin2 + p.w * mesh.cos2;

				// Rotate around angle3 
				p.x = p.x;
				p.y = p.y; 
				p.z = p.z * mesh.cos3 - p.w * mesh.sin3;
				p.w = p.z * mesh.sin3 + p.w * mesh.cos3;


				// Move in 4D 
				if(this.gui.params.axis == "X")
					p.x = p.x + Number(this.gui.params.axis_value);
				if(this.gui.params.axis == "Y")
					p.y = p.y + Number(this.gui.params.axis_value);
				if(this.gui.params.axis == "Z")
					p.z = p.z + Number(this.gui.params.axis_value);
				if(this.gui.params.axis == "W")
					p.w = p.w + Number(this.gui.params.axis_value);
				


				// Project into 3D
				var X = p.x * f;  
				var Y = p.y * f; 
				var Z = p.z * f;

				mesh.geometry.vertices[i].x = X; 
				mesh.geometry.vertices[i].y = Y;
				mesh.geometry.vertices[i].z = Z;
			}
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