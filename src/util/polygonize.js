// Implementation of marching squares/cubes algorithm. Use this to interpolate a
// function in two or three dimensions to generate an edge.

var Polygonize = (function (scope) {
	const edgeTable2D = new Int32Array([
		0x0, 0x9, 0x3, 0xa, 0x6, 0xf, 0x5, 0xc,
		0xc, 0x5, 0xf, 0x6, 0xa, 0x3, 0x9, 0x0]);

	const lineTable2D = new Int32Array([
		-1, -1, -1, -1, -1,
		 3,  0, -1, -1, -1,
		 0,  1, -1, -1, -1,
		 1,  3, -1, -1, -1,
		 1,  2, -1, -1, -1,
		 0,  1,  2,  3, -1,
		 0,  2, -1, -1, -1,
		 2,  3, -1, -1, -1,
		 2,  3, -1, -1, -1,
		 0,  2, -1, -1, -1,
		 1,  2,  3,  0, -1,
		 1,  2, -1, -1, -1,
		 1,  3, -1, -1, -1,
		 0,  1, -1, -1, -1,
		 3,  0, -1, -1, -1,
		-1, -1, -1, -1, -1]);

	// The 3D tables were acquired from:
	// http://paulbourke.net/geometry/polygonise/
	const edgeTable3D = new Int32Array([
		0x0  , 0x109, 0x203, 0x30a, 0x406, 0x50f, 0x605, 0x70c,
		0x80c, 0x905, 0xa0f, 0xb06, 0xc0a, 0xd03, 0xe09, 0xf00,
		0x190, 0x99 , 0x393, 0x29a, 0x596, 0x49f, 0x795, 0x69c,
		0x99c, 0x895, 0xb9f, 0xa96, 0xd9a, 0xc93, 0xf99, 0xe90,
		0x230, 0x339, 0x33 , 0x13a, 0x636, 0x73f, 0x435, 0x53c,
		0xa3c, 0xb35, 0x83f, 0x936, 0xe3a, 0xf33, 0xc39, 0xd30,
		0x3a0, 0x2a9, 0x1a3, 0xaa , 0x7a6, 0x6af, 0x5a5, 0x4ac,
		0xbac, 0xaa5, 0x9af, 0x8a6, 0xfaa, 0xea3, 0xda9, 0xca0,
		0x460, 0x569, 0x663, 0x76a, 0x66 , 0x16f, 0x265, 0x36c,
		0xc6c, 0xd65, 0xe6f, 0xf66, 0x86a, 0x963, 0xa69, 0xb60,
		0x5f0, 0x4f9, 0x7f3, 0x6fa, 0x1f6, 0xff , 0x3f5, 0x2fc,
		0xdfc, 0xcf5, 0xfff, 0xef6, 0x9fa, 0x8f3, 0xbf9, 0xaf0,
		0x650, 0x759, 0x453, 0x55a, 0x256, 0x35f, 0x55 , 0x15c,
		0xe5c, 0xf55, 0xc5f, 0xd56, 0xa5a, 0xb53, 0x859, 0x950,
		0x7c0, 0x6c9, 0x5c3, 0x4ca, 0x3c6, 0x2cf, 0x1c5, 0xcc ,
		0xfcc, 0xec5, 0xdcf, 0xcc6, 0xbca, 0xac3, 0x9c9, 0x8c0,
		0x8c0, 0x9c9, 0xac3, 0xbca, 0xcc6, 0xdcf, 0xec5, 0xfcc,
		0xcc , 0x1c5, 0x2cf, 0x3c6, 0x4ca, 0x5c3, 0x6c9, 0x7c0,
		0x950, 0x859, 0xb53, 0xa5a, 0xd56, 0xc5f, 0xf55, 0xe5c,
		0x15c, 0x55 , 0x35f, 0x256, 0x55a, 0x453, 0x759, 0x650,
		0xaf0, 0xbf9, 0x8f3, 0x9fa, 0xef6, 0xfff, 0xcf5, 0xdfc,
		0x2fc, 0x3f5, 0xff , 0x1f6, 0x6fa, 0x7f3, 0x4f9, 0x5f0,
		0xb60, 0xa69, 0x963, 0x86a, 0xf66, 0xe6f, 0xd65, 0xc6c,
		0x36c, 0x265, 0x16f, 0x66 , 0x76a, 0x663, 0x569, 0x460,
		0xca0, 0xda9, 0xea3, 0xfaa, 0x8a6, 0x9af, 0xaa5, 0xbac,
		0x4ac, 0x5a5, 0x6af, 0x7a6, 0xaa , 0x1a3, 0x2a9, 0x3a0,
		0xd30, 0xc39, 0xf33, 0xe3a, 0x936, 0x83f, 0xb35, 0xa3c,
		0x53c, 0x435, 0x73f, 0x636, 0x13a, 0x33 , 0x339, 0x230,
		0xe90, 0xf99, 0xc93, 0xd9a, 0xa96, 0xb9f, 0x895, 0x99c,
		0x69c, 0x795, 0x49f, 0x596, 0x29a, 0x393, 0x99 , 0x190,
		0xf00, 0xe09, 0xd03, 0xc0a, 0xb06, 0xa0f, 0x905, 0x80c,
		0x70c, 0x605, 0x50f, 0x406, 0x30a, 0x203, 0x109, 0x0]);

	const triTable3D = new Int32Array([
		-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 0,  8,  3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 0,  1,  9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 1,  8,  3,  9,  8,  1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 1,  2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 0,  8,  3,  1,  2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 9,  2, 10,  0,  2,  9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 2,  8,  3,  2, 10,  8, 10,  9,  8, -1, -1, -1, -1, -1, -1, -1,
		 3, 11,  2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 0, 11,  2,  8, 11,  0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 1,  9,  0,  2,  3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 1, 11,  2,  1,  9, 11,  9,  8, 11, -1, -1, -1, -1, -1, -1, -1,
		 3, 10,  1, 11, 10,  3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 0, 10,  1,  0,  8, 10,  8, 11, 10, -1, -1, -1, -1, -1, -1, -1,
		 3,  9,  0,  3, 11,  9, 11, 10,  9, -1, -1, -1, -1, -1, -1, -1,
		 9,  8, 10, 10,  8, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 4,  7,  8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 4,  3,  0,  7,  3,  4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 0,  1,  9,  8,  4,  7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 4,  1,  9,  4,  7,  1,  7,  3,  1, -1, -1, -1, -1, -1, -1, -1,
		 1,  2, 10,  8,  4,  7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 3,  4,  7,  3,  0,  4,  1,  2, 10, -1, -1, -1, -1, -1, -1, -1,
		 9,  2, 10,  9,  0,  2,  8,  4,  7, -1, -1, -1, -1, -1, -1, -1,
		 2, 10,  9,  2,  9,  7,  2,  7,  3,  7,  9,  4, -1, -1, -1, -1,
		 8,  4,  7,  3, 11,  2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		11,  4,  7, 11,  2,  4,  2,  0,  4, -1, -1, -1, -1, -1, -1, -1,
		 9,  0,  1,  8,  4,  7,  2,  3, 11, -1, -1, -1, -1, -1, -1, -1,
		 4,  7, 11,  9,  4, 11,  9, 11,  2,  9,  2,  1, -1, -1, -1, -1,
		 3, 10,  1,  3, 11, 10,  7,  8,  4, -1, -1, -1, -1, -1, -1, -1,
		 1, 11, 10,  1,  4, 11,  1,  0,  4,  7, 11,  4, -1, -1, -1, -1,
		 4,  7,  8,  9,  0, 11,  9, 11, 10, 11,  0,  3, -1, -1, -1, -1,
		 4,  7, 11,  4, 11,  9,  9, 11, 10, -1, -1, -1, -1, -1, -1, -1,
		 9,  5,  4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 9,  5,  4,  0,  8,  3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 0,  5,  4,  1,  5,  0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 8,  5,  4,  8,  3,  5,  3,  1,  5, -1, -1, -1, -1, -1, -1, -1,
		 1,  2, 10,  9,  5,  4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 3,  0,  8,  1,  2, 10,  4,  9,  5, -1, -1, -1, -1, -1, -1, -1,
		 5,  2, 10,  5,  4,  2,  4,  0,  2, -1, -1, -1, -1, -1, -1, -1,
		 2, 10,  5,  3,  2,  5,  3,  5,  4,  3,  4,  8, -1, -1, -1, -1,
		 9,  5,  4,  2,  3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 0, 11,  2,  0,  8, 11,  4,  9,  5, -1, -1, -1, -1, -1, -1, -1,
		 0,  5,  4,  0,  1,  5,  2,  3, 11, -1, -1, -1, -1, -1, -1, -1,
		 2,  1,  5,  2,  5,  8,  2,  8, 11,  4,  8,  5, -1, -1, -1, -1,
		10,  3, 11, 10,  1,  3,  9,  5,  4, -1, -1, -1, -1, -1, -1, -1,
		 4,  9,  5,  0,  8,  1,  8, 10,  1,  8, 11, 10, -1, -1, -1, -1,
		 5,  4,  0,  5,  0, 11,  5, 11, 10, 11,  0,  3, -1, -1, -1, -1,
		 5,  4,  8,  5,  8, 10, 10,  8, 11, -1, -1, -1, -1, -1, -1, -1,
		 9,  7,  8,  5,  7,  9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 9,  3,  0,  9,  5,  3,  5,  7,  3, -1, -1, -1, -1, -1, -1, -1,
		 0,  7,  8,  0,  1,  7,  1,  5,  7, -1, -1, -1, -1, -1, -1, -1,
		 1,  5,  3,  3,  5,  7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 9,  7,  8,  9,  5,  7, 10,  1,  2, -1, -1, -1, -1, -1, -1, -1,
		10,  1,  2,  9,  5,  0,  5,  3,  0,  5,  7,  3, -1, -1, -1, -1,
		 8,  0,  2,  8,  2,  5,  8,  5,  7, 10,  5,  2, -1, -1, -1, -1,
		 2, 10,  5,  2,  5,  3,  3,  5,  7, -1, -1, -1, -1, -1, -1, -1,
		 7,  9,  5,  7,  8,  9,  3, 11,  2, -1, -1, -1, -1, -1, -1, -1,
		 9,  5,  7,  9,  7,  2,  9,  2,  0,  2,  7, 11, -1, -1, -1, -1,
		 2,  3, 11,  0,  1,  8,  1,  7,  8,  1,  5,  7, -1, -1, -1, -1,
		11,  2,  1, 11,  1,  7,  7,  1,  5, -1, -1, -1, -1, -1, -1, -1,
		 9,  5,  8,  8,  5,  7, 10,  1,  3, 10,  3, 11, -1, -1, -1, -1,
		 5,  7,  0,  5,  0,  9,  7, 11,  0,  1,  0, 10, 11, 10,  0, -1,
		11, 10,  0, 11,  0,  3, 10,  5,  0,  8,  0,  7,  5,  7,  0, -1,
		11, 10,  5,  7, 11,  5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		10,  6,  5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 0,  8,  3,  5, 10,  6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 9,  0,  1,  5, 10,  6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 1,  8,  3,  1,  9,  8,  5, 10,  6, -1, -1, -1, -1, -1, -1, -1,
		 1,  6,  5,  2,  6,  1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 1,  6,  5,  1,  2,  6,  3,  0,  8, -1, -1, -1, -1, -1, -1, -1,
		 9,  6,  5,  9,  0,  6,  0,  2,  6, -1, -1, -1, -1, -1, -1, -1,
		 5,  9,  8,  5,  8,  2,  5,  2,  6,  3,  2,  8, -1, -1, -1, -1,
		 2,  3, 11, 10,  6,  5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		11,  0,  8, 11,  2,  0, 10,  6,  5, -1, -1, -1, -1, -1, -1, -1,
		 0,  1,  9,  2,  3, 11,  5, 10,  6, -1, -1, -1, -1, -1, -1, -1,
		 5, 10,  6,  1,  9,  2,  9, 11,  2,  9,  8, 11, -1, -1, -1, -1,
		 6,  3, 11,  6,  5,  3,  5,  1,  3, -1, -1, -1, -1, -1, -1, -1,
		 0,  8, 11,  0, 11,  5,  0,  5,  1,  5, 11,  6, -1, -1, -1, -1,
		 3, 11,  6,  0,  3,  6,  0,  6,  5,  0,  5,  9, -1, -1, -1, -1,
		 6,  5,  9,  6,  9, 11, 11,  9,  8, -1, -1, -1, -1, -1, -1, -1,
		 5, 10,  6,  4,  7,  8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 4,  3,  0,  4,  7,  3,  6,  5, 10, -1, -1, -1, -1, -1, -1, -1,
		 1,  9,  0,  5, 10,  6,  8,  4,  7, -1, -1, -1, -1, -1, -1, -1,
		10,  6,  5,  1,  9,  7,  1,  7,  3,  7,  9,  4, -1, -1, -1, -1,
		 6,  1,  2,  6,  5,  1,  4,  7,  8, -1, -1, -1, -1, -1, -1, -1,
		 1,  2,  5,  5,  2,  6,  3,  0,  4,  3,  4,  7, -1, -1, -1, -1,
		 8,  4,  7,  9,  0,  5,  0,  6,  5,  0,  2,  6, -1, -1, -1, -1,
		 7,  3,  9,  7,  9,  4,  3,  2,  9,  5,  9,  6,  2,  6,  9, -1,
		 3, 11,  2,  7,  8,  4, 10,  6,  5, -1, -1, -1, -1, -1, -1, -1,
		 5, 10,  6,  4,  7,  2,  4,  2,  0,  2,  7, 11, -1, -1, -1, -1,
		 0,  1,  9,  4,  7,  8,  2,  3, 11,  5, 10,  6, -1, -1, -1, -1,
		 9,  2,  1,  9, 11,  2,  9,  4, 11,  7, 11,  4,  5, 10,  6, -1,
		 8,  4,  7,  3, 11,  5,  3,  5,  1,  5, 11,  6, -1, -1, -1, -1,
		 5,  1, 11,  5, 11,  6,  1,  0, 11,  7, 11,  4,  0,  4, 11, -1,
		 0,  5,  9,  0,  6,  5,  0,  3,  6, 11,  6,  3,  8,  4,  7, -1,
		 6,  5,  9,  6,  9, 11,  4,  7,  9,  7, 11,  9, -1, -1, -1, -1,
		10,  4,  9,  6,  4, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 4, 10,  6,  4,  9, 10,  0,  8,  3, -1, -1, -1, -1, -1, -1, -1,
		10,  0,  1, 10,  6,  0,  6,  4,  0, -1, -1, -1, -1, -1, -1, -1,
		 8,  3,  1,  8,  1,  6,  8,  6,  4,  6,  1, 10, -1, -1, -1, -1,
		 1,  4,  9,  1,  2,  4,  2,  6,  4, -1, -1, -1, -1, -1, -1, -1,
		 3,  0,  8,  1,  2,  9,  2,  4,  9,  2,  6,  4, -1, -1, -1, -1,
		 0,  2,  4,  4,  2,  6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 8,  3,  2,  8,  2,  4,  4,  2,  6, -1, -1, -1, -1, -1, -1, -1,
		10,  4,  9, 10,  6,  4, 11,  2,  3, -1, -1, -1, -1, -1, -1, -1,
		 0,  8,  2,  2,  8, 11,  4,  9, 10,  4, 10,  6, -1, -1, -1, -1,
		 3, 11,  2,  0,  1,  6,  0,  6,  4,  6,  1, 10, -1, -1, -1, -1,
		 6,  4,  1,  6,  1, 10,  4,  8,  1,  2,  1, 11,  8, 11,  1, -1,
		 9,  6,  4,  9,  3,  6,  9,  1,  3, 11,  6,  3, -1, -1, -1, -1,
		 8, 11,  1,  8,  1,  0, 11,  6,  1,  9,  1,  4,  6,  4,  1, -1,
		 3, 11,  6,  3,  6,  0,  0,  6,  4, -1, -1, -1, -1, -1, -1, -1,
		 6,  4,  8, 11,  6,  8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 7, 10,  6,  7,  8, 10,  8,  9, 10, -1, -1, -1, -1, -1, -1, -1,
		 0,  7,  3,  0, 10,  7,  0,  9, 10,  6,  7, 10, -1, -1, -1, -1,
		10,  6,  7,  1, 10,  7,  1,  7,  8,  1,  8,  0, -1, -1, -1, -1,
		10,  6,  7, 10,  7,  1,  1,  7,  3, -1, -1, -1, -1, -1, -1, -1,
		 1,  2,  6,  1,  6,  8,  1,  8,  9,  8,  6,  7, -1, -1, -1, -1,
		 2,  6,  9,  2,  9,  1,  6,  7,  9,  0,  9,  3,  7,  3,  9, -1,
		 7,  8,  0,  7,  0,  6,  6,  0,  2, -1, -1, -1, -1, -1, -1, -1,
		 7,  3,  2,  6,  7,  2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 2,  3, 11, 10,  6,  8, 10,  8,  9,  8,  6,  7, -1, -1, -1, -1,
		 2,  0,  7,  2,  7, 11,  0,  9,  7,  6,  7, 10,  9, 10,  7, -1,
		 1,  8,  0,  1,  7,  8,  1, 10,  7,  6,  7, 10,  2,  3, 11, -1,
		11,  2,  1, 11,  1,  7, 10,  6,  1,  6,  7,  1, -1, -1, -1, -1,
		 8,  9,  6,  8,  6,  7,  9,  1,  6, 11,  6,  3,  1,  3,  6, -1,
		 0,  9,  1, 11,  6,  7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 7,  8,  0,  7,  0,  6,  3, 11,  0, 11,  6,  0, -1, -1, -1, -1,
		 7, 11,  6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 7,  6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 3,  0,  8, 11,  7,  6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 0,  1,  9, 11,  7,  6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 8,  1,  9,  8,  3,  1, 11,  7,  6, -1, -1, -1, -1, -1, -1, -1,
		10,  1,  2,  6, 11,  7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 1,  2, 10,  3,  0,  8,  6, 11,  7, -1, -1, -1, -1, -1, -1, -1,
		 2,  9,  0,  2, 10,  9,  6, 11,  7, -1, -1, -1, -1, -1, -1, -1,
		 6, 11,  7,  2, 10,  3, 10,  8,  3, 10,  9,  8, -1, -1, -1, -1,
		 7,  2,  3,  6,  2,  7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 7,  0,  8,  7,  6,  0,  6,  2,  0, -1, -1, -1, -1, -1, -1, -1,
		 2,  7,  6,  2,  3,  7,  0,  1,  9, -1, -1, -1, -1, -1, -1, -1,
		 1,  6,  2,  1,  8,  6,  1,  9,  8,  8,  7,  6, -1, -1, -1, -1,
		10,  7,  6, 10,  1,  7,  1,  3,  7, -1, -1, -1, -1, -1, -1, -1,
		10,  7,  6,  1,  7, 10,  1,  8,  7,  1,  0,  8, -1, -1, -1, -1,
		 0,  3,  7,  0,  7, 10,  0, 10,  9,  6, 10,  7, -1, -1, -1, -1,
		 7,  6, 10,  7, 10,  8,  8, 10,  9, -1, -1, -1, -1, -1, -1, -1,
		 6,  8,  4, 11,  8,  6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 3,  6, 11,  3,  0,  6,  0,  4,  6, -1, -1, -1, -1, -1, -1, -1,
		 8,  6, 11,  8,  4,  6,  9,  0,  1, -1, -1, -1, -1, -1, -1, -1,
		 9,  4,  6,  9,  6,  3,  9,  3,  1, 11,  3,  6, -1, -1, -1, -1,
		 6,  8,  4,  6, 11,  8,  2, 10,  1, -1, -1, -1, -1, -1, -1, -1,
		 1,  2, 10,  3,  0, 11,  0,  6, 11,  0,  4,  6, -1, -1, -1, -1,
		 4, 11,  8,  4,  6, 11,  0,  2,  9,  2, 10,  9, -1, -1, -1, -1,
		10,  9,  3, 10,  3,  2,  9,  4,  3, 11,  3,  6,  4,  6,  3, -1,
		 8,  2,  3,  8,  4,  2,  4,  6,  2, -1, -1, -1, -1, -1, -1, -1,
		 0,  4,  2,  4,  6,  2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 1,  9,  0,  2,  3,  4,  2,  4,  6,  4,  3,  8, -1, -1, -1, -1,
		 1,  9,  4,  1,  4,  2,  2,  4,  6, -1, -1, -1, -1, -1, -1, -1,
		 8,  1,  3,  8,  6,  1,  8,  4,  6,  6, 10,  1, -1, -1, -1, -1,
		10,  1,  0, 10,  0,  6,  6,  0,  4, -1, -1, -1, -1, -1, -1, -1,
		 4,  6,  3,  4,  3,  8,  6, 10,  3,  0,  3,  9, 10,  9,  3, -1,
		10,  9,  4,  6, 10,  4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 4,  9,  5,  7,  6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 0,  8,  3,  4,  9,  5, 11,  7,  6, -1, -1, -1, -1, -1, -1, -1,
		 5,  0,  1,  5,  4,  0,  7,  6, 11, -1, -1, -1, -1, -1, -1, -1,
		11,  7,  6,  8,  3,  4,  3,  5,  4,  3,  1,  5, -1, -1, -1, -1,
		 9,  5,  4, 10,  1,  2,  7,  6, 11, -1, -1, -1, -1, -1, -1, -1,
		 6, 11,  7,  1,  2, 10,  0,  8,  3,  4,  9,  5, -1, -1, -1, -1,
		 7,  6, 11,  5,  4, 10,  4,  2, 10,  4,  0,  2, -1, -1, -1, -1,
		 3,  4,  8,  3,  5,  4,  3,  2,  5, 10,  5,  2, 11,  7,  6, -1,
		 7,  2,  3,  7,  6,  2,  5,  4,  9, -1, -1, -1, -1, -1, -1, -1,
		 9,  5,  4,  0,  8,  6,  0,  6,  2,  6,  8,  7, -1, -1, -1, -1,
		 3,  6,  2,  3,  7,  6,  1,  5,  0,  5,  4,  0, -1, -1, -1, -1,
		 6,  2,  8,  6,  8,  7,  2,  1,  8,  4,  8,  5,  1,  5,  8, -1,
		 9,  5,  4, 10,  1,  6,  1,  7,  6,  1,  3,  7, -1, -1, -1, -1,
		 1,  6, 10,  1,  7,  6,  1,  0,  7,  8,  7,  0,  9,  5,  4, -1,
		 4,  0, 10,  4, 10,  5,  0,  3, 10,  6, 10,  7,  3,  7, 10, -1,
		 7,  6, 10,  7, 10,  8,  5,  4, 10,  4,  8, 10, -1, -1, -1, -1,
		 6,  9,  5,  6, 11,  9, 11,  8,  9, -1, -1, -1, -1, -1, -1, -1,
		 3,  6, 11,  0,  6,  3,  0,  5,  6,  0,  9,  5, -1, -1, -1, -1,
		 0, 11,  8,  0,  5, 11,  0,  1,  5,  5,  6, 11, -1, -1, -1, -1,
		 6, 11,  3,  6,  3,  5,  5,  3,  1, -1, -1, -1, -1, -1, -1, -1,
		 1,  2, 10,  9,  5, 11,  9, 11,  8, 11,  5,  6, -1, -1, -1, -1,
		 0, 11,  3,  0,  6, 11,  0,  9,  6,  5,  6,  9,  1,  2, 10, -1,
		11,  8,  5, 11,  5,  6,  8,  0,  5, 10,  5,  2,  0,  2,  5, -1,
		 6, 11,  3,  6,  3,  5,  2, 10,  3, 10,  5,  3, -1, -1, -1, -1,
		 5,  8,  9,  5,  2,  8,  5,  6,  2,  3,  8,  2, -1, -1, -1, -1,
		 9,  5,  6,  9,  6,  0,  0,  6,  2, -1, -1, -1, -1, -1, -1, -1,
		 1,  5,  8,  1,  8,  0,  5,  6,  8,  3,  8,  2,  6,  2,  8, -1,
		 1,  5,  6,  2,  1,  6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 1,  3,  6,  1,  6, 10,  3,  8,  6,  5,  6,  9,  8,  9,  6, -1,
		10,  1,  0, 10,  0,  6,  9,  5,  0,  5,  6,  0, -1, -1, -1, -1,
		 0,  3,  8,  5,  6, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		10,  5,  6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		11,  5, 10,  7,  5, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		11,  5, 10, 11,  7,  5,  8,  3,  0, -1, -1, -1, -1, -1, -1, -1,
		 5, 11,  7,  5, 10, 11,  1,  9,  0, -1, -1, -1, -1, -1, -1, -1,
		10,  7,  5, 10, 11,  7,  9,  8,  1,  8,  3,  1, -1, -1, -1, -1,
		11,  1,  2, 11,  7,  1,  7,  5,  1, -1, -1, -1, -1, -1, -1, -1,
		 0,  8,  3,  1,  2,  7,  1,  7,  5,  7,  2, 11, -1, -1, -1, -1,
		 9,  7,  5,  9,  2,  7,  9,  0,  2,  2, 11,  7, -1, -1, -1, -1,
		 7,  5,  2,  7,  2, 11,  5,  9,  2,  3,  2,  8,  9,  8,  2, -1,
		 2,  5, 10,  2,  3,  5,  3,  7,  5, -1, -1, -1, -1, -1, -1, -1,
		 8,  2,  0,  8,  5,  2,  8,  7,  5, 10,  2,  5, -1, -1, -1, -1,
		 9,  0,  1,  5, 10,  3,  5,  3,  7,  3, 10,  2, -1, -1, -1, -1,
		 9,  8,  2,  9,  2,  1,  8,  7,  2, 10,  2,  5,  7,  5,  2, -1,
		 1,  3,  5,  3,  7,  5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 0,  8,  7,  0,  7,  1,  1,  7,  5, -1, -1, -1, -1, -1, -1, -1,
		 9,  0,  3,  9,  3,  5,  5,  3,  7, -1, -1, -1, -1, -1, -1, -1,
		 9,  8,  7,  5,  9,  7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 5,  8,  4,  5, 10,  8, 10, 11,  8, -1, -1, -1, -1, -1, -1, -1,
		 5,  0,  4,  5, 11,  0,  5, 10, 11, 11,  3,  0, -1, -1, -1, -1,
		 0,  1,  9,  8,  4, 10,  8, 10, 11, 10,  4,  5, -1, -1, -1, -1,
		10, 11,  4, 10,  4,  5, 11,  3,  4,  9,  4,  1,  3,  1,  4, -1,
		 2,  5,  1,  2,  8,  5,  2, 11,  8,  4,  5,  8, -1, -1, -1, -1,
		 0,  4, 11,  0, 11,  3,  4,  5, 11,  2, 11,  1,  5,  1, 11, -1,
		 0,  2,  5,  0,  5,  9,  2, 11,  5,  4,  5,  8, 11,  8,  5, -1,
		 9,  4,  5,  2, 11,  3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 2,  5, 10,  3,  5,  2,  3,  4,  5,  3,  8,  4, -1, -1, -1, -1,
		 5, 10,  2,  5,  2,  4,  4,  2,  0, -1, -1, -1, -1, -1, -1, -1,
		 3, 10,  2,  3,  5, 10,  3,  8,  5,  4,  5,  8,  0,  1,  9, -1,
		 5, 10,  2,  5,  2,  4,  1,  9,  2,  9,  4,  2, -1, -1, -1, -1,
		 8,  4,  5,  8,  5,  3,  3,  5,  1, -1, -1, -1, -1, -1, -1, -1,
		 0,  4,  5,  1,  0,  5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 8,  4,  5,  8,  5,  3,  9,  0,  5,  0,  3,  5, -1, -1, -1, -1,
		 9,  4,  5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 4, 11,  7,  4,  9, 11,  9, 10, 11, -1, -1, -1, -1, -1, -1, -1,
		 0,  8,  3,  4,  9,  7,  9, 11,  7,  9, 10, 11, -1, -1, -1, -1,
		 1, 10, 11,  1, 11,  4,  1,  4,  0,  7,  4, 11, -1, -1, -1, -1,
		 3,  1,  4,  3,  4,  8,  1, 10,  4,  7,  4, 11, 10, 11,  4, -1,
		 4, 11,  7,  9, 11,  4,  9,  2, 11,  9,  1,  2, -1, -1, -1, -1,
		 9,  7,  4,  9, 11,  7,  9,  1, 11,  2, 11,  1,  0,  8,  3, -1,
		11,  7,  4, 11,  4,  2,  2,  4,  0, -1, -1, -1, -1, -1, -1, -1,
		11,  7,  4, 11,  4,  2,  8,  3,  4,  3,  2,  4, -1, -1, -1, -1,
		 2,  9, 10,  2,  7,  9,  2,  3,  7,  7,  4,  9, -1, -1, -1, -1,
		 9, 10,  7,  9,  7,  4, 10,  2,  7,  8,  7,  0,  2,  0,  7, -1,
		 3,  7, 10,  3, 10,  2,  7,  4, 10,  1, 10,  0,  4,  0, 10, -1,
		 1, 10,  2,  8,  7,  4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 4,  9,  1,  4,  1,  7,  7,  1,  3, -1, -1, -1, -1, -1, -1, -1,
		 4,  9,  1,  4,  1,  7,  0,  8,  1,  8,  7,  1, -1, -1, -1, -1,
		 4,  0,  3,  7,  4,  3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 4,  8,  7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 9, 10,  8, 10, 11,  8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 3,  0,  9,  3,  9, 11, 11,  9, 10, -1, -1, -1, -1, -1, -1, -1,
		 0,  1, 10,  0, 10,  8,  8, 10, 11, -1, -1, -1, -1, -1, -1, -1,
		 3,  1, 10, 11,  3, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 1,  2, 11,  1, 11,  9,  9, 11,  8, -1, -1, -1, -1, -1, -1, -1,
		 3,  0,  9,  3,  9, 11,  1,  2,  9,  2, 11,  9, -1, -1, -1, -1,
		 0,  2, 11,  8,  0, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 3,  2, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 2,  3,  8,  2,  8, 10, 10,  8,  9, -1, -1, -1, -1, -1, -1, -1,
		 9, 10,  2,  0,  9,  2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 2,  3,  8,  2,  8, 10,  0,  1,  8,  1, 10,  8, -1, -1, -1, -1,
		 1, 10,  2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 1,  3,  8,  9,  1,  8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 0,  9,  1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		 0,  3,  8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]);

	// Create a class to handle the internal representation of data. In JS, this
	// function acts as a constructor for our class.
	function Polygonize() {
		// Establish members for the class
		this.equation = null; // The JS representation of an equation from parser.
		this.values = [];     // An array of interpolated values of the equation.
		this.points = [];     // An array of the coordinates for a value in values.

		this.bounds = [];     // An array of arrays of min-max values for each axis.
		this.geom = [];       // An array of the geometry for displaying.
		this.res = null;      // The resolution (number of cubes) per axis.
	}

	// Overwrite the prototype to expose helpful functions to the Polygonize
	// class. These functions are exposed to each instantiated object.
	Polygonize.prototype = {
		generate: function(eq, bounds, res) {
			this.equation = eq;
			this.bounds = bounds;
			this.res = Math.max(res, 10); // The minimum resolution is 10 per axis

			this.evaluate(); // Evaluate at the specified range and resolution
			this.march(); // Perform the marching squares/cubes algorithm

			return this.geom;
		},

		// Evaluate the function at grid points, storing them in the values array
		evaluate: function() {
		// Only support 2D and 3D visualization
			if (this.bounds.length < 2 || this.bounds.length > 3) {
				throw new Error("Polygonize error: must display in 2 or 3 dimensions");
			}

			// Verify that all bounds have 2 values
			this.bounds.forEach(function(axis) {
				if (axis.length != 2) {
					throw new Error("Polygonize error: axis must contain min and max");
				}
			});

			if (this.bounds.length == 2) {
				this.evaluate2D();
			} else if (this.bounds.length == 3){
				this.evaluate3D();
			}
		},

		// A helper function for evaluating points in 2 dimensions
		evaluate2D: function() {
			const xmin = this.bounds[0][0],
				  xmax = this.bounds[0][1],
				  ymin = this.bounds[1][0],
				  ymax = this.bounds[1][1],
				 xstep = (xmax - xmin) / this.res,
				 ystep = (ymax - ymin) / this.res;

			let x, y;
			for (x = xmin; x < xmax; x += xstep) {
				for (y = ymin; y < ymax; y += ystep) {
					// Calculate the value of the equation at the current xy coordinate
					this.points.push( [x, y] );
					this.values.push( this.equation(x, y) );
				}
			}
		},

		// A helper function for evaluating points in 3 dimensions
		evaluate3D: function() {
			const xmin = this.bounds[0][0],
			xmax = this.bounds[0][1],
			ymin = this.bounds[1][0],
			ymax = this.bounds[1][1],
			zmin = this.bounds[2][0],
			zmax = this.bounds[2][1],
			xstep = (xmax - xmin) / this.res,
			ystep = (ymax - ymin) / this.res,
			zstep = (zmax - zmin) / this.res;

			let x, y, z;
			for (x = xmin; x < xmax; x += xstep) {
				for (y = ymin; y < ymax; y += ystep) {
					for (z = zmin; z < zmax; z += zstep) {
						// Calculate the value of the equation at the current xy coordinate
						this.points.push( [x, y, z] );
						this.values.push( this.equation(x, y, z) );
					}
				}
			}
		},

		// Perform the marching squares/cubes algorithm
		march: function() {
			if (this.bounds.length == 2) {
				this.march2D();
			} else if (this.bounds.length == 3){
				this.march3D();
			} else {
				throw new Error("Polygonize error: can't determine marching algorithm");
			}
		},

		// A helper function for performing the marching squares algorithm
		march2D: function() {
			// An array to hold interpolated values
			let vlist = new Array(4); // 4 edges in a square

			// Loop over all of the squares
			let xind, yind;
			for (xind = 0; xind < this.res-1; xind++) {
				for (yind = 0; yind < this.res-1; yind++) {
					// Determine the index of the values array corresponding to the
					// vertices of the square.
					let p   = xind + this.res * yind, // lower left
					px  = p  + 1,                 // lower right
					py  = p  + this.res,          // upper left
					pxy = py + 1;                 // upper right

					// Retrieve the values of the equation at these indices
					let val0 = this.values[ p   ],
						val1 = this.values[ px  ],
						val2 = this.values[ py  ],
						val3 = this.values[ pxy ];

					const isolevel = 0; // This is the value the equation is compared to

					// Determine which points are in less than the isolevel
					let squareindex = 0;
					if ( val0 < isolevel) squareindex |= 1;
					if ( val1 < isolevel) squareindex |= 2;
					if ( val2 < isolevel) squareindex |= 8;
					if ( val3 < isolevel) squareindex |= 4;

					// squareindex indicates which vertices are less than the isolevel.
					// We can use the edgeTable2D to determine which edges in the square
					// were crossed (a 4-bit number).
					let bits = edgeTable2D[squareindex];

					// If bits == 0, then all the vertices of the square lie outside the
					// isolevel.
					if (bits == 0) continue;

					let mu = 0.5; // The value used for interpolation

					// Using the edges that were crossed, interpolate the value along the
					// edge where the isolevel is.
					if ( bits & 1 ) {
						mu = ( isolevel - val0 ) / ( val1 - val0 );
						vlist[0] = this.interpolate(this.points[p], this.points[px], mu);
					}
					if ( bits & 2 ) {
						mu = ( isolevel - val1 ) / ( val3 - val1 );
						vlist[1] = this.interpolate(this.points[px], this.points[pxy], mu);
					}
					if ( bits & 4 ) {
						mu = ( isolevel - val2 ) / ( val3 - val2 );
						vlist[2] = this.interpolate(this.points[py], this.points[pxy], mu);
					}
					if ( bits & 8 ) {
						mu = ( isolevel - val0 ) / ( val2 - val0 );
						vlist[3] = this.interpolate(this.points[p], this.points[py], mu);
					}

					// Use the lineTable2D to lookup which points in vlist to draw a line
					// segment between
					let ind = 0;
					squareindex *= 5; // repurpose squareindex to lookup in lineTable2D

					while (lineTable2D[ squareindex + ind ] != -1) {
						let vert1 = lineTable2D[ squareindex + ind ],
						vert2 = lineTable2D[ squareindex + ind + 1 ];

						// Add the vertices to the geometry to be returned. Calling slice
						// causes the array to be passed by value, rather than by reference.
						this.geom.push( vlist[vert1].slice() );
						this.geom.push( vlist[vert2].slice() );

						ind += 2;
					}
				} // End for loop over y
			} // End for loop over x
		},

		// A helper function for performing the marching cubes algorithm
		march3D: function() {
			// An array to hold interpolated values
			let vlist = new Array(12); // 12 edges in a cube

			// Loop over all of the squares
			let xind, yind, zind;
			for (xind = 0; xind < this.res-1; xind++) {
				for (yind = 0; yind < this.res-1; yind++) {
					for (zind = 0; zind < this.res-1; zind++) {
						// Determine the index of the values array corresponding to the
						// vertices of the square.
						let p    = xind + this.res * yind + Math.pow(this.res, 2) * zind,
							px   = p   + 1,
							py   = p   + this.res,
							pxy  = py  + 1,
							pz   = p   + Math.pow(this.res, 2),
							pxz  = pz  + 1,
							pyz  = pz  + this.res,
							pxyz = pyz + 1;

						// Retrieve the values of the equation at these indices
						let val0  = this.values[ p    ],
							val1  = this.values[ px   ],
							val2  = this.values[ py   ],
							val3  = this.values[ pxy  ],
							val4  = this.values[ pz   ],
							val5  = this.values[ pxz  ],
							val6  = this.values[ pyz  ],
							val7  = this.values[ pxyz ];


						const isolevel = 0; // This is the value the equation is compared to

						// Determine which points are in less than the isolevel
						let cubeIndex = 0;
						if ( val0 < isolevel) cubeIndex |= 1;
						if ( val1 < isolevel) cubeIndex |= 2;
						if ( val2 < isolevel) cubeIndex |= 8;
						if ( val3 < isolevel) cubeIndex |= 4;
						if ( val4 < isolevel) cubeIndex |= 16;
						if ( val5 < isolevel) cubeIndex |= 32;
						if ( val6 < isolevel) cubeIndex |= 128;
						if ( val7 < isolevel) cubeIndex |= 64;

						// cubeIndex indicates which vertices are less than the isolevel.
						// We can use the edgeTable2D to determine which edges in the square
						// were crossed (a 4-bit number).
						let bits = edgeTable3D[cubeIndex];

						// If bits == 0, then all the vertices of the square lie outside the
						// isolevel.
						if (bits == 0) continue;

						let mu = 0.5; // The value used for interpolation

						// Using the edges that were crossed, interpolate the value along the
						// edge where the isolevel is.
						if ( bits & 1 ) {
							mu = ( isolevel - val0 ) / ( val1 - val0 );
							vlist[0] = this.interpolate(this.points[p], this.points[px], mu);
						}
						if ( bits & 2 ) {
							mu = ( isolevel - val1 ) / ( val3 - val1 );
							vlist[1] = this.interpolate(this.points[px], this.points[pxy], mu);
						}
						if ( bits & 4 ) {
							mu = ( isolevel - val2 ) / ( val3 - val2 );
							vlist[2] = this.interpolate(this.points[py], this.points[pxy], mu);
						}
						if ( bits & 8 ) {
							mu = ( isolevel - val0 ) / ( val2 - val0 );
							vlist[3] = this.interpolate(this.points[p], this.points[py], mu);
						}
						if ( bits & 16 ) {
							mu = ( isolevel - val4 ) / ( val5 - val4 );
							vlist[4] = this.interpolate(this.points[pz], this.points[pxz], mu);
						}
						if ( bits & 32 ) {
							mu = ( isolevel - val5 ) / ( val7 - val5 );
							vlist[5] = this.interpolate(this.points[pxz], this.points[pxyz], mu);
						}
						if ( bits & 64 ) {
							mu = ( isolevel - val6 ) / ( val7 - val6 );
							vlist[6] = this.interpolate(this.points[pyz], this.points[pxyz], mu);
						}
						if ( bits & 128 ) {
							mu = ( isolevel - val4 ) / ( val6 - val4 );
							vlist[7] = this.interpolate(this.points[pz], this.points[pyz], mu);
						}
						if ( bits & 256 ) {
							mu = ( isolevel - val0 ) / ( val4 - val0 );
							vlist[8] = this.interpolate(this.points[p], this.points[pz], mu);
						}
						if ( bits & 512 ) {
							mu = ( isolevel - val1 ) / ( val5 - val1 );
							vlist[9] = this.interpolate(this.points[px], this.points[pxz], mu);
						}
						if ( bits & 1024 ) {
							mu = ( isolevel - val3 ) / ( val7 - val3 );
							vlist[10] = this.interpolate(this.points[pxy], this.points[pxyz], mu);
						}
						if ( bits & 2048 ) {
							mu = ( isolevel - val2 ) / ( val6 - val2 );
							vlist[11] = this.interpolate(this.points[py], this.points[pyz], mu);
						}

						// Use the lineTable2D to lookup which points in vlist to draw a line
						// segment between
						let ind = 0;
						cubeIndex *= 16; // repurpose cubeIndex to lookup in triTable3D

						while (triTable3D[ cubeIndex + ind ] != -1) {
							let vert1 = triTable3D[ cubeIndex + ind ],
								vert2 = triTable3D[ cubeIndex + ind + 1 ],
								vert3 = triTable3D[ cubeIndex + ind + 2 ];

							// Add the vertices to the geometry to be returned. Calling slice
							// causes the array to be passed by value, rather than by reference.
							this.geom.push( vlist[vert1].slice() );
							this.geom.push( vlist[vert2].slice() );
							this.geom.push( vlist[vert3].slice() );

							ind += 3;
						}
					} // End for loop over z
				} // End for loop over y
			} // End for loop over x
		},

		// A helper function for linear interpolation between two points
		interpolate: function(p1, p2, mu) {
			if (p1.length != p2.length) {
				throw new Error("Polygonize error: must have same len to interpolate");
			}

			let newPoint = [];
			for (let i = 0; i < p1.length; i++) {
				newPoint.push( (p2[i] - p1[i]) * mu + p1[i] );
			}
			return newPoint;
		}
	} // End of Prototype

	// Expose the function to the module so that those using this module can call
	// Polygonize.generate(args). This will create a new object and call the
	// generate method, returning the value of the method to the caller. The
	// object will then be garbage collected.
	Polygonize.generate = function(eq, bounds, res) {
		return new Polygonize().generate(eq, bounds, res);
	}

	scope.Polygonize = Polygonize;
	return Polygonize;
})(typeof exports === 'undefined' ? {} : exports);