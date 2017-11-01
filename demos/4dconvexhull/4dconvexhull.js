tesseract = [[0,0,0,0]
,[1,0,0,0]
,[0,1,0,0]
,[1,1,0,0]
,[0,0,1,0]
,[1,0,1,0]
,[0,1,1,0]
,[1,1,1,0]
,[0,0,0,1]
,[1,0,0,1]
,[0,1,0,1]
,[1,1,0,1]
,[1,0,1,1]
,[0,1,1,1]
,[1,1,1,1]
,[0,0,1,1]];

function CreateInitialSimplex() {
  // Create an initial simplex of d+1 points and return its facets
  return [[1,2,3,4],[4,3,2,0],[0,1,3,4],[4,2,1,0],[0,1,2,3]];
}

function vecSubtract(A, B) {
  var result = [];
  for (var i = 0; i < A.length; i++) {
    result.push(A[i] - B[i]);
  }
  return result;
}

function Cross(A,B,C) {
  // Calculate the normal vector to the hyperplane defined by vectors A, B, and C.
  // Values taken from a 4x4 determinant calculated by hand.
  // For more info, see the "multilinear algebra" section of
  // https://en.wikipedia.org/wiki/Cross_product#Generalizations

  var e0 = A[1]*B[3]*C[2] - A[1]*B[2]*C[3] + A[2]*B[1]*C[3] - A[2]*B[3]*C[1] - A[3]*B[1]*C[2] + A[3]*B[2]*C[1];
  var e1 = A[0]*B[2]*C[3] - A[0]*B[3]*C[2] - A[2]*B[0]*C[3] + A[2]*B[3]*C[0] + A[3]*B[0]*C[2] - A[3]*B[2]*C[0];
  var e2 = A[0]*B[3]*C[1] - A[0]*B[1]*C[3] + A[1]*B[0]*C[3] - A[1]*B[3]*C[0] - A[3]*B[0]*C[1] + A[3]*B[1]*C[0];
  var e3 = A[0]*B[1]*C[2] - A[0]*B[2]*C[1] - A[1]*B[0]*C[2] + A[1]*B[2]*C[0] + A[2]*B[0]*C[1] - A[2]*B[1]*C[0];
  return [e0, e1, e2, e3];
}

function Dot(A,B) {
// The dot product of vectors A and B

  var dot_product = 0;
  for (var i = 0; i < 4; i++) {
    dot_product += A[i] * B[i];
  }
  return dot_product;
}

function IsPointAboveHyperplane(normal, p0, point) {
  // Take a normal vector and a point p0 that define a hyperplane
  // and determine if a point is above or below that hyperplane

  var vec = [];
  for (var i = 0; i < 4; i++) {
    vec.push(point[i] - p0[i]);
  }
  return Dot(normal, vec) > 0;
}

function GetHyperplaneOfFacet(facet, points) {
  // Return the normal and point representing the hyperplane that a facet lies on

  var v1 = vecSubtract(points[facet[1]], points[facet[0]]);
  var v2 = vecSubtract(points[facet[2]], points[facet[1]]);
  var v3 = vecSubtract(points[facet[3]], points[facet[2]]);
  var normal = Cross(v1, v2, v3);
  var p0 = points[facet[0]];
  return [normal, p0];
}

function IsPointAboveFacet(facet_index, point_index, hull) {
  var hyperplane = GetHyperplaneOfFacet(hull.facets[facet_index], hull.points);
  return IsPointAboveHyperplane(hyperplane[0], hyperplane[1], hull.points[point_index]);
}

function GetInitialOutsideSets(hull) {
  // for each facet F
  //   for each unassigned point p
  //     if p is above F
  //       assign p to F's outside set

  var outside_sets = [];
  for (var fi = 0; fi < hull.facets.length; fi++) {
    outside_sets.push([]);
    for (var pi = 5; pi < hull.points.length; pi++) {
      if (IsPointAboveFacet(fi, pi, hull)) {
        outside_sets[fi].push(hull.points[pi]);
      }
    }
  }
  return outside_sets;
}

function Magnitude(vec) {
  var sum = 0;
  for (var vi = 0; vi < vec.length; vi++) {
    sum += Math.pow(vec[vi], 2);
  }
  return Math.sqrt(sum);
}

function DistanceFromHyperplane(normal, p0, point) {
  // Calculate the distance of a point from a hyperplane.
  // For more information, see https://math.stackexchange.com/questions/1210545/distance-from-a-point-to-a-hyperplane

  var b = Dot(normal, vecSubtract([0,0,0,0],p0));
  var numerator = Math.abs(Dot(normal, point) + b);
  var denominator = Magnitude(normal);
  return numerator / denominator;
}

function GetFurthestPointFromFacet(facet, points, facet_points) {
  var hyperplane = GetHyperplaneOfFacet(facet, facet_points);
  var normal = hyperplane[0];
  var p0 = hyperplane[1];
  var furthest_distance = DistanceFromHyperplane(normal, p0, points[0]);
  var furthest_point_i = 0;
  for (var i = 1; i < points.length; i++) {
    if (DistanceFromHyperplane(normal, p0, points[i]) > furthest_distance) {
      furthest_point_i = i;
    }
  }
  return furthest_point_i;
}

function GetRidgesOfFacet(facet) {
// Following the threejs winding of a tetrahedron.

  return [[facet[0], facet[1], facet[2]],
          [facet[0], facet[2], facet[3]],
          [facet[3], facet[2], facet[1]],
          [facet[3], facet[1], facet[0]]];
}

function GetSharedRidges(facet_ridges, other_facet_ridges) {
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

function GetNeighborsOfFacet(facet_i, hull) {
  var neighbors = [];
  var facet_ridges = GetRidgesOfFacet(hull.facets[facet_i]);
  for (var i = 0; i < hull.facets.length; i++) {
    if (i == facet_i)
      continue;
    var other_facet_ridges = GetRidgesOfFacet(hull.facets[i]);
    if (GetSharedRidges(facet_ridges, other_facet_ridges) != [])
      neighbors.push(i);
  }
  return neighbors;
}

function GetHorizonRidges(visible_set, point_i, hull) {
  var horizon = [];
  for (var visible_set_i = 0; visible_set_i < visible_set.length; visible_set_i++) {
    var neighbors = GetNeighborsOfFacet(visible_set[visible_set_i], hull);

    // If our point of interest is a below a neighboring facet,
    // then the shared ridge ridge with that neighbor is part of the horizon.
    for (var neighbors_i = 0; neighbors_i < neighbors.length; neighbors_i++) {
      if (!IsPointAboveFacet(neighbors[neighbors_i], point_i, hull)) {
        var facet_ridges = GetRidgesOfFacet(visible_set[visible_set_i]);
        var other_facet_ridges = GetRidgesOfFacet(neighbors[neighbors_i]);
        var shared_ridges = GetSharedRidges(facet_ridges, other_facet_ridges);
        horizon.concat(shared_ridges);
      }
    }
  }

  return horizon;
}

function ConvexHull4D(points) {
  var hull = {};
  hull.points = points;
  hull.facets = CreateInitialSimplex();
  hull.outside_sets = GetInitialOutsideSets(hull);
  for (var osi = 0; osi < hull.outside_sets.length; osi++) {
    if (hull.outside_sets[osi].length > 0) {
      var furthest_point_i = GetFurthestPointFromFacet(hull.facets[osi], hull.outside_sets[osi], hull.points);
      var visible_set = [osi];
      var neighbors = GetNeighborsOfFacet(visible_set[0], hull);

      for (var neighbors_i = 0; neighbors_i < neighbors.length; neighbors_i++) {
        if (IsPointAboveFacet(neighbors[neighbors_i], furthest_point_i, hull)) {
          visible_set.push(neighbors[neighbors_i]);
          var new_neighbors = GetNeighborsOfFacet(neighbors[neighbors_i]);
          for (var new_neighbors_i = 0; new_neighbors_i < new_neighbors.length; new_neighbors_i++) {
            if(neighbors.indexOf(new_neighbors[new_neighbors_i]) == -1) {
              neighbors.push_back(new_neighbors[new_neighbors_i]);
            }
          }
        }
      }

      var horizon_ridges = GetHorizonRidges(visible_set, furthest_point_i, hull);
      hull = RemoveFacetsFromHull(visible_set, hull);

    }
  }
}

convex_hull = ConvexHull4D(tesseract);
//console.log(convex_hull);
