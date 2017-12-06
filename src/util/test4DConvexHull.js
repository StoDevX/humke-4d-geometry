// import necessary module(s)
const assert = require('assert');

// import methods to be tested
var c4d = require('./4dconvexhull');

// unit vector in Euclidean 4-Dimensional space
var e1 = [1,0,0,0]; var e2 = [0,1,0,0]; var e3 = [0,0,1,0]; var e4 = [0,0,0,1];

// 16 vectors participated in the test, permutation of {1,2,3,4}
var vecT0  = [1,2,3,4]; var vecT1  = [1,2,4,3]; var vecT2  = [1,3,2,4]; var vecT3  = [1,3,4,2];
var vecT4  = [1,4,2,3]; var vecT5  = [1,4,3,2]; var vecT6  = [2,1,3,4]; var vecT7  = [2,1,4,3];
var vecT8  = [2,3,1,4]; var vecT9  = [2,3,4,1]; var vecT10 = [2,4,1,3]; var vecT11 = [2,4,3,1];
var vecT12 = [3,1,2,4]; var vecT13 = [3,1,4,2]; var vecT14 = [3,2,1,4]; var vecT15 = [3,2,4,1];

// ConvexHull4D.prototype.arrEqual
console.log(c4d.ConvexHull4D.prototype.arrEqual([1,1,1,1],[1,1,1,0]))

// assert.deepStrictEqual(c4d.ConvexHull4D.prototype.arrEqual(vecT0,vecT1), false)

// ConvexHull4D.prototype.Arr1InArr2

// ConvexHull4D.prototype.vecSubtract

// ConvexHull4D.prototype.Magnitude

// ConvexHull4D.prototype.Dot

// ConvexHull4D.prototype.Cross