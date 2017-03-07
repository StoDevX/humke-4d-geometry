// Class for creating & handling the dat.gui controls 
// as well as creating a common interface for all modes to use

var GUI = (function (scope) {
	//Constructor 
	function GUI(){
		// These are all the possible parameters to keep track of 
		this.params = {
			// Shape Properties
			'source':'cartesian',
			'equation':'',
			'points':'', // For convex hull 
			'param_a':'', // These are the ranges the parameters take 
			'param_b':'',
			'param_c':'',
			'param_d':'',
			'param_eq_x':'', // This is the parametric equation
			'param_eq_y':'',
			'param_eq_z':'',
			'param_eq_w':'',
			'render_shape':true,
			'resolution':60, // For the marching squares/cubes 

			// Viewing Controls
			'axis_value':0,
			'axis':'Y',
			'samples':200,
			'thickness':'medium'
		};
		this.gui = null;
	}

	GUI.prototype.init = function(mode){
		// Creates the scene and everything
		this.gui = new dat.GUI();
	}

	GUI.prototype.cleanup = function(){
		//Destroys everything created
		this.gui.destroy();
	}

	scope.GUI = GUI;
	return GUI;
})(typeof exports === 'undefined' ? {} : exports);
