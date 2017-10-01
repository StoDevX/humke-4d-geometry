/*
This is just a handy template for creating new JS classes in this project.
Simply replace ClassName with your class name, and this comment with what your class does.

To use this class, include it in index.html. 
Then create an instance of it via: `var obj = new ClassName(); obj.MemberFunction(2);`
*/
var ClassName = (function (scope) {
	function ClassName(){
		this.privateVariable = 0;
	}
	ClassName.prototype.MemberFunction = function(arg){
		return arg;
	}
	scope.ClassName = ClassName;
	return ClassName;
})(typeof exports === 'undefined' ? {} : exports);