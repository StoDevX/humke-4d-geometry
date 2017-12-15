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

			var facets = this.leftMesh.rawFacets; // This is computed when the mesh is first created 
			this.rightMesh = this.slicer.SliceConvex4D(this.leftMesh,facets,axis,axisValue,color);

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
			let axisMap = {'X':0,'Y':1,'Z':2,'W':3}
			self.intersectionPlane.uniforms.axis.value = axisMap[val];
			self.intersectionPlane.wireframe.uniforms.axis.value = self.intersectionPlane.uniforms.axis.value;

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
			self.intersectionPlane.uniforms.axisValue.value = val;
			self.intersectionPlane.wireframe.uniforms.axisValue.value = val;

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

		// Make points of cube 
		let points =  [];
		for(let x = 0;x <= 1;x++){
			for(let y = 0;y <= 1;y++){
				for(let z = 0;z <= 1;z++){
					var min = -5;
					var max = 5;
					var X = x * (max - min) + min;
					var Y = y * (max - min) + min;
					var Z = z * (max - min) + min;

					points.push(new THREE.Vector4(X,Y,Z,0));	
				}
			}
		}

		var geometry = new THREE.ConvexBufferHyperGeometry(points);
		var material = new THREE.HyperMaterial({color:new THREE.Color(color)});
		var mesh = new THREE.Mesh(geometry,material);

		this.leftScene.add(mesh);
		mesh.uniforms = material.uniforms;
		let axisMap = {'X':0,'Y':1,'Z':2,'W':3};
		mesh.uniforms.axis.value = axisMap[this.gui.params.axis];
		mesh.uniforms.axisValue.value = 0;

		// Also create a wireframe!
		// All edges that agree on all but one coordinate are connected in a cube 
		var edges = [];
		for(var i=0;i<points.length;i++){
			var p = points[i];
			for(var j=0;j<points.length;j++){
				if(i == j) continue;
				var p2 = points[j];
				// For two points to be connected, they must share exactly 3 coordinates 
				// xyz, xyw, xzw, yzw 
				if(p.x == p2.x && p.y == p2.y && p.z == p2.z ||
				   p.x == p2.x && p.y == p2.y && p.w == p2.w ||
				   p.y == p2.y && p.z == p2.z && p.w == p2.w ||
				   p.x == p2.x && p.z == p2.z && p.w == p2.w ){

					edges.push(p);
					edges.push(p2);
				}
			}
		}
		var wireframeMesh = this.projector.Wireframe4D(points,edges,new THREE.Color(color));
		this.leftScene.add(wireframeMesh);
		mesh.wireframe = wireframeMesh;
		mesh.wireframe.uniforms.axis.value = mesh.uniforms.axis.value;

		return mesh;
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

		var color = this.gui.colors.slices;

		var mesh = this.projector.PolygonizeCartesian3D(equation,resolution,color,variables);
		if(mesh){
			this.rightMesh = mesh;
			this.rightScene.add(this.rightMesh);
		}

		

	}	

	Mode4D.prototype.initConvexHull = function(){
		var pointsRaw = this.util.ParseConvexPoints(this.gui.params.points);
		var projectingColor = new THREE.Color(this.gui.colors.projections);

		// Convert the points into Vector3 objects:
		var points = [];

		for(var i=0;i<pointsRaw.length;i++){
			var rawPoint = pointsRaw[i];
			var newPoint = new THREE.Vector4(rawPoint.x,rawPoint.y,rawPoint.z,rawPoint.w);
			points.push(newPoint);
		}
	
			
		var CHull4D = new QuickHull4D();

		var facets = CHull4D.ComputeHull(points);
		// Just construct the wireframe here 
		var final_points = [];
		var final_edges = [];
		
		for(var i=0;i<facets.length;i++){
			var f = facets[i];
			for(var j=0;j<f.edges.length;j++){
				final_edges.push(f.edges[j][0],f.edges[j][1]);
			}
			for(var j=0;j<f.vertices.length;j++){
				final_points.push(f.vertices[j]);
			}
		}

		var container = new THREE.Object3D();

		var mesh = this.projector.Wireframe4D(final_points,final_edges,projectingColor);
		this.leftMesh = container;
		container.uniforms = mesh.uniforms;
		container.baseVectors = mesh.baseVectors;
		container.updateMatrixFromRotors = mesh.updateMatrixFromRotors;
		container.add(mesh);
		
		this.leftMesh.rawFacets = facets;

		// Create solid facets too 
		// for(var i=0;i<facets.length;i++){
		// 	var F = facets[i];
		// 	var geometry = new THREE.ConvexBufferHyperGeometry(F.vertices);
		// 	var material = new THREE.HyperMaterial({color:projectingColor});
		// 	var mesh = new THREE.Mesh(geometry,material);
		// 	container.add(mesh);
		// }

		this.leftScene.add(this.leftMesh);
		this.ComputeSlicesCPU();
	}


	Mode4D.prototype.cleanupLeftMesh = function(){
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


		if(this.leftMesh && this.leftMesh.updateMatrixFromRotors){
			let rotationSpeed = 0.05; 
			// XW rotation
			let rotorXW = E4.Rot(Math.cos(0), 0 , 0, 0, Math.sin(0), 0, 0);

			if(window.Keyboard.isKeyDown('A')){
				rotorXW = E4.Rot(Math.cos(rotationSpeed/2), 0 , 0, 0, Math.sin(rotationSpeed/2), 0, 0);
			}
			if(window.Keyboard.isKeyDown('D')){
				rotorXW = E4.Rot(Math.cos(-rotationSpeed/2), 0 , 0, 0, Math.sin(-rotationSpeed/2), 0, 0);
			}
			

			// YW rotation
			let rotorYW = E4.Rot(Math.cos(0), 0 , 0, 0, 0, Math.sin(0), 0);
			if(window.Keyboard.isKeyDown('W')){
				rotorYW = E4.Rot(Math.cos(rotationSpeed/2), 0 , 0, 0, 0, Math.sin(rotationSpeed/2), 0);
			}
			if(window.Keyboard.isKeyDown('S')){
				rotorYW = E4.Rot(Math.cos(-rotationSpeed/2), 0 , 0, 0, 0, Math.sin(-rotationSpeed/2), 0);
			}
			
			// ZW rotation
			let rotorZW = E4.Rot(Math.cos(0), 0 , 0, 0, 0, 0, Math.sin(0));
			if(window.Keyboard.isKeyDown('Q')){
				rotorZW = E4.Rot(Math.cos(rotationSpeed/2), 0 , 0, 0, 0, 0, Math.sin(rotationSpeed/2));
			}
			if(window.Keyboard.isKeyDown('E')){
				rotorZW = E4.Rot(Math.cos(-rotationSpeed/2), 0 , 0, 0, 0, 0, Math.sin(-rotationSpeed/2));
			}
			

			// XY rotation
			let rotorXY = E4.Rot(Math.cos(0), Math.sin(0) , 0, 0, 0, 0, 0);

			if(window.Keyboard.isKeyDown('J')){
				rotorXY = E4.Rot(Math.cos(rotationSpeed/2), Math.sin(rotationSpeed/2) , 0, 0, 0, 0, 0);
			}
			if(window.Keyboard.isKeyDown('L')){
				rotorXY = E4.Rot(Math.cos(-rotationSpeed/2), Math.sin(-rotationSpeed/2) , 0, 0, 0, 0, 0);
			}
			

			// XZ rotation
			let rotorXZ = E4.Rot(Math.cos(0), 0 , Math.sin(0), 0, 0, 0, 0);

			if(window.Keyboard.isKeyDown('U')){
				rotorXZ = E4.Rot(Math.cos(rotationSpeed/2), 0 , Math.sin(rotationSpeed/2), 0, 0, 0, 0);
			}
			if(window.Keyboard.isKeyDown('O')){
				rotorXZ = E4.Rot(Math.cos(-rotationSpeed/2), 0 , Math.sin(-rotationSpeed/2), 0, 0, 0, 0);
			}


			// YZ rotation
			let rotorYZ = E4.Rot(Math.cos(0), 0 , 0, Math.sin(0), 0, 0, 0);
			if(window.Keyboard.isKeyDown('I')){
				rotorYZ = E4.Rot(Math.cos(rotationSpeed/2), 0 , 0, Math.sin(rotationSpeed/2), 0, 0, 0);
			}
			if(window.Keyboard.isKeyDown('K')){
				rotorYZ = E4.Rot(Math.cos(-rotationSpeed/2), 0 , 0, Math.sin(-rotationSpeed/2), 0, 0, 0);
			}
			

			this.leftMesh.updateMatrixFromRotors(this.leftMesh,rotorXY,rotorXZ,rotorYZ,rotorXW,rotorYW,rotorZW)
			// Apply the same rotation to the hyperplane 
			this.intersectionPlane.uniforms.rotationMatrix.value = this.leftMesh.uniforms.rotationMatrix.value;
			this.intersectionPlane.wireframe.uniforms.rotationMatrix.value = this.leftMesh.uniforms.rotationMatrix.value;

		}

		for(var i=0;i<this.labels.length;i++)
			this.labels[i].l.quaternion.copy(this.labels[i].c.quaternion);

		this.animId = requestAnimationFrame( this.animate.bind(this) );
		this.leftRenderer.render( this.leftScene, this.leftCamera );
		this.rightRenderer.render( this.rightScene, this.rightCamera );
	}

	scope.Mode4D = Mode4D;
	return Mode4D;

})(typeof exports === 'undefined' ? {} : exports);