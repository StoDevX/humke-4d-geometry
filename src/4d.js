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
		// need to rotate in 4D to see the 4th axis
		var rot_matrix = [
				1, 0, 0, 0,
		    0, 1, 0, 0,
		    0, 0, 1, 0,
		    0, 0, 0, 1,
			];

		leftView = leftView.transform4({
			matrix: rot_matrix,
			id:'transform4d',
		}).cartesian4({
		  range: [[-10,10], [-10,10],[-10,10], [-10,10]],
		  scale: [1,1,1,1],
		});

		// leftView = leftView.transform({
		//   position: [0, 0, 0,0],
		//   rotation: [0.1,0.3,0]
		// })

		

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

		function DrawCube(size,step){
		  var arr = []
		  for(var x=0;x<=1;x+=step){
		    for(var y=0;y<=1;y+=step){
		      for(var z=0;z<=1;z+=step){
		        //for(var w=-1;w<=1;w++){
		          arr.push([x*size,y*size,z*size])
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

		
		var cube = DrawCube(10,1);
	    var pointsArray = [];
	    var edges = [];

	    // Move one cube to w=0 and one to w=10
	    for(var i=0;i<cube.length;i++){
	      var p1 = [cube[i][0],cube[i][1],cube[i][2],0]
	      var p2 = [cube[i][0],cube[i][1],cube[i][2],10]
	      pointsArray.push(p1)
	      pointsArray.push(p2)
	    }

	    // Create the edges 
	    for(var i=0;i<pointsArray.length;i++){
	      var p = pointsArray[i];
	      for(var j=0;j<pointsArray.length;j++){
	        var p2 = pointsArray[j];
	        // To connect an edge, p and p2 must differ by only one coordinate 
	        var diff = 0; 
	        for(var k=0;k<p.length;k++){
	          if(p[k] != p2[k]) diff++;
	        }
	        if(diff == 1){
	          edges.push([p,p2])
	        }
	      }
	    }

	    // Define colors for the points (the farther it is on the w, the redder it is)
	    leftView.array({
	      id:'colors',
	      width: pointsArray.length,
	      expr: function (emit,i, time) {
	        var p = pointsArray[i];
	        var x = p[0];
	        var y = p[1];
	        var z = p[2];
	        var w = p[3];

	        emit(w/10, 0, 0, 1);
	      },
	      channels: 4,
	    })
	    // Define colors for the edges
	    leftView.array({
	      id:'edge_colors',
	      width: edges.length,
	      expr: function (emit,i, time) {
	        var p1 = edges[i][0];
	        var p2 = edges[i][1];
	        var w1 = p1[3]/10;
	        var w2 = p2[3]/10;
	        emit((w1+w2)/2, 0, 0, 1);
	        
	      },
	      channels: 4,
	    })

	    // Draw the vertices
	    leftView.array({
	      width: pointsArray.length,
	      expr: function (emit,i, time) {
	        var p = pointsArray[i];
	        var x = p[0];
	        var y = p[1];
	        var z = p[2];
	        var w = p[3];

	        emit(x, y, z, w);
	      },
	      channels: 4,
	    });

	    leftView.point({
	      colors: '#colors',
	      size: 40,
	    });

	    // Draw the edges 
	    leftView.array({
	      width: edges.length,
	      expr: function(emit,i,time){
	        var p1 = edges[i][0];
	        var p2 = edges[i][1];
	        emit(p1[0],p1[1],p1[2],p1[3]);
	        emit(p2[0],p2[1],p2[2],p2[3]);
	      },
	      channels:4,
	      items:2,
	    })
	    leftView.vector({
	      colors: '#edge_colors',
	      width:10,
	      start:false
	    })

		leftView.print()
		

		this.leftView = leftView;

		// Rotate it along the w 
		var count = 0;
		var original = this.originalLeftView;
	    setInterval(function(){
	      count += 0.04;
	      rot_matrix[3] = Math.sin(count);
	      rot_matrix[7] = rot_matrix[3];
	      rot_matrix[11] = rot_matrix[3];

	      original.select("#transform4d").set("matrix",rot_matrix)
	      original.print();
	    },1000/60)

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
