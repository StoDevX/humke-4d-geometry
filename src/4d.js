var Mode4D = (function (scope) {
	//Constructor
	function Mode4D(document){
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
	Mode4D.prototype.init = function(div,gui){
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
	    gui.init("4D",this.callbacks,this);
	    this.gui = gui;

	    // Set up left view
		this.leftView = new THREE.Scene();
		this.leftCamera = new THREE.PerspectiveCamera( 75, viewWidth / window.innerHeight, 0.1, 1000 );
		this.leftCamera.position.set(5,10,20);
		this.leftRenderer = new THREE.WebGLRenderer({ antialias: true });
		this.leftRenderer.setClearColor(0xffffff);
		this.leftRenderer.setSize( viewWidth, window.innerHeight );
		leftChild.appendChild( this.leftRenderer.domElement );

		this.leftControls = new THREE.OrbitControls( this.leftCamera, this.leftRenderer.domElement );
		this.leftControls.enableKeys = false;

		var GridHelper = new Grid();

		var grid = GridHelper.CreateGrid("XZ");
		this.leftView.add(grid);

		var axis = GridHelper.CreateAxis("X");
		this.leftView.add(axis);
		axis = GridHelper.CreateAxis("Y");
		this.leftView.add(axis);
		axis = GridHelper.CreateAxis("Z");
		this.leftView.add(axis);
		axis = GridHelper.CreateAxis("W");
		this.leftView.add(axis);

		var leftXLabel = GridHelper.CreateLabel("X",12,0,0);
		this.leftView.add(leftXLabel);
		var leftYLabel = GridHelper.CreateLabel("Y",0,12,0);
		this.leftView.add(leftYLabel);
		var leftZLabel = GridHelper.CreateLabel("Z",0,0,12);
		this.leftView.add(leftZLabel);
		var leftWLabel = GridHelper.CreateLabel("W",5,10,-5);
		this.leftView.add(leftWLabel);

		this.rightView = new THREE.Scene();
		this.rightCamera = new THREE.PerspectiveCamera( 75, viewWidth / window.innerHeight, 0.1, 1000 );
		this.rightCamera.position.set(5,10,20);
		this.rightRenderer = new THREE.WebGLRenderer({ antialias: true });
		this.rightRenderer.setClearColor(0xffffff);
		this.rightRenderer.setSize( viewWidth, window.innerHeight );
		rightChild.appendChild( this.rightRenderer.domElement );

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

		var rightXLabel = GridHelper.CreateLabel("X",12,0,0);
		this.rightView.add(rightXLabel);
		var rightYLabel = GridHelper.CreateLabel("Y",0,12,0);
		this.rightView.add(rightYLabel);
		var rightZLabel = GridHelper.CreateLabel("Z",0,0,12);
		this.rightView.add(rightZLabel);

		this.animate();

		// Draw our main shape
		this.setMode()


	}

	Mode4D.prototype.setMode = function(){
		var params = this.gui.params
		//Switch the mode based on the gui value
		if(this.current_mode != null){
			//Clean up previous
			if(this.current_mode == "cartesian") this.cleanupCartesian_Section();
		}
		this.current_mode = params.source;
		//Init new
		if(this.current_mode == "cartesian") this.initCartesian_Section();
	}

	Mode4D.prototype.callbacks = {
		'source': function(self,val){
			self.setMode();
			self.gui.params.render_shape = true; //Reset this back to true
		},
		'resolution': function(self,val){
			self.cleanupCartesian_Section();
			self.initCartesian_Section();
		},
		'equation': function(self,val){
			self.cleanupCartesian_Section();
			self.initCartesian_Section();
		},
		'axis_value': function(self,val){
			self.cleanupCartesian_Section();
			self.initCartesian_Section();
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

	Mode4D.prototype.initCartesian_Section = function(){
		/* To draw a section of a 4d cartesian:
			- Grab the equation
			- Replace the axis variable with the axis value
			- Draw that 3D shape
		*/
		var equation = this.gui.params.equation
		var axis_variable = this.gui.params.axis.toLowerCase()
		equation = equation.replace(new RegExp(axis_variable,'g'), "(" + this.gui.params.axis_value + ")")
		var variables = ["x","y","z","w"];
		for(var i=0;i<variables.length;i++){
			if(variables[i] == axis_variable)
				variables.splice(i,1);
		}

		var triangleArray = this.polygonizeCartesian(equation,this.gui.params.resolution,variables);

		// TODO: Rendering cartesian

	}
	Mode4D.prototype.cleanupCartesian_Section = function(){
		// TODO: Cleanup cartesian
	}

	//Destroys everything created
	Mode4D.prototype.cleanup = function(){
		// TODO: Propr cleanup with removal of animationFrame and all 

		// Remove the two child divs
		this.leftChild.parentNode.removeChild(this.leftChild);
		this.rightChild.parentNode.removeChild(this.rightChild);

		// Destroy gui
		this.gui.cleanup();
	}

	Mode4D.prototype.animate = function(){
		requestAnimationFrame( this.animate.bind(this) );
		this.leftRenderer.render( this.leftView, this.leftCamera );
		this.rightRenderer.render( this.rightView, this.rightCamera );
	}

	scope.Mode4D = Mode4D;
	return Mode4D;

})(typeof exports === 'undefined' ? {} : exports);
