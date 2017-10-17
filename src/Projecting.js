/*
The projecting class contains pure functions for computing and rendering
anything related to the left side of the screen (projection n dimensional objects)
*/
var Projecting = (function (scope) {
	function Projecting(){

	}
	Projecting.prototype.PolygonizeCartesian3D = function(equationString,resolution,color){
		/*
			Takes in an equation string, polygonizes it into an array of trianges, and draws those trianges
			returns a mesh
		 */
		let sides = equationString.split('=');
		let LHS = sides[0];
		let RHS = sides[1];
		let LHSfunc = Parser.parse(LHS).toJSFunction(['x','y','z']);
		let RHSfunc = Parser.parse(RHS).toJSFunction(['x','y','z']);
		var eq = function(x,y,z) { return LHSfunc(x,y,z) - RHSfunc(x,y,z); };

		//Parses the equation, and polygonizes it
		try {
			var triangleArray = [];
			triangleArray = Polygonize.generate(eq, [[-10, 10], [-10, 10], [-10, 10]], resolution);

			var material = new THREE.MeshPhongMaterial( {color: color, flatShading:true , side:THREE.DoubleSide} );
			//var container = new THREE.Object3D();
			var geometry = new THREE.Geometry();

			for(var i=0;i<triangleArray.length;i+=3){
				var point1 = {x:triangleArray[i][0],  y:triangleArray[i][1],  z:triangleArray[i][2]};
				var point2 = {x:triangleArray[i+1][0],y:triangleArray[i+1][1],z:triangleArray[i+1][2]};
				var point3 = {x:triangleArray[i+2][0],y:triangleArray[i+2][1],z:triangleArray[i+2][2]};

				var v1 = new THREE.Vector3(point1.x,point1.y,point1.z);
				var v2 = new THREE.Vector3(point2.x,point2.y,point2.z);
				var v3 = new THREE.Vector3(point3.x,point3.y,point3.z);

				// var geometry = new THREE.Geometry();
				geometry.vertices.push(v1);
				geometry.vertices.push(v2);
				geometry.vertices.push(v3);
				geometry.faces.push(new THREE.Face3(i,i+1,i+2));
				// geometry.faces.push(new THREE.Face3(0, 1, 2));
				// var mesh = new THREE.Mesh( geometry, material );
				// container.add(mesh);
			}

			return new THREE.Mesh( geometry, material );
			// return container;

		} catch(err){
			console.log("Error rendering equation",err);
		}
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
	Projecting.prototype.ConvexHullMesh3D = function(vectorArray,color){
		/*
			Takes in an array of points in 3D space, and returns a mesh object
			covering their convex hull, ready to be added to a scene
				Input:
					Array of THREE.Vector3
				Output:
					Threejs Mesh
		*/
		var geometry = new THREE.ConvexGeometry( vectorArray );
		var material = new THREE.MeshPhongMaterial( {color: color, flatShading:true} );
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

    Projecting.prototype.ParametricMesh2D = function(funcString, uniforms) {
        var vertexShader = `
            varying vec4 vertexPosition;
            void main() {
                vertexPosition = modelMatrix * vec4(position,1.0);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
                gl_Position.y += sin(gl_Position.x);
            }
        `;

        var fragmentShader = `
            varying vec4 vertexPosition;

            ${funcString}

            void main() {
                vec2 p = vec2(vertexPosition.x,vertexPosition.y);
                vec4 color = vec4(1.0, 1.0, 1.0, 1.0);
                gl_FragColor = vec4(0.0);
                return;

                gl_FragColor = color;
            }
        `;


        // var modifier = new THREE.BufferSubdivisionModifier(1);
        var geometry = new THREE.PlaneBufferGeometry(10, 10,100,100);
        // var geometry = new THREE.PlaneGeometry(20, 20);
        // console.log("geometry:", geometry)
        // geometry = modifier.modify(geometry);

        var material = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: uniforms
        });

        color = 0xff0000;

        //material = new THREE.MeshBasicMaterial( {color: color, flatShading:true} );
        
        var mesh = new THREE.Mesh(geometry, material);

        // mesh.add( new THREE.LineSegments(

        //         new THREE.Geometry(),

        //         new THREE.LineBasicMaterial( {
        //             color: 0xffffff,
        //             transparent: false,
        //             opacity: 1.0
        //         } )

        //     ) );

        return mesh;
    }

	Projecting.prototype.CreateParametricFunction = function(xFunc,yFunc,zFunc,aRange,bRange){

		var xFunction = Parser.parse(xFunc).toJSFunction(['a','b']);
		var yFunction = Parser.parse(yFunc).toJSFunction(['a','b']);
		var zFunction = Parser.parse(zFunc).toJSFunction(['a','b']);

		var re = new RegExp(/\s*<\s*[abc]\s*<\s*/);

		var aRangeParts = aRange.split(re);
		var aMin = Parser.evaluate(aRangeParts[0]);
		var aMax = Parser.evaluate(aRangeParts[1]);
		var aRange = aMax-aMin;

		bRangeParts = bRange.split(re);
		var bMin = Parser.evaluate(bRangeParts[0]);
		var bMax = Parser.evaluate(bRangeParts[1]);
		var bRange = bMax-bMin;

		function paramFunc ( a, b, optionalTarget ) {

			var result = optionalTarget || new THREE.Vector3();

			var newA = aRange * a + aMin;
			var newB = bRange * b + bMin;

			var x, y, z;

			x = xFunction(newA,newB);
			y = yFunction(newA,newB);
			z = zFunction(newA,newB);
			
			return result.set( x, y, z );
		}

		return paramFunc;

	}

	Projecting.prototype.ParametricMesh3D = function(paramFunc,color){

		var geometry = new THREE.ParametricBufferGeometry( paramFunc, 25, 25 );
		var material = new THREE.MeshPhongMaterial( {color: color, flatShading:true, side:THREE.DoubleSide } );
		var mesh = new THREE.Mesh( geometry, material );
		return mesh;
	}

	scope.Projecting = Projecting;
	return Projecting;
})(typeof exports === 'undefined' ? {} : exports);
