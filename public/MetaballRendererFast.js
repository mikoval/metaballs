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
        precision mediump float;
        in vec2 uv;
        out vec4 outColor;
        uniform sampler2D bucket;
        uniform sampler2D image;
        uniform vec2 res;
        
        void main() {
            float sum = 0.0;
            float show = 0.0;
            float aspect = res.x / res.y;

            


            float p = texture(bucket, uv).x - 1.0;

            vec2 uv2 = uv * 2.0 - 1.0;

            uv2.x *= aspect;

            float y = floor(p/DIMENSION);

            float x = p - y * DIMENSION;

            y /= DIMENSION;
            x /= DIMENSION;


            vec4 val = texture(image, vec2(x, y));

            float dist = length(val.xy - uv2);



            if(dist < SIZE){
				outColor = vec4(1.0, 0.0, 0.0, 1.0);
            }
            else {
            	outColor = vec4(0.0, 0.0, 0.0, 1.0);
            }
            
        }
        `;

    this.bucketVertex = `#version 300 es
        precision highp float;
        in vec2 position;
        out vec2 id;
        out vec2 pv;
        uniform vec2 res;
        uniform sampler2D image;
        void main() {
            gl_PointSize = 1.0;
            id = position * DIMENSION;

            float aspect = res.y / res.x;

            vec2 pos = texture(image, position).xy;

            pos.x *= aspect;

            pv = (pos + 1.0)/2.0;
            gl_Position = vec4(pos, 0, 1);
        }
        `;

    this.bucketFragment = `#version 300 es
        precision highp float;
        in vec2 id;
        in vec2 pv;
        out vec4 outColor;
        uniform sampler2D current;
        
        void main() {
            vec2 p = pv;
            vec4 c = texture(current, p.xy);
            float val = id.x + id.y * DIMENSION + 1.0;
           
            
            
            
            
            for(int i = 0; i < 4; i++){
                if(abs(c[i] - val) < 0.1) {
                    discard;
                }
                if(c[i] < 1.0){
                    c[i] = val;
                    break;
                }
            }
            
            
            
           
            outColor = c;
        }
        `;

	this.init = function(gl, size, particleSize) {

		this.gl = gl;
		this.size = size;
		this.particleSize = particleSize;



		this.bucketObj = new bucketProgram(gl, this.bucketVertex, this.bucketFragment, particleSize, size);

		this.bucketVao = createBucketVao(gl, this.bucketObj.attrPosition, size);

        this.bucketTarget = createRenderTarget(gl, size * 2, size * 2, null);
        this.bucketTarget2 = createRenderTarget(gl, size * 2, size * 2, null);


        this.showParticleObj = new showParticleProgram(gl, this.metaballVertex, this.metaballFragment, particleSize, size);

        this.vao = createVao(gl, this.showParticleObj.uniformPosition, size);
	}

	this.draw = function(state){


        this.updateBucket(state);

        this.drawMetaballs(state);


	}

    this.updateBucket = function(state){
        var gl = this.gl;


        /* clear previous run */
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.bucketTarget2.fb);
        gl.clearColor(0.0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        
        gl.disable(gl.BLEND);



        gl.bindFramebuffer(gl.FRAMEBUFFER, this.bucketTarget.fb);

        gl.viewport(0, 0, this.bucketTarget.fb.width, this.bucketTarget.fb.height);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(this.bucketObj.program);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, state.texture);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.bucketTarget2.texture);



        gl.uniform1i(this.bucketObj.uniformImage, 0);
        gl.uniform1i(this.bucketObj.uniformImage2, 1);

        gl.bindVertexArray(this.bucketVao);

        gl.uniform2f(this.bucketObj.uniformRes, gl.canvas.width, gl.canvas.height);


        for(var i = 0; i < 4; i++){
            gl.drawArrays(gl.POINTS, 0, this.size * this.size);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.bucketTarget2.texture);
            gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, this.bucketTarget2.fb.width, this.bucketTarget2.fb.height, 0);
        }
        /*
        var fb = this.bucketTarget.fb;
        var pixels = new Float32Array(fb.width * fb.height * 4);
        gl.readPixels(0, 0, fb.width, fb.height, gl.RGBA, gl.FLOAT, pixels); 
        console.log(pixels);
		*.

        /* clear previous run */
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.bucketTarget2.fb);
        gl.clearColor(0.0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    }

    this.drawMetaballs = function(state){

        var gl = this.gl;


        
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

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.bucketTarget.fb);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        var fb = this.bucketTarget.fb;
        var pixels = new Float32Array(fb.width * fb.height * 4);
        gl.readPixels(0, 0, fb.width, fb.height, gl.RGBA, gl.FLOAT, pixels); 
        console.log(pixels);



        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }


    this.getBucket = function(){

        return this.bucketTarget;
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

    var bucketProgram = function(gl, vertex, fragment, particleSize, size){
    	this.program = createProgramFromSources(gl,
            parse(vertex, particleSize, size),
            parse(fragment, particleSize, size));
    	this.attrPosition = gl.getAttribLocation(this.program, "position");
    	this.uniformImage = gl.getUniformLocation(this.program, "image");
        this.uniformImage2 = gl.getUniformLocation(this.program, "current");

        this.uniformRes = gl.getUniformLocation(this.program, "res");

        console.log(this.uniformRes);
    }

    var parse = function(str, size, dimension){


        str =  str.replace(/SIZE/g, size).replace(/DIMENSION/g, dimension + ".0")

        console.log(str);
                
        return str;
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

    var createBucketVao = function(gl, location, size){
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

        return vao;
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