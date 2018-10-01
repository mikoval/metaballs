function glWindow (){
	this.init = function(){
		var canvas = document.getElementById("c");
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		this.gl = canvas.getContext("webgl2");
		if (!this.gl) {
			return false;
		}
		return true;
	}
        
	this.gl = {};
	this.getContext = function(){
		return this.gl;
	}

	this.init();
}