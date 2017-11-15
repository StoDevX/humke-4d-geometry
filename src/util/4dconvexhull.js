var ConvexHull4D = (function (scope) {
	function ConvexHull4D(){}

  ConvexHull4D.prototype.arrEqual = function(arr1, arr2) {
    if (arr1.length != arr2.length) {
      return false;
    }
    for (arr1_i = 0; arr1_i < arr1_i.length; arr1_i++) {
      if (arr1[arr1_i] != arr2[arr1_i]) return false;
    }
    return true;
  }

  ConvexHull4D.prototype.Arr1InArr2 = function(arr1, arr2) {
    for (var arr2_i = 0; arr2_i < arr2.length; arr2_i++) {
      if (this.arrEqual(arr1, arr2[arr2_i])) return true;
    }
    return false;
  }

  ConvexHull4D.prototype.CreateInitialSimplex = function(hull) {
    // Create an initial simplex of d+1 points and return its facets
		hull.facets.push([1,2,3,4]);
		if (this.IsPointAboveFacet(0, 0, hull)) {
			hull.facets[0] = [4,3,2,1];
		}
		hull.facets.push([4,3,2,0]);
		if(this.IsPointAboveFacet(1, 1, hull)) {
			hull.facets[1] = [0,2,3,4];
		}
		hull.facets.push([0,1,3,4]);
		if(this.IsPointAboveFacet(2, 2, hull)) {
			hull.facets[2] = [4,3,1,0];
		}
		hull.facets.push([4,2,1,0]);
		if(this.IsPointAboveFacet(3,3, hull)) {
			hull.facets[3] = [0,1,2,4];
		}
		hull.facets.push([0,1,2,3]);
		if(this.IsPointAboveFacet(4,4, hull)) {
			hull.facets[4] = [3,2,1,0];
		}

		return hull;
  }

  ConvexHull4D.prototype.vecSubtract = function(A, B) {
    var result = [];
    for (var i = 0; i < A.length; i++) {
      result.push(A[i] - B[i]);
    }
    return result;
  }

  ConvexHull4D.prototype.Cross = function(U,V,W) {
    // Calculate the normal vector to the hyperplane defined by vectors A, B, and C.
    // Values taken from a 4x4 determinant calculated by hand.
    // For more info, see the "multilinear algebra" section of
    // https://en.wikipedia.org/wiki/Cross_product#Generalizations

    // var e0 = A[1]*B[3]*C[2] - A[1]*B[2]*C[3] + A[2]*B[1]*C[3] - A[2]*B[3]*C[1] - A[3]*B[1]*C[2] + A[3]*B[2]*C[1];
    // var e1 = A[0]*B[2]*C[3] - A[0]*B[3]*C[2] - A[2]*B[0]*C[3] + A[2]*B[3]*C[0] + A[3]*B[0]*C[2] - A[3]*B[2]*C[0];
    // var e2 = A[0]*B[3]*C[1] - A[0]*B[1]*C[3] + A[1]*B[0]*C[3] - A[1]*B[3]*C[0] - A[3]*B[0]*C[1] + A[3]*B[1]*C[0];
    // var e3 = A[0]*B[1]*C[2] - A[0]*B[2]*C[1] - A[1]*B[0]*C[2] + A[1]*B[2]*C[0] + A[2]*B[0]*C[1] - A[2]*B[1]*C[0];

		var A = (V[0] * W[1]) - (V[1] * W[0]);
		var B = (V[0] * W[2]) - (V[2] * W[0]);
		var C = (V[0] * W[3]) - (V[3] * W[0]);
		var D = (V[1] * W[2]) - (V[2] * W[1]);
		var E = (V[1] * W[3]) - (V[3] * W[1]);
		var F = (V[2] * W[3]) - (V[3] * W[2]);
 		// Calculate the result-vector components.
 		var result0 =   (U[1] * F) - (U[2] * E) + (U[3] * D);
    var result1 = - (U[0] * F) + (U[2] * C) - (U[3] * B);
		var result2 =   (U[0] * E) - (U[1] * C) + (U[3] * A);
		var result3 = - (U[0] * D) + (U[1] * B) - (U[2] * A);
    return [result0, result1, result2, result3];
  }

  ConvexHull4D.prototype.Dot = function(A,B) {
  // The dot product of vectors A and B

    var dot_product = 0;
    for (var i = 0; i < 4; i++) {
      dot_product += A[i] * B[i];
    }
    return dot_product;
  }

  ConvexHull4D.prototype.IsPointAboveHyperplane = function(normal, p0, point) {
    // Take a normal vector and a point p0 that define a hyperplane
    // and determine if a point is above or below that hyperplane

    var vec = [];
    for (var i = 0; i < 4; i++) {
      vec.push(point[i] - p0[i]);
    }
    return this.Dot(normal, vec) < 0;
  }

  ConvexHull4D.prototype.GetHyperplaneOfFacet = function(facet, points) {
    // Return the normal and point representing the hyperplane that a facet lies on

    var v1 = this.vecSubtract(points[facet[1]], points[facet[0]]);
    var v2 = this.vecSubtract(points[facet[2]], points[facet[1]]);
    var v3 = this.vecSubtract(points[facet[3]], points[facet[2]]);
    var normal = this.Cross(v1, v2, v3);
    var p0 = points[facet[0]];
    return [normal, p0];
  }

  ConvexHull4D.prototype.IsPointAboveFacet = function(facet_index, point_index, hull) {
		if (hull.points_on_hull.indexOf(point_index) != -1) return false;
    var hyperplane = this.GetHyperplaneOfFacet(hull.facets[facet_index], hull.points);
    return this.IsPointAboveHyperplane(hyperplane[0], hyperplane[1], hull.points[point_index]);
  }

  ConvexHull4D.prototype.GetInitialOutsideSets = function(hull) {
    // for each facet F
    //   for each unassigned point p
    //     if p is above F
    //       assign p to F's outside set

    var outside_sets = [];
    for (var fi = 0; fi < hull.facets.length; fi++) {
      outside_sets.push([]);
      for (var pi = 5; pi < hull.points.length; pi++) {
        if (this.IsPointAboveFacet(fi, pi, hull)) {
          outside_sets[fi].push(pi);
        }
      }
    }
    return outside_sets;
  }

  ConvexHull4D.prototype.Magnitude = function(vec) {
    var sum = 0;
    for (var vi = 0; vi < vec.length; vi++) {
      sum += Math.pow(vec[vi], 2);
    }
    return Math.sqrt(sum);
  }

  ConvexHull4D.prototype.DistanceFromHyperplane = function(normal, p0, point) {
    // Calculate the distance of a point from a hyperplane.
    // For more information, see https://math.stackexchange.com/questions/1210545/distance-from-a-point-to-a-hyperplane

    var b = this.Dot(normal, this.vecSubtract([0,0,0,0],p0));
    var numerator = Math.abs(this.Dot(normal, point) + b);
    var denominator = this.Magnitude(normal);
    return numerator / denominator;
  }

  ConvexHull4D.prototype.GetFurthestOutsidePointFromFacet = function(facet_i, hull) {
    var hyperplane = this.GetHyperplaneOfFacet(hull.facets[facet_i], hull.points);
    var normal = hyperplane[0];
    var p0 = hyperplane[1];
    var furthest_distance = this.DistanceFromHyperplane(normal, p0, hull.points[hull.outside_sets[facet_i][0]]);
    var furthest_point_i = hull.outside_sets[facet_i][0];
    for (var i = 1; i < hull.outside_sets[facet_i].length; i++) {
      if (this.DistanceFromHyperplane(normal, p0, hull.points[hull.outside_sets[facet_i][i]]) > furthest_distance) {
        furthest_point_i = hull.outside_sets[facet_i][i];
      }
    }
    return furthest_point_i;
  }

  ConvexHull4D.prototype.GetRidgesOfFacet = function(facet) {
  // Following the threejs winding of a tetrahedron.

    return [[facet[0], facet[1], facet[2]],
            [facet[0], facet[2], facet[3]],
            [facet[3], facet[2], facet[1]],
            [facet[3], facet[1], facet[0]]];
  }

  ConvexHull4D.prototype.GetSharedRidges = function(facet_ridges, other_facet_ridges) {
    var shared_ridges = [];
    for (var fri = 0; fri < facet_ridges.length; fri++) {
      for (var ofri = 0; ofri < other_facet_ridges.length; ofri++) {
        var shared_points = 0;
        for (var frii = 0; frii < facet_ridges[fri].length; frii++) {
          for (var ofrii = 0; ofrii < other_facet_ridges[ofri].length; ofrii++) {
            if (facet_ridges[fri][frii] == other_facet_ridges[ofri][ofrii]) shared_points++;
          }
        }
        if (shared_points >= 3)  shared_ridges.push(facet_ridges[fri]);
      }
    }
    return shared_ridges;
  }

  ConvexHull4D.prototype.GetNeighborsOfFacet = function(facet_i, hull) {
    var neighbors = [];
    var facet_ridges = this.GetRidgesOfFacet(hull.facets[facet_i]);
    for (var i = 0; i < hull.facets.length; i++) {
      if (i == facet_i)
        continue;
      var other_facet_ridges = this.GetRidgesOfFacet(hull.facets[i]);
      if (this.GetSharedRidges(facet_ridges, other_facet_ridges) != [])
        neighbors.push(i);
    }
    return neighbors;
  }

  ConvexHull4D.prototype.GetHorizonRidges = function(visible_set, point_i, hull) {
    var horizon = [];
    for (var visible_set_i = 0; visible_set_i < visible_set.length; visible_set_i++) {
      var neighbors = this.GetNeighborsOfFacet(visible_set[visible_set_i], hull);

      // If our point of interest is a below a neighboring facet,
      // then the shared ridge ridge with that neighbor is part of the horizon.
      for (var neighbors_i = 0; neighbors_i < neighbors.length; neighbors_i++) {
        if (!this.IsPointAboveFacet(neighbors[neighbors_i], point_i, hull)) {
          var facet_ridges = this.GetRidgesOfFacet(hull.facets[visible_set[visible_set_i]]);
          var other_facet_ridges = this.GetRidgesOfFacet(hull.facets[neighbors[neighbors_i]]);
          var shared_ridges = this.GetSharedRidges(facet_ridges, other_facet_ridges);
          horizon = horizon.concat(shared_ridges);
        }
      }
    }

    return horizon;
  }

  ConvexHull4D.prototype.RemoveFacetsFromHull = function(facets, hull) {
    facets = facets.sort(function(a,b) { return a > b }); // ascending order
    for (var facets_i = facets.length - 1; facets_i >= 0; facets_i--) {
      hull.facets.splice(facets[facets_i], 1);
      hull.outside_sets.splice(facets[facets_i], 1);
    }
    return hull;
  }

  ConvexHull4D.prototype.CreateFacetsFromPointAndRidges = function(hull, ridges, point_i) {
    for (var ridges_i = 0; ridges_i < ridges.length; ridges_i++) {
      hull.facets.push(ridges[ridges_i].concat(point_i));
    }
    return hull;
  }

  ConvexHull4D.prototype.UpdateOutsideSets = function(outside_points_of_visible_set, start_of_new_facets, hull) {
    for (var new_facet_i = start_of_new_facets; new_facet_i < hull.facets.length; new_facet_i++) {
      hull.outside_sets.push([]);
      for (var opi = 0; opi < outside_points_of_visible_set.length; opi++) {
        if (this.IsPointAboveFacet(new_facet_i, outside_points_of_visible_set[opi], hull))
          hull.outside_sets[new_facet_i].push(outside_points_of_visible_set[opi]);
      }
    }

    return hull;
  }

  ConvexHull4D.prototype.GetOutsidePointsOfFacets = function(facets, hull) {
    var outside_points = [];
    for (var facets_i = 0; facets_i < facets.length; facets_i++) {
      var facet = facets[facets_i];
      for (var osii = 0; osii < hull.outside_sets[facet].length; osii++) {
        var outside_point = hull.outside_sets[facet][osii];
        if (outside_points.indexOf(outside_point) == -1) {
          outside_points.push(outside_point);
        }
      }
    }
    return outside_points;
  }

  ConvexHull4D.prototype.ConvexHull4D = function(points) {
    /*
      Takes an array of 4-arrays, so something like:
      [[x,y,z,w],[x,y,z,w],...]

      Returns an array of indices that make up the facets
    */
    var hull = {};
    hull.points = points;
		hull.facets = [];
		hull.points_on_hull = [];
    hull = this.CreateInitialSimplex(hull);
		hull.points_on_hull = [0,1,2,3,4];
    hull.outside_sets = this.GetInitialOutsideSets(hull);

    for (var osi = 0; osi < hull.outside_sets.length; osi++) {
      if (hull.outside_sets[osi].length > 0) {
        var furthest_point_i = this.GetFurthestOutsidePointFromFacet(osi, hull);
        var visible_set = [osi];
        var neighbors = this.GetNeighborsOfFacet(visible_set[0], hull);

        for (var neighbors_i = 0; neighbors_i < neighbors.length; neighbors_i++) {
          if (this.IsPointAboveFacet(neighbors[neighbors_i], furthest_point_i, hull)) {
            visible_set.push(neighbors[neighbors_i]);
            var new_neighbors = this.GetNeighborsOfFacet(neighbors[neighbors_i], hull);
            for (var new_neighbors_i = 0; new_neighbors_i < new_neighbors.length; new_neighbors_i++) {
              if(neighbors.indexOf(new_neighbors[new_neighbors_i]) == -1 && new_neighbors[new_neighbors_i] != osi) {
                neighbors.push(new_neighbors[new_neighbors_i]);
              }
            }
          }
        }

        var horizon_ridges = this.GetHorizonRidges(visible_set, furthest_point_i, hull);
        var outside_points_of_visible_set  = this.GetOutsidePointsOfFacets(visible_set, hull);
        hull = this.RemoveFacetsFromHull(visible_set, hull);
        var start_of_new_facets = hull.facets.length;
        hull = this.CreateFacetsFromPointAndRidges(hull, horizon_ridges, furthest_point_i);
				hull.points_on_hull.push(furthest_point_i);
        hull = this.UpdateOutsideSets(outside_points_of_visible_set, start_of_new_facets, hull);
      }
    }

    return hull.facets;
  }

scope.ConvexHull4D = ConvexHull4D;
return ConvexHull4D;
})(typeof exports === 'undefined' ? {} : exports);
