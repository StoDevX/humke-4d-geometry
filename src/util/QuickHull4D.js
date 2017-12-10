/* 
A 4D version of QuickHull. Based on The Quickhull Algorithm for Convex Hulls by C. Bradford Barber
Implementation inspired by https://github.com/Mugen87 's QuickHull.js 
*/
var QuickHull4D = (function (scope) {
	function QuickHull4D(){}
	
	QuickHull4D.prototype.init = function(){
		this.facets = []; // the generated faces of the convex hull
		this.vertices = []; 	// vertices of the hull

		// Add a cross product on the threejs vector 
		if(THREE.Vector4.cross == undefined){
			THREE.Vector4.prototype.cross = function(U,V,W){
				var A = (V.x * W.y) - (V.y * W.x);
			    var B = (V.x * W.z) - (V.z * W.x);
			    var C = (V.x * W.w) - (V.w * W.x);
			    var D = (V.y * W.z) - (V.z * W.y);
			    var E = (V.y * W.w) - (V.w * W.y);
			    var F = (V.z * W.w) - (V.w * W.z);
			    // Calculate the result-vector components.
			    var result = new THREE.Vector4();
			    result.x =   (U.y * F) - (U.z * E) + (U.w * D);
			    result.y = - (U.x * F) + (U.z * C) - (U.w * B);
			    result.z =   (U.x * E) - (U.y * C) + (U.w * A);
			    result.w = - (U.x * D) + (U.y * B) - (U.z * A);
			    return result.multiplyScalar(-1);
			}
		}
	}
	

	QuickHull4D.prototype.computeInitialHull = function(){
		// We know the first 5 facets will make a hull. We just need to orient them the right way
		var v = this.vertices;
		var facet = new Facet(v[1],v[2],v[3],v[4]);
		if(facet.isPointAbove(v[0])){
			// If the 5th point is above the facet, that means it's pointing the wrong way 
			facet.invertNormal();
		}
		this.facets.push(facet);

		facet = new Facet(v[4],v[3],v[2],v[0]);
		if(facet.isPointAbove(v[1]))
			facet.invertNormal();
		this.facets.push(facet);

		facet = new Facet(v[0],v[1],v[3],v[4]);
		if(facet.isPointAbove(v[2]))
			facet.invertNormal();
		this.facets.push(facet);

		facet = new Facet(v[4],v[2],v[1],v[0]);
		if(facet.isPointAbove(v[3]))
			facet.invertNormal();
		this.facets.push(facet);

		facet = new Facet(v[0],v[1],v[2],v[3]);
		if(facet.isPointAbove(v[4]))
			facet.invertNormal();
		this.facets.push(facet);
	}


	QuickHull4D.prototype.isSameRidge = function(ridge1,ridge2){

		for(var i=0;i<ridge1.length;i++){
			var foundRidge = false;
			for(var j=0;j<ridge2.length;j++){
				if(ridge1[i] == ridge2[j])
					foundRidge = true;
			}
			if(!foundRidge)
				return false;
		}

		return true;
	}

	QuickHull4D.prototype.getSharedRidges = function(facet1,facet2){
		var shared = [];

		for(var i=0;i<facet1.ridges.length;i++){
			var ridge1 = facet1.ridges[i];
			for(var j=0;j<facet2.ridges.length;j++){
				var ridge2 = facet2.ridges[j];
				if(this.isSameRidge(ridge1,ridge2)){
					shared.push(ridge1);
					break;
				}
			}
		}

		return shared;
	}

	QuickHull4D.prototype.getNeighbours = function(facet){
		/* 
			Given a facet, return the neighbours 
		*/
		// To do this, we grab all the ridges of this facet, and search for any other facets that share a ridge 
		var neighbours = [];
		// For all the ridges in our facet
		for(var i=0;i<facet.ridges.length;i++){
			var ridge = facet.ridges[i];
			// Check every other facet
			for(var j=0;j<this.facets.length;j++){
				var otherFacet = this.facets[j];
				if(facet == otherFacet) continue;
				// Check the ridges of every other facet
				for(var k=0;k<otherFacet.ridges.length;k++){
					var otherRidge = otherFacet.ridges[k];
					// If they share any ridge, it's a neighbour!
					if(this.isSameRidge(ridge,otherRidge)){
						neighbours.push(otherFacet);
						break;
					}
				}
			}
		}

		return neighbours;
	}
	QuickHull4D.prototype.computeHorizon = function(visibleSet,eyePoint){
		/* 
			Computes the set of horizon ridges relative to eyePoint
			We know the horizon is the boundary of the visible set. 
		*/
		var horizon = [];
		// For each facet F in the visible set 
		for(var i=0;i<visibleSet.length;i++){
			var F = visibleSet[i];
			// For each neighbour N of F 
			var neighbours = this.getNeighbours(F);
			for(var j=0;j<neighbours.length;j++){
				var N = neighbours[j];
				// If eyePoint is not above N
				if(!N.isPointAbove(eyePoint)){
					// Add the shared ridges to the horizon 
					var sharedRidges = this.getSharedRidges(F,N);
					for(var k=0;k<sharedRidges.length;k++){
						// Check that sharedRidges[k] is not in horizon 
						var isInHorizon = false;
						for(var l=0;l<horizon.length;l++){
							if(this.isSameRidge(horizon[l],sharedRidges[k])){
								isInHorizon = true;
								break;
							}
						}
						if(!isInHorizon)
							horizon.push(sharedRidges[k]);
					}
				}
			}
		}

		return horizon;
	}

	QuickHull4D.prototype.compute = function(){
		// 1- Create initial simplex
		this.computeInitialHull();
		// 2- For each facet F
		for(var i=0;i<this.facets.length;i++){
			var facet = this.facets[i];
			// for each unassigned point p
			for(var j=0;j<this.vertices.length;j++){
				var point = this.vertices[j];
				if(point.onHull) continue; 
				// if p is above F 
				if(facet.isPointAbove(point)){
					// assign p to F's outside set
					facet.outside_set.push(point); 
				}
			}


		}

		//	3- For each facet F with a non-empty outside set

		for(var i=0;i<this.facets.length;i++){
			var facet = this.facets[i];

			if(facet.outside_set.length == 0) continue;

			// 4- Get furthest point p in F's outside set 
			var plane = facet.getHyperPlane();
			var farthest_point = facet.outside_set[0];
			var farthest_dist = Math.abs(plane.distanceToPoint(farthest_point));
			for(var j=1;j<facet.outside_set.length;j++){
				var point = facet.outside_set[j];
				
				var dist = Math.abs(plane.distanceToPoint(point));
				if(dist > farthest_dist){
					dist = farthest_dist;
					farthest_point = point;
				}
			}
			// 5- init visible set V (of faces visible from farthest_point)
			var visible_set = [facet]	
			// 6- for all unvisited neighbours N of facets in V 
			var visited = [];

			for(var visible_i = 0;visible_i<visible_set.length;visible_i++){
				var F = visible_set[visible_i];
				// Get all neighbours of this facet 
				var neighbours = this.getNeighbours(F);
				for(var n_i=0;n_i<neighbours.length;n_i++){
					/*
						if farthest_point is above N 
							add N to V 
					 */
					var N = neighbours[n_i];
				 	if(visited.indexOf(N) == -1){
				 		visited.push(N);
				 		if(N.isPointAbove(farthest_point)){
					 		visible_set.push(N);	
					 	}
				 	}
				}
			}
			// 7- Compute set of horizon ridges H 
			var H = this.computeHorizon(visible_set,farthest_point);

			if(H.length == 0){
				console.error("Horizon should never be 0!");
			}
			var newFacets = [];
			// 8- For each ridge R in H 
			for(var r_i=0;r_i<H.length;r_i++){
				var R = H[r_i];
				//  create a new facet from R and p 
				var newFacet = new Facet(R[0],R[1],R[2],farthest_point);
				var pointOnVisible = visible_set[0].centroid;

				if(newFacet.isPointAbove(pointOnVisible)){
					newFacet.invertNormal();
				}

				newFacets.push(newFacet);
			}

			// 9- Update assignments
				//For each new facet F' 
				for(var r_i=0;r_i<newFacets.length;r_i++){
					var newF = newFacets[r_i];
					//for each unassigned point q in an outside set of a facet in V 
					for(var v_i=0;v_i<visible_set.length;v_i++){
						var Vfacet = visible_set[v_i];
						for(var q_i=0;q_i<Vfacet.outside_set.length;q_i++){
							var q = Vfacet.outside_set[q_i];
							//if q is above F'
							if((!q.onHull) && newF.isPointAbove(q)){
								//assign q to F's outside set 
								newF.outside_set.push(q);
							}
						}
					}
				}


			// 10- delete the facets in V 
			for(var i2=this.facets.length-1;i2>=0;i2--){
				var F = this.facets[i2];
				if(visible_set.indexOf(F) != -1){
					this.facets.splice(i2,1);
				}
			}

			// Add the new facets
			for(var nf_i=0;nf_i<newFacets.length;nf_i++){
				this.facets.push(newFacets[nf_i])
			}

			// If we're here, we found a non-empty outside set 
			i = 0;
		}
	}

	QuickHull4D.prototype.ComputeHull = function(points){
		/* 
			Input:
				points - an array of THREE.Vector4
			Output:
				facets - a nested array if indices [[0,1,2,3],[4,5,6,7],..]
		*/
		// There must be at least 5 points 
		if(points.length < 5)
			return [];

		// Initialize the internal arrays of assigned/unassigned points etc.
		this.init();
		// Copy all points into the vertices array
		for ( var i = 0, l = points.length; i < l; i ++ ) {
			var newPoint = points[i].clone();
			var e = 0.0001;
			// newPoint.x += Math.random() * e - e/2;
			// newPoint.y += Math.random() * e - e/2;
			// newPoint.z += Math.random() * e - e/2;
			// newPoint.w += Math.random() * e - e/2;
			this.vertices.push( newPoint );
		}
		// Start the algorithm 
		this.compute();
		// return the facets
		return this.facets;
	}

	function Facet(p0,p1,p2,p3){
		this.vertices = [p0,p1,p2,p3];
		this.centroid = new THREE.Vector4(0,0,0,0);
		for(var i=0;i<this.vertices.length;i++){
			var v = this.vertices[i];
			this.centroid.x += v.x;
			this.centroid.y += v.y; 
			this.centroid.z += v.z;
			this.centroid.w += v.w; 
		}
		this.centroid.x /= this.vertices.length;
		this.centroid.y /= this.vertices.length;
		this.centroid.z /= this.vertices.length;
		this.centroid.w /= this.vertices.length;

		this.edges = [
		[p0,p1],[p0,p2],[p0,p3],
		[p1,p2],[p1,p3],[p2,p3]
		]
		this.ridges = [
			[p0,p1,p3],[p0,p2,p3],[p1,p2,p3],[p0,p1,p2]
		]
		// Compute normal 
		this.normal = new THREE.Vector4();
		var v1 = new THREE.Vector4().subVectors(this.vertices[1],this.vertices[0]);
	    var v2 = new THREE.Vector4().subVectors(this.vertices[2],this.vertices[1]);
	    var v3 = new THREE.Vector4().subVectors(this.vertices[3],this.vertices[2]);
	    this.normal = this.normal.cross(v1,v2,v3);
	    
	    this.p0 = this.vertices[0];

		this.outside_set = []

		// Set a flag on these points so we know they belong to the hull
		p0.onHull = true;
		p1.onHull = true;
		p2.onHull = true; 
		p3.onHull = true;

	}
	Object.assign( Facet.prototype, {
		getHyperPlane: function(){
		    var plane = new HyperPlane(this.normal,this.centroid);
		    return plane;
		},
		isPointAbove: function(point){
			var plane = this.getHyperPlane();
			return plane.isPointAbove(point);
		},
		invertNormal: function(){
			this.normal.multiplyScalar(-1);
		}
	})

	function HyperPlane( normal, p0 ) {
		this.normal = normal;
		this.p0 = p0;
	}

	Object.assign( HyperPlane.prototype, {

		isPointAbove: function (point) {
			var diff = new THREE.Vector4().subVectors(point,this.p0);
			var dist = this.distanceToPoint(point);
			if(isNaN(dist)){
				return false;
			}
			return this.normal.dot(diff) >= 0;
		},

		distanceToPoint: function(point){
			var b = this.normal.dot(this.p0.clone().multiplyScalar(-1));
			return (Math.abs(this.normal.dot(point) + b)) / (this.normal.length());
		}
	})

	scope.QuickHull4D = QuickHull4D;
	return QuickHull4D;
})(typeof exports === 'undefined' ? {} : exports);