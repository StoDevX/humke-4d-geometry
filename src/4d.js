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
		leftView = leftView.cartesian4({
		  range: [[-10,10], [-10,10],[-10,10], [-10,10]],
		  scale: [1,1,1,1],
		});

		leftView = leftView.transform({
		  position: [0, 0, 0,0],
		  rotation: [0.1,0.3,0]
		})

		// need to rotate in 4D to see the 4th axis
		leftView = leftView.transform4({
			matrix: [
				1, 0, 0, .577,
		    0, 1, 0, .577,
		    0, 0, 1, .577,
		    0, 0, 0, 1,
			],
		})

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

		var pointsArray = []

		function Eq(x,y,z){
		  return Math.pow(x,2) + Math.pow(y,2) + Math.pow(z,2) - 50;
		}

		function DrawCube(){
		  var arr = []
		  for(var x=-1;x<=1;x++){
		    for(var y=-1;y<=1;y++){
		      for(var z=-1;z<=1;z++){
		        //for(var w=-1;w<=1;w++){
		          arr.push([x*5,y*5,z*5])
		        //}

		      }
		    }
		  }
		  return arr;
		}

		function DrawSphere(){
		  var arr = [];
		  var step = 0.5;

		  for(var x=-10;x<=10;x+=step){
		    for(var y=-10;y<=10;y+=step){
		      for(var z=-10;z<=10;z+=step){
		        if(Eq(x,y,z) < 0) arr.push([x/9,y/9,z/9])
		      }
		    }
		  }

		  return arr;
		}

		//var pointsArray = DrawCube();
		var pointsArray = [5,0,5,0,5,0,-5,0,-5,0,-5,0,-5,0,5,0,5,5,5,0,5,5,-5,0,-5,5,-5,0,-5,5,5,0,  5,0,5,5,5,0,-5,5,-5,0,-5,5,-5,0,5,5,5,5,5,5,5,5,-5,5,-5,5,-5,5,-5,5,5,5]
		console.log("Points: " + pointsArray.length);

		// var instance = new QuickHull(pointsArray);
		// instance.build()
		// var vertices = instance.collectFaces()

		this.leftView.array({
		    expr: function (emit, i, t) {
		      //var v1 = pointsArray[vertices[i][0]];
		      //var v2 = pointsArray[vertices[i][1]];
		      //var v3 = pointsArray[vertices[i][2]];
					//var v4 = pointsArray[vertices[i][3]];
		      emit(pointsArray[4*i],pointsArray[4*i+1],pointsArray[4*i+2],pointsArray[4*i+3])
					// emit(v1[0],v1[1],v1[2],0)
		      // emit(v2[0],v2[1],v2[2],0)
		      // emit(v3[0],v3[1],v3[2],0)
					//emit(v4[0],v4[1],v4[2],v4[3])
		      },
	        width: vertices.length,
	        items: 1,
	        channels: 4,
	        id:'hull_data'
		  })
	  this.leftView.face({
	    color:this.gui.colors.data,
	    shaded: false,
			line: true,
			//size: 60,
	    id:'hull_geometry',
	    points:'#hull_data',
	  })

		this.leftView = leftView;

		// Set up right view
		rightView = rightView.cartesian({
		  range: [[-10, 10],[-10,10],[-10,10]],
		  scale: [1, 1,1],
		});

		rightView = rightView.transform({
		  position: [0, 0, 0,0],
		  rotation: [0.1,0.3,0]
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
	      },
	    });
	    if (mathbox.fallback) throw "WebGL not supported"
	    // Set the renderer color
		mathbox.three.renderer.setClearColor(new THREE.Color(0xFFFFFF), 1.0);
		return mathbox;
	}

	Mode4D.prototype.callbacks = {

	};

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
