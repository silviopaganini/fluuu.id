var WAGNER = WAGNER || {};

WAGNER.vertexShadersPath = './vertex-shaders';
WAGNER.fragmentShadersPath = './fragment-shaders';
WAGNER.assetsPath = './assets';

WAGNER.log = function() {
	return;
	console.log( Array.prototype.slice.call( arguments ).join( ' ' ) );
};

WAGNER.Composer = function( renderer, settings ) {

	this.width = 1;
	this.height = 1;

	this.settings = settings || {};
	this.useRGBA = this.settings.useRGBA || false;

	this.renderer = renderer;
	this.copyPass = new WAGNER.CopyPass( this.settings );

	this.scene = new THREE.Scene();
	this.quad = new THREE.Mesh(
		new THREE.PlaneBufferGeometry( 1, 1 ),
		this.defaultMaterial
	);
	this.scene.add( this.quad );
	this.camera = new THREE.OrthographicCamera( 1, 1, 1, 1, -10000, 10000 );

	this.front = new THREE.WebGLRenderTarget(1, 1, {
		minFilter: this.settings.minFilter !== undefined ? this.settings.minFilter : THREE.LinearFilter,
		magFilter: this.settings.magFilter !== undefined ? this.settings.magFilter : THREE.LinearFilter,
		wrapS: this.settings.wrapS !== undefined ? this.settings.wrapS : THREE.ClampToEdgeWrapping,
		wrapT: this.settings.wrapT !== undefined ? this.settings.wrapT : THREE.ClampToEdgeWrapping,
		format: this.useRGBA ? THREE.RGBAFormat : THREE.RGBFormat,
		type: this.settings.type !== undefined ? this.settings.type : THREE.UnsignedByteType,
		stencilBuffer: this.settings.stencilBuffer !== undefined ? this.settings.stencilBuffer : true
	});
	
	this.back = this.front.clone();

	this.startTime = Date.now();

	this.passes = {};

};

WAGNER.Composer.prototype.linkPass = function( id, pass ) {

	function WagnerLoadPassException( message ) {
		this.message = 'Pass "' + id + '" already loaded.';
		this.name = "WagnerLoadPassException";
		this.toString = function() {
			return this.message;
		};
	}
	
	if( this.passes[ id ] ) {
		throw new WagnerLoadPassException( id, pass );
	}

	this.passes[ id ] = pass;

};

WAGNER.Composer.prototype.swapBuffers = function() {

	this.output = this.write;
	this.input = this.read;

	var t = this.write;
	this.write = this.read;
	this.read = t;

};

WAGNER.Composer.prototype.render = function( scene, camera, keep, output ) {

	if( this.copyPass.isLoaded() ) {
		if( keep ) this.swapBuffers();
		this.renderer.render( scene, camera, output?output:this.write, true );
		if( !output ) this.swapBuffers();
	}

};

WAGNER.Composer.prototype.toScreen = function() {

	if( this.copyPass.isLoaded() ) {
		this.quad.material = this.copyPass.shader;
		this.quad.material.uniforms.tInput.value = this.read;
		this.quad.material.uniforms.resolution.value.set( this.width, this.height );
		this.renderer.render( this.scene, this.camera );
	}

};

WAGNER.Composer.prototype.toTexture = function( t ) {

	if( this.copyPass.isLoaded() ) {
		this.quad.material = this.copyPass.shader;
		this.quad.material.uniforms.tInput.value = this.read;
		this.renderer.render( this.scene, this.camera, t, true );
	}

};

WAGNER.Composer.prototype.pass = function( pass, uniforms ) {

	if( typeof pass === 'string' ) {
		this.quad.material = this.passes[ pass ];
	}
	if( pass instanceof THREE.ShaderMaterial ) {
		this.quad.material = pass;
	}
	if( pass instanceof WAGNER.Pass ) {
		if( !pass.isLoaded() ) return;
		pass.run( this );
		return;
	}

	if( !pass.isSim ) this.quad.material.uniforms.tInput.value = this.read;
	for( var j in uniforms ) {
		this.quad.material.uniforms[ j ].value = uniforms[ j ];
	}
	this.quad.material.uniforms.resolution.value.set( this.width, this.height );
	this.quad.material.uniforms.time.value = 0.001 * ( Date.now() - this.startTime );
	this.renderer.render( this.scene, this.camera, this.write, false );
	this.swapBuffers();

};

WAGNER.Composer.prototype.reset = function() {

	this.read = this.front;
	this.write = this.back;

	this.output = this.write;
	this.input = this.read;

};

WAGNER.Composer.prototype.setSource = function( src ) {

	if( this.copyPass.isLoaded() ) {
		this.quad.material = this.copyPass.shader;
		this.quad.material.uniforms.tInput.value = src;
		this.renderer.render( this.scene, this.camera, this.write, true );
		this.swapBuffers();
	}

};

WAGNER.Composer.prototype.setSize = function( w, h ) {

	this.width = w;
	this.height = h;

	this.camera.projectionMatrix.makeOrthographic( w / - 2, w / 2, h / 2, h / - 2, this.camera.near, this.camera.far );
	this.quad.scale.set( w, h, 1 );

	var rt = this.front.clone();
	rt.width = w;
	rt.height = h;
	if( this.quad.material instanceof WAGNER.Pass ) this.quad.material.uniforms.tInput.value = rt;
	this.front = rt;

	rt = this.back.clone();
	rt.width = w;
	rt.height = h;
	this.back = rt;

};

WAGNER.Composer.prototype.defaultMaterial = new THREE.MeshBasicMaterial();

WAGNER.loadShader = function( file, callback ) {

	var oReq = new XMLHttpRequest();
	oReq.onload = function() {
		var content = oReq.responseText;
		callback( content );
	}.bind( this );
	oReq.onerror = function() {

		function WagnerLoadShaderException( f ) {
			this.message = 'Shader "' + f + '" couldn\'t be loaded.';
			this.name = "WagnerLoadShaderException";
			this.toString = function() {
				return this.message;
			};
		}
		throw new WagnerLoadShaderException( file );
	};
	oReq.onabort = function() {

		function WagnerLoadShaderException( f ) {
			this.message = 'Shader "' + f + '" load was aborted.';
			this.name = "WagnerLoadShaderException";
			this.toString = function() {
				return this.message;
			};
		}
		throw new WagnerLoadShaderException( file );
	};
	oReq.open( 'get', file, true );
	oReq.send();

};

WAGNER.processShader = function( vertexShaderCode, fragmentShaderCode ) {

	WAGNER.log( 'Processing Shader | Performing uniform Reflection...' );

	var regExp = /uniform\s+([^\s]+)\s+([^\s]+)\s*;/gi; 
	var regExp2 = /uniform\s+([^\s]+)\s+([^\s]+)\s*\[\s*(\w+)\s*\]*\s*;/gi;

	var typesMap = {
		
		sampler2D: { type: 't', value: function() { return new THREE.Texture(); } },
		samplerCube: { type: 't', value: function() {} },

		bool:  { type: 'b', value: function() { return 0; } },
		int:   { type: 'i', value: function() { return 0; } },
		float: { type: 'f', value: function() { return 0; } },
		
		vec2: { type: 'v2', value: function() { return new THREE.Vector2(); } },
		vec3: { type: 'v3', value: function() { return new THREE.Vector3(); } },
		vec4: { type: 'v4', value: function() { return new THREE.Vector4(); } },

		bvec2: { type: 'v2', value: function() { return new THREE.Vector2(); } },
		bvec3: { type: 'v3', value: function() { return new THREE.Vector3(); } },
		bvec4: { type: 'v4', value: function() { return new THREE.Vector4(); } },

		ivec2: { type: 'v2', value: function() { return new THREE.Vector2(); } },
		ivec3: { type: 'v3', value: function() { return new THREE.Vector3(); } },
		ivec4: { type: 'v4', value: function() { return new THREE.Vector4(); } },

		mat2: { type: 'v2', value: function() { return new THREE.Matrix2(); } },
		mat3: { type: 'v3', value: function() { return new THREE.Matrix3(); } },
		mat4: { type: 'v4', value: function() { return new THREE.Matrix4(); } }

	};

	var arrayTypesMap = {
		float: { type: 'fv', value: function() { return []; } },
		vec3: { type: 'v3v', value: function() { return []; } }
	};

	var matches;
	var uniforms = {
		resolution: { type: 'v2', value: new THREE.Vector2( 1, 1 ), default: true },
		time: { type: 'f', value: Date.now(), default: true },
		tInput: { type: 't', value: new THREE.Texture(), default: true }
	};

  var uniformType, uniformName, arraySize;
  
	while( ( matches = regExp.exec( fragmentShaderCode ) ) !== null) {
		if( matches.index === regExp.lastIndex) {
			regExp.lastIndex++;
		}
		uniformType = matches[ 1 ];
		uniformName = matches[ 2 ];
		WAGNER.log( '  > SINGLE', uniformType, uniformName );
		uniforms[ uniformName ] = {
			type: typesMap[ uniformType ].type,
			value: typesMap[ uniformType ].value()
		};
	}

	while( ( matches = regExp2.exec( fragmentShaderCode ) ) !== null) {
		if( matches.index === regExp.lastIndex) {
			regExp.lastIndex++;
		}
		uniformType = matches[ 1 ];
		uniformName = matches[ 2 ];
		arraySize = matches[ 3 ];
		WAGNER.log( '  > ARRAY', arraySize, uniformType, uniformName );
		uniforms[ uniformName ] = {
			type: arrayTypesMap[ uniformType ].type,
			value: arrayTypesMap[ uniformType ].value()
		};
	}

	WAGNER.log( 'Uniform reflection completed. Compiling...' );

	var shader = new THREE.ShaderMaterial( {
		uniforms: uniforms,
		vertexShader: vertexShaderCode,
		fragmentShader: fragmentShaderCode,
		shading: THREE.FlatShading,
		depthWrite: false,
		depthTest: false,
		transparent: true
	} );

	WAGNER.log( 'Compiled' );

	return shader;

};

WAGNER.Pass = function() {

	WAGNER.log( 'Pass constructor' );
	this.shader = null;
	this.loaded = null;
	this.params = {};
	this.isSim = false;

};

WAGNER.GLSLList = {
	'blend-fs.glsl'     : "varying vec2 a;uniform sampler2D tInput;uniform sampler2D tInput2;uniform vec2 resolution;uniform vec2 resolution2;uniform float aspectRatio;uniform float aspectRatio2;uniform float opacity;uniform int mode;uniform int sizeMode;vec2 b=a;float e(float c,float d){return c<.5?2.*c*d:1.-2.*(1.-c)*(1.-d);}float f(float c,float d){return d<.5?2.*c*d+c*c*(1.-2.*d):sqrt(c)*(2.*d-1.)+2.*c*(1.-d);}float g(float c,float d){return d==0.?d:max(1.-(1.-c)/d,0.);}float h(float c,float d){return d==1.?d:min(c/(1.-d),1.);}float i(float c,float d){return max(c+d-1.,0.);}float j(float c,float d){return min(c+d,1.);}float k(float c,float d){return d<.5?i(c,2.*d):j(c,2.*(d-.5));}void main(){if(sizeMode==1){if(aspectRatio2>aspectRatio){b.x*=aspectRatio/aspectRatio2;    b.x+=.5*(1.-aspectRatio/aspectRatio2);}if(aspectRatio2<aspectRatio){b.y*=aspectRatio2/aspectRatio;    b.y+=.5*(1.-aspectRatio2/aspectRatio);}}vec4 c,d;c=texture2D(tInput,a);d=texture2D(tInput2,b);if(mode==1){gl_FragColor=c;    gl_FragColor.a*=opacity;return;}if(mode==2){}if(mode==3){gl_FragColor=min(c,d);    return;}if(mode==4){gl_FragColor=c*d;    return;}if(mode==5){gl_FragColor=vec4(g(c.r,d.r),g(c.g,d.g),g(c.b,d.b),g(c.a,d.a));    return;}if(mode==6){gl_FragColor=max(c+d-1.,0.);    return;}if(mode==7){}if(mode==8){gl_FragColor=max(c,d);    return;}if(mode==9){gl_FragColor=1.-(1.-c)*(1.-d);    gl_FragColor=gl_FragColor*opacity+c*(1.-opacity);return;}if(mode==10){gl_FragColor=vec4(h(c.r,d.r),h(c.g,d.g),h(c.b,d.b),h(c.a,d.a));    return;}if(mode==11){gl_FragColor=min(c+d,1.);    return;}if(mode==12){}if(mode==13){gl_FragColor=(gl_FragColor=vec4(e(c.r,d.r),e(c.g,d.g),e(c.b,d.b),e(c.a,d.a)));    gl_FragColor=gl_FragColor*opacity+c*(1.-opacity);return;}if(mode==14){gl_FragColor=vec4(f(c.r,d.r),f(c.g,d.g),f(c.b,d.b),f(c.a,d.a));    return;}if(mode==15){gl_FragColor=vec4(e(c.r,d.r),e(c.g,d.g),e(c.b,d.b),e(c.a,d.a));    gl_FragColor=gl_FragColor*opacity+c*(1.-opacity);return;}if(mode==16){}if(mode==17){gl_FragColor=vec4(k(c.r,d.r),k(c.g,d.g),k(c.b,d.b),k(c.a,d.a));    return;}if(mode==18){}if(mode==19){}if(mode==20){gl_FragColor=abs(c-d);    gl_FragColor.a=c.a+d.b;return;}if(mode==21)gl_FragColor=c+d-2.*c*d;if(mode==22){}if(mode==23){}gl_FragColor=vec4(1,0,1,1);}",
	'vignette-fs.glsl'  : "uniform sampler2D tInput;uniform float falloff;uniform float amount;varying vec2 a;void main(){vec4 b=texture2D(tInput,a);float c=distance(a,vec2(.5));b.rgb*=smoothstep(.8,falloff*.799,c*(amount+falloff));gl_FragColor=b;}",
	'vignette2-fs.glsl' : "varying vec2 a;uniform sampler2D tInput;uniform vec2 resolution;uniform float reduction;uniform float boost;void main(){vec4 b=texture2D(tInput,a);vec2 c=resolution*.5;float d=distance(c,gl_FragCoord.xy)/resolution.x;d=boost-d*reduction;b.rgb*=d;gl_FragColor=b;}",
	'box-blur-fs.glsl'  : "varying vec2 a;uniform sampler2D tInput;uniform vec2 delta;float i(vec3 b,float c){return fract(sin(dot(gl_FragCoord.xyz+c,b))*43758.5453+c);}void main(){vec4 b=vec4(0);float c,d;c=0.;d=i(vec3(12.9898,78.233,151.7182),0.);for(float e=-30.;e<=30.;e++){float f,g;f=(e+d-.5)/30.;g=1.-abs(f);vec4 h=texture2D(tInput,a+delta*f);h.rgb*=h.a;b+=h*g;c+=g;}gl_FragColor=b/c;gl_FragColor.rgb/=gl_FragColor.a+1e-5;}",
	'zoom-blur-fs.glsl' : "uniform sampler2D tInput;uniform vec2 center;uniform vec2 resolution;uniform float strength;varying vec2 a;float j(vec3 b,float c){return fract(sin(dot(gl_FragCoord.xyz+c,b))*43758.5453+c);}void main(){vec4 b=vec4(0);float c,e;c=0.;vec2 d=center-a*resolution;e=j(vec3(12.9898,78.233,151.7182),0.);for(float f=0.;f<=40.;f++){float g,h;g=(f+e)/40.;h=4.*(g-g*g);vec4 i=texture2D(tInput,a+d*g*strength/resolution);i.rgb*=i.a;b+=i*h;c+=h;}gl_FragColor=b/c;gl_FragColor.rgb/=gl_FragColor.a+1e-5;}",
	'orto-vs.glsl'      : "varying vec2 a;void main(){a=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1);}",
	"copy-fs.glsl"      : "varying vec2 a;uniform sampler2D tInput;void main(){gl_FragColor=texture2D(tInput,a);}",


}

WAGNER.Pass.prototype.loadShader = function( id, c ) {

	var self = this;

	self.shader = WAGNER.processShader( WAGNER.GLSLList['orto-vs.glsl'], WAGNER.GLSLList[id] );
	// console.log(self.shader)
	if( c ) c.apply( self );

	// WAGNER.loadShader( WAGNER.vertexShadersPath + '/orto-vs.glsl', function( vs ) {
	// 	WAGNER.loadShader( WAGNER.fragmentShadersPath + '/' + id, function( fs ) {
	// 		self.shader = WAGNER.processShader( vs, fs );
	// 		//self.mapUniforms( self.shader.uniforms );
	// 		if( c ) c.apply( self );
	// 	} );
	// } );

};

WAGNER.Pass.prototype.mapUniforms = function( uniforms ) {

	var params = this.params;

	for( var j in uniforms ) {
		if( !uniforms[ j ].default ) {
			(function( id ) {
				Object.defineProperty( params, id, { 
					get : function(){ return uniforms[ id ].value; }, 
					set : function( v ){ uniforms[ id ].value = v; },
					configurable : false 
				} );
			})( j );
		}
	}

};

WAGNER.Pass.prototype.run = function( c ) {

	//WAGNER.log( 'Pass run' );
	c.pass( this.shader );

};

WAGNER.Pass.prototype.isLoaded = function() {
	
	if( this.loaded === null ) {
		if( this.shader instanceof THREE.ShaderMaterial ) {
			this.loaded = true;
		}
	} else {
		return this.loaded;
	}

};

WAGNER.Pass.prototype.getOfflineTexture = function( w, h, useRGBA ){

	var rtTexture = new THREE.WebGLRenderTarget( w, h, { 
		minFilter: THREE.LinearFilter, 
		magFilter: THREE.LinearFilter, 
		format: useRGBA?THREE.RGBAFormat:THREE.RGBFormat
	} );

	return rtTexture;

};

WAGNER.CopyPass = function() {

	WAGNER.Pass.call( this );
	WAGNER.log( 'CopyPass constructor' );
	this.loadShader( 'copy-fs.glsl' );

};

WAGNER.CopyPass.prototype = Object.create( WAGNER.Pass.prototype );

WAGNER.GenericPass = function( fragmentShaderSource, c ) {

	WAGNER.Pass.call( this );
	var self = this;
	WAGNER.loadShader( WAGNER.vertexShadersPath + '/orto-vs.glsl', function( vs ) {
		WAGNER.loadShader( fragmentShaderSource, function( fs ) {
			self.shader = WAGNER.processShader( vs, fs );
			if( c ) c.apply( self );
		} );
	} );

}

WAGNER.GenericPass.prototype = Object.create( WAGNER.Pass.prototype );

window.WAGNER = WAGNER;
