/*
The projecting class contains pure functions for computing and rendering
anything related to the left side of the screen (projection n dimensional objects)
*/
var Projecting = (function (scope) {
	function Projecting(){

	}
	Projecting.prototype.ConvexHullMesh2D = function(vectorArray){
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
		var material = new THREE.MeshBasicMaterial( {color: 0x5a9b00} );
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
	Projecting.prototype.CartesianShaderMesh2D = function(glslFuncString,operator){
		/* 
			Takes in a glsl function and an operator (>,< or =) and renders that 
		*/
		var vertexShader = "varying vec4 vertexPosition;"
        vertexShader +=    "void main() {"
        vertexShader +=        "vertexPosition = modelMatrix * vec4(position,1.0);"
        vertexShader +=        "gl_Position = projectionMatrix *"
        vertexShader +=                     " modelViewMatrix *"
        vertexShader +=                     "vec4(position,1.0); "
        vertexShader +=         "}"

        var fragmentShader = "varying vec4 vertexPosition;";
        fragmentShader += "float eq(float x,float y){";
        fragmentShader += glslFuncString;
        fragmentShader += "}"
        fragmentShader += "void main() {"
        fragmentShader += "vec4 color = vec4(0.0);"
        fragmentShader += "float val = eq(vertexPosition.x,vertexPosition.y);"
        fragmentShader += "float thickness = 0.5;"
        if(operator == "<")
        	fragmentShader += "if(val < 0.0) color.r = 1.0; else discard;"
        else if (operator == ">")
        	fragmentShader += "if(val > 0.0) color.r = 1.0; else discard;"
        else
        	fragmentShader += "if(val <= thickness && val >= -thickness) color.r = 1.0; else discard;"
        
        fragmentShader += "gl_FragColor = color;"
        fragmentShader += "}"  

        var geometry = new THREE.PlaneBufferGeometry(20, 20);
        var material = new THREE.ShaderMaterial({
            fragmentShader: fragmentShader,
            vertexShader: vertexShader
        });
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

	scope.Projecting = Projecting;
	return Projecting;
})(typeof exports === 'undefined' ? {} : exports);
