function DensityBucketCalculator(){
    this.densityVertex = `#version 300 es
        in vec2 position;
        out vec2 uv;
        uniform vec2 res;
        void main() {
            uv = position; 
            vec2 position0 = position * 2.0 - 1.0;
            gl_Position = vec4(position0, 0, 1);
        }
        `;    
    this.densityFragment= `#version 300 es
        precision highp float;
        in vec2 uv;
        out vec4 outColor;
        uniform sampler2D pos;
        uniform sampler2D bucket;
        uniform vec2 res;
        uniform vec2 b_res;


        void main() {
        
            float aspect = res.x / res.y;


            vec2 p = uv * vec2(float(b_res.x), float(b_res.y));
            ivec2 ipos = ivec2(floor(p));

            ivec2 bStart = ipos * ivec2(WIDTH, HEIGHT);

            float count = 0.0;

            ivec2 tmp = ivec2(0.0);

            float iSize = float(textureSize(pos, 0).x);;

            vec2 avg = vec2(0.0);

            for(int i = 0; i < WIDTH; i++){
                for(int j = 0; j < HEIGHT; j++){
                    ivec2 ind = bStart + ivec2(i, j);
                    vec4 particle_ind = texelFetch(bucket, ivec2(ind), 0) - 1.0;
                    for(int k = 0; k < 4; k++){
                        float p = particle_ind[k];
                        if(particle_ind[k] >= 0.0){
                            float y = floor(p/iSize);

                            float x = p - y * iSize;

                            y /= iSize;
                            x /= iSize;
                            x += 0.5 / iSize;
                            y += 0.5 / iSize;

                            vec4 val = texture(pos, vec2(x, y));

                            avg += val.xy;

                            count++;
                        }
                    }                
                        
                }
            }

            if(count > 0.0){
                avg /= count;

            }

            outColor = vec4(avg, count, 0.0);

        }
        `;

	this.init = function(gl, bucketSize, scale) {

		this.gl = gl;
		this.scale = scale;
		this.bucketSize = bucketSize;


        var mag = Math.floor(bucketSize/scale);

        this.densityRes = mag;

		this.densityObj = new densityProgram(gl, this.densityVertex, this.parse(this.densityFragment, this.scale));
		this.densityVao = createDensityVao(gl, this.densityObj.attrPosition);

       

        this.densityTarget = createRenderTarget(gl, mag, mag, null);
	}

    this.calculateDensity = function(bucket, state){

        var gl = this.gl;

       gl.bindFramebuffer(gl.FRAMEBUFFER, this.densityTarget.fb);

        gl.viewport(0, 0, this.densityTarget.fb.width, this.densityTarget.fb.height); 

        gl.useProgram(this.densityObj.program);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, state.texture);
        gl.uniform1i(this.densityObj.positionUniform , 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, bucket.texture);
        gl.uniform1i(this.densityObj.bucketUniform , 1);

        gl.uniform2f(this.densityObj.uniformRes , gl.canvas.width, gl.canvas.height);
        gl.uniform2f(this.densityObj.uniformSize , this.densityRes, this.densityRes);

        gl.bindVertexArray(this.densityVao);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        
        var fb = this.densityTarget.fb;
        var pixels = new Float32Array(fb.width * fb.height * 4);
        gl.readPixels(0, 0, fb.width, fb.height, gl.RGBA, gl.FLOAT, pixels); 
        console.log(pixels);


        return this.densityTarget;
    }


    var createDensityVao = function(gl, location){
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

    var densityProgram = function(gl, vertex, fragment){
    	this.program = createProgramFromSources(gl,vertex,fragment);

    	this.attrPosition = gl.getAttribLocation(this.program, "position");
    	this.bucketUniform = gl.getUniformLocation(this.program, "bucket");
        this.positionUniform = gl.getUniformLocation(this.program, "pos");

        this.uniformRes = gl.getUniformLocation(this.program, "res");
        this.uniformSize = gl.getUniformLocation(this.program, "b_res");

        console.log(this.uniformRes);
    }

    var createRenderTarget = function(gl, width, height, data){
        const fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        fb.width = width;
        fb.height = height;
        if (gl.getExtension("OES_texture_float_linear") === null) {
            alert("No float support.");
        }
        if (gl.getExtension("EXT_color_buffer_float") === null) {
            alert("No float support.");
        }


         var texture = gl.createTexture();
        
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Because images have to be download over the internet
        // they might take a moment until they are ready.
        // Until then put a single pixel in the texture so we can
        // use it immediately. When the image has finished downloading
        // we'll update the texture with the contents of the image.
        const level = 0;
        const internalFormat = gl.RGBA;

        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.FLOAT;

        var pixel;
        if(data != null){
            pixel = new Float32Array(data);  // opaque blue
        } else{
            pixel = null;
        }
         
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, pixel);

      

         
        // attach the texture as the first color attachment
        const attachmentPoint = gl.COLOR_ATTACHMENT0;
        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, texture, level);

       
        // create a depth renderbuffer
        const depthBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
         
        // make a depth buffer and the same size as the targetTexture
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);


        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
            console.log(gl.checkFramebufferStatus(gl.FRAMEBUFFER));
        }


        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        

        
        return {texture: texture, fb: fb};
    }

    this.parse = function(string, mag){
        var str =  string.replace(/WIDTH/g, mag).replace(/HEIGHT/g, mag);
        return str;
    }
}
