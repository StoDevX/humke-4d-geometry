var createGrid = function(plane) {
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

  // axis is already positioned to be the Y axis
  if(axis == "X") {
    cylinder.rotateZ(-Math.PI/2);
  } else if (axis == "Z") {
    cylinder.rotateX(-Math.PI/2)
  }

  return cylinder;
}
