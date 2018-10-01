function MetaballRenderer(){
    this.vertex = `#version 300 es
        in vec2 position;
        out vec2 uv;
        uniform vec2 res;
        void main() {
            uv = position * 2.0 - 1.0;
            
            vec2 position0 = position * 2.0 - 1.0;
            gl_Position = vec4(position0, 0, 1);
        }
        `;

    this.fragment = `#version 300 es
        precision mediump float;
        in vec2 uv;
        out vec4 outColor;
        uniform sampler2D image;
        
        void main() {
            float sum = 0.0;
            float show = 0.0;

            float r =  SIZE * SIZE;

            for(float i = 0.5; i < DIMENSION; i++){
                for(float j = 0.5; j < DIMENSION; j++){
                    vec2 coord = vec2(i / DIMENSION, j / DIMENSION);
                    vec2 p = texture(image, coord).xy;

                    vec2 d = uv - p;
                    sum += (r) / (d.x * d.x + d.y * d.y);
                    
                }
            }
            
   
            if(sum > 1.0){
                show = 1.0;
            }


            outColor = vec4(vec3(show), 1.0) ;
        }
        `;

	this.init = function(gl, size) {

		this.gl = gl;
		this.size = size;

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		this.gl.clearColor(0, 0, 0, 1.0);


		this.showParticleObj = new showParticleProgram(gl, this.vertex, this.fragment, size);

		this.vao = createVao(gl, this.showParticleObj.uniformPosition, size);

	}

	this.draw = function(state){

		var gl = this.gl;
        
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.useProgram(this.showParticleObj.program);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, state.texture);

        gl.uniform1i(this.showParticleObj.uniformImage, 0);

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

    var showParticleProgram = function(gl, vertex, fragment, size){
    	this.program = createProgramFromSources(gl,
            parse(vertex, 0.03, size),
            parse(fragment, 0.03, size));
    	this.uniformPosition = gl.getAttribLocation(this.program, "position");
    	this.uniformImage = gl.getUniformLocation(this.program, "image");
        console.log(this.uniformPosition);


    }

    var parse = function(str, size, dimension){


        str =  str.replace(/SIZE/g, size).replace(/DIMENSION/g, dimension + ".0")

        console.log(str);
                
        return str;
    }

}