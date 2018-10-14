function MetaballRendererFast(){
    this.metaballVertex = `#version 300 es
        in vec2 position;
        out vec2 uv;
        
        void main() {
            uv = position;
            vec2 position0 = position * 2.0 - 1.0;
            gl_Position = vec4(position0, 0, 1);
        }
        `;

    this.metaballFragment = `#version 300 es
        precision highp float;
        in vec2 uv;
        out vec4 outColor;
        uniform sampler2D bucket;
        uniform sampler2D image;
        uniform vec2 res;
        float rand(vec2 co){
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }

        void main() {
            float sum = 0.0;
            float show = 0.0;
            float aspect = res.x / res.y;



            float bSize = float(textureSize(bucket, 0).x);;
            float iSize = float(textureSize(image, 0).x);;

            float r = SIZE * SIZE;

            ivec2 bucketPos = ivec2(uv * bSize );
           


            for(float i =-3.0; i <= 3.0; i++){
            	for(float j = -3.0; j <= 3.0; j++){
            		ivec2 uv2 = bucketPos  + ivec2 (i, j);
	            	vec4 point = texelFetch(bucket, uv2, 0) - 1.0;
            		for(int k = 0; k < 4; k++){
            			float p = point[k];
	            		if(p < 0.0 || uv2.x < 0 || uv2.y < 0 || uv2.x > int(bSize) || uv2.y > int(bSize)){
	            			continue;
	            		}

	            		

	            		vec2 uv3 = uv * 2.0 - 1.0;

			            uv3.x *= aspect;
			            float y = floor(p/iSize);

			            float x = p - y * iSize;

			            y /= iSize;
			            x /= iSize;
			            x += 0.5 / iSize;
			            y += 0.5 / iSize;


			            vec4 val = texture(image, vec2(x, y));

			            vec2 d = val.xy - uv3;

			            sum += (r) / (d.x * d.x + d.y * d.y);
            		}
            		
            	}
            }



          
    		float red = 0.0;
    		float green = 0.0;
    		float blue = 0.0;

    		if(sum > 1.0){
    			outColor = vec4(1.0);            

    		} else {
                /*
                float r = rand(vec2(bucketPos));
                float g = rand(vec2(bucketPos * 2));
                float b = rand(vec2(bucketPos * 3));
    		 	outColor = vec4(r, g, b, 1.0);       
                */
                outColor = vec4(0.0, 0.0, 0.0, 1.0);     

    		}
        }
        `;


	this.init = function(gl, size, particleSize) {

		this.gl = gl;
		this.size = size;
		this.particleSize = particleSize;

        this.bucketer = new ParticleBucketer();
        this.bucketer.init(gl, size, particleSize);


        this.showParticleObj = new showParticleProgram(gl, this.metaballVertex, this.metaballFragment, particleSize, size);

        this.vao = createVao(gl, this.showParticleObj.uniformPosition, size);

	}

	this.draw = function(state){


        this.bucketTarget = this.bucketer.bucket(state);

        this.drawMetaballs(state);


	}

    this.drawMetaballs = function(state){

        var gl = this.gl;

        gl.enable(gl.BLEND);
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(this.showParticleObj.program);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.bucketTarget.texture);
        gl.uniform1i(this.showParticleObj.uniformBucket, 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, state.texture);
        gl.uniform1i(this.showParticleObj.uniformImage, 1);


        gl.uniform2f(this.showParticleObj.uniformRes, gl.canvas.width, gl.canvas.height);

        gl.bindVertexArray(this.vao);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    var parse = function(str, size, dimension){


        str =  str.replace(/SIZE/g, size).replace(/DIMENSION/g, dimension + ".0")

        console.log(str);
                
        return str;
    }

    var showParticleProgram = function(gl, vertex, fragment, particleSize, size){
        this.program = createProgramFromSources(gl,
            parse(vertex, particleSize, size),
            parse(fragment, particleSize, size));

        this.uniformPosition = gl.getAttribLocation(this.program, "position");

        this.uniformImage = gl.getUniformLocation(this.program, "image");
        this.uniformBucket = gl.getUniformLocation(this.program, "bucket");

        this.uniformRes = gl.getUniformLocation(this.program, "res");

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
}
