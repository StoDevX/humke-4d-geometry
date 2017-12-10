# Humke 4D Geometry Viewer
A project for Professor Paul Humke at St. Olaf College to teach 4D geometry by analogy (see [Flatland](https://en.wikipedia.org/wiki/Flatland)), made with Threejs. 

![cartesian_slicing_example](project-resources/reports/media/april_3d_cartesian_cut.gif)

## Project Structure

* **index.html** is the main entry point where we include all the files and set up the title screen.

The following files are all under **src/**:

* **2d.js**, **3d.js** & **4d.js** run the logic for each mode. 
* **Slicing.js** contains all the functions for computing & rendering slices of shapes.
* **Projecting.js** contains all the functions for rendering n-dimensional shapes on the screen.   
* **util/** includes various utility functions, such as **gui.js** for managing the interface and **grid.js** for creating axes and grids in Threejs, etc. 

The following are not part of the main app but are still useful:

* **project-resources/** contains useful links, reports and gifs.
* **demos/** contains isolated files for testing or demonstration specific features without integrating them into the app.
