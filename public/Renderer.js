function Renderer(){
    this.gl;
    this.program;
    this.init = function(){
        var canvas = document.getElementById("c");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        this.gl = canvas.getContext("webgl2");
        if (!this.gl) {
            return;
        }
        

        this.bindListeners();
    }
    this.setProgram = function(program){
        if(this.program){
            this.program.destroy();
        }
        this.program = program;
        this.program.create(this.gl);

    }
    this.destroyProgram = function(){
        this.program.destroy();
        this.program = undefined;
    }
    this.bindListeners = function(){
        var ctx = this;
        window.onwheel = function(event) {
            ctx.onScroll(event.deltaY);
        };
        window.onmousedown = function(event) {
            ctx.program.onMouseDown(event);
        };
        window.onmouseup = function(event) {
            ctx.program.onMouseUp(event);
        };
        window.onmousemove = function(event) {
            ctx.program.onMouseMove(event);
        };

        window.ontouchstart = function(event) {
            ctx.program.onMouseDown(event);
        };
        window.ontouchend = function(event) {
            ctx.program.onMouseUp(event);
        };
        window.ontouchmove = function(event) {
            ctx.program.onMouseMove(event);
        };


        
        window.onkeypress = function(event) {
            ctx.program.onKeyPress(event.key);
        };
    }
    this.onScroll = function(delta){
        this.program.onScroll(delta);
    }
}