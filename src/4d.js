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
		this.keysDown = {};
		this.keyMap = {'A':65,'D':68,'S':83,'W':87,'Q':81,'E':69}

		this.rightScene = null;
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
		this.leftScene.add(leftXLabel);
		var leftYLabel = GridHelper.CreateLabel("Y",0,12,0); this.addLabel(leftYLabel,this.leftCamera);
		this.leftScene.add(leftYLabel);
		var leftZLabel = GridHelper.CreateLabel("Z",0,0,12); this.addLabel(leftZLabel,this.leftCamera);
		this.leftScene.add(leftZLabel);
		var leftWLabel = GridHelper.CreateLabel("W",5,10,-5); this.addLabel(leftWLabel,this.leftCamera);
		this.leftScene.add(leftWLabel);

		this.rightScene = new THREE.Scene();
		this.rightCamera = new THREE.PerspectiveCamera( 75, viewWidth / window.innerHeight, 0.1, 1000 );
		this.rightCamera.position.set(5,10,20);
		this.rightRenderer = new THREE.WebGLRenderer({ canvas: rightCanvas, antialias: true });
		this.rightRenderer.setClearColor(0xffffff);
		this.rightRenderer.setSize( viewWidth, window.innerHeight );

		this.rightControls = new THREE.OrbitControls( this.rightCamera, this.rightRenderer.domElement );
		this.rightControls.enableKeys = false;

		grid = GridHelper.CreateGrid("XZ");
		this.rightScene.add(grid);

		axis = GridHelper.CreateAxis("X");
		this.rightScene.add(axis);
		axis = GridHelper.CreateAxis("Y");
		this.rightScene.add(axis);
		axis = GridHelper.CreateAxis("Z");
		this.rightScene.add(axis);

		var rightXLabel = GridHelper.CreateLabel("X",12,0,0); this.addLabel(rightXLabel,this.rightCamera);
		this.rightScene.add(rightXLabel);
		var rightYLabel = GridHelper.CreateLabel("Y",0,12,0); this.addLabel(rightYLabel,this.rightCamera);
		this.rightScene.add(rightYLabel);
		var rightZLabel = GridHelper.CreateLabel("Z",0,0,12); this.addLabel(rightZLabel,this.rightCamera);
		this.rightScene.add(rightZLabel);
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

	Mode4D.prototype.ComputeSlicesCPU = function() {

		var axis = this.gui.params.axis;
		var axisValue = this.gui.params.axis_value;
		var color = this.gui.colors.slices;
		if(!this.leftMesh) return;

		if(this.current_mode == "convex-hull") {

			if(this.rightMesh) {
				this.rightScene.remove(this.rightMesh);
			}

		// Testing output from Qhull. This is 16 random points within a unit tesseract
			var points = this.leftMesh.DATA_points;

			var facets = this.leftMesh.DATA_facets;

			//console.log(JSON.stringify(points))
			//console.log(JSON.stringify(facets))

			this.rightMesh = this.slicer.SliceConvex4D(points,facets,axis,axisValue,color);

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
		// var pointsRaw = this.util.ParseConvexPoints(this.gui.params.points);
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

		// We should be passing these points into the 4D projection function
		// But just for testing, we're going to just manually define and pass a tesseract
		// Generate tesseract points
		/*var start = -5;
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
		}*/

		// Flatten the vectorArray
		// var tesseract = [];
		// for(var i=0;i<vectorArray.length;i++){
		// 	var v = vectorArray[i];
		// 	tesseract.push([v.x,v.y,v.z,v.w]);
		// }

		// Format the points so the projector can render them
		// var edges = [];
		// for(var i=0;i<edges_arr.length;i+=4){
		// 	var e = edges_arr;
		// 	var p = {x:e[i],y:e[i+1],z:e[i+2],w:e[i+3]}
		// 	edges.push(p);
		// }

		// Testing output from Qhull. This is 16 random points within a unit tesseract
		// var points = [
		// [0.8143297795339766, 0.440590428598775, -0.9966778149797374, 0.8359636104069312],
		// [0.04038574084675473, 0.7631382697849891, 0.06488647783630208, 0.5470246612532295],
		// [-0.1565304241669647, -0.8068455753911711, -0.6535871109492957, -0.8385764358924482],
		// [0.04584069274909863, 0.4445148496371831, 0.9610665477449694, 0.6454526024362561],
		// [0.1218762687611172, 0.3744402885198968, -0.7820816028696314, -0.4455011351457807],
		// [0.4624172658309502, -0.1530246242443329, 0.1151336972742656, -0.9479586388431104],
		// [-0.3408434431448983, -0.555754094902197, -0.5590764978519422, -0.3987028481426675],
		// [-0.9987734397861859, -0.3852024957399839, -0.09835071312110011, -0.9804424829598912],
		// [-0.2968112596280977, -0.5068460726242942, -0.5619464559126146, -0.6340879515130893],
		// [0.8837960566243119, -0.03969105802447637, 0.9123802677843536, 0.3751456852770836],
		// [-0.926478310419692, 0.6790362016102636, 0.5614273236705245, -0.09098328937867961],
		// [0.8438482990896778, 0.5583483703046557, 0.1610475146780233, 0.7255701075546166],
		// [0.656784166262284, 0.5714694043355708, 0.6862663698254772, 0.07886445995314473],
		// [-0.5250300108688232, -0.1793963892193478, 0.8848799689532072, 0.1776234453335623],
		// [-0.6827634951870549, 0.7939339091944824, -0.3528022080220302, 0.4532847092051848],
		// [0.3560962382295134, 0.9094653110108015, -0.6165327854608491, -0.06652824121204037]]
    //
		// var facets = [
		// [5,10,15,7],
		// [0,5,2,9],
		// [6,0,2,9],
		// [4,5,15,7],
		// [5,4,2,7],
		// [4,5,0,15],
		// [5,4,0,2],
		// [4,6,0,2],
		// [12,5,10,15],
		// [5,12,0,15],
		// [14,4,0,15],
		// [10,14,15,7],
		// [14,4,15,7],
		// [14,4,6,0],
		// [14,6,2,7],
		// [4,14,2,7],
		// [4,14,6,2],
		// [12,11,0,15],
		// [3,11,0,9],
		// [12,11,3,9],
		// [11,5,0,9],
		// [11,12,5,9],
		// [12,11,5,0],
		// [14,1,10,15],
		// [14,1,3,10],
		// [1,12,10,15],
		// [1,12,3,10],
		// [1,11,12,15],
		// [11,1,12,3],
		// [1,14,0,15],
		// [11,1,0,15],
		// [1,14,3,0],
		// [11,1,3,0],
		// [13,14,6,0],
		// [14,13,3,0],
		// [6,13,0,9],
		// [13,3,0,9],
		// [14,13,6,7],
		// [13,14,10,7],
		// [13,14,3,10],
		// [6,13,2,7],
		// [13,6,2,9],
		// [13,5,2,7],
		// [5,13,2,9],
		// [5,13,10,7],
		// [13,12,3,9],
		// [12,13,3,10],
		// [12,13,5,9],
		// [13,12,5,10]
		// ]
    //
    //

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

		this.util.CleanUpScene(this.rightScene);

		this.rightScene = null;
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
		this.leftRenderer.render( this.leftScene, this.leftCamera );
		this.rightRenderer.render( this.rightScene, this.rightCamera );
	}

	scope.Mode4D = Mode4D;
	return Mode4D;

})(typeof exports === 'undefined' ? {} : exports);
