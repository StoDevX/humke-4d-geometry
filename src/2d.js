// All logic & rendering of the 2D mode is contained here
// depends on Mathbox existing in the scope as well as the gui class

/* 
todo:

- Draw cartesian shape (with resolution)
- Make render shape work
- Switch source to convex hull correctly
- Draw parametric 
- Make intersection work (with samples)
- Apply same to 3D 
- Create barebones 4D
- Apply hash when clicking on any of the modes 
*/

var Mode2D = (function (scope) {
	//Constructor 
	function Mode2D(document){
		this.document = document; 
		this.thicknessValuesTable = {'thin':0.2,'medium':0.5,'thick':1}
	}

	// Creates the scene and everything
	Mode2D.prototype.init = function(div,gui){
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
	    gui.init("2D",this.callbacks,this);
	    this.gui = gui;

		// Set up left view
		var camera = leftView.camera({
		  proxy: true, // this alows interactive camera controls to override the position
		  position: [0, 0, 3],
		})
		leftView = leftView.cartesian({
		  range: [[-10, 10], [-10, 10]],
		  scale: [1, 1],
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
		  .grid({
		    width: 1,
		    divideX: 10,
		    divideY: 10
		  });

		 // Add text
		leftView.array({
		  data: [[11,1], [0,12]],
		  channels: 2, // necessary
		  live: false,
		}).text({
		  data: ["x", "y"],
		}).label({
		  color: 0x000000,
		});

		this.leftView = leftView;
		this.CreateViewLine();

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

	    this.CreateViewAxis(1,[11,1],"x")
	    
	}

	Mode2D.prototype.CreateViewAxis = function(axisNum,pos,labelName){
		this.rightView.axis({
		    axis: axisNum,
		    width: 4,
		    color:'black',
		    id:'viewing_1d_axis',
		  })

		this.rightView.array({
	      data: [pos],
	      channels: 2, // necessary
	      live: false,
	    }).text({
	      data: [labelName],
	    }).label({
	      color: 0x000000,
	      id:'viewing_1d_axis_label',
	    });

	}

	Mode2D.prototype.CreateViewLine = function(){
		//The line on the left to show you what it's intersecting 
		var params = this.gui.params
		var thickness = this.thicknessValuesTable[params.thickness]
		this.leftView.interval({
			expr: function(emit,x,i,t){
				if(params.axis == "Y")
					emit(x,params.axis_value);
				else
					emit(params.axis_value,x);
			},
			width:2,
			channels:2,
			id:"viewing_axis"
		}).line({
			width:5 + 5 * thickness,
			color:this.gui.colors.viewing,
			id:"viewing_axis_line"
		})
	}

	// define a function to be called when each param is updated
	Mode2D.prototype.callbacks = {
		'axis': function(self,val){
			self.rightView.remove("#viewing_1d_axis")
	    	self.rightView.remove("#viewing_1d_axis_label")
			if(val == "Y") self.CreateViewAxis(1,[11,1],"x")
			if(val == "X") self.CreateViewAxis(2,[0,12],"y")
		},
		'thickness': function(self,val){
			// need to change the line's property when thickness changes
			self.leftView.select("#viewing_axis_line").set("width",5+5*self.thicknessValuesTable[self.gui.params.thickness])
		}
	};

	// Creates a new mathbox view
	Mode2D.prototype.createView = function(el,width){
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

	//Destroys everything created
	Mode2D.prototype.cleanup = function(){
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

	scope.Mode2D = Mode2D;
	return Mode2D;
})(typeof exports === 'undefined' ? {} : exports);