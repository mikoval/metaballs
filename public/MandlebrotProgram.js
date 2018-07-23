"use strict";
function MandlebrotProgram(){
    this.gl;
    this.program;
    this.zoom = 0;
    this.vertexShaderSource = `#version 300 es

        in vec2 position;

        out vec2 uv;

        void main() {
            uv = position;

            vec2 position0 = position * 2.0 - 1.0;

            gl_Position = vec4(position0, 0, 1);
        }
        `;

    this.fragmentRegularColoringBase = `#version 300 es

        precision highp float;
        in vec2 uv;
        out vec4 fragColor;
        uniform float zoom;
        uniform vec2 focusPoint;
        uniform vec2 res;
        uniform float iTime;

        
        vec3 image1(float v, float v2, float l){
			vec3 col;
		    
		 
		    float val1 =  v2 * v2  *  float(iteration_holder) / l;

            float val2 =  v * v *  float(iteration_holder) / l;
            val1 = smoothstep(0.0, 1.0, val1);
            val2 = smoothstep(0.0, 1.0, val2);

            val1 = sin(val1 * 3.14);
            val2 = sin(val2 * 3.14);

	
		    vec3 col1 = vec3(0.5 + 0.3 * sin(iTime/2.0), 0.2, 0.3);
            vec3 col2 = vec3(0.0, 0.2, 0.3 + 0.3 * sin(iTime/5.0));
            vec3 col3 = vec3(0.0 + 0.5 * sin(iTime/7.0), 0.3, 0.0);
            vec3 col4 = vec3(0.5 + 0.3 * sin(iTime/5.0), 0.6 + 0.4 * sin(iTime/2.0), 0.5 + 0.5 * sin(iTime/10.0));

		    
		  
		  
           
		    vec3 color1 = col1  * val1 +  col2 * (1.0 - val1);

            vec3 color2 = col3 * val2 +  col4* (1.0 - val2);



            float blendVal = v2 * v *  float(iteration_holder) / l;

            blendVal = 0.5 + 0.5 * sin(blendVal  +  iTime);
		  
            col =color1 * blendVal + (1.0 - blendVal) * color2;
	
		    //col =  color1;

            return col;
		}

        void main( )
        {   


            float izoom = pow(1.001, zoom );
    
            vec2 z = vec2(0.0);
      
            vec2 c = focusPoint + (uv * 4.0 - 2.0)  * 1.0 / izoom ;

            c.x *= res.x / res.y;

            vec2 p = z;



            float l;
            float sum = 0.0;
            float sum2 = 0.0;

            float sum3 = 0.0;
            float sum4 = 0.0;

            int skip = 0;

            for( int i=0; i<iteration_holder; i++ )
            {
                l++; 
                if( length(z)>escape_holder) break;
                p = z;
                vec2 t = vec2( z.x*z.x - z.y*z.y, 2.0*z.x*z.y );
                z = t + c;

                sum2 = sum;
                sum4 = sum3;
                
                    
                    float mp=length(t);
                    float m = abs(mp  - length(c)  );
                    float M = mp + length(c);
                    
                    float curve1 = 0.5 + 0.5 * sin(2.0 * atan(z.x, z.y));
                    sum += 1.0 * curve1;
                    float curve2 = 0.5 + 0.5 * sin(5.0 * atan(z.x, z.y));
                    sum3 += 1.0 * curve2;
               
		            

                

            }


    sum = sum/l;

    sum2 = sum2 / (l - 1.0);

    sum3 = sum3 / (l );
    sum4 = sum4 / (l - 1.0);

    
    
    
    l = l + 1.0 + 1.0/log(2.0) * log(log(escape_holder)/ log(sqrt(dot(z,z))));
    float d = l - floor(l);


    float r = sum * d + sum2 * (1.0 - d);
    float r2 = sum3 * d + sum4 * (1.0 - d);




    
	


    vec3 finalColor = image1(r, r2, l);

    r = 0.5 + 0.5 * sin(r + r2);
 

    finalColor = vec3(r);
 

    

    if(l > (float(iteration_holder) - 1.0)){
         fragColor = vec4(vec3(0.0), 1.0);
    }
    else{
         fragColor = vec4(finalColor, 1.0);
    }




      
            
        }
        `;

    this.fragmentRegularColoringDoubleBase = `#version 300 es
        precision highp float;
        in vec2 uv;
        out vec4 fragColor;
        uniform float zoom;
        uniform vec2 focusPoint;

        vec2 ds_add (vec2 dsa, vec2 dsb)
        {
            vec2 dsc;
            float t1, t2, e;

            t1 = dsa.x + dsb.x;
            e = t1 - dsa.x;
            t2 = ((dsb.x - e) + (dsa.x - (t1 - e))) + dsa.y + dsb.y;

            dsc.x = t1 + t2;
            dsc.y = t2 - (dsc.x - t1);
            return dsc;
        }

        vec2 ds_sub (vec2 dsa, vec2 dsb)
        {
            vec2 dsc;
            float e, t1, t2;

            t1 = dsa.x - dsb.x;
            e = t1 - dsa.x;
            t2 = ((-dsb.x - e) + (dsa.x - (t1 - e))) + dsa.y - dsb.y;

            dsc.x = t1 + t2;
            dsc.y = t2 - (dsc.x - t1);
            return dsc;
        }   

           
        float ds_compare(vec2 dsa, vec2 dsb)
        {
            if (dsa.x < dsb.x) return -1.;
            else if (dsa.x == dsb.x) 
            {
            if (dsa.y < dsb.y) return -1.;
            else if (dsa.y == dsb.y) return 0.;
            else return 1.;
            }
            else return 1.;
        }

        vec2 ds_mul (vec2 dsa, vec2 dsb)
        {
            vec2 dsc;
            float c11, c21, c2, e, t1, t2;
            float a1, a2, b1, b2, cona, conb, split = 8193.;

            cona = dsa.x * split;
            conb = dsb.x * split;
            a1 = cona - (cona - dsa.x);
            b1 = conb - (conb - dsb.x);
            a2 = dsa.x - a1;
            b2 = dsb.x - b1;

            c11 = dsa.x * dsb.x;
            c21 = a2 * b2 + (a2 * b1 + (a1 * b2 + (a1 * b1 - c11)));

            c2 = dsa.x * dsb.y + dsa.y * dsb.x;

            t1 = c11 + c2;
            e = t1 - c11;
            t2 = dsa.y * dsb.y + ((c2 - e) + (c11 - (t1 - e))) + c21;

            dsc.x = t1 + t2;
            dsc.y = t2 - (dsc.x - t1);

            return dsc;
        }

        vec2 ds_set(float a)
        {
            vec2 z;
            z.x = a;
            z.y = 0.0;
            return z;
        }



        void main( )
        {   


            float izoom = pow(1.001, zoom );
    
            vec2 z = vec2(0.0f, 0.0f);
            vec2 c = uv * 4.0 - 2.0;
            c =  focusPoint + c  * 1.0 / izoom;
            const float B = 2.0;
            float l;

           

            vec2 cx = ds_set(uv.x * 4.0 - 2.0);
            vec2 cy = ds_set(uv.y * 4.0 - 2.0);



            vec2 fpx = ds_set(focusPoint.x);
            vec2 fpy = ds_set(focusPoint.y);

            vec2 dzoom = ds_set(1.0 / izoom);

            cx = ds_add(ds_mul(cx, dzoom), fpx);
            cy = ds_add(ds_mul(cy, dzoom), fpy);




            vec2 zx = ds_set(0.0);
            vec2 zy = ds_set(0.0);

            vec2 two = ds_set(2.0);

            vec2 e_radius = ds_set(escape_holder);

            vec2 tmp;


            for(int n=0; n< iteration_holder; n++)
            {
                tmp = zx;

                zx = ds_add(ds_sub(ds_mul(zx, zx), ds_mul(zy, zy)), cx);
                zy = ds_add(ds_mul(ds_mul(zy, tmp), two), cy);

                if( ds_compare(ds_add(ds_mul(zx, zx), ds_mul(zy, zy)), e_radius)>0.) 
                    break; 
                l++;
            }

            vec3 col = vec3(sin(l / 10.0), sin(l / 20.0), sin(l / 30.0));


            fragColor = vec4(col, 1.0);


      
            
        }
        `;

  

    this.fragmentSmoothColoringBase = `#version 300 es
        precision highp float;
        in vec2 uv;
        out vec4 fragColor;
        uniform float zoom;
        uniform vec2 focusPoint;
        void main( )
        {   


            float izoom = pow(1.001, zoom );
    
            vec2 z = vec2(0.0f, 0.0f);
            vec2 c = uv * 4.0 - 2.0;
            c =  focusPoint + c  * 1.0 / izoom;
            const float B = 2.0;
            float l;

            for( int i=0; i<iteration_holder; i++ )
            {
                z = vec2( z.x*z.x - z.y*z.y, 2.0*z.x*z.y ) + c;
            
                if( dot(z,z)>escape_holder) break;
                l++;
            
            }
            vec3 col = .5 + .5*cos( vec3(3,4,1) + .1*(l - log2(log2(dot(z,z)))) );


            fragColor += vec4(col, 1.0);
      
            
        }
        `;

    this.fragmentSmoothColoringDoubleBase = `#version 300 es
        precision highp float;
        in vec2 uv;
        out vec4 fragColor;
        uniform float zoom;
        uniform vec2 focusPoint;

        vec2 ds_add (vec2 dsa, vec2 dsb)
        {
            vec2 dsc;
            float t1, t2, e;

            t1 = dsa.x + dsb.x;
            e = t1 - dsa.x;
            t2 = ((dsb.x - e) + (dsa.x - (t1 - e))) + dsa.y + dsb.y;

            dsc.x = t1 + t2;
            dsc.y = t2 - (dsc.x - t1);
            return dsc;
        }

        vec2 ds_sub (vec2 dsa, vec2 dsb)
        {
            vec2 dsc;
            float e, t1, t2;

            t1 = dsa.x - dsb.x;
            e = t1 - dsa.x;
            t2 = ((-dsb.x - e) + (dsa.x - (t1 - e))) + dsa.y - dsb.y;

            dsc.x = t1 + t2;
            dsc.y = t2 - (dsc.x - t1);
            return dsc;
        }   

           
        float ds_compare(vec2 dsa, vec2 dsb)
        {
            if (dsa.x < dsb.x) return -1.;
            else if (dsa.x == dsb.x) 
            {
            if (dsa.y < dsb.y) return -1.;
            else if (dsa.y == dsb.y) return 0.;
            else return 1.;
            }
            else return 1.;
        }

        vec2 ds_mul (vec2 dsa, vec2 dsb)
        {
            vec2 dsc;
            float c11, c21, c2, e, t1, t2;
            float a1, a2, b1, b2, cona, conb, split = 8193.;

            cona = dsa.x * split;
            conb = dsb.x * split;
            a1 = cona - (cona - dsa.x);
            b1 = conb - (conb - dsb.x);
            a2 = dsa.x - a1;
            b2 = dsb.x - b1;

            c11 = dsa.x * dsb.x;
            c21 = a2 * b2 + (a2 * b1 + (a1 * b2 + (a1 * b1 - c11)));

            c2 = dsa.x * dsb.y + dsa.y * dsb.x;

            t1 = c11 + c2;
            e = t1 - c11;
            t2 = dsa.y * dsb.y + ((c2 - e) + (c11 - (t1 - e))) + c21;

            dsc.x = t1 + t2;
            dsc.y = t2 - (dsc.x - t1);

            return dsc;
        }

        vec2 ds_set(float a)
        {
            vec2 z;
            z.x = a;
            z.y = 0.0;
            return z;
        }


        void main( )
        {   


            float izoom = pow(1.001, zoom );
    
            vec2 z = vec2(0.0f, 0.0f);
            vec2 c = uv * 4.0 - 2.0;
            c =  focusPoint + c  * 1.0 / izoom;
            const float B = 2.0;
            float l;

           

            vec2 cx = ds_set(uv.x * 4.0 - 2.0);
            vec2 cy = ds_set(uv.y * 4.0 - 2.0);



            vec2 fpx = ds_set(focusPoint.x);
            vec2 fpy = ds_set(focusPoint.y);

            vec2 dzoom = ds_set(1.0 / izoom);

            cx = ds_add(ds_mul(cx, dzoom), fpx);
            cy = ds_add(ds_mul(cy, dzoom), fpy);




            vec2 zx = ds_set(0.0);
            vec2 zy = ds_set(0.0);

            vec2 two = ds_set(2.0);

            vec2 e_radius = ds_set(escape_holder);

            vec2 tmp;


            for(int n=0; n< iteration_holder; n++)
            {
                tmp = zx;

                zx = ds_add(ds_sub(ds_mul(zx, zx), ds_mul(zy, zy)), cx);
                zy = ds_add(ds_mul(ds_mul(zy, tmp), two), cy);

                if( ds_compare(ds_add(ds_mul(zx, zx), ds_mul(zy, zy)), e_radius)>0.) 
                    break; 
                l++;
            }

            vec3 col = .5 + .5*cos( vec3(3,4,1) + l + 1 - log(log(zx.x * zx.x + zy.x * zy.x))/log(2.0)  );


            fragColor = vec4(col, 1.0);


      
            
        }
        `;

    this.fragmentTIAColoringBase = `#version 300 es
        precision highp float;
        in vec2 uv;
        out vec4 fragColor;
        uniform float zoom;
        uniform vec2 focusPoint;
        float sum,sum2,ac,il,lp,az2,lowbound,f,index,tr,ti;
        float rval,gval,bval,rval1,gval1,bval1,rval2,gval2,bval2;

        vec3 pallette(float index){

            vec3 col1 = vec3(1.0, 0.0, 0.0);
            vec3 col2 = vec3(0.0, 0.8, 0.8);
           
           
        

          
            return  col1 * index + col2 * (1.0 - index);
        }


        void main( )
        {   


            float izoom = pow(1.001, zoom );
    
            vec2 z = vec2(0.0f, 0.0f);
            vec2 c = uv * 4.0 - 2.0;
            c =  focusPoint + c  * 1.0 / izoom;
            const float B = 2.0;
            float l;
            float escape = escape_holder;

            float m = 10000.0;
            for( int i=0; i<iteration_holder; i++ )
            {
                z = vec2( z.x*z.x - z.y*z.y, 2.0*z.x*z.y ) + c;

             

                m = min(length(z), m);
            
                if( dot(z,z)>escape_holder ) break;
                l++;
            
            }
            
                float index = m;

                if(index > 0.05){
                    index = 1.0;
                }

                index = pow(index, 0.01);

            
                

                

                vec3 col = pallette(index);




                
    
                
                 
                fragColor += vec4(col, 1.0);
            
      
            
        }
        `;

    this.fragmentTIAColoringDoubleBase = `#version 300 es
        precision highp float;
        in vec2 uv;
        out vec4 fragColor;
        uniform float zoom;
        uniform vec2 focusPoint;

        vec2 ds_add (vec2 dsa, vec2 dsb)
        {
            vec2 dsc;
            float t1, t2, e;

            t1 = dsa.x + dsb.x;
            e = t1 - dsa.x;
            t2 = ((dsb.x - e) + (dsa.x - (t1 - e))) + dsa.y + dsb.y;

            dsc.x = t1 + t2;
            dsc.y = t2 - (dsc.x - t1);
            return dsc;
        }

        vec2 ds_sub (vec2 dsa, vec2 dsb)
        {
            vec2 dsc;
            float e, t1, t2;

            t1 = dsa.x - dsb.x;
            e = t1 - dsa.x;
            t2 = ((-dsb.x - e) + (dsa.x - (t1 - e))) + dsa.y - dsb.y;

            dsc.x = t1 + t2;
            dsc.y = t2 - (dsc.x - t1);
            return dsc;
        }   

           
        float ds_compare(vec2 dsa, vec2 dsb)
        {
            if (dsa.x < dsb.x) return -1.;
            else if (dsa.x == dsb.x) 
            {
            if (dsa.y < dsb.y) return -1.;
            else if (dsa.y == dsb.y) return 0.;
            else return 1.;
            }
            else return 1.;
        }

        vec2 ds_mul (vec2 dsa, vec2 dsb)
        {
            vec2 dsc;
            float c11, c21, c2, e, t1, t2;
            float a1, a2, b1, b2, cona, conb, split = 8193.;

            cona = dsa.x * split;
            conb = dsb.x * split;
            a1 = cona - (cona - dsa.x);
            b1 = conb - (conb - dsb.x);
            a2 = dsa.x - a1;
            b2 = dsb.x - b1;

            c11 = dsa.x * dsb.x;
            c21 = a2 * b2 + (a2 * b1 + (a1 * b2 + (a1 * b1 - c11)));

            c2 = dsa.x * dsb.y + dsa.y * dsb.x;

            t1 = c11 + c2;
            e = t1 - c11;
            t2 = dsa.y * dsb.y + ((c2 - e) + (c11 - (t1 - e))) + c21;

            dsc.x = t1 + t2;
            dsc.y = t2 - (dsc.x - t1);

            return dsc;
        }

        vec2 ds_set(float a)
        {
            vec2 z;
            z.x = a;
            z.y = 0.0;
            return z;
        }



        void main( )
        {   


            float izoom = pow(1.001, zoom );
    
            vec2 z = vec2(0.0f, 0.0f);
            vec2 c = uv * 4.0 - 2.0;
            c =  focusPoint + c  * 1.0 / izoom;
            const float B = 2.0;
            float l;

           

            vec2 cx = ds_set(uv.x * 4.0 - 2.0);
            vec2 cy = ds_set(uv.y * 4.0 - 2.0);



            vec2 fpx = ds_set(focusPoint.x);
            vec2 fpy = ds_set(focusPoint.y);

            vec2 dzoom = ds_set(1.0 / izoom);

            cx = ds_add(ds_mul(cx, dzoom), fpx);
            cy = ds_add(ds_mul(cy, dzoom), fpy);




            vec2 zx = ds_set(0.0);
            vec2 zy = ds_set(0.0);

            vec2 two = ds_set(2.0);

            vec2 e_radius = ds_set(escape_holder);

            vec2 tmp;


            for(int n=0; n< iteration_holder; n++)
            {
                tmp = zx;

                zx = ds_add(ds_sub(ds_mul(zx, zx), ds_mul(zy, zy)), cx);
                zy = ds_add(ds_mul(ds_mul(zy, tmp), two), cy);

                if( ds_compare(ds_add(ds_mul(zx, zx), ds_mul(zy, zy)), e_radius)>0.) 
                    break; 
                l++;
            }

            vec3 col = .5 + .5*cos( vec3(3,4,1) + l + 1 - log(log(zx.x * zx.x + zy.x * zy.x))/log(2.0)  );


            fragColor = vec4(col, 1.0);


      
            
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
        
        if(this.update){
            this.update = false;
        }
        else{
            return;
        }
        

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        var zoom, focus, res, iTime;

        if(this.screenshot || this.drawDouble){
            gl.useProgram(this.programScreenshot);
            zoom = gl.getUniformLocation(this.programScreenshot, "zoom");
            focus = gl.getUniformLocation(this.programScreenshot, "focusPoint");
            res = gl.getUniformLocation(this.programScreenshot, "res");

        }
        else{
            gl.useProgram(this.program);
            zoom = gl.getUniformLocation(this.program, "zoom");
            focus = gl.getUniformLocation(this.program, "focusPoint");
            res = gl.getUniformLocation(this.program, "res");
            iTime = gl.getUniformLocation(this.program, "iTime");

        }
        this.time += 0.03;
        gl.uniform1f(iTime, this.time);  
        gl.uniform1f(zoom, this.zoom);  
        gl.uniform2f(focus, this.position.x, this.position.y);  
        gl.uniform2f(res, this.screenWidth, this.screenHeight);  
        gl.bindVertexArray(this.vao);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        this.postDraw();
    }

    this.postDraw = function(){
         if(this.screenshot){
            this.screenshot = false;
            var canvas = this.gl.canvas;
            var imgsrc    = canvas.toDataURL("image/png");

            var modal = document.getElementById('myModal');

            var img = document.getElementById('myImg');
            var modalImg = document.getElementById("img01");
            var captionText = document.getElementById("caption");
      
            modal.style.display = "block";
            modalImg.src = imgsrc;
            captionText.innerHTML = this.alt;
            

            // Get the <span> element that closes the modal
            var span = document.getElementsByClassName("close")[0];

            // When the user clicks on <span> (x), close the modal
            span.onclick = function() { 
              modal.style.display = "none";
            }

        }

    }

    this.destroy = function(){
         clearInterval(this.drawLoop);
    }

    this.generateShaders = function(){
        this.fragmentRegularColoringDouble = this.fragmentRegularColoringDoubleBase.replace(/iteration_holder/g, this.iterations).replace(/escape_holder/g, this.escape);
        this.fragmentRegularColoring= this.fragmentRegularColoringBase.replace(/iteration_holder/g, this.iterations).replace(/escape_holder/g, this.escape);

        this.fragmentSmoothColoringDouble = this.fragmentSmoothColoringDoubleBase.replace(/iteration_holder/g, this.iterations).replace(/escape_holder/g, this.escape);
        this.fragmentSmoothColoring= this.fragmentSmoothColoringBase.replace(/iteration_holder/g, this.iterations).replace(/escape_holder/g, this.escape);

        this.fragmentTIAColoringDouble = this.fragmentTIAColoringDoubleBase.replace(/iteration_holder/g, this.iterations).replace(/escape_holder/g, this.escape);
        this.fragmentTIAColoring= this.fragmentTIAColoringBase.replace(/iteration_holder/g, this.iterations).replace(/escape_holder/g, this.escape);

    }

    this.init = function(){
    	this.time = 0.0;
        this.zoom = 0.0;
        this.position = {x: 0.360240443437614, y: -0.6413130610};
        this.oldX = 0;
        this.oldY = 0;
        this.screenWidth = screen.width;
        this.screenHeight = screen.height;
        this.screenshot = false;

        this.drawDouble = false;

        this.iterations = "100";
        this.escape = "1000.0";
        this.type = "regular";
        this.generateShaders();
        this.generateGUI();
        var gl = this.gl;
        this.buildPrograms();

        var positionAttributeLocation = gl.getAttribLocation(this.program, "position");

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

    this.generateGUI = function(){
        // wrapper
        var div = document.createElement("div");
        div.style.width = "300px";
        div.style.height = "400px";
        div.style.background = "darkgray";
        div.style.color = "white";
        div.style.position= "fixed";
        div.style.top = "0px";
        div.style.left = "0px";
        div.style.opacity = "0.7";

        // title
        var title = document.createElement("h3");
        title.style.textAlign = "center"
        var t = document.createTextNode("CONTROLS"); 
        title.appendChild(t);          
        div.appendChild(title);

        //iterations
        var slider = document.createElement("INPUT");
        slider.setAttribute("type", "range");
        slider.setAttribute("min", 0);
        slider.setAttribute("max", 1000);
        var ctx = this;
        slider.addEventListener(
            'change',
            function() { 
                ctx.iterations = this.value; 
                ctx.generateShaders();
                ctx.buildPrograms();
            },
            false
        );

        div.appendChild(slider);

        //escape
        var slider = document.createElement("INPUT");
        slider.setAttribute("type", "range");
        slider.setAttribute("min", 2);
        slider.setAttribute("max", 10000000);
        var ctx = this;
        slider.addEventListener(
            'change',
            function() { 
                ctx.escape = this.value + ".0"; 
                ctx.generateShaders();
                ctx.buildPrograms();
            },
            false
        );
        div.appendChild(slider);





        document.body.appendChild(div);
    }

    this.buildPrograms = function(){
        console.log(this.type)
        if(this.type == "regular"){
            this.program = createProgramFromSources(this.gl, this.vertexShaderSource, this.fragmentRegularColoring);
            this.programScreenshot = createProgramFromSources(this.gl, this.vertexShaderSource, this.fragmentRegularColoringDouble);
        }
        else if(this.type == "smooth"){
            this.program = createProgramFromSources(this.gl, this.vertexShaderSource, this.fragmentSmoothColoring);
            this.programScreenshot = createProgramFromSources(this.gl, this.vertexShaderSource, this.fragmentSmoothColoringDouble);
        }
        else if(this.type == "tia"){
            this.program = createProgramFromSources(this.gl, this.vertexShaderSource, this.fragmentTIAColoring);
            this.programScreenshot = createProgramFromSources(this.gl, this.vertexShaderSource, this.fragmentTIAColoringDouble);
        }
        
    }
    this.onScroll = function(delta){
        this.update = true;
        this.zoom += delta;
        this.printState();
    }
    this.onMouseUp = function(event){
        this.drag  = false;
    }
    this.onMouseDown = function(event){
        if(event.target == this.gl.canvas){
            this.drag = true;
        }
        
    }
    this.onMouseMove = function(event){
        this.update = true;
        var x = event.pageX;
        var y = event.pageY;
        console.log(event);
        var dx = x - this.oldX;
        var dy = y - this.oldY;


        console.log(dx  + " , " + dy)
        this.oldX = x;
        this.oldY = y;

        
        if(this.drag){
            
            var deltaX = (dx / (this.screenWidth / 2.0));
            var deltaY = (dy / (this.screenHeight / 2.0));
            this.position.x -= deltaX * 1.0 / Math.pow(1.001, this.zoom );
            this.position.y +=  deltaY  * 1.0 / Math.pow(1.001, this.zoom );
            this.printState();
        }
    }
    this.onKeyPress = function(key){
        if(key == 1){
            this.type = "regular"
            this.buildPrograms();
        }

        if(key == 2){
            this.type = "smooth"
            this.buildPrograms();
        }

        if(key == 3){
            this.type = "tia"
            this.buildPrograms();
        }

        else if (key == "p"){
            this.screenshot = true;
        }

        else if (key == "o"){
            this.drawDouble = !this.drawDouble;
        }
        
    }
    this.printState = function(){
        var data = {}
        data.zoom = this.zoom;
        data.position = this.position;
        console.log(data);
    }

}
