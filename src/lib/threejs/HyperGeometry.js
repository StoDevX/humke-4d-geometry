/**
 * @author OmarShehata / https://github.com/OmarShehata
 */

( function() {

	// HyperGeometry
	// Just like normal geometry, but its vertices are 4 dimensional

	function HyperGeometry( points ) {

		THREE.Geometry.call( this );

		this.type = 'HyperGeometry';

		this.fromBufferGeometry( new HyperBufferGeometry( points ) );
		// this.mergeVertices();


	}

	HyperGeometry.prototype = Object.create( THREE.Geometry.prototype );
	HyperGeometry.prototype.constructor = HyperGeometry;

	// HyperBufferGeometry

	function HyperBufferGeometry( points ) {

	  THREE.BufferGeometry.call( this );

	  this.type = 'HyperBufferGeometry';

	  // build geometry
	  var vertices = [];
	  var indices_array = [];
	  // Flatten the array 

	  for(var i=0;i<points.length;i++){
	  	var p = points[i];
	  	vertices.push(p.x,p.y,p.z,p.w);
	  }
	  for(var i=0;i<points.length;i+=4){
	  	indices_array.push(i,i+1,i+2,i+3);
	  }

	  this.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 4 ) );
	  // Define fake indices for now 
	  var indices = new THREE.BufferAttribute( new Uint16Array( indices_array,4 ), 1 );
	  this.setIndex(indices);
	 
	}

	HyperBufferGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
	HyperBufferGeometry.prototype.constructor = HyperBufferGeometry;

	// export

	THREE.HyperGeometry = HyperGeometry;
	THREE.HyperBufferGeometry = HyperBufferGeometry;

} ) ();