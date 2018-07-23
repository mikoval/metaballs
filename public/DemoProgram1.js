"use strict";
function DemoProgram(){
    this.gl;
    this.program;
    this.vertexShaderSource = `#version 300 es

        in vec2 position;

        out vec2 uv;

        void main() {
            uv = position;

            vec2 position0 = position * 2.0 - 1.0;

            gl_Position = vec4(position0, 0, 1);
        }
        `;

    this.fragmentShaderSource = `#version 300 es
        precision mediump float;

        in vec2 uv;
        out vec4 outColor;

        void main() {
            outColor = vec4(uv, 0, 1);
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
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(this.program);
        gl.bindVertexArray(this.vao);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    this.destroy = function(){
         clearInterval(this.drawLoop);
    }

    this.init = function(){
        var gl = this.gl;
        var program = createProgramFromSources(gl, this.vertexShaderSource, this.fragmentShaderSource);
        this.program = program;
        var positionAttributeLocation = gl.getAttribLocation(program, "position");

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
}
