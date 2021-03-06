function NoPhysicsSystem(){
    this.vertexUpdate = `#version 300 es
        in vec2 position;
        out vec2 uv;
        uniform vec2 res;
        void main() {
            uv = position; 
            vec2 position0 = position * 2.0 - 1.0;
            gl_Position = vec4(position0, 0, 1);
        }
        `;

    this.fragmentUpdate = `#version 300 es
        precision mediump float;
        in vec2 uv;
        out vec4 outColor;
        uniform sampler2D pos;
        uniform sampler2D pos_old;
     
        void main() {
            vec4 p = texture(pos, uv);
            vec4 p2 = texture(pos_old, uv); 
            float dx = p.x - p2.x;
            float dy = p.y - p2.y;
            p.x += dx;
            p.y += dy;
            outColor = vec4(p);
        }
        `;

    this.vertexUpdateOld = `#version 300 es
        precision mediump float;
        in vec2 position;
        out vec2 uv;
        uniform vec2 res;
        void main() {
            uv = position;
            
            
            vec2 position0 = position * 2.0 - 1.0;
            gl_Position = vec4(position0, 0, 1);
        }
        `;

    this.fragmentUpdateOld = `#version 300 es
        precision mediump float;
        in vec2 uv;
        out vec4 outColor;
        uniform sampler2D pos;
        uniform sampler2D pos_old;
        uniform vec2 res;
     
     
        
        void main() {
            vec4 p = texture(pos, uv);
            vec4 p2 = texture(pos_old, uv); 
            float dx = (p.x - p2.x) ;
            float dy = (p.y - p2.y) ;
            float radius = 0.0;//0.03;
            float aspect = res.x / res.y;
            if(p.x + 2.0 * dx > 1.0 * aspect  - radius || p.x + 2.0 * dx< -1.0 *aspect + radius){
                p.x = p.x + 2.0 * dx;
            }
            if(p.y + 2.0 *  dy > 1.0 - radius || p.y + 2.0 * dy< -1.0 + radius){
                p.y = p.y + 2.0 * dy;
            }
            outColor = vec4(p);
        }
        `;


	this.init = function(gl, size, particleSize){
		this.size = size;
        this.particleSize = particleSize;
		console.log(gl);
		this.gl = gl;

		var ballTextures = new ballTexture(gl, size);
        this.particle1 = ballTextures.texture1;
        this.particle2 = ballTextures.texture2;
        this.particle3 = ballTextures.texture3;
        this.particle4 = ballTextures.texture4;

        this.updateObject = {};

        this.updateObject.program = createProgramFromSources(gl, this.vertexUpdate, this.fragmentUpdate);
        this.updateObject.position = gl.getAttribLocation(this.updateObject.program, "position");
        this.updateObject.positionUniform = gl.getUniformLocation(this.updateObject.program, "pos");
        this.updateObject.positionOldUniform = gl.getUniformLocation(this.updateObject.program, "pos_old");

        this.updateObjectOld = {};
        this.updateObjectOld.program = createProgramFromSources(gl, this.vertexUpdateOld, this.fragmentUpdateOld);
        this.updateObjectOld.position = gl.getAttribLocation(this.updateObjectOld.program, "position");
        this.updateObjectOld.positionUniform = gl.getUniformLocation(this.updateObjectOld.program, "pos");
        this.updateObjectOld.positionOldUniform = gl.getUniformLocation(this.updateObjectOld.program, "pos_old");
        this.updateObjectOld.positionResUniform2 = gl.getUniformLocation(this.updateObjectOld.program, "res");


        this.updateVao = createVao(gl, this.updateObject.position);
        this.updateOldVao = createVao(gl, this.updateObjectOld.position);

	}



	this.getState = function(){
		return this.particle1;
	}
    this.update = function(){
        this.updatePosition();
        this.updatePositionOld();
        

        var tmp = this.particle3;
        var tmp2 = this.particle4;
        this.particle3 =  this.particle1;
        this.particle1 = tmp;
        this.particle4 =  this.particle2;
        this.particle2 = tmp2;


    }

    this.updatePosition = function(){
        var gl = this.gl;

                /* update position */
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.particle3.fb);

        gl.viewport(0, 0, this.particle3.fb.width, this.particle3.fb.height); 


        gl.useProgram(this.updateObject.program);


        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.particle1.texture);
        gl.uniform1i(this.updateObject.positionUniform , 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.particle2.texture);
        gl.uniform1i(this.updateObject.positionOldUniform , 1);

        gl.bindVertexArray(this.updateVao);




        gl.drawArrays(gl.TRIANGLES, 0, 6);

    }


    this.updatePositionOld = function(){
        var gl = this.gl;

        /* Update Olds */
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.particle4.fb);
        gl.viewport(0, 0, this.particle4.fb.width, this.particle4.fb.height); 

        gl.useProgram(this.updateObjectOld.program);


        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.particle1.texture);
        gl.uniform1i(this.updateObjectOld.positionUniform , 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.particle2.texture);
        gl.uniform1i(this.updateObjectOld.positionOldUniform , 1);

        gl.uniform2f(this.updateObjectOld.positionResUniform2 , gl.canvas.width, gl.canvas.height);

        gl.bindVertexArray(this.updateOldVao);

        gl.drawArrays(gl.TRIANGLES, 0, 6);


    }



    var ballTexture = function(gl, size){
    	var SPEED = .01;
    	this.gl = gl;
        gl.getExtension('OES_texture_float');
        gl.getExtension('OES_texture_float_linear')
        // create to render to
        this.width = size;
        this.height = size;

        var data = [];
        for(var i = 0; i < this.width * this.height; i++){

            //data.push(0.0);
            //data.push(0.0);

         
            data.push((Math.random()- 0.5) * 1.9);
            data.push((Math.random()- 0.5) * 1.9);
            data.push(0.0);
            



            data.push(1.0);
        }
        //console.log(data);

        var data2 = [];
        for(var i = 0; i < this.width * this.height; i++){
            
            data2.push(data[4 * i] + (Math.random()- 0.5) * SPEED);
            data2.push(data[4 * i + 1] + (Math.random()- 0.5) * SPEED);
			data2.push(0.0);
            
        
            data2.push(1.0);
        }


        this.texture1 = createRenderTarget(gl, this.width, this.height, data);
        this.texture2 = createRenderTarget(gl, this.width, this.height, data2);
        this.texture3 = createRenderTarget(gl, this.width, this.height, null);
        this.texture4 = createRenderTarget(gl, this.width, this.height, null); 
 


       


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
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F,
                    width, height, 0, gl.RGBA, gl.FLOAT, pixel);

      

         
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


        return vao;
    }
}