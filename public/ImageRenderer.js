function ImageRenderer(){
	this.vertexShowTexture = `#version 300 es
        in vec2 position;
        out vec2 uv;
        uniform vec2 res;
        void main() {
            uv = position;
            
            vec2 position0 = position * 2.0 - 1.0;
            gl_Position = vec4(position0, 0, 1);
        }
        `;

    this.fragmentShowTexture = `#version 300 es
        precision mediump float;
        in vec2 uv;
        out vec4 outColor;
        uniform sampler2D image;
        
        void main() {
            vec4 p = texture(image, uv);
   
            outColor = vec4(p.xyz, 1.0) ;
        }
        `;

	this.init = function(gl) {

		this.gl = gl;

		this.gl.clearColor(0, 0, 0, 1.0);


		this.showTextureObj = new showTextureProgram(gl, this.vertexShowTexture, this.fragmentShowTexture);
		this.vao = createVao(gl, this.showTextureObj.uniformPosition);

	}

	this.draw = function(state){
		var gl = this.gl;
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.showTexture(state);
	}
	this.showTexture = function(texture){
		var gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.useProgram(this.showTextureObj.program);

        gl.activeTexture(gl.TEXTURE0);
        console.log(texture.texture);
        gl.bindTexture(gl.TEXTURE_2D, texture.texture);
        gl.uniform1i(this.showTextureObj.imageUniform, 0);

        gl.bindVertexArray(this.vao);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    var createVao = function(gl, location){
        var vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        var positionBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        var positions = [
            0, 0,
            1, 0,
            0, 1,
            0, 1,
            1, 0,
            1, 1,
        ];
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

    var showTextureProgram = function(gl, vertex, fragment){
    	this.program = createProgramFromSources(gl, vertex, fragment);
    	this.uniformPosition = gl.getAttribLocation(this.program, "position");
    	this.uniformImage = gl.getUniformLocation(this.program, "image");


    }

}