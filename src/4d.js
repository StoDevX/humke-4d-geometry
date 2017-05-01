var Mode4D = (function (scope) {
	//Constructor
	function Mode4D(document){
		this.document = document;

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
		var leftView = this.createView(leftChild,viewWidth);
		var rightView = this.createView(rightChild,viewWidth);
		this.originalLeftView = leftView;
		this.leftView = leftView;
		this.rightView = rightView;

		// Init gui
	    gui.init("4D",this.callbacks,this);
	    this.gui = gui;

	    // Set up left view
		var camera = leftView.camera({
		  proxy: true, // this alows interactive camera controls to override the position
		  position: [0, 1, 3],
		})
	
		 var rot_matrix = [
	        1, 0, 0, .577,
	        0, 1, 0, .577,
	        0, 0, 1, .577,
	        0, 0, 0, 1,
	      ]

		leftView = leftView.transform4({
			matrix: rot_matrix,
		}).cartesian4({
		  range: [[-10,10], [-10,10],[-10,10], [-10,10]],
		  scale: [1,1,1,1],
		});


		leftView
		  .axis({
		    axis: 1,
		    width: 4,
		    color:'black',
		  })
		  .axis({
		    axis: 2,
		    width: 4,
		    color:'black',
		  })
		  .axis({
		    axis: 3,
		    width: 4,
		    color:'black',
		  })
			.axis({
		    axis: 4,
		    width: 4,
		    color:'black',
		  })
		  .grid({
		    axes: [1,3],
		    width: 1,
		    divideX: 10,
		    divideY: 10
		  });

		 // Add text
		leftView.array({
			data: [[12,0,0,0], [0,12,0,0], [0,0,12,0], [0,0,0,12]],
		  channels: 4, // necessary
		  live: false,
		}).text({
		  data: ["x", "y","z","w"],
		}).label({
		  color: 0x000000,
		});

		this.leftView = leftView;


		// Set up right view
		rightView = rightView.cartesian({
		  range: [[-10, 10],[-10,10],[-10,10]],
		  scale: [1, 1,1],
		});

		rightView = rightView.transform({
		  position: [0, 0, 0,0],
		  rotation: [0,0,0]
		});

		rightView.camera({
		  proxy: true, // this alows interactive camera controls to override the position
		  position: [0, 1, 3],
		})
		 .axis({
		    axis: 1,
		    width: 4,
		    color:'black',
		  })
		  .axis({
		    axis: 2,
		    width: 4,
		    color:'black',
		  })
		  .axis({
		    axis: 3,
		    width: 4,
		    color:'black',
		  })
		  .grid({
		    axes: [1,3],
		    width: 1,
		    divideX: 10,
		    divideY: 10
		  })
		  .array({
		  data: [[11,1,0], [0,12,0],[0,0,11]],
		  channels: 3, // necessary
		  live: false,
		}).text({
		  data: ["x", "y","z"],
		}).label({
		  color: 0x000000,
		});

		this.rightView = rightView


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

	Mode4D.prototype.createView = function(el,width){
		var mathbox = mathBox({
		  element: el,
		  size: {width:width,height:window.innerHeight-50},
	      plugins: ['core', 'controls', 'cursor', 'mathbox'],
	      controls: {
	        // Orbit controls, i.e. Euler angles, with gimbal lock
	        klass: THREE.OrbitControls,
	        // Trackball controls, i.e. Free quaternion rotation
	        //klass: THREE.TrackballControls,
	        parameters: {
		      noKeys: true // Disable arrow keys to move the view
		    }
	      },
	    });
	    if (mathbox.fallback) throw "WebGL not supported"
	    // Set the renderer color
		mathbox.three.renderer.setClearColor(new THREE.Color(0xFFFFFF), 1.0);
		return mathbox;
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

		this.rightView.array({
			width: triangleArray.length/3,
			items: 3,
			channels: 3,
			data: triangleArray,
			id: "cartesian_section_triangle_data"
		});

		this.rightView.face({
			points: "#cartesian_section_triangle_data",
			color: this.gui.colors.data,
			width: 5,
			opacity: 1,
			shaded: true,
			id: "cartesian_section_geometry"
		});

	}
	Mode4D.prototype.cleanupCartesian_Section = function(){
		this.rightView.remove("#cartesian_section_triangle_data");
		this.rightView.remove("#cartesian_section_geometry");
	}

	//Destroys everything created
	Mode4D.prototype.cleanup = function(){
		// Destroy mathbox overlays
		var overlays = this.document.querySelector(".mathbox-overlays");
		overlays.parentNode.removeChild(overlays);
		// Destroy the canvas element
		var canvas = this.document.querySelector("canvas");
		canvas.parentNode.removeChild(canvas);
		// Remove the two child divs
		this.leftChild.parentNode.removeChild(this.leftChild);
		this.rightChild.parentNode.removeChild(this.rightChild);

		// Destroy gui
		this.gui.cleanup();
	}

	scope.Mode4D = Mode4D;
	return Mode4D;

})(typeof exports === 'undefined' ? {} : exports);
