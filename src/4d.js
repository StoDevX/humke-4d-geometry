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
			let axisMap = {'X':0,'Y':1,'Z':2,'W':3}
			self.intersectionPlane.uniforms.axis.value = axisMap[val];

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
		console.log("Hyperplane",mesh);

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

		////////////// TESTING 4D SOLID PROJECTION 
		/* 
			- Given any 4D set of points, we want to draw a solid shape.
			- This is just facets (a cube or a tetrahedron) so we can construct the correct faces & normals using ConvexGeometry in 3D 
			- Now we need to do a projection. Take the W coordinate as a new attribute, and use that to project 

			* Ex: to construct the XYZ cube, create a normal cube at XYZ with one specific W value that you then change as the axis sweeps
			* To construct the YZW cube, again create the normal XYZ cube just like above. 
				EXCEPT in the projection, re-interpret the coordinates:
				
				x -> w
				y -> y
				z -> z
				w -> x 

				Such that what you've got now is actually a cube that spans YZW, with a free motion along the X controlled by the axis 

				This way, for all intents and purposes, you're always controlling the XYZ cube and moving it along W 
				but only in the projection do you deal with 4D world space and interpret the coordinates differently 
		*/
		/*var vector3Array = [];
		var vector4Array = [];
		var points = [{x:0,y:0,z:0,w:-5},{x:5,y:0,z:0,w:0},{x:5,y:0,z:5,w:-5},{x:2,y:5,z:2,w:0}]
		// Generate 4D cube  
		points =  [];
		for(let x = 0;x <= 1;x++){
			for(let y = 0;y <= 1;y++){
				for(let z = 0;z <= 1;z++){
					//for(let w = 0;w <= 1;w++){
						var min = -10;
						var max = 10;
						var X = x * (max - min) + min;
						var Y = y * (max - min) + min;
						var Z = z * (max - min) + min;

						points.push({x:X,y:Y,z:Z,w:10})	
					//}
				}
			}
		}

		for(var i=0;i<points.length;i++){
			var p = points[i];
			var vec3 = new THREE.Vector3(p.x,p.y,p.z);
			var vec4 = new THREE.Vector4(p.x,p.y,p.z,p.w);
			vector3Array.push(vec3);
			vector4Array.push(vec4);
		}
		var geometry = new THREE.ConvexBufferGeometry( vector3Array );
		var vertexShader = `
			
			precision mediump float;
			precision mediump int;
			uniform mat4 modelViewMatrix; // optional
			uniform mat4 projectionMatrix; // optional
			attribute vec3 position;

			uniform float time;
			uniform float axis;
			attribute float W;

			void main() {
				// Attempting to reinterpet coordinates based on the axis value 
				// axis = 0 -> (w,y,z, x)
				// axis = 1 -> (x,w,z, y)
				// axis = 2 -> (x,y,w, z)
				// axis = 3 -> (x,y,z, w)

				float Wcoordinate;
				vec3 newPos;

				if(axis == 0.0) {
					newPos = vec3(W,position.yz);
					Wcoordinate = position.x;
					newPos.x  -= abs(1.0 - cos(time/2.0)) * 10.0;
				}
				if(axis == 1.0) {
					newPos = vec3(position.x,W,position.z);
					Wcoordinate = position.y;
					newPos.y  -= abs(1.0 - cos(time/4.0)) * 20.0;
				}
				if(axis == 2.0) {
					newPos = vec3(position.xy,W);
					Wcoordinate = position.z;
					newPos.z  -= abs(1.0 - cos(time/4.0)) * 20.0;
				}
				if(axis == 3.0) {
					newPos = position.xyz;
					Wcoordinate = W;
					Wcoordinate = abs(1.0 - cos(time/4.0)) * 20.0;
				}

				

				float Lw = 1.0 / (11.0 - Wcoordinate);
				mat3 projection4DMatrix;
				projection4DMatrix[0] = vec3(Lw,0.,0.);
				projection4DMatrix[1] = vec3(0.,Lw,0.);
				projection4DMatrix[2] = vec3(0.,0.,Lw);


				newPos = projection4DMatrix * newPos;

				gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos,1.0);
			}
		`;

		var fragmentShader =`
			precision mediump float;
			precision mediump int;

			void main(){
				vec4 color = vec4(1.0,0.0,0.0,0.5);
				
				gl_FragColor = color;
			}
		`;

		var uniforms = {
			time: { type: "f", value: 0 },
			axis: { type: "f", value: 0 }
		};

		var material = new THREE.RawShaderMaterial({
			fragmentShader: fragmentShader,
			vertexShader: vertexShader,
			uniforms: uniforms,
			transparent:true
		});

		var container = new THREE.Object3D();

		var cube = new THREE.Mesh( geometry, material );
		container.add(cube);
		// Add the W attribute 
		var posAttribute = geometry.getAttribute("position");
		var Wpositions = [];
		for(var i=0;i<posAttribute.array.length;i+=posAttribute.itemSize){
			var x = posAttribute.array[i];
			var y = posAttribute.array[i+1];
			var z = posAttribute.array[i+2];
			var w = 0;
			for(var j=0;j<points.length;j++){
				var p = points[j];
				if(p.x == x && p.y == y && p.z == z){
					w = p.w;
					break;
				}
			}
			
			Wpositions.push(w);
		}
		geometry.addAttribute( 'W', new THREE.Float32BufferAttribute( Wpositions, 1 ));

		// All edges points in a tetrahedron are paired 
		var edges = [];
		// for(var i=0;i<vector4Array.length;i++){
		// 	for(var j=i+1;j<vector4Array.length;j++){
		// 		edges.push(vector4Array[i]);
		// 		edges.push(vector4Array[j]);
		// 	}
		// }
		// All edges that agree on all but one coordinate are connected in a cube 
		for(var i=0;i<vector4Array.length;i++){
			var p = vector4Array[i];
			for(var j=0;j<vector4Array.length;j++){
				if(i == j) continue;
				var p2 = vector4Array[j];
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
		var wireframe = this.projector.Wireframe4D(vector4Array,edges);
		container.add(wireframe);

		this.leftMesh = container;
		this.leftScene.add(this.leftMesh);
		this.leftMesh.uniforms = uniforms;*/

		/////////////////// END 4D SOLID PROJECTION
	}

	Mode4D.prototype.computeProjection = function(points,facets){
		var new_points = [];
		var scale = 1;
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
			self.cleanupLeftMesh();
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

		//Obtain facets that cover the surface
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
