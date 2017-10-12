/*
The projecting class contains pure functions for computing and rendering
anything related to the left side of the screen (projection n dimensional objects)
*/
var Projecting = (function (scope) {
	function Projecting(){

	}
	Projecting.prototype.ConvexHullMesh2D = function(vectorArray,color){
		/*
			Takes in an array of points in 2D space, and returns a mesh object
			covering their convex hull, ready to be added to a scene
				Input:
					Array of THREE.Vector2
				Output:
					Threejs Mesh
		*/

		var newVectorArray = [];
		for(var i=0;i<vectorArray.length;i++){
			var vec = new THREE.Vector3(vectorArray[i].x,vectorArray[i].y,Math.random()*0.01);
			newVectorArray.push(vec);
		}

		var geometry = new THREE.ConvexGeometry( newVectorArray );
		var material = new THREE.MeshBasicMaterial( {color: color} );
		var mesh = new THREE.Mesh( geometry, material );

		return mesh;
	}
	Projecting.prototype.ConvexHullMesh3D = function(vectorArray){
		/*
			Takes in an array of points in 3D space, and returns a mesh object
			covering their convex hull, ready to be added to a scene
				Input:
					Array of THREE.Vector3
				Output:
					Threejs Mesh
		*/
		var geometry = new THREE.ConvexGeometry( vectorArray );
		var material = new THREE.MeshPhongMaterial( {color: 0x00ff00, flatShading:true} );
		var mesh = new THREE.Mesh( geometry, material );

		return mesh;
	}
	Projecting.prototype.CartesianShaderMesh2D = function(glslFuncString,operator,uniforms,color){
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
        uniform vec2 axisValue;
        uniform float axis; // 0 is x, 1 is y  
        uniform float slice; 
        uniform float renderWholeShape;
        float eq(float x,float y){
        	${glslFuncString}
        }

        float distFromEq(float x, float y, float offX, float offY){
        	return (eq(x,y) - eq(x+offX,y+offY));
        }

        void main(){
        	vec4 color = vec4(${color.r/255},${color.g/255},${color.b/255},1.0);
        	vec2 p = vec2(vertexPosition.x,vertexPosition.y);

        	if(slice != 0.0){
        		if(axis == 0.0){
	        		p.x += axisValue.x;
	        	}
	        	if(axis == 1.0){
	        		p.y += axisValue.y;
	        	}
        	}

        	float val = eq(p.x,p.y);
        	
        	float d = 0.01;
        	float delta = (abs(distFromEq(p.x,p.y,0.0,d))
        				 +abs(distFromEq(p.x,p.y,d,0.0))
        				 +abs(distFromEq(p.x,p.y,-1.0*d,0.0))
        				 +abs(distFromEq(p.x,p.y,0.0,-1.0*d))) /4.0 ;

        	float thickness = delta * 13.0;
        	${ 
        		(operator == "<") ? 
        			'if(val > 0.0) discard;' 
        		: (operator == ">") ?
        			'if(val < 0.0) discard;'
        		: 	'if(val > thickness || val < -thickness) discard;'
        	}
        	gl_FragColor = color;
 			if(slice == 0.0) return;
 			// Slicing code 
 			gl_FragColor.a = 1.0;
 			float sliceThickness = 0.1;
        	if(axis == 0.0){
        		if(abs(vertexPosition.x) > sliceThickness) {
        			if(renderWholeShape == 1.0){
        				gl_FragColor.a = 0.15;
        			}
        			else {
        				discard;
        			}
        		}
        	}
        	if(axis == 1.0){
        		if(abs(vertexPosition.y) > sliceThickness) {
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

        var geometry = new THREE.PlaneBufferGeometry(20, 20);
        var material = new THREE.ShaderMaterial({
            fragmentShader: fragmentShader,
            vertexShader: vertexShader, 
            uniforms: uniforms
        });
        if(uniforms.slice.value) material.transparent = true;
        var mesh = new THREE.Mesh(geometry, material);

        return mesh;
	}
	Projecting.prototype.CartesianMesh2D = function(cartesianFunc){
		/*
			Takes in a cartesian equation as a JS func and returns a mesh to render it
		*/

		var edgeArray = Polygonize.generate(cartesianFunc, [[-10, 10], [-10, 10]], 60);
		var container = new THREE.Object3D();

		for(var i=0;i<edgeArray.length-1;i+=2){
			var edge = edgeArray[i];
			var nextEdge = edgeArray[i+1];
			var v1 = new THREE.Vector3( edge[0],edge[1], 0 );
			var v2 = new THREE.Vector3( nextEdge[0],nextEdge[1], 0 );
			var geometry = new THREE.Geometry();
			geometry.vertices.push( v1 );
			geometry.vertices.push( v2 );
			var line = new MeshLine();
			line.setGeometry( geometry );
			var material = new MeshLineMaterial({color:new THREE.Color(0x5a9b00),lineWidth:0.1});
			var mesh = new THREE.Mesh( line.geometry, material );
			container.add(mesh);
		}

		return container;
	}

	

	Projecting.prototype.ParametricMesh3D = function(paramFunc){
		var geometry = new THREE.ParametricBufferGeometry( paramFunc, 25, 25 );
		var material = new THREE.MeshPhongMaterial( {color: 0x00ff00, flatShading:false} );
		var mesh = new THREE.Mesh( geometry, material );
		return mesh;
	}

	scope.Projecting = Projecting;
	return Projecting;
})(typeof exports === 'undefined' ? {} : exports);
