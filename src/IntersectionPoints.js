CalculateIntersectionPoints = function(p1,p2,p3,axis,axis_value) {
  var axis_conv = {'X':0, 'Y':1, 'Z':2}
  var chosen_axis = 1;
  var other_axis_one = 0;
  var other_axis_two = 2;
  if(axis == "X"){
    chosen_axis = 0;
    other_axis_one = 2;
    other_axis_two = 1;
  }
  if(axis == "Z"){
    chosen_axis = 2;
    other_axis_one = 1;
    other_axis_two = 0;
  }

  //if (axis == 'Y') { // currently only handles Y axis. Needs to be generalized to X and Y

    var intersection_point = [4];

    var above = [];
    var below = [];
    if (p1[axis_conv[axis]] > axis_value) above.push(p1);
    else below.push(p1);

    if (p2[axis_conv[axis]] > axis_value) above.push(p2);
    else below.push(p2);

    if (p3[axis_conv[axis]] > axis_value) above.push(p3);
    else below.push(p3);

    if (below.length > 1) {

      var direction = [3];
      direction[0] = below[0][axis_conv['X']] - above[0][axis_conv['X']];
      direction[1] = below[0][axis_conv['Y']] - above[0][axis_conv['Y']];
      direction[2] = below[0][axis_conv['Z']] - above[0][axis_conv['Z']];

      var t = (below[0][chosen_axis] - axis_value)/(direction[chosen_axis]*-1);

      intersection_point[0] = below[0][other_axis_one] + t * direction[other_axis_one];
      //intersection_point[1] = axis_value;
      intersection_point[1] = below[0][other_axis_two] + t * direction[other_axis_two];

      direction[0] = below[1][axis_conv['X']] - above[0][axis_conv['X']];
      direction[1] = below[1][axis_conv['Y']] - above[0][axis_conv['Y']];
      direction[2] = below[1][axis_conv['Z']] - above[0][axis_conv['Z']];

      t = (below[1][chosen_axis] - axis_value)/(direction[chosen_axis]*-1);

      intersection_point[2] = below[1][other_axis_one] + t * direction[other_axis_one];
      //intersection_point[4] = axis_value;
      intersection_point[3] = below[1][other_axis_two] + t * direction[other_axis_two];

      return intersection_point;
    }
    else {
      var direction = [3];
      direction[0] = above[0][axis_conv['X']] - below[0][axis_conv['X']];
      direction[1] = above[0][axis_conv['Y']] - below[0][axis_conv['Y']];
      direction[2] = above[0][axis_conv['Z']] - below[0][axis_conv['Z']];

      var t = (above[0][chosen_axis] - axis_value)/(direction[chosen_axis]*-1);

      intersection_point[0] = above[0][other_axis_one] + t * direction[other_axis_one];
      //intersection_point[1] = axis_value;
      intersection_point[1] = above[0][other_axis_two] + t * direction[other_axis_two];

      direction[0] = above[1][axis_conv['X']] - below[0][axis_conv['X']];
      direction[1] = above[1][axis_conv['Y']] - below[0][axis_conv['Y']];
      direction[2] = above[1][axis_conv['Z']] - below[0][axis_conv['Z']];

      var t = (above[1][chosen_axis] - axis_value)/(direction[chosen_axis]*-1);

      intersection_point[2] = above[1][other_axis_one] + t * direction[other_axis_one];
      //intersection_point[4] = axis_value;
      intersection_point[3] = above[1][other_axis_two] + t * direction[other_axis_two];

      return intersection_point;
    }
  //}

}
