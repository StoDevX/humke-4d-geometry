var Mode4D = (function (scope) {
	//Constructor
	function Mode4D(document){
		this.document = document;

		this.leftScene = null;
		this.leftCamera = null;
		this.leftRenderer = null;
		this.leftControls = null;
		this.labels = [];
		this.leftAxes = [];

		this.rightScene = null;
		this.rightCamera = null;
		this.rightRenderer = null;
		this.rightControls = null;
		this.rightAxes = [];

		this.leftMesh = null;
		this.rightMesh = null;

		this.gridIsVisible = true;
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
		this.leftScene = new THREE.Scene();
		this.leftCamera = new THREE.PerspectiveCamera( 75, viewWidth / window.innerHeight, 0.1, 1000 );
		this.leftCamera.position.set(5,10,20);
		this.leftRenderer = new THREE.WebGLRenderer({ canvas: leftCanvas, antialias: true });
		this.leftRenderer.setClearColor(0xffffff);
		this.leftRenderer.setSize( viewWidth, window.innerHeight );

		this.leftControls = new THREE.OrbitControls( this.leftCamera, this.leftRenderer.domElement );
		this.leftControls.enableKeys = false;

		var GridHelper = new Grid();

		var grid = GridHelper.CreateGrid("XZ");
		//this.leftScene.add(grid);

		var axis = GridHelper.CreateAxis("X");
		this.leftScene.add(axis); this.leftAxes.push(axis);
		axis = GridHelper.CreateAxis("Y");
		this.leftScene.add(axis); this.leftAxes.push(axis);
		axis = GridHelper.CreateAxis("Z");
		this.leftScene.add(axis); this.leftAxes.push(axis);
		axis = GridHelper.CreateAxis("W");
		this.leftScene.add(axis);  this.leftAxes.push(axis);

		var leftXLabel = GridHelper.CreateLabel("X",12,0,0); this.addLabel(leftXLabel,this.leftCamera);
		this.leftScene.add(leftXLabel); this.leftAxes.push(leftXLabel);
		var leftYLabel = GridHelper.CreateLabel("Y",0,12,0); this.addLabel(leftYLabel,this.leftCamera);
		this.leftScene.add(leftYLabel); this.leftAxes.push(leftYLabel);
		var leftZLabel = GridHelper.CreateLabel("Z",0,0,12); this.addLabel(leftZLabel,this.leftCamera);
		this.leftScene.add(leftZLabel); this.leftAxes.push(leftZLabel);
		var leftWLabel = GridHelper.CreateLabel("W",5,10,-5); this.addLabel(leftWLabel,this.leftCamera);
		this.leftScene.add(leftWLabel); this.leftAxes.push(leftWLabel);

		this.rightScene = new THREE.Scene();
		this.rightCamera = new THREE.PerspectiveCamera( 75, viewWidth / window.innerHeight, 0.1, 1000 );
		this.rightCamera.position.set(5,10,20);
		this.rightRenderer = new THREE.WebGLRenderer({ canvas: rightCanvas, antialias: true });
		this.rightRenderer.setClearColor(0xffffff);
		this.rightRenderer.setSize( viewWidth, window.innerHeight );

		this.rightControls = new THREE.OrbitControls( this.rightCamera, this.rightRenderer.domElement );
		this.rightControls.enableKeys = false;

		grid = GridHelper.CreateGrid("XZ");
		this.rightScene.add(grid); this.rightAxes.push(grid);

		axis = GridHelper.CreateAxis("X");
		this.rightScene.add(axis); this.rightAxes.push(axis);
		axis = GridHelper.CreateAxis("Y");
		this.rightScene.add(axis); this.rightAxes.push(axis);
		axis = GridHelper.CreateAxis("Z");
		this.rightScene.add(axis); this.rightAxes.push(axis);

		var rightXLabel = GridHelper.CreateLabel("X",12,0,0); this.addLabel(rightXLabel,this.rightCamera);
		this.rightScene.add(rightXLabel);  this.rightAxes.push(rightXLabel);
		var rightYLabel = GridHelper.CreateLabel("Y",0,12,0); this.addLabel(rightYLabel,this.rightCamera);
		this.rightScene.add(rightYLabel); this.rightAxes.push(rightYLabel);
		var rightZLabel = GridHelper.CreateLabel("Z",0,0,12); this.addLabel(rightZLabel,this.rightCamera);
		this.rightScene.add(rightZLabel); this.rightAxes.push(rightZLabel);
		// Add lights to the scene
		var lightSky = new THREE.HemisphereLight( 0xffffbb, 0x080820, .7 );
		this.leftScene.add( lightSky );
		var lightGround = new THREE.HemisphereLight( 0xffffbb, 0x080820, .4 );
		this.leftScene.add( lightGround );
		lightGround.position.y = -5;
		lightGround.position.x = 2;

		this.rightScene.add(lightSky.clone());
		this.rightScene.add(lightGround.clone());

		this.util = new Util();
		this.projector = new Projecting();

		this.animate();

		// Draw our main shape
		this.setMode()

		this.util = new Util();
		this.projector = new Projecting();
		this.slicer = new Slicing();

		this.intersectionPlane = this.CreateIntersectionHyperPlane();

		

	}


	Mode4D.prototype.SetGridAndAxesVisible = function(visible){
		this.gridIsVisible = visible;
		for(var i=0;i<this.leftAxes.length;i++)
			this.leftAxes[i].visible = visible;
		for(var i=0;i<this.rightAxes.length;i++)
			this.rightAxes[i].visible = visible;
	}

	Mode4D.prototype.ComputeSlicesCPU = function() {

		var axis = this.gui.params.axis;
		var axisValue = this.gui.params.axis_value;
		var color = this.gui.colors.slices;
		if(!this.leftMesh) return;

		if(this.current_mode == "convex-hull") {

			if(this.rightMesh) {
				this.rightScene.remove(this.rightMesh);
			}

			this.rightMesh = this.slicer.SliceConvex4D(this.leftMesh,axis,axisValue,color);

			if (this.rightMesh != null) {
				this.rightScene.add(this.rightMesh);
			}
		}

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
				self.cleanupLeftMesh();
				self.initCartesian();
			}

			self.ComputeSlicesCPU();
		},
		'source': function(self,val){
			self.setMode();
			self.gui.params.render_shape = true; //Reset this back to true

			self.ComputeSlicesCPU();
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

			// Update intersection plane position
			if(self.gui.params.axis == "W"){
				self.intersectionPlane.uniforms.Wtranslation.value = val * 0.95 ;
				self.intersectionPlane.uniforms2.Wtranslation.value = self.intersectionPlane.uniforms.Wtranslation.value;
			}
			if(self.gui.params.axis == "X"){
				self.intersectionPlane.position.x = val;
			}


			self.ComputeSlicesCPU();

		},
		'points': function(self,val){
			self.cleanupLeftMesh()
			self.initConvexHull()
		},
		'show left view': function(self,val){
			self.util.SetLeftDivVisibility(val);
		},
		'show right view': function(self,val){
			self.util.SetRightDivVisibility(val);
		}
	};

	Mode4D.prototype.CreateIntersectionHyperPlane = function(){
		var color =  this.gui.colors.slices;

		var mesh = this.projector.Mesh4D(this.util.HexToRgb(color));
		this.leftScene.add(mesh);
		return mesh;
	}

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
		
		var resolution = 20;
		if (this.gui.params.resolution == "high") var resolution = 112;
		else if (this.gui.params.resolution == "medium") var resolution = 60;

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
			this.rightScene.add(this.rightMesh);
		}



	}

	Mode4D.prototype.computeProjection = function(points,facets){
		var new_points = [];
		var scale = 5;
		for(var i=0;i<points.length;i++){
			var e = points[i];
			var p = {x:e[0],y:e[1],z:e[2],w:e[3]}
			p.x *= scale;
			p.y *= scale;
			p.z *= scale;
			p.w *= scale;
			new_points.push(p);
		}

		// Construct edges
		var edges_arr = this.util.FlattenFacets(facets, points);
		var edges = [];
		for(var i=0;i<edges_arr.length;i+=4){
			var e = edges_arr;
			var p = {x:e[i],y:e[i+1],z:e[i+2],w:e[i+3]}
			p.x *= scale;
			p.y *= scale;
			p.z *= scale;
			p.w *= scale;
			edges.push(p);
		}

		var tesseractMesh = this.projector.Wireframe4D(new_points,edges);
		this.leftMesh = tesseractMesh;
		this.leftScene.add(this.leftMesh);
		this.leftMesh.DATA_points = points;
		this.leftMesh.DATA_facets = facets;

		this.ComputeSlicesCPU();
	}

	Mode4D.prototype.initConvexHull = function(){
		var pointsRaw = this.util.ParseConvexPoints(this.gui.params.points);
		// Convert the points into Vector3 objects:
		var points = [];
		var flatten_points = [];
		for(var i=0;i<pointsRaw.length;i++){
			var rawPoint = pointsRaw[i];
			var newPoint = new THREE.Vector4(rawPoint.x,rawPoint.y,rawPoint.z,rawPoint.w);
			flatten_points.push([rawPoint.x,rawPoint.y,rawPoint.z,rawPoint.w])
			points.push(newPoint);
		}
		var self = this;
		// Get the facet data from Qhull
		$.post("http://omarshehata.me/qhull/",{'points':JSON.stringify(points)},function(facets){
			self.computeProjection(flatten_points,facets)
		}).fail(function(msg){
			var lines = msg.responseText.split("\n");
			console.log("FAIL!",lines)
		});

		/* 4D CONVEX HULL DEMO CODE
		var CHull4D = new ConvexHull4D();
		var start = -5;
		var end = 5;

		var points = [];
		// Generate the tesseract points
		for(var x=start;x<=end;x+=(end-start)){
			for(var y=start;y<=end;y+=(end-start)){
				for(var z=start;z<=end;z+=(end-start)){
					for(var w=start;w<=end;w+=(end-start)){
						points.push([x,y,z,w]);
					}
				}
			}
		}

		Obtain facets that cover the surface
		var facets = CHull4D.ConvexHull4D(points);
		var edges_arr = this.util.FlattenFacets(facets, points);

		var new_points = [];
		var scale = 5;
		for(var i=0;i<points.length;i++){
			var e = points[i];
			var p = {x:e[0],y:e[1],z:e[2],w:e[3]}
			p.x *= scale;
			p.y *= scale;
			p.z *= scale;
			p.w *= scale;
			new_points.push(p);
		}
		
		// Construct edges
		var edges = [];
		for(var i=0;i<edges_arr.length;i+=4){
			var e = edges_arr;
			var p = {x:e[i],y:e[i+1],z:e[i+2],w:e[i+3]}
			p.x *= scale;
			p.y *= scale;
			p.z *= scale;
			p.w *= scale;
			edges.push(p);
		}

		var tesseractMesh = this.projector.Wireframe4D(new_points,edges);
		this.leftMesh = tesseractMesh;
		this.leftView.add(this.leftMesh);

		this.ComputeSlicesCPU();*/

	}


	Mode4D.prototype.cleanupLeftMesh = function(){
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
	Mode4D.prototype.cleanup = function(){
		cancelAnimationFrame(this.animId); // stop the animation loop

		this.util.CleanUpScene(this.leftScene);

		this.leftScene = null;
		this.leftRenderer.dispose();
		this.leftRenderer = null;
		this.leftCamera = null;
		this.leftControls = null;
		this.leftMesh = null;
		this.intersectionPlane = null;
		this.labels = [];
		this.rightXLabel = null;
		this.rightYLabel = null;
		this.rightAxes = [];

		this.util.CleanUpScene(this.rightScene);

		this.rightScene = null;
		this.rightRenderer.dispose();
		this.rightRenderer = null;
		this.rightCamera = null;
		this.rightControls = null;
		this.leftAxes = [];
		this.gridIsVisible = true;

		// Destroy gui
		this.gui.cleanup();
	}

	Mode4D.prototype.handleEvent = function(event) {
		if(event.type == 'resize') {
			this.util.ResizeScenes(this);
		}
	}



	Mode4D.prototype.animate = function(){
		// Toggle axes visibility
		if(window.Keyboard.isKeyDown("G") && !this.pressedHide){
			this.pressedHide = true;
			this.SetGridAndAxesVisible(!this.gridIsVisible);
		}
		if(!window.Keyboard.isKeyDown("G"))
			this.pressedHide = false;
		

		if(this.current_mode == "convex-hull" && this.leftMesh){
			// XW rotation
			if(window.Keyboard.isKeyDown('A')){
				this.leftMesh.angleSpeed.x ++;
			}
			if(window.Keyboard.isKeyDown('D')){
				this.leftMesh.angleSpeed.x --;
			}
			// YW rotation
			if(window.Keyboard.isKeyDown('W')){
				this.leftMesh.angleSpeed.y ++;
			}
			if(window.Keyboard.isKeyDown('S')){
				this.leftMesh.angleSpeed.y --;
			}
			// ZW rotation
			if(window.Keyboard.isKeyDown('Q')){
				this.leftMesh.angleSpeed.z ++;
			}
			if(window.Keyboard.isKeyDown('E')){
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
		this.leftRenderer.render( this.leftScene, this.leftCamera );
		this.rightRenderer.render( this.rightScene, this.rightCamera );
	}

	scope.Mode4D = Mode4D;
	return Mode4D;

})(typeof exports === 'undefined' ? {} : exports);
