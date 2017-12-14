/*
This class is for misc. functions that don't fit anywhere else.
*/
var Util = (function (scope) {
	function Util(){
		this.keysDown = {};
		this.keyMap = {};
		// Add the letters
		for (i = 97; i < 123; i++) this.keyMap[String.fromCharCode(i)] = i - 32
		this.keyMap['space'] = 32;
	}

	Util.prototype.SetupKeyListeners = function(){
		document.addEventListener("keydown", onDocumentKeyDown, false);
		document.addEventListener("keyup", onDocumentKeyUp, false);
		var self = this;
		function onDocumentKeyDown(event) {
		    var keyCode = event.which;
		    self.keysDown[keyCode] = true;
		}
		function onDocumentKeyUp(event) {
		    var keyCode = event.which;
		    delete self.keysDown[keyCode];
		}
	}
	Util.prototype.isKeyDown = function(key){
		key = key.toLowerCase();
		if(this.keyMap[key] == undefined){
			console.error("The key " + key + " is not defined in the map! Go to util.js and define it in this.keyMap");
		}
		return this.keysDown[this.keyMap[key]];
	}


	Util.prototype.SetLeftDivVisibility = function(visible){
		var l = document.querySelector("#left-view");
		var r = document.querySelector("#right-view");
		if (!visible) {
			l.style.display = "none";
			r.style.margin = "0 auto";
		} else {
			l.style.display = "block";
			delete r.style.margin;
		}
	}

	Util.prototype.SetRightDivVisibility = function(visible){
		var l = document.querySelector("#left-view");
		var r = document.querySelector("#right-view");
		if (!visible) {
			r.style.display = "none";
			l.style.margin = "0 auto";
		} else {
			r.style.display = "block";
			delete l.style.margin;
		}
	}

	Util.prototype.GetUndirectedEdgesOfTetrahedron = function(tetrahedron) {
		return [tetrahedron[0],tetrahedron[1],
						tetrahedron[1], tetrahedron[2],
						tetrahedron[2], tetrahedron[0],
						tetrahedron[2], tetrahedron[3],
						tetrahedron[0], tetrahedron[3],
						tetrahedron[1], tetrahedron[3]];
	}

	Util.prototype.FlattenFacets = function(facets, points) {
		var edges_arr = [];
		for (var facet_i = 0; facet_i < facets.length; facet_i++) {
			var edges_of_facet = this.GetUndirectedEdgesOfTetrahedron(facets[facet_i]);
			edges_arr = edges_arr.concat(edges_of_facet);
		}

		for (var i = 0; i < edges_arr.length; i++) {
			edges_arr[i] = points[edges_arr[i]];
		}

		var flattened_edges_arr = [];
		for (var i = 0; i < edges_arr.length; i++) {
			flattened_edges_arr = flattened_edges_arr.concat(edges_arr[i]);
		}

		return flattened_edges_arr;
	}

	Util.prototype.ConstructGLSLFunction = function(equationString){
		/*
			Takes an equation as a string (for ex: "x^2 + y^2 = 10")
			and return GLSL syntax as a string, for example:
			"return pow(x,2.0) + pow(y,2.0) - 10.0;"
		 */
		 var operator = "=";
		 var sides = equationString.split("=");
		 if(sides.length == 1) {
			sides = equationString.split(">");
			operator = ">";
		 }
		 if(sides.length == 1) {
			sides = equationString.split("<");
			operator = "<";
		 }

		 var LHS = sides[0];
		 var RHS = sides[1];

		 var LHSglsl = GLSLParser.parse(LHS).toString(true);
		 var RHSglsl = GLSLParser.parse(RHS).toString(true);

		 var fullGLSL = "return " + LHSglsl + " - (" + RHSglsl + ");";
		 return [fullGLSL,operator];
	}

	Util.prototype.HexToRgb = function(hex) {
		// Source: https://stackoverflow.com/a/5624139/1278023
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	}

	Util.prototype.componentToHex = function(c) {
		c = Math.round(c);
	    var hex = c.toString(16);
	    return hex.length == 1 ? "0" + hex : hex;
	}

	Util.prototype.rgbToHex = function(r, g, b) {
		return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
	}

	Util.prototype.Line = function(p1, p2,color,lineWidth){
		/*
			Creates a mesh line out of two points that look like {x:[num],y:[num],z:[num]}
		 */
		if(color == undefined) color = 0x5a9b00;
		if(lineWidth == undefined) lineWidth = 0.1;
		var v1 = new THREE.Vector3( p1.x,p1.y,p1.z );
		var v2 = new THREE.Vector3( p2.x,p2.y,p2.z );
		var geometry = new THREE.Geometry();
		geometry.vertices.push( v1 );
		geometry.vertices.push( v2 );
		var line = new MeshLine();
		line.setGeometry( geometry );
		var material = new MeshLineMaterial({color:new THREE.Color(color),lineWidth:lineWidth});
		var mesh = new THREE.Mesh( line.geometry, material );

		return mesh;
	}

	Util.prototype.RenderPoints = function(pointsArray){
		/*
			Given an array of 3D points, return an object holding them, ready to be
			added to a scene
		 */
		var pointsGeometry = new THREE.Geometry();

		for ( var i = 0; i < pointsArray.length; i ++ ) {
			pointsGeometry.vertices.push( pointsArray[i] );
		}

		var material = new THREE.PointsMaterial( { color:0xff0000, size:10, sizeAttenuation:false } );
		var mesh = new THREE.Points( pointsGeometry, material );

		return mesh;
	}

	Util.prototype.ParseConvexPoints = function(string){
		/*
			Takes in a string a points, and returns an array of points.
			Turns "(1,1),(2,2),(3,3)"             -> [{x:1,y:1},{x:2,y:2},{x:3,y:3}]
			and   "(1,1,1),(2,2,2),(3,3,3)"       -> [{x:1,y:1,z:1},{x:2,y:2,z:2},{x:3,y:3,z:3}]
			and   "(1,1,1,1),(2,2,2,2),(3,3,3,3)" -> [{x:1,y:1,z:1,w:1},{x:2,y:2,z:2,w:2},{x:3,y:3,z:3,w:3}]
				Input:
					A string formatted as "(Number,Number)" | "(Number,Number,Number)" | "(Number,Number,Number,Number)"
				Output:
					[{x:Number,y:Number}] including z and w for up to 4 numbers.
		*/

		// Remove whitespace
		var points_str = string.replace(/\s+/g, '');
		// Split based on the regex pattern. Should match all of the following:
		//               (1,2), (3,4),(4,3,32), (-3,4,67.5,3), (4,-4.6,5,332,3)
		var points_split = points_str.match(/\((-*[.\d]+,)+-*[.\d]+\)/g);
		var pointsArray = [];

		if(points_split == null){
			console.error("Convex Hull Parsing Error:","Failed to parse points. Malformed input.");
			return pointsArray;
		}

		for(var i=0;i<points_split.length;i++){
			var p = points_split[i];
			// Remove parenthesis
			p = p.replace(/[\(\)]/g,'');
			// Split by comma
			var comma_split = p.split(",")
			var point = {};
			var map = ['x','y','z','w'];
			for(var j=0;j<comma_split.length;j++){
				if(j >= 4){
					console.error("Convex Hull Parsing Error:","Detected points with more than 4 coordinates. Ignoring extra coordinates.");
					break;
				}
				if(Number(comma_split[j]) == undefined){
					console.error("Convex Hull Parsing Error:","Found undefined number. Returning empty array.");
					return [];
				}
				point[map[j]] = Number(comma_split[j]);

			}
			pointsArray.push(point)
		}

		return pointsArray;
	}

	Util.prototype.ResizeScenes = function(self) {
		var viewWidth = (window.innerWidth-50)/2;

		self.leftRenderer.setSize(viewWidth, window.innerHeight);
		self.leftCamera.aspect = viewWidth / window.innerHeight;
		self.leftCamera.updateProjectionMatrix();

		self.rightRenderer.setSize(viewWidth, window.innerHeight);
		self.rightCamera.aspect = viewWidth / window.innerHeight;
		self.rightCamera.updateProjectionMatrix();
	}

	Util.prototype.CleanUpScene = function(scene) {
		/*
			Given an three.js scene, remove all of the
			objects (the children) in the scene
		 */
		// Reset visibility on divs 
		this.SetLeftDivVisibility(true);
		this.SetLeftDivVisibility(true);
		while (scene.children.length) {

				var obj = scene.children[0];

				if (obj.isMesh || obj.isLine) {
					obj.geometry.dispose();
					obj.material.dispose();
				} else if (obj.isSprite) {
					obj.material.dispose();
				} else if (obj.isLight) {
					// lights only need to be removed
				}
				else {
					console.log("unidentified object of type " + obj.type + " was not destroyed")
					console.log(obj);
				}
			scene.remove(obj);
		}
	}

	scope.Util = Util;
	return Util;
})(typeof exports === 'undefined' ? {} : exports);