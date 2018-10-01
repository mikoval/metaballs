var SIZE = 4;
function ParticleEngine(){
    this.gl;
    this.program;

    this.setRenderer = function(renderer){
        this.renderer = renderer;
    }
    this.setSystem = function(system){
        this.system = system;
    }
    this.init = function(){
        this.window = new glWindow();
        this.frames = 0;

        this.framerateUI = document.getElementById("framerate");


        this.ctx = this.window.getContext();

        this.date = new Date();
        this.framerateStart = this.date.getTime();

        if(!this.renderer){
            console.log("no renderer");
            return false;
        }
        if(!this.system){
            console.log("no system");
            return false;
        }

        renderer.init(this.ctx, SIZE);
        system.init(this.ctx, SIZE);

        /* for debug */
        this.imageRenderer = new ImageRenderer();
        this.imageRenderer.init(this.ctx);

        this.bindListeners();

        this.ready = true;
        return true;
    }
    this.execute = function(){
        if(!this.ready){
            console.log("Unable to start. Not initialized");
            return;
        }
        this.loop = setInterval(
        (function(self) {
            return function() {
                self.update();
            }
        })(this),
        1000/60 
        ); 
    }
    this.update = function(){
        this.date = new Date();
        this.frames++;
        var time = this.date.getTime();
        var timeDiff = time - this.framerateStart;


        if(timeDiff > 1000){
            this.framerateStart = this.date.getTime();
            this.framerateUI.innerHTML = this.frames;
            this.frames = 0;

        }
        this.system.update();
        
        var state = this.system.getState();

        if(false){
            this.imageRenderer.draw(state);
        } else {
            this.renderer.draw(state);
        }
        
    }
    this.bindListeners = function(){
        var ctx = this;
        window.onwheel = function(event) {
        };
        window.onmousedown = function(event) {
           
        };
        window.onmouseup = function(event) {
    
        };
        window.onmousemove = function(event) {
        };

        window.ontouchstart = function(event) {
        };
        window.ontouchend = function(event) {
    
        };
        window.ontouchmove = function(event) {
            
        };
        window.onkeypress = function(event) {
        };
    }
}