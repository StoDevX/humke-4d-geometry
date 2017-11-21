var Mode3D = (function (scope) {
	//Constructor
	function Mode3D(document){
		this.document = document;

		this.animId = null;

		this.leftScene = null;
		this.leftCamera = null;
		this.leftRenderer = null;
		this.leftControls = null;
		this.leftMesh = null;

		this.rightScene = null;
		this.rightCamera = null;
		this.rightRenderer = null;
		this.rightControls = null;

		this.leftMesh = null;
		this.rightMesh = null;

		this.labels = [];
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

		this.leftScene = new THREE.Scene();
		this.leftCamera = new THREE.PerspectiveCamera( 75, viewWidth / window.innerHeight, 0.1, 1000 );
		this.leftCamera.position.set(5,10,20);
		this.leftRenderer = new THREE.WebGLRenderer({ canvas: leftCanvas, antialias: true });
		this.leftRenderer.setClearColor(0xffffff);
		this.leftRenderer.setSize( viewWidth, window.innerHeight );

		this.leftControls = new THREE.OrbitControls( this.leftCamera, this.leftRenderer.domElement );
		this.leftControls.enableKeys  = false;

		var GridHelper = new Grid();
		var grid = GridHelper.CreateGrid("XZ");
		this.leftScene.add(grid);

		var axis = GridHelper.CreateAxis("X");
		this.leftScene.add(axis);
		axis = GridHelper.CreateAxis("Y");
		this.leftScene.add(axis);
		axis = GridHelper.CreateAxis("Z");
		this.leftScene.add(axis);

		var leftXLabel = GridHelper.CreateLabel("X",12,0,0); this.labels.push(leftXLabel);
		this.leftScene.add(leftXLabel);
		var leftYLabel = GridHelper.CreateLabel("Y",0,12,0); this.labels.push(leftYLabel);
		this.leftScene.add(leftYLabel);
		var leftZLabel = GridHelper.CreateLabel("Z",0,0,12); this.labels.push(leftZLabel);
		this.leftScene.add(leftZLabel);

		this.rightScene = new THREE.Scene();
		this.rightCamera = new THREE.PerspectiveCamera( 75, viewWidth / window.innerHeight, 0.1, 1000 );
		this.rightCamera.position.set(0,0,20);
		this.rightRenderer = new THREE.WebGLRenderer({ canvas: rightCanvas, antialias: true });
		this.rightRenderer.setClearColor(0xffffff);
		this.rightRenderer.setSize( viewWidth, window.innerHeight );

		this.rightControls = new THREE.OrbitControls( this.rightCamera, this.rightRenderer.domElement );
		this.rightControls.enableRotate = true;
		this.rightControls.enableKeys  = false;

		grid = GridHelper.CreateGrid("XY");
		this.rightScene.add(grid);

		axis = GridHelper.CreateAxis("X");
		this.rightScene.add(axis);
		axis = GridHelper.CreateAxis("Y");
		this.rightScene.add(axis);

		var rightXLabel = GridHelper.CreateLabel("X",12,0,0);
		this.rightXLabel = rightXLabel;
		this.rightScene.add(rightXLabel);
		var rightYLabel = GridHelper.CreateLabel("Z",0,12,0);
		this.rightYLabel = rightYLabel;
		this.rightScene.add(rightYLabel);
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
		this.slicer = new Slicing();

		this.intersectionPlane = this.CreateIntersectionPlane();
		this.intersectionPlane.position.y = this.gui.params.axis_value;
		this.leftScene.add(this.intersectionPlane);

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
				let label = this.rightXLabel;
				label.ctx.clearRect(0,0,label.canvas.width,label.canvas.height);
				label.ctx.fillText( "X", label.canvas.width/2, label.canvas.height/2);

				label = this.rightYLabel;
				label.ctx.clearRect(0,0,label.canvas.width,label.canvas.height);
				label.ctx.fillText( "Z", label.canvas.width/2, label.canvas.height/2);
			}
			if(newAxis == "X"){
				this.rotation.z = Math.PI/2;

				let label = this.rightXLabel;
				label.ctx.clearRect(0,0,label.canvas.width,label.canvas.height);
				label.ctx.fillText( "Y", label.canvas.width/2, label.canvas.height/2);

				label = this.rightYLabel;
				label.ctx.clearRect(0,0,label.canvas.width,label.canvas.height);
				label.ctx.fillText( "Z", label.canvas.width/2, label.canvas.height/2);
			}
			if(newAxis == "Z"){
				this.rotation.x = Math.PI/2;

				let label = this.rightXLabel;
				label.ctx.clearRect(0,0,label.canvas.width,label.canvas.height);
				label.ctx.fillText( "X", label.canvas.width/2, label.canvas.height/2);

				label = this.rightYLabel;
				label.ctx.clearRect(0,0,label.canvas.width,label.canvas.height);
				label.ctx.fillText( "Y", label.canvas.width/2, label.canvas.height/2);
			}

			this.rightXLabel.material.map.needsUpdate = true;
			this.rightYLabel.material.map.needsUpdate = true;
			this.axis = newAxis;


		}

		mesh.axis = "Y";
		mesh.rightYLabel = this.rightYLabel;
		mesh.rightXLabel = this.rightXLabel;

		return mesh;
	}

	Mode3D.prototype.ComputeSlicesCPU = function(){
		
		
		// re-Compute intersection on the CPU
		var axis = this.gui.params.axis;
		var axisValue = this.gui.params.axis_value;
		var color = this.gui.colors.slices;

		if(this.current_mode == "convex-hull" || this.current_mode == "parametric"){
			if(this.rightMesh){
				this.rightScene.remove(this.rightMesh);	
			}

			var outline = false;
			if(this.current_mode == "parametric") outline = true;
			this.rightMesh = this.slicer.SliceConvex3D(this.leftMesh,axis,axisValue,color,outline);

			if (this.rightMesh != null) {
				this.rightScene.add(this.rightMesh);
				this.rightMesh.position.z = 0.1;
			}
		}
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

			if(self.current_mode == "cartesian"){
				self.cleanupLeftMesh();
				self.initCartesian();
			}


			self.intersectionPlane.flip(val);

			self.ComputeSlicesCPU();
		},
		'axis_value': function(self,val){
			self.uniforms.axisValue.value = val;
			self.intersectionPlane.updatePosition(val);

			self.ComputeSlicesCPU();
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
		'show left view': function(self,val){
			var l = document.querySelector("#left-view");
			var r = document.querySelector("#right-view");
			if (!(l.style.display) || l.style.display == "block") {
				l.style.display = "none";
				r.style.margin = "0 auto";
			} else {
				l.style.display = "block";
				delete r.style.margin;
			}
		},
		'show right view': function(self,val){
			var l = document.querySelector("#left-view");
			var r = document.querySelector("#right-view");
			if (!(r.style.display) || r.style.display == "block") {
				r.style.display = "none";
				l.style.margin = "0 auto";
			} else {
				r.style.display = "block";
				delete l.style.margin;
			}
		},
		'fill': function(self,val){

			self.ComputeSlicesCPU();
		},
		'source': function(self,val){
			self.setMode();

			self.gui.params.render_shape = true; //Reset this back to true
			self.gui.params.render_slices = false; //Reset this back to false
			updateRenderShape(self,val,1);
			updateRenderSlices(self,val,0);

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

		var res = 20;
		if (this.gui.params.resolution == "high") var res = 112;
		else if (this.gui.params.resolution == "medium") var res = 60;

		var mesh = this.projector.PolygonizeCartesian3D(equation,res,projectingColor);
		if(mesh){
			this.leftMesh = mesh;
			this.leftScene.add(this.leftMesh);
		}

		// Now to slice it, we just render a 2D cartesian and plug in the value for the remaining variable
		var newEquation = equation;
		var axis = this.gui.params.axis.toLowerCase();
		var axisValue = this.gui.params.axis_value;
		var re = new RegExp(axis,'g');
		newEquation = newEquation.replace(re,"(axisValue)");

		if(axis == "z"){
			// Nothing needs to be subsituted
		}
		if(axis == "x"){
			// That means we have "y" and "z" remaining
			// let's replace "z" with "x"
			newEquation = newEquation.replace(/z/g,"x");

		}
		if(axis == "y"){
			// We have "x" and "z" left
			newEquation = newEquation.replace(/z/g,"y");
		}

		var output = this.util.ConstructGLSLFunction(newEquation);
		var glslFuncString = output[0];

		this.uniforms = {
			axisValue: { type: "f", value: axisValue }
		};
		this.rightMesh = this.slicer.CartesianSlice3D(glslFuncString,this.uniforms,this.util.HexToRgb(this.gui.colors.slices));
		this.rightMesh.position.z = 0.1;
		this.rightScene.add(this.rightMesh);

	}

	Mode3D.prototype.initParametric = function(){

		var xFunction = this.gui.params.param_eq_x;
		var yFunction = this.gui.params.param_eq_y;
		var zFunction = this.gui.params.param_eq_z;

		var aParamRange = this.gui.params.param_a;
		var bParamRange = this.gui.params.param_b;

		var parametricFunction = this.projector.CreateParametricFunction(xFunction,yFunction,zFunction,aParamRange,bParamRange);

		this.leftMesh = this.projector.ParametricMesh3D(parametricFunction,this.gui.colors.projections);
		this.leftScene.add( this.leftMesh );

		this.ComputeSlicesCPU();

		// Slicing with Shader
		// this.rightMesh = this.projector.ParametricMesh3D(parametricFunction,this.gui.colors.slices);
		// this.rightScene.add( this.rightMesh );

		// var axisValue = this.gui.params.axis_value;
		// this.uniforms = {
		// 	axisValue: { type: "f", value: axisValue }
		// };
		// var ShaderMaterial = this.slicer.CreateSliceShader3D(this.uniforms,this.util.HexToRgb(this.gui.colors.slices));

		// this.rightMesh.material = ShaderMaterial;

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
		this.leftScene.add( this.leftMesh );

		this.ComputeSlicesCPU();
	}

	//  >>>>>>>>>>> Destroy the shared leftMesh mesh.
	Mode3D.prototype.cleanupLeftMesh = function(){
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
	Mode3D.prototype.cleanup = function(){
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

		// Destroy gui
		this.gui.cleanup();
	}

	Mode3D.prototype.handleEvent = function(event) {
		if(event.type == 'resize') {
			this.util.ResizeScenes(this);
		}
	}

	Mode3D.prototype.animate = function(){
		for(var i=0;i<this.labels.length;i++)
			this.labels[i].quaternion.copy(this.leftCamera.quaternion);

		this.animId = requestAnimationFrame( this.animate.bind(this) );
		this.leftRenderer.render( this.leftScene, this.leftCamera );
		this.rightRenderer.render( this.rightScene, this.rightCamera );
	}

	scope.Mode3D = Mode3D;
	return Mode3D;

})(typeof exports === 'undefined' ? {} : exports);