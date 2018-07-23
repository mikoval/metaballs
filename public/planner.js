"use strict";
function planner(){
    this.gl;
    this.program;
    this.vertexShaderSource = `#version 300 es

        in vec2 position;

        in vec2 uv;

        uniform vec2 translation;
        uniform float scale;

        out vec2 vuv;

        void main() {
            vuv = uv - 0.5;


     		vec2 p  = position / 100.0 * scale + translation;

            gl_Position = vec4(p, 0, 1);
        }
        `;

    this.fragmentShaderSource = `#version 300 es
        precision mediump float;

        in vec2 vuv;
        out vec4 outColor;

        uniform vec4 color;

        #define S(a, b, t) smoothstep(a, b, t)
		#define sat(x) clamp(x, 0., 1.)

		float remap01(float a, float b, float t) {
			return sat((t-a)/(b-a));
		}

        void main() {
        
        	
        	vec4 col = color;
        	
    		float d = length(vuv);


    		float edgeShade = remap01(.35, .5, d);
    		edgeShade *= edgeShade;
    		col.rgb *= 1.-edgeShade*.5;
		    
    		col.rgba = mix(col.rgba, vec4(0.0, .0, .0, 0), S(.47, .49, d));


            outColor = vec4(col);
        }
        `;

    this.create = function(ctx){
        this.gl = ctx;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.aspect = this.height / this.width;

        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.init();
        this.drawLoop = setInterval(
                (function(self) {
                    return function() {
                        self.draw(self.gl);
                    }
                })(this),
                1000/60 
                ); 
    }

    this.draw = function(gl){
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(this.program);


        for(var i = 0; i < this.shapes.length; i++){
        	gl.uniform2f(this.shapes[i].positionloc, this.shapes[i].position.x, this.shapes[i].position.y);
        	gl.uniform1f(this.shapes[i].scaleloc, this.shapes[i].size);
        	gl.uniform4f(this.shapes[i].colorloc, this.shapes[i].color.r, this.shapes[i].color.g, this.shapes[i].color.b, this.shapes[i].color.a);
        	gl.bindVertexArray(this.shapes[0].vao);


        	gl.drawArrays(gl.TRIANGLES, 0, 6);

        }
        
    }

    this.destroy = function(){
         clearInterval(this.drawLoop);
    }

    this.createCircle = function(){
    	var aspect = this.aspect;
    	var positions = [
            -1 * aspect, -1, 0, 0,
            1 * aspect, -1, 1 , 0,
            -1 * aspect, 1, 0, 1,
            -1 * aspect, 1, 0, 1,
            1 * aspect, -1, 1, 0,
            1 * aspect, 1, 1, 1
        ];


        return positions;
    }
    this.init = function(){
        var gl = this.gl;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 0);


        var program = createProgramFromSources(gl, this.vertexShaderSource, this.fragmentShaderSource);
        this.program = program;
        this.positionAttributeLocation = gl.getAttribLocation(program, "position");
        this.uvAttributeLocation = gl.getAttribLocation(program, "uv");

        var positionBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        
        this.vaos = [];
        this.shapes = [];

        var vao = gl.createVertexArray();
        this.vaos.push(vao);


        gl.bindVertexArray(vao);

        
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.createCircle()), gl.STATIC_DRAW);

       
        gl.enableVertexAttribArray(this.positionAttributeLocation);
        gl.enableVertexAttribArray(this.uvAttributeLocation);

        this.shapes.push(new shape(this.gl, vao, {x: 0.5, y:0},10, this.program));
        this.shapes.push(new shape(this.gl, vao, {x: -0.5, y:0},10, this.program));


        var size = 2;
        var type = gl.FLOAT;
        var normalize = false;
        var stride = 4 * 4;
        var offset = 0;
        gl.vertexAttribPointer( this.positionAttributeLocation, size, type, normalize, stride, offset);
        var size = 2;
        var type = gl.FLOAT;
        var normalize = false;
        var stride = 4 * 4;
        var offset = 2 * 4;
        gl.vertexAttribPointer( this.uvAttributeLocation, size, type, normalize, stride, offset);

 
    }

    this.onMouseMove = function(event){
    	if(this.focus){
    		this.focus.position.x = event.x / this.width  * 2 - 1;
    		this.focus.position.y = -1 * (event.y / this.height   * 2 - 1);
    	}
    	
    }

    this.onMouseDown = function(event){

    	var px = event.x / this.width  * 2 - 1;
    	var py = -1 * (event.y / this.height   * 2 - 1);

    	

   

    	for(var i = 0; i < this.shapes.length; i++){
    		var s = this.shapes[i];
    		var dx = px - s.position.x;
    		var dy = py - s.position.y;

    		dx /= this.aspect;
    		console.log(dx);
    		console.log(dy);


    		var dist = Math.sqrt(dx * dx + dy * dy);



    		if(dist < 1.0 / 100.0  * this.shapes[i].size){
    			this.focus = this.shapes[i];
    			this.focus.focus();
    			return;
    		}
    	}
    	
    }

    this.onMouseUp = function(event){
    	if(this.focus != null){
    		this.focus.unfocus();
    	}
    	this.focus = null;
    }


    function shape(gl, vao, position, size, program){
    	this.vao = vao;
    	this.position  = position;
    	this.positionloc = gl.getUniformLocation(program, "translation");
    	this.colorloc = gl.getUniformLocation(program, "color");
    	this.scaleloc = gl.getUniformLocation(program, "scale");

    	this.size = size;

    	this.color = {r: 1.0, g: 0.431, b: 0.780, a:1.0};


    	this.focus = function(){
    		this.color = {r: 0.3, g: 0.431, b: 1.0, a:1.0};
    	}
    	this.unfocus = function(){
    		this.color = {r: 1.0, g: 0.431, b: 0.780, a:1.0};
    	}
    
    }
}
