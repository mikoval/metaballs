function BasicPhysicsSystem(){
    this.vertexAttraction = `#version 300 es
        in vec2 position;
        out vec2 uv;
        uniform vec2 res;
        void main() {
            uv = position; 
            vec2 position0 = position * 2.0 - 1.0;
            gl_Position = vec4(position0, 0, 1);
        }
        `;    
    this.fragmentAttraction = `#version 300 es
        precision highp float;
        in vec2 uv;
        out vec4 outColor;
        uniform sampler2D pos;
        uniform sampler2D bucket;
        uniform vec2 res;
        uniform vec2 mouse;
    
        
        float rand(vec2 co){
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }
        void main() {
            float aspect = res.y / res.x;

            float size = float(textureSize(pos, 0).x);
            float bSize = float(textureSize(bucket, 0).x);
            ivec2 coord = ivec2(uv * size);


            vec4 p = texelFetch(pos, coord, 0);

            vec2 bucketPos = p.xy;
            bucketPos.x *= aspect;
            bucketPos = (bucketPos + 1.0)/2.0;

            ivec2 bucketPosInt = ivec2(floor(bucketPos * bSize));

            vec2 delta = vec2(0.0);
            for(int i = -5; i <=5; i++){
                for(int j = -3; j <=3; j++){
                    vec4 p2 = vec4(float(i)/2.0, float(j)/3.0, 1.0, 0.0);

                    vec2 diff = p.xy - p2.xy;

                    float dist = length(diff);
                  
                    float mag =  p2.z * clamp(.00001 / (dist * dist * dist * dist), 0.0, 0.01);
                    
                    delta -= diff  * mag;
                }
            }
           
            p.xy += delta;


            outColor = vec4(p);

    
        }
        `;
    this.vertexCollision = `#version 300 es
        in vec2 position;
        out vec2 uv;
        uniform vec2 res;
        void main() {
            uv = position; 
            vec2 position0 = position * 2.0 - 1.0;
            gl_Position = vec4(position0, 0, 1);
        }
        `;    
    this.fragmentCollision = `#version 300 es
        precision highp float;
        in vec2 uv;
        out vec4 outColor;
        uniform sampler2D pos;
        uniform sampler2D bucket;
        uniform vec2 res;
        uniform vec2 mouse;
	
        
        float rand(vec2 co){
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }
        void main() {
            float aspect = res.y / res.x;

            float size = float(textureSize(pos, 0).x);
            float bSize = float(textureSize(bucket, 0).x);
            ivec2 coord = ivec2(uv * size);


            vec4 p = texelFetch(pos, coord, 0);

            vec2 bucketPos = p.xy;
            bucketPos.x *= aspect;
            bucketPos = (bucketPos + 1.0)/2.0;

            ivec2 bucketPosInt = ivec2(floor(bucketPos * bSize));

            int ind1 = coord.y * int(size) + coord.x;


            float target = 3.0 * SIZE;
            int count = 0;
	    vec2 delta = vec2(0.0);
            for(int i = -1; i <= 1; i++){
                for(int j = -1; j <= 1; j++){

                    ivec2 bucketPos2 = bucketPosInt + ivec2(i, j);

                    vec4 bucketPositions = texelFetch(bucket, bucketPos2, 0) - 1.0;

                    for(int k = 0; k < 4; k++){
                        float current_p = bucketPositions[k];

                            if(current_p < 0.0 || bucketPos2.x < 0 || bucketPos2.y < 0 || bucketPos2.x >= int(bSize) || bucketPos2.y >= int(bSize)){

                                continue;
                            }

                            float y = floor(current_p/size);

                            float x = current_p - y * size;

                            int ind2 = int(y) * int(size) + int(x);

                            if(ind1 == ind2){
                                continue;
                            }




                            y /= size;
                            x /= size;
                            x += 0.5 / size;
                            y += 0.5 / size;


                            vec4 p2 = texture(pos, vec2(x, y));



                                       
                            vec2 diff = p.xy - p2.xy;


                            float dist = length(diff);



                              
                            if(dist <= target){
                                float factor = (dist-target)/dist;
                                delta.x -= diff.x * factor * 0.01;
                                delta.y -= diff.y * factor * 0.01;
                            } 

                        }
                    
                }
            }
		p.xy+=delta;
                        vec2 p2 = vec2(mouse.x, mouse.y);
			p2 = p2 * 2.0 - 1.0;
			p2.x /= aspect;
			p2.y *= -1.0;
                                   
                        vec2 diff = p.xy - p2.xy;


                        float dist = abs(length(diff));



                         target = 0.2; 
                        if(dist <= target ){
                            float factor = (dist-target)/dist;
                            p.x -= diff.x * factor * 0.01;
                            p.y -= diff.y * factor * 0.01;
                        }
            

            outColor = vec4(p);

           //outColor = vec4(count, 0.0, 0.0, 0.0);
    
        }
        `;
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
        precision highp float;
        in vec2 uv;
        out vec4 outColor;
        uniform sampler2D pos;
        uniform sampler2D pos_old;
        uniform vec2 res;
        uniform float time;
        
        float rand(vec2 co){
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
        }
        void main() {
            vec4 p = texture(pos, uv);
            vec4 p2 = texture(pos_old, uv); 
            float dx = p.x - p2.x;
            float dy = p.y - p2.y;
            dx *= .95;
            dy *= .95;
            float aspect = res.x / res.y;


            p.x += dx;
            p.y += dy;


            p.x += 0.0 * (rand(uv + 2.0 * time) - 0.5);
            p.y += 0.0 * (rand(uv + 1.0 * time) - 0.5);

            float radius = float(SIZE);


            if(p.x > 1.0 * aspect  - radius){
                p.x = 1.0 * aspect  - radius;
            }
            if(p.x< -1.0 *aspect + radius){
                p.x = -1.0 * aspect  + radius;
            }

            if(p.y > 1.0 - radius ){
                p.y = 1.0 - radius  ;

            }
            if(p.y< -1.0 + radius ){
                p.y = -1.0 + radius ;

            }



            outColor = vec4(p);
        }
        `;

    this.vertexConstrain = `#version 300 es
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

    this.fragmentConstrain = `#version 300 es
        precision mediump float;
        in vec2 uv;
        out vec4 outColor;
        uniform sampler2D pos;
        uniform sampler2D pos_old;
        uniform vec2 res;
     
     
        
        void main() {
            vec4 p = texture(pos, uv);
  


            float radius = float(SIZE);
            float aspect = res.x / res.y;

            if(p.x > 1.0 * aspect  - radius){
                p.x = 1.0 * aspect  - radius;
            }
            if(p.x< -1.0 *aspect + radius){
                p.x = -1.0 * aspect  + radius;
            }

            if(p.y > 1.0 - radius ){
                p.y = 1.0 - radius ;
            }
            if(p.y< -1.0 + radius ){
                p.y = -1.0 + radius ;
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

        this.count = 0.0;

        this.updateObject.program = createProgramFromSources(gl,
             parse(this.vertexUpdate, this.size, this.particleSize), parse(this.fragmentUpdate, this.size, this.particleSize));
        this.updateObject.position = gl.getAttribLocation(this.updateObject.program, "position");
        this.updateObject.positionUniform = gl.getUniformLocation(this.updateObject.program, "pos");
        this.updateObject.positionOldUniform = gl.getUniformLocation(this.updateObject.program, "pos_old");
        this.updateObject.positionResUniform = gl.getUniformLocation(this.updateObject.program, "res");
        this.updateObject.timeUniform = gl.getUniformLocation(this.updateObject.program, "time");


        this.constrainObject = {};
        this.constrainObject.program = createProgramFromSources(gl, 
            parse(this.vertexConstrain, this.size, this.particleSize), parse(this.fragmentConstrain, this.size, this.particleSize));
        this.constrainObject.position = gl.getAttribLocation(this.constrainObject.program, "position");
        this.constrainObject.positionUniform = gl.getUniformLocation(this.constrainObject.program, "pos");
        this.constrainObject.positionOldUniform = gl.getUniformLocation(this.constrainObject.program, "pos_old");
        this.constrainObject.positionResUniform = gl.getUniformLocation(this.constrainObject.program, "res");


        this.collisionObject = {};
        this.collisionObject.program = createProgramFromSources(gl, 
            parse(this.vertexCollision, this.size, this.particleSize), parse(this.fragmentCollision, this.size, this.particleSize));
        this.collisionObject.position = gl.getAttribLocation(this.collisionObject.program, "position");
        this.collisionObject.positionUniform = gl.getUniformLocation(this.collisionObject.program, "pos");
        this.collisionObject.positionResUniform = gl.getUniformLocation(this.collisionObject.program, "res");
        this.collisionObject.mouseUniform = gl.getUniformLocation(this.collisionObject.program, "mouse");
        this.collisionObject.bucketUniform = gl.getUniformLocation(this.collisionObject.program, "bucket");

        this.attractionObject = {};
        this.attractionObject.program = createProgramFromSources(gl, 
            parse(this.vertexAttraction, this.size, this.particleSize), parse(this.fragmentAttraction, this.size, this.particleSize));
        this.attractionObject.position = gl.getAttribLocation(this.attractionObject.program, "position");
        this.attractionObject.positionUniform = gl.getUniformLocation(this.attractionObject.program, "pos");
        this.attractionObject.positionResUniform = gl.getUniformLocation(this.attractionObject.program, "res");
        this.attractionObject.mouseUniform = gl.getUniformLocation(this.attractionObject.program, "mouse");
        this.attractionObject.bucketUniform = gl.getUniformLocation(this.attractionObject.program, "bucket");



        this.updateVao = createVao(gl, this.updateObject.position);
        this.constrainVao = createVao(gl, this.constrainObject.position);
        this.collisionVao = createVao(gl, this.collisionObject.position);
        this.attractionVao = createVao(gl, this.collisionObject.position);



        this.bucketer = new ParticleBucketer();
        this.bucketer.init(gl, size, particleSize);
        this.bucketer.initDensityCalculator();

    }



    this.getState = function(){
        return this.particle1;
    }
    this.update = function(){
        this.count += 0.1;

        this.updatePosition();
       
        this.bucketTarget = this.bucketer.bucket(this.particle1);


        
            for(var i = 0; i < 1 ; i++){
                this.attract();

		    for(var j = 0; j < 50 ; j++){

			this.collision();
			this.constrain();
		    }
	    }
        



    }

    this.attract = function(){
        var gl = this.gl;

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.particle3.fb);

        gl.viewport(0, 0, this.particle3.fb.width, this.particle3.fb.height); 

        gl.useProgram(this.attractionObject.program);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.particle1.texture);
        gl.uniform1i(this.attractionObject.positionUniform , 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.bucketTarget.texture);
        gl.uniform1i(this.attractionObject.bucketUniform , 1);

        gl.uniform2f(this.attractionObject.positionResUniform , gl.canvas.width, gl.canvas.height);

        gl.bindVertexArray(this.attractionVao);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        var tmp = this.particle3
        this.particle3 =  this.particle1;
        this.particle1 =  tmp;
    }

    this.collision = function(){
        var gl = this.gl;

                /* update position */
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.particle3.fb);

        gl.viewport(0, 0, this.particle3.fb.width, this.particle3.fb.height); 

        gl.useProgram(this.collisionObject.program);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.particle1.texture);
        gl.uniform1i(this.collisionObject.positionUniform , 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.bucketTarget.texture);
        gl.uniform1i(this.collisionObject.bucketUniform , 1);

        gl.uniform2f(this.collisionObject.positionResUniform , gl.canvas.width, gl.canvas.height);

        gl.bindVertexArray(this.collisionVao);


        gl.uniform2f(this.collisionObject.mouseUniform , this.x/gl.canvas.width, this.y/gl.canvas.height);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        var tmp = this.particle3
        this.particle3 =  this.particle1;
        this.particle1 =  tmp;


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
        gl.uniform1f(this.updateObject.timeUniform , this.count);

        gl.uniform2f(this.updateObject.positionResUniform , gl.canvas.width, gl.canvas.height);

        gl.bindVertexArray(this.updateVao);




        gl.drawArrays(gl.TRIANGLES, 0, 6);


        var tmp = this.particle3;
        this.particle3 =  this.particle2;
        this.particle2 = this.particle1;
        this.particle1 =  tmp;




    }


    this.constrain = function(){
        var gl = this.gl;

        /* Update Olds */
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.particle3.fb);
        gl.viewport(0, 0, this.particle4.fb.width, this.particle4.fb.height); 

        gl.useProgram(this.constrainObject.program);


        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.particle1.texture);
        gl.uniform1i(this.constrainObject.positionUniform , 0);



        gl.uniform2f(this.constrainObject.positionResUniform , gl.canvas.width, gl.canvas.height);


        gl.bindVertexArray(this.constrainVao);

        gl.drawArrays(gl.TRIANGLES, 0, 6);


        var tmp = this.particle3
        this.particle3 =  this.particle1;
        this.particle1 =  tmp;


    }

	this.setMouse = function(x, y){
		this.x = x;
		this.y = y;
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
    var parse = function(str, dimension, size){


        str =  str.replace(/SIZE/g, size).replace(/DIMENSION/g, dimension + ".0")

        console.log(str);
                
        return str;
    }
}
