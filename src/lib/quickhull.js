(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
var QuickHull = require('quickhull3d/dist/QuickHull')
window.QuickHull = QuickHull

},{"quickhull3d/dist/QuickHull":5}],3:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DELETED = exports.NON_CONVEX = exports.VISIBLE = undefined;

var _debugFn = require('debug-fn');

var _debugFn2 = _interopRequireDefault(_debugFn);

var _dot = require('gl-vec3/dot');

var _dot2 = _interopRequireDefault(_dot);

var _add = require('gl-vec3/add');

var _add2 = _interopRequireDefault(_add);

var _subtract = require('gl-vec3/subtract');

var _subtract2 = _interopRequireDefault(_subtract);

var _cross = require('gl-vec3/cross');

var _cross2 = _interopRequireDefault(_cross);

var _copy = require('gl-vec3/copy');

var _copy2 = _interopRequireDefault(_copy);

var _length = require('gl-vec3/length');

var _length2 = _interopRequireDefault(_length);

var _scale = require('gl-vec3/scale');

var _scale2 = _interopRequireDefault(_scale);

var _scaleAndAdd = require('gl-vec3/scaleAndAdd');

var _scaleAndAdd2 = _interopRequireDefault(_scaleAndAdd);

var _normalize = require('gl-vec3/normalize');

var _normalize2 = _interopRequireDefault(_normalize);

var _HalfEdge = require('./HalfEdge');

var _HalfEdge2 = _interopRequireDefault(_HalfEdge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var debug = (0, _debugFn2.default)('face');

var VISIBLE = exports.VISIBLE = 0;
var NON_CONVEX = exports.NON_CONVEX = 1;
var DELETED = exports.DELETED = 2;

var Face = (function () {
  function Face() {
    _classCallCheck(this, Face);

    this.normal = [];
    this.centroid = [];
    // signed distance from face to the origin
    this.offset = 0;
    // pointer to the a vertex in a double linked list this face can see
    this.outside = null;
    this.mark = VISIBLE;
    this.edge = null;
    this.nVertices = 0;
  }

  _createClass(Face, [{
    key: 'getEdge',
    value: function getEdge(i) {
      if (typeof i !== 'number') {
        throw Error('requires a number');
      }
      var it = this.edge;
      while (i > 0) {
        it = it.next;
        i -= 1;
      }
      while (i < 0) {
        it = it.prev;
        i += 1;
      }
      return it;
    }
  }, {
    key: 'computeNormal',
    value: function computeNormal() {
      var e0 = this.edge;
      var e1 = e0.next;
      var e2 = e1.next;
      var v2 = (0, _subtract2.default)([], e1.head().point, e0.head().point);
      var t = [];
      var v1 = [];

      this.nVertices = 2;
      this.normal = [0, 0, 0];
      while (e2 !== e0) {
        (0, _copy2.default)(v1, v2);
        (0, _subtract2.default)(v2, e2.head().point, e0.head().point);
        (0, _add2.default)(this.normal, this.normal, (0, _cross2.default)(t, v1, v2));
        e2 = e2.next;
        this.nVertices += 1;
      }
      this.area = (0, _length2.default)(this.normal);
      // normalize the vector, since we've already calculated the area
      // it's cheaper to scale the vector using this quantity instead of
      // doing the same operation again
      this.normal = (0, _scale2.default)(this.normal, this.normal, 1 / this.area);
    }
  }, {
    key: 'computeNormalMinArea',
    value: function computeNormalMinArea(minArea) {
      this.computeNormal();
      if (this.area < minArea) {
        // compute the normal without the longest edge
        var maxEdge = undefined;
        var maxSquaredLength = 0;
        var edge = this.edge;

        // find the longest edge (in length) in the chain of edges
        do {
          var lengthSquared = edge.lengthSquared();
          if (lengthSquared > maxSquaredLength) {
            maxEdge = edge;
            maxSquaredLength = lengthSquared;
          }
          edge = edge.next;
        } while (edge !== this.edge);

        var p1 = maxEdge.tail().point;
        var p2 = maxEdge.head().point;
        var maxVector = (0, _subtract2.default)([], p2, p1);
        var maxLength = Math.sqrt(maxSquaredLength);
        // maxVector is normalized after this operation
        (0, _scale2.default)(maxVector, maxVector, 1 / maxLength);
        // compute the projection of maxVector over this face normal
        var maxProjection = (0, _dot2.default)(this.normal, maxVector);
        // subtract the quantity maxEdge adds on the normal
        (0, _scaleAndAdd2.default)(this.normal, this.normal, maxVector, -maxProjection);
        // renormalize `this.normal`
        (0, _normalize2.default)(this.normal, this.normal);
      }
    }
  }, {
    key: 'computeCentroid',
    value: function computeCentroid() {
      this.centroid = [0, 0, 0];
      var edge = this.edge;
      do {
        (0, _add2.default)(this.centroid, this.centroid, edge.head().point);
        edge = edge.next;
      } while (edge !== this.edge);
      (0, _scale2.default)(this.centroid, this.centroid, 1 / this.nVertices);
    }
  }, {
    key: 'computeNormalAndCentroid',
    value: function computeNormalAndCentroid(minArea) {
      if ((typeof minArea === 'undefined' ? 'undefined' : _typeof(minArea)) !== undefined) {
        this.computeNormalMinArea(minArea);
      } else {
        this.computeNormal();
      }
      this.computeCentroid();
      this.offset = (0, _dot2.default)(this.normal, this.centroid);
    }
  }, {
    key: 'distanceToPlane',
    value: function distanceToPlane(point) {
      return (0, _dot2.default)(this.normal, point) - this.offset;
    }

    /**
     * @private
     *
     * Connects two edges assuming that prev.head().point === next.tail().point
     *
     * @param {HalfEdge} prev
     * @param {HalfEdge} next
     */

  }, {
    key: 'connectHalfEdges',
    value: function connectHalfEdges(prev, next) {
      var discardedFace = undefined;
      if (prev.opposite.face === next.opposite.face) {
        // `prev` is remove a redundant edge
        var oppositeFace = next.opposite.face;
        var oppositeEdge = undefined;
        if (prev === this.edge) {
          this.edge = next;
        }
        if (oppositeFace.nVertices === 3) {
          // case:
          // remove the face on the right
          //
          //       /|\
          //      / | \ the face on the right
          //     /  |  \ --> opposite edge
          //    / a |   \
          //   *----*----*
          //  /     b  |  \
          //           ▾
          //      redundant edge
          //
          // Note: the opposite edge is actually in the face to the right
          // of the face to be destroyed
          oppositeEdge = next.opposite.prev.opposite;
          oppositeFace.mark = DELETED;
          discardedFace = oppositeFace;
        } else {
          // case:
          //          t
          //        *----
          //       /| <- right face's redundant edge
          //      / | opposite edge
          //     /  |  ▴   /
          //    / a |  |  /
          //   *----*----*
          //  /     b  |  \
          //           ▾
          //      redundant edge
          oppositeEdge = next.opposite.next;
          // make sure that the link `oppositeFace.edge` points correctly even
          // after the right face redundant edge is removed
          if (oppositeFace.edge === oppositeEdge.prev) {
            oppositeFace.edge = oppositeEdge;
          }

          //       /|   /
          //      / | t/opposite edge
          //     /  | / ▴  /
          //    / a |/  | /
          //   *----*----*
          //  /     b     \
          oppositeEdge.prev = oppositeEdge.prev.prev;
          oppositeEdge.prev.next = oppositeEdge;
        }
        //       /|
        //      / |
        //     /  |
        //    / a |
        //   *----*----*
        //  /     b  ▴  \
        //           |
        //     redundant edge
        next.prev = prev.prev;
        next.prev.next = next;

        //       / \  \
        //      /   \->\
        //     /     \<-\ opposite edge
        //    / a     \  \
        //   *----*----*
        //  /     b  ^  \
        next.setOpposite(oppositeEdge);

        oppositeFace.computeNormalAndCentroid();
      } else {
        // trivial case
        //        *
        //       /|\
        //      / | \
        //     /  |--> next
        //    / a |   \
        //   *----*----*
        //    \ b |   /
        //     \  |--> prev
        //      \ | /
        //       \|/
        //        *
        prev.next = next;
        next.prev = prev;
      }
      return discardedFace;
    }
  }, {
    key: 'mergeAdjacentFaces',
    value: function mergeAdjacentFaces(adjacentEdge, discardedFaces) {
      var oppositeEdge = adjacentEdge.opposite;
      var oppositeFace = oppositeEdge.face;

      discardedFaces.push(oppositeFace);
      oppositeFace.mark = DELETED;

      // find the chain of edges whose opposite face is `oppositeFace`
      //
      //                ===>
      //      \         face         /
      //       * ---- * ---- * ---- *
      //      /     opposite face    \
      //                <===
      //
      var adjacentEdgePrev = adjacentEdge.prev;
      var adjacentEdgeNext = adjacentEdge.next;
      var oppositeEdgePrev = oppositeEdge.prev;
      var oppositeEdgeNext = oppositeEdge.next;

      // left edge
      while (adjacentEdgePrev.opposite.face === oppositeFace) {
        adjacentEdgePrev = adjacentEdgePrev.prev;
        oppositeEdgeNext = oppositeEdgeNext.next;
      }
      // right edge
      while (adjacentEdgeNext.opposite.face === oppositeFace) {
        adjacentEdgeNext = adjacentEdgeNext.next;
        oppositeEdgePrev = oppositeEdgePrev.prev;
      }
      // adjacentEdgePrev  \         face         / adjacentEdgeNext
      //                    * ---- * ---- * ---- *
      // oppositeEdgeNext  /     opposite face    \ oppositeEdgePrev

      // fix the face reference of all the opposite edges that are not part of
      // the edges whose opposite face is not `face` i.e. all the edges that
      // `face` and `oppositeFace` do not have in common
      var edge = undefined;
      for (edge = oppositeEdgeNext; edge !== oppositeEdgePrev.next; edge = edge.next) {
        edge.face = this;
      }

      // make sure that `face.edge` is not one of the edges to be destroyed
      // Note: it's important for it to be a `next` edge since `prev` edges
      // might be destroyed on `connectHalfEdges`
      this.edge = adjacentEdgeNext;

      // connect the extremes
      // Note: it might be possible that after connecting the edges a triangular
      // face might be redundant
      var discardedFace = undefined;
      discardedFace = this.connectHalfEdges(oppositeEdgePrev, adjacentEdgeNext);
      if (discardedFace) {
        discardedFaces.push(discardedFace);
      }
      discardedFace = this.connectHalfEdges(adjacentEdgePrev, oppositeEdgeNext);
      if (discardedFace) {
        discardedFaces.push(discardedFace);
      }

      this.computeNormalAndCentroid();
      // TODO: additional consistency checks
      return discardedFaces;
    }
  }, {
    key: 'collectIndices',
    value: function collectIndices() {
      var indices = [];
      var edge = this.edge;
      do {
        indices.push(edge.head().index);
        edge = edge.next;
      } while (edge !== this.edge);
      return indices;
    }
  }], [{
    key: 'createTriangle',
    value: function createTriangle(v0, v1, v2) {
      var minArea = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

      var face = new Face();
      var e0 = new _HalfEdge2.default(v0, face);
      var e1 = new _HalfEdge2.default(v1, face);
      var e2 = new _HalfEdge2.default(v2, face);

      // join edges
      e0.next = e2.prev = e1;
      e1.next = e0.prev = e2;
      e2.next = e1.prev = e0;

      // main half edge reference
      face.edge = e0;
      face.computeNormalAndCentroid(minArea);
      debug(function () {
        this.log('face created %j', face.collectIndices());
      });
      return face;
    }
  }]);

  return Face;
})();

exports.default = Face;
},{"./HalfEdge":4,"debug-fn":8,"gl-vec3/add":13,"gl-vec3/copy":14,"gl-vec3/cross":15,"gl-vec3/dot":17,"gl-vec3/length":18,"gl-vec3/normalize":19,"gl-vec3/scale":20,"gl-vec3/scaleAndAdd":21,"gl-vec3/subtract":24}],4:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _distance = require('gl-vec3/distance');

var _distance2 = _interopRequireDefault(_distance);

var _squaredDistance = require('gl-vec3/squaredDistance');

var _squaredDistance2 = _interopRequireDefault(_squaredDistance);

var _debugFn = require('debug-fn');

var _debugFn2 = _interopRequireDefault(_debugFn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var debug = (0, _debugFn2.default)('halfedge');

var HalfEdge = (function () {
  function HalfEdge(vertex, face) {
    _classCallCheck(this, HalfEdge);

    this.vertex = vertex;
    this.face = face;
    this.next = null;
    this.prev = null;
    this.opposite = null;
  }

  _createClass(HalfEdge, [{
    key: 'head',
    value: function head() {
      return this.vertex;
    }
  }, {
    key: 'tail',
    value: function tail() {
      return this.prev ? this.prev.vertex : null;
    }
  }, {
    key: 'length',
    value: function length() {
      if (this.tail()) {
        return (0, _distance2.default)(this.tail().point, this.head().point);
      }
      return -1;
    }
  }, {
    key: 'lengthSquared',
    value: function lengthSquared() {
      if (this.tail()) {
        return (0, _squaredDistance2.default)(this.tail().point, this.head().point);
      }
      return -1;
    }
  }, {
    key: 'setOpposite',
    value: function setOpposite(edge) {
      var me = this;
      debug(function () {
        this.log('opposite ' + me.tail().index + ' <--> ' + me.head().index + ' between ' + me.face.collectIndices() + ', ' + edge.face.collectIndices());
      });
      this.opposite = edge;
      edge.opposite = this;
    }
  }]);

  return HalfEdge;
})();

exports.default = HalfEdge;
module.exports = exports['default'];
},{"debug-fn":8,"gl-vec3/distance":16,"gl-vec3/squaredDistance":22}],5:[function(require,module,exports){
'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pointLineDistance = require('point-line-distance');

var _pointLineDistance2 = _interopRequireDefault(_pointLineDistance);

var _getPlaneNormal = require('get-plane-normal');

var _getPlaneNormal2 = _interopRequireDefault(_getPlaneNormal);

var _debugFn = require('debug-fn');

var _debugFn2 = _interopRequireDefault(_debugFn);

var _dot = require('gl-vec3/dot');

var _dot2 = _interopRequireDefault(_dot);

var _VertexList = require('./VertexList');

var _VertexList2 = _interopRequireDefault(_VertexList);

var _Vertex = require('./Vertex');

var _Vertex2 = _interopRequireDefault(_Vertex);

var _Face = require('./Face');

var _Face2 = _interopRequireDefault(_Face);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var debug = (0, _debugFn2.default)('quickhull');

// merge types
// non convex with respect to the large face
var MERGE_NON_CONVEX_WRT_LARGER_FACE = 1;
var MERGE_NON_CONVEX = 2;

var QuickHull = (function () {
  function QuickHull(points) {
    _classCallCheck(this, QuickHull);

    if (!Array.isArray(points)) {
      throw TypeError('input is not a valid array');
    }
    if (points.length < 4) {
      throw Error('cannot build a simplex out of <4 points');
    }

    this.tolerance = -1;

    // buffers
    this.nFaces = 0;
    this.nPoints = points.length;

    this.faces = [];
    this.newFaces = [];
    // helpers
    //
    // let `a`, `b` be `Face` instances
    // let `v` be points wrapped as instance of `Vertex`
    //
    //     [v, v, ..., v, v, v, ...]
    //      ^             ^
    //      |             |
    //  a.outside     b.outside
    //
    this.claimed = new _VertexList2.default();
    this.unclaimed = new _VertexList2.default();

    // vertices of the hull(internal representation of points)
    this.vertices = [];
    for (var i = 0; i < points.length; i += 1) {
      this.vertices.push(new _Vertex2.default(points[i], i));
    }
    this.discardedFaces = [];
    this.vertexPointIndices = [];
  }

  _createClass(QuickHull, [{
    key: 'addVertexToFace',
    value: function addVertexToFace(vertex, face) {
      vertex.face = face;
      if (!face.outside) {
        this.claimed.add(vertex);
      } else {
        this.claimed.insertBefore(face.outside, vertex);
      }
      face.outside = vertex;
    }

    /**
     * Removes `vertex` for the `claimed` list of vertices, it also makes sure
     * that the link from `face` to the first vertex it sees in `claimed` is
     * linked correctly after the removal
     *
     * @param {Vertex} vertex
     * @param {Face} face
     */

  }, {
    key: 'removeVertexFromFace',
    value: function removeVertexFromFace(vertex, face) {
      if (vertex === face.outside) {
        // fix face.outside link
        if (vertex.next && vertex.next.face === face) {
          // face has at least 2 outside vertices, move the `outside` reference
          face.outside = vertex.next;
        } else {
          // vertex was the only outside vertex that face had
          face.outside = null;
        }
      }
      this.claimed.remove(vertex);
    }

    /**
     * Removes all the visible vertices that `face` is able to see which are
     * stored in the `claimed` vertext list
     *
     * @param {Face} face
     * @return {Vertex|undefined} If face had visible vertices returns
     * `face.outside`, otherwise undefined
     */

  }, {
    key: 'removeAllVerticesFromFace',
    value: function removeAllVerticesFromFace(face) {
      if (face.outside) {
        // pointer to the last vertex of this face
        // [..., outside, ..., end, outside, ...]
        //          |           |      |
        //          a           a      b
        var end = face.outside;
        while (end.next && end.next.face === face) {
          end = end.next;
        }
        this.claimed.removeChain(face.outside, end);
        //                            b
        //                       [ outside, ...]
        //                            |  removes this link
        //     [ outside, ..., end ] -┘
        //          |           |
        //          a           a
        end.next = null;
        return face.outside;
      }
    }

    /**
     * Removes all the visible vertices that `face` is able to see, additionally
     * checking the following:
     *
     * If `absorbingFace` doesn't exist then all the removed vertices will be
     * added to the `unclaimed` vertex list
     *
     * If `absorbingFace` exists then this method will assign all the vertices of
     * `face` that can see `absorbingFace`, if a vertex cannot see `absorbingFace`
     * it's added to the `unclaimed` vertex list
     *
     * @param {Face} face
     * @param {Face} [absorbingFace]
     */

  }, {
    key: 'deleteFaceVertices',
    value: function deleteFaceVertices(face, absorbingFace) {
      var faceVertices = this.removeAllVerticesFromFace(face);
      if (faceVertices) {
        if (!absorbingFace) {
          // mark the vertices to be reassigned to some other face
          this.unclaimed.addAll(faceVertices);
        } else {
          // if there's an absorbing face try to assign as many vertices
          // as possible to it

          // the reference `vertex.next` might be destroyed on
          // `this.addVertexToFace` (see VertexList#add), nextVertex is a
          // reference to it
          var nextVertex = undefined;
          for (var vertex = faceVertices; vertex; vertex = nextVertex) {
            nextVertex = vertex.next;
            var distance = absorbingFace.distanceToPlane(vertex.point);

            // check if `vertex` is able to see `absorbingFace`
            if (distance > this.tolerance) {
              this.addVertexToFace(vertex, absorbingFace);
            } else {
              this.unclaimed.add(vertex);
            }
          }
        }
      }
    }

    /**
     * Reassigns as many vertices as possible from the unclaimed list to the new
     * faces
     *
     * @param {Faces[]} newFaces
     */

  }, {
    key: 'resolveUnclaimedPoints',
    value: function resolveUnclaimedPoints(newFaces) {
      // cache next vertex so that if `vertex.next` is destroyed it's still
      // recoverable
      var vertexNext = this.unclaimed.first();
      for (var vertex = vertexNext; vertex; vertex = vertexNext) {
        vertexNext = vertex.next;
        var maxDistance = this.tolerance;
        var maxFace = undefined;
        for (var i = 0; i < newFaces.length; i += 1) {
          var face = newFaces[i];
          if (face.mark === _Face.VISIBLE) {
            var dist = face.distanceToPlane(vertex.point);
            if (dist > maxDistance) {
              maxDistance = dist;
              maxFace = face;
            }
            if (maxDistance > 1000 * this.tolerance) {
              break;
            }
          }
        }

        if (maxFace) {
          this.addVertexToFace(vertex, maxFace);
        }
      }
    }

    /**
     * Computes the extremes of a tetrahedron which will be the initial hull
     *
     * @return {number[]} The min/max vertices in the x,y,z directions
     */

  }, {
    key: 'computeExtremes',
    value: function computeExtremes() {
      var me = this;
      var min = [];
      var max = [];

      // min vertex on the x,y,z directions
      var minVertices = [];
      // max vertex on the x,y,z directions
      var maxVertices = [];

      var i = undefined,
          j = undefined;

      // initially assume that the first vertex is the min/max
      for (i = 0; i < 3; i += 1) {
        minVertices[i] = maxVertices[i] = this.vertices[0];
      }
      // copy the coordinates of the first vertex to min/max
      for (i = 0; i < 3; i += 1) {
        min[i] = max[i] = this.vertices[0].point[i];
      }

      // compute the min/max vertex on all 6 directions
      for (i = 1; i < this.vertices.length; i += 1) {
        var vertex = this.vertices[i];
        var point = vertex.point;
        // update the min coordinates
        for (j = 0; j < 3; j += 1) {
          if (point[j] < min[j]) {
            min[j] = point[j];
            minVertices[j] = vertex;
          }
        }
        // update the max coordinates
        for (j = 0; j < 3; j += 1) {
          if (point[j] > max[j]) {
            max[j] = point[j];
            maxVertices[j] = vertex;
          }
        }
      }

      // compute epsilon
      this.tolerance = 3 * Number.EPSILON * (Math.max(Math.abs(min[0]), Math.abs(max[0])) + Math.max(Math.abs(min[1]), Math.abs(max[1])) + Math.max(Math.abs(min[2]), Math.abs(max[2])));
      debug(function () {
        this.log('tolerance %d', me.tolerance);
      });
      return [minVertices, maxVertices];
    }

    /**
     * Compues the initial tetrahedron assigning to its faces all the points that
     * are candidates to form part of the hull
     */

  }, {
    key: 'createInitialSimplex',
    value: function createInitialSimplex() {
      var vertices = this.vertices;

      var _computeExtremes = this.computeExtremes();

      var _computeExtremes2 = _slicedToArray(_computeExtremes, 2);

      var min = _computeExtremes2[0];
      var max = _computeExtremes2[1];

      var v0 = undefined,
          v1 = undefined,
          v2 = undefined,
          v3 = undefined;
      var i = undefined,
          j = undefined;

      // Find the two vertices with the greatest 1d separation
      // (max.x - min.x)
      // (max.y - min.y)
      // (max.z - min.z)
      var maxDistance = 0;
      var indexMax = 0;
      for (i = 0; i < 3; i += 1) {
        var distance = max[i].point[i] - min[i].point[i];
        if (distance > maxDistance) {
          maxDistance = distance;
          indexMax = i;
        }
      }
      v0 = min[indexMax];
      v1 = max[indexMax];

      // the next vertex is the one farthest to the line formed by `v0` and `v1`
      maxDistance = 0;
      for (i = 0; i < this.vertices.length; i += 1) {
        var vertex = this.vertices[i];
        if (vertex !== v0 && vertex !== v1) {
          var distance = (0, _pointLineDistance2.default)(vertex.point, v0.point, v1.point);
          if (distance > maxDistance) {
            maxDistance = distance;
            v2 = vertex;
          }
        }
      }

      // the next vertes is the one farthest to the plane `v0`, `v1`, `v2`
      // normalize((v2 - v1) x (v0 - v1))
      var normal = (0, _getPlaneNormal2.default)([], v0.point, v1.point, v2.point);
      // distance from the origin to the plane
      var distPO = (0, _dot2.default)(v0.point, normal);
      maxDistance = 0;
      for (i = 0; i < this.vertices.length; i += 1) {
        var vertex = this.vertices[i];
        if (vertex !== v0 && vertex !== v1 && vertex !== v2) {
          var distance = Math.abs((0, _dot2.default)(normal, vertex.point) - distPO);
          if (distance > maxDistance) {
            maxDistance = distance;
            v3 = vertex;
          }
        }
      }

      // initial simplex
      // Taken from http://everything2.com/title/How+to+paint+a+tetrahedron
      //
      //                              v2
      //                             ,|,
      //                           ,7``\'VA,
      //                         ,7`   |, `'VA,
      //                       ,7`     `\    `'VA,
      //                     ,7`        |,      `'VA,
      //                   ,7`          `\         `'VA,
      //                 ,7`             |,           `'VA,
      //               ,7`               `\       ,..ooOOTK` v3
      //             ,7`                  |,.ooOOT''`    AV
      //           ,7`            ,..ooOOT`\`           /7
      //         ,7`      ,..ooOOT''`      |,          AV
      //        ,T,..ooOOT''`              `\         /7
      //     v0 `'TTs.,                     |,       AV
      //            `'TTs.,                 `\      /7
      //                 `'TTs.,             |,    AV
      //                      `'TTs.,        `\   /7
      //                           `'TTs.,    |, AV
      //                                `'TTs.,\/7
      //                                     `'T`
      //                                       v1
      //
      var faces = [];
      if ((0, _dot2.default)(v3.point, normal) - distPO < 0) {
        // the face is not able to see the point so `planeNormal`
        // is pointing outside the tetrahedron
        faces.push(_Face2.default.createTriangle(v0, v1, v2), _Face2.default.createTriangle(v3, v1, v0), _Face2.default.createTriangle(v3, v2, v1), _Face2.default.createTriangle(v3, v0, v2));

        // set the opposite edge
        for (i = 0; i < 3; i += 1) {
          var _j = (i + 1) % 3;
          // join face[i] i > 0, with the first face
          faces[i + 1].getEdge(2).setOpposite(faces[0].getEdge(_j));
          // join face[i] with face[i + 1], 1 <= i <= 3
          faces[i + 1].getEdge(1).setOpposite(faces[_j + 1].getEdge(0));
        }
      } else {
        // the face is able to see the point so `planeNormal`
        // is pointing inside the tetrahedron
        faces.push(_Face2.default.createTriangle(v0, v2, v1), _Face2.default.createTriangle(v3, v0, v1), _Face2.default.createTriangle(v3, v1, v2), _Face2.default.createTriangle(v3, v2, v0));

        // set the opposite edge
        for (i = 0; i < 3; i += 1) {
          var _j2 = (i + 1) % 3;
          // join face[i] i > 0, with the first face
          faces[i + 1].getEdge(2).setOpposite(faces[0].getEdge((3 - i) % 3));
          // join face[i] with face[i + 1]
          faces[i + 1].getEdge(0).setOpposite(faces[_j2 + 1].getEdge(1));
        }
      }

      // the initial hull is the tetrahedron
      for (i = 0; i < 4; i += 1) {
        this.faces.push(faces[i]);
      }

      // initial assignment of vertices to the faces of the tetrahedron
      for (i = 0; i < vertices.length; i += 1) {
        var vertex = vertices[i];
        if (vertex !== v0 && vertex !== v1 && vertex !== v3 && vertex !== v3) {
          maxDistance = this.tolerance;
          var maxFace = undefined;
          for (j = 0; j < 4; j += 1) {
            var distance = faces[j].distanceToPlane(vertex.point);
            if (distance > maxDistance) {
              maxDistance = distance;
              maxFace = faces[j];
            }
          }

          if (maxFace) {
            this.addVertexToFace(vertex, maxFace);
          }
        }
      }
    }
  }, {
    key: 'reindexFaceAndVertices',
    value: function reindexFaceAndVertices() {
      // remove inactive faces
      var activeFaces = [];
      for (var i = 0; i < this.faces.length; i += 1) {
        var face = this.faces[i];
        if (face.mark === _Face.VISIBLE) {
          activeFaces.push(face);
        }
      }
      this.faces = activeFaces;
    }
  }, {
    key: 'collectFaces',
    value: function collectFaces(skipTriangulation) {
      var faceIndices = [];
      for (var i = 0; i < this.faces.length; i += 1) {
        if (this.faces[i].mark !== _Face.VISIBLE) {
          throw Error('attempt to include a destroyed face in the hull');
        }
        var indices = this.faces[i].collectIndices();
        if (skipTriangulation) {
          faceIndices.push(indices);
        } else {
          for (var j = 0; j < indices.length - 2; j += 1) {
            faceIndices.push([indices[0], indices[j + 1], indices[j + 2]]);
          }
        }
      }
      return faceIndices;
    }

    /**
     * Finds the next vertex to make faces with the current hull
     *
     * - let `face` be the first face existing in the `claimed` vertex list
     *  - if `face` doesn't exist then return since there're no vertices left
     *  - otherwise for each `vertex` that face sees find the one furthest away
     *  from `face`
     *
     * @return {Vertex|undefined} Returns undefined when there're no more
     * visible vertices
     */

  }, {
    key: 'nextVertexToAdd',
    value: function nextVertexToAdd() {
      if (!this.claimed.isEmpty()) {
        var eyeVertex = undefined,
            vertex = undefined;
        var maxDistance = 0;
        var eyeFace = this.claimed.first().face;
        for (vertex = eyeFace.outside; vertex && vertex.face === eyeFace; vertex = vertex.next) {
          var distance = eyeFace.distanceToPlane(vertex.point);
          if (distance > maxDistance) {
            maxDistance = distance;
            eyeVertex = vertex;
          }
        }
        return eyeVertex;
      }
    }

    /**
     * Computes a chain of half edges in ccw order called the `horizon`, for an
     * edge to be part of the horizon it must join a face that can see
     * `eyePoint` and a face that cannot see `eyePoint`
     *
     * @param {number[]} eyePoint - The coordinates of a point
     * @param {HalfEdge} crossEdge - The edge used to jump to the current `face`
     * @param {Face} face - The current face being tested
     * @param {HalfEdge[]} horizon - The edges that form part of the horizon in
     * ccw order
     */

  }, {
    key: 'computeHorizon',
    value: function computeHorizon(eyePoint, crossEdge, face, horizon) {
      // moves face's vertices to the `unclaimed` vertex list
      this.deleteFaceVertices(face);

      face.mark = _Face.DELETED;

      var edge = undefined;
      if (!crossEdge) {
        edge = crossEdge = face.getEdge(0);
      } else {
        // start from the next edge since `crossEdge` was already analyzed
        // (actually `crossEdge.opposite` was the face who called this method
        // recursively)
        edge = crossEdge.next;
      }

      // All the faces that are able to see `eyeVertex` are defined as follows
      //
      //       v    /
      //           / <== visible face
      //          /
      //         |
      //         | <== not visible face
      //
      //  dot(v, visible face normal) - visible face offset > this.tolerance
      //
      do {
        var oppositeEdge = edge.opposite;
        var oppositeFace = oppositeEdge.face;
        if (oppositeFace.mark === _Face.VISIBLE) {
          if (oppositeFace.distanceToPlane(eyePoint) > this.tolerance) {
            this.computeHorizon(eyePoint, oppositeEdge, oppositeFace, horizon);
          } else {
            horizon.push(edge);
          }
        }
        edge = edge.next;
      } while (edge !== crossEdge);
    }

    /**
     * Creates a face with the points `eyeVertex.point`, `horizonEdge.tail` and
     * `horizonEdge.tail` in ccw order
     *
     * @param {Vertex} eyeVertex
     * @param {HalfEdge} horizonEdge
     * @return {HalfEdge} The half edge whose vertex is the eyeVertex
     */

  }, {
    key: 'addAdjoiningFace',
    value: function addAdjoiningFace(eyeVertex, horizonEdge) {
      // all the half edges are created in ccw order thus the face is always
      // pointing outside the hull
      // edges:
      //
      //                  eyeVertex.point
      //                       / \
      //                      /   \
      //                  1  /     \  0
      //                    /       \
      //                   /         \
      //                  /           \
      //          horizon.tail --- horizon.head
      //                        2
      //
      var face = _Face2.default.createTriangle(eyeVertex, horizonEdge.tail(), horizonEdge.head());
      this.faces.push(face);
      // join face.getEdge(-1) with the horizon's opposite edge
      // face.getEdge(-1) = face.getEdge(2)
      face.getEdge(-1).setOpposite(horizonEdge.opposite);
      return face.getEdge(0);
    }

    /**
     * Adds horizon.length faces to the hull, each face will be 'linked' with the
     * horizon opposite face and the face on the left/right
     *
     * @param {Vertex} eyeVertex
     * @param {HalfEdge[]} horizon - A chain of half edges in ccw order
     */

  }, {
    key: 'addNewFaces',
    value: function addNewFaces(eyeVertex, horizon) {
      this.newFaces = [];
      var firstSideEdge = undefined,
          previousSideEdge = undefined;
      for (var i = 0; i < horizon.length; i += 1) {
        var horizonEdge = horizon[i];
        // returns the right side edge
        var sideEdge = this.addAdjoiningFace(eyeVertex, horizonEdge);
        if (!firstSideEdge) {
          firstSideEdge = sideEdge;
        } else {
          // joins face.getEdge(1) with previousFace.getEdge(0)
          sideEdge.next.setOpposite(previousSideEdge);
        }
        this.newFaces.push(sideEdge.face);
        previousSideEdge = sideEdge;
      }
      firstSideEdge.next.setOpposite(previousSideEdge);
    }
  }, {
    key: 'getTriangulatedFaces',
    value: function getTriangulatedFaces() {
      var faces = [];
      for (var i = 0; i < this.faces.length; i += 1) {
        faces = faces.concat(this.faces[i].triangulate());
      }
      return faces;
    }

    /**
     * Computes the distance from `edge` opposite face's centroid to
     * `edge.face`
     *
     * @param {HalfEdge} edge
     * @return {number}
     * - A positive number when the centroid of the opposite face is above the
     *   face i.e. when the faces are concave
     * - A negative number when the centroid of the opposite face is below the
     *   face i.e. when the faces are convex
     */

  }, {
    key: 'oppositeFaceDistance',
    value: function oppositeFaceDistance(edge) {
      return edge.face.distanceToPlane(edge.opposite.face.centroid);
    }

    /**
     * Merges a face with none/any/all its neighbors according to the strategy
     * used
     *
     * if `mergeType` is MERGE_NON_CONVEX_WRT_LARGER_FACE then the merge will be
     * decided based on the face with the larger area, the centroid of the face
     * with the smaller area will be checked against the one with the larger area
     * to see if it's in the merge range [tolerance, -tolerance] i.e.
     *
     *    dot(centroid smaller face, larger face normal) - larger face offset > -tolerance
     *
     * Note that the first check (with +tolerance) was done on `computeHorizon`
     *
     * If the above is not true then the check is done with respect to the smaller
     * face i.e.
     *
     *    dot(centroid larger face, smaller face normal) - smaller face offset > -tolerance
     *
     * If true then it means that two faces are non convex (concave), even if the
     * dot(...) - offset value is > 0 (that's the point of doing the merge in the
     * first place)
     *
     * If two faces are concave then the check must also be done on the other face
     * but this is done in another merge pass, for this to happen the face is
     * marked in a temporal NON_CONVEX state
     *
     * if `mergeType` is MERGE_NON_CONVEX then two faces will be merged only if
     * they pass the following conditions
     *
     *    dot(centroid smaller face, larger face normal) - larger face offset > -tolerance
     *    dot(centroid larger face, smaller face normal) - smaller face offset > -tolerance
     *
     * @param {Face} face
     * @param {number} mergeType - Either MERGE_NON_CONVEX_WRT_LARGER_FACE or
     * MERGE_NON_CONVEX
     */

  }, {
    key: 'doAdjacentMerge',
    value: function doAdjacentMerge(face, mergeType) {
      var edge = face.edge;
      var convex = true;
      var it = 0;
      do {
        if (it >= face.nVertices) {
          throw Error('merge recursion limit exceeded');
        }
        var oppositeFace = edge.opposite.face;
        var merge = false;

        // Important notes about the algorithm to merge faces
        //
        // - Given a vertex `eyeVertex` that will be added to the hull
        //   all the faces that cannot see `eyeVertex` are defined as follows
        //
        //      dot(v, not visible face normal) - not visible offset < tolerance
        //
        // - Two faces can be merged when the centroid of one of these faces
        // projected to the normal of the other face minus the other face offset
        // is in the range [tolerance, -tolerance]
        // - Since `face` (given in the input for this method) has passed the
        // check above we only have to check the lower bound e.g.
        //
        //      dot(v, not visible face normal) - not visible offset > -tolerance
        //
        if (mergeType === MERGE_NON_CONVEX) {
          if (this.oppositeFaceDistance(edge) > -this.tolerance || this.oppositeFaceDistance(edge.opposite) > -this.tolerance) {
            merge = true;
          }
        } else {
          if (face.area > oppositeFace.area) {
            if (this.oppositeFaceDistance(edge) > -this.tolerance) {
              merge = true;
            } else if (this.oppositeFaceDistance(edge.opposite) > -this.tolerance) {
              convex = false;
            }
          } else {
            if (this.oppositeFaceDistance(edge.opposite) > -this.tolerance) {
              merge = true;
            } else if (this.oppositeFaceDistance(edge) > -this.tolerance) {
              convex = false;
            }
          }

          if (merge) {
            debug.logger('face merge');
            // when two faces are merged it might be possible that redundant faces
            // are destroyed, in that case move all the visible vertices from the
            // destroyed faces to the `unclaimed` vertex list
            var discardedFaces = face.mergeAdjacentFaces(edge, []);
            for (var i = 0; i < discardedFaces.length; i += 1) {
              this.deleteFaceVertices(discardedFaces[i], face);
            }
            return true;
          }
        }
        edge = edge.next;
        it += 1;
      } while (edge !== face.edge);
      if (!convex) {
        face.mark = _Face.NON_CONVEX;
      }
      return false;
    }

    /**
     * Adds a vertex to the hull with the following algorithm
     *
     * - Compute the `horizon` which is a chain of half edges, for an edge to
     *   belong to this group it must be the edge connecting a face that can
     *   see `eyeVertex` and a face which cannot see `eyeVertex`
     * - All the faces that can see `eyeVertex` have its visible vertices removed
     *   from the claimed VertexList
     * - A new set of faces is created with each edge of the `horizon` and
     *   `eyeVertex`, each face is connected with the opposite horizon face and
     *   the face on the left/right
     * - The new faces are merged if possible with the opposite horizon face first
     *   and then the faces on the right/left
     * - The vertices removed from all the visible faces are assigned to the new
     *   faces if possible
     *
     * @param {Vertex} eyeVertex
     */

  }, {
    key: 'addVertexToHull',
    value: function addVertexToHull(eyeVertex) {
      var horizon = [];

      this.unclaimed.clear();

      // remove `eyeVertex` from `eyeVertex.face` so that it can't be added to the
      // `unclaimed` vertex list
      this.removeVertexFromFace(eyeVertex, eyeVertex.face);
      this.computeHorizon(eyeVertex.point, null, eyeVertex.face, horizon);
      debug(function () {
        this.log('horizon %j', horizon.map(function (edge) {
          return edge.head().index;
        }));
      });
      this.addNewFaces(eyeVertex, horizon);

      debug.logger('first merge');

      // first merge pass
      // Do the merge with respect to the larger face
      for (var i = 0; i < this.newFaces.length; i += 1) {
        var face = this.newFaces[i];
        if (face.mark === _Face.VISIBLE) {
          while (this.doAdjacentMerge(face, MERGE_NON_CONVEX_WRT_LARGER_FACE)) {}
        }
      }

      debug.logger('second merge');

      // second merge pass
      // Do the merge on non convex faces (a face is marked as non convex in the
      // first pass)
      for (var i = 0; i < this.newFaces.length; i += 1) {
        var face = this.newFaces[i];
        if (face.mark === _Face.NON_CONVEX) {
          face.mark = _Face.VISIBLE;
          while (this.doAdjacentMerge(face, MERGE_NON_CONVEX)) {}
        }
      }

      debug.logger('reassigning points to newFaces');
      // reassign `unclaimed` vertices to the new faces
      this.resolveUnclaimedPoints(this.newFaces);
    }
  }, {
    key: 'build',
    value: function build() {
      var iterations = 0;
      var eyeVertex = undefined;
      this.createInitialSimplex();
      while (eyeVertex = this.nextVertexToAdd()) {
        iterations += 1;
        debug.logger('== iteration %j ==', iterations);
        debug.logger('next vertex to add = %d %j', eyeVertex.index, eyeVertex.point);
        this.addVertexToHull(eyeVertex);
        debug.logger('end');
      }
      this.reindexFaceAndVertices();
    }
  }]);

  return QuickHull;
})();

exports.default = QuickHull;
module.exports = exports['default'];
},{"./Face":3,"./Vertex":6,"./VertexList":7,"debug-fn":8,"get-plane-normal":12,"gl-vec3/dot":17,"point-line-distance":25}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Vertex = function Vertex(point, index) {
  _classCallCheck(this, Vertex);

  this.point = point;
  // index in the input array
  this.index = index;
  // vertex is a double linked list node
  this.next = null;
  this.prev = null;
  // the face that is able to see this point
  this.face = null;
};

exports.default = Vertex;
module.exports = exports['default'];
},{}],7:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var VertexList = (function () {
  function VertexList() {
    _classCallCheck(this, VertexList);

    this.head = null;
    this.tail = null;
  }

  _createClass(VertexList, [{
    key: "clear",
    value: function clear() {
      this.head = this.tail = null;
    }

    /**
     * Inserts a `node` before `target`, it's assumed that
     * `target` belongs to this doubly linked list
     *
     * @param {*} target
     * @param {*} node
     */

  }, {
    key: "insertBefore",
    value: function insertBefore(target, node) {
      node.prev = target.prev;
      node.next = target;
      if (!node.prev) {
        this.head = node;
      } else {
        node.prev.next = node;
      }
      target.prev = node;
    }

    /**
     * Inserts a `node` after `target`, it's assumed that
     * `target` belongs to this doubly linked list
     *
     * @param {Vertex} target
     * @param {Vertex} node
     */

  }, {
    key: "insertAfter",
    value: function insertAfter(target, node) {
      node.prev = target;
      node.next = target.next;
      if (!node.next) {
        this.tail = node;
      } else {
        node.next.prev = node;
      }
      target.next = node;
    }

    /**
     * Appends a `node` to the end of this doubly linked list
     * Note: `node.next` will be unlinked from `node`
     * Note: if `node` is part of another linked list call `addAll` instead
     *
     * @param {*} node
     */

  }, {
    key: "add",
    value: function add(node) {
      if (!this.head) {
        this.head = node;
      } else {
        this.tail.next = node;
      }
      node.prev = this.tail;
      // since node is the new end it doesn't have a next node
      node.next = null;
      this.tail = node;
    }

    /**
     * Appends a chain of nodes where `node` is the head,
     * the difference with `add` is that it correctly sets the position
     * of the node list `tail` property
     *
     * @param {*} node
     */

  }, {
    key: "addAll",
    value: function addAll(node) {
      if (!this.head) {
        this.head = node;
      } else {
        this.tail.next = node;
      }
      node.prev = this.tail;

      // find the end of the list
      while (node.next) {
        node = node.next;
      }
      this.tail = node;
    }

    /**
     * Deletes a `node` from this linked list, it's assumed that `node` is a
     * member of this linked list
     *
     * @param {*} node
     */

  }, {
    key: "remove",
    value: function remove(node) {
      if (!node.prev) {
        this.head = node.next;
      } else {
        node.prev.next = node.next;
      }

      if (!node.next) {
        this.tail = node.prev;
      } else {
        node.next.prev = node.prev;
      }
    }

    /**
     * Removes a chain of nodes whose head is `a` and whose tail is `b`,
     * it's assumed that `a` and `b` belong to this list and also that `a`
     * comes before `b` in the linked list
     *
     * @param {*} a
     * @param {*} b
     */

  }, {
    key: "removeChain",
    value: function removeChain(a, b) {
      if (!a.prev) {
        this.head = b.next;
      } else {
        a.prev.next = b.next;
      }

      if (!b.next) {
        this.tail = a.prev;
      } else {
        b.next.prev = a.prev;
      }
    }
  }, {
    key: "first",
    value: function first() {
      return this.head;
    }
  }, {
    key: "isEmpty",
    value: function isEmpty() {
      return !this.head;
    }
  }]);

  return VertexList;
})();

exports.default = VertexList;
module.exports = exports['default'];
},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (ns) {
  var logger = (0, _debug2.default)(ns);
  var scope = { log: logger };
  function internal(fn) {
    if (_debug2.default.enabled(ns)) {
      fn.call(scope, logger);
    }
  }
  internal.logger = logger;
  return internal;
};

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports['default'];
},{"debug":10}],9:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000
var m = s * 60
var h = m * 60
var d = h * 24
var y = d * 365.25

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function (val, options) {
  options = options || {}
  var type = typeof val
  if (type === 'string' && val.length > 0) {
    return parse(val)
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ?
      fmtLong(val) :
      fmtShort(val)
  }
  throw new Error('val is not a non-empty string or a valid number. val=' + JSON.stringify(val))
}

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str)
  if (str.length > 10000) {
    return
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str)
  if (!match) {
    return
  }
  var n = parseFloat(match[1])
  var type = (match[2] || 'ms').toLowerCase()
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y
    case 'days':
    case 'day':
    case 'd':
      return n * d
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n
    default:
      return undefined
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd'
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h'
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm'
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's'
  }
  return ms + 'ms'
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms'
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name
  }
  return Math.ceil(ms / n) + ' ' + name + 's'
}

},{}],10:[function(require,module,exports){
(function (process){
/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window && typeof window.process !== 'undefined' && window.process.type === 'renderer') {
    return true;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document && 'WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window && window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit')

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  try {
    return exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (typeof process !== 'undefined' && 'env' in process) {
    return process.env.DEBUG;
  }
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}

}).call(this,require('_process'))

},{"./debug":11,"_process":1}],11:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  return debug;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":9}],12:[function(require,module,exports){
var normalize = require('gl-vec3/normalize')
var sub = require('gl-vec3/subtract')
var cross = require('gl-vec3/cross')
var tmp = [0, 0, 0]

module.exports = planeNormal

function planeNormal (out, point1, point2, point3) {
  sub(out, point1, point2)
  sub(tmp, point2, point3)
  cross(out, out, tmp)
  return normalize(out, out)
}
},{"gl-vec3/cross":15,"gl-vec3/normalize":19,"gl-vec3/subtract":24}],13:[function(require,module,exports){
module.exports = add;

/**
 * Adds two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function add(out, a, b) {
    out[0] = a[0] + b[0]
    out[1] = a[1] + b[1]
    out[2] = a[2] + b[2]
    return out
}
},{}],14:[function(require,module,exports){
module.exports = copy;

/**
 * Copy the values from one vec3 to another
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the source vector
 * @returns {vec3} out
 */
function copy(out, a) {
    out[0] = a[0]
    out[1] = a[1]
    out[2] = a[2]
    return out
}
},{}],15:[function(require,module,exports){
module.exports = cross;

/**
 * Computes the cross product of two vec3's
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function cross(out, a, b) {
    var ax = a[0], ay = a[1], az = a[2],
        bx = b[0], by = b[1], bz = b[2]

    out[0] = ay * bz - az * by
    out[1] = az * bx - ax * bz
    out[2] = ax * by - ay * bx
    return out
}
},{}],16:[function(require,module,exports){
module.exports = distance;

/**
 * Calculates the euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} distance between a and b
 */
function distance(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2]
    return Math.sqrt(x*x + y*y + z*z)
}
},{}],17:[function(require,module,exports){
module.exports = dot;

/**
 * Calculates the dot product of two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} dot product of a and b
 */
function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}
},{}],18:[function(require,module,exports){
module.exports = length;

/**
 * Calculates the length of a vec3
 *
 * @param {vec3} a vector to calculate length of
 * @returns {Number} length of a
 */
function length(a) {
    var x = a[0],
        y = a[1],
        z = a[2]
    return Math.sqrt(x*x + y*y + z*z)
}
},{}],19:[function(require,module,exports){
module.exports = normalize;

/**
 * Normalize a vec3
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a vector to normalize
 * @returns {vec3} out
 */
function normalize(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2]
    var len = x*x + y*y + z*z
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len)
        out[0] = a[0] * len
        out[1] = a[1] * len
        out[2] = a[2] * len
    }
    return out
}
},{}],20:[function(require,module,exports){
module.exports = scale;

/**
 * Scales a vec3 by a scalar number
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec3} out
 */
function scale(out, a, b) {
    out[0] = a[0] * b
    out[1] = a[1] * b
    out[2] = a[2] * b
    return out
}
},{}],21:[function(require,module,exports){
module.exports = scaleAndAdd;

/**
 * Adds two vec3's after scaling the second operand by a scalar value
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec3} out
 */
function scaleAndAdd(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale)
    out[1] = a[1] + (b[1] * scale)
    out[2] = a[2] + (b[2] * scale)
    return out
}
},{}],22:[function(require,module,exports){
module.exports = squaredDistance;

/**
 * Calculates the squared euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} squared distance between a and b
 */
function squaredDistance(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1],
        z = b[2] - a[2]
    return x*x + y*y + z*z
}
},{}],23:[function(require,module,exports){
module.exports = squaredLength;

/**
 * Calculates the squared length of a vec3
 *
 * @param {vec3} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
function squaredLength(a) {
    var x = a[0],
        y = a[1],
        z = a[2]
    return x*x + y*y + z*z
}
},{}],24:[function(require,module,exports){
module.exports = subtract;

/**
 * Subtracts vector b from vector a
 *
 * @param {vec3} out the receiving vector
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {vec3} out
 */
function subtract(out, a, b) {
    out[0] = a[0] - b[0]
    out[1] = a[1] - b[1]
    out[2] = a[2] - b[2]
    return out
}
},{}],25:[function(require,module,exports){
/*
 * point-line-distance
 *
 * Copyright (c) 2015 Mauricio Poppe
 * Licensed under the MIT license.
 */

'use strict'

var distanceSquared = require('./squared')

module.exports = function (point, a, b) {
  return Math.sqrt(distanceSquared(point, a, b))
}

},{"./squared":26}],26:[function(require,module,exports){
var subtract = require('gl-vec3/subtract')
var cross = require('gl-vec3/cross')
var squaredLength = require('gl-vec3/squaredLength')
var ab = []
var ap = []
var cr = []

module.exports = function (p, a, b) {
  // // == vector solution
  // var normalize = require('gl-vec3/normalize')
  // var scaleAndAdd = require('gl-vec3/scaleAndAdd')
  // var dot = require('gl-vec3/dot')
  // var squaredDistance = require('gl-vec3/squaredDistance')
  // // n = vector `ab` normalized
  // var n = []
  // // projection = projection of `point` on `n`
  // var projection = []
  // normalize(n, subtract(n, a, b))
  // scaleAndAdd(projection, a, n, dot(n, p))
  // return squaredDistance(projection, p)

  // == parallelogram solution
  //
  //            s
  //      __a________b__
  //       /   |    /
  //      /   h|   /
  //     /_____|__/
  //    p
  //
  //  s = b - a
  //  area = s * h
  //  |ap x s| = s * h
  //  h = |ap x s| / s
  //
  subtract(ab, b, a)
  subtract(ap, p, a)
  var area = squaredLength(cross(cr, ap, ab))
  var s = squaredLength(ab)
  if (s === 0) {
    throw Error('a and b are the same point')
  }
  return area / s
}

},{"gl-vec3/cross":15,"gl-vec3/squaredLength":23,"gl-vec3/subtract":24}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL1VzZXJzL09tYXIvQXBwRGF0YS9Sb2FtaW5nL25wbS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiLi4vLi4vLi4vVXNlcnMvT21hci9BcHBEYXRhL1JvYW1pbmcvbnBtL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJtYWluLmpzIiwibm9kZV9tb2R1bGVzL3F1aWNraHVsbDNkL2Rpc3QvRmFjZS5qcyIsIm5vZGVfbW9kdWxlcy9xdWlja2h1bGwzZC9kaXN0L0hhbGZFZGdlLmpzIiwibm9kZV9tb2R1bGVzL3F1aWNraHVsbDNkL2Rpc3QvUXVpY2tIdWxsLmpzIiwibm9kZV9tb2R1bGVzL3F1aWNraHVsbDNkL2Rpc3QvVmVydGV4LmpzIiwibm9kZV9tb2R1bGVzL3F1aWNraHVsbDNkL2Rpc3QvVmVydGV4TGlzdC5qcyIsIm5vZGVfbW9kdWxlcy9xdWlja2h1bGwzZC9ub2RlX21vZHVsZXMvZGVidWctZm4vZGlzdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9xdWlja2h1bGwzZC9ub2RlX21vZHVsZXMvZGVidWctZm4vbm9kZV9tb2R1bGVzL2RlYnVnL25vZGVfbW9kdWxlcy9tcy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9xdWlja2h1bGwzZC9ub2RlX21vZHVsZXMvZGVidWctZm4vbm9kZV9tb2R1bGVzL2RlYnVnL3NyYy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3F1aWNraHVsbDNkL25vZGVfbW9kdWxlcy9kZWJ1Zy1mbi9ub2RlX21vZHVsZXMvZGVidWcvc3JjL2RlYnVnLmpzIiwibm9kZV9tb2R1bGVzL3F1aWNraHVsbDNkL25vZGVfbW9kdWxlcy9nZXQtcGxhbmUtbm9ybWFsL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3F1aWNraHVsbDNkL25vZGVfbW9kdWxlcy9nbC12ZWMzL2FkZC5qcyIsIm5vZGVfbW9kdWxlcy9xdWlja2h1bGwzZC9ub2RlX21vZHVsZXMvZ2wtdmVjMy9jb3B5LmpzIiwibm9kZV9tb2R1bGVzL3F1aWNraHVsbDNkL25vZGVfbW9kdWxlcy9nbC12ZWMzL2Nyb3NzLmpzIiwibm9kZV9tb2R1bGVzL3F1aWNraHVsbDNkL25vZGVfbW9kdWxlcy9nbC12ZWMzL2Rpc3RhbmNlLmpzIiwibm9kZV9tb2R1bGVzL3F1aWNraHVsbDNkL25vZGVfbW9kdWxlcy9nbC12ZWMzL2RvdC5qcyIsIm5vZGVfbW9kdWxlcy9xdWlja2h1bGwzZC9ub2RlX21vZHVsZXMvZ2wtdmVjMy9sZW5ndGguanMiLCJub2RlX21vZHVsZXMvcXVpY2todWxsM2Qvbm9kZV9tb2R1bGVzL2dsLXZlYzMvbm9ybWFsaXplLmpzIiwibm9kZV9tb2R1bGVzL3F1aWNraHVsbDNkL25vZGVfbW9kdWxlcy9nbC12ZWMzL3NjYWxlLmpzIiwibm9kZV9tb2R1bGVzL3F1aWNraHVsbDNkL25vZGVfbW9kdWxlcy9nbC12ZWMzL3NjYWxlQW5kQWRkLmpzIiwibm9kZV9tb2R1bGVzL3F1aWNraHVsbDNkL25vZGVfbW9kdWxlcy9nbC12ZWMzL3NxdWFyZWREaXN0YW5jZS5qcyIsIm5vZGVfbW9kdWxlcy9xdWlja2h1bGwzZC9ub2RlX21vZHVsZXMvZ2wtdmVjMy9zcXVhcmVkTGVuZ3RoLmpzIiwibm9kZV9tb2R1bGVzL3F1aWNraHVsbDNkL25vZGVfbW9kdWxlcy9nbC12ZWMzL3N1YnRyYWN0LmpzIiwibm9kZV9tb2R1bGVzL3F1aWNraHVsbDNkL25vZGVfbW9kdWxlcy9wb2ludC1saW5lLWRpc3RhbmNlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3F1aWNraHVsbDNkL25vZGVfbW9kdWxlcy9wb2ludC1saW5lLWRpc3RhbmNlL3NxdWFyZWQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTEE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2wxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNySkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsInZhciBRdWlja0h1bGwgPSByZXF1aXJlKCdxdWlja2h1bGwzZC9kaXN0L1F1aWNrSHVsbCcpXHJcblxyXG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMuREVMRVRFRCA9IGV4cG9ydHMuTk9OX0NPTlZFWCA9IGV4cG9ydHMuVklTSUJMRSA9IHVuZGVmaW5lZDtcblxudmFyIF9kZWJ1Z0ZuID0gcmVxdWlyZSgnZGVidWctZm4nKTtcblxudmFyIF9kZWJ1Z0ZuMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2RlYnVnRm4pO1xuXG52YXIgX2RvdCA9IHJlcXVpcmUoJ2dsLXZlYzMvZG90Jyk7XG5cbnZhciBfZG90MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2RvdCk7XG5cbnZhciBfYWRkID0gcmVxdWlyZSgnZ2wtdmVjMy9hZGQnKTtcblxudmFyIF9hZGQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfYWRkKTtcblxudmFyIF9zdWJ0cmFjdCA9IHJlcXVpcmUoJ2dsLXZlYzMvc3VidHJhY3QnKTtcblxudmFyIF9zdWJ0cmFjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9zdWJ0cmFjdCk7XG5cbnZhciBfY3Jvc3MgPSByZXF1aXJlKCdnbC12ZWMzL2Nyb3NzJyk7XG5cbnZhciBfY3Jvc3MyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY3Jvc3MpO1xuXG52YXIgX2NvcHkgPSByZXF1aXJlKCdnbC12ZWMzL2NvcHknKTtcblxudmFyIF9jb3B5MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NvcHkpO1xuXG52YXIgX2xlbmd0aCA9IHJlcXVpcmUoJ2dsLXZlYzMvbGVuZ3RoJyk7XG5cbnZhciBfbGVuZ3RoMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2xlbmd0aCk7XG5cbnZhciBfc2NhbGUgPSByZXF1aXJlKCdnbC12ZWMzL3NjYWxlJyk7XG5cbnZhciBfc2NhbGUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfc2NhbGUpO1xuXG52YXIgX3NjYWxlQW5kQWRkID0gcmVxdWlyZSgnZ2wtdmVjMy9zY2FsZUFuZEFkZCcpO1xuXG52YXIgX3NjYWxlQW5kQWRkMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3NjYWxlQW5kQWRkKTtcblxudmFyIF9ub3JtYWxpemUgPSByZXF1aXJlKCdnbC12ZWMzL25vcm1hbGl6ZScpO1xuXG52YXIgX25vcm1hbGl6ZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9ub3JtYWxpemUpO1xuXG52YXIgX0hhbGZFZGdlID0gcmVxdWlyZSgnLi9IYWxmRWRnZScpO1xuXG52YXIgX0hhbGZFZGdlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX0hhbGZFZGdlKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sICE9PSBcInVuZGVmaW5lZFwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIGRlYnVnID0gKDAsIF9kZWJ1Z0ZuMi5kZWZhdWx0KSgnZmFjZScpO1xuXG52YXIgVklTSUJMRSA9IGV4cG9ydHMuVklTSUJMRSA9IDA7XG52YXIgTk9OX0NPTlZFWCA9IGV4cG9ydHMuTk9OX0NPTlZFWCA9IDE7XG52YXIgREVMRVRFRCA9IGV4cG9ydHMuREVMRVRFRCA9IDI7XG5cbnZhciBGYWNlID0gKGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gRmFjZSgpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRmFjZSk7XG5cbiAgICB0aGlzLm5vcm1hbCA9IFtdO1xuICAgIHRoaXMuY2VudHJvaWQgPSBbXTtcbiAgICAvLyBzaWduZWQgZGlzdGFuY2UgZnJvbSBmYWNlIHRvIHRoZSBvcmlnaW5cbiAgICB0aGlzLm9mZnNldCA9IDA7XG4gICAgLy8gcG9pbnRlciB0byB0aGUgYSB2ZXJ0ZXggaW4gYSBkb3VibGUgbGlua2VkIGxpc3QgdGhpcyBmYWNlIGNhbiBzZWVcbiAgICB0aGlzLm91dHNpZGUgPSBudWxsO1xuICAgIHRoaXMubWFyayA9IFZJU0lCTEU7XG4gICAgdGhpcy5lZGdlID0gbnVsbDtcbiAgICB0aGlzLm5WZXJ0aWNlcyA9IDA7XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoRmFjZSwgW3tcbiAgICBrZXk6ICdnZXRFZGdlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZ2V0RWRnZShpKSB7XG4gICAgICBpZiAodHlwZW9mIGkgIT09ICdudW1iZXInKSB7XG4gICAgICAgIHRocm93IEVycm9yKCdyZXF1aXJlcyBhIG51bWJlcicpO1xuICAgICAgfVxuICAgICAgdmFyIGl0ID0gdGhpcy5lZGdlO1xuICAgICAgd2hpbGUgKGkgPiAwKSB7XG4gICAgICAgIGl0ID0gaXQubmV4dDtcbiAgICAgICAgaSAtPSAxO1xuICAgICAgfVxuICAgICAgd2hpbGUgKGkgPCAwKSB7XG4gICAgICAgIGl0ID0gaXQucHJldjtcbiAgICAgICAgaSArPSAxO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGl0O1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2NvbXB1dGVOb3JtYWwnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wdXRlTm9ybWFsKCkge1xuICAgICAgdmFyIGUwID0gdGhpcy5lZGdlO1xuICAgICAgdmFyIGUxID0gZTAubmV4dDtcbiAgICAgIHZhciBlMiA9IGUxLm5leHQ7XG4gICAgICB2YXIgdjIgPSAoMCwgX3N1YnRyYWN0Mi5kZWZhdWx0KShbXSwgZTEuaGVhZCgpLnBvaW50LCBlMC5oZWFkKCkucG9pbnQpO1xuICAgICAgdmFyIHQgPSBbXTtcbiAgICAgIHZhciB2MSA9IFtdO1xuXG4gICAgICB0aGlzLm5WZXJ0aWNlcyA9IDI7XG4gICAgICB0aGlzLm5vcm1hbCA9IFswLCAwLCAwXTtcbiAgICAgIHdoaWxlIChlMiAhPT0gZTApIHtcbiAgICAgICAgKDAsIF9jb3B5Mi5kZWZhdWx0KSh2MSwgdjIpO1xuICAgICAgICAoMCwgX3N1YnRyYWN0Mi5kZWZhdWx0KSh2MiwgZTIuaGVhZCgpLnBvaW50LCBlMC5oZWFkKCkucG9pbnQpO1xuICAgICAgICAoMCwgX2FkZDIuZGVmYXVsdCkodGhpcy5ub3JtYWwsIHRoaXMubm9ybWFsLCAoMCwgX2Nyb3NzMi5kZWZhdWx0KSh0LCB2MSwgdjIpKTtcbiAgICAgICAgZTIgPSBlMi5uZXh0O1xuICAgICAgICB0aGlzLm5WZXJ0aWNlcyArPSAxO1xuICAgICAgfVxuICAgICAgdGhpcy5hcmVhID0gKDAsIF9sZW5ndGgyLmRlZmF1bHQpKHRoaXMubm9ybWFsKTtcbiAgICAgIC8vIG5vcm1hbGl6ZSB0aGUgdmVjdG9yLCBzaW5jZSB3ZSd2ZSBhbHJlYWR5IGNhbGN1bGF0ZWQgdGhlIGFyZWFcbiAgICAgIC8vIGl0J3MgY2hlYXBlciB0byBzY2FsZSB0aGUgdmVjdG9yIHVzaW5nIHRoaXMgcXVhbnRpdHkgaW5zdGVhZCBvZlxuICAgICAgLy8gZG9pbmcgdGhlIHNhbWUgb3BlcmF0aW9uIGFnYWluXG4gICAgICB0aGlzLm5vcm1hbCA9ICgwLCBfc2NhbGUyLmRlZmF1bHQpKHRoaXMubm9ybWFsLCB0aGlzLm5vcm1hbCwgMSAvIHRoaXMuYXJlYSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnY29tcHV0ZU5vcm1hbE1pbkFyZWEnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wdXRlTm9ybWFsTWluQXJlYShtaW5BcmVhKSB7XG4gICAgICB0aGlzLmNvbXB1dGVOb3JtYWwoKTtcbiAgICAgIGlmICh0aGlzLmFyZWEgPCBtaW5BcmVhKSB7XG4gICAgICAgIC8vIGNvbXB1dGUgdGhlIG5vcm1hbCB3aXRob3V0IHRoZSBsb25nZXN0IGVkZ2VcbiAgICAgICAgdmFyIG1heEVkZ2UgPSB1bmRlZmluZWQ7XG4gICAgICAgIHZhciBtYXhTcXVhcmVkTGVuZ3RoID0gMDtcbiAgICAgICAgdmFyIGVkZ2UgPSB0aGlzLmVkZ2U7XG5cbiAgICAgICAgLy8gZmluZCB0aGUgbG9uZ2VzdCBlZGdlIChpbiBsZW5ndGgpIGluIHRoZSBjaGFpbiBvZiBlZGdlc1xuICAgICAgICBkbyB7XG4gICAgICAgICAgdmFyIGxlbmd0aFNxdWFyZWQgPSBlZGdlLmxlbmd0aFNxdWFyZWQoKTtcbiAgICAgICAgICBpZiAobGVuZ3RoU3F1YXJlZCA+IG1heFNxdWFyZWRMZW5ndGgpIHtcbiAgICAgICAgICAgIG1heEVkZ2UgPSBlZGdlO1xuICAgICAgICAgICAgbWF4U3F1YXJlZExlbmd0aCA9IGxlbmd0aFNxdWFyZWQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIGVkZ2UgPSBlZGdlLm5leHQ7XG4gICAgICAgIH0gd2hpbGUgKGVkZ2UgIT09IHRoaXMuZWRnZSk7XG5cbiAgICAgICAgdmFyIHAxID0gbWF4RWRnZS50YWlsKCkucG9pbnQ7XG4gICAgICAgIHZhciBwMiA9IG1heEVkZ2UuaGVhZCgpLnBvaW50O1xuICAgICAgICB2YXIgbWF4VmVjdG9yID0gKDAsIF9zdWJ0cmFjdDIuZGVmYXVsdCkoW10sIHAyLCBwMSk7XG4gICAgICAgIHZhciBtYXhMZW5ndGggPSBNYXRoLnNxcnQobWF4U3F1YXJlZExlbmd0aCk7XG4gICAgICAgIC8vIG1heFZlY3RvciBpcyBub3JtYWxpemVkIGFmdGVyIHRoaXMgb3BlcmF0aW9uXG4gICAgICAgICgwLCBfc2NhbGUyLmRlZmF1bHQpKG1heFZlY3RvciwgbWF4VmVjdG9yLCAxIC8gbWF4TGVuZ3RoKTtcbiAgICAgICAgLy8gY29tcHV0ZSB0aGUgcHJvamVjdGlvbiBvZiBtYXhWZWN0b3Igb3ZlciB0aGlzIGZhY2Ugbm9ybWFsXG4gICAgICAgIHZhciBtYXhQcm9qZWN0aW9uID0gKDAsIF9kb3QyLmRlZmF1bHQpKHRoaXMubm9ybWFsLCBtYXhWZWN0b3IpO1xuICAgICAgICAvLyBzdWJ0cmFjdCB0aGUgcXVhbnRpdHkgbWF4RWRnZSBhZGRzIG9uIHRoZSBub3JtYWxcbiAgICAgICAgKDAsIF9zY2FsZUFuZEFkZDIuZGVmYXVsdCkodGhpcy5ub3JtYWwsIHRoaXMubm9ybWFsLCBtYXhWZWN0b3IsIC1tYXhQcm9qZWN0aW9uKTtcbiAgICAgICAgLy8gcmVub3JtYWxpemUgYHRoaXMubm9ybWFsYFxuICAgICAgICAoMCwgX25vcm1hbGl6ZTIuZGVmYXVsdCkodGhpcy5ub3JtYWwsIHRoaXMubm9ybWFsKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdjb21wdXRlQ2VudHJvaWQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wdXRlQ2VudHJvaWQoKSB7XG4gICAgICB0aGlzLmNlbnRyb2lkID0gWzAsIDAsIDBdO1xuICAgICAgdmFyIGVkZ2UgPSB0aGlzLmVkZ2U7XG4gICAgICBkbyB7XG4gICAgICAgICgwLCBfYWRkMi5kZWZhdWx0KSh0aGlzLmNlbnRyb2lkLCB0aGlzLmNlbnRyb2lkLCBlZGdlLmhlYWQoKS5wb2ludCk7XG4gICAgICAgIGVkZ2UgPSBlZGdlLm5leHQ7XG4gICAgICB9IHdoaWxlIChlZGdlICE9PSB0aGlzLmVkZ2UpO1xuICAgICAgKDAsIF9zY2FsZTIuZGVmYXVsdCkodGhpcy5jZW50cm9pZCwgdGhpcy5jZW50cm9pZCwgMSAvIHRoaXMublZlcnRpY2VzKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdjb21wdXRlTm9ybWFsQW5kQ2VudHJvaWQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wdXRlTm9ybWFsQW5kQ2VudHJvaWQobWluQXJlYSkge1xuICAgICAgaWYgKCh0eXBlb2YgbWluQXJlYSA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2YobWluQXJlYSkpICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhpcy5jb21wdXRlTm9ybWFsTWluQXJlYShtaW5BcmVhKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY29tcHV0ZU5vcm1hbCgpO1xuICAgICAgfVxuICAgICAgdGhpcy5jb21wdXRlQ2VudHJvaWQoKTtcbiAgICAgIHRoaXMub2Zmc2V0ID0gKDAsIF9kb3QyLmRlZmF1bHQpKHRoaXMubm9ybWFsLCB0aGlzLmNlbnRyb2lkKTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdkaXN0YW5jZVRvUGxhbmUnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBkaXN0YW5jZVRvUGxhbmUocG9pbnQpIHtcbiAgICAgIHJldHVybiAoMCwgX2RvdDIuZGVmYXVsdCkodGhpcy5ub3JtYWwsIHBvaW50KSAtIHRoaXMub2Zmc2V0O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEBwcml2YXRlXG4gICAgICpcbiAgICAgKiBDb25uZWN0cyB0d28gZWRnZXMgYXNzdW1pbmcgdGhhdCBwcmV2LmhlYWQoKS5wb2ludCA9PT0gbmV4dC50YWlsKCkucG9pbnRcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7SGFsZkVkZ2V9IHByZXZcbiAgICAgKiBAcGFyYW0ge0hhbGZFZGdlfSBuZXh0XG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ2Nvbm5lY3RIYWxmRWRnZXMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjb25uZWN0SGFsZkVkZ2VzKHByZXYsIG5leHQpIHtcbiAgICAgIHZhciBkaXNjYXJkZWRGYWNlID0gdW5kZWZpbmVkO1xuICAgICAgaWYgKHByZXYub3Bwb3NpdGUuZmFjZSA9PT0gbmV4dC5vcHBvc2l0ZS5mYWNlKSB7XG4gICAgICAgIC8vIGBwcmV2YCBpcyByZW1vdmUgYSByZWR1bmRhbnQgZWRnZVxuICAgICAgICB2YXIgb3Bwb3NpdGVGYWNlID0gbmV4dC5vcHBvc2l0ZS5mYWNlO1xuICAgICAgICB2YXIgb3Bwb3NpdGVFZGdlID0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAocHJldiA9PT0gdGhpcy5lZGdlKSB7XG4gICAgICAgICAgdGhpcy5lZGdlID0gbmV4dDtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3Bwb3NpdGVGYWNlLm5WZXJ0aWNlcyA9PT0gMykge1xuICAgICAgICAgIC8vIGNhc2U6XG4gICAgICAgICAgLy8gcmVtb3ZlIHRoZSBmYWNlIG9uIHRoZSByaWdodFxuICAgICAgICAgIC8vXG4gICAgICAgICAgLy8gICAgICAgL3xcXFxuICAgICAgICAgIC8vICAgICAgLyB8IFxcIHRoZSBmYWNlIG9uIHRoZSByaWdodFxuICAgICAgICAgIC8vICAgICAvICB8ICBcXCAtLT4gb3Bwb3NpdGUgZWRnZVxuICAgICAgICAgIC8vICAgIC8gYSB8ICAgXFxcbiAgICAgICAgICAvLyAgICotLS0tKi0tLS0qXG4gICAgICAgICAgLy8gIC8gICAgIGIgIHwgIFxcXG4gICAgICAgICAgLy8gICAgICAgICAgIOKWvlxuICAgICAgICAgIC8vICAgICAgcmVkdW5kYW50IGVkZ2VcbiAgICAgICAgICAvL1xuICAgICAgICAgIC8vIE5vdGU6IHRoZSBvcHBvc2l0ZSBlZGdlIGlzIGFjdHVhbGx5IGluIHRoZSBmYWNlIHRvIHRoZSByaWdodFxuICAgICAgICAgIC8vIG9mIHRoZSBmYWNlIHRvIGJlIGRlc3Ryb3llZFxuICAgICAgICAgIG9wcG9zaXRlRWRnZSA9IG5leHQub3Bwb3NpdGUucHJldi5vcHBvc2l0ZTtcbiAgICAgICAgICBvcHBvc2l0ZUZhY2UubWFyayA9IERFTEVURUQ7XG4gICAgICAgICAgZGlzY2FyZGVkRmFjZSA9IG9wcG9zaXRlRmFjZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBjYXNlOlxuICAgICAgICAgIC8vICAgICAgICAgIHRcbiAgICAgICAgICAvLyAgICAgICAgKi0tLS1cbiAgICAgICAgICAvLyAgICAgICAvfCA8LSByaWdodCBmYWNlJ3MgcmVkdW5kYW50IGVkZ2VcbiAgICAgICAgICAvLyAgICAgIC8gfCBvcHBvc2l0ZSBlZGdlXG4gICAgICAgICAgLy8gICAgIC8gIHwgIOKWtCAgIC9cbiAgICAgICAgICAvLyAgICAvIGEgfCAgfCAgL1xuICAgICAgICAgIC8vICAgKi0tLS0qLS0tLSpcbiAgICAgICAgICAvLyAgLyAgICAgYiAgfCAgXFxcbiAgICAgICAgICAvLyAgICAgICAgICAg4pa+XG4gICAgICAgICAgLy8gICAgICByZWR1bmRhbnQgZWRnZVxuICAgICAgICAgIG9wcG9zaXRlRWRnZSA9IG5leHQub3Bwb3NpdGUubmV4dDtcbiAgICAgICAgICAvLyBtYWtlIHN1cmUgdGhhdCB0aGUgbGluayBgb3Bwb3NpdGVGYWNlLmVkZ2VgIHBvaW50cyBjb3JyZWN0bHkgZXZlblxuICAgICAgICAgIC8vIGFmdGVyIHRoZSByaWdodCBmYWNlIHJlZHVuZGFudCBlZGdlIGlzIHJlbW92ZWRcbiAgICAgICAgICBpZiAob3Bwb3NpdGVGYWNlLmVkZ2UgPT09IG9wcG9zaXRlRWRnZS5wcmV2KSB7XG4gICAgICAgICAgICBvcHBvc2l0ZUZhY2UuZWRnZSA9IG9wcG9zaXRlRWRnZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyAgICAgICAvfCAgIC9cbiAgICAgICAgICAvLyAgICAgIC8gfCB0L29wcG9zaXRlIGVkZ2VcbiAgICAgICAgICAvLyAgICAgLyAgfCAvIOKWtCAgL1xuICAgICAgICAgIC8vICAgIC8gYSB8LyAgfCAvXG4gICAgICAgICAgLy8gICAqLS0tLSotLS0tKlxuICAgICAgICAgIC8vICAvICAgICBiICAgICBcXFxuICAgICAgICAgIG9wcG9zaXRlRWRnZS5wcmV2ID0gb3Bwb3NpdGVFZGdlLnByZXYucHJldjtcbiAgICAgICAgICBvcHBvc2l0ZUVkZ2UucHJldi5uZXh0ID0gb3Bwb3NpdGVFZGdlO1xuICAgICAgICB9XG4gICAgICAgIC8vICAgICAgIC98XG4gICAgICAgIC8vICAgICAgLyB8XG4gICAgICAgIC8vICAgICAvICB8XG4gICAgICAgIC8vICAgIC8gYSB8XG4gICAgICAgIC8vICAgKi0tLS0qLS0tLSpcbiAgICAgICAgLy8gIC8gICAgIGIgIOKWtCAgXFxcbiAgICAgICAgLy8gICAgICAgICAgIHxcbiAgICAgICAgLy8gICAgIHJlZHVuZGFudCBlZGdlXG4gICAgICAgIG5leHQucHJldiA9IHByZXYucHJldjtcbiAgICAgICAgbmV4dC5wcmV2Lm5leHQgPSBuZXh0O1xuXG4gICAgICAgIC8vICAgICAgIC8gXFwgIFxcXG4gICAgICAgIC8vICAgICAgLyAgIFxcLT5cXFxuICAgICAgICAvLyAgICAgLyAgICAgXFw8LVxcIG9wcG9zaXRlIGVkZ2VcbiAgICAgICAgLy8gICAgLyBhICAgICBcXCAgXFxcbiAgICAgICAgLy8gICAqLS0tLSotLS0tKlxuICAgICAgICAvLyAgLyAgICAgYiAgXiAgXFxcbiAgICAgICAgbmV4dC5zZXRPcHBvc2l0ZShvcHBvc2l0ZUVkZ2UpO1xuXG4gICAgICAgIG9wcG9zaXRlRmFjZS5jb21wdXRlTm9ybWFsQW5kQ2VudHJvaWQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHRyaXZpYWwgY2FzZVxuICAgICAgICAvLyAgICAgICAgKlxuICAgICAgICAvLyAgICAgICAvfFxcXG4gICAgICAgIC8vICAgICAgLyB8IFxcXG4gICAgICAgIC8vICAgICAvICB8LS0+IG5leHRcbiAgICAgICAgLy8gICAgLyBhIHwgICBcXFxuICAgICAgICAvLyAgICotLS0tKi0tLS0qXG4gICAgICAgIC8vICAgIFxcIGIgfCAgIC9cbiAgICAgICAgLy8gICAgIFxcICB8LS0+IHByZXZcbiAgICAgICAgLy8gICAgICBcXCB8IC9cbiAgICAgICAgLy8gICAgICAgXFx8L1xuICAgICAgICAvLyAgICAgICAgKlxuICAgICAgICBwcmV2Lm5leHQgPSBuZXh0O1xuICAgICAgICBuZXh0LnByZXYgPSBwcmV2O1xuICAgICAgfVxuICAgICAgcmV0dXJuIGRpc2NhcmRlZEZhY2U7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnbWVyZ2VBZGphY2VudEZhY2VzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gbWVyZ2VBZGphY2VudEZhY2VzKGFkamFjZW50RWRnZSwgZGlzY2FyZGVkRmFjZXMpIHtcbiAgICAgIHZhciBvcHBvc2l0ZUVkZ2UgPSBhZGphY2VudEVkZ2Uub3Bwb3NpdGU7XG4gICAgICB2YXIgb3Bwb3NpdGVGYWNlID0gb3Bwb3NpdGVFZGdlLmZhY2U7XG5cbiAgICAgIGRpc2NhcmRlZEZhY2VzLnB1c2gob3Bwb3NpdGVGYWNlKTtcbiAgICAgIG9wcG9zaXRlRmFjZS5tYXJrID0gREVMRVRFRDtcblxuICAgICAgLy8gZmluZCB0aGUgY2hhaW4gb2YgZWRnZXMgd2hvc2Ugb3Bwb3NpdGUgZmFjZSBpcyBgb3Bwb3NpdGVGYWNlYFxuICAgICAgLy9cbiAgICAgIC8vICAgICAgICAgICAgICAgID09PT5cbiAgICAgIC8vICAgICAgXFwgICAgICAgICBmYWNlICAgICAgICAgL1xuICAgICAgLy8gICAgICAgKiAtLS0tICogLS0tLSAqIC0tLS0gKlxuICAgICAgLy8gICAgICAvICAgICBvcHBvc2l0ZSBmYWNlICAgIFxcXG4gICAgICAvLyAgICAgICAgICAgICAgICA8PT09XG4gICAgICAvL1xuICAgICAgdmFyIGFkamFjZW50RWRnZVByZXYgPSBhZGphY2VudEVkZ2UucHJldjtcbiAgICAgIHZhciBhZGphY2VudEVkZ2VOZXh0ID0gYWRqYWNlbnRFZGdlLm5leHQ7XG4gICAgICB2YXIgb3Bwb3NpdGVFZGdlUHJldiA9IG9wcG9zaXRlRWRnZS5wcmV2O1xuICAgICAgdmFyIG9wcG9zaXRlRWRnZU5leHQgPSBvcHBvc2l0ZUVkZ2UubmV4dDtcblxuICAgICAgLy8gbGVmdCBlZGdlXG4gICAgICB3aGlsZSAoYWRqYWNlbnRFZGdlUHJldi5vcHBvc2l0ZS5mYWNlID09PSBvcHBvc2l0ZUZhY2UpIHtcbiAgICAgICAgYWRqYWNlbnRFZGdlUHJldiA9IGFkamFjZW50RWRnZVByZXYucHJldjtcbiAgICAgICAgb3Bwb3NpdGVFZGdlTmV4dCA9IG9wcG9zaXRlRWRnZU5leHQubmV4dDtcbiAgICAgIH1cbiAgICAgIC8vIHJpZ2h0IGVkZ2VcbiAgICAgIHdoaWxlIChhZGphY2VudEVkZ2VOZXh0Lm9wcG9zaXRlLmZhY2UgPT09IG9wcG9zaXRlRmFjZSkge1xuICAgICAgICBhZGphY2VudEVkZ2VOZXh0ID0gYWRqYWNlbnRFZGdlTmV4dC5uZXh0O1xuICAgICAgICBvcHBvc2l0ZUVkZ2VQcmV2ID0gb3Bwb3NpdGVFZGdlUHJldi5wcmV2O1xuICAgICAgfVxuICAgICAgLy8gYWRqYWNlbnRFZGdlUHJldiAgXFwgICAgICAgICBmYWNlICAgICAgICAgLyBhZGphY2VudEVkZ2VOZXh0XG4gICAgICAvLyAgICAgICAgICAgICAgICAgICAgKiAtLS0tICogLS0tLSAqIC0tLS0gKlxuICAgICAgLy8gb3Bwb3NpdGVFZGdlTmV4dCAgLyAgICAgb3Bwb3NpdGUgZmFjZSAgICBcXCBvcHBvc2l0ZUVkZ2VQcmV2XG5cbiAgICAgIC8vIGZpeCB0aGUgZmFjZSByZWZlcmVuY2Ugb2YgYWxsIHRoZSBvcHBvc2l0ZSBlZGdlcyB0aGF0IGFyZSBub3QgcGFydCBvZlxuICAgICAgLy8gdGhlIGVkZ2VzIHdob3NlIG9wcG9zaXRlIGZhY2UgaXMgbm90IGBmYWNlYCBpLmUuIGFsbCB0aGUgZWRnZXMgdGhhdFxuICAgICAgLy8gYGZhY2VgIGFuZCBgb3Bwb3NpdGVGYWNlYCBkbyBub3QgaGF2ZSBpbiBjb21tb25cbiAgICAgIHZhciBlZGdlID0gdW5kZWZpbmVkO1xuICAgICAgZm9yIChlZGdlID0gb3Bwb3NpdGVFZGdlTmV4dDsgZWRnZSAhPT0gb3Bwb3NpdGVFZGdlUHJldi5uZXh0OyBlZGdlID0gZWRnZS5uZXh0KSB7XG4gICAgICAgIGVkZ2UuZmFjZSA9IHRoaXM7XG4gICAgICB9XG5cbiAgICAgIC8vIG1ha2Ugc3VyZSB0aGF0IGBmYWNlLmVkZ2VgIGlzIG5vdCBvbmUgb2YgdGhlIGVkZ2VzIHRvIGJlIGRlc3Ryb3llZFxuICAgICAgLy8gTm90ZTogaXQncyBpbXBvcnRhbnQgZm9yIGl0IHRvIGJlIGEgYG5leHRgIGVkZ2Ugc2luY2UgYHByZXZgIGVkZ2VzXG4gICAgICAvLyBtaWdodCBiZSBkZXN0cm95ZWQgb24gYGNvbm5lY3RIYWxmRWRnZXNgXG4gICAgICB0aGlzLmVkZ2UgPSBhZGphY2VudEVkZ2VOZXh0O1xuXG4gICAgICAvLyBjb25uZWN0IHRoZSBleHRyZW1lc1xuICAgICAgLy8gTm90ZTogaXQgbWlnaHQgYmUgcG9zc2libGUgdGhhdCBhZnRlciBjb25uZWN0aW5nIHRoZSBlZGdlcyBhIHRyaWFuZ3VsYXJcbiAgICAgIC8vIGZhY2UgbWlnaHQgYmUgcmVkdW5kYW50XG4gICAgICB2YXIgZGlzY2FyZGVkRmFjZSA9IHVuZGVmaW5lZDtcbiAgICAgIGRpc2NhcmRlZEZhY2UgPSB0aGlzLmNvbm5lY3RIYWxmRWRnZXMob3Bwb3NpdGVFZGdlUHJldiwgYWRqYWNlbnRFZGdlTmV4dCk7XG4gICAgICBpZiAoZGlzY2FyZGVkRmFjZSkge1xuICAgICAgICBkaXNjYXJkZWRGYWNlcy5wdXNoKGRpc2NhcmRlZEZhY2UpO1xuICAgICAgfVxuICAgICAgZGlzY2FyZGVkRmFjZSA9IHRoaXMuY29ubmVjdEhhbGZFZGdlcyhhZGphY2VudEVkZ2VQcmV2LCBvcHBvc2l0ZUVkZ2VOZXh0KTtcbiAgICAgIGlmIChkaXNjYXJkZWRGYWNlKSB7XG4gICAgICAgIGRpc2NhcmRlZEZhY2VzLnB1c2goZGlzY2FyZGVkRmFjZSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuY29tcHV0ZU5vcm1hbEFuZENlbnRyb2lkKCk7XG4gICAgICAvLyBUT0RPOiBhZGRpdGlvbmFsIGNvbnNpc3RlbmN5IGNoZWNrc1xuICAgICAgcmV0dXJuIGRpc2NhcmRlZEZhY2VzO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2NvbGxlY3RJbmRpY2VzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY29sbGVjdEluZGljZXMoKSB7XG4gICAgICB2YXIgaW5kaWNlcyA9IFtdO1xuICAgICAgdmFyIGVkZ2UgPSB0aGlzLmVkZ2U7XG4gICAgICBkbyB7XG4gICAgICAgIGluZGljZXMucHVzaChlZGdlLmhlYWQoKS5pbmRleCk7XG4gICAgICAgIGVkZ2UgPSBlZGdlLm5leHQ7XG4gICAgICB9IHdoaWxlIChlZGdlICE9PSB0aGlzLmVkZ2UpO1xuICAgICAgcmV0dXJuIGluZGljZXM7XG4gICAgfVxuICB9XSwgW3tcbiAgICBrZXk6ICdjcmVhdGVUcmlhbmdsZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNyZWF0ZVRyaWFuZ2xlKHYwLCB2MSwgdjIpIHtcbiAgICAgIHZhciBtaW5BcmVhID0gYXJndW1lbnRzLmxlbmd0aCA8PSAzIHx8IGFyZ3VtZW50c1szXSA9PT0gdW5kZWZpbmVkID8gMCA6IGFyZ3VtZW50c1szXTtcblxuICAgICAgdmFyIGZhY2UgPSBuZXcgRmFjZSgpO1xuICAgICAgdmFyIGUwID0gbmV3IF9IYWxmRWRnZTIuZGVmYXVsdCh2MCwgZmFjZSk7XG4gICAgICB2YXIgZTEgPSBuZXcgX0hhbGZFZGdlMi5kZWZhdWx0KHYxLCBmYWNlKTtcbiAgICAgIHZhciBlMiA9IG5ldyBfSGFsZkVkZ2UyLmRlZmF1bHQodjIsIGZhY2UpO1xuXG4gICAgICAvLyBqb2luIGVkZ2VzXG4gICAgICBlMC5uZXh0ID0gZTIucHJldiA9IGUxO1xuICAgICAgZTEubmV4dCA9IGUwLnByZXYgPSBlMjtcbiAgICAgIGUyLm5leHQgPSBlMS5wcmV2ID0gZTA7XG5cbiAgICAgIC8vIG1haW4gaGFsZiBlZGdlIHJlZmVyZW5jZVxuICAgICAgZmFjZS5lZGdlID0gZTA7XG4gICAgICBmYWNlLmNvbXB1dGVOb3JtYWxBbmRDZW50cm9pZChtaW5BcmVhKTtcbiAgICAgIGRlYnVnKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5sb2coJ2ZhY2UgY3JlYXRlZCAlaicsIGZhY2UuY29sbGVjdEluZGljZXMoKSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBmYWNlO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBGYWNlO1xufSkoKTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gRmFjZTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9kaXN0YW5jZSA9IHJlcXVpcmUoJ2dsLXZlYzMvZGlzdGFuY2UnKTtcblxudmFyIF9kaXN0YW5jZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9kaXN0YW5jZSk7XG5cbnZhciBfc3F1YXJlZERpc3RhbmNlID0gcmVxdWlyZSgnZ2wtdmVjMy9zcXVhcmVkRGlzdGFuY2UnKTtcblxudmFyIF9zcXVhcmVkRGlzdGFuY2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfc3F1YXJlZERpc3RhbmNlKTtcblxudmFyIF9kZWJ1Z0ZuID0gcmVxdWlyZSgnZGVidWctZm4nKTtcblxudmFyIF9kZWJ1Z0ZuMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2RlYnVnRm4pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgZGVidWcgPSAoMCwgX2RlYnVnRm4yLmRlZmF1bHQpKCdoYWxmZWRnZScpO1xuXG52YXIgSGFsZkVkZ2UgPSAoZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBIYWxmRWRnZSh2ZXJ0ZXgsIGZhY2UpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgSGFsZkVkZ2UpO1xuXG4gICAgdGhpcy52ZXJ0ZXggPSB2ZXJ0ZXg7XG4gICAgdGhpcy5mYWNlID0gZmFjZTtcbiAgICB0aGlzLm5leHQgPSBudWxsO1xuICAgIHRoaXMucHJldiA9IG51bGw7XG4gICAgdGhpcy5vcHBvc2l0ZSA9IG51bGw7XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoSGFsZkVkZ2UsIFt7XG4gICAga2V5OiAnaGVhZCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGhlYWQoKSB7XG4gICAgICByZXR1cm4gdGhpcy52ZXJ0ZXg7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAndGFpbCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHRhaWwoKSB7XG4gICAgICByZXR1cm4gdGhpcy5wcmV2ID8gdGhpcy5wcmV2LnZlcnRleCA6IG51bGw7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnbGVuZ3RoJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gbGVuZ3RoKCkge1xuICAgICAgaWYgKHRoaXMudGFpbCgpKSB7XG4gICAgICAgIHJldHVybiAoMCwgX2Rpc3RhbmNlMi5kZWZhdWx0KSh0aGlzLnRhaWwoKS5wb2ludCwgdGhpcy5oZWFkKCkucG9pbnQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIC0xO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2xlbmd0aFNxdWFyZWQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBsZW5ndGhTcXVhcmVkKCkge1xuICAgICAgaWYgKHRoaXMudGFpbCgpKSB7XG4gICAgICAgIHJldHVybiAoMCwgX3NxdWFyZWREaXN0YW5jZTIuZGVmYXVsdCkodGhpcy50YWlsKCkucG9pbnQsIHRoaXMuaGVhZCgpLnBvaW50KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdzZXRPcHBvc2l0ZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNldE9wcG9zaXRlKGVkZ2UpIHtcbiAgICAgIHZhciBtZSA9IHRoaXM7XG4gICAgICBkZWJ1ZyhmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMubG9nKCdvcHBvc2l0ZSAnICsgbWUudGFpbCgpLmluZGV4ICsgJyA8LS0+ICcgKyBtZS5oZWFkKCkuaW5kZXggKyAnIGJldHdlZW4gJyArIG1lLmZhY2UuY29sbGVjdEluZGljZXMoKSArICcsICcgKyBlZGdlLmZhY2UuY29sbGVjdEluZGljZXMoKSk7XG4gICAgICB9KTtcbiAgICAgIHRoaXMub3Bwb3NpdGUgPSBlZGdlO1xuICAgICAgZWRnZS5vcHBvc2l0ZSA9IHRoaXM7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIEhhbGZFZGdlO1xufSkoKTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gSGFsZkVkZ2U7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBfc2xpY2VkVG9BcnJheSA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIHNsaWNlSXRlcmF0b3IoYXJyLCBpKSB7IHZhciBfYXJyID0gW107IHZhciBfbiA9IHRydWU7IHZhciBfZCA9IGZhbHNlOyB2YXIgX2UgPSB1bmRlZmluZWQ7IHRyeSB7IGZvciAodmFyIF9pID0gYXJyW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3M7ICEoX24gPSAoX3MgPSBfaS5uZXh0KCkpLmRvbmUpOyBfbiA9IHRydWUpIHsgX2Fyci5wdXNoKF9zLnZhbHVlKTsgaWYgKGkgJiYgX2Fyci5sZW5ndGggPT09IGkpIGJyZWFrOyB9IH0gY2F0Y2ggKGVycikgeyBfZCA9IHRydWU7IF9lID0gZXJyOyB9IGZpbmFsbHkgeyB0cnkgeyBpZiAoIV9uICYmIF9pW1wicmV0dXJuXCJdKSBfaVtcInJldHVyblwiXSgpOyB9IGZpbmFsbHkgeyBpZiAoX2QpIHRocm93IF9lOyB9IH0gcmV0dXJuIF9hcnI7IH0gcmV0dXJuIGZ1bmN0aW9uIChhcnIsIGkpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyByZXR1cm4gYXJyOyB9IGVsc2UgaWYgKFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoYXJyKSkgeyByZXR1cm4gc2xpY2VJdGVyYXRvcihhcnIsIGkpOyB9IGVsc2UgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiSW52YWxpZCBhdHRlbXB0IHRvIGRlc3RydWN0dXJlIG5vbi1pdGVyYWJsZSBpbnN0YW5jZVwiKTsgfSB9OyB9KSgpO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfcG9pbnRMaW5lRGlzdGFuY2UgPSByZXF1aXJlKCdwb2ludC1saW5lLWRpc3RhbmNlJyk7XG5cbnZhciBfcG9pbnRMaW5lRGlzdGFuY2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfcG9pbnRMaW5lRGlzdGFuY2UpO1xuXG52YXIgX2dldFBsYW5lTm9ybWFsID0gcmVxdWlyZSgnZ2V0LXBsYW5lLW5vcm1hbCcpO1xuXG52YXIgX2dldFBsYW5lTm9ybWFsMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2dldFBsYW5lTm9ybWFsKTtcblxudmFyIF9kZWJ1Z0ZuID0gcmVxdWlyZSgnZGVidWctZm4nKTtcblxudmFyIF9kZWJ1Z0ZuMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2RlYnVnRm4pO1xuXG52YXIgX2RvdCA9IHJlcXVpcmUoJ2dsLXZlYzMvZG90Jyk7XG5cbnZhciBfZG90MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2RvdCk7XG5cbnZhciBfVmVydGV4TGlzdCA9IHJlcXVpcmUoJy4vVmVydGV4TGlzdCcpO1xuXG52YXIgX1ZlcnRleExpc3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfVmVydGV4TGlzdCk7XG5cbnZhciBfVmVydGV4ID0gcmVxdWlyZSgnLi9WZXJ0ZXgnKTtcblxudmFyIF9WZXJ0ZXgyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfVmVydGV4KTtcblxudmFyIF9GYWNlID0gcmVxdWlyZSgnLi9GYWNlJyk7XG5cbnZhciBfRmFjZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9GYWNlKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIGRlYnVnID0gKDAsIF9kZWJ1Z0ZuMi5kZWZhdWx0KSgncXVpY2todWxsJyk7XG5cbi8vIG1lcmdlIHR5cGVzXG4vLyBub24gY29udmV4IHdpdGggcmVzcGVjdCB0byB0aGUgbGFyZ2UgZmFjZVxudmFyIE1FUkdFX05PTl9DT05WRVhfV1JUX0xBUkdFUl9GQUNFID0gMTtcbnZhciBNRVJHRV9OT05fQ09OVkVYID0gMjtcblxudmFyIFF1aWNrSHVsbCA9IChmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIFF1aWNrSHVsbChwb2ludHMpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgUXVpY2tIdWxsKTtcblxuICAgIGlmICghQXJyYXkuaXNBcnJheShwb2ludHMpKSB7XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoJ2lucHV0IGlzIG5vdCBhIHZhbGlkIGFycmF5Jyk7XG4gICAgfVxuICAgIGlmIChwb2ludHMubGVuZ3RoIDwgNCkge1xuICAgICAgdGhyb3cgRXJyb3IoJ2Nhbm5vdCBidWlsZCBhIHNpbXBsZXggb3V0IG9mIDw0IHBvaW50cycpO1xuICAgIH1cblxuICAgIHRoaXMudG9sZXJhbmNlID0gLTE7XG5cbiAgICAvLyBidWZmZXJzXG4gICAgdGhpcy5uRmFjZXMgPSAwO1xuICAgIHRoaXMublBvaW50cyA9IHBvaW50cy5sZW5ndGg7XG5cbiAgICB0aGlzLmZhY2VzID0gW107XG4gICAgdGhpcy5uZXdGYWNlcyA9IFtdO1xuICAgIC8vIGhlbHBlcnNcbiAgICAvL1xuICAgIC8vIGxldCBgYWAsIGBiYCBiZSBgRmFjZWAgaW5zdGFuY2VzXG4gICAgLy8gbGV0IGB2YCBiZSBwb2ludHMgd3JhcHBlZCBhcyBpbnN0YW5jZSBvZiBgVmVydGV4YFxuICAgIC8vXG4gICAgLy8gICAgIFt2LCB2LCAuLi4sIHYsIHYsIHYsIC4uLl1cbiAgICAvLyAgICAgIF4gICAgICAgICAgICAgXlxuICAgIC8vICAgICAgfCAgICAgICAgICAgICB8XG4gICAgLy8gIGEub3V0c2lkZSAgICAgYi5vdXRzaWRlXG4gICAgLy9cbiAgICB0aGlzLmNsYWltZWQgPSBuZXcgX1ZlcnRleExpc3QyLmRlZmF1bHQoKTtcbiAgICB0aGlzLnVuY2xhaW1lZCA9IG5ldyBfVmVydGV4TGlzdDIuZGVmYXVsdCgpO1xuXG4gICAgLy8gdmVydGljZXMgb2YgdGhlIGh1bGwoaW50ZXJuYWwgcmVwcmVzZW50YXRpb24gb2YgcG9pbnRzKVxuICAgIHRoaXMudmVydGljZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBvaW50cy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgdGhpcy52ZXJ0aWNlcy5wdXNoKG5ldyBfVmVydGV4Mi5kZWZhdWx0KHBvaW50c1tpXSwgaSkpO1xuICAgIH1cbiAgICB0aGlzLmRpc2NhcmRlZEZhY2VzID0gW107XG4gICAgdGhpcy52ZXJ0ZXhQb2ludEluZGljZXMgPSBbXTtcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhRdWlja0h1bGwsIFt7XG4gICAga2V5OiAnYWRkVmVydGV4VG9GYWNlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWRkVmVydGV4VG9GYWNlKHZlcnRleCwgZmFjZSkge1xuICAgICAgdmVydGV4LmZhY2UgPSBmYWNlO1xuICAgICAgaWYgKCFmYWNlLm91dHNpZGUpIHtcbiAgICAgICAgdGhpcy5jbGFpbWVkLmFkZCh2ZXJ0ZXgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jbGFpbWVkLmluc2VydEJlZm9yZShmYWNlLm91dHNpZGUsIHZlcnRleCk7XG4gICAgICB9XG4gICAgICBmYWNlLm91dHNpZGUgPSB2ZXJ0ZXg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBgdmVydGV4YCBmb3IgdGhlIGBjbGFpbWVkYCBsaXN0IG9mIHZlcnRpY2VzLCBpdCBhbHNvIG1ha2VzIHN1cmVcbiAgICAgKiB0aGF0IHRoZSBsaW5rIGZyb20gYGZhY2VgIHRvIHRoZSBmaXJzdCB2ZXJ0ZXggaXQgc2VlcyBpbiBgY2xhaW1lZGAgaXNcbiAgICAgKiBsaW5rZWQgY29ycmVjdGx5IGFmdGVyIHRoZSByZW1vdmFsXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1ZlcnRleH0gdmVydGV4XG4gICAgICogQHBhcmFtIHtGYWNlfSBmYWNlXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ3JlbW92ZVZlcnRleEZyb21GYWNlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlVmVydGV4RnJvbUZhY2UodmVydGV4LCBmYWNlKSB7XG4gICAgICBpZiAodmVydGV4ID09PSBmYWNlLm91dHNpZGUpIHtcbiAgICAgICAgLy8gZml4IGZhY2Uub3V0c2lkZSBsaW5rXG4gICAgICAgIGlmICh2ZXJ0ZXgubmV4dCAmJiB2ZXJ0ZXgubmV4dC5mYWNlID09PSBmYWNlKSB7XG4gICAgICAgICAgLy8gZmFjZSBoYXMgYXQgbGVhc3QgMiBvdXRzaWRlIHZlcnRpY2VzLCBtb3ZlIHRoZSBgb3V0c2lkZWAgcmVmZXJlbmNlXG4gICAgICAgICAgZmFjZS5vdXRzaWRlID0gdmVydGV4Lm5leHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gdmVydGV4IHdhcyB0aGUgb25seSBvdXRzaWRlIHZlcnRleCB0aGF0IGZhY2UgaGFkXG4gICAgICAgICAgZmFjZS5vdXRzaWRlID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5jbGFpbWVkLnJlbW92ZSh2ZXJ0ZXgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgYWxsIHRoZSB2aXNpYmxlIHZlcnRpY2VzIHRoYXQgYGZhY2VgIGlzIGFibGUgdG8gc2VlIHdoaWNoIGFyZVxuICAgICAqIHN0b3JlZCBpbiB0aGUgYGNsYWltZWRgIHZlcnRleHQgbGlzdFxuICAgICAqXG4gICAgICogQHBhcmFtIHtGYWNlfSBmYWNlXG4gICAgICogQHJldHVybiB7VmVydGV4fHVuZGVmaW5lZH0gSWYgZmFjZSBoYWQgdmlzaWJsZSB2ZXJ0aWNlcyByZXR1cm5zXG4gICAgICogYGZhY2Uub3V0c2lkZWAsIG90aGVyd2lzZSB1bmRlZmluZWRcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAncmVtb3ZlQWxsVmVydGljZXNGcm9tRmFjZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZUFsbFZlcnRpY2VzRnJvbUZhY2UoZmFjZSkge1xuICAgICAgaWYgKGZhY2Uub3V0c2lkZSkge1xuICAgICAgICAvLyBwb2ludGVyIHRvIHRoZSBsYXN0IHZlcnRleCBvZiB0aGlzIGZhY2VcbiAgICAgICAgLy8gWy4uLiwgb3V0c2lkZSwgLi4uLCBlbmQsIG91dHNpZGUsIC4uLl1cbiAgICAgICAgLy8gICAgICAgICAgfCAgICAgICAgICAgfCAgICAgIHxcbiAgICAgICAgLy8gICAgICAgICAgYSAgICAgICAgICAgYSAgICAgIGJcbiAgICAgICAgdmFyIGVuZCA9IGZhY2Uub3V0c2lkZTtcbiAgICAgICAgd2hpbGUgKGVuZC5uZXh0ICYmIGVuZC5uZXh0LmZhY2UgPT09IGZhY2UpIHtcbiAgICAgICAgICBlbmQgPSBlbmQubmV4dDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNsYWltZWQucmVtb3ZlQ2hhaW4oZmFjZS5vdXRzaWRlLCBlbmQpO1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICBiXG4gICAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICBbIG91dHNpZGUsIC4uLl1cbiAgICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgfCAgcmVtb3ZlcyB0aGlzIGxpbmtcbiAgICAgICAgLy8gICAgIFsgb3V0c2lkZSwgLi4uLCBlbmQgXSAt4pSYXG4gICAgICAgIC8vICAgICAgICAgIHwgICAgICAgICAgIHxcbiAgICAgICAgLy8gICAgICAgICAgYSAgICAgICAgICAgYVxuICAgICAgICBlbmQubmV4dCA9IG51bGw7XG4gICAgICAgIHJldHVybiBmYWNlLm91dHNpZGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhbGwgdGhlIHZpc2libGUgdmVydGljZXMgdGhhdCBgZmFjZWAgaXMgYWJsZSB0byBzZWUsIGFkZGl0aW9uYWxseVxuICAgICAqIGNoZWNraW5nIHRoZSBmb2xsb3dpbmc6XG4gICAgICpcbiAgICAgKiBJZiBgYWJzb3JiaW5nRmFjZWAgZG9lc24ndCBleGlzdCB0aGVuIGFsbCB0aGUgcmVtb3ZlZCB2ZXJ0aWNlcyB3aWxsIGJlXG4gICAgICogYWRkZWQgdG8gdGhlIGB1bmNsYWltZWRgIHZlcnRleCBsaXN0XG4gICAgICpcbiAgICAgKiBJZiBgYWJzb3JiaW5nRmFjZWAgZXhpc3RzIHRoZW4gdGhpcyBtZXRob2Qgd2lsbCBhc3NpZ24gYWxsIHRoZSB2ZXJ0aWNlcyBvZlxuICAgICAqIGBmYWNlYCB0aGF0IGNhbiBzZWUgYGFic29yYmluZ0ZhY2VgLCBpZiBhIHZlcnRleCBjYW5ub3Qgc2VlIGBhYnNvcmJpbmdGYWNlYFxuICAgICAqIGl0J3MgYWRkZWQgdG8gdGhlIGB1bmNsYWltZWRgIHZlcnRleCBsaXN0XG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0ZhY2V9IGZhY2VcbiAgICAgKiBAcGFyYW0ge0ZhY2V9IFthYnNvcmJpbmdGYWNlXVxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdkZWxldGVGYWNlVmVydGljZXMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBkZWxldGVGYWNlVmVydGljZXMoZmFjZSwgYWJzb3JiaW5nRmFjZSkge1xuICAgICAgdmFyIGZhY2VWZXJ0aWNlcyA9IHRoaXMucmVtb3ZlQWxsVmVydGljZXNGcm9tRmFjZShmYWNlKTtcbiAgICAgIGlmIChmYWNlVmVydGljZXMpIHtcbiAgICAgICAgaWYgKCFhYnNvcmJpbmdGYWNlKSB7XG4gICAgICAgICAgLy8gbWFyayB0aGUgdmVydGljZXMgdG8gYmUgcmVhc3NpZ25lZCB0byBzb21lIG90aGVyIGZhY2VcbiAgICAgICAgICB0aGlzLnVuY2xhaW1lZC5hZGRBbGwoZmFjZVZlcnRpY2VzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBpZiB0aGVyZSdzIGFuIGFic29yYmluZyBmYWNlIHRyeSB0byBhc3NpZ24gYXMgbWFueSB2ZXJ0aWNlc1xuICAgICAgICAgIC8vIGFzIHBvc3NpYmxlIHRvIGl0XG5cbiAgICAgICAgICAvLyB0aGUgcmVmZXJlbmNlIGB2ZXJ0ZXgubmV4dGAgbWlnaHQgYmUgZGVzdHJveWVkIG9uXG4gICAgICAgICAgLy8gYHRoaXMuYWRkVmVydGV4VG9GYWNlYCAoc2VlIFZlcnRleExpc3QjYWRkKSwgbmV4dFZlcnRleCBpcyBhXG4gICAgICAgICAgLy8gcmVmZXJlbmNlIHRvIGl0XG4gICAgICAgICAgdmFyIG5leHRWZXJ0ZXggPSB1bmRlZmluZWQ7XG4gICAgICAgICAgZm9yICh2YXIgdmVydGV4ID0gZmFjZVZlcnRpY2VzOyB2ZXJ0ZXg7IHZlcnRleCA9IG5leHRWZXJ0ZXgpIHtcbiAgICAgICAgICAgIG5leHRWZXJ0ZXggPSB2ZXJ0ZXgubmV4dDtcbiAgICAgICAgICAgIHZhciBkaXN0YW5jZSA9IGFic29yYmluZ0ZhY2UuZGlzdGFuY2VUb1BsYW5lKHZlcnRleC5wb2ludCk7XG5cbiAgICAgICAgICAgIC8vIGNoZWNrIGlmIGB2ZXJ0ZXhgIGlzIGFibGUgdG8gc2VlIGBhYnNvcmJpbmdGYWNlYFxuICAgICAgICAgICAgaWYgKGRpc3RhbmNlID4gdGhpcy50b2xlcmFuY2UpIHtcbiAgICAgICAgICAgICAgdGhpcy5hZGRWZXJ0ZXhUb0ZhY2UodmVydGV4LCBhYnNvcmJpbmdGYWNlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMudW5jbGFpbWVkLmFkZCh2ZXJ0ZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlYXNzaWducyBhcyBtYW55IHZlcnRpY2VzIGFzIHBvc3NpYmxlIGZyb20gdGhlIHVuY2xhaW1lZCBsaXN0IHRvIHRoZSBuZXdcbiAgICAgKiBmYWNlc1xuICAgICAqXG4gICAgICogQHBhcmFtIHtGYWNlc1tdfSBuZXdGYWNlc1xuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdyZXNvbHZlVW5jbGFpbWVkUG9pbnRzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVzb2x2ZVVuY2xhaW1lZFBvaW50cyhuZXdGYWNlcykge1xuICAgICAgLy8gY2FjaGUgbmV4dCB2ZXJ0ZXggc28gdGhhdCBpZiBgdmVydGV4Lm5leHRgIGlzIGRlc3Ryb3llZCBpdCdzIHN0aWxsXG4gICAgICAvLyByZWNvdmVyYWJsZVxuICAgICAgdmFyIHZlcnRleE5leHQgPSB0aGlzLnVuY2xhaW1lZC5maXJzdCgpO1xuICAgICAgZm9yICh2YXIgdmVydGV4ID0gdmVydGV4TmV4dDsgdmVydGV4OyB2ZXJ0ZXggPSB2ZXJ0ZXhOZXh0KSB7XG4gICAgICAgIHZlcnRleE5leHQgPSB2ZXJ0ZXgubmV4dDtcbiAgICAgICAgdmFyIG1heERpc3RhbmNlID0gdGhpcy50b2xlcmFuY2U7XG4gICAgICAgIHZhciBtYXhGYWNlID0gdW5kZWZpbmVkO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5ld0ZhY2VzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgdmFyIGZhY2UgPSBuZXdGYWNlc1tpXTtcbiAgICAgICAgICBpZiAoZmFjZS5tYXJrID09PSBfRmFjZS5WSVNJQkxFKSB7XG4gICAgICAgICAgICB2YXIgZGlzdCA9IGZhY2UuZGlzdGFuY2VUb1BsYW5lKHZlcnRleC5wb2ludCk7XG4gICAgICAgICAgICBpZiAoZGlzdCA+IG1heERpc3RhbmNlKSB7XG4gICAgICAgICAgICAgIG1heERpc3RhbmNlID0gZGlzdDtcbiAgICAgICAgICAgICAgbWF4RmFjZSA9IGZhY2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobWF4RGlzdGFuY2UgPiAxMDAwICogdGhpcy50b2xlcmFuY2UpIHtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1heEZhY2UpIHtcbiAgICAgICAgICB0aGlzLmFkZFZlcnRleFRvRmFjZSh2ZXJ0ZXgsIG1heEZhY2UpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29tcHV0ZXMgdGhlIGV4dHJlbWVzIG9mIGEgdGV0cmFoZWRyb24gd2hpY2ggd2lsbCBiZSB0aGUgaW5pdGlhbCBodWxsXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtudW1iZXJbXX0gVGhlIG1pbi9tYXggdmVydGljZXMgaW4gdGhlIHgseSx6IGRpcmVjdGlvbnNcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAnY29tcHV0ZUV4dHJlbWVzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY29tcHV0ZUV4dHJlbWVzKCkge1xuICAgICAgdmFyIG1lID0gdGhpcztcbiAgICAgIHZhciBtaW4gPSBbXTtcbiAgICAgIHZhciBtYXggPSBbXTtcblxuICAgICAgLy8gbWluIHZlcnRleCBvbiB0aGUgeCx5LHogZGlyZWN0aW9uc1xuICAgICAgdmFyIG1pblZlcnRpY2VzID0gW107XG4gICAgICAvLyBtYXggdmVydGV4IG9uIHRoZSB4LHkseiBkaXJlY3Rpb25zXG4gICAgICB2YXIgbWF4VmVydGljZXMgPSBbXTtcblxuICAgICAgdmFyIGkgPSB1bmRlZmluZWQsXG4gICAgICAgICAgaiA9IHVuZGVmaW5lZDtcblxuICAgICAgLy8gaW5pdGlhbGx5IGFzc3VtZSB0aGF0IHRoZSBmaXJzdCB2ZXJ0ZXggaXMgdGhlIG1pbi9tYXhcbiAgICAgIGZvciAoaSA9IDA7IGkgPCAzOyBpICs9IDEpIHtcbiAgICAgICAgbWluVmVydGljZXNbaV0gPSBtYXhWZXJ0aWNlc1tpXSA9IHRoaXMudmVydGljZXNbMF07XG4gICAgICB9XG4gICAgICAvLyBjb3B5IHRoZSBjb29yZGluYXRlcyBvZiB0aGUgZmlyc3QgdmVydGV4IHRvIG1pbi9tYXhcbiAgICAgIGZvciAoaSA9IDA7IGkgPCAzOyBpICs9IDEpIHtcbiAgICAgICAgbWluW2ldID0gbWF4W2ldID0gdGhpcy52ZXJ0aWNlc1swXS5wb2ludFtpXTtcbiAgICAgIH1cblxuICAgICAgLy8gY29tcHV0ZSB0aGUgbWluL21heCB2ZXJ0ZXggb24gYWxsIDYgZGlyZWN0aW9uc1xuICAgICAgZm9yIChpID0gMTsgaSA8IHRoaXMudmVydGljZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdmFyIHZlcnRleCA9IHRoaXMudmVydGljZXNbaV07XG4gICAgICAgIHZhciBwb2ludCA9IHZlcnRleC5wb2ludDtcbiAgICAgICAgLy8gdXBkYXRlIHRoZSBtaW4gY29vcmRpbmF0ZXNcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IDM7IGogKz0gMSkge1xuICAgICAgICAgIGlmIChwb2ludFtqXSA8IG1pbltqXSkge1xuICAgICAgICAgICAgbWluW2pdID0gcG9pbnRbal07XG4gICAgICAgICAgICBtaW5WZXJ0aWNlc1tqXSA9IHZlcnRleDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gdXBkYXRlIHRoZSBtYXggY29vcmRpbmF0ZXNcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IDM7IGogKz0gMSkge1xuICAgICAgICAgIGlmIChwb2ludFtqXSA+IG1heFtqXSkge1xuICAgICAgICAgICAgbWF4W2pdID0gcG9pbnRbal07XG4gICAgICAgICAgICBtYXhWZXJ0aWNlc1tqXSA9IHZlcnRleDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gY29tcHV0ZSBlcHNpbG9uXG4gICAgICB0aGlzLnRvbGVyYW5jZSA9IDMgKiBOdW1iZXIuRVBTSUxPTiAqIChNYXRoLm1heChNYXRoLmFicyhtaW5bMF0pLCBNYXRoLmFicyhtYXhbMF0pKSArIE1hdGgubWF4KE1hdGguYWJzKG1pblsxXSksIE1hdGguYWJzKG1heFsxXSkpICsgTWF0aC5tYXgoTWF0aC5hYnMobWluWzJdKSwgTWF0aC5hYnMobWF4WzJdKSkpO1xuICAgICAgZGVidWcoZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmxvZygndG9sZXJhbmNlICVkJywgbWUudG9sZXJhbmNlKTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIFttaW5WZXJ0aWNlcywgbWF4VmVydGljZXNdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbXB1ZXMgdGhlIGluaXRpYWwgdGV0cmFoZWRyb24gYXNzaWduaW5nIHRvIGl0cyBmYWNlcyBhbGwgdGhlIHBvaW50cyB0aGF0XG4gICAgICogYXJlIGNhbmRpZGF0ZXMgdG8gZm9ybSBwYXJ0IG9mIHRoZSBodWxsXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ2NyZWF0ZUluaXRpYWxTaW1wbGV4JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY3JlYXRlSW5pdGlhbFNpbXBsZXgoKSB7XG4gICAgICB2YXIgdmVydGljZXMgPSB0aGlzLnZlcnRpY2VzO1xuXG4gICAgICB2YXIgX2NvbXB1dGVFeHRyZW1lcyA9IHRoaXMuY29tcHV0ZUV4dHJlbWVzKCk7XG5cbiAgICAgIHZhciBfY29tcHV0ZUV4dHJlbWVzMiA9IF9zbGljZWRUb0FycmF5KF9jb21wdXRlRXh0cmVtZXMsIDIpO1xuXG4gICAgICB2YXIgbWluID0gX2NvbXB1dGVFeHRyZW1lczJbMF07XG4gICAgICB2YXIgbWF4ID0gX2NvbXB1dGVFeHRyZW1lczJbMV07XG5cbiAgICAgIHZhciB2MCA9IHVuZGVmaW5lZCxcbiAgICAgICAgICB2MSA9IHVuZGVmaW5lZCxcbiAgICAgICAgICB2MiA9IHVuZGVmaW5lZCxcbiAgICAgICAgICB2MyA9IHVuZGVmaW5lZDtcbiAgICAgIHZhciBpID0gdW5kZWZpbmVkLFxuICAgICAgICAgIGogPSB1bmRlZmluZWQ7XG5cbiAgICAgIC8vIEZpbmQgdGhlIHR3byB2ZXJ0aWNlcyB3aXRoIHRoZSBncmVhdGVzdCAxZCBzZXBhcmF0aW9uXG4gICAgICAvLyAobWF4LnggLSBtaW4ueClcbiAgICAgIC8vIChtYXgueSAtIG1pbi55KVxuICAgICAgLy8gKG1heC56IC0gbWluLnopXG4gICAgICB2YXIgbWF4RGlzdGFuY2UgPSAwO1xuICAgICAgdmFyIGluZGV4TWF4ID0gMDtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCAzOyBpICs9IDEpIHtcbiAgICAgICAgdmFyIGRpc3RhbmNlID0gbWF4W2ldLnBvaW50W2ldIC0gbWluW2ldLnBvaW50W2ldO1xuICAgICAgICBpZiAoZGlzdGFuY2UgPiBtYXhEaXN0YW5jZSkge1xuICAgICAgICAgIG1heERpc3RhbmNlID0gZGlzdGFuY2U7XG4gICAgICAgICAgaW5kZXhNYXggPSBpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2MCA9IG1pbltpbmRleE1heF07XG4gICAgICB2MSA9IG1heFtpbmRleE1heF07XG5cbiAgICAgIC8vIHRoZSBuZXh0IHZlcnRleCBpcyB0aGUgb25lIGZhcnRoZXN0IHRvIHRoZSBsaW5lIGZvcm1lZCBieSBgdjBgIGFuZCBgdjFgXG4gICAgICBtYXhEaXN0YW5jZSA9IDA7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy52ZXJ0aWNlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB2YXIgdmVydGV4ID0gdGhpcy52ZXJ0aWNlc1tpXTtcbiAgICAgICAgaWYgKHZlcnRleCAhPT0gdjAgJiYgdmVydGV4ICE9PSB2MSkge1xuICAgICAgICAgIHZhciBkaXN0YW5jZSA9ICgwLCBfcG9pbnRMaW5lRGlzdGFuY2UyLmRlZmF1bHQpKHZlcnRleC5wb2ludCwgdjAucG9pbnQsIHYxLnBvaW50KTtcbiAgICAgICAgICBpZiAoZGlzdGFuY2UgPiBtYXhEaXN0YW5jZSkge1xuICAgICAgICAgICAgbWF4RGlzdGFuY2UgPSBkaXN0YW5jZTtcbiAgICAgICAgICAgIHYyID0gdmVydGV4O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyB0aGUgbmV4dCB2ZXJ0ZXMgaXMgdGhlIG9uZSBmYXJ0aGVzdCB0byB0aGUgcGxhbmUgYHYwYCwgYHYxYCwgYHYyYFxuICAgICAgLy8gbm9ybWFsaXplKCh2MiAtIHYxKSB4ICh2MCAtIHYxKSlcbiAgICAgIHZhciBub3JtYWwgPSAoMCwgX2dldFBsYW5lTm9ybWFsMi5kZWZhdWx0KShbXSwgdjAucG9pbnQsIHYxLnBvaW50LCB2Mi5wb2ludCk7XG4gICAgICAvLyBkaXN0YW5jZSBmcm9tIHRoZSBvcmlnaW4gdG8gdGhlIHBsYW5lXG4gICAgICB2YXIgZGlzdFBPID0gKDAsIF9kb3QyLmRlZmF1bHQpKHYwLnBvaW50LCBub3JtYWwpO1xuICAgICAgbWF4RGlzdGFuY2UgPSAwO1xuICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMudmVydGljZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdmFyIHZlcnRleCA9IHRoaXMudmVydGljZXNbaV07XG4gICAgICAgIGlmICh2ZXJ0ZXggIT09IHYwICYmIHZlcnRleCAhPT0gdjEgJiYgdmVydGV4ICE9PSB2Mikge1xuICAgICAgICAgIHZhciBkaXN0YW5jZSA9IE1hdGguYWJzKCgwLCBfZG90Mi5kZWZhdWx0KShub3JtYWwsIHZlcnRleC5wb2ludCkgLSBkaXN0UE8pO1xuICAgICAgICAgIGlmIChkaXN0YW5jZSA+IG1heERpc3RhbmNlKSB7XG4gICAgICAgICAgICBtYXhEaXN0YW5jZSA9IGRpc3RhbmNlO1xuICAgICAgICAgICAgdjMgPSB2ZXJ0ZXg7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIGluaXRpYWwgc2ltcGxleFxuICAgICAgLy8gVGFrZW4gZnJvbSBodHRwOi8vZXZlcnl0aGluZzIuY29tL3RpdGxlL0hvdyt0bytwYWludCthK3RldHJhaGVkcm9uXG4gICAgICAvL1xuICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2MlxuICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICx8LFxuICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAsN2BgXFwnVkEsXG4gICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAsN2AgICB8LCBgJ1ZBLFxuICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICw3YCAgICAgYFxcICAgIGAnVkEsXG4gICAgICAvLyAgICAgICAgICAgICAgICAgICAgICw3YCAgICAgICAgfCwgICAgICBgJ1ZBLFxuICAgICAgLy8gICAgICAgICAgICAgICAgICAgLDdgICAgICAgICAgIGBcXCAgICAgICAgIGAnVkEsXG4gICAgICAvLyAgICAgICAgICAgICAgICAgLDdgICAgICAgICAgICAgIHwsICAgICAgICAgICBgJ1ZBLFxuICAgICAgLy8gICAgICAgICAgICAgICAsN2AgICAgICAgICAgICAgICBgXFwgICAgICAgLC4ub29PT1RLYCB2M1xuICAgICAgLy8gICAgICAgICAgICAgLDdgICAgICAgICAgICAgICAgICAgfCwub29PT1QnJ2AgICAgQVZcbiAgICAgIC8vICAgICAgICAgICAsN2AgICAgICAgICAgICAsLi5vb09PVGBcXGAgICAgICAgICAgIC83XG4gICAgICAvLyAgICAgICAgICw3YCAgICAgICwuLm9vT09UJydgICAgICAgfCwgICAgICAgICAgQVZcbiAgICAgIC8vICAgICAgICAsVCwuLm9vT09UJydgICAgICAgICAgICAgICBgXFwgICAgICAgICAvN1xuICAgICAgLy8gICAgIHYwIGAnVFRzLiwgICAgICAgICAgICAgICAgICAgICB8LCAgICAgICBBVlxuICAgICAgLy8gICAgICAgICAgICBgJ1RUcy4sICAgICAgICAgICAgICAgICBgXFwgICAgICAvN1xuICAgICAgLy8gICAgICAgICAgICAgICAgIGAnVFRzLiwgICAgICAgICAgICAgfCwgICAgQVZcbiAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgIGAnVFRzLiwgICAgICAgIGBcXCAgIC83XG4gICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgIGAnVFRzLiwgICAgfCwgQVZcbiAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJ1RUcy4sXFwvN1xuICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYCdUYFxuICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2MVxuICAgICAgLy9cbiAgICAgIHZhciBmYWNlcyA9IFtdO1xuICAgICAgaWYgKCgwLCBfZG90Mi5kZWZhdWx0KSh2My5wb2ludCwgbm9ybWFsKSAtIGRpc3RQTyA8IDApIHtcbiAgICAgICAgLy8gdGhlIGZhY2UgaXMgbm90IGFibGUgdG8gc2VlIHRoZSBwb2ludCBzbyBgcGxhbmVOb3JtYWxgXG4gICAgICAgIC8vIGlzIHBvaW50aW5nIG91dHNpZGUgdGhlIHRldHJhaGVkcm9uXG4gICAgICAgIGZhY2VzLnB1c2goX0ZhY2UyLmRlZmF1bHQuY3JlYXRlVHJpYW5nbGUodjAsIHYxLCB2MiksIF9GYWNlMi5kZWZhdWx0LmNyZWF0ZVRyaWFuZ2xlKHYzLCB2MSwgdjApLCBfRmFjZTIuZGVmYXVsdC5jcmVhdGVUcmlhbmdsZSh2MywgdjIsIHYxKSwgX0ZhY2UyLmRlZmF1bHQuY3JlYXRlVHJpYW5nbGUodjMsIHYwLCB2MikpO1xuXG4gICAgICAgIC8vIHNldCB0aGUgb3Bwb3NpdGUgZWRnZVxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgMzsgaSArPSAxKSB7XG4gICAgICAgICAgdmFyIF9qID0gKGkgKyAxKSAlIDM7XG4gICAgICAgICAgLy8gam9pbiBmYWNlW2ldIGkgPiAwLCB3aXRoIHRoZSBmaXJzdCBmYWNlXG4gICAgICAgICAgZmFjZXNbaSArIDFdLmdldEVkZ2UoMikuc2V0T3Bwb3NpdGUoZmFjZXNbMF0uZ2V0RWRnZShfaikpO1xuICAgICAgICAgIC8vIGpvaW4gZmFjZVtpXSB3aXRoIGZhY2VbaSArIDFdLCAxIDw9IGkgPD0gM1xuICAgICAgICAgIGZhY2VzW2kgKyAxXS5nZXRFZGdlKDEpLnNldE9wcG9zaXRlKGZhY2VzW19qICsgMV0uZ2V0RWRnZSgwKSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHRoZSBmYWNlIGlzIGFibGUgdG8gc2VlIHRoZSBwb2ludCBzbyBgcGxhbmVOb3JtYWxgXG4gICAgICAgIC8vIGlzIHBvaW50aW5nIGluc2lkZSB0aGUgdGV0cmFoZWRyb25cbiAgICAgICAgZmFjZXMucHVzaChfRmFjZTIuZGVmYXVsdC5jcmVhdGVUcmlhbmdsZSh2MCwgdjIsIHYxKSwgX0ZhY2UyLmRlZmF1bHQuY3JlYXRlVHJpYW5nbGUodjMsIHYwLCB2MSksIF9GYWNlMi5kZWZhdWx0LmNyZWF0ZVRyaWFuZ2xlKHYzLCB2MSwgdjIpLCBfRmFjZTIuZGVmYXVsdC5jcmVhdGVUcmlhbmdsZSh2MywgdjIsIHYwKSk7XG5cbiAgICAgICAgLy8gc2V0IHRoZSBvcHBvc2l0ZSBlZGdlXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCAzOyBpICs9IDEpIHtcbiAgICAgICAgICB2YXIgX2oyID0gKGkgKyAxKSAlIDM7XG4gICAgICAgICAgLy8gam9pbiBmYWNlW2ldIGkgPiAwLCB3aXRoIHRoZSBmaXJzdCBmYWNlXG4gICAgICAgICAgZmFjZXNbaSArIDFdLmdldEVkZ2UoMikuc2V0T3Bwb3NpdGUoZmFjZXNbMF0uZ2V0RWRnZSgoMyAtIGkpICUgMykpO1xuICAgICAgICAgIC8vIGpvaW4gZmFjZVtpXSB3aXRoIGZhY2VbaSArIDFdXG4gICAgICAgICAgZmFjZXNbaSArIDFdLmdldEVkZ2UoMCkuc2V0T3Bwb3NpdGUoZmFjZXNbX2oyICsgMV0uZ2V0RWRnZSgxKSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gdGhlIGluaXRpYWwgaHVsbCBpcyB0aGUgdGV0cmFoZWRyb25cbiAgICAgIGZvciAoaSA9IDA7IGkgPCA0OyBpICs9IDEpIHtcbiAgICAgICAgdGhpcy5mYWNlcy5wdXNoKGZhY2VzW2ldKTtcbiAgICAgIH1cblxuICAgICAgLy8gaW5pdGlhbCBhc3NpZ25tZW50IG9mIHZlcnRpY2VzIHRvIHRoZSBmYWNlcyBvZiB0aGUgdGV0cmFoZWRyb25cbiAgICAgIGZvciAoaSA9IDA7IGkgPCB2ZXJ0aWNlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB2YXIgdmVydGV4ID0gdmVydGljZXNbaV07XG4gICAgICAgIGlmICh2ZXJ0ZXggIT09IHYwICYmIHZlcnRleCAhPT0gdjEgJiYgdmVydGV4ICE9PSB2MyAmJiB2ZXJ0ZXggIT09IHYzKSB7XG4gICAgICAgICAgbWF4RGlzdGFuY2UgPSB0aGlzLnRvbGVyYW5jZTtcbiAgICAgICAgICB2YXIgbWF4RmFjZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgNDsgaiArPSAxKSB7XG4gICAgICAgICAgICB2YXIgZGlzdGFuY2UgPSBmYWNlc1tqXS5kaXN0YW5jZVRvUGxhbmUodmVydGV4LnBvaW50KTtcbiAgICAgICAgICAgIGlmIChkaXN0YW5jZSA+IG1heERpc3RhbmNlKSB7XG4gICAgICAgICAgICAgIG1heERpc3RhbmNlID0gZGlzdGFuY2U7XG4gICAgICAgICAgICAgIG1heEZhY2UgPSBmYWNlc1tqXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAobWF4RmFjZSkge1xuICAgICAgICAgICAgdGhpcy5hZGRWZXJ0ZXhUb0ZhY2UodmVydGV4LCBtYXhGYWNlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6ICdyZWluZGV4RmFjZUFuZFZlcnRpY2VzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVpbmRleEZhY2VBbmRWZXJ0aWNlcygpIHtcbiAgICAgIC8vIHJlbW92ZSBpbmFjdGl2ZSBmYWNlc1xuICAgICAgdmFyIGFjdGl2ZUZhY2VzID0gW107XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZmFjZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgdmFyIGZhY2UgPSB0aGlzLmZhY2VzW2ldO1xuICAgICAgICBpZiAoZmFjZS5tYXJrID09PSBfRmFjZS5WSVNJQkxFKSB7XG4gICAgICAgICAgYWN0aXZlRmFjZXMucHVzaChmYWNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5mYWNlcyA9IGFjdGl2ZUZhY2VzO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2NvbGxlY3RGYWNlcycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNvbGxlY3RGYWNlcyhza2lwVHJpYW5ndWxhdGlvbikge1xuICAgICAgdmFyIGZhY2VJbmRpY2VzID0gW107XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZmFjZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgaWYgKHRoaXMuZmFjZXNbaV0ubWFyayAhPT0gX0ZhY2UuVklTSUJMRSkge1xuICAgICAgICAgIHRocm93IEVycm9yKCdhdHRlbXB0IHRvIGluY2x1ZGUgYSBkZXN0cm95ZWQgZmFjZSBpbiB0aGUgaHVsbCcpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBpbmRpY2VzID0gdGhpcy5mYWNlc1tpXS5jb2xsZWN0SW5kaWNlcygpO1xuICAgICAgICBpZiAoc2tpcFRyaWFuZ3VsYXRpb24pIHtcbiAgICAgICAgICBmYWNlSW5kaWNlcy5wdXNoKGluZGljZXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgaW5kaWNlcy5sZW5ndGggLSAyOyBqICs9IDEpIHtcbiAgICAgICAgICAgIGZhY2VJbmRpY2VzLnB1c2goW2luZGljZXNbMF0sIGluZGljZXNbaiArIDFdLCBpbmRpY2VzW2ogKyAyXV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhY2VJbmRpY2VzO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZpbmRzIHRoZSBuZXh0IHZlcnRleCB0byBtYWtlIGZhY2VzIHdpdGggdGhlIGN1cnJlbnQgaHVsbFxuICAgICAqXG4gICAgICogLSBsZXQgYGZhY2VgIGJlIHRoZSBmaXJzdCBmYWNlIGV4aXN0aW5nIGluIHRoZSBgY2xhaW1lZGAgdmVydGV4IGxpc3RcbiAgICAgKiAgLSBpZiBgZmFjZWAgZG9lc24ndCBleGlzdCB0aGVuIHJldHVybiBzaW5jZSB0aGVyZSdyZSBubyB2ZXJ0aWNlcyBsZWZ0XG4gICAgICogIC0gb3RoZXJ3aXNlIGZvciBlYWNoIGB2ZXJ0ZXhgIHRoYXQgZmFjZSBzZWVzIGZpbmQgdGhlIG9uZSBmdXJ0aGVzdCBhd2F5XG4gICAgICogIGZyb20gYGZhY2VgXG4gICAgICpcbiAgICAgKiBAcmV0dXJuIHtWZXJ0ZXh8dW5kZWZpbmVkfSBSZXR1cm5zIHVuZGVmaW5lZCB3aGVuIHRoZXJlJ3JlIG5vIG1vcmVcbiAgICAgKiB2aXNpYmxlIHZlcnRpY2VzXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ25leHRWZXJ0ZXhUb0FkZCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG5leHRWZXJ0ZXhUb0FkZCgpIHtcbiAgICAgIGlmICghdGhpcy5jbGFpbWVkLmlzRW1wdHkoKSkge1xuICAgICAgICB2YXIgZXllVmVydGV4ID0gdW5kZWZpbmVkLFxuICAgICAgICAgICAgdmVydGV4ID0gdW5kZWZpbmVkO1xuICAgICAgICB2YXIgbWF4RGlzdGFuY2UgPSAwO1xuICAgICAgICB2YXIgZXllRmFjZSA9IHRoaXMuY2xhaW1lZC5maXJzdCgpLmZhY2U7XG4gICAgICAgIGZvciAodmVydGV4ID0gZXllRmFjZS5vdXRzaWRlOyB2ZXJ0ZXggJiYgdmVydGV4LmZhY2UgPT09IGV5ZUZhY2U7IHZlcnRleCA9IHZlcnRleC5uZXh0KSB7XG4gICAgICAgICAgdmFyIGRpc3RhbmNlID0gZXllRmFjZS5kaXN0YW5jZVRvUGxhbmUodmVydGV4LnBvaW50KTtcbiAgICAgICAgICBpZiAoZGlzdGFuY2UgPiBtYXhEaXN0YW5jZSkge1xuICAgICAgICAgICAgbWF4RGlzdGFuY2UgPSBkaXN0YW5jZTtcbiAgICAgICAgICAgIGV5ZVZlcnRleCA9IHZlcnRleDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGV5ZVZlcnRleDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb21wdXRlcyBhIGNoYWluIG9mIGhhbGYgZWRnZXMgaW4gY2N3IG9yZGVyIGNhbGxlZCB0aGUgYGhvcml6b25gLCBmb3IgYW5cbiAgICAgKiBlZGdlIHRvIGJlIHBhcnQgb2YgdGhlIGhvcml6b24gaXQgbXVzdCBqb2luIGEgZmFjZSB0aGF0IGNhbiBzZWVcbiAgICAgKiBgZXllUG9pbnRgIGFuZCBhIGZhY2UgdGhhdCBjYW5ub3Qgc2VlIGBleWVQb2ludGBcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7bnVtYmVyW119IGV5ZVBvaW50IC0gVGhlIGNvb3JkaW5hdGVzIG9mIGEgcG9pbnRcbiAgICAgKiBAcGFyYW0ge0hhbGZFZGdlfSBjcm9zc0VkZ2UgLSBUaGUgZWRnZSB1c2VkIHRvIGp1bXAgdG8gdGhlIGN1cnJlbnQgYGZhY2VgXG4gICAgICogQHBhcmFtIHtGYWNlfSBmYWNlIC0gVGhlIGN1cnJlbnQgZmFjZSBiZWluZyB0ZXN0ZWRcbiAgICAgKiBAcGFyYW0ge0hhbGZFZGdlW119IGhvcml6b24gLSBUaGUgZWRnZXMgdGhhdCBmb3JtIHBhcnQgb2YgdGhlIGhvcml6b24gaW5cbiAgICAgKiBjY3cgb3JkZXJcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAnY29tcHV0ZUhvcml6b24nLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjb21wdXRlSG9yaXpvbihleWVQb2ludCwgY3Jvc3NFZGdlLCBmYWNlLCBob3Jpem9uKSB7XG4gICAgICAvLyBtb3ZlcyBmYWNlJ3MgdmVydGljZXMgdG8gdGhlIGB1bmNsYWltZWRgIHZlcnRleCBsaXN0XG4gICAgICB0aGlzLmRlbGV0ZUZhY2VWZXJ0aWNlcyhmYWNlKTtcblxuICAgICAgZmFjZS5tYXJrID0gX0ZhY2UuREVMRVRFRDtcblxuICAgICAgdmFyIGVkZ2UgPSB1bmRlZmluZWQ7XG4gICAgICBpZiAoIWNyb3NzRWRnZSkge1xuICAgICAgICBlZGdlID0gY3Jvc3NFZGdlID0gZmFjZS5nZXRFZGdlKDApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gc3RhcnQgZnJvbSB0aGUgbmV4dCBlZGdlIHNpbmNlIGBjcm9zc0VkZ2VgIHdhcyBhbHJlYWR5IGFuYWx5emVkXG4gICAgICAgIC8vIChhY3R1YWxseSBgY3Jvc3NFZGdlLm9wcG9zaXRlYCB3YXMgdGhlIGZhY2Ugd2hvIGNhbGxlZCB0aGlzIG1ldGhvZFxuICAgICAgICAvLyByZWN1cnNpdmVseSlcbiAgICAgICAgZWRnZSA9IGNyb3NzRWRnZS5uZXh0O1xuICAgICAgfVxuXG4gICAgICAvLyBBbGwgdGhlIGZhY2VzIHRoYXQgYXJlIGFibGUgdG8gc2VlIGBleWVWZXJ0ZXhgIGFyZSBkZWZpbmVkIGFzIGZvbGxvd3NcbiAgICAgIC8vXG4gICAgICAvLyAgICAgICB2ICAgIC9cbiAgICAgIC8vICAgICAgICAgICAvIDw9PSB2aXNpYmxlIGZhY2VcbiAgICAgIC8vICAgICAgICAgIC9cbiAgICAgIC8vICAgICAgICAgfFxuICAgICAgLy8gICAgICAgICB8IDw9PSBub3QgdmlzaWJsZSBmYWNlXG4gICAgICAvL1xuICAgICAgLy8gIGRvdCh2LCB2aXNpYmxlIGZhY2Ugbm9ybWFsKSAtIHZpc2libGUgZmFjZSBvZmZzZXQgPiB0aGlzLnRvbGVyYW5jZVxuICAgICAgLy9cbiAgICAgIGRvIHtcbiAgICAgICAgdmFyIG9wcG9zaXRlRWRnZSA9IGVkZ2Uub3Bwb3NpdGU7XG4gICAgICAgIHZhciBvcHBvc2l0ZUZhY2UgPSBvcHBvc2l0ZUVkZ2UuZmFjZTtcbiAgICAgICAgaWYgKG9wcG9zaXRlRmFjZS5tYXJrID09PSBfRmFjZS5WSVNJQkxFKSB7XG4gICAgICAgICAgaWYgKG9wcG9zaXRlRmFjZS5kaXN0YW5jZVRvUGxhbmUoZXllUG9pbnQpID4gdGhpcy50b2xlcmFuY2UpIHtcbiAgICAgICAgICAgIHRoaXMuY29tcHV0ZUhvcml6b24oZXllUG9pbnQsIG9wcG9zaXRlRWRnZSwgb3Bwb3NpdGVGYWNlLCBob3Jpem9uKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaG9yaXpvbi5wdXNoKGVkZ2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlZGdlID0gZWRnZS5uZXh0O1xuICAgICAgfSB3aGlsZSAoZWRnZSAhPT0gY3Jvc3NFZGdlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgZmFjZSB3aXRoIHRoZSBwb2ludHMgYGV5ZVZlcnRleC5wb2ludGAsIGBob3Jpem9uRWRnZS50YWlsYCBhbmRcbiAgICAgKiBgaG9yaXpvbkVkZ2UudGFpbGAgaW4gY2N3IG9yZGVyXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1ZlcnRleH0gZXllVmVydGV4XG4gICAgICogQHBhcmFtIHtIYWxmRWRnZX0gaG9yaXpvbkVkZ2VcbiAgICAgKiBAcmV0dXJuIHtIYWxmRWRnZX0gVGhlIGhhbGYgZWRnZSB3aG9zZSB2ZXJ0ZXggaXMgdGhlIGV5ZVZlcnRleFxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6ICdhZGRBZGpvaW5pbmdGYWNlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWRkQWRqb2luaW5nRmFjZShleWVWZXJ0ZXgsIGhvcml6b25FZGdlKSB7XG4gICAgICAvLyBhbGwgdGhlIGhhbGYgZWRnZXMgYXJlIGNyZWF0ZWQgaW4gY2N3IG9yZGVyIHRodXMgdGhlIGZhY2UgaXMgYWx3YXlzXG4gICAgICAvLyBwb2ludGluZyBvdXRzaWRlIHRoZSBodWxsXG4gICAgICAvLyBlZGdlczpcbiAgICAgIC8vXG4gICAgICAvLyAgICAgICAgICAgICAgICAgIGV5ZVZlcnRleC5wb2ludFxuICAgICAgLy8gICAgICAgICAgICAgICAgICAgICAgIC8gXFxcbiAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgIC8gICBcXFxuICAgICAgLy8gICAgICAgICAgICAgICAgICAxICAvICAgICBcXCAgMFxuICAgICAgLy8gICAgICAgICAgICAgICAgICAgIC8gICAgICAgXFxcbiAgICAgIC8vICAgICAgICAgICAgICAgICAgIC8gICAgICAgICBcXFxuICAgICAgLy8gICAgICAgICAgICAgICAgICAvICAgICAgICAgICBcXFxuICAgICAgLy8gICAgICAgICAgaG9yaXpvbi50YWlsIC0tLSBob3Jpem9uLmhlYWRcbiAgICAgIC8vICAgICAgICAgICAgICAgICAgICAgICAgMlxuICAgICAgLy9cbiAgICAgIHZhciBmYWNlID0gX0ZhY2UyLmRlZmF1bHQuY3JlYXRlVHJpYW5nbGUoZXllVmVydGV4LCBob3Jpem9uRWRnZS50YWlsKCksIGhvcml6b25FZGdlLmhlYWQoKSk7XG4gICAgICB0aGlzLmZhY2VzLnB1c2goZmFjZSk7XG4gICAgICAvLyBqb2luIGZhY2UuZ2V0RWRnZSgtMSkgd2l0aCB0aGUgaG9yaXpvbidzIG9wcG9zaXRlIGVkZ2VcbiAgICAgIC8vIGZhY2UuZ2V0RWRnZSgtMSkgPSBmYWNlLmdldEVkZ2UoMilcbiAgICAgIGZhY2UuZ2V0RWRnZSgtMSkuc2V0T3Bwb3NpdGUoaG9yaXpvbkVkZ2Uub3Bwb3NpdGUpO1xuICAgICAgcmV0dXJuIGZhY2UuZ2V0RWRnZSgwKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGhvcml6b24ubGVuZ3RoIGZhY2VzIHRvIHRoZSBodWxsLCBlYWNoIGZhY2Ugd2lsbCBiZSAnbGlua2VkJyB3aXRoIHRoZVxuICAgICAqIGhvcml6b24gb3Bwb3NpdGUgZmFjZSBhbmQgdGhlIGZhY2Ugb24gdGhlIGxlZnQvcmlnaHRcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7VmVydGV4fSBleWVWZXJ0ZXhcbiAgICAgKiBAcGFyYW0ge0hhbGZFZGdlW119IGhvcml6b24gLSBBIGNoYWluIG9mIGhhbGYgZWRnZXMgaW4gY2N3IG9yZGVyXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ2FkZE5ld0ZhY2VzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWRkTmV3RmFjZXMoZXllVmVydGV4LCBob3Jpem9uKSB7XG4gICAgICB0aGlzLm5ld0ZhY2VzID0gW107XG4gICAgICB2YXIgZmlyc3RTaWRlRWRnZSA9IHVuZGVmaW5lZCxcbiAgICAgICAgICBwcmV2aW91c1NpZGVFZGdlID0gdW5kZWZpbmVkO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBob3Jpem9uLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIHZhciBob3Jpem9uRWRnZSA9IGhvcml6b25baV07XG4gICAgICAgIC8vIHJldHVybnMgdGhlIHJpZ2h0IHNpZGUgZWRnZVxuICAgICAgICB2YXIgc2lkZUVkZ2UgPSB0aGlzLmFkZEFkam9pbmluZ0ZhY2UoZXllVmVydGV4LCBob3Jpem9uRWRnZSk7XG4gICAgICAgIGlmICghZmlyc3RTaWRlRWRnZSkge1xuICAgICAgICAgIGZpcnN0U2lkZUVkZ2UgPSBzaWRlRWRnZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBqb2lucyBmYWNlLmdldEVkZ2UoMSkgd2l0aCBwcmV2aW91c0ZhY2UuZ2V0RWRnZSgwKVxuICAgICAgICAgIHNpZGVFZGdlLm5leHQuc2V0T3Bwb3NpdGUocHJldmlvdXNTaWRlRWRnZSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5uZXdGYWNlcy5wdXNoKHNpZGVFZGdlLmZhY2UpO1xuICAgICAgICBwcmV2aW91c1NpZGVFZGdlID0gc2lkZUVkZ2U7XG4gICAgICB9XG4gICAgICBmaXJzdFNpZGVFZGdlLm5leHQuc2V0T3Bwb3NpdGUocHJldmlvdXNTaWRlRWRnZSk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiAnZ2V0VHJpYW5ndWxhdGVkRmFjZXMnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBnZXRUcmlhbmd1bGF0ZWRGYWNlcygpIHtcbiAgICAgIHZhciBmYWNlcyA9IFtdO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmZhY2VzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGZhY2VzID0gZmFjZXMuY29uY2F0KHRoaXMuZmFjZXNbaV0udHJpYW5ndWxhdGUoKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFjZXM7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ29tcHV0ZXMgdGhlIGRpc3RhbmNlIGZyb20gYGVkZ2VgIG9wcG9zaXRlIGZhY2UncyBjZW50cm9pZCB0b1xuICAgICAqIGBlZGdlLmZhY2VgXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0hhbGZFZGdlfSBlZGdlXG4gICAgICogQHJldHVybiB7bnVtYmVyfVxuICAgICAqIC0gQSBwb3NpdGl2ZSBudW1iZXIgd2hlbiB0aGUgY2VudHJvaWQgb2YgdGhlIG9wcG9zaXRlIGZhY2UgaXMgYWJvdmUgdGhlXG4gICAgICogICBmYWNlIGkuZS4gd2hlbiB0aGUgZmFjZXMgYXJlIGNvbmNhdmVcbiAgICAgKiAtIEEgbmVnYXRpdmUgbnVtYmVyIHdoZW4gdGhlIGNlbnRyb2lkIG9mIHRoZSBvcHBvc2l0ZSBmYWNlIGlzIGJlbG93IHRoZVxuICAgICAqICAgZmFjZSBpLmUuIHdoZW4gdGhlIGZhY2VzIGFyZSBjb252ZXhcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiAnb3Bwb3NpdGVGYWNlRGlzdGFuY2UnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBvcHBvc2l0ZUZhY2VEaXN0YW5jZShlZGdlKSB7XG4gICAgICByZXR1cm4gZWRnZS5mYWNlLmRpc3RhbmNlVG9QbGFuZShlZGdlLm9wcG9zaXRlLmZhY2UuY2VudHJvaWQpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1lcmdlcyBhIGZhY2Ugd2l0aCBub25lL2FueS9hbGwgaXRzIG5laWdoYm9ycyBhY2NvcmRpbmcgdG8gdGhlIHN0cmF0ZWd5XG4gICAgICogdXNlZFxuICAgICAqXG4gICAgICogaWYgYG1lcmdlVHlwZWAgaXMgTUVSR0VfTk9OX0NPTlZFWF9XUlRfTEFSR0VSX0ZBQ0UgdGhlbiB0aGUgbWVyZ2Ugd2lsbCBiZVxuICAgICAqIGRlY2lkZWQgYmFzZWQgb24gdGhlIGZhY2Ugd2l0aCB0aGUgbGFyZ2VyIGFyZWEsIHRoZSBjZW50cm9pZCBvZiB0aGUgZmFjZVxuICAgICAqIHdpdGggdGhlIHNtYWxsZXIgYXJlYSB3aWxsIGJlIGNoZWNrZWQgYWdhaW5zdCB0aGUgb25lIHdpdGggdGhlIGxhcmdlciBhcmVhXG4gICAgICogdG8gc2VlIGlmIGl0J3MgaW4gdGhlIG1lcmdlIHJhbmdlIFt0b2xlcmFuY2UsIC10b2xlcmFuY2VdIGkuZS5cbiAgICAgKlxuICAgICAqICAgIGRvdChjZW50cm9pZCBzbWFsbGVyIGZhY2UsIGxhcmdlciBmYWNlIG5vcm1hbCkgLSBsYXJnZXIgZmFjZSBvZmZzZXQgPiAtdG9sZXJhbmNlXG4gICAgICpcbiAgICAgKiBOb3RlIHRoYXQgdGhlIGZpcnN0IGNoZWNrICh3aXRoICt0b2xlcmFuY2UpIHdhcyBkb25lIG9uIGBjb21wdXRlSG9yaXpvbmBcbiAgICAgKlxuICAgICAqIElmIHRoZSBhYm92ZSBpcyBub3QgdHJ1ZSB0aGVuIHRoZSBjaGVjayBpcyBkb25lIHdpdGggcmVzcGVjdCB0byB0aGUgc21hbGxlclxuICAgICAqIGZhY2UgaS5lLlxuICAgICAqXG4gICAgICogICAgZG90KGNlbnRyb2lkIGxhcmdlciBmYWNlLCBzbWFsbGVyIGZhY2Ugbm9ybWFsKSAtIHNtYWxsZXIgZmFjZSBvZmZzZXQgPiAtdG9sZXJhbmNlXG4gICAgICpcbiAgICAgKiBJZiB0cnVlIHRoZW4gaXQgbWVhbnMgdGhhdCB0d28gZmFjZXMgYXJlIG5vbiBjb252ZXggKGNvbmNhdmUpLCBldmVuIGlmIHRoZVxuICAgICAqIGRvdCguLi4pIC0gb2Zmc2V0IHZhbHVlIGlzID4gMCAodGhhdCdzIHRoZSBwb2ludCBvZiBkb2luZyB0aGUgbWVyZ2UgaW4gdGhlXG4gICAgICogZmlyc3QgcGxhY2UpXG4gICAgICpcbiAgICAgKiBJZiB0d28gZmFjZXMgYXJlIGNvbmNhdmUgdGhlbiB0aGUgY2hlY2sgbXVzdCBhbHNvIGJlIGRvbmUgb24gdGhlIG90aGVyIGZhY2VcbiAgICAgKiBidXQgdGhpcyBpcyBkb25lIGluIGFub3RoZXIgbWVyZ2UgcGFzcywgZm9yIHRoaXMgdG8gaGFwcGVuIHRoZSBmYWNlIGlzXG4gICAgICogbWFya2VkIGluIGEgdGVtcG9yYWwgTk9OX0NPTlZFWCBzdGF0ZVxuICAgICAqXG4gICAgICogaWYgYG1lcmdlVHlwZWAgaXMgTUVSR0VfTk9OX0NPTlZFWCB0aGVuIHR3byBmYWNlcyB3aWxsIGJlIG1lcmdlZCBvbmx5IGlmXG4gICAgICogdGhleSBwYXNzIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uc1xuICAgICAqXG4gICAgICogICAgZG90KGNlbnRyb2lkIHNtYWxsZXIgZmFjZSwgbGFyZ2VyIGZhY2Ugbm9ybWFsKSAtIGxhcmdlciBmYWNlIG9mZnNldCA+IC10b2xlcmFuY2VcbiAgICAgKiAgICBkb3QoY2VudHJvaWQgbGFyZ2VyIGZhY2UsIHNtYWxsZXIgZmFjZSBub3JtYWwpIC0gc21hbGxlciBmYWNlIG9mZnNldCA+IC10b2xlcmFuY2VcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RmFjZX0gZmFjZVxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBtZXJnZVR5cGUgLSBFaXRoZXIgTUVSR0VfTk9OX0NPTlZFWF9XUlRfTEFSR0VSX0ZBQ0Ugb3JcbiAgICAgKiBNRVJHRV9OT05fQ09OVkVYXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ2RvQWRqYWNlbnRNZXJnZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRvQWRqYWNlbnRNZXJnZShmYWNlLCBtZXJnZVR5cGUpIHtcbiAgICAgIHZhciBlZGdlID0gZmFjZS5lZGdlO1xuICAgICAgdmFyIGNvbnZleCA9IHRydWU7XG4gICAgICB2YXIgaXQgPSAwO1xuICAgICAgZG8ge1xuICAgICAgICBpZiAoaXQgPj0gZmFjZS5uVmVydGljZXMpIHtcbiAgICAgICAgICB0aHJvdyBFcnJvcignbWVyZ2UgcmVjdXJzaW9uIGxpbWl0IGV4Y2VlZGVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG9wcG9zaXRlRmFjZSA9IGVkZ2Uub3Bwb3NpdGUuZmFjZTtcbiAgICAgICAgdmFyIG1lcmdlID0gZmFsc2U7XG5cbiAgICAgICAgLy8gSW1wb3J0YW50IG5vdGVzIGFib3V0IHRoZSBhbGdvcml0aG0gdG8gbWVyZ2UgZmFjZXNcbiAgICAgICAgLy9cbiAgICAgICAgLy8gLSBHaXZlbiBhIHZlcnRleCBgZXllVmVydGV4YCB0aGF0IHdpbGwgYmUgYWRkZWQgdG8gdGhlIGh1bGxcbiAgICAgICAgLy8gICBhbGwgdGhlIGZhY2VzIHRoYXQgY2Fubm90IHNlZSBgZXllVmVydGV4YCBhcmUgZGVmaW5lZCBhcyBmb2xsb3dzXG4gICAgICAgIC8vXG4gICAgICAgIC8vICAgICAgZG90KHYsIG5vdCB2aXNpYmxlIGZhY2Ugbm9ybWFsKSAtIG5vdCB2aXNpYmxlIG9mZnNldCA8IHRvbGVyYW5jZVxuICAgICAgICAvL1xuICAgICAgICAvLyAtIFR3byBmYWNlcyBjYW4gYmUgbWVyZ2VkIHdoZW4gdGhlIGNlbnRyb2lkIG9mIG9uZSBvZiB0aGVzZSBmYWNlc1xuICAgICAgICAvLyBwcm9qZWN0ZWQgdG8gdGhlIG5vcm1hbCBvZiB0aGUgb3RoZXIgZmFjZSBtaW51cyB0aGUgb3RoZXIgZmFjZSBvZmZzZXRcbiAgICAgICAgLy8gaXMgaW4gdGhlIHJhbmdlIFt0b2xlcmFuY2UsIC10b2xlcmFuY2VdXG4gICAgICAgIC8vIC0gU2luY2UgYGZhY2VgIChnaXZlbiBpbiB0aGUgaW5wdXQgZm9yIHRoaXMgbWV0aG9kKSBoYXMgcGFzc2VkIHRoZVxuICAgICAgICAvLyBjaGVjayBhYm92ZSB3ZSBvbmx5IGhhdmUgdG8gY2hlY2sgdGhlIGxvd2VyIGJvdW5kIGUuZy5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gICAgICBkb3Qodiwgbm90IHZpc2libGUgZmFjZSBub3JtYWwpIC0gbm90IHZpc2libGUgb2Zmc2V0ID4gLXRvbGVyYW5jZVxuICAgICAgICAvL1xuICAgICAgICBpZiAobWVyZ2VUeXBlID09PSBNRVJHRV9OT05fQ09OVkVYKSB7XG4gICAgICAgICAgaWYgKHRoaXMub3Bwb3NpdGVGYWNlRGlzdGFuY2UoZWRnZSkgPiAtdGhpcy50b2xlcmFuY2UgfHwgdGhpcy5vcHBvc2l0ZUZhY2VEaXN0YW5jZShlZGdlLm9wcG9zaXRlKSA+IC10aGlzLnRvbGVyYW5jZSkge1xuICAgICAgICAgICAgbWVyZ2UgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoZmFjZS5hcmVhID4gb3Bwb3NpdGVGYWNlLmFyZWEpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm9wcG9zaXRlRmFjZURpc3RhbmNlKGVkZ2UpID4gLXRoaXMudG9sZXJhbmNlKSB7XG4gICAgICAgICAgICAgIG1lcmdlID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5vcHBvc2l0ZUZhY2VEaXN0YW5jZShlZGdlLm9wcG9zaXRlKSA+IC10aGlzLnRvbGVyYW5jZSkge1xuICAgICAgICAgICAgICBjb252ZXggPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMub3Bwb3NpdGVGYWNlRGlzdGFuY2UoZWRnZS5vcHBvc2l0ZSkgPiAtdGhpcy50b2xlcmFuY2UpIHtcbiAgICAgICAgICAgICAgbWVyZ2UgPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLm9wcG9zaXRlRmFjZURpc3RhbmNlKGVkZ2UpID4gLXRoaXMudG9sZXJhbmNlKSB7XG4gICAgICAgICAgICAgIGNvbnZleCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChtZXJnZSkge1xuICAgICAgICAgICAgZGVidWcubG9nZ2VyKCdmYWNlIG1lcmdlJyk7XG4gICAgICAgICAgICAvLyB3aGVuIHR3byBmYWNlcyBhcmUgbWVyZ2VkIGl0IG1pZ2h0IGJlIHBvc3NpYmxlIHRoYXQgcmVkdW5kYW50IGZhY2VzXG4gICAgICAgICAgICAvLyBhcmUgZGVzdHJveWVkLCBpbiB0aGF0IGNhc2UgbW92ZSBhbGwgdGhlIHZpc2libGUgdmVydGljZXMgZnJvbSB0aGVcbiAgICAgICAgICAgIC8vIGRlc3Ryb3llZCBmYWNlcyB0byB0aGUgYHVuY2xhaW1lZGAgdmVydGV4IGxpc3RcbiAgICAgICAgICAgIHZhciBkaXNjYXJkZWRGYWNlcyA9IGZhY2UubWVyZ2VBZGphY2VudEZhY2VzKGVkZ2UsIFtdKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGlzY2FyZGVkRmFjZXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgdGhpcy5kZWxldGVGYWNlVmVydGljZXMoZGlzY2FyZGVkRmFjZXNbaV0sIGZhY2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVkZ2UgPSBlZGdlLm5leHQ7XG4gICAgICAgIGl0ICs9IDE7XG4gICAgICB9IHdoaWxlIChlZGdlICE9PSBmYWNlLmVkZ2UpO1xuICAgICAgaWYgKCFjb252ZXgpIHtcbiAgICAgICAgZmFjZS5tYXJrID0gX0ZhY2UuTk9OX0NPTlZFWDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgdmVydGV4IHRvIHRoZSBodWxsIHdpdGggdGhlIGZvbGxvd2luZyBhbGdvcml0aG1cbiAgICAgKlxuICAgICAqIC0gQ29tcHV0ZSB0aGUgYGhvcml6b25gIHdoaWNoIGlzIGEgY2hhaW4gb2YgaGFsZiBlZGdlcywgZm9yIGFuIGVkZ2UgdG9cbiAgICAgKiAgIGJlbG9uZyB0byB0aGlzIGdyb3VwIGl0IG11c3QgYmUgdGhlIGVkZ2UgY29ubmVjdGluZyBhIGZhY2UgdGhhdCBjYW5cbiAgICAgKiAgIHNlZSBgZXllVmVydGV4YCBhbmQgYSBmYWNlIHdoaWNoIGNhbm5vdCBzZWUgYGV5ZVZlcnRleGBcbiAgICAgKiAtIEFsbCB0aGUgZmFjZXMgdGhhdCBjYW4gc2VlIGBleWVWZXJ0ZXhgIGhhdmUgaXRzIHZpc2libGUgdmVydGljZXMgcmVtb3ZlZFxuICAgICAqICAgZnJvbSB0aGUgY2xhaW1lZCBWZXJ0ZXhMaXN0XG4gICAgICogLSBBIG5ldyBzZXQgb2YgZmFjZXMgaXMgY3JlYXRlZCB3aXRoIGVhY2ggZWRnZSBvZiB0aGUgYGhvcml6b25gIGFuZFxuICAgICAqICAgYGV5ZVZlcnRleGAsIGVhY2ggZmFjZSBpcyBjb25uZWN0ZWQgd2l0aCB0aGUgb3Bwb3NpdGUgaG9yaXpvbiBmYWNlIGFuZFxuICAgICAqICAgdGhlIGZhY2Ugb24gdGhlIGxlZnQvcmlnaHRcbiAgICAgKiAtIFRoZSBuZXcgZmFjZXMgYXJlIG1lcmdlZCBpZiBwb3NzaWJsZSB3aXRoIHRoZSBvcHBvc2l0ZSBob3Jpem9uIGZhY2UgZmlyc3RcbiAgICAgKiAgIGFuZCB0aGVuIHRoZSBmYWNlcyBvbiB0aGUgcmlnaHQvbGVmdFxuICAgICAqIC0gVGhlIHZlcnRpY2VzIHJlbW92ZWQgZnJvbSBhbGwgdGhlIHZpc2libGUgZmFjZXMgYXJlIGFzc2lnbmVkIHRvIHRoZSBuZXdcbiAgICAgKiAgIGZhY2VzIGlmIHBvc3NpYmxlXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1ZlcnRleH0gZXllVmVydGV4XG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogJ2FkZFZlcnRleFRvSHVsbCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGFkZFZlcnRleFRvSHVsbChleWVWZXJ0ZXgpIHtcbiAgICAgIHZhciBob3Jpem9uID0gW107XG5cbiAgICAgIHRoaXMudW5jbGFpbWVkLmNsZWFyKCk7XG5cbiAgICAgIC8vIHJlbW92ZSBgZXllVmVydGV4YCBmcm9tIGBleWVWZXJ0ZXguZmFjZWAgc28gdGhhdCBpdCBjYW4ndCBiZSBhZGRlZCB0byB0aGVcbiAgICAgIC8vIGB1bmNsYWltZWRgIHZlcnRleCBsaXN0XG4gICAgICB0aGlzLnJlbW92ZVZlcnRleEZyb21GYWNlKGV5ZVZlcnRleCwgZXllVmVydGV4LmZhY2UpO1xuICAgICAgdGhpcy5jb21wdXRlSG9yaXpvbihleWVWZXJ0ZXgucG9pbnQsIG51bGwsIGV5ZVZlcnRleC5mYWNlLCBob3Jpem9uKTtcbiAgICAgIGRlYnVnKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5sb2coJ2hvcml6b24gJWonLCBob3Jpem9uLm1hcChmdW5jdGlvbiAoZWRnZSkge1xuICAgICAgICAgIHJldHVybiBlZGdlLmhlYWQoKS5pbmRleDtcbiAgICAgICAgfSkpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLmFkZE5ld0ZhY2VzKGV5ZVZlcnRleCwgaG9yaXpvbik7XG5cbiAgICAgIGRlYnVnLmxvZ2dlcignZmlyc3QgbWVyZ2UnKTtcblxuICAgICAgLy8gZmlyc3QgbWVyZ2UgcGFzc1xuICAgICAgLy8gRG8gdGhlIG1lcmdlIHdpdGggcmVzcGVjdCB0byB0aGUgbGFyZ2VyIGZhY2VcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5uZXdGYWNlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB2YXIgZmFjZSA9IHRoaXMubmV3RmFjZXNbaV07XG4gICAgICAgIGlmIChmYWNlLm1hcmsgPT09IF9GYWNlLlZJU0lCTEUpIHtcbiAgICAgICAgICB3aGlsZSAodGhpcy5kb0FkamFjZW50TWVyZ2UoZmFjZSwgTUVSR0VfTk9OX0NPTlZFWF9XUlRfTEFSR0VSX0ZBQ0UpKSB7fVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGRlYnVnLmxvZ2dlcignc2Vjb25kIG1lcmdlJyk7XG5cbiAgICAgIC8vIHNlY29uZCBtZXJnZSBwYXNzXG4gICAgICAvLyBEbyB0aGUgbWVyZ2Ugb24gbm9uIGNvbnZleCBmYWNlcyAoYSBmYWNlIGlzIG1hcmtlZCBhcyBub24gY29udmV4IGluIHRoZVxuICAgICAgLy8gZmlyc3QgcGFzcylcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5uZXdGYWNlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICB2YXIgZmFjZSA9IHRoaXMubmV3RmFjZXNbaV07XG4gICAgICAgIGlmIChmYWNlLm1hcmsgPT09IF9GYWNlLk5PTl9DT05WRVgpIHtcbiAgICAgICAgICBmYWNlLm1hcmsgPSBfRmFjZS5WSVNJQkxFO1xuICAgICAgICAgIHdoaWxlICh0aGlzLmRvQWRqYWNlbnRNZXJnZShmYWNlLCBNRVJHRV9OT05fQ09OVkVYKSkge31cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBkZWJ1Zy5sb2dnZXIoJ3JlYXNzaWduaW5nIHBvaW50cyB0byBuZXdGYWNlcycpO1xuICAgICAgLy8gcmVhc3NpZ24gYHVuY2xhaW1lZGAgdmVydGljZXMgdG8gdGhlIG5ldyBmYWNlc1xuICAgICAgdGhpcy5yZXNvbHZlVW5jbGFpbWVkUG9pbnRzKHRoaXMubmV3RmFjZXMpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogJ2J1aWxkJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gYnVpbGQoKSB7XG4gICAgICB2YXIgaXRlcmF0aW9ucyA9IDA7XG4gICAgICB2YXIgZXllVmVydGV4ID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5jcmVhdGVJbml0aWFsU2ltcGxleCgpO1xuICAgICAgd2hpbGUgKGV5ZVZlcnRleCA9IHRoaXMubmV4dFZlcnRleFRvQWRkKCkpIHtcbiAgICAgICAgaXRlcmF0aW9ucyArPSAxO1xuICAgICAgICBkZWJ1Zy5sb2dnZXIoJz09IGl0ZXJhdGlvbiAlaiA9PScsIGl0ZXJhdGlvbnMpO1xuICAgICAgICBkZWJ1Zy5sb2dnZXIoJ25leHQgdmVydGV4IHRvIGFkZCA9ICVkICVqJywgZXllVmVydGV4LmluZGV4LCBleWVWZXJ0ZXgucG9pbnQpO1xuICAgICAgICB0aGlzLmFkZFZlcnRleFRvSHVsbChleWVWZXJ0ZXgpO1xuICAgICAgICBkZWJ1Zy5sb2dnZXIoJ2VuZCcpO1xuICAgICAgfVxuICAgICAgdGhpcy5yZWluZGV4RmFjZUFuZFZlcnRpY2VzKCk7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIFF1aWNrSHVsbDtcbn0pKCk7XG5cbmV4cG9ydHMuZGVmYXVsdCA9IFF1aWNrSHVsbDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIlwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7IH0gfVxuXG52YXIgVmVydGV4ID0gZnVuY3Rpb24gVmVydGV4KHBvaW50LCBpbmRleCkge1xuICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgVmVydGV4KTtcblxuICB0aGlzLnBvaW50ID0gcG9pbnQ7XG4gIC8vIGluZGV4IGluIHRoZSBpbnB1dCBhcnJheVxuICB0aGlzLmluZGV4ID0gaW5kZXg7XG4gIC8vIHZlcnRleCBpcyBhIGRvdWJsZSBsaW5rZWQgbGlzdCBub2RlXG4gIHRoaXMubmV4dCA9IG51bGw7XG4gIHRoaXMucHJldiA9IG51bGw7XG4gIC8vIHRoZSBmYWNlIHRoYXQgaXMgYWJsZSB0byBzZWUgdGhpcyBwb2ludFxuICB0aGlzLmZhY2UgPSBudWxsO1xufTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gVmVydGV4O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpOyB9IH1cblxudmFyIFZlcnRleExpc3QgPSAoZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBWZXJ0ZXhMaXN0KCkge1xuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBWZXJ0ZXhMaXN0KTtcblxuICAgIHRoaXMuaGVhZCA9IG51bGw7XG4gICAgdGhpcy50YWlsID0gbnVsbDtcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhWZXJ0ZXhMaXN0LCBbe1xuICAgIGtleTogXCJjbGVhclwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBjbGVhcigpIHtcbiAgICAgIHRoaXMuaGVhZCA9IHRoaXMudGFpbCA9IG51bGw7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5zZXJ0cyBhIGBub2RlYCBiZWZvcmUgYHRhcmdldGAsIGl0J3MgYXNzdW1lZCB0aGF0XG4gICAgICogYHRhcmdldGAgYmVsb25ncyB0byB0aGlzIGRvdWJseSBsaW5rZWQgbGlzdFxuICAgICAqXG4gICAgICogQHBhcmFtIHsqfSB0YXJnZXRcbiAgICAgKiBAcGFyYW0geyp9IG5vZGVcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImluc2VydEJlZm9yZVwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBpbnNlcnRCZWZvcmUodGFyZ2V0LCBub2RlKSB7XG4gICAgICBub2RlLnByZXYgPSB0YXJnZXQucHJldjtcbiAgICAgIG5vZGUubmV4dCA9IHRhcmdldDtcbiAgICAgIGlmICghbm9kZS5wcmV2KSB7XG4gICAgICAgIHRoaXMuaGVhZCA9IG5vZGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBub2RlLnByZXYubmV4dCA9IG5vZGU7XG4gICAgICB9XG4gICAgICB0YXJnZXQucHJldiA9IG5vZGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5zZXJ0cyBhIGBub2RlYCBhZnRlciBgdGFyZ2V0YCwgaXQncyBhc3N1bWVkIHRoYXRcbiAgICAgKiBgdGFyZ2V0YCBiZWxvbmdzIHRvIHRoaXMgZG91Ymx5IGxpbmtlZCBsaXN0XG4gICAgICpcbiAgICAgKiBAcGFyYW0ge1ZlcnRleH0gdGFyZ2V0XG4gICAgICogQHBhcmFtIHtWZXJ0ZXh9IG5vZGVcbiAgICAgKi9cblxuICB9LCB7XG4gICAga2V5OiBcImluc2VydEFmdGVyXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGluc2VydEFmdGVyKHRhcmdldCwgbm9kZSkge1xuICAgICAgbm9kZS5wcmV2ID0gdGFyZ2V0O1xuICAgICAgbm9kZS5uZXh0ID0gdGFyZ2V0Lm5leHQ7XG4gICAgICBpZiAoIW5vZGUubmV4dCkge1xuICAgICAgICB0aGlzLnRhaWwgPSBub2RlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbm9kZS5uZXh0LnByZXYgPSBub2RlO1xuICAgICAgfVxuICAgICAgdGFyZ2V0Lm5leHQgPSBub2RlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFwcGVuZHMgYSBgbm9kZWAgdG8gdGhlIGVuZCBvZiB0aGlzIGRvdWJseSBsaW5rZWQgbGlzdFxuICAgICAqIE5vdGU6IGBub2RlLm5leHRgIHdpbGwgYmUgdW5saW5rZWQgZnJvbSBgbm9kZWBcbiAgICAgKiBOb3RlOiBpZiBgbm9kZWAgaXMgcGFydCBvZiBhbm90aGVyIGxpbmtlZCBsaXN0IGNhbGwgYGFkZEFsbGAgaW5zdGVhZFxuICAgICAqXG4gICAgICogQHBhcmFtIHsqfSBub2RlXG4gICAgICovXG5cbiAgfSwge1xuICAgIGtleTogXCJhZGRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWRkKG5vZGUpIHtcbiAgICAgIGlmICghdGhpcy5oZWFkKSB7XG4gICAgICAgIHRoaXMuaGVhZCA9IG5vZGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnRhaWwubmV4dCA9IG5vZGU7XG4gICAgICB9XG4gICAgICBub2RlLnByZXYgPSB0aGlzLnRhaWw7XG4gICAgICAvLyBzaW5jZSBub2RlIGlzIHRoZSBuZXcgZW5kIGl0IGRvZXNuJ3QgaGF2ZSBhIG5leHQgbm9kZVxuICAgICAgbm9kZS5uZXh0ID0gbnVsbDtcbiAgICAgIHRoaXMudGFpbCA9IG5vZGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQXBwZW5kcyBhIGNoYWluIG9mIG5vZGVzIHdoZXJlIGBub2RlYCBpcyB0aGUgaGVhZCxcbiAgICAgKiB0aGUgZGlmZmVyZW5jZSB3aXRoIGBhZGRgIGlzIHRoYXQgaXQgY29ycmVjdGx5IHNldHMgdGhlIHBvc2l0aW9uXG4gICAgICogb2YgdGhlIG5vZGUgbGlzdCBgdGFpbGAgcHJvcGVydHlcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7Kn0gbm9kZVxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwiYWRkQWxsXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGFkZEFsbChub2RlKSB7XG4gICAgICBpZiAoIXRoaXMuaGVhZCkge1xuICAgICAgICB0aGlzLmhlYWQgPSBub2RlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy50YWlsLm5leHQgPSBub2RlO1xuICAgICAgfVxuICAgICAgbm9kZS5wcmV2ID0gdGhpcy50YWlsO1xuXG4gICAgICAvLyBmaW5kIHRoZSBlbmQgb2YgdGhlIGxpc3RcbiAgICAgIHdoaWxlIChub2RlLm5leHQpIHtcbiAgICAgICAgbm9kZSA9IG5vZGUubmV4dDtcbiAgICAgIH1cbiAgICAgIHRoaXMudGFpbCA9IG5vZGU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGVsZXRlcyBhIGBub2RlYCBmcm9tIHRoaXMgbGlua2VkIGxpc3QsIGl0J3MgYXNzdW1lZCB0aGF0IGBub2RlYCBpcyBhXG4gICAgICogbWVtYmVyIG9mIHRoaXMgbGlua2VkIGxpc3RcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7Kn0gbm9kZVxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwicmVtb3ZlXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHJlbW92ZShub2RlKSB7XG4gICAgICBpZiAoIW5vZGUucHJldikge1xuICAgICAgICB0aGlzLmhlYWQgPSBub2RlLm5leHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBub2RlLnByZXYubmV4dCA9IG5vZGUubmV4dDtcbiAgICAgIH1cblxuICAgICAgaWYgKCFub2RlLm5leHQpIHtcbiAgICAgICAgdGhpcy50YWlsID0gbm9kZS5wcmV2O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbm9kZS5uZXh0LnByZXYgPSBub2RlLnByZXY7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhIGNoYWluIG9mIG5vZGVzIHdob3NlIGhlYWQgaXMgYGFgIGFuZCB3aG9zZSB0YWlsIGlzIGBiYCxcbiAgICAgKiBpdCdzIGFzc3VtZWQgdGhhdCBgYWAgYW5kIGBiYCBiZWxvbmcgdG8gdGhpcyBsaXN0IGFuZCBhbHNvIHRoYXQgYGFgXG4gICAgICogY29tZXMgYmVmb3JlIGBiYCBpbiB0aGUgbGlua2VkIGxpc3RcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7Kn0gYVxuICAgICAqIEBwYXJhbSB7Kn0gYlxuICAgICAqL1xuXG4gIH0sIHtcbiAgICBrZXk6IFwicmVtb3ZlQ2hhaW5cIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlQ2hhaW4oYSwgYikge1xuICAgICAgaWYgKCFhLnByZXYpIHtcbiAgICAgICAgdGhpcy5oZWFkID0gYi5uZXh0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYS5wcmV2Lm5leHQgPSBiLm5leHQ7XG4gICAgICB9XG5cbiAgICAgIGlmICghYi5uZXh0KSB7XG4gICAgICAgIHRoaXMudGFpbCA9IGEucHJldjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGIubmV4dC5wcmV2ID0gYS5wcmV2O1xuICAgICAgfVxuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJmaXJzdFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBmaXJzdCgpIHtcbiAgICAgIHJldHVybiB0aGlzLmhlYWQ7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImlzRW1wdHlcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gaXNFbXB0eSgpIHtcbiAgICAgIHJldHVybiAhdGhpcy5oZWFkO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBWZXJ0ZXhMaXN0O1xufSkoKTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gVmVydGV4TGlzdDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gZnVuY3Rpb24gKG5zKSB7XG4gIHZhciBsb2dnZXIgPSAoMCwgX2RlYnVnMi5kZWZhdWx0KShucyk7XG4gIHZhciBzY29wZSA9IHsgbG9nOiBsb2dnZXIgfTtcbiAgZnVuY3Rpb24gaW50ZXJuYWwoZm4pIHtcbiAgICBpZiAoX2RlYnVnMi5kZWZhdWx0LmVuYWJsZWQobnMpKSB7XG4gICAgICBmbi5jYWxsKHNjb3BlLCBsb2dnZXIpO1xuICAgIH1cbiAgfVxuICBpbnRlcm5hbC5sb2dnZXIgPSBsb2dnZXI7XG4gIHJldHVybiBpbnRlcm5hbDtcbn07XG5cbnZhciBfZGVidWcgPSByZXF1aXJlKCdkZWJ1ZycpO1xuXG52YXIgX2RlYnVnMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2RlYnVnKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiLyoqXG4gKiBIZWxwZXJzLlxuICovXG5cbnZhciBzID0gMTAwMFxudmFyIG0gPSBzICogNjBcbnZhciBoID0gbSAqIDYwXG52YXIgZCA9IGggKiAyNFxudmFyIHkgPSBkICogMzY1LjI1XG5cbi8qKlxuICogUGFyc2Ugb3IgZm9ybWF0IHRoZSBnaXZlbiBgdmFsYC5cbiAqXG4gKiBPcHRpb25zOlxuICpcbiAqICAtIGBsb25nYCB2ZXJib3NlIGZvcm1hdHRpbmcgW2ZhbHNlXVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE51bWJlcn0gdmFsXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHRocm93cyB7RXJyb3J9IHRocm93IGFuIGVycm9yIGlmIHZhbCBpcyBub3QgYSBub24tZW1wdHkgc3RyaW5nIG9yIGEgbnVtYmVyXG4gKiBAcmV0dXJuIHtTdHJpbmd8TnVtYmVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh2YWwsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsXG4gIGlmICh0eXBlID09PSAnc3RyaW5nJyAmJiB2YWwubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiBwYXJzZSh2YWwpXG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gJ251bWJlcicgJiYgaXNOYU4odmFsKSA9PT0gZmFsc2UpIHtcbiAgICByZXR1cm4gb3B0aW9ucy5sb25nID9cblx0XHRcdGZtdExvbmcodmFsKSA6XG5cdFx0XHRmbXRTaG9ydCh2YWwpXG4gIH1cbiAgdGhyb3cgbmV3IEVycm9yKCd2YWwgaXMgbm90IGEgbm9uLWVtcHR5IHN0cmluZyBvciBhIHZhbGlkIG51bWJlci4gdmFsPScgKyBKU09OLnN0cmluZ2lmeSh2YWwpKVxufVxuXG4vKipcbiAqIFBhcnNlIHRoZSBnaXZlbiBgc3RyYCBhbmQgcmV0dXJuIG1pbGxpc2Vjb25kcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZShzdHIpIHtcbiAgc3RyID0gU3RyaW5nKHN0cilcbiAgaWYgKHN0ci5sZW5ndGggPiAxMDAwMCkge1xuICAgIHJldHVyblxuICB9XG4gIHZhciBtYXRjaCA9IC9eKCg/OlxcZCspP1xcLj9cXGQrKSAqKG1pbGxpc2Vjb25kcz98bXNlY3M/fG1zfHNlY29uZHM/fHNlY3M/fHN8bWludXRlcz98bWlucz98bXxob3Vycz98aHJzP3xofGRheXM/fGR8eWVhcnM/fHlycz98eSk/JC9pLmV4ZWMoc3RyKVxuICBpZiAoIW1hdGNoKSB7XG4gICAgcmV0dXJuXG4gIH1cbiAgdmFyIG4gPSBwYXJzZUZsb2F0KG1hdGNoWzFdKVxuICB2YXIgdHlwZSA9IChtYXRjaFsyXSB8fCAnbXMnKS50b0xvd2VyQ2FzZSgpXG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ3llYXJzJzpcbiAgICBjYXNlICd5ZWFyJzpcbiAgICBjYXNlICd5cnMnOlxuICAgIGNhc2UgJ3lyJzpcbiAgICBjYXNlICd5JzpcbiAgICAgIHJldHVybiBuICogeVxuICAgIGNhc2UgJ2RheXMnOlxuICAgIGNhc2UgJ2RheSc6XG4gICAgY2FzZSAnZCc6XG4gICAgICByZXR1cm4gbiAqIGRcbiAgICBjYXNlICdob3Vycyc6XG4gICAgY2FzZSAnaG91cic6XG4gICAgY2FzZSAnaHJzJzpcbiAgICBjYXNlICdocic6XG4gICAgY2FzZSAnaCc6XG4gICAgICByZXR1cm4gbiAqIGhcbiAgICBjYXNlICdtaW51dGVzJzpcbiAgICBjYXNlICdtaW51dGUnOlxuICAgIGNhc2UgJ21pbnMnOlxuICAgIGNhc2UgJ21pbic6XG4gICAgY2FzZSAnbSc6XG4gICAgICByZXR1cm4gbiAqIG1cbiAgICBjYXNlICdzZWNvbmRzJzpcbiAgICBjYXNlICdzZWNvbmQnOlxuICAgIGNhc2UgJ3NlY3MnOlxuICAgIGNhc2UgJ3NlYyc6XG4gICAgY2FzZSAncyc6XG4gICAgICByZXR1cm4gbiAqIHNcbiAgICBjYXNlICdtaWxsaXNlY29uZHMnOlxuICAgIGNhc2UgJ21pbGxpc2Vjb25kJzpcbiAgICBjYXNlICdtc2Vjcyc6XG4gICAgY2FzZSAnbXNlYyc6XG4gICAgY2FzZSAnbXMnOlxuICAgICAgcmV0dXJuIG5cbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG59XG5cbi8qKlxuICogU2hvcnQgZm9ybWF0IGZvciBgbXNgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtc1xuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZm10U2hvcnQobXMpIHtcbiAgaWYgKG1zID49IGQpIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIGQpICsgJ2QnXG4gIH1cbiAgaWYgKG1zID49IGgpIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIGgpICsgJ2gnXG4gIH1cbiAgaWYgKG1zID49IG0pIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIG0pICsgJ20nXG4gIH1cbiAgaWYgKG1zID49IHMpIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChtcyAvIHMpICsgJ3MnXG4gIH1cbiAgcmV0dXJuIG1zICsgJ21zJ1xufVxuXG4vKipcbiAqIExvbmcgZm9ybWF0IGZvciBgbXNgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtc1xuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZm10TG9uZyhtcykge1xuICByZXR1cm4gcGx1cmFsKG1zLCBkLCAnZGF5JykgfHxcbiAgICBwbHVyYWwobXMsIGgsICdob3VyJykgfHxcbiAgICBwbHVyYWwobXMsIG0sICdtaW51dGUnKSB8fFxuICAgIHBsdXJhbChtcywgcywgJ3NlY29uZCcpIHx8XG4gICAgbXMgKyAnIG1zJ1xufVxuXG4vKipcbiAqIFBsdXJhbGl6YXRpb24gaGVscGVyLlxuICovXG5cbmZ1bmN0aW9uIHBsdXJhbChtcywgbiwgbmFtZSkge1xuICBpZiAobXMgPCBuKSB7XG4gICAgcmV0dXJuXG4gIH1cbiAgaWYgKG1zIDwgbiAqIDEuNSkge1xuICAgIHJldHVybiBNYXRoLmZsb29yKG1zIC8gbikgKyAnICcgKyBuYW1lXG4gIH1cbiAgcmV0dXJuIE1hdGguY2VpbChtcyAvIG4pICsgJyAnICsgbmFtZSArICdzJ1xufVxuIiwiLyoqXG4gKiBUaGlzIGlzIHRoZSB3ZWIgYnJvd3NlciBpbXBsZW1lbnRhdGlvbiBvZiBgZGVidWcoKWAuXG4gKlxuICogRXhwb3NlIGBkZWJ1ZygpYCBhcyB0aGUgbW9kdWxlLlxuICovXG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vZGVidWcnKTtcbmV4cG9ydHMubG9nID0gbG9nO1xuZXhwb3J0cy5mb3JtYXRBcmdzID0gZm9ybWF0QXJncztcbmV4cG9ydHMuc2F2ZSA9IHNhdmU7XG5leHBvcnRzLmxvYWQgPSBsb2FkO1xuZXhwb3J0cy51c2VDb2xvcnMgPSB1c2VDb2xvcnM7XG5leHBvcnRzLnN0b3JhZ2UgPSAndW5kZWZpbmVkJyAhPSB0eXBlb2YgY2hyb21lXG4gICAgICAgICAgICAgICAmJiAndW5kZWZpbmVkJyAhPSB0eXBlb2YgY2hyb21lLnN0b3JhZ2VcbiAgICAgICAgICAgICAgICAgID8gY2hyb21lLnN0b3JhZ2UubG9jYWxcbiAgICAgICAgICAgICAgICAgIDogbG9jYWxzdG9yYWdlKCk7XG5cbi8qKlxuICogQ29sb3JzLlxuICovXG5cbmV4cG9ydHMuY29sb3JzID0gW1xuICAnbGlnaHRzZWFncmVlbicsXG4gICdmb3Jlc3RncmVlbicsXG4gICdnb2xkZW5yb2QnLFxuICAnZG9kZ2VyYmx1ZScsXG4gICdkYXJrb3JjaGlkJyxcbiAgJ2NyaW1zb24nXG5dO1xuXG4vKipcbiAqIEN1cnJlbnRseSBvbmx5IFdlYktpdC1iYXNlZCBXZWIgSW5zcGVjdG9ycywgRmlyZWZveCA+PSB2MzEsXG4gKiBhbmQgdGhlIEZpcmVidWcgZXh0ZW5zaW9uIChhbnkgRmlyZWZveCB2ZXJzaW9uKSBhcmUga25vd25cbiAqIHRvIHN1cHBvcnQgXCIlY1wiIENTUyBjdXN0b21pemF0aW9ucy5cbiAqXG4gKiBUT0RPOiBhZGQgYSBgbG9jYWxTdG9yYWdlYCB2YXJpYWJsZSB0byBleHBsaWNpdGx5IGVuYWJsZS9kaXNhYmxlIGNvbG9yc1xuICovXG5cbmZ1bmN0aW9uIHVzZUNvbG9ycygpIHtcbiAgLy8gTkI6IEluIGFuIEVsZWN0cm9uIHByZWxvYWQgc2NyaXB0LCBkb2N1bWVudCB3aWxsIGJlIGRlZmluZWQgYnV0IG5vdCBmdWxseVxuICAvLyBpbml0aWFsaXplZC4gU2luY2Ugd2Uga25vdyB3ZSdyZSBpbiBDaHJvbWUsIHdlJ2xsIGp1c3QgZGV0ZWN0IHRoaXMgY2FzZVxuICAvLyBleHBsaWNpdGx5XG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cgJiYgdHlwZW9mIHdpbmRvdy5wcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cucHJvY2Vzcy50eXBlID09PSAncmVuZGVyZXInKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLyBpcyB3ZWJraXQ/IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzE2NDU5NjA2LzM3Njc3M1xuICAvLyBkb2N1bWVudCBpcyB1bmRlZmluZWQgaW4gcmVhY3QtbmF0aXZlOiBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svcmVhY3QtbmF0aXZlL3B1bGwvMTYzMlxuICByZXR1cm4gKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgZG9jdW1lbnQgJiYgJ1dlYmtpdEFwcGVhcmFuY2UnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZSkgfHxcbiAgICAvLyBpcyBmaXJlYnVnPyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8zOTgxMjAvMzc2NzczXG4gICAgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdyAmJiB3aW5kb3cuY29uc29sZSAmJiAoY29uc29sZS5maXJlYnVnIHx8IChjb25zb2xlLmV4Y2VwdGlvbiAmJiBjb25zb2xlLnRhYmxlKSkpIHx8XG4gICAgLy8gaXMgZmlyZWZveCA+PSB2MzE/XG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9Ub29scy9XZWJfQ29uc29sZSNTdHlsaW5nX21lc3NhZ2VzXG4gICAgKHR5cGVvZiBuYXZpZ2F0b3IgIT09ICd1bmRlZmluZWQnICYmIG5hdmlnYXRvciAmJiBuYXZpZ2F0b3IudXNlckFnZW50ICYmIG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5tYXRjaCgvZmlyZWZveFxcLyhcXGQrKS8pICYmIHBhcnNlSW50KFJlZ0V4cC4kMSwgMTApID49IDMxKSB8fFxuICAgIC8vIGRvdWJsZSBjaGVjayB3ZWJraXQgaW4gdXNlckFnZW50IGp1c3QgaW4gY2FzZSB3ZSBhcmUgaW4gYSB3b3JrZXJcbiAgICAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgbmF2aWdhdG9yICYmIG5hdmlnYXRvci51c2VyQWdlbnQgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLm1hdGNoKC9hcHBsZXdlYmtpdFxcLyhcXGQrKS8pKTtcbn1cblxuLyoqXG4gKiBNYXAgJWogdG8gYEpTT04uc3RyaW5naWZ5KClgLCBzaW5jZSBubyBXZWIgSW5zcGVjdG9ycyBkbyB0aGF0IGJ5IGRlZmF1bHQuXG4gKi9cblxuZXhwb3J0cy5mb3JtYXR0ZXJzLmogPSBmdW5jdGlvbih2KSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHYpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gJ1tVbmV4cGVjdGVkSlNPTlBhcnNlRXJyb3JdOiAnICsgZXJyLm1lc3NhZ2U7XG4gIH1cbn07XG5cblxuLyoqXG4gKiBDb2xvcml6ZSBsb2cgYXJndW1lbnRzIGlmIGVuYWJsZWQuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBmb3JtYXRBcmdzKGFyZ3MpIHtcbiAgdmFyIHVzZUNvbG9ycyA9IHRoaXMudXNlQ29sb3JzO1xuXG4gIGFyZ3NbMF0gPSAodXNlQ29sb3JzID8gJyVjJyA6ICcnKVxuICAgICsgdGhpcy5uYW1lc3BhY2VcbiAgICArICh1c2VDb2xvcnMgPyAnICVjJyA6ICcgJylcbiAgICArIGFyZ3NbMF1cbiAgICArICh1c2VDb2xvcnMgPyAnJWMgJyA6ICcgJylcbiAgICArICcrJyArIGV4cG9ydHMuaHVtYW5pemUodGhpcy5kaWZmKTtcblxuICBpZiAoIXVzZUNvbG9ycykgcmV0dXJuO1xuXG4gIHZhciBjID0gJ2NvbG9yOiAnICsgdGhpcy5jb2xvcjtcbiAgYXJncy5zcGxpY2UoMSwgMCwgYywgJ2NvbG9yOiBpbmhlcml0JylcblxuICAvLyB0aGUgZmluYWwgXCIlY1wiIGlzIHNvbWV3aGF0IHRyaWNreSwgYmVjYXVzZSB0aGVyZSBjb3VsZCBiZSBvdGhlclxuICAvLyBhcmd1bWVudHMgcGFzc2VkIGVpdGhlciBiZWZvcmUgb3IgYWZ0ZXIgdGhlICVjLCBzbyB3ZSBuZWVkIHRvXG4gIC8vIGZpZ3VyZSBvdXQgdGhlIGNvcnJlY3QgaW5kZXggdG8gaW5zZXJ0IHRoZSBDU1MgaW50b1xuICB2YXIgaW5kZXggPSAwO1xuICB2YXIgbGFzdEMgPSAwO1xuICBhcmdzWzBdLnJlcGxhY2UoLyVbYS16QS1aJV0vZywgZnVuY3Rpb24obWF0Y2gpIHtcbiAgICBpZiAoJyUlJyA9PT0gbWF0Y2gpIHJldHVybjtcbiAgICBpbmRleCsrO1xuICAgIGlmICgnJWMnID09PSBtYXRjaCkge1xuICAgICAgLy8gd2Ugb25seSBhcmUgaW50ZXJlc3RlZCBpbiB0aGUgKmxhc3QqICVjXG4gICAgICAvLyAodGhlIHVzZXIgbWF5IGhhdmUgcHJvdmlkZWQgdGhlaXIgb3duKVxuICAgICAgbGFzdEMgPSBpbmRleDtcbiAgICB9XG4gIH0pO1xuXG4gIGFyZ3Muc3BsaWNlKGxhc3RDLCAwLCBjKTtcbn1cblxuLyoqXG4gKiBJbnZva2VzIGBjb25zb2xlLmxvZygpYCB3aGVuIGF2YWlsYWJsZS5cbiAqIE5vLW9wIHdoZW4gYGNvbnNvbGUubG9nYCBpcyBub3QgYSBcImZ1bmN0aW9uXCIuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBsb2coKSB7XG4gIC8vIHRoaXMgaGFja2VyeSBpcyByZXF1aXJlZCBmb3IgSUU4LzksIHdoZXJlXG4gIC8vIHRoZSBgY29uc29sZS5sb2dgIGZ1bmN0aW9uIGRvZXNuJ3QgaGF2ZSAnYXBwbHknXG4gIHJldHVybiAnb2JqZWN0JyA9PT0gdHlwZW9mIGNvbnNvbGVcbiAgICAmJiBjb25zb2xlLmxvZ1xuICAgICYmIEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseS5jYWxsKGNvbnNvbGUubG9nLCBjb25zb2xlLCBhcmd1bWVudHMpO1xufVxuXG4vKipcbiAqIFNhdmUgYG5hbWVzcGFjZXNgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2VzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzYXZlKG5hbWVzcGFjZXMpIHtcbiAgdHJ5IHtcbiAgICBpZiAobnVsbCA9PSBuYW1lc3BhY2VzKSB7XG4gICAgICBleHBvcnRzLnN0b3JhZ2UucmVtb3ZlSXRlbSgnZGVidWcnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXhwb3J0cy5zdG9yYWdlLmRlYnVnID0gbmFtZXNwYWNlcztcbiAgICB9XG4gIH0gY2F0Y2goZSkge31cbn1cblxuLyoqXG4gKiBMb2FkIGBuYW1lc3BhY2VzYC5cbiAqXG4gKiBAcmV0dXJuIHtTdHJpbmd9IHJldHVybnMgdGhlIHByZXZpb3VzbHkgcGVyc2lzdGVkIGRlYnVnIG1vZGVzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBsb2FkKCkge1xuICB0cnkge1xuICAgIHJldHVybiBleHBvcnRzLnN0b3JhZ2UuZGVidWc7XG4gIH0gY2F0Y2goZSkge31cblxuICAvLyBJZiBkZWJ1ZyBpc24ndCBzZXQgaW4gTFMsIGFuZCB3ZSdyZSBpbiBFbGVjdHJvbiwgdHJ5IHRvIGxvYWQgJERFQlVHXG4gIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgJ2VudicgaW4gcHJvY2Vzcykge1xuICAgIHJldHVybiBwcm9jZXNzLmVudi5ERUJVRztcbiAgfVxufVxuXG4vKipcbiAqIEVuYWJsZSBuYW1lc3BhY2VzIGxpc3RlZCBpbiBgbG9jYWxTdG9yYWdlLmRlYnVnYCBpbml0aWFsbHkuXG4gKi9cblxuZXhwb3J0cy5lbmFibGUobG9hZCgpKTtcblxuLyoqXG4gKiBMb2NhbHN0b3JhZ2UgYXR0ZW1wdHMgdG8gcmV0dXJuIHRoZSBsb2NhbHN0b3JhZ2UuXG4gKlxuICogVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSBzYWZhcmkgdGhyb3dzXG4gKiB3aGVuIGEgdXNlciBkaXNhYmxlcyBjb29raWVzL2xvY2Fsc3RvcmFnZVxuICogYW5kIHlvdSBhdHRlbXB0IHRvIGFjY2VzcyBpdC5cbiAqXG4gKiBAcmV0dXJuIHtMb2NhbFN0b3JhZ2V9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBsb2NhbHN0b3JhZ2UoKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHdpbmRvdy5sb2NhbFN0b3JhZ2U7XG4gIH0gY2F0Y2ggKGUpIHt9XG59XG4iLCJcbi8qKlxuICogVGhpcyBpcyB0aGUgY29tbW9uIGxvZ2ljIGZvciBib3RoIHRoZSBOb2RlLmpzIGFuZCB3ZWIgYnJvd3NlclxuICogaW1wbGVtZW50YXRpb25zIG9mIGBkZWJ1ZygpYC5cbiAqXG4gKiBFeHBvc2UgYGRlYnVnKClgIGFzIHRoZSBtb2R1bGUuXG4gKi9cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gY3JlYXRlRGVidWcuZGVidWcgPSBjcmVhdGVEZWJ1Z1snZGVmYXVsdCddID0gY3JlYXRlRGVidWc7XG5leHBvcnRzLmNvZXJjZSA9IGNvZXJjZTtcbmV4cG9ydHMuZGlzYWJsZSA9IGRpc2FibGU7XG5leHBvcnRzLmVuYWJsZSA9IGVuYWJsZTtcbmV4cG9ydHMuZW5hYmxlZCA9IGVuYWJsZWQ7XG5leHBvcnRzLmh1bWFuaXplID0gcmVxdWlyZSgnbXMnKTtcblxuLyoqXG4gKiBUaGUgY3VycmVudGx5IGFjdGl2ZSBkZWJ1ZyBtb2RlIG5hbWVzLCBhbmQgbmFtZXMgdG8gc2tpcC5cbiAqL1xuXG5leHBvcnRzLm5hbWVzID0gW107XG5leHBvcnRzLnNraXBzID0gW107XG5cbi8qKlxuICogTWFwIG9mIHNwZWNpYWwgXCIlblwiIGhhbmRsaW5nIGZ1bmN0aW9ucywgZm9yIHRoZSBkZWJ1ZyBcImZvcm1hdFwiIGFyZ3VtZW50LlxuICpcbiAqIFZhbGlkIGtleSBuYW1lcyBhcmUgYSBzaW5nbGUsIGxvd2VyIG9yIHVwcGVyLWNhc2UgbGV0dGVyLCBpLmUuIFwiblwiIGFuZCBcIk5cIi5cbiAqL1xuXG5leHBvcnRzLmZvcm1hdHRlcnMgPSB7fTtcblxuLyoqXG4gKiBQcmV2aW91cyBsb2cgdGltZXN0YW1wLlxuICovXG5cbnZhciBwcmV2VGltZTtcblxuLyoqXG4gKiBTZWxlY3QgYSBjb2xvci5cbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2VcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNlbGVjdENvbG9yKG5hbWVzcGFjZSkge1xuICB2YXIgaGFzaCA9IDAsIGk7XG5cbiAgZm9yIChpIGluIG5hbWVzcGFjZSkge1xuICAgIGhhc2ggID0gKChoYXNoIDw8IDUpIC0gaGFzaCkgKyBuYW1lc3BhY2UuY2hhckNvZGVBdChpKTtcbiAgICBoYXNoIHw9IDA7IC8vIENvbnZlcnQgdG8gMzJiaXQgaW50ZWdlclxuICB9XG5cbiAgcmV0dXJuIGV4cG9ydHMuY29sb3JzW01hdGguYWJzKGhhc2gpICUgZXhwb3J0cy5jb2xvcnMubGVuZ3RoXTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBkZWJ1Z2dlciB3aXRoIHRoZSBnaXZlbiBgbmFtZXNwYWNlYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZXNwYWNlXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gY3JlYXRlRGVidWcobmFtZXNwYWNlKSB7XG5cbiAgZnVuY3Rpb24gZGVidWcoKSB7XG4gICAgLy8gZGlzYWJsZWQ/XG4gICAgaWYgKCFkZWJ1Zy5lbmFibGVkKSByZXR1cm47XG5cbiAgICB2YXIgc2VsZiA9IGRlYnVnO1xuXG4gICAgLy8gc2V0IGBkaWZmYCB0aW1lc3RhbXBcbiAgICB2YXIgY3VyciA9ICtuZXcgRGF0ZSgpO1xuICAgIHZhciBtcyA9IGN1cnIgLSAocHJldlRpbWUgfHwgY3Vycik7XG4gICAgc2VsZi5kaWZmID0gbXM7XG4gICAgc2VsZi5wcmV2ID0gcHJldlRpbWU7XG4gICAgc2VsZi5jdXJyID0gY3VycjtcbiAgICBwcmV2VGltZSA9IGN1cnI7XG5cbiAgICAvLyB0dXJuIHRoZSBgYXJndW1lbnRzYCBpbnRvIGEgcHJvcGVyIEFycmF5XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBhcmdzW2ldID0gYXJndW1lbnRzW2ldO1xuICAgIH1cblxuICAgIGFyZ3NbMF0gPSBleHBvcnRzLmNvZXJjZShhcmdzWzBdKTtcblxuICAgIGlmICgnc3RyaW5nJyAhPT0gdHlwZW9mIGFyZ3NbMF0pIHtcbiAgICAgIC8vIGFueXRoaW5nIGVsc2UgbGV0J3MgaW5zcGVjdCB3aXRoICVPXG4gICAgICBhcmdzLnVuc2hpZnQoJyVPJyk7XG4gICAgfVxuXG4gICAgLy8gYXBwbHkgYW55IGBmb3JtYXR0ZXJzYCB0cmFuc2Zvcm1hdGlvbnNcbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIGFyZ3NbMF0gPSBhcmdzWzBdLnJlcGxhY2UoLyUoW2EtekEtWiVdKS9nLCBmdW5jdGlvbihtYXRjaCwgZm9ybWF0KSB7XG4gICAgICAvLyBpZiB3ZSBlbmNvdW50ZXIgYW4gZXNjYXBlZCAlIHRoZW4gZG9uJ3QgaW5jcmVhc2UgdGhlIGFycmF5IGluZGV4XG4gICAgICBpZiAobWF0Y2ggPT09ICclJScpIHJldHVybiBtYXRjaDtcbiAgICAgIGluZGV4Kys7XG4gICAgICB2YXIgZm9ybWF0dGVyID0gZXhwb3J0cy5mb3JtYXR0ZXJzW2Zvcm1hdF07XG4gICAgICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGZvcm1hdHRlcikge1xuICAgICAgICB2YXIgdmFsID0gYXJnc1tpbmRleF07XG4gICAgICAgIG1hdGNoID0gZm9ybWF0dGVyLmNhbGwoc2VsZiwgdmFsKTtcblxuICAgICAgICAvLyBub3cgd2UgbmVlZCB0byByZW1vdmUgYGFyZ3NbaW5kZXhdYCBzaW5jZSBpdCdzIGlubGluZWQgaW4gdGhlIGBmb3JtYXRgXG4gICAgICAgIGFyZ3Muc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgaW5kZXgtLTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtYXRjaDtcbiAgICB9KTtcblxuICAgIC8vIGFwcGx5IGVudi1zcGVjaWZpYyBmb3JtYXR0aW5nIChjb2xvcnMsIGV0Yy4pXG4gICAgZXhwb3J0cy5mb3JtYXRBcmdzLmNhbGwoc2VsZiwgYXJncyk7XG5cbiAgICB2YXIgbG9nRm4gPSBkZWJ1Zy5sb2cgfHwgZXhwb3J0cy5sb2cgfHwgY29uc29sZS5sb2cuYmluZChjb25zb2xlKTtcbiAgICBsb2dGbi5hcHBseShzZWxmLCBhcmdzKTtcbiAgfVxuXG4gIGRlYnVnLm5hbWVzcGFjZSA9IG5hbWVzcGFjZTtcbiAgZGVidWcuZW5hYmxlZCA9IGV4cG9ydHMuZW5hYmxlZChuYW1lc3BhY2UpO1xuICBkZWJ1Zy51c2VDb2xvcnMgPSBleHBvcnRzLnVzZUNvbG9ycygpO1xuICBkZWJ1Zy5jb2xvciA9IHNlbGVjdENvbG9yKG5hbWVzcGFjZSk7XG5cbiAgLy8gZW52LXNwZWNpZmljIGluaXRpYWxpemF0aW9uIGxvZ2ljIGZvciBkZWJ1ZyBpbnN0YW5jZXNcbiAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBleHBvcnRzLmluaXQpIHtcbiAgICBleHBvcnRzLmluaXQoZGVidWcpO1xuICB9XG5cbiAgcmV0dXJuIGRlYnVnO1xufVxuXG4vKipcbiAqIEVuYWJsZXMgYSBkZWJ1ZyBtb2RlIGJ5IG5hbWVzcGFjZXMuIFRoaXMgY2FuIGluY2x1ZGUgbW9kZXNcbiAqIHNlcGFyYXRlZCBieSBhIGNvbG9uIGFuZCB3aWxkY2FyZHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gZW5hYmxlKG5hbWVzcGFjZXMpIHtcbiAgZXhwb3J0cy5zYXZlKG5hbWVzcGFjZXMpO1xuXG4gIGV4cG9ydHMubmFtZXMgPSBbXTtcbiAgZXhwb3J0cy5za2lwcyA9IFtdO1xuXG4gIHZhciBzcGxpdCA9IChuYW1lc3BhY2VzIHx8ICcnKS5zcGxpdCgvW1xccyxdKy8pO1xuICB2YXIgbGVuID0gc3BsaXQubGVuZ3RoO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoIXNwbGl0W2ldKSBjb250aW51ZTsgLy8gaWdub3JlIGVtcHR5IHN0cmluZ3NcbiAgICBuYW1lc3BhY2VzID0gc3BsaXRbaV0ucmVwbGFjZSgvXFwqL2csICcuKj8nKTtcbiAgICBpZiAobmFtZXNwYWNlc1swXSA9PT0gJy0nKSB7XG4gICAgICBleHBvcnRzLnNraXBzLnB1c2gobmV3IFJlZ0V4cCgnXicgKyBuYW1lc3BhY2VzLnN1YnN0cigxKSArICckJykpO1xuICAgIH0gZWxzZSB7XG4gICAgICBleHBvcnRzLm5hbWVzLnB1c2gobmV3IFJlZ0V4cCgnXicgKyBuYW1lc3BhY2VzICsgJyQnKSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogRGlzYWJsZSBkZWJ1ZyBvdXRwdXQuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBkaXNhYmxlKCkge1xuICBleHBvcnRzLmVuYWJsZSgnJyk7XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBnaXZlbiBtb2RlIG5hbWUgaXMgZW5hYmxlZCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBlbmFibGVkKG5hbWUpIHtcbiAgdmFyIGksIGxlbjtcbiAgZm9yIChpID0gMCwgbGVuID0gZXhwb3J0cy5za2lwcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGlmIChleHBvcnRzLnNraXBzW2ldLnRlc3QobmFtZSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgZm9yIChpID0gMCwgbGVuID0gZXhwb3J0cy5uYW1lcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGlmIChleHBvcnRzLm5hbWVzW2ldLnRlc3QobmFtZSkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogQ29lcmNlIGB2YWxgLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbFxuICogQHJldHVybiB7TWl4ZWR9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBjb2VyY2UodmFsKSB7XG4gIGlmICh2YWwgaW5zdGFuY2VvZiBFcnJvcikgcmV0dXJuIHZhbC5zdGFjayB8fCB2YWwubWVzc2FnZTtcbiAgcmV0dXJuIHZhbDtcbn1cbiIsInZhciBub3JtYWxpemUgPSByZXF1aXJlKCdnbC12ZWMzL25vcm1hbGl6ZScpXG52YXIgc3ViID0gcmVxdWlyZSgnZ2wtdmVjMy9zdWJ0cmFjdCcpXG52YXIgY3Jvc3MgPSByZXF1aXJlKCdnbC12ZWMzL2Nyb3NzJylcbnZhciB0bXAgPSBbMCwgMCwgMF1cblxubW9kdWxlLmV4cG9ydHMgPSBwbGFuZU5vcm1hbFxuXG5mdW5jdGlvbiBwbGFuZU5vcm1hbCAob3V0LCBwb2ludDEsIHBvaW50MiwgcG9pbnQzKSB7XG4gIHN1YihvdXQsIHBvaW50MSwgcG9pbnQyKVxuICBzdWIodG1wLCBwb2ludDIsIHBvaW50MylcbiAgY3Jvc3Mob3V0LCBvdXQsIHRtcClcbiAgcmV0dXJuIG5vcm1hbGl6ZShvdXQsIG91dClcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IGFkZDtcblxuLyoqXG4gKiBBZGRzIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmZ1bmN0aW9uIGFkZChvdXQsIGEsIGIpIHtcbiAgICBvdXRbMF0gPSBhWzBdICsgYlswXVxuICAgIG91dFsxXSA9IGFbMV0gKyBiWzFdXG4gICAgb3V0WzJdID0gYVsyXSArIGJbMl1cbiAgICByZXR1cm4gb3V0XG59IiwibW9kdWxlLmV4cG9ydHMgPSBjb3B5O1xuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSB2ZWMzIHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBzb3VyY2UgdmVjdG9yXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmZ1bmN0aW9uIGNvcHkob3V0LCBhKSB7XG4gICAgb3V0WzBdID0gYVswXVxuICAgIG91dFsxXSA9IGFbMV1cbiAgICBvdXRbMl0gPSBhWzJdXG4gICAgcmV0dXJuIG91dFxufSIsIm1vZHVsZS5leHBvcnRzID0gY3Jvc3M7XG5cbi8qKlxuICogQ29tcHV0ZXMgdGhlIGNyb3NzIHByb2R1Y3Qgb2YgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZnVuY3Rpb24gY3Jvc3Mob3V0LCBhLCBiKSB7XG4gICAgdmFyIGF4ID0gYVswXSwgYXkgPSBhWzFdLCBheiA9IGFbMl0sXG4gICAgICAgIGJ4ID0gYlswXSwgYnkgPSBiWzFdLCBieiA9IGJbMl1cblxuICAgIG91dFswXSA9IGF5ICogYnogLSBheiAqIGJ5XG4gICAgb3V0WzFdID0gYXogKiBieCAtIGF4ICogYnpcbiAgICBvdXRbMl0gPSBheCAqIGJ5IC0gYXkgKiBieFxuICAgIHJldHVybiBvdXRcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IGRpc3RhbmNlO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG5mdW5jdGlvbiBkaXN0YW5jZShhLCBiKSB7XG4gICAgdmFyIHggPSBiWzBdIC0gYVswXSxcbiAgICAgICAgeSA9IGJbMV0gLSBhWzFdLFxuICAgICAgICB6ID0gYlsyXSAtIGFbMl1cbiAgICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSArIHoqeilcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IGRvdDtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXG4gKi9cbmZ1bmN0aW9uIGRvdChhLCBiKSB7XG4gICAgcmV0dXJuIGFbMF0gKiBiWzBdICsgYVsxXSAqIGJbMV0gKyBhWzJdICogYlsyXVxufSIsIm1vZHVsZS5leHBvcnRzID0gbGVuZ3RoO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHZlYzNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXG4gKi9cbmZ1bmN0aW9uIGxlbmd0aChhKSB7XG4gICAgdmFyIHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXSxcbiAgICAgICAgeiA9IGFbMl1cbiAgICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSArIHoqeilcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IG5vcm1hbGl6ZTtcblxuLyoqXG4gKiBOb3JtYWxpemUgYSB2ZWMzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gbm9ybWFsaXplXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmZ1bmN0aW9uIG5vcm1hbGl6ZShvdXQsIGEpIHtcbiAgICB2YXIgeCA9IGFbMF0sXG4gICAgICAgIHkgPSBhWzFdLFxuICAgICAgICB6ID0gYVsyXVxuICAgIHZhciBsZW4gPSB4KnggKyB5KnkgKyB6KnpcbiAgICBpZiAobGVuID4gMCkge1xuICAgICAgICAvL1RPRE86IGV2YWx1YXRlIHVzZSBvZiBnbG1faW52c3FydCBoZXJlP1xuICAgICAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbilcbiAgICAgICAgb3V0WzBdID0gYVswXSAqIGxlblxuICAgICAgICBvdXRbMV0gPSBhWzFdICogbGVuXG4gICAgICAgIG91dFsyXSA9IGFbMl0gKiBsZW5cbiAgICB9XG4gICAgcmV0dXJuIG91dFxufSIsIm1vZHVsZS5leHBvcnRzID0gc2NhbGU7XG5cbi8qKlxuICogU2NhbGVzIGEgdmVjMyBieSBhIHNjYWxhciBudW1iZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSB2ZWN0b3IgdG8gc2NhbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmZ1bmN0aW9uIHNjYWxlKG91dCwgYSwgYikge1xuICAgIG91dFswXSA9IGFbMF0gKiBiXG4gICAgb3V0WzFdID0gYVsxXSAqIGJcbiAgICBvdXRbMl0gPSBhWzJdICogYlxuICAgIHJldHVybiBvdXRcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IHNjYWxlQW5kQWRkO1xuXG4vKipcbiAqIEFkZHMgdHdvIHZlYzMncyBhZnRlciBzY2FsaW5nIHRoZSBzZWNvbmQgb3BlcmFuZCBieSBhIHNjYWxhciB2YWx1ZVxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZSB0aGUgYW1vdW50IHRvIHNjYWxlIGIgYnkgYmVmb3JlIGFkZGluZ1xuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5mdW5jdGlvbiBzY2FsZUFuZEFkZChvdXQsIGEsIGIsIHNjYWxlKSB7XG4gICAgb3V0WzBdID0gYVswXSArIChiWzBdICogc2NhbGUpXG4gICAgb3V0WzFdID0gYVsxXSArIChiWzFdICogc2NhbGUpXG4gICAgb3V0WzJdID0gYVsyXSArIChiWzJdICogc2NhbGUpXG4gICAgcmV0dXJuIG91dFxufSIsIm1vZHVsZS5leHBvcnRzID0gc3F1YXJlZERpc3RhbmNlO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xuZnVuY3Rpb24gc3F1YXJlZERpc3RhbmNlKGEsIGIpIHtcbiAgICB2YXIgeCA9IGJbMF0gLSBhWzBdLFxuICAgICAgICB5ID0gYlsxXSAtIGFbMV0sXG4gICAgICAgIHogPSBiWzJdIC0gYVsyXVxuICAgIHJldHVybiB4KnggKyB5KnkgKyB6Knpcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IHNxdWFyZWRMZW5ndGg7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBsZW5ndGggb2YgYSB2ZWMzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgc3F1YXJlZCBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgbGVuZ3RoIG9mIGFcbiAqL1xuZnVuY3Rpb24gc3F1YXJlZExlbmd0aChhKSB7XG4gICAgdmFyIHggPSBhWzBdLFxuICAgICAgICB5ID0gYVsxXSxcbiAgICAgICAgeiA9IGFbMl1cbiAgICByZXR1cm4geCp4ICsgeSp5ICsgeip6XG59IiwibW9kdWxlLmV4cG9ydHMgPSBzdWJ0cmFjdDtcblxuLyoqXG4gKiBTdWJ0cmFjdHMgdmVjdG9yIGIgZnJvbSB2ZWN0b3IgYVxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZnVuY3Rpb24gc3VidHJhY3Qob3V0LCBhLCBiKSB7XG4gICAgb3V0WzBdID0gYVswXSAtIGJbMF1cbiAgICBvdXRbMV0gPSBhWzFdIC0gYlsxXVxuICAgIG91dFsyXSA9IGFbMl0gLSBiWzJdXG4gICAgcmV0dXJuIG91dFxufSIsIi8qXG4gKiBwb2ludC1saW5lLWRpc3RhbmNlXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE1IE1hdXJpY2lvIFBvcHBlXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbnZhciBkaXN0YW5jZVNxdWFyZWQgPSByZXF1aXJlKCcuL3NxdWFyZWQnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwb2ludCwgYSwgYikge1xuICByZXR1cm4gTWF0aC5zcXJ0KGRpc3RhbmNlU3F1YXJlZChwb2ludCwgYSwgYikpXG59XG4iLCJ2YXIgc3VidHJhY3QgPSByZXF1aXJlKCdnbC12ZWMzL3N1YnRyYWN0JylcbnZhciBjcm9zcyA9IHJlcXVpcmUoJ2dsLXZlYzMvY3Jvc3MnKVxudmFyIHNxdWFyZWRMZW5ndGggPSByZXF1aXJlKCdnbC12ZWMzL3NxdWFyZWRMZW5ndGgnKVxudmFyIGFiID0gW11cbnZhciBhcCA9IFtdXG52YXIgY3IgPSBbXVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChwLCBhLCBiKSB7XG4gIC8vIC8vID09IHZlY3RvciBzb2x1dGlvblxuICAvLyB2YXIgbm9ybWFsaXplID0gcmVxdWlyZSgnZ2wtdmVjMy9ub3JtYWxpemUnKVxuICAvLyB2YXIgc2NhbGVBbmRBZGQgPSByZXF1aXJlKCdnbC12ZWMzL3NjYWxlQW5kQWRkJylcbiAgLy8gdmFyIGRvdCA9IHJlcXVpcmUoJ2dsLXZlYzMvZG90JylcbiAgLy8gdmFyIHNxdWFyZWREaXN0YW5jZSA9IHJlcXVpcmUoJ2dsLXZlYzMvc3F1YXJlZERpc3RhbmNlJylcbiAgLy8gLy8gbiA9IHZlY3RvciBgYWJgIG5vcm1hbGl6ZWRcbiAgLy8gdmFyIG4gPSBbXVxuICAvLyAvLyBwcm9qZWN0aW9uID0gcHJvamVjdGlvbiBvZiBgcG9pbnRgIG9uIGBuYFxuICAvLyB2YXIgcHJvamVjdGlvbiA9IFtdXG4gIC8vIG5vcm1hbGl6ZShuLCBzdWJ0cmFjdChuLCBhLCBiKSlcbiAgLy8gc2NhbGVBbmRBZGQocHJvamVjdGlvbiwgYSwgbiwgZG90KG4sIHApKVxuICAvLyByZXR1cm4gc3F1YXJlZERpc3RhbmNlKHByb2plY3Rpb24sIHApXG5cbiAgLy8gPT0gcGFyYWxsZWxvZ3JhbSBzb2x1dGlvblxuICAvL1xuICAvLyAgICAgICAgICAgIHNcbiAgLy8gICAgICBfX2FfX19fX19fX2JfX1xuICAvLyAgICAgICAvICAgfCAgICAvXG4gIC8vICAgICAgLyAgIGh8ICAgL1xuICAvLyAgICAgL19fX19ffF9fL1xuICAvLyAgICBwXG4gIC8vXG4gIC8vICBzID0gYiAtIGFcbiAgLy8gIGFyZWEgPSBzICogaFxuICAvLyAgfGFwIHggc3wgPSBzICogaFxuICAvLyAgaCA9IHxhcCB4IHN8IC8gc1xuICAvL1xuICBzdWJ0cmFjdChhYiwgYiwgYSlcbiAgc3VidHJhY3QoYXAsIHAsIGEpXG4gIHZhciBhcmVhID0gc3F1YXJlZExlbmd0aChjcm9zcyhjciwgYXAsIGFiKSlcbiAgdmFyIHMgPSBzcXVhcmVkTGVuZ3RoKGFiKVxuICBpZiAocyA9PT0gMCkge1xuICAgIHRocm93IEVycm9yKCdhIGFuZCBiIGFyZSB0aGUgc2FtZSBwb2ludCcpXG4gIH1cbiAgcmV0dXJuIGFyZWEgLyBzXG59XG4iXX0=
