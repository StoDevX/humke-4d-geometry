// Class for creating & handling the dat.gui controls
// as well as creating a common interface for all modes to use

var GUI = (function (scope) {
	//Constructor
	function GUI(){

	}

	GUI.prototype.init = function(mode,callbacks,mode_obj){
		// Colors to use throughout
		this.colors = {
			'slices':'#e59a1c', // For the line/place of intersection
			'projections':'#3090FF' // For the actual shape/data
		}

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
			'render_shape':false,
			'render_slices':false,
			'resolution':60, // For the marching squares/cubes

			// Viewing Controls
			'axis_value':0.1,
			'axis':'Y',
			'samples':200,
			'thickness':'medium'
		};
		this.gui = null;
		this.mode = "";
		this.last_source = this.params.source;

		// 2D defaults
		this.defaults = {}
		// Alternative parametric: (a: [0,2pi],b:[0.5,1])
		//b * (1-cos(a))*sin(a) * 5
		//b * (1-cos(a))*cos(a) * 5
		// Alternative square:
		// (0,5),(5,0),(0,-5),(-5,0)
		this.defaults['2D'] = {
			'equation':'x^2+y^2 = 10', // Circle
			'points':'(5,5),(5,-5),(-5,-5),(-5,5)', // Square
			'param_eq_x':'a * cos(b)', // butterfly wings
			'param_eq_y':'a * sin(b)',
			'param_a':'0 < a < 4',
			'param_b':'0 < b < 2 * PI',
			'axis':'Y'
		}
		// 3D defaults
		this.defaults['3D'] = {
			'equation':'x^2+y^2+z^2 = 10', // Sphere
			'resolution':20,
			'points':'(5,0,5),(5,0,-5),(-5,0,-5),(-5,0,5),(5,5,5),(5,5,-5),(-5,5,-5),(-5,5,5)', // Cube
			'param_eq_x':'cos(a)*(7+cos(b))',
			'param_eq_y':'sin(a)*(7+cos(b))',
			'param_eq_z':'sin(b)',
			'param_a':'0 < a < 2 * PI',
			'param_b':'0 < b < 2 * PI',
			'param_c':'0 < c < 5'
			//'param_eq_x':'b * cos(a) - c * sin(a)', // Spiral tube
			//'param_eq_y':'b * sin(a) + c * cos(a)',
			//'param_eq_z':'a/3',
			//'param_a':'-4 * PI < a < 4 * PI',
			//'param_b':'0 < b < 1',
			//'param_c':'0 < c < 1'
		}

		// 3D defaults
		this.defaults['4D'] = {
			'equation':'x^2+y^2+z^2+w^2 = 10',
			'points':'',
			'resolution':20,
			'param_eq_x':'',
			'param_eq_y':'',
			'param_eq_z':'',
			'param_eq_w':'',
			'param_a':'0 < a < 1',
			'param_b':'0 < b < 1',
			'param_c':'0 < c < 1',
			'param_d':'0 < d < 1',
			'axis':'W'
		}

		this.mode_obj = null;
		this.callbacks = null;

		// Creates the scene and everything
		this.gui = new dat.GUI();
		this.mode = mode;
		this.mode_obj = mode_obj;
		this.callbacks = callbacks;
		// Create the two folders
		var shapeProperties = this.gui.addFolder('Shape Properties');
	    var viewingControls = this.gui.addFolder('Viewing Controls');
	    this.shapeProperties = shapeProperties; this.viewingControls = viewingControls;
	    var current_scope = this;
	    var params = this.params;

	    // Load defaults
	    for(var key in params){
	    	if(this.defaults[mode][key]){
	    		params[key] = this.defaults[mode][key]
	    	}
	    }

	    shapeProperties.add(params, 'source',['cartesian','parametric','convex-hull']).onChange(function(val){
	    	if(val == 'cartesian' && current_scope.last_source != 'cartesian'){
	    		current_scope.destroyConvexSource();
	    		current_scope.destroyParamSource();
	    		current_scope.initCartesianSource();
	    	}
	    	if(val == 'parametric' && current_scope.last_source != 'parametric'){
	    		current_scope.destroyConvexSource();
	    		current_scope.destroyCartesianSource();
	    		current_scope.initParamSource();
	    	}
	    	if(val == 'convex-hull' && current_scope.last_source != 'convex-hull'){
	    		current_scope.destroyCartesianSource();
	    		current_scope.destroyParamSource();
	    		current_scope.initConvexSource();
	    	}
	    	current_scope.last_source = val

	    	if(callbacks['source']) callbacks['source'](mode_obj,val);
	    });

	    shapeProperties.add(params, 'render_shape').name("Render Shape").listen().onChange(function(val){
	    	if(callbacks['render_shape']) callbacks['render_shape'](mode_obj,val);
	    });

			shapeProperties.add(params, 'render_slices').name("Render Slices").listen().onChange(function(val){
	    	if(callbacks['render_slices']) callbacks['render_slices'](mode_obj,val);
	    });

	    // Init cartesian by default
	    this.initCartesianSource();

	    // Now the viewing controls
	    var axis_value_control = this.viewingControls.add(params, 'axis_value').min(-10).max(10).step(0.01).listen();
	    axis_value_control.onChange(function(val){
	    	if(callbacks['axis_value']) callbacks['axis_value'](mode_obj,val);
	    })
	    var axes_list = ['X','Y'];
	    if(mode == "3D" || mode == "4D") axes_list.push("Z");
	    if(mode == "4D") axes_list.push("W");
	    this.viewingControls.add(params, 'axis', axes_list ).onChange(function(val){
	    	axis_value_control.name(val + " = ")
	    	params.axis_value = 0;
	    	if(callbacks['axis']) callbacks['axis'](mode_obj,val);
	    });
	    // Set axis name
	    axis_value_control.name(params.axis + " = ")

	    /*
	    this.viewingControls.add(params, 'samples', 200, 10000).name('Samples');
	    this.viewingControls.add(params, 'thickness', ['thin','medium','thick']).name('Thickness').onChange(function(val){
	    	if(callbacks['thickness']) callbacks['thickness'](mode_obj,val);
	    });
	    */

	    // Turn all sliders orange after the first one (the first one is the resolution one)
	    var sliders = document.querySelectorAll(".slider-fg")
	    for(var i=1;i<sliders.length;i++){ //notice i=1
	    	var slider = sliders[i]
	    	slider.style.background = this.colors.slices
		    slider.parentNode.parentNode.querySelector(".dg .cr.number input[type='text']").style.color = this.colors.slices
	    	slider.parentNode.parentNode.parentNode.parentNode.style['border-left'] = "3px solid " + this.colors.slices
	    }
	}

	// Functions for creating the controls for the 3 different inputs (cartesian, parametric and convex hull)
	GUI.prototype.initCartesianSource = function(){
		var arr = [];
		var callbacks = this.callbacks;
		var mode_obj = this.mode_obj;

		var eq = this.shapeProperties.add(this.params, 'equation').name('Equation').onChange(function(val){
			if(callbacks['equation']) callbacks['equation'](mode_obj,val);
		});
		arr.push(eq)
		var res = this.shapeProperties.add(this.params, 'resolution', 20, 200).name('Resolution').step(1).onChange(function(val){
			if(callbacks['resolution']) callbacks['resolution'](mode_obj,val);
		});
		arr.push(res)

		this.cartesianSourceItems = arr;
	}
	GUI.prototype.destroyCartesianSource = function(){
		if(!this.cartesianSourceItems) return;
		for(var i=0;i<this.cartesianSourceItems.length;i++){
			this.shapeProperties.remove(this.cartesianSourceItems[i])
		}
		this.cartesianSourceItems = [];
	}
	GUI.prototype.initParamSource = function(){
		var arr = [];
		var names = ["param_eq_x","param_eq_y","param_a","param_b","param_eq_z","param_c","param_eq_w","param_d"]
		var callbacks = this.callbacks;
		var mode_obj = this.mode_obj;

		arr.push(this.shapeProperties.add(this.params, 'param_eq_x').name('x = ').onChange(function(val){
			if(callbacks['param_eq_x']) callbacks['param_eq_x'](mode_obj,val);
		}));
		arr.push(this.shapeProperties.add(this.params, 'param_eq_y').name('y = ').onChange(function(val){
			if(callbacks['param_eq_y']) callbacks['param_eq_y'](mode_obj,val);
		}));
		if(this.mode == "3D" || this.mode  == "4D"){
			arr.push(this.shapeProperties.add(this.params, 'param_eq_z').name('z = ').onChange(function(val){
				if(callbacks['param_eq_z']) callbacks['param_eq_z'](mode_obj,val);
			}));
		}
		if(this.mode == "4D"){
			arr.push(this.shapeProperties.add(this.params, 'param_eq_w').name('w = ').onChange(function(val){
				if(callbacks['param_eq_w']) callbacks['param_eq_w'](mode_obj,val);
			}));
		}
		arr.push(this.shapeProperties.add(this.params, 'param_a').name('a = ').onChange(function(val){
			if(callbacks['param_a']) callbacks['param_a'](mode_obj,val);
		}));
		arr.push(this.shapeProperties.add(this.params, 'param_b').name('b = ').onChange(function(val){
			if(callbacks['param_b']) callbacks['param_b'](mode_obj,val);
		}));
		if(this.mode == "3D" || this.mode  == "4D"){
			arr.push(this.shapeProperties.add(this.params, 'param_c').name('c = ').onChange(function(val){
				if(callbacks['param_c']) callbacks['param_c'](mode_obj,val);
			}));
		}
		if(this.mode == "4D"){
			arr.push(this.shapeProperties.add(this.params, 'param_d').name('d = ').onChange(function(val){
				if(callbacks['param_d']) callbacks['param_d'](mode_obj,val);
			}));
		}

		// for(var i=0;i<arr.length;i++){
		// 	// Use a closure to capture the value of the current names[i]
		// 	var changeFunc = (function(name){ return function(val){ if(callbacks[name]) callbacks[name](mode_obj,val); } })(names[i]);
		// 	arr[i].onChange(function(val){
		// 		changeFunc(val)
		// 	})
		// }

		this.paramSourceItems = arr;
	}
	GUI.prototype.destroyParamSource = function(){
		if(!this.paramSourceItems) return;
		for(var i=0;i<this.paramSourceItems.length;i++){
			this.shapeProperties.remove(this.paramSourceItems[i])
		}
		this.paramSourceItems = [];
	}
	GUI.prototype.initConvexSource = function(){
		var arr = [];
		var callbacks = this.callbacks;
		var mode_obj = this.mode_obj;

		var points = this.shapeProperties.add(this.params, 'points').onChange(function(val){
			if(callbacks['points']) callbacks['points'](mode_obj,val);
		});

		arr.push(points)
		this.convexSourceItems = arr;
	}
	GUI.prototype.destroyConvexSource = function(){
		if(!this.convexSourceItems) return;
		for(var i=0;i<this.convexSourceItems.length;i++){
			this.shapeProperties.remove(this.convexSourceItems[i])
		}
		this.convexSourceItems = [];
	}


	GUI.prototype.cleanup = function(){
		//Destroys everything created
		this.gui.destroy();
		// Reset all stuff
		this.convexSourceItems = null;
		this.paramSourceItems = null;
		this.cartesianSourceItems = null;
	}


	scope.GUI = GUI;
	return GUI;
})(typeof exports === 'undefined' ? {} : exports);
