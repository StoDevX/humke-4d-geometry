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
		  range: [[-10, 10],[-10,10],[-10,10]],
		  scale: [1, 1,1],
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