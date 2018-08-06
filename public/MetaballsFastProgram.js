var GRID_SIZE = 16;
var GRID_SIZE2 = 1.0 / GRID_SIZE;
var PARTICLE_SIZE =1.0 / GRID_SIZE ;

var PARTICLE_SHOW = 30;
var PARTICLE_MAG = 32;

var SPEED = 0.01;


"use strict";
function MetaballsFastProgram(){
    var gl;
    this.gl;
    this.program;
    this.vertexMetaball = `#version 300 es

        in vec2 position;

        out vec2 uv;
        out vec2 vuv;
        uniform vec2 res;

        void main() {
            uv = 2.0 * (position - 0.5) * res / res.y;

            vuv = position;

            vec2 position0 = position * 2.0 - 1.0;

            gl_Position = vec4(position0, 0, 1);
        }
        `;

    this.fragmentMetaball = `#version 300 es
        precision highp float;
        #define RADIUS PARTICLE_SIZE

        #define SIZE 4

        in vec2 uv;
        in vec2 vuv;
        out vec4 outColor;

     
        uniform sampler2D balls;
        uniform sampler2D positions;
     

        
        void main() {
            float sum;
            vec4 color;
            float s = float(SIZE);
            
            float tmp = 1.0 / 32.0;

            for(float i = -3.0; i <= 3.0; i++){
                for(float j = -3.0; j <= 3.0; j++){
                    float i2 = vuv.x + (i +  0.5) * GRID_NEG_SIZE;
                    float j2 = vuv.y + (j + 0.5) * GRID_NEG_SIZE;
                    vec4 id =  texture(positions, vec2(i2,j2));


                    if(!(i2 < 0.0 || i2 >1.0 || j2 < 0.0 || j2 > 1.0)){
                        id -= 1.0;

                        for(int x = 0; x < 4; x++){
                            if(id[x] >= 0.0){
                               
                                vec2 v = vec2( mod(id[x], 32.0) * tmp, floor(id[x] * tmp) * tmp);
                               
                                    vec4 ball = texture(balls,  v.xy);



                                    float bottom = (uv.x - ball.x) * (uv.x - ball.x) + (uv.y - ball.y) * (uv.y - ball.y);
                                
                                    sum +=  (RADIUS * RADIUS)/bottom;
                                
                            }
                            else{
                                x = 5;
                            }

                                
                        }
                           
                        
                    }
                   
                
                }
            }
            outColor = vec4(0.0, 0.0, 0.0, 1.0);
                if(sum > 1.0){
                    float v = smoothstep(1.0, 1.2, sum);
                    outColor = vec4(v, 0.3 * v, 0.5 * v, 1.0);
                
                
            } else{
                
            }

            
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
        precision mediump float;
        #define RADIUS 0.02

        #define SIZE 4

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

    this.vertexUpdate2 = `#version 300 es
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

    this.fragmentUpdate2 = `#version 300 es
        precision mediump float;
        #define RADIUS 0.02

        #define SIZE 4

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
            float radius = 0.03;
            float aspect = res.x /res.y;
            if(p.x + 2.0 * dx > 1.0 * aspect - radius || p.x + 2.0 * dx< -1.0 * aspect + radius){
                p.x = p.x + 2.0 * dx;
            }
            if(p.y + 2.0 *  dy > 1.0 - radius || p.y + 2.0 * dy< -1.0 + radius){
                p.y = p.y + 2.0 * dy;
            }

            outColor = vec4(p);
        }
        `;

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

        uniform sampler2D text;
        
        void main() {
            vec4 p = texture(text, uv);
   
            outColor = vec4(p.xyz / 32.0, 1.0) ;
        }
        `;
    this.vertexPosition = `#version 300 es
        precision highp float;

        in vec2 position;

        out vec2 id;
        out vec2 pv;
        uniform vec2 res;
        uniform sampler2D pos;

        void main() {
            gl_PointSize = 1.0;

            id = position;

            vec4 p = texture(pos, position.xy/32.0);

            p.x *= res.y/res.x;
            p = p * GRID_SIZE ;
            p = floor(p) + 0.5;
            p *= GRID_NEG_SIZE ;


           

           // float val = (id.x + 0.5) + id.y  * 32.0;



           // p.z = val / 10000.0;

            


            pv = 0.5 + (p.xy ) * 0.5;

            ///////
            /*
            p.xy  = position.yx / 40.0;
            pv = (position.yx) / 40.0;
            pv = 0.5 + pv / 2.0;
            */
            

            gl_Position = vec4(p);

        }
        `;

    this.fragmentPosition = `#version 300 es
        precision highp float;

        in vec2 id;
        in vec2 pv;
        out vec4 outColor;

        uniform sampler2D current;
        
        void main() {
            vec2 p = pv;
            vec4 c = texture(current, p.xy);

            float val = id.x + id.y  * 32.0 + 1.0;
           
            
            
            
            
            for(int i = 0; i < 4; i++){
                if(abs(c[i] - val) < 0.1) {
                    discard;
                    break;
                }
                if(c[i] < 1.0){
                    c[i] = val;
                    break;
                }
            }
            
            
            
           
            outColor = c;
        }
        `;
    this.create = function(ctx){
        gl = ctx;
        this.gl = ctx;
       
        this.init();
        this.drawLoop = setInterval(
                (function(self) {
                    return function() {
                        self.draw(self.gl);
                    }
                })(this),
                1000/30 
                ); 
    }

    this.showTexture = function(texture){
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(this.showProgram);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(this.showUniform, 0);

        gl.bindVertexArray(this.vao);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    this.draw = function(gl){
        console.time();


        //gl.bindFramebuffer(gl.FRAMEBUFFER, fb);


        this.update();

       
       
        this.setPositions();
        
        

        // return;

        gl.clearColor(0, 0, 0, 1.0);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(this.program);
        gl.uniform2f(this.resUniform, this.width, this.height); 

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.ballTexture.texture.texture);
        gl.uniform1i(this.ballUniform, 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.ballTexture.positionTexture.texture);
        gl.uniform1i(this.positionsUniform, 1);

        gl.bindVertexArray(this.vao);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        
        if(!this.display){
            this.showTexture(this.ballTexture.positionTexture.texture);
        }

        gl.finish();
        console.timeEnd();

        
    }
   
    this.setPositions = function(){

        /* update position */

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.ballTexture.positionTexture.fb);
        gl.clearColor(0.0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


   
        

         
       // gl.enable(gl.DEPTH_TEST);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.ballTexture.positionTexture2.fb);
        gl.clearColor(0.0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.viewport(0, 0, this.ballTexture.positionTexture.fb.width, this.ballTexture.positionTexture.fb.height);
        gl.useProgram(this.positionProgram);

        gl.bindVertexArray(this.positionVao);

        gl.uniform2f(this.resUniform2, this.width, this.height); 
        gl.activeTexture(gl.TEXTURE0);
        gl.activeTexture(gl.TEXTURE1);

              gl.bindTexture(gl.TEXTURE_2D, this.ballTexture.texture.texture);
            gl.uniform1i(this.positionsUniform_pos, 0);

            gl.bindTexture(gl.TEXTURE_2D, this.ballTexture.positionTexture.texture);
            gl.uniform1i(this.positionsUniform_current, 1);

        for(var i = 0; i < 4; i++){

            

            gl.clear(gl.DEPTH_BUFFER_BIT);



           


            
      


            gl.drawArrays(gl.POINTS, 0, PARTICLE_SHOW);
          
            /*
            var pixels = new Float32Array(this.ballTexture.positionTexture.fb.width * this.ballTexture.positionTexture.fb.height * 4);
            gl.readPixels(0, 0, this.ballTexture.positionTexture.fb.width, this.ballTexture.positionTexture.fb.height, gl.RGBA, gl.FLOAT, pixels);

            console.log(pixels);
            */

            gl.bindTexture(gl.TEXTURE_2D, this.ballTexture.positionTexture.texture);
            gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, this.ballTexture.positionTexture.fb.width, this.ballTexture.positionTexture.fb.height, 0);


            /*
            var tmp = this.ballTexture.positionTexture2;
            this.ballTexture.positionTexture2 =    this.ballTexture.positionTexture;
            this.ballTexture.positionTexture = tmp;
            */

            
      
        }
      


    }
    this.update = function(){
        
        /* update position */
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.ballTexture.texture3.fb);

        gl.viewport(0, 0, this.ballTexture.texture3.fb.width, this.ballTexture.texture3.fb.height); 


        gl.useProgram(this.updateObject.program);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.ballTexture.texture.texture);
        gl.uniform1i(this.updateObject.positionUniform , 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.ballTexture.textureOld.texture);
        gl.uniform1i(this.updateObject.positionOldUniform , 1);

        gl.bindVertexArray(this.vao);

        gl.drawArrays(gl.TRIANGLES, 0, 6);



        /* Update Olds */
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.ballTexture.texture4.fb);
        gl.viewport(0, 0, this.ballTexture.texture3.fb.width, this.ballTexture.texture3.fb.height); 


        gl.useProgram(this.updateObject.program2);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.ballTexture.texture.texture);
        gl.uniform1i(this.updateObject.positionUniform2 , 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.ballTexture.textureOld.texture);
        gl.uniform1i(this.updateObject.positionOldUniform2 , 1);

        gl.uniform2f(this.updateObject.positionResUniform2 , gl.canvas.width, gl.canvas.height);

        gl.bindVertexArray(this.vao);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        var tmp = this.ballTexture.texture3;
        var tmp2 = this.ballTexture.texture4;
        this.ballTexture.texture3 =  this.ballTexture.texture;
        this.ballTexture.texture = tmp;
        this.ballTexture.texture4 =  this.ballTexture.textureOld;
        this.ballTexture.textureOld = tmp2;
    }

    this.getColors = function(){
        var arr = [];
        for(var i = 0; i < this.balls.length; i++){
            arr.push(this.balls[i].color[0]);
            arr.push(this.balls[i].color[1]);
            arr.push(this.balls[i].color[2]);
            arr.push(this.balls[i].color[3]);
        
        }
        return arr;
    }
    this.destroy = function(){
         clearInterval(this.drawLoop);
    }

    this.init = function(){
        this.display = true;
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.aspect = this.width/this.height;
        this.ballTexture = new ballTexture(32);

        var gl = this.gl;

        this.program =  createProgramFromSources(gl, this.parse(this.vertexMetaball), this.parse(this.fragmentMetaball));

        this.showProgram =  createProgramFromSources(gl, this.parse(this.vertexShowTexture), this.parse(this.fragmentShowTexture));
      
        this.positionProgram =  createProgramFromSources(gl, this.parse(this.vertexPosition), this.parse(this.fragmentPosition));
       

        var pao = gl.getAttribLocation(this.program, "position");
        var pao_position = gl.getAttribLocation(this.positionProgram, "position");
        this.pao = pao;
        this.pao_position = pao_position;
        this.ballUniform = gl.getUniformLocation(this.program, "balls");
        this.positionsUniform = gl.getUniformLocation(this.program, "positions");
        this.colorUniform = gl.getUniformLocation(this.program, "colors");
        this.resUniform = gl.getUniformLocation(this.program, "res");

        this.resUniform2 = gl.getUniformLocation(this.positionProgram, "res");
        this.positionsUniform_pos = gl.getUniformLocation(this.positionProgram, "pos");
        this.positionsUniform_current = gl.getUniformLocation(this.positionProgram, "current");

        this.updateObject = {};

        this.updateObject.program = createProgramFromSources(gl, this.parse(this.vertexUpdate), this.parse(this.fragmentUpdate));
        this.updateObject.positionUniform = gl.getUniformLocation(this.updateObject.program, "pos");
        this.updateObject.positionOldUniform = gl.getUniformLocation(this.updateObject.program, "pos_old");

        this.updateObject.program2 = createProgramFromSources(gl, this.parse(this.vertexUpdate2), this.parse(this.fragmentUpdate2));
        this.updateObject.positionUniform2 = gl.getUniformLocation(this.updateObject.program2, "pos");
        this.updateObject.positionOldUniform2 = gl.getUniformLocation(this.updateObject.program2, "pos_old");
        this.updateObject.positionResUniform2 = gl.getUniformLocation(this.updateObject.program2, "res");

        this.vao = createVao(pao);
        this.positionVao = createPositionVao(pao_position, 32);
       
    }

    var createPositionVao = function(location, size){
        var vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        var positionBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        var positions = [];
        for(var i = 0; i < size; i++){
            for( var j = 0; j < size; j++){
                positions.push(j);
                positions.push(i);
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


    var createVao = function(location){
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

    var ballTexture = function(size){
        gl.getExtension('OES_texture_float');
        gl.getExtension('OES_texture_float_linear')
        // create to render to
        this.width = size;
        this.height = size;

        var data = [];
        for(var i = 0; i < this.width * this.height; i++){

            //data.push(0.0);
            //data.push(0.0);

            var aspect = gl.canvas.width / gl.canvas.height;
            data.push((Math.random()- 0.5) * 1.9 * aspect);

            data.push((Math.random()- 0.5) * 1.9);
            data.push(0.0);
            



            data.push(1.0);
        }
        //console.log(data);

        var data2 = [];
        for(var i = 0; i < this.width * this.height; i++){
            
            data2.push(data[4 * i] + (Math.random()- 0.5) * SPEED);
            data2.push(data[4 * i + 1] + (Math.random()- 0.5) * SPEED);
            //data2.push(0.0);
            // data2.push(0.01);
              data2.push(0.0);
            
        
            data2.push(1.0);
        }


        this.texture = createRenderTarget(this.width, this.height, data);
        this.textureOld = createRenderTarget(this.width, this.height, data2);
        this.texture3 = createRenderTarget(this.width, this.height, data); 
        this.texture4 = createRenderTarget(this.width, this.height, data);        

        var size = GRID_SIZE;
        this.positionTexture = createRenderTarget(size, size, null);
        this.positionTexture2 = createRenderTarget(size, size, null);
        this.positionTexture3 = createRenderTarget(size, size, null);


       


    }

    var createRenderTarget = function(width, height, data){
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
    
    this.onKeyPress = function(key){
        if(key == 1){
            this.display = !this.display;
        }
    }
    this.parse = function(str){
        console.log(GRID_SIZE2);
        str =  str.replace(/GRID_SIZE/g, GRID_SIZE + ".0").replace(/GRID_NEG_SIZE/g, GRID_SIZE2)
                    .replace(/PARTICLE_SIZE/g, PARTICLE_SIZE).replace(/PARTICLE_MAG/g, PARTICLE_MAG);

        return str;
    }
}
