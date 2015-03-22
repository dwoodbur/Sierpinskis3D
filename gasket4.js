
var canvas;
var gl;

var points = [];
var colors = [];

var ppoints = [];
var pcolors = [];

var NumTimesToSubdivide = 5;

var mouse_mode = true;

var posX=0, posY=0;
var numVerts = 0;
var numPlaneVerts = 0;
var eye;
var start=true;
var projectionMatrix, modelViewMatrix, modelViewMatrixPlane;

var left = -2.0;
var right = 2.0;
var ytop = 2.0;
var bottom = -2.0;
var near = -10;
var far = 10;
var r = 4.0, theta=0.0, phi=0.0;

const at = vec3(0.0,0.0,0.0), up = vec3(0.0,1.0,0.0);

var trans1=0, trans2=0;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the vertices of our 3D gasket
    // Four vertices on unit circle
    // Intial tetrahedron with equal length sides
    
    var vertices = [
        vec3(  0.0000,  0.0000, -1.0000 ),
        vec3(  0.0000,  0.9428,  0.3333 ),
        vec3( -0.8165, -0.4714,  0.3333 ),
        vec3(  0.8165, -0.4714,  0.3333 )
    ];
    
    divideTetra( vertices[0], vertices[1], vertices[2], vertices[3],
                 NumTimesToSubdivide);

	numVerts = points.length;
	
	drawPlane();
	numPlaneVerts = points.length - numVerts;

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    // enable hidden-surface removal
    
    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Create a buffer object, initialize it, and associate it with the
    //  associated attribute variable in our vertex shader
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
    
    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );

	

var eye = vec3(r*Math.sin(theta)*Math.cos(phi),
    	r*Math.sin(theta)*Math.sin(phi), r*Math.cos(theta));
	modelViewMatrix = lookAt(eye, at, up);
	modelViewMatrixPlane = lookAt(eye, at, up);

	document.getElementById("subdivisions").onchange = function(event) {
		
		NumTimesToSubdivide = event.srcElement.value;
        points = [];
        colors = [];
        divideTetra( vertices[0], vertices[1], vertices[2], vertices[3],
                 NumTimesToSubdivide);
        numVerts = points.length;
        drawPlane();
        numPlaneVerts = points.length - numVerts;
        gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
        //gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
        
	};
	
	document.getElementById("rotateX").onclick = function(event) {
		var theta = 1;
		
		for(var i=0; i < points.length; i++) {
			var x = points[i][0];
			var y = points[i][1];
			var z = points[i][2];
			
			points[i][1] = y*Math.cos(theta) - z*Math.sin(theta);
			points[i][2] = z*Math.cos(theta) + y*Math.sin(theta);
			
		}
		
		gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
		
		//projectionMatrix = mult(projectionMatrix, rotate(1,1,1,1));
		
		
	};
	
	document.getElementById("rotateY").onclick = function(event) {
		var theta = 1;
		
		for(var i=0; i < points.length; i++) {
			var x = points[i][0];
			var y = points[i][1];
			var z = points[i][2];
			
			points[i][0] = x*Math.cos(theta) - z*Math.sin(theta);
			points[i][2] = z*Math.cos(theta) + x*Math.sin(theta);
			
		}
		
		gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
		
	};
	
	document.getElementById("rotateZ").onclick = function(event) {
		var theta = 1;
		
		for(var i=0; i < points.length; i++) {
			var x = points[i][0];
			var y = points[i][1];
			var z = points[i][2];
			
			points[i][0] = x*Math.cos(theta) - y*Math.sin(theta);
			points[i][1] = x*Math.sin(theta) + y*Math.cos(theta);
			
		}
		
		gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
		
	};
	
	document.getElementById("mouseMode").onclick = function(event) {
	
		if(mouse_mode)
			mouse_mode = false;
		else
			mouse_mode = true;
	}
	
	window.onkeydown = function( event ) {
		
		// Adjust tetrahedron based on key.
		
        var key = String.fromCharCode(event.keyCode);
        trans1=0;
        trans2=0;
        switch( key ) {
        	
        	case 'W':
        		trans2=.02;
				break;
				
        	case 'S':
        		trans2=-.02;
				break;
				
			case 'A':				
				trans1=-.02;
				break;
				
			case 'D':
				trans1=.02;
				break;
				
			case 'R':
				for(var i=0; i < points.length; i++) {
					points[i][2] -= .005;
				}
				gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
								
				break;
				
			case 'F':
				for(var i=0; i < points.length; i++) {
					points[i][2] += .005;
				}
				gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
				
				break;
        }
        
        translate = mat4( 1.0,  0.0,  0.0, trans1,
                      0.0,  1.0,  0.0, trans2,
                      0.0,  0.0,  1.0, 0.0,
                      0.0,  0.0,  0.0, 1.0 );
				
		modelViewMatrix = mult(modelViewMatrix, translate);
                
    };

	canvas.onmousemove = function (event) {
		
		if(mouse_mode) {
			
			if(posX == 0 && posY == 0) {
				posX = event.clientX;
				posY = event.clientY;
			}
			
			else {
				var posXUpdate = event.clientX;
				var posYUpdate = event.clientY;
				
				// Left
				if(posXUpdate < posX) {
					var theta = .01;
		
					for(var i=0; i < numVerts; i++) {
						var x = points[i][0];
						var y = points[i][1];
						var z = points[i][2];
			
						points[i][0] = x*Math.cos(theta) - z*Math.sin(theta);
						points[i][2] = z*Math.cos(theta) + x*Math.sin(theta);
			
					}
		
					gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
					
				}
				// Right
				else if(posXUpdate > posX) {
					var posXUpdate = event.clientX;
					var posYUpdate = event.clientY;
				
				
					if(posXUpdate > posX) {
						var theta = .01;
		
						for(var i=0; i < numVerts; i++) {
							var x = points[i][0];
							var y = points[i][1];
							var z = points[i][2];
			
							points[i][0] += points[i][0] - (x*Math.cos(theta) - z*Math.sin(theta));
							points[i][2] += points[i][2] - (z*Math.cos(theta) + x*Math.sin(theta));
			
						}
		
						gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);					
					}
				}
				// Down
				if(posYUpdate < posY) {
						
					var theta = .01;
			
					for(var i=0; i < numVerts; i++) {
						var x = points[i][0];
						var y = points[i][1];
						var z = points[i][2];
				
						points[i][1] += points[i][1] - (y*Math.cos(theta) - z*Math.sin(theta));
						points[i][2] += points[i][2] - (z*Math.cos(theta) + y*Math.sin(theta));
			
					}
		
					gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
					
				}
				// Up
				else if(posYUpdate > posY) {
					
					var theta = .01;
		
					for(var i=0; i < numVerts; i++) {
						var x = points[i][0];
						var y = points[i][1];
						var z = points[i][2];
			
						points[i][1] = y*Math.cos(theta) - z*Math.sin(theta);
						points[i][2] = z*Math.cos(theta) + y*Math.sin(theta);
			
					}
		
					gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
					
				}
				
				
				posX = posXUpdate;
				posY = posYUpdate;
			}
			
		}
		
		else {
			
			if(posX == 0 && posY == 0) {
				posX = event.clientX;
				posY = event.clientY;
			}
			
			else {
				
				var posXUpdate = event.clientX;
				var posYUpdate = event.clientY;
				
				// Left
				if(posXUpdate < posX) {
					for(var i=0; i < points.length; i++) {
						points[i][0] -= .002;
					}
					gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
				}
				// Right
				else if(posXUpdate > posX) {
					for(var i=0; i < points.length; i++) {
						points[i][0] += .002;
					}
					gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
				}
				// Down
				if(posYUpdate < posY) {
					for(var i=0; i < points.length; i++) {
						points[i][1] += .002;
					}
					gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
				}
				// Up
				else if(posYUpdate > posY) {
					for(var i=0; i < points.length; i++) {
						points[i][1] -= .002;
					}
					gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
				}
				posX = posXUpdate;
				posY = posYUpdate;
			}
		}
	}
	
    update();
};


function triangle( a, b, c, color )
{

    // add colors and vertices for one triangle

    var baseColors = [
        vec3(1.0, 0.0, 0.0),
        vec3(0.0, 1.0, 0.0),
        vec3(0.0, 0.0, 1.0),
        vec3(0.0, 0.0, 0.0)
    ];

    colors.push( baseColors[color] );
    points.push( a );
    colors.push( baseColors[color] );
    points.push( b );
    colors.push( baseColors[color] );
    points.push( c );
}

function tetra( a, b, c, d )
{
    // tetrahedron with each side using
    // a different color
    
    triangle( a, c, b, 0 );
    triangle( a, c, d, 1 );
    triangle( a, b, d, 2 );
    triangle( b, c, d, 3 );
}

function divideTetra( a, b, c, d, count )
{
    // check for end of recursion
    
    if ( count === 0 ) {
        tetra( a, b, c, d );
    }
    
    // find midpoints of sides
    // divide four smaller tetrahedra
    
    else {
        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var ad = mix( a, d, 0.5 );
        var bc = mix( b, c, 0.5 );
        var bd = mix( b, d, 0.5 );
        var cd = mix( c, d, 0.5 );

        --count;
        
        divideTetra(  a, ab, ac, ad, count );
        divideTetra( ab,  b, bc, bd, count );
        divideTetra( ac, bc,  c, cd, count );
        divideTetra( ad, bd, cd,  d, count );
    }
}


function square( a, b, c, d, color) {
	
	var someColors = [
		vec3(.5, .5, .5),
		vec3(1.0, 1.0, 0)
	]
	
	for(var k=0; k < 6; k++)
		floorColors.push(someColors[color]);
	
	floorPoints.push(a, b, d);
	floorPoints.push(a, c, d);
	
}

function drawPlane() {
	// Make plane
	
	var pColors = [
		vec3(1.0, 1.0, 1.0),
		vec3(0.0, 0.0, 0.0)
	]
	
	var i = 0; if(NumTimesToSubdivide < 5) i++;
    for (var z = 100.0; z > -100.0; z -= 5.0) {
        for (var x = -100.0; x < 100.0; x += 5.0) {
            if (i % 2) {
        // Add 6 colors to current square.
            colors.push( pColors[0]);
            colors.push( pColors[0]);
            colors.push( pColors[0]);
            colors.push( pColors[0]);
            colors.push( pColors[0]);
            colors.push( pColors[0]);
        }
        else {
        // Add 6 different colors to current square.
            colors.push( pColors[1]);
            colors.push( pColors[1]);
            colors.push( pColors[1]);
            colors.push( pColors[1]);
            colors.push( pColors[1]);
            colors.push( pColors[1]);
        }
        // Add 6 points that make the square. Each point
            points.push(vec3(x, -.9, z));
            points.push(vec3(x-5, -.9, z));
            points.push(vec3(x, -.9, z-5));
            points.push(vec3(x, -.9, z-5));
            points.push(vec3(x-5, -.9, z-5));
            points.push(vec3(x-5, -.9, z));

            ++i;
        }
        ++i;
    }
	
	
}

function update() {
	requestAnimationFrame(update);
	render();
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    //var eye = vec3(r*Math.sin(theta)*Math.cos(phi),
    	//r*Math.sin(theta)*Math.sin(phi), r*Math.cos(theta));
    
    //modelViewMatrix = lookAt(eye, at, up);
    
    //projectionMatrix = ortho( left, right, bottom, ytop, near, far );
    projectionMatrix = perspective(75, 1, 0.1, 10);
    
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    
    gl.drawArrays( gl.TRIANGLES, 0, numVerts );
    
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrixPlane));
    
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
    
    gl.drawArrays( gl.TRIANGLES, numVerts, numPlaneVerts);
}
