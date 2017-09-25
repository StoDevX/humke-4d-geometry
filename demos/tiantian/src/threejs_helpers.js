var createGrid = function(plane) {
  var size = 20;
  var divisions = 20;
  var gridHelper = new THREE.GridHelper(size,divisions,0x444444,0xd0d0d0);

  if (plane=="xy"){
    gridHelper.rotation.x = Math.PI/2;
  } else if (plane=="yz") {
    gridHelper.rotation.z = Math.PI/2;
  }

  return gridHelper;
}

var createAxis = function(axis) {
  var coneRadius = 0.4;
  var coneHeight = 0.5;
  var coneGeometry = new THREE.ConeGeometry(coneRadius, coneHeight, 32);
  coneGeometry.translate(0,10.2,0); // move cone to tip of cylinder

  var cylinderRadius = 0.15;
  var cylinderHeight = 20;
  var cylinderGeometry = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, cylinderHeight, 32);

  cylinderGeometry.merge(coneGeometry); // combine the cone and cylinder
  var material = new THREE.MeshBasicMaterial( {color: 0x000000} );
  var cylinder = new THREE.Mesh( cylinderGeometry, material );

  // axis is already positioned to be the Y axis,
  // but for other axis...
  if(axis == "x") {
    cylinder.rotateZ(-Math.PI/2);
  } else if (axis == "z") {
    cylinder.rotateX(Math.PI/2);
  } else if (axis == "w") {
    // a bit confusing, but it is the not the point of the
    // axis that looks at the point, it is the edge
    cylinder.lookAt(10, -10, -10);
  }

  return cylinder;
}

var createLabel = function(message, x, y, z) {
  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');
  ctx.font = "Bold 80px Helvetica";

	ctx.fillText( message, canvas.width/2, canvas.height/2);

	// canvas contents will be used for a texture
	var texture = new THREE.Texture(canvas);
	texture.needsUpdate = true;

	var spriteMaterial = new THREE.SpriteMaterial(
		{ map: texture} );
	var sprite = new THREE.Sprite( spriteMaterial );
	sprite.scale.set(2,2,1);
  sprite.position.set(x,y,z);
	return sprite;
}
