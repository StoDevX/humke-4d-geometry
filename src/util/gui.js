// Class for creating & handling the dat.gui controls
// as well as creating a common interface for all modes to use

var GUI = (function (scope) {
	//Constructor
	function GUI(){}

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
			'fill': true,

			// Viewing Controls
			'axis_value':0.1,
			'axis':'Y',
			'samples':200,
			'thickness':'medium',
			'show left view': true,
			'show right view': true,

			// Builtin Examples 2D
			'Filled in Circle': function() {}, // cartesian examples
			'Parabola': function() {},
			'Heart': function() {}, // parametric examples
			'Diamond': function() {}, // convex hall examples

			// Builtin Examples 3D
			'Spiral Tube': function() {},

			// Builtin Examples 4D
			'Random 16 Points': function() {},
			'Tesseract': function() {},
			'Fuzzy Tesseract': function() {},
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

			// builtin examples
			'Filled in Circle': function() {
				params.equation = 'x^2 + y^2 < 9';
				if (callbacks['equation']) callbacks['equation'](mode_obj,params.equation);
			},
			'Parabola': function() {
				params.equation = 'y = x^2';
				if (callbacks['equation']) callbacks['equation'](mode_obj,params.equation);
			},
			'Heart': function() {
				params.param_eq_x = 'b * (1-cos(a))*sin(a) * 5';
				params.param_eq_y = 'b * (1-cos(a))*cos(a) * 5';
				params.param_a = '0 < a < 2 * PI';
				params.param_b = '0 < b < 0.5';

				if(callbacks['param_eq_x']) callbacks['param_eq_x'](mode_obj,params.param_eq_x);
				if(callbacks['param_eq_y']) callbacks['param_eq_y'](mode_obj,params.param_eq_y);
				if(callbacks['param_a']) callbacks['param_a'](mode_obj,params.param_a);
				if(callbacks['param_b']) callbacks['param_b'](mode_obj,params.param_b);
			},
			'Diamond': function() {
				params.points = '(0,5),(5,0),(0,-5),(-5,0)';
				if(callbacks['points']) callbacks['points'](mode_obj,params.points);
			}
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

			// builtin examples
			'Spiral Tube': function () {
				params.param_eq_x = 'b * cos(a) - c * sin(a)';
				params.param_eq_y = 'b * sin(a) + c * cos(a)';
				params.param_eq_z = 'a/3';
				params.param_a = '-4 * PI < a < 4 * PI';
				params.param_b = '0 < b < 1';
				params.param_c = '0 < c < 1';

				if(callbacks['param_eq_x']) callbacks['param_eq_x'](mode_obj,params.param_eq_x);
				if(callbacks['param_eq_y']) callbacks['param_eq_y'](mode_obj,params.param_eq_y);
				if(callbacks['param_eq_z']) callbacks['param_eq_z'](mode_obj,params.param_eq_z);
				if(callbacks['param_a']) callbacks['param_a'](mode_obj,params.param_a);
				if(callbacks['param_b']) callbacks['param_b'](mode_obj,params.param_b);
				if(callbacks['param_c']) callbacks['param_c'](mode_obj,params.param_c);
			}
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
			'Random 16 Points': function(){
				params.points = '(0.8143297795339766,0.440590428598775,-0.9966778149797374,0.8359636104069312),(0.04038574084675473,0.7631382697849891,0.06488647783630208,0.5470246612532295),(-0.1565304241669647,-0.8068455753911711,-0.6535871109492957,-0.8385764358924482),(0.04584069274909863,0.4445148496371831,0.9610665477449694,0.6454526024362561),(0.1218762687611172,0.3744402885198968,-0.7820816028696314,-0.4455011351457807),(0.4624172658309502,-0.1530246242443329,0.1151336972742656,-0.9479586388431104),(-0.3408434431448983,-0.555754094902197,-0.5590764978519422,-0.3987028481426675),(-0.9987734397861859,-0.3852024957399839,-0.09835071312110011,-0.9804424829598912),(-0.2968112596280977,-0.5068460726242942,-0.5619464559126146,-0.6340879515130893),(0.8837960566243119,-0.03969105802447637,0.9123802677843536,0.3751456852770836),(-0.926478310419692,0.6790362016102636,0.5614273236705245,-0.09098328937867961),(0.8438482990896778,0.5583483703046557,0.1610475146780233,0.7255701075546166),(0.656784166262284,0.5714694043355708,0.6862663698254772,0.07886445995314473),(-0.5250300108688232,-0.1793963892193478,0.8848799689532072,0.1776234453335623),(-0.6827634951870549,0.7939339091944824,-0.3528022080220302,0.4532847092051848),(0.3560962382295134,0.9094653110108015,-0.6165327854608491,-0.06652824121204037)';
				if(callbacks['points']) callbacks['points'](mode_obj,params.points);
			},
			'Fuzzy Tesseract': function(){
				params.points = '(-0.6135040544809501,-0.7083600692364611,-0.5532885895557511,-0.5131218627160746),(-0.9842106083758724,-0.8207424333121265,-0.9683424631029903,1.4057348770052331),(-0.5697005257810093,-0.8371310430270666,1.2695145619644275,-0.5438871799594522),(-0.6488804316618471,-0.8309874639248714,1.4489868027290274,1.2190381841698894),(-0.8527501119990695,1.4767111248825837,-0.6223483359549299,-0.958514618846246),(-0.8719088945840796,1.2043793208396778,-0.778504127489394,1.0726383532981478),(-0.8150201476369433,1.1593300470715358,1.3241994726214465,-0.9134777170826138),(-0.5136285240710708,1.3126778815306204,1.1635232949864884,1.1434050681805707),(1.4496085828755867,-0.7588841106040601,-0.7675349996521015,-0.9644440660699956),(1.1138085563711295,-0.9343847682950754,-0.9878665961486663,1.2654405274979101),(1.4852120610231325,-0.8052638963593651,1.2905424483642889,-0.5363260155288426),(1.0638587223425637,-0.822598163435883,1.1927779565077992,1.0856158654972432),(1.1140063839005623,1.4235965015513352,-0.8759095666831993,-0.7842518221550617),(1.4846413452736238,1.4954608508669196,-0.544027849412986,1.338911616702881),(1.4978930769746726,1.1005609046450204,1.0523788850998328,-0.9513194120213813),(1.0381154196359161,1.24724782192578,1.09612303905524,1.0109194774099028)';
				if(callbacks['points']) callbacks['points'](mode_obj,params.points);
			},
			'Tesseract': function(){
				params.points = '(-1.0,-1.0,-1.0,-1.0),(1.0,-1.0,-1.0,-1.0),(-1.0,1.0,-1.0,-1.0),(1.0,1.0,-1.0,-1.0),(-1.0,-1.0,1.0,-1.0),(1.0,-1.0,1.0,-1.0),(-1.0,1.0,1.0,-1.0),(1.0,1.0,1.0,-1.0),(-1.0,-1.0,-1.0,1.0),(1.0,-1.0,-1.0,1.0),(-1.0,1.0,-1.0,1.0),(1.0,1.0,-1.0,1.0),(-1.0,-1.0,1.0,1.0),(1.0,-1.0,1.0,1.0),(-1.0,1.0,1.0,1.0),(1.0,1.0,1.0,1.0)';
				if(callbacks['points']) callbacks['points'](mode_obj,params.points);
			}
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
	}

	// Functions for creating the controls for the 3 different inputs (cartesian, parametric and convex hull)
	GUI.prototype.initCartesianSource = function(){
		var arr = [];
		var builtin_arr = [];
		var callbacks = this.callbacks;
		var mode_obj = this.mode_obj;

		var eq = this.shapeProperties.add(this.params, 'equation').name('Equation').onChange(function(val){
			if(callbacks['equation']) callbacks['equation'](mode_obj,val);
		});
		arr.push(eq);
		// var res = this.shapeProperties.add(this.params, 'resolution', 20, 200).name('Resolution').step(1).onChange(function(val){
		// 	if(callbacks['resolution']) callbacks['resolution'](mode_obj,val);
		// });
		var res = this.shapeProperties.add(this.params, 'resolution',['low','medium','high']).name('Resolution').onChange(function(val){
			if(val == 'low'){

			}
			if(val == 'medium'){

			}
			if(val == 'high'){

			}

			if(callbacks['resolution']) callbacks['resolution'](mode_obj,val);
		});
		arr.push(res);

		// Now for Builtin Examples
		if (this.mode == '2D') {
			var filled_in_circle = this.builtinExamples.add(this.params, 'Filled in Circle');
			var parabola = this.builtinExamples.add(this.params, 'Parabola');
			builtin_arr.push(filled_in_circle); builtin_arr.push(parabola);
		}

		this.cartesianSourceItems = arr;
		this.builtin_arr_cartesian = builtin_arr;
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
		var builtin_arr = [];
		var names = ["param_eq_x","param_eq_y","param_a","param_b","param_eq_z","param_c","param_eq_w","param_d"]
		var callbacks = this.callbacks;
		var mode_obj = this.mode_obj;

		if(this.mode == "2D"){
			var fill_item = this.shapeProperties.add(this.params, 'fill').name("Fill Shape").listen().onChange(function(val){
				if(callbacks['fill']) callbacks['fill'](mode_obj,val);
			});
			arr.push(fill_item);
		}

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

		// Now for Builtin Examples
		if (this.mode == '2D') {
			var heart = this.builtinExamples.add(this.params, 'Heart');
			builtin_arr.push(heart);
		} else if (this.mode == '3D') {
			var spiral = this.builtinExamples.add(this.params, 'Spiral Tube');
		} 

		this.paramSourceItems = arr;
		this.builtin_arr_param = builtin_arr;
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
		var builtin_arr = [];
		var callbacks = this.callbacks;
		var mode_obj = this.mode_obj;

		var points = this.shapeProperties.add(this.params, 'points').onChange(function(val){
			if(callbacks['points']) callbacks['points'](mode_obj,val);
		}).listen();
		arr.push(points);

		if (this.mode == '2D') {
			var diamond = this.builtinExamples.add(this.params, 'Diamond');
			builtin_arr.push(diamond);
		} else if(this.mode == '4D'){
			var randomPoints = this.builtinExamples.add(this.params,'Random 16 Points');
			var fuzzyTesseract = this.builtinExamples.add(this.params,'Fuzzy Tesseract');
			var tesseract = this.builtinExamples.add(this.params,'Tesseract');
			
			builtin_arr.push(randomPoints)
			builtin_arr.push(fuzzyTesseract)
			builtin_arr.push(tesseract)
		}

		this.convexSourceItems = arr;
		this.builtin_arr_convex = builtin_arr;
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
