// Class for creating & handling the dat.gui controls
// as well as creating a common interface for all modes to use

var GUI = (function (scope) {
	//Constructor
	function GUI(){
		// This is where all built in examples go. It is an array of objects 
		// specifying which dimension and input mode they belong to, as well as the data needed to set their state 
		this.built_in_examples_data = [
			// 2D examples
			{   name: 'Filled in Circle', dimension: 2, input: 'cartesian',
				data: { 'equation': 'x^2 + y^2 < 10' } },
			{   name: 'DNA', dimension: 2, input: 'cartesian',
				data: { 'equation': 'cos(x) = sin(y)^2' } },
			{   name: 'Heart', dimension: 2, input: 'parametric',
				data: { 'param_eq_x': 'b * (1-cos(a))*sin(a) * 5',
						'param_eq_y': 'b * (1-cos(a))*cos(a) * 5 + 5',
						'param_a': '0 < a < 2 * PI',
						'param_b': '0 < b < 1',
						'fill':false }},
			{   name: 'Hollow Circle', dimension: 2, input: 'parametric',
				data: { 'param_eq_x': 'b * cos(a)',
						'param_eq_y': 'b * sin(a)',
						'param_a': '0 < a < 2 * PI',
						'param_b': '2 < b < 4',
						'fill':true }},
			{ 	name: 'Diamond', dimension: 2, input: 'convex-hull',
			  	data: {'points': '(0,5),(5,0),(0,-5),(-5,0)' }},
			{ 	name: 'Approx. Circle', dimension: 2, input: 'convex-hull',
			  	data: {'points': '(5.00,0.00),(4.90,0.99),(4.61,1.95),(4.13,2.82),(3.48,3.59),(2.70,4.21),(1.81,4.66),(0.85,4.93),(-0.15,5.00),(-1.14,4.87),(-2.08,4.55),(-2.94,4.04),(-3.69,3.38),(-4.28,2.58),(-4.71,1.67),(-4.95,0.71),(-4.99,-0.29),(-4.83,-1.28),(-4.48,-2.21),(-3.95,-3.06),(-3.27,-3.78),(-2.45,-4.36),(-1.54,-4.76),(-0.56,-4.97),(0.44,-4.98),(1.42,-4.79),(2.34,-4.42),(3.17,-3.86),(3.88,-3.16),(4.43,-2.32),(4.80,-1.40),(4.98,-0.42)'
			  	}},
			// 3D examples 
			{   name: 'Sphere', dimension: 3, input: 'cartesian',
				data: { 'equation': 'x^2 + y^2 + z^2 = 10' } },
			{   name: 'Tube', dimension: 3, input: 'cartesian',
				data: { 'equation': 'x^2 + y^2 = 10' } },
			{   name: 'Wiggly Tube', dimension: 3, input: 'cartesian',
				data: { 'equation': '(x+sin(z)*0.5)^2 + y^2 = 10' } },
			{	name: 'Torus', dimension:3, input: 'parametric',
				data: { 'param_eq_x':'cos(a)*(7+cos(b))',
						'param_eq_y':'sin(a)*(7+cos(b))',
						'param_eq_z':'sin(b)',
						'param_a':'0 < a < 2 * PI',
						'param_b':'0 < b < 2 * PI' }},
			{	name: 'Twisted Ribbon', dimension:3, input: 'parametric',
				data: { 'param_eq_x':'cos(b)*a',
						'param_eq_y':'b',
						'param_eq_z':'sin(b)*a',
						'param_a':'0 < a < 2 * PI',
						'param_b':'-10 < b < 10' }},
			{	name: 'Cube', dimension:3, input: 'convex-hull',
				data: { 'points': '(0,0,0),(0,0,5),(0,5,0),(0,5,5),(5,0,0),(5,0,5),(5,5,0),(5,5,5)' }},
			{	name: 'Centered Cube', dimension:3, input: 'convex-hull',
				data: { 'points': '(-2.5,-2.5,-2.5),(-2.5,-2.5,2.5),(-2.5,2.5,-2.5),(-2.5,2.5,2.5),(2.5,-2.5,-2.5),(2.5,-2.5,2.5),(2.5,2.5,-2.5),(2.5,2.5,2.5)' }},
			{	name: 'Rotated Cube', dimension:3, input: 'convex-hull',
				data: { 'points': '(-3.54,-1.45,2.03),(0.00,1.42,4.09),(-3.54,1.45,-2.03),(0.00,4.33,0.02),(0.00,-4.33,-0.02),(3.54,-1.45,2.03),(0.00,-1.42,-4.09),(3.54,1.45,-2.03)' }},
			{	name: 'Diamond', dimension:3, input: 'convex-hull',
				data: { 'points': '(0,0,5),(0,0,-5),(5,0,0),(-5,0,0),(0,5,0),(0,-5,0)' }},
			// 4D examples
			{
				name: 'Hypersphere', dimension: 4, input: 'cartesian',
				data: { 'equation': 'x^2+y^2+z^2+w^2 = 10' }},
			{
				name: 'Sheared Hypertube', dimension: 4, input: 'cartesian',
				data: { 'equation': '(x+w)^2+y^2+z^2 = 10' }},
			{
				name: 'Tesseract', dimension: 4, input: 'convex-hull',
				data: { 'points': '(-1.0,-1.0,-1.0,-1.0),(1.0,-1.0,-1.0,-1.0),(-1.0,1.0,-1.0,-1.0),(1.0,1.0,-1.0,-1.0),(-1.0,-1.0,1.0,-1.0),(1.0,-1.0,1.0,-1.0),(-1.0,1.0,1.0,-1.0),(1.0,1.0,1.0,-1.0),(-1.0,-1.0,-1.0,1.0),(1.0,-1.0,-1.0,1.0),(-1.0,1.0,-1.0,1.0),(1.0,1.0,-1.0,1.0),(-1.0,-1.0,1.0,1.0),(1.0,-1.0,1.0,1.0),(-1.0,1.0,1.0,1.0),(1.0,1.0,1.0,1.0)' }},
			{
				name: 'Fuzzy Tesseract', dimension: 4, input: 'convex-hull',
				data: { 'points': '(-0.61,-0.71,-0.55,-0.51),(-0.98,-0.82,-0.97,1.41),(-0.57,-0.84,1.27,-0.54),(-0.65,-0.83,1.45,1.22),(-0.85,1.48,-0.62,-0.96),(-0.87,1.20,-0.78,1.07),(-0.82,1.16,1.32,-0.91),(-0.51,1.31,1.16,1.14),(1.45,-0.76,-0.77,-0.96),(1.11,-0.93,-0.99,1.27),(1.49,-0.81,1.29,-0.54),(1.06,-0.82,1.19,1.09),(1.11,1.42,-0.88,-0.78),(1.48,1.50,-0.54,1.34),(1.50,1.10,1.05,-0.95),(1.04,1.25,1.10,1.01)' }},
			{
				name: 'Random 16 Points', dimension: 4, input: 'convex-hull',
				data: { 'points': '(0.81,0.44,-1.00,0.84),(0.04,0.76,0.06,0.55),(-0.16,-0.81,-0.65,-0.84),(0.05,0.44,0.96,0.65),(0.12,0.37,-0.78,-0.45),(0.46,-0.15,0.12,-0.95),(-0.34,-0.56,-0.56,-0.40),(-1.00,-0.39,-0.10,-0.98),(-0.30,-0.51,-0.56,-0.63),(0.88,-0.04,0.91,0.38),(-0.93,0.68,0.56,-0.09),(0.84,0.56,0.16,0.73),(0.66,0.57,0.69,0.08),(-0.53,-0.18,0.88,0.18),(-0.68,0.79,-0.35,0.45),(0.36,0.91,-0.62,-0.07)' }},
		]
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
			'resolution': 'low', // For the marching squares/cubes
			'whole_shape_slicing': false,
			'fill': false,

			// Viewing Controls
			'axis_value':0.1,
			'axis':'Y',
			'samples':200,
			'thickness':'medium',
			'show left view': true,
			'show right view': true,
		};
		this.gui = null;
		this.mode = "";
		this.last_source = this.params.source;
		this.defaults = {}

		// 2D defaults
		this.defaults['2D'] = {
			'whole_shape_slicing':false,
			'equation':'x^2+y^2 = 9', // Circle
			'points':'(5,5),(5,-5),(-5,-5),(-5,5)', // Square
			'param_eq_x':'b * cos(a)', // Circle
			'param_eq_y':'b * sin(a)',
			'param_a':'0 < a < 2 * PI',
			'param_b':'0 < b < 4',
			'axis':'Y',
		}
		// 3D defaults
		this.defaults['3D'] = {
			'equation':'x^2+y^2+z^2 = 10', // Sphere
			'resolution':'low',
			'points':'(5,0,5),(5,0,-5),(-5,0,-5),(-5,0,5),(5,5,5),(5,5,-5),(-5,5,-5),(-5,5,5)', // Cube
			'param_eq_x':'cos(a)*(7+cos(b))',
			'param_eq_y':'sin(a)*(7+cos(b))',
			'param_eq_z':'sin(b)',
			'param_a':'0 < a < 2 * PI',
			'param_b':'0 < b < 2 * PI',
			'param_c':'0 < c < 5',
		}

		// 3D defaults
		this.defaults['4D'] = {
			'equation':'x^2+y^2+z^2+w^2 = 10',
			'points':'',
			'resolution':'low',
			'param_eq_x':'',
			'param_eq_y':'',
			'param_eq_z':'',
			'param_eq_w':'',
			'param_a':'0 < a < 1',
			'param_b':'0 < b < 1',
			'param_c':'0 < c < 1',
			'param_d':'0 < d < 1',
			'axis':'W',
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
		var builtinExamples = this.gui.addFolder('Builtin Examples');
		this.shapeProperties = shapeProperties;
		this.viewingControls = viewingControls;
		this.builtinExamples = builtinExamples;
		var current_scope = this;
		var params = this.params;

		// Load defaults
		for(var key in params){
			if(this.defaults[mode][key]){
				params[key] = this.defaults[mode][key];
			}
		}

		let inputOptions = ['cartesian','parametric','convex-hull'];
		if(mode == "4D"){
			inputOptions = ['cartesian','convex-hull'];
		}

		shapeProperties.add(params, 'source',inputOptions).onChange(function(val){
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

		// show or hide left/right views
		this.viewingControls.add(params, 'show left view').name("Show Left View").listen().onChange(function(val){
			if(callbacks['show left view']) callbacks['show left view'](mode_obj,val);
		});
		this.viewingControls.add(params, 'show right view').name("Show Right View").listen().onChange(function(val){
			if(callbacks['show right view']) callbacks['show right view'](mode_obj,val);
		});

		if(mode == "2D"){
			this.viewingControls.add(params, 'whole_shape_slicing').name("Whole Slicing").listen().onChange(function(val){
				if(callbacks['whole_shape_slicing']) callbacks['whole_shape_slicing'](mode_obj,val);
			});
		}


		// Turn all sliders orange 
		var sliders = document.querySelectorAll(".slider-fg")
		for(var i=0;i<sliders.length;i++){
			var slider = sliders[i]
			slider.style.background = this.colors.slices
			slider.parentNode.parentNode.querySelector(".dg .cr.number input[type='text']").style.color = this.colors.slices
			slider.parentNode.parentNode.parentNode.parentNode.style['border-left'] = "3px solid " + this.colors.slices
		}
		// Set the width on the built in example spans to be 100%
		var properties = document.querySelectorAll("li.folder:nth-child(3) .property-name");
		for(var i=0;i<properties.length;i++)
			properties[i].style.width = "100%"
	}

	// Functions for creating the controls for the 3 different inputs (cartesian, parametric and convex hull)
	GUI.prototype.initCartesianSource = function(){
		var arr = [];
		var callbacks = this.callbacks;
		var mode_obj = this.mode_obj;

		var eq = this.shapeProperties.add(this.params, 'equation').listen().name('Equation').onChange(function(val){
			if(callbacks['equation']) callbacks['equation'](mode_obj,val);
		});
		arr.push(eq);
		// var res = this.shapeProperties.add(this.params, 'resolution', 20, 200).name('Resolution').step(1).onChange(function(val){
		// 	if(callbacks['resolution']) callbacks['resolution'](mode_obj,val);
		// });

		if(this.mode == '3D' || this.mode == '4D'){
			var res = this.shapeProperties.add(this.params, 'resolution',['low','medium','high']).name('Resolution').onChange(function(val){
				if(callbacks['resolution']) callbacks['resolution'](mode_obj,val);
			});
			arr.push(res);
		}


		this.builtin_arr_cartesian = this.constructExampleItems(this.mode,'cartesian');

		this.cartesianSourceItems = arr;
	};

	GUI.prototype.destroyCartesianSource = function(){
		if(!this.cartesianSourceItems) return;
		for(var i=0;i<this.cartesianSourceItems.length;i++){
			this.shapeProperties.remove(this.cartesianSourceItems[i]);
		}
		for (var i = 0; i < this.builtin_arr_cartesian.length; i++) {
			this.builtinExamples.remove(this.builtin_arr_cartesian[i]);
		}
		this.cartesianSourceItems = [];
		this.builtin_arr_cartesian = [];
	};

	GUI.prototype.initParamSource = function(){
		var arr = [];
		var names = ["param_eq_x","param_eq_y","param_a","param_b","param_eq_z","param_c","param_eq_w","param_d"]
		var callbacks = this.callbacks;
		var mode_obj = this.mode_obj;

		if(this.mode == "2D"){
			var fill_item = this.shapeProperties.add(this.params, 'fill').name("Fill Shape").listen().onChange(function(val){
				if(callbacks['fill']) callbacks['fill'](mode_obj,val);
			});
			arr.push(fill_item);
		}

		arr.push(this.shapeProperties.add(this.params, 'param_eq_x').name('x = ').listen().onChange(function(val){
			if(callbacks['param_eq_x']) callbacks['param_eq_x'](mode_obj,val);
		}));
		arr.push(this.shapeProperties.add(this.params, 'param_eq_y').name('y = ').listen().onChange(function(val){
			if(callbacks['param_eq_y']) callbacks['param_eq_y'](mode_obj,val);
		}));
		if(this.mode == "3D" || this.mode  == "4D"){
			arr.push(this.shapeProperties.add(this.params, 'param_eq_z').name('z = ').listen().onChange(function(val){
				if(callbacks['param_eq_z']) callbacks['param_eq_z'](mode_obj,val);
			}));
		}
		if(this.mode == "4D"){
			arr.push(this.shapeProperties.add(this.params, 'param_eq_w').name('w = ').listen().onChange(function(val){
				if(callbacks['param_eq_w']) callbacks['param_eq_w'](mode_obj,val);
			}));
		}
		arr.push(this.shapeProperties.add(this.params, 'param_a').name('a = ').listen().onChange(function(val){
			if(callbacks['param_a']) callbacks['param_a'](mode_obj,val);
		}));
		arr.push(this.shapeProperties.add(this.params, 'param_b').name('b = ').listen().onChange(function(val){
			if(callbacks['param_b']) callbacks['param_b'](mode_obj,val);
		}));
		if(this.mode == "3D" || this.mode  == "4D"){
			arr.push(this.shapeProperties.add(this.params, 'param_c').name('c = ').listen().onChange(function(val){
				if(callbacks['param_c']) callbacks['param_c'](mode_obj,val);
			}));
		}
		if(this.mode == "4D"){
			arr.push(this.shapeProperties.add(this.params, 'param_d').name('d = ').listen().onChange(function(val){
				if(callbacks['param_d']) callbacks['param_d'](mode_obj,val);
			}));
		}

		this.builtin_arr_param = this.constructExampleItems(this.mode,'parametric');

		this.paramSourceItems = arr;
	};

	GUI.prototype.destroyParamSource = function(){
		if(!this.paramSourceItems) return;
		for(var i=0;i<this.paramSourceItems.length;i++){
			this.shapeProperties.remove(this.paramSourceItems[i])
		}
		for (var i = 0; i < this.builtin_arr_param.length; i++) {
			this.builtinExamples.remove(this.builtin_arr_param[i]);
		}
		this.paramSourceItems = [];
		this.builtin_arr_param = [];
	};

	GUI.prototype.initConvexSource = function(){
		var arr = [];
		var callbacks = this.callbacks;
		var mode_obj = this.mode_obj;

		var points = this.shapeProperties.add(this.params, 'points').onChange(function(val){
			if(callbacks['points']) callbacks['points'](mode_obj,val);
		}).listen();
		arr.push(points);

		this.builtin_arr_convex = this.constructExampleItems(this.mode,'convex-hull');


		this.convexSourceItems = arr;
	};

	GUI.prototype.destroyConvexSource = function(){
		if(!this.convexSourceItems) return;
		for(var i=0;i<this.convexSourceItems.length;i++){
			this.shapeProperties.remove(this.convexSourceItems[i])
		}
		for (var i = 0; i < this.builtin_arr_convex.length; i++) {
			this.builtinExamples.remove(this.builtin_arr_convex[i]);
		}
		this.convexSourceItems = [];
		this.builtin_arr_convex = [];
	};

	GUI.prototype.constructExampleItems = function(mode,input){
		/* 
			Given a mode (ex '2D') and input (ex 'parametric')
			it will construct the gui items, add them to builtinExamples and 
			return the array of those items so you can destroy them later
		*/
		var dimension = 2;
		if(mode == "3D") dimension = 3;
		if(mode == "4D") dimension = 4;
		console.log("Constructing",mode,input)
		var params = this.params;
		var callbacks = this.callbacks;
		var mode_obj = this.mode_obj;

		var arr = [];

		for(var i=0;i<this.built_in_examples_data.length;i++){
			var datum = this.built_in_examples_data[i];
			if(datum.dimension == dimension && datum.input == input){
				// Construct a function that will set all the datum's data when called 
				this.params[datum.name] = (function(capturedDatum){
					// We need to create a closure to capture the value of the current datum, otherwise the scopes will be change by the time this funciton is called
					var d = capturedDatum;
					return function(){
						for(let param in d.data){
							if(d.data.hasOwnProperty(param)){
								params[param] = d.data[param];
								console.log(param,d.data[param])
								if(callbacks[param]) callbacks[param](mode_obj,params[param]);
							}
						}
					}
				})(datum);
				arr.push(this.builtinExamples.add(this.params,datum.name));
			}
		}

		return arr;
	}

	GUI.prototype.cleanup = function(){
		//Destroys everything created
		this.gui.destroy();
		// Reset all stuff
		this.convexSourceItems = null;
		this.paramSourceItems = null;
		this.cartesianSourceItems = null;
		this.builtin_arr_cartesian = null;
		this.builtin_arr_param = null;
		this.builtin_arr_convex = null;
	};

	scope.GUI = GUI;
	return GUI;
})(typeof exports === 'undefined' ? {} : exports);
