/*
The slicing class contains pure functions for computing and rendering 
anything related to the right side of the screen (slices of higher dimensional objects)
*/
var Slicing = (function (scope) {
	function Slicing(){
		
	}

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

		var geometry = mesh.geometry.clone();
		var material = new THREE.ShaderMaterial({
            fragmentShader: fragmentShader,
            vertexShader: vertexShader, 
            uniforms: uniforms
        });
        material.transparent = true;
		var mesh = new THREE.Mesh( geometry, material );

		return mesh;
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
		// Go through all the faces of the mesh
		var triangleArray = [];
		var container = new THREE.Object3D();

		var faces = mesh.geometry.faces;
		var verts = mesh.geometry.vertices; 

		for(var i=0;i<faces.length;i++){
			var f = faces[i];
			var v1 = verts[f.a];
			var v2 = verts[f.b];
			var v3 = verts[f.c];
			
			triangleArray.push([v1,v2,v3]);
		}

		
		var vectorArray = [];
		var geometry = new THREE.Geometry();

		for(var i=0;i<triangleArray.length;i++){
			var p1 = triangleArray[i][0];
			var p2 = triangleArray[i][1];
			var p3 = triangleArray[i][2];

			var pToArr = function(p){
				return [p.x,p.y,p.z];
			}

			var points = this.CalculateIntersectionPoints(pToArr(p1),pToArr(p2),pToArr(p3),axis,axisValue);
			if(points.length == 0) continue; // This happens if there's no intersection 
			// Intersect the points and get two points
			var Z = Math.random() * 0.01; 
			var v1 = new THREE.Vector3(points[0],points[1],Z);
			var v2 = new THREE.Vector3(points[2],points[3],Z);
			// Draw a line between those two points 
			if(outlineOnly){
				
				geometry.vertices.push( v1 );
				geometry.vertices.push( v2 );
				
			} else {
				vectorArray.push(v1);
				vectorArray.push(v2);	
			}
			
			
		}

		if(outlineOnly){
			var material = new MeshLineMaterial({color:new THREE.Color(color),lineWidth:0.1});
			var mesh = new THREE.LineSegments(geometry,material);
			return mesh;
		} else {
			var geometry = new THREE.ConvexGeometry( vectorArray );
			var material = new THREE.MeshBasicMaterial( {color: color} );
			var mesh = new THREE.Mesh( geometry, material );
			return mesh;	
		}
		
	}

	Slicing.prototype.CalculateIntersectionPoints = function(p1,p2,p3,axis,axis_value) {
		/*
		Given a triangle (as 3 points) and a line (an axis), return the two points of intersection 
			Input: 
				p1,p2,p3 = [Number,Number,Number] representing 3D points
				axis = "X" | "Y" | "Z"
				axis_value = Number
			Output:
				[x,y,x,y] 
		*/
		var axis_conv = {'X':0, 'Y':1, 'Z':2}
		var chosen_axis = 1;
		var other_axis_one = 0;
		var other_axis_two = 2;
		if(axis == "X"){
			chosen_axis = 0;
			other_axis_one = 2;
			other_axis_two = 1;
		}
		if(axis == "Z"){
			chosen_axis = 2;
			other_axis_one = 1;
			other_axis_two = 0;
		}

		//if (axis == 'Y') { // currently only handles Y axis. Needs to be generalized to X and Y

		var intersection_point = [];

		var above = [];
		var below = [];
		if (p1[axis_conv[axis]] > axis_value) above.push(p1);
		else below.push(p1);

		if (p2[axis_conv[axis]] > axis_value) above.push(p2);
		else below.push(p2);

		if (p3[axis_conv[axis]] > axis_value) above.push(p3);
		else below.push(p3);

		// If completely above or completely below, then no intersection 
		if(below.length == 3 || above.length == 3) return [];

		if (below.length > 1) {

		  var direction = [3];
		  direction[0] = below[0][axis_conv['X']] - above[0][axis_conv['X']];
		  direction[1] = below[0][axis_conv['Y']] - above[0][axis_conv['Y']];
		  direction[2] = below[0][axis_conv['Z']] - above[0][axis_conv['Z']];

		  var t = (below[0][chosen_axis] - axis_value)/(direction[chosen_axis]*-1);

		  intersection_point[0] = below[0][other_axis_one] + t * direction[other_axis_one];
		  //intersection_point[1] = axis_value;
		  intersection_point[1] = below[0][other_axis_two] + t * direction[other_axis_two];

		  direction[0] = below[1][axis_conv['X']] - above[0][axis_conv['X']];
		  direction[1] = below[1][axis_conv['Y']] - above[0][axis_conv['Y']];
		  direction[2] = below[1][axis_conv['Z']] - above[0][axis_conv['Z']];

		  t = (below[1][chosen_axis] - axis_value)/(direction[chosen_axis]*-1);

		  intersection_point[2] = below[1][other_axis_one] + t * direction[other_axis_one];
		  //intersection_point[4] = axis_value;
		  intersection_point[3] = below[1][other_axis_two] + t * direction[other_axis_two];

		  return intersection_point;
		}
		else {
		  var direction = [3];
		  direction[0] = above[0][axis_conv['X']] - below[0][axis_conv['X']];
		  direction[1] = above[0][axis_conv['Y']] - below[0][axis_conv['Y']];
		  direction[2] = above[0][axis_conv['Z']] - below[0][axis_conv['Z']];

		  var t = (above[0][chosen_axis] - axis_value)/(direction[chosen_axis]*-1);

		  intersection_point[0] = above[0][other_axis_one] + t * direction[other_axis_one];
		  //intersection_point[1] = axis_value;
		  intersection_point[1] = above[0][other_axis_two] + t * direction[other_axis_two];

		  direction[0] = above[1][axis_conv['X']] - below[0][axis_conv['X']];
		  direction[1] = above[1][axis_conv['Y']] - below[0][axis_conv['Y']];
		  direction[2] = above[1][axis_conv['Z']] - below[0][axis_conv['Z']];

		  var t = (above[1][chosen_axis] - axis_value)/(direction[chosen_axis]*-1);

		  intersection_point[2] = above[1][other_axis_one] + t * direction[other_axis_one];
		  //intersection_point[4] = axis_value;
		  intersection_point[3] = above[1][other_axis_two] + t * direction[other_axis_two];

		  return intersection_point;
		}
	}
	scope.Slicing = Slicing;
	return Slicing;
})(typeof exports === 'undefined' ? {} : exports);