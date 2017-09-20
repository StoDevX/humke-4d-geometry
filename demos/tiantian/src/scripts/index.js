var buttons = ['btn_home','btn_2d','btn_3d','btn_4d']
var text_map = {'btn_2d':'2D','btn_3d':'3D','btn_4d':'4D'}
var current_mode = "";

for (var i = 0; i < buttons.length; ++i) {
    var btn_name = "#" + buttons[i];
    document.querySelector(btn_name).onclick = function(e, nth=1) {
        console.log(nth);
        var clicked_name = buttons[nth];
        current_mode = text_map[clicked_name];
        if (nth == 0) {
            // Hide Viewer Title
            document.querySelector("#header_2").style.display = "none";
            // Show Homepage Title
            document.querySelector("#header_1").style.display = "block";
        } else {
            // Create Viewer Title
            document.querySelector("#world_title").innerHTML = current_mode;
            // Hide Homepage Title
            document.querySelector("#header_1").style.display = "none";
            // Show Viewer Title
            document.querySelector("#header_2").style.display = "block";
        }
        // Change Navbar Options
        for (var i = 0; i < buttons.length; ++i) {
            if (i == nth) {
                document.querySelector("#" + buttons[i]).style.display = "none";
            } else {
                document.querySelector("#" + buttons[i]).style.display = "inline-block";
            }
        }
    }
}