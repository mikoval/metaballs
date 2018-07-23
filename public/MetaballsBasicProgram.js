"use strict";
function MetaballsBasicProgram(){
    this.gl;
    this.program;
    this.vertexShaderSource = `#version 300 es

        in vec2 position;

        out vec2 uv;
        uniform vec2 res;

        void main() {
            uv = 2.0 * (position - 0.5);
            uv.x *= res.x / res.y;

            vec2 position0 = position * 2.0 - 1.0;

            gl_Position = vec4(position0, 0, 1);
        }
        `;

    this.fragmentShaderSource = `#version 300 es
        precision mediump float;
        #define RADIUS 0.05
        #define BALL_COUNT 30

        in vec2 uv;
        out vec4 outColor;

        uniform vec2 balls[BALL_COUNT];
        uniform vec4 colors[BALL_COUNT];
     

        
        void main() {
            float sum;
            vec4 color;
            for(int i = 0; i < BALL_COUNT; i++){
                float bottom = pow((uv.x - balls[i].x), 2.0) + pow((uv.y - balls[i].y), 2.0); 
                float val =  pow(RADIUS, 2.0)/bottom;
                val = pow(val, 1.0);
                sum += val;
                color += colors[i] * val;
            }
            if(sum > 1.0){
                if(sum < 1.3){
                    outColor = vec4(0.0, 0.0, 0.0, 1.0);
                } else {
                    
                    outColor = color/sum;
                }
                
            } else{
                outColor = vec4(0.4, 0.7, 0.2, 1.0);
            }
            
        }
        `;

    this.create = function(ctx){
        this.gl = ctx;
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
        
        this.update();
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(this.program);
        gl.uniform2fv(this.ballUniform, this.getBalls());
        gl.uniform2f(this.resUniform, this.width, this.height); 
        gl.uniform4fv(this.colorUniform, this.getColors()); 
        gl.bindVertexArray(this.vao);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    this.update = function(){
        for(var i = 0; i < this.balls.length; i++){
            this.balls[i].update();
        }
    }
    this.getBalls = function(){
        var arr = [];
        for(var i = 0; i < this.balls.length; i++){
            arr.push(this.balls[i].position.x);
            arr.push(this.balls[i].position.y);
        }
        return arr;
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
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.balls = [];
        this.aspect = this.width/this.height;

        for(var i = 0; i < 30; i++){
            var x0 =  this.aspect * 1.8 * (Math.random() -0.5 ); 
            var x1 =  x0 +  0.01 * (Math.random() - 0.5);
            var y0 =  1.8 * (Math.random() -0.5 ); 
            var y1 =  y0 +  0.01 * (Math.random() - 0.5);

            var color = [Math.random(), Math.random(), Math.random(), 1.0];
            //color = [0, 0, 1, 1];
            this.balls.push(new ball(x0, y0, x1, y1, color, this.aspect));
        }

        var gl = this.gl;
        var program = createProgramFromSources(gl, this.vertexShaderSource, this.fragmentShaderSource);
        this.program = program;
        var positionAttributeLocation = gl.getAttribLocation(program, "position");
        this.ballUniform = gl.getUniformLocation(this.program, "balls");
        this.colorUniform = gl.getUniformLocation(this.program, "colors");
        this.resUniform = gl.getUniformLocation(this.program, "res");

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

        var vao = gl.createVertexArray();
        this.vao = vao;
        gl.bindVertexArray(vao);
        gl.enableVertexAttribArray(positionAttributeLocation);

        var size = 2;
        var type = gl.FLOAT;
        var normalize = false;
        var stride = 0;
        var offset = 0;
        gl.vertexAttribPointer( positionAttributeLocation, size, type, normalize, stride, offset);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 0);
    }

    var ball = function(x, y, x2, y2, color, aspect){
        this.position = {x: x, y:y};
        this.position0 = {x: x2, y:y2};
        this.color = color;
        this.aspect = aspect;
        this.radius = 0.05;
        this.update = function(){
            var dx = this.position.x - this.position0.x;
            var dy = this.position.y - this.position0.y;
            this.position0.x = this.position.x;
            this.position0.y = this.position.y;
            this.position.x += dx;
            this.position.y += dy;

            if(this.position.x + this.radius > 1.0 * this.aspect|| this.position.x - this.radius < -1.0  * this.aspect){
                this.position0.x = this.position.x + dx;
            }
            if(this.position.y +this.radius > 1.0 || this.position.y -this.radius < -1.0){
                this.position0.y = this.position.y + dy;
            }
            
        }
    }
}
