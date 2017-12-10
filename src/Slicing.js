/*
The slicing class contains pure functions for computing and rendering 
anything related to the right side of the screen (slices of higher dimensional objects)
*/
var Slicing = (function (scope) {
	function Slicing(){}

	Slicing.prototype.Slice2DMesh = function(mesh,uniforms,color){
		/* Takes a mesh and returns a version of it with a shader material that slices */
		vertexShader = `
			varying vec4 vertexPosition;
			void main() {
				vertexPosition = modelMatrix * vec4(position,1.0);
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); 
			}
		`;

		var fragmentShader =`
			varying vec4 vertexPosition;
			uniform vec2 axisValue;
			uniform float axis; // 0 is x, 1 is y  
			uniform float slice; 
			uniform float renderWholeShape;

			void main(){
				vec4 color = vec4(${color.r/255},${color.g/255},${color.b/255},1.0);
				vec2 p = vec2(vertexPosition.x,vertexPosition.y);

				gl_FragColor = color;
				if(slice == 0.0) return;
				// Slicing code 
				gl_FragColor.a = 1.0;
				float sliceThickness = 0.1;
				if(axis == 0.0){
					if(abs(p.x) > sliceThickness) {
						if(renderWholeShape == 1.0){
							gl_FragColor.a = 0.15;
						}
						else {
							discard;
						}
					}
				}
				if(axis == 1.0){
					if(abs(p.y) > sliceThickness) {
						if(renderWholeShape == 1.0){
							gl_FragColor.a = 0.15;
						}
						else {
							discard;
						}
					}
				}
			}
		`;

		var material = new THREE.ShaderMaterial({
			fragmentShader: fragmentShader,
			vertexShader: vertexShader, 
			uniforms: uniforms
		});
		material.transparent = true;

		if(mesh.type == "Object3D"){
			var container = new THREE.Object3D();
			for(var i=0;i<mesh.children.length;i++){
				var geometry = mesh.children[i].geometry.clone();
				var childMesh = new THREE.Line(geometry,material); ///////////////// THIS IS HARDCODED TO ONLY WORK WITH LINES!!!!
				container.add(childMesh);
			}
			return container;
		} else {
			var geometry = mesh.geometry.clone();
			var mesh = new THREE.Mesh( geometry, material );
			return mesh;
		}
	}

	Slicing.prototype.CartesianSlice3D = function(glslFuncString,uniforms,color){
		/* 
			Takes in a glsl function and an operator (>,< or =) and renders that 
		*/
		vertexShader = `
			varying vec4 vertexPosition;
			void main() {
				vertexPosition = modelMatrix * vec4(position,1.0);
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); 
			}
		`;

		var fragmentShader =`
			varying vec4 vertexPosition;
			uniform float axisValue;

			float eq(float x,float y,float axisValue){
				${glslFuncString}
			}


			void main(){
				vec4 color = vec4(${color.r/255},${color.g/255},${color.b/255},1.0);
				vec2 p = vec2(vertexPosition.x,vertexPosition.y);

				float val = eq(p.x,p.y,axisValue);
				if(val > 0.0) discard;

				gl_FragColor = color;
			}
		`;

		var geometry = new THREE.PlaneBufferGeometry(20, 20);
		var material = new THREE.ShaderMaterial({
			fragmentShader: fragmentShader,
			vertexShader: vertexShader, 
			uniforms: uniforms
		});

		var mesh = new THREE.Mesh(geometry, material);

		return mesh;
	}

	Slicing.prototype.CreateSliceShader3D = function(uniforms,color){
		vertexShader = `
			varying vec4 vertexPosition;
			void main() {
				vertexPosition = modelMatrix * vec4(position,1.0);
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); 
			}
		`;

		var fragmentShader =`
			varying vec4 vertexPosition;
			uniform float axisValue;

			void main(){
				vec4 color = vec4(${color.r/255},${color.g/255},${color.b/255},1.0);
				vec3 p = vertexPosition.xyz;
				float threshold = 0.1;
				// Offset shape 
				p.z -= axisValue; 

				if(p.z > threshold || p.z < -threshold) discard;

				gl_FragColor = color;
			}
		`;

		var material = new THREE.ShaderMaterial({
			fragmentShader: fragmentShader,
			vertexShader: vertexShader, 
			uniforms: uniforms,
			side:THREE.DoubleSide
		});

		return material;
	}

	Slicing.prototype.SliceConvex3D = function(mesh,axis,axisValue,color,outlineOnly){
		/*
		Given a 3D mesh and axis, return the new convex hull mesh of the intersection 
			Input: 
				mesh = the 3D mesh
				axis = "X" | "Y" | "Z"
				axis_value = axis position
				color = color of the slice
				outlineOnly = true: wireframe, false: solid
			Output:
				if there are at least 4 intersection points
					3D convex geometry meshmesh
				else
					nothing returned
		*/

		// Go through all the faces of the mesh
		axis = axis.toLowerCase();

		var axes = ['x','y','z']
		var index = axes.indexOf(axis);
		if (index > -1) {
			axes.splice(index,1);
		}

		var triangleArray = [];
		var container = new THREE.Object3D();

		var faces = mesh.geometry.faces;
		var vertices = mesh.geometry.vertices; 

		var intersection_points = [];

		for(var i=0;i<faces.length;i++){
			var f = faces[i];
			var point_a = {
				x:vertices[f.a].x,
				y:vertices[f.a].y,
				z:vertices[f.a].z
			};
			var point_b = {
				x:vertices[f.b].x,
				y:vertices[f.b].y,
				z:vertices[f.b].z
			};
			var point_c = {
				x:vertices[f.c].x,
				y:vertices[f.c].y,
				z:vertices[f.c].z
			};

			var point1 = this.CalculateIntersectionPoint3D(point_a,point_b,axis,axisValue);

			if (point1!=null) {
				intersection_points.push(
					new THREE.Vector3(
						point1[axes[0]],
						point1[axes[1]],
						Math.random() * 0.01
					)
				)
			}

			var point1 = this.CalculateIntersectionPoint3D(point_a,point_c,axis,axisValue);

			if (point1!=null) {
				intersection_points.push(
					new THREE.Vector3(
						point1[axes[0]],
						point1[axes[1]],
						Math.random() * 0.01
					)
				)
			}

			point1 = this.CalculateIntersectionPoint3D(point_b,point_c,axis,axisValue);

			if (point1!=null) {
				intersection_points.push(
					new THREE.Vector3(
						point1[axes[0]],
						point1[axes[1]],
						Math.random() * 0.01
					)
				)
			}

		}

		if(outlineOnly) {
			var geometry = new THREE.Geometry();
			geometry.vertices = intersection_points;

			var material = new MeshLineMaterial({color:new THREE.Color(color),lineWidth:0.1});
			var mesh = new THREE.LineSegments(geometry,material);
			return mesh;
		}
		if (intersection_points[3]) {

			var geometry = new THREE.ConvexGeometry( intersection_points );
			material = new THREE.MeshBasicMaterial( {color:new THREE.Color(color)} );
			var mesh = new THREE.Mesh( geometry, material );
			return mesh;
		} else {
			//console.log("not enough intersection points found");
			return;
		}

	}

	Slicing.prototype.SliceConvex4D = function(mesh,facets,axis,axisValue,color) {
		/*
		Given a 4D mesh and axis, return the new convex hull mesh of the intersection 
			Input: 
				mesh = the 4D mesh
				facets = [Facet] array of facet objects as defined in QuickHull4D.js
				axis = "X" | "Y" | "Z" | "W"
				axis_value = axis position
				color = color of the slice
			Output:
				if there are at least 4 intersection points
					3D convex geometry meshmesh
				else
					nothing returned
		*/

		// Get which axis we're slicing on
		axis = axis.toLowerCase();
		var axes = ['x','y','z','w']
		var index = axes.indexOf(axis);
		if (index > -1) {
			axes.splice(index,1);
		}


		var intersection_points = [];
		// Loop over all the edges and try to intersect 
		for(var i=0;i<facets.length;i++){
			var f = facets[i];
			for(var j=0;j<f.edges.length;j++){
				var edge = f.edges[j];
				var point_a = edge[0];
				var point_b = edge[1];
				var point = this.CalculateIntersectionPoint4D(point_a,point_b,axis,axisValue);

				if (point!=null) {
					intersection_points.push(
						new THREE.Vector3(
							point[axes[0]],
							point[axes[1]],
							point[axes[2]]
						)
					)
				}
			}
			
		}



		if (intersection_points.length >= 3) {

			geometry = new THREE.ConvexGeometry( intersection_points );
			material = new THREE.MeshPhongMaterial( {flatShading:true, color:color} );
			var mesh = new THREE.Mesh( geometry, material );
			return mesh;
		} else {
			return;
		}
	}

	Slicing.prototype.CalculateIntersectionPoint3D = function(p1,p2,axis,axis_value) {
		/*
		Given an edge (as 2 points) an axis, return the intersection point
			Input: 
				p1,p2 = {'x':val, 'y':val, 'z':val} representing 3D points
				axis = "x" | "y" | "z"
				axis_value = Number
			Output:
				if there is an intersection
					intersection_point: {'x':val, 'y':val, 'z':val}
				else
					nothing
		*/

		var axes = ['x','y','z']
		var index = axes.indexOf(axis);
		if (index > -1) {
			axes.splice(index,1);
		}

		if ((p1[axis] > axis_value) != (p2[axis] > axis_value)) {

			// TODO: check if line is parallel to the plane (dot product = 0)

			// Calculate the intersection point
			var direction = {}

			direction[axes[0]]=p1[axes[0]]-p2[axes[0]];
			direction[axes[1]]=p1[axes[1]]-p2[axes[1]];
			direction[axis] = p1[axis]-p2[axis];

			var t = (p1[axis] - axis_value)/(direction[axis]*-1);

			var intersection_point = {}

			intersection_point[axes[0]]=p1[axes[0]] + t*direction[axes[0]];
			intersection_point[axes[1]]=p1[axes[1]] + t*direction[axes[1]];
			intersection_point[axis]=axis_value;

			return intersection_point;

		} else{
			//console.log("no intersection point")
			return;
		}

	}

	Slicing.prototype.CalculateIntersectionPoint4D = function(p1,p2,axis,axis_value) {
		/*
		Given an edge (as 2 points) an axis, return the intersection point
			Input: 
				p1,p2 = {'x':val, 'y':val, 'z':val, 'w': val} representing 4D points
				axis = "x" | "y" | "z" | "w"
				axis_value = Number
			Output:
				if there is an intersection
					intersection_point: {'x':val, 'y':val, 'z':val, 'w': val}
				else
					nothing
		*/

		var axes = ['x','y','z','w']
		var index = axes.indexOf(axis);
		if (index > -1) {
			axes.splice(index,1);
		}

		if ((p1[axis] > axis_value) != (p2[axis] > axis_value)) {

			// TODO: check if line is parallel to the plane (dot product = 0)

			// Calculate the intersection point
			var direction = {}

			direction[axes[0]]=p1[axes[0]]-p2[axes[0]];
			direction[axes[1]]=p1[axes[1]]-p2[axes[1]];
			direction[axes[2]]=p1[axes[2]]-p2[axes[2]];
			direction[axis] = p1[axis]-p2[axis];

			var t = (p1[axis] - axis_value)/(direction[axis]*-1);

			var intersection_point = {}

			intersection_point[axes[0]]=p1[axes[0]] + t*direction[axes[0]];
			intersection_point[axes[1]]=p1[axes[1]] + t*direction[axes[1]];
			intersection_point[axes[2]]=p1[axes[2]] + t*direction[axes[2]];
			intersection_point[axis]=axis_value;
			return intersection_point;
		} else{
			//console.log("no intersection point")
			return;
		}
	}

	scope.Slicing = Slicing;
	return Slicing;
})(typeof exports === 'undefined' ? {} : exports);