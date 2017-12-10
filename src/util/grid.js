/*
Grid has various utility functions for creating the grid, axes and labels
*/
var Grid = (function (scope) {
	function Grid(){}

	Grid.prototype.CreateGrid = function(plane){
		var size = 20;
		var divisions = 20;
		var gridHelper = new THREE.GridHelper(size,divisions,0x444444,0xd0d0d0);

		if (plane=="XY"){
			gridHelper.rotation.x = Math.PI/2;
		} else if (plane=="YZ") {
			gridHelper.rotation.z = Math.PI/2;
		}

		return gridHelper;
	}

	Grid.prototype.CreateAxis = function(axis){
		var coneRadius = 0.2;
		var coneHeight = 0.5;
		var coneGeometry = new THREE.ConeGeometry(coneRadius, coneHeight, 32);
		coneGeometry.translate(0,10.2,0); // move cone to tip of cylinder

		var cylinderRadius = 0.05;
		var cylinderHeight = 20;
		var cylinderGeometry = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, cylinderHeight, 32);

		cylinderGeometry.merge(coneGeometry); // combine the cone and cylinder
		var material = new THREE.MeshBasicMaterial( {color: 0x000000} );
		var cylinder = new THREE.Mesh( cylinderGeometry, material );

		// axis is already positioned to be the Y axis,
		// but for other axis...
		if(axis == "X") {
			cylinder.rotateZ(-Math.PI/2);
		} else if (axis == "Z") {
			cylinder.rotateX(Math.PI/2);
		} else if (axis == "W") {
			// a bit confusing, but it is the not the point of the
			// axis that looks at the point, it is the edge
			cylinder.lookAt(new THREE.Vector3(10, -10, -10));
		}

		return cylinder;
	}

	Grid.prototype.CreateLabel = function(message,x,y,z){
		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext('2d');
		ctx.font = "40px Arial";
		ctx.fillText( message, canvas.width/2, canvas.height/2);

		// canvas contents will be used for a texture
		var texture = new THREE.Texture(canvas)
		texture.needsUpdate = true;

		var material = new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide});
		material.transparent = true; 

		var ratio = canvas.height / canvas.width; 
		var W = 7;
		var H = W * ratio;

		var mesh = new THREE.Mesh(new THREE.PlaneGeometry(W,H),material);
		mesh.position.set(x,y,z);
		mesh.ctx = ctx;
		mesh.canvas = canvas;

		return mesh;
	}

	scope.Grid = Grid;
	return Grid;
})(typeof exports === 'undefined' ? {} : exports);