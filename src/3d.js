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
		this.rightView = rightView

		// Draw our main shape
		this.setMode();

		this.CreateViewAxis("X","Z");
		this.CalculateIntersection();

		// Hide the slices at start
		this.rightView.select('#intersection_hull_geometry').set("opacity", 0)
	}

	Mode3D.prototype.CalculateIntersection = function(){
		var params = this.gui.params;

		var source = params.source;
		var axis = params.axis;
		var axis_value = params.axis_value;

		var axis_conv = {'X':0, 'Y':1, 'Z':2}

		var intersection_triangles = [];
		var intersection_points = [];
		var triangleArray = this.triangleArray;

		for (var i = 0; i < triangleArray.length; i+=3) {

			var max = Math.max(triangleArray[i][axis_conv[axis]],triangleArray[i+1][axis_conv[axis]],triangleArray[i+2][axis_conv[axis]]);

			var min = Math.min(triangleArray[i][axis_conv[axis]],triangleArray[i+1][axis_conv[axis]],triangleArray[i+2][axis_conv[axis]]);

			if(axis_value <= max && axis_value >= min) {
				intersection_triangles.push(triangleArray[i]);
				intersection_triangles.push(triangleArray[i+1]);
				intersection_triangles.push(triangleArray[i+2]);
				intersection_points.push(
					CalculateIntersectionPoints(
						triangleArray[i],
						triangleArray[i+1],
						triangleArray[i+2],
						axis,
						axis_value)
					);
				}

			}

			if (this.rightView.select("#intersection_point_data")){
				this.rightView.remove("#intersection_point_data")
				this.rightView.remove("#intersection_geometry")
				this.rightView.remove("#intersection_hull_data")
				this.rightView.remove("#intersection_hull_geometry")
			}


			var pointsArray = []
			for(var i=0;i<intersection_points.length;i++){
				var p = intersection_points[i];
				pointsArray.push([p[0],p[1]]);
				pointsArray.push([p[2],p[3]]);
			}

				// Draw it as lines

				this.rightView.array({
					width: pointsArray.length/2,
					items: 2,
					channels: 2,
					data: pointsArray,
					live:false,
					id:'intersection_hull_data'
				})
				this.rightView.vector({
					color: this.gui.colors.data,
					width: 10,
					start: false,
					id:'intersection_hull_geometry',
					points:'#intersection_hull_data',
					opacity:1,
				})
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

		// define a function to be called when each param is updated
		function updateParametricCallback(self,val){
			self.cleanupParametric();
			self.initParametric()
		}

		function updateRenderShape(self,val,opacity_val){
			if(opacity_val === undefined){
				opacity_val = val ? 1 : 0;
			}
			var params = self.gui.params;
			var source = params.source;

			if (source == "cartesian") {
				var flipped_opacity = self.leftView.select('#cartesian_geometry').get("opacity") == 1 ? 0 : 1 ;
				if(opacity_val != undefined) flipped_opacity = opacity_val; // opacity_val can override the toggle
				self.leftView.select('#cartesian_geometry').set("opacity",flipped_opacity)
			}
			if (source == "parametric") {
				var flipped_opacity = self.leftView.select('#param_geometry_upper').get("opacity") == 1 ? 0 : 1 ;
				if(opacity_val != undefined) flipped_opacity = opacity_val; // opacity_val can override the toggle
				self.leftView.select('#param_geometry_upper').set("opacity",flipped_opacity)
				self.leftView.select('#param_geometry_lower').set("opacity",flipped_opacity)
			}
			if (source == "convex-hull") {
				var flipped_opacity = self.leftView.select('#hull_geometry').get("opacity") == 1 ? 0 : 1 ;
				if(opacity_val != undefined) flipped_opacity = opacity_val; // opacity_val can override the toggle
				self.leftView.select('#hull_geometry').set("opacity",flipped_opacity)
			}
		}

		function updateRenderSlices(self,val,opacity_val){
			if(opacity_val === undefined){
				opacity_val = val ? 1 : 0;
			}
			var params = self.gui.params;
			var source = params.source;

			var flipped_opacity = self.rightView.select('#intersection_hull_geometry').get("opacity") == 1 ? 0 : 1 ;
			if(opacity_val != undefined) flipped_opacity = opacity_val; // opacity_val can override the toggle
			self.rightView.select('#intersection_hull_geometry').set("opacity",flipped_opacity)
		}

		Mode3D.prototype.callbacks = {
			'axis': function(self,val) {
				self.rightView.remove("#viewing_2d_axis_1")
				self.rightView.remove("#viewing_2d_axis_2")
				self.rightView.remove("#intersection_line")
				self.rightView.remove("#intersection_line_data")
				self.rightView.remove("#viewing_2d_axis_label")
				self.leftView.remove("#viewing_plane_data");
				self.leftView.remove("#viewing_plane_geometry");

				if(val == "Y") self.CreateViewAxis("X","Z")
				if(val == "X") self.CreateViewAxis("Z", "Y")
				if(val == "Z") self.CreateViewAxis("X","Y")

				self.rightView.remove("#intersection_line")
				self.rightView.remove("#intersection_line_data")
				self.CalculateIntersection();
			},
			'axis_value': function(self,val){
				self.rightView.remove("#intersection_line")
				self.rightView.remove("#intersection_line_data")
				self.CalculateIntersection();
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
			'fill': function(self,val){
				self.rightView.remove("#intersection_line")
				self.rightView.remove("#intersection_line_data")
				self.CalculateIntersection();
			},
			'source': function(self,val){
				self.setMode();
				if (self.gui.params.render_shape == true) console.log("Previously drawn")
				self.gui.params.render_shape = true; //Reset this back to true
				self.gui.params.render_slices = false; //Reset this back to false
				updateRenderShape(self,val,1);
				updateRenderSlices(self,val,0);

				self.rightView.remove("#intersection_line")
				self.rightView.remove("#intersection_line_data")
				self.CalculateIntersection();

				self.rightView.select('#intersection_hull_geometry').set("opacity", 0)
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

		Mode3D.prototype.CreateViewAxis = function(labelName1,labelName2){
			this.rightView.axis({
				axis: 1,
				width: 4,
				color:'black',
				id:'viewing_2d_axis_1'
			})
			.axis({
				axis: 2,
				width: 4,
				color:'black',
				id:'viewing_2d_axis_2'
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
				data: [labelName1,labelName2],
			}).label({
				color: 0x000000,
				id:'viewing_2d_axis_label'
			});


			var params = this.gui.params;
			this.leftView.array({
				id: "viewing_plane_data",
				channels: 3,
				items: 4,
				width: 1,
				expr: function(emit,i,t){
					if(!this.gui.params.render_slices) return;
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

			this.geometry_id = "cartesian_geometry"
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

		Mode3D.prototype.initTesselatedParametric = function(){
			function klein(  u,v ) {
				u *= Math.PI;
				v *= 2 * Math.PI;

				u = u * 2;
				var x, y, z;
				if ( u < Math.PI ) {

					x = 3 * Math.cos( u ) * ( 1 + Math.sin( u ) ) + ( 2 * ( 1 - Math.cos( u ) / 2 ) ) * Math.cos( u ) * Math.cos( v );
					z = - 8 * Math.sin( u ) - 2 * ( 1 - Math.cos( u ) / 2 ) * Math.sin( u ) * Math.cos( v );

				} else {

					x = 3 * Math.cos( u ) * ( 1 + Math.sin( u ) ) + ( 2 * ( 1 - Math.cos( u ) / 2 ) ) * Math.cos( v + Math.PI );
					z = - 8 * Math.sin( u );

				}

				y = - 2 * ( 1 - Math.cos( u ) / 2 ) * Math.sin( v );

				return [x,y,z]
			}

			function spiral_tube(u,v){
				v *= 8 * Math.PI -  4 * Math.PI;
				v*= 2;
				u *= 2;

				var x = 1 * Math.cos(v) - u * Math.sin(v);
				var y = 1 * Math.cos(v) + u * Math.cos(v);
				var z = v/2;

				return [x,y,z];
			}

			function torus(u,v){
				u *= 2 * Math.PI;
				v *=  Math.PI;

				//(4 + 0.5 * (3 + 5 * cos(b)) ) * sin(a)
				//(4 + 0.5 * (3 + 5 * cos(b)) ) * cos(a)
				//4 + 5 * sin(b)
				//0 < a < 2 * PI
				//0 < b < PI
				//0 < c < 5

				var x = (4 + 0.5 * (3 + 5 * Math.cos(v))) * Math.sin(u);
				var y = (4 + 0.5 * (3 + 5 * Math.cos(v))) * Math.cos(u);
				var z = 4 + 5 * Math.sin(v);

				return [x,y,z];
			}



			// this.leftView.volume({
			// 	rangeX: [0,1],
			// 	rangeY: [0,2 * Math.PI],
			// 	rangeZ: [0, Math.PI],
			// 	width: 25,
			// 	height: 25,
			// 	depth: 25,
			// 	expr: function(emit, x,y,z,i,j,k){
			// 		var p = torus(x,y,z)

			// 		emit(p[0],p[1],p[2]);
			// 	},
			// 	channels:3,
			// 	id:'param_data',
			// 	live:false
			// })

			// this.leftView.point({
			// 	color:this.gui.colors.data,
			// 	id:'param_geometry',
			// 	//shaded:true,
			// 	opacity:1
			// })

			// Uniformly sample the points
			/// from: https://github.com/mrdoob/three.js/blob/master/src/geometries/ParametricGeometry.js
			var slices = 25;
			var stacks = 25;
			var sliceCount = slices+1;
			var vertices = [];
			var indices  = [];

			for(var i=0;i<=stacks;i++){
				var v = i / stacks;
				for(var j=0;j<=slices;j++){
					var u = j / slices;
					var p = torus(u,v);
					vertices.push(p);
				}
			}

			for ( i = 0; i < stacks; i ++ ) {
				for ( j = 0; j < slices; j ++ ) {
					var a = i * sliceCount + j;
					var b = i * sliceCount + j + 1;
					var c = ( i + 1 ) * sliceCount + j + 1;
					var d = ( i + 1 ) * sliceCount + j;

					// faces one and two

					indices.push( [a, b, d] );
					indices.push( [b, c, d] );

				}
			}

			this.triangleArray = []

			for(var i=0;i<indices.length;i++){
				var v1 = vertices[indices[i][0]];
				var v2 = vertices[indices[i][1]];
				var v3 = vertices[indices[i][2]];
				this.triangleArray.push(v1);
				this.triangleArray.push(v2);
				this.triangleArray.push(v3);
			}

			this.leftView.array({
				expr: function (emit, i, t) {
					var v1 = vertices[indices[i][0]];
					var v2 = vertices[indices[i][1]];
					var v3 = vertices[indices[i][2]];
					emit(v1[0],v1[1],v1[2])
					emit(v2[0],v2[1],v2[2])
					emit(v3[0],v3[1],v3[2])
				},
				width: indices.length,
				items: 3,
				channels: 3,
				live:false,
				id:'param_data'
			})
			// this.leftView.face({
			//   color:this.gui.colors.data,
			//   shaded:true,
			//   id:'param_geometry',
			//   points:'#param_data',
			// })
			this.leftView.point({
				color:this.gui.colors.data,
				id:'param_geometry',
				opacity:1
			})

		}

		Mode3D.prototype.tesselateParametric = function(a_range,b_range,c_value){
			var params = this.gui.params
			// Returns a triangle array
			var slices = 25;
			var stacks = 25;
			var vertices = [];

			for(var i=0;i<=stacks;i++){
				var v = i / stacks;
				for(var j=0;j<=slices;j++){
					var u = j / slices;
					var a = u * (a_range[1] - a_range[0]) + a_range[0];
					var b = v * (b_range[1] - b_range[0]) + b_range[0];
					var x = Parser.evaluate(params.param_eq_x,{a:a,b:b,c:c_value});
					var y = Parser.evaluate(params.param_eq_y,{a:a,b:b,c:c_value});
					var z = Parser.evaluate(params.param_eq_z,{a:a,b:b,c:c_value});
					vertices.push([x,y,z]);
				}
			}

			// Create the triangles
			var sliceCount = slices+1;

			var indices  = [];
			for ( i = 0; i < stacks; i ++ ) {
				for ( j = 0; j < slices; j ++ ) {
					var a = i * sliceCount + j;
					var b = i * sliceCount + j + 1;
					var c = ( i + 1 ) * sliceCount + j + 1;
					var d = ( i + 1 ) * sliceCount + j;

					// faces one and two

					indices.push( [a, b, d] );
					indices.push( [b, c, d] );

				}
			}



			for(var i=0;i<indices.length;i++){
				var v1 = vertices[indices[i][0]];
				var v2 = vertices[indices[i][1]];
				var v3 = vertices[indices[i][2]];
				this.triangleArray.push(v1);
				this.triangleArray.push(v2);
				this.triangleArray.push(v3);
			}

			return [vertices,indices];
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

			this.triangleArray = []

			var upperData = this.tesselateParametric(a_range,b_range,c_range[1]);
			var upperBoundVerticies = upperData[0];
			var upperIndices = upperData[1];

			var lowerData = this.tesselateParametric(a_range,b_range,c_range[0]);
			var lowerBoundVerticies = lowerData[0];
			var lowerIndices = lowerData[1];

			// If we don't find BOTH a and b as variables, then draw it as a line 
			var draw_filled = true;
			var tokens = Parser.parse(params.param_eq_x).tokens;
			var found_a = false;
			var found_b = false;
			var found_c = false;
			for(var i=0;i<tokens.length;i++){
				if(tokens[i].toString() == "a") found_a = true;
				if(tokens[i].toString() == "b") found_b = true;
				if(tokens[i].toString() == "c") found_c = true;
			}
			tokens = Parser.parse(params.param_eq_y).tokens;
			for(var i=0;i<tokens.length;i++){
				if(tokens[i].toString() == "a") found_a = true;
				if(tokens[i].toString() == "b") found_b = true;
				if(tokens[i].toString() == "c") found_c = true;
			}
			tokens = Parser.parse(params.param_eq_z).tokens;
			for(var i=0;i<tokens.length;i++){
				if(tokens[i].toString() == "a") found_a = true;
				if(tokens[i].toString() == "b") found_b = true;
				if(tokens[i].toString() == "c") found_c = true;
			}
			if(!found_a || !found_b || !found_c) draw_filled = false;

			// Draw upper bound
			this.leftView.array({
				expr: function (emit, i, t) {
					var v1 = upperBoundVerticies[upperIndices[i][0]];
					var v2 = upperBoundVerticies[upperIndices[i][1]];
					var v3 = upperBoundVerticies[upperIndices[i][2]];
					emit(v1[0],v1[1],v1[2])
					emit(v2[0],v2[1],v2[2])
					emit(v3[0],v3[1],v3[2])
				},
				width: upperIndices.length,
				items: 3,
				channels: 3,
				live:false,
				id:'param_data_upper'
			})

			if(draw_filled){
				this.leftView.face({
					color:this.gui.colors.data,
					id:'param_geometry_upper',
					shaded:true,
					opacity:1
				})
			} else {
				this.leftView.point({
					color:this.gui.colors.data,
					id:'param_geometry_upper',
					size:5,
					opacity:1
				})
			}
			

			// Draw lower bound
			this.leftView.array({
				expr: function (emit, i, t) {
					var v1 = lowerBoundVerticies[lowerIndices[i][0]];
					var v2 = lowerBoundVerticies[lowerIndices[i][1]];
					var v3 = lowerBoundVerticies[lowerIndices[i][2]];
					emit(v1[0],v1[1],v1[2])
					emit(v2[0],v2[1],v2[2])
					emit(v3[0],v3[1],v3[2])
				},
				width: lowerIndices.length,
				items: 3,
				channels: 3,
				live:false,
				id:'param_data_lower'
			})

			if(draw_filled){
				this.leftView.face({
					color:this.gui.colors.data,
					id:'param_geometry_lower',
					shaded:true,
					opacity:1
				})
			} else {
				this.leftView.point({
					color:this.gui.colors.data,
					id:'param_geometry_lower',
					size:5,
					opacity:1
				})
			}

		}
		Mode3D.prototype.cleanupParametric = function(){
			this.leftView.remove("#param_data_upper");
			this.leftView.remove("#param_geometry_upper");

			this.leftView.remove("#param_data_lower");
			this.leftView.remove("#param_geometry_lower");
		}


		Mode3D.prototype.initConvexHull = function(){
			this.parseConvexPoints()
			var pointsArray = this.pointsArray;

			// Generate convex hull
			var instance = new QuickHull(pointsArray);
			instance.build()
			var vertices = instance.collectFaces()
			this.triangleArray = []

			for(var i=0;i<vertices.length;i++){
				var v1 = pointsArray[vertices[i][0]];
				var v2 = pointsArray[vertices[i][1]];
				var v3 = pointsArray[vertices[i][2]];
				this.triangleArray.push(v1);
				this.triangleArray.push(v2);
				this.triangleArray.push(v3);
			}

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
