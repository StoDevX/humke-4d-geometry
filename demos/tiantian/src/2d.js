// all logic and rendering of the 2D mode
// depends on three.js and dat.GUI

var Mode2D = (function(scope) {
    // constructor
    function Mode2D(document) {
        this.document = document;
    }

    // init method
    Mode2D.prototype.init = function(gui) {
        // get two child divs of viewer section
        var leftChild = document.querySelector("#viewer_left");
        var rightChild = document.querySelector("#viewer_right");
        this.leftChild = leftChild;
        this.rightChild = rightChild;
        viewWidth = leftChild.offsetWidth;
        viewHeight = window.innerHeight - document.querySelector("hgroup").offsetHeight;

        // init gui
        gui.init("2D");
        this.gui = gui;

        // set scene, camera, and renderer (left)
        this.leftView = new THREE.Scene();
        this.leftView.background = new THREE.Color(0xffffff);

        this.leftCamera = new THREE.PerspectiveCamera(75, viewWidth / viewHeight, 1, 100);
        this.leftCamera.position.set(0,0,20);

        this.leftRenderer = new THREE.WebGLRenderer();
        this.leftRenderer.setSize(viewWidth, viewHeight);
        leftChild.appendChild(this.leftRenderer.domElement);

        // disable rotating and dragging (left)
        this.leftControls = new THREE.OrbitControls(this.leftCamera, this.leftRenderer.domElement);
        this.leftControls.enableRotate = false;
        // this.leftControls.enablePan = false;

        // set axis, axis labels, and grid (left)
        var axis = createAxis("x");
        this.leftView.add(axis);
        axis = createAxis("y");
        this.leftView.add(axis);

        var label = createLabel("x",11,0,0);
        this.leftView.add(label);
        label = createLabel("y",0,11,0);
        this.leftView.add(label);

        var grid = createGrid("xy");
        this.leftView.add(grid);

        // set scene, camera and renderer (right)

        // animate 2D viewer
        this.animate();
    };

    // animate 2D viewer
    Mode2D.prototype.animate = function(){
        requestAnimationFrame(this.animate.bind(this));
        this.leftRenderer.render(this.leftView, this.leftCamera);
    };

    scope.Mode2D = Mode2D;
    return Mode2D;
})(typeof exports === 'undefined' ? {} : exports);