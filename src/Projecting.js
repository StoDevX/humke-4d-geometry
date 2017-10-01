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
			var vec = new THREE.Vector3(vectorArray[i].x,vectorArray[i].y,0);
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
	

	scope.Projecting = Projecting;
	return Projecting;
})(typeof exports === 'undefined' ? {} : exports);