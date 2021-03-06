function ParticleRenderer(){
	this.vertex = `#version 300 es
        in vec2 position;
        out vec2 uv;
        uniform sampler2D image;
        uniform vec2 res;
        uniform float size;
        void main() {
            float aspect = res.x/res.y;
        	 gl_PointSize = res.y * size;
            vec2 pos = texture(image, position).xy;
            pos.x /= aspect;
            gl_Position = vec4(pos, 0, 1);
        }
        `;

    this.fragment = `#version 300 es
        precision mediump float;
        in vec2 uv;
        out vec4 outColor;
        
        
        void main() {
   			vec2 cxy = 2.0 * gl_PointCoord - 1.0;
		    float r = dot(cxy, cxy);

      
		   
		    float val = smoothstep(1.0, 0.95, r);
            outColor = vec4(val) ;
        }
        `;

	this.init = function(gl, gridSize, particleSize) {

		this.gl = gl;
		this.size = gridSize;
        this.particleSize = particleSize;

		this.gl.clearColor(0, 0, 0, 1.0);


		this.showParticleObj = new showParticleProgram(gl, this.vertex, this.fragment);
		this.vao = createVao(gl, this.showParticleObj.uniformPosition, this.size);

	}

	this.draw = function(state){

		var gl = this.gl;

        gl.enable(gl.BLEND);

        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        this.gl.clearColor(0, 0, 0, 1.0);


        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);



        this.showTexture(state);
	}
	this.showTexture = function(texture){
		var gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.useProgram(this.showParticleObj.program);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture.texture);
        gl.uniform1i(this.showParticleObj.uniformImage, 0);


        gl.uniform2f(this.showParticleObj.uniformRes, gl.canvas.width, gl.canvas.height);

        gl.uniform1f(this.showParticleObj.uniformSize, this.particleSize);

        gl.bindVertexArray(this.vao);
        gl.drawArrays(gl.POINTS, 0, this.size * this.size);
    }

    var createVao = function(gl, location, size){
        var vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        var positionBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        var positions = [];
        for(var i = 0; i < size; i++){
            for( var j = 0; j < size; j++){
                positions.push(j/size);
                positions.push(i/size);
            }
        }

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        gl.enableVertexAttribArray(location);

        var size = 2;
        var type = gl.FLOAT;
        var normalize = false;
        var stride = 0;
        var offset = 0;
        gl.vertexAttribPointer( location, size, type, normalize, stride, offset);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);


        return vao;
    }

    var showParticleProgram = function(gl, vertex, fragment){
    	this.program = createProgramFromSources(gl, vertex, fragment);
    	this.uniformPosition = gl.getAttribLocation(this.program, "position");
    	this.uniformImage = gl.getUniformLocation(this.program, "image");
        this.uniformRes = gl.getUniformLocation(this.program, "res");
        this.uniformSize = gl.getUniformLocation(this.program, "size");




    }

}