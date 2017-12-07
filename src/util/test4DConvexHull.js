// import necessary module(s)
const assert = require('assert');
// import methods to be tested
var c4d = require('./4dconvexhull');

// unit vector in Euclidean 4-Dimensional space
var u1 = [1,0,0,0]; var u2 = [0,1,0,0]; var u3 = [0,0,1,0]; var u4 = [0,0,0,1];
// vectors and array of vectors participated in the test
var vecT0  = [1,2,3,4];     var vecT1  = [1,2,4,3];     var vecT2  = [1,3,2,4];     var vecT3  = [1,3,4,2];
var vecT4  = [1,4,2,3];     var vecT5  = [-1,-4,-3,-2]; var vecT6  = [2,1,3,4];     var vecT7  = [-2,-1,-4,-3];
var vecT8  = [-2,-3,-1,-4]; var vecT9  = [2,3,4,1];     var vecT10 = [-2,-4,-1,-3]; var vecT11 = [2,4,3,1];
var vecT12 = [-3,-1,-2,-4]; var vecT13 = [-3,-1,-4,-2]; var vecT14 = [3,2,1,4];     var vecT15 = [3,2,4,1];
var arrOfVec = [vecT0,vecT1,vecT2,vecT3,vecT4,vecT5,vecT6,vecT7,vecT8,vecT9,vecT10,vecT11,vecT12,vecT13,vecT14,vecT15];

// ConvexHull4D.prototype.arrEqual
var toBeTested = [[vecT0,vecT1],[vecT2,vecT3],[vecT4,vecT4],[vecT5,vecT6],[u1,u1]];
var expected = [false,false,true,false,true];
for (var i = 0; i < toBeTested.length; ++i) {
    assert(c4d.ConvexHull4D.prototype.arrEqual(toBeTested[i][0],toBeTested[i][1]) === expected[i],
           "arrEqual has an error under case " + i + ".");
}
console.log("arrEqual passed the test.");

// ConvexHull4D.prototype.Arr1InArr2
toBeTested = [vecT10,vecT14,vecT15,u1,u4];
expected = [true,true,true,false,false];
for (var i = 0; i < toBeTested.length; ++i) {
    assert(c4d.ConvexHull4D.prototype.Arr1InArr2(toBeTested[i],arrOfVec) === expected[i],
           "Arr1InArr2 has an error under case " + i + ".");
}
console.log("Arr1InArr2 passed the test.");

// ConvexHull4D.prototype.vecSubtract
toBeTested = [[vecT0,vecT1],[vecT7,vecT3],[vecT4,vecT4],[vecT14,vecT10],[u2,u1]];
expected = [[0,0,-1,1],[-3,-4,-8,-5],[0,0,0,0],[5,6,2,7],[-1,1,0,0]];
for (var i = 0; i < toBeTested.length; ++i) {
    var lhs = c4d.ConvexHull4D.prototype.vecSubtract(toBeTested[i][0],toBeTested[i][1]);
    var rhs = expected[i];
    assert(c4d.ConvexHull4D.prototype.arrEqual(lhs,rhs) === true,
           "vecSubtract has an error under case " + i + ".");
}
console.log("vecSubtract passed the test.");

// ConvexHull4D.prototype.Magnitude
toBeTested = [[1,5,3,9],[2,4,-3,0],vecT15,u1,u3];
expected = [10.770329614,5.385164807,5.477225575,1.0,1.0];
for (var i = 0; i < toBeTested.length; ++i) {
    assert(Number(c4d.ConvexHull4D.prototype.Magnitude(toBeTested[i]).toFixed(9)) === expected[i],
           "Magnitude has an error under case " + i + ".");
}
console.log("Magnitude passed the test (precision: 9 decimal places).");

// ConvexHull4D.prototype.Dot
toBeTested = [[vecT2,vecT7],[vecT1,u3],[vecT4,[8,8,8,8]],[vecT15,vecT10],[vecT5,u1]];
expected = [-25,4,80,-21,-1];
for (var i = 0; i < toBeTested.length; ++i) {
    assert(c4d.ConvexHull4D.prototype.Dot(toBeTested[i][0],toBeTested[i][1]) === expected[i],
           "Dot has an error under case " + i + ".");
}
console.log("Dot passed the test.");

// ConvexHull4D.prototype.Cross
// toBeTested = [[vecT0,vecT1,vecT2],[vecT7,vecT3,u1],[vecT4,vecT5,u3],[vecT14,vecT10,vecT12],[u2,u1,u3]];
// expected = [];
// for (var i = 0; i < toBeTested.length; ++i) {
//     var lhs = c4d.ConvexHull4D.prototype.Cross(toBeTested[i][0],toBeTested[i][1],toBeTested[i][2]);
//     var rhs = expected[i];
//     assert(c4d.ConvexHull4D.prototype.arrEqual(lhs,rhs) === true,
//            "Cross has an error under case " + i + ".");
// }
// console.log("Cross passed the test.");