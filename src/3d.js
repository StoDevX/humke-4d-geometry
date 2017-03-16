var Mode3D = (function (scope) {
	//Constructor 
	function Mode3D(document){
		this.document = document; 
		
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
		var leftView = this.createView(leftChild,viewWidth);
		var rightView = this.createView(rightChild,viewWidth);
		this.leftView = leftView;
		this.rightView = rightView;

		// Init gui 
	    gui.init("3D",this.callbacks,this);
	    this.gui = gui;

	    // Set up left view
		var camera = leftView.camera({
		  proxy: true, // this alows interactive camera controls to override the position
		  position: [0, 1, 3],
		})
		leftView = leftView.cartesian({
		  range: [[-10, 10], [-10, 10],[-10,10]],
		  scale: [1, 1,1],
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
		  .grid({
		    axes: [1,3],
		    width: 1, 
		    divideX: 10,
		    divideY: 10        
		  });

		 // Add text
		leftView.array({
		  data: [[11,1,0], [0,12,0],[0,0,11]],
		  channels: 3, // necessary
		  live: false,
		}).text({
		  data: ["x", "y","z"],
		}).label({
		  color: 0x000000,
		});

		this.leftView = leftView;

		// Set up right view
		rightView = rightView.cartesian({
		  range: [[-10, 10],[-10,10]],
		  scale: [1, 1],
		});
		rightView.camera({
		  proxy: true, // this alows interactive camera controls to override the position
		  position: [0, 0, 3],
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
		  .grid({
		    width: 1,
		    divideX: 10,
		    divideY: 10
		  })
		  .array({
		  data: [[11,1], [0,12]],
		  channels: 2, // necessary
		  live: false,
		}).text({
		  data: ["x", "z"],
		}).label({
		  color: 0x000000,
		});

		this.rightView = rightView

		// Draw our main shape
		this.setMode()

		this.CreateViewAxis();
	}

	Mode3D.prototype.createView = function(el,width){
		var mathbox = mathBox({
		  element: el,
		  size: {width:width,height:window.innerHeight-50},
	      plugins: ['core', 'controls', 'cursor', 'mathbox'],
	      controls: {
	        // Orbit controls, i.e. Euler angles, with gimbal lock
	        klass: THREE.OrbitControls,
	        // Trackball controls, i.e. Free quaternion rotation
	        //klass: THREE.TrackballControls,
	      },
	    });
	    if (mathbox.fallback) throw "WebGL not supported"
	    // Set the renderer color 
		mathbox.three.renderer.setClearColor(new THREE.Color(0xFFFFFF), 1.0);
		return mathbox;
	}

	// define a function to be called when each param is updated
	function updateParametricCallback(self,val){
		self.cleanupParametric();
		self.initParametric()
	}

	Mode3D.prototype.callbacks = {
		'source': function(self,val){
			self.setMode();
			self.gui.params.render_shape = true; //Reset this back to true
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

	Mode3D.prototype.CreateViewAxis = function(){
		var params = this.gui.params; 
		this.leftView.array({
				id: "viewing_plane_data",
				channels: 3,
				items: 4,
				width: 1,
				expr: function(emit,i,t){
					var points = [
						[10,10,params.axis_value],
						[-10,10,params.axis_value],
						[-10,-10,params.axis_value],
						[10,-10,params.axis_value]
					];

					var order = {"Z":[0,1,2],"Y":[0,2,1],"X":[2,1,0]}
					for(var j=0;j<points.length;j++){
						emit(points[j][order[params.axis][0]],points[j][order[params.axis][1]],points[j][order[params.axis][2]])
					}
				}
		})

		this.leftView.face({
			color: this.gui.colors.viewing,
			shaded:true,
			points: "#viewing_plane_data",
			id:'viewing_plane_geometry'
		})

	}

	Mode3D.prototype.initCartesian = function(){
		this.polygonizeCartesian();
		if(this.triangleArray == null) return; //Failed to parse 
		var triangleArray = this.triangleArray;
		this.leftView.array({
			width: triangleArray.length/3,
			items: 3,
			channels: 3,
			data: triangleArray,
			id: "cartesian_triangle_data"
		});

		this.leftView.face({
			points: "#cartesian_triangle_data",
			color: this.gui.colors.data,
			width: 5,
			opacity: 1,
			shaded: true,
			id: "cartesian_geometry"
		});
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
		this.leftView.remove("#cartesian_triangle_data");
		this.leftView.remove("#cartesian_geometry");
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

		this.leftView.volume({
			rangeX: a_range,
			rangeY: b_range,
			rangeZ: c_range,
			width: 20,
			height: 20,
			depth: 20,
			expr: function(emit, a,b,c,i,j,k){
				var x = Parser.evaluate(params.param_eq_x,{a:a,b:b,c:c});
				var y = Parser.evaluate(params.param_eq_y,{a:a,b:b,c:c});
				var z = Parser.evaluate(params.param_eq_z,{a:a,b:b,c:c});

				emit(x,y,z);
			},
			channels:3,
			id:'param_data',
			live:false
		})

		this.leftView.surface({
			color:this.gui.colors.data,
			id:'param_geometry',
			shaded:true,
			opacity:1
		})
	}
	Mode3D.prototype.cleanupParametric = function(){
		this.leftView.remove("#param_data");
		this.leftView.remove("#param_geometry");
	}


	Mode3D.prototype.initConvexHull = function(){
		this.parseConvexPoints()
		var pointsArray = this.pointsArray;

		// Generate convex hull
		var instance = new QuickHull(pointsArray);
		instance.build()
		var vertices = instance.collectFaces()

		this.leftView.array({
		    expr: function (emit, i, t) {
		      var v1 = pointsArray[vertices[i][0]];
		      var v2 = pointsArray[vertices[i][1]];
		      var v3 = pointsArray[vertices[i][2]];
		      emit(v1[0],v1[1],v1[2],0)
		      emit(v2[0],v2[1],v2[2],0)
		      emit(v3[0],v3[1],v3[2],0)
		      },
	        width: vertices.length,
	        items: 3,
	        channels: 4,
	        id:'hull_data'
		  })
	  this.leftView.face({
	    color:this.gui.colors.data,
	    shaded: true,
	    id:'hull_geometry',
	    points:'#hull_data',
	  })  

	}
	Mode3D.prototype.parseConvexPoints = function(){
		var params = this.gui.params
		// Get string of points and parse it 
		// Remove whitespace 
		var points_str = params.points.replace(/\s+/g, '');
		// Split based on the pattern (digits,digits)
		var points_split = points_str.match(/\(-*[.\d]+,-*[.\d]+,-*[.\d]+\)/g);
		this.pointsArray = []

		for(var i=0;i<points_split.length;i++){
			var p = points_split[i];
			// Remove parenthesis 
			p = p.replace(/[\(\)]/g,'');
			// Split by comma
			var comma_split = p.split(",") 
			var point = []
			for(var j=0;j<comma_split.length;j++) point.push(Number(comma_split[j]))
			this.pointsArray.push(point)
		}
		
	}
	Mode3D.prototype.cleanupConvexHull = function(){
		this.leftView.remove("#hull_data")
		this.leftView.remove("#hull_geometry")
	}

	//Destroys everything created
	Mode3D.prototype.cleanup = function(){
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

	scope.Mode3D = Mode3D;
	return Mode3D;

})(typeof exports === 'undefined' ? {} : exports);