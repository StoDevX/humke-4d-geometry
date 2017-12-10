var SaveState = (function (scope) {
	function SaveState(){
		this.state = {
			'mode': null, //2D, 3D or 4D 
			'input': null, //cartesian, convex, or parametric 
			'input_data': null, //names of the gui properties to populate 

		};
	}

	SaveState.prototype.load = function(){
		// Tries to load state from url. Returns null if no state. Otherwise, returns state object 
		if(this._decodeUrl(window.location.href)){
			return JSON.parse(JSON.stringify(this.state)); // Make a copy of the state so we don't change this as we're re-constructing th estate
		}

		return null;
	}

	SaveState.prototype.update = function(mode,input,gui){
		// Extract the bare minimum we need to save this state 
		this.state.mode = mode; 
		this.state.input = input; 

		for(let prop in gui.params){
			console.log(prop);
		}

		// Construct url
		var url = this._makeUrl();
		// Put it in the url 
		history.pushState(null,null,url);	

		
	}

	// Underscore means it's a 'private' function. Not supposed to be used outside this class
	SaveState.prototype._makeUrl = function(){
		// Convert the inner state into a url to be saved 
		// First convert to a JSON 
		var jsonString = JSON.stringify(this.state);
		// Now convert it into base64 because you can't put characters like '{}' in a url 
		var b64 = btoa(jsonString);
		var url = "?state=" + b64;
		return url;
	}

	SaveState.prototype._decodeUrl = function(url){
		// Parses state from string if found and sets it to the internal state object
		var stateString = Util.getParameterByName("state",url);
		if(stateString == null) return false;
		var jsonString = atob(stateString);
		var state = JSON.parse(jsonString);

		this.state = state;

		return true;
	}

	scope.SaveState = SaveState;
	return SaveState;
})(typeof exports === 'undefined' ? {} : exports);