# Progress Report for March 17th 2017

This update has a lot of progress! The summary is:

* Completed refactor. The project now has a cohesive structure and all our progress has been compiled into the same version. 
* Can render filled in regions between multiple cartesian equations in **2D**. 
* New method for calculating intersections in **2D**. Pro: it works for all methods of input. Con: it's very slow. 
* All **3D** input modes are complete. *(Including parametric equations with 3 parameters and convex hulls).*

![title_screen](media/title_screen.gif)

### 2D Mode

You can now render multiple equations (by seperating them with comma's) and you can also fill in the area between them!

[Video link](https://webmshare.com/vO7Lz)

### 3D Mode

You can now input 3D objects using the 3 modes. 

[Video link](https://webmshare.com/4eKnn)

We also have this proof of concept of viewing slices. This is done using a shader. But as you can see, it shows the 3D models as hollow. I haven't been able to figure out how to correctly fill in the model. I'm looking into [Constructive Solid Geometry](https://en.wikipedia.org/wiki/Constructive_solid_geometry) as a possible technique for that.

[Video link](https://webmshare.com/b80jb)

## Next Steps

It would be great if you can play around a bit with the program and let us know how close it's getting to what it should be and if there's anything to prioritize right now!

You can always access it at:

https://stodevx.github.io/humke-4d-geometry/

I think we're finally at a point where we can try 4D visualization. But there's so many different ways. Which way to start with?

* Entering points and projecting the vertices? 
* Seeing a 3D slice? How does the input for this look? 
* How can you rendering a 4D equation? Just slices?  