// open and close about page
// get about section and the button to open about page
var modal = document.querySelector("#about");
var content = document.querySelectorAll(".modal_content")[0];
var open_btn = document.querySelector("#open_about");
var close_btn = document.querySelector("#close_btn");
// click link to open about page 
open_btn.onclick = function() {
    modal.style.display = "flex";
    modal.style.animationName = "fade_in";
    content.style.animationName = "slide_in_from_top";
};
// click close button or anywhere outside about page to close
close_btn.onclick = function() {
    modal.style.animationName = "fade_out";
    content.style.animationName = "slide_out";
    setTimeout( function(){
        modal.style.display = "none";
    }, 350);
};

document.onclick = function(event) {
    if (event.target == modal) {
        modal.style.animationName = "fade_out";
        content.style.animationName = "slide_out";
        setTimeout( function(){
            modal.style.display = "none";
        }, 350);
    }
};

// change 2D/3D/4D mode
// set variables
var header = document.querySelector("hgroup");
var buttons = ['btn_2d','btn_3d','btn_4d']
var text_map = {'btn_2d':'2D','btn_3d':'3D','btn_4d':'4D'}
var current_mode = "";
// set 2D/3D/4D viewers and gui objects
var mode_objects = {};
mode_objects['2D'] = new Mode2D(document);
// mode_objects['3D'] = new Mode3D(document);
// mode_objects['4D'] = new Mode4D(document);
var gui = new GUI();
// listen for clicks on buttons to differnt modes
for (var i = 0; i < buttons.length; ++i) {
    document.querySelector('#'+buttons[i]).addEventListener('click', (function(i) {
        return function() {
            // move header up
            header.style.transform = "translateY(0)";
            header.style.transition = "all 0.4s ease";
            // save info clean up current mode if exist
            if (current_mode) {
                console.log("save info in " + current_mode + " mode");
                // mode_objects[current_mode].cleanup();
                console.log("clean up " + current_mode + " mode");
            }
            // detect which mode is clicked
            current_mode = text_map[buttons[i]];
            // change title based on mode chosen
            document.querySelector("#world_title").innerHTML = current_mode;
            // show viewer
            document.querySelector("#viewer").style.display = "flex";
            // init the mode with gui
            mode_objects[current_mode].init(gui);
            console.log("load " + current_mode + " mode");
        };
    })(i));
}