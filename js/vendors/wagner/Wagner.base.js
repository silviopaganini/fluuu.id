WAGNER.BlendPass = function() {

	WAGNER.Pass.call( this );
	WAGNER.log( 'BlendPass constructor' );
	this.loadShader( 'blend-fs.glsl' );

	this.params.mode = 1;
	this.params.opacity = 1;
	this.params.tInput2 = null;
	this.params.resolution2 = new THREE.Vector2();
	this.params.sizeMode = 1
	this.params.aspectRatio = 1;
	this.params.aspectRatio2 = 1;

};

WAGNER.BlendMode = {
	Normal: 1,
	Dissolve: 2,
	Darken: 3,
	Multiply: 4,
	ColorBurn: 5,
	LinearBurn: 6,
	DarkerColor: 7,
	Lighten: 8,
	Screen: 9,
	ColorDodge: 10,
	LinearDodge: 11,
	LighterColor: 12,
	Overlay: 13,
	SoftLight: 14,
	HardLight: 15,
	VividLight: 16,
	LinearLight: 17,
	PinLight: 18,
	HardMix: 19,
	Difference: 20,
	Exclusion: 21,
	Substract: 22,
	Divide: 23
};

WAGNER.BlendPass.prototype = Object.create( WAGNER.Pass.prototype );

WAGNER.BlendPass.prototype.run = function( c ) {

	this.shader.uniforms.mode.value = this.params.mode;
	this.shader.uniforms.opacity.value = this.params.opacity;
	this.shader.uniforms.tInput2.value = this.params.tInput2;
	this.shader.uniforms.sizeMode.value = this.params.sizeMode;
	this.shader.uniforms.aspectRatio.value = this.params.aspectRatio;
	this.shader.uniforms.aspectRatio2.value = this.params.aspectRatio2;
		c.pass( this.shader );

}

// WAGNER.InvertPass = function() {

// 	WAGNER.Pass.call( this );
// 	WAGNER.log( 'InvertPass constructor' );
// 	this.loadShader( 'invert-fs.glsl' );

// };

// WAGNER.InvertPass.prototype = Object.create( WAGNER.Pass.prototype );

// WAGNER.SepiaPass = function() {

// 	WAGNER.Pass.call( this );
// 	WAGNER.log( 'SepiaPass constructor' );
// 	this.loadShader( 'sepia-fs.glsl' );

// 	this.params.amount = 1;

// };

// WAGNER.SepiaPass.prototype = Object.create( WAGNER.Pass.prototype );

// WAGNER.SepiaPass.prototype.run = function( c ) {

// 	this.shader.uniforms.amount.value = this.params.amount;
// 	c.pass( this.shader );

// }

WAGNER.Pass.prototype.bindUniform = function( p, s, v, c ) {

	Object.defineProperty( p, v, { 
		get : function(){ return s.uniforms[ id ].value; }, 
		set : c,
		configurable : false 
	} );

};

// WAGNER.NoisePass = function() {

// 	WAGNER.Pass.call( this );
// 	WAGNER.log( 'Noise Pass constructor' );
// 	this.loadShader( 'noise-fs.glsl' );

// 	this.params.amount = 0.1;
// 	this.params.speed = 0;

// };

// WAGNER.NoisePass.prototype = Object.create( WAGNER.Pass.prototype );

// WAGNER.NoisePass.prototype.run = function( c ) {

// 	this.shader.uniforms.amount.value = this.params.amount;
// 	this.shader.uniforms.speed.value = this.params.speed;
// 	c.pass( this.shader );

// };

WAGNER.VignettePass = function() {

	WAGNER.Pass.call( this );
	WAGNER.log( 'Vignette Pass constructor' );
	this.loadShader( 'vignette-fs.glsl' );

	this.params.amount = 1;
	this.params.falloff = 0.1;

};

WAGNER.VignettePass.prototype = Object.create( WAGNER.Pass.prototype );

WAGNER.VignettePass.prototype.run = function( c ) {

	this.shader.uniforms.amount.value = this.params.amount;
	this.shader.uniforms.falloff.value = this.params.falloff;
	c.pass( this.shader );

};

WAGNER.Vignette2Pass = function() {

	WAGNER.Pass.call( this );
	WAGNER.log( 'Vignette Pass constructor' );
	this.loadShader( 'vignette2-fs.glsl' );

	this.params.boost = 2;
	this.params.reduction = 2;

};

WAGNER.Vignette2Pass.prototype = Object.create( WAGNER.Pass.prototype );

WAGNER.Vignette2Pass.prototype.run = function( c ) {

	this.shader.uniforms.boost.value = this.params.boost;
	this.shader.uniforms.reduction.value = this.params.reduction;
	c.pass( this.shader );

};

// WAGNER.DenoisePass = function() {

// 	WAGNER.Pass.call( this );
// 	WAGNER.log( 'Denoise Pass constructor' );
// 	this.loadShader( 'denoise-fs.glsl' );

// 	this.params.exponent = 5;
// 	this.params.strength = 10;

// };

// WAGNER.DenoisePass.prototype = Object.create( WAGNER.Pass.prototype );

// WAGNER.DenoisePass.prototype.run = function( c ) {

// 	this.shader.uniforms.exponent.value = this.params.exponent;
// 	this.shader.uniforms.strength.value = this.params.strength;
// 	c.pass( this.shader );

// };

WAGNER.BoxBlurPass = function() {

	WAGNER.Pass.call( this );
	WAGNER.log( 'BoxBlurPass Pass constructor' );
	this.loadShader( 'box-blur-fs.glsl' );
	this.params.delta = new THREE.Vector2( 0, 0 );

};

WAGNER.BoxBlurPass.prototype = Object.create( WAGNER.Pass.prototype );

WAGNER.BoxBlurPass.prototype.run = function( c ) {

	this.shader.uniforms.delta.value.copy( this.params.delta );
	c.pass( this.shader );

}

WAGNER.FullBoxBlurPass = function() {

	WAGNER.Pass.call( this );
	WAGNER.log( 'FullBoxBlurPass Pass constructor' );
	this.boxPass = new WAGNER.BoxBlurPass();
	this.params.amount = 20;

};

WAGNER.FullBoxBlurPass.prototype = Object.create( WAGNER.Pass.prototype );

WAGNER.FullBoxBlurPass.prototype.isLoaded = function() {

	if( this.boxPass.isLoaded() ) {
		this.loaded = true;
	}
	return WAGNER.Pass.prototype.isLoaded.call( this );

};

WAGNER.FullBoxBlurPass.prototype.run = function( c ) {

	this.boxPass.params.delta.set( this.params.amount / c.width, 0 );
	c.pass( this.boxPass );
	this.boxPass.params.delta.set( 0, this.params.amount / c.height );
	c.pass( this.boxPass );

};

WAGNER.ZoomBlurPass = function() {

	WAGNER.Pass.call( this );
	WAGNER.log( 'ZoomBlurPass Pass constructor' );
	this.loadShader( 'zoom-blur-fs.glsl' );

	this.params.center = new THREE.Vector2( 0.5, 0.5 );
	this.params.strength = 2;

};

WAGNER.ZoomBlurPass.prototype = Object.create( WAGNER.Pass.prototype );

WAGNER.ZoomBlurPass.prototype.run = function( c ) {

	this.shader.uniforms.center.value.copy ( this.params.center );
	this.shader.uniforms.strength.value = this.params.strength;
	c.pass( this.shader );

};

WAGNER.MultiPassBloomPass = function() {

	WAGNER.Pass.call( this );
	WAGNER.log( 'MultiPassBloomPass Pass constructor' );

	this.composer = null;

	var s = 0.25;
	this.tmpTexture  = this.getOfflineTexture( 512, 512 );//s * window.innerWidth, s * window.innerHeight );
	this.blurPass    = new WAGNER.FullBoxBlurPass();
	this.blendPass   = new WAGNER.BlendPass();
	this.zoomBlur    = new WAGNER.ZoomBlurPass();

	this.params.blurAmount = 20;
	this.params.applyZoomBlur = false;
	this.params.zoomBlurStrength = 2;
	this.params.useTexture = false;
	this.params.zoomBlurCenter = new THREE.Vector2( 0,0 );

};

WAGNER.MultiPassBloomPass.prototype = Object.create( WAGNER.Pass.prototype );

WAGNER.MultiPassBloomPass.prototype.isLoaded = function() {

	if( this.blurPass.isLoaded() && 
		this.blendPass.isLoaded() &&
		this.zoomBlur.isLoaded() ) {
		this.loaded = true;
	}
	return WAGNER.Pass.prototype.isLoaded.call( this );

};

WAGNER.MultiPassBloomPass.prototype.run = function( c ) {

	if( !this.composer ) {
		this.composer = new WAGNER.Composer( c.renderer, { useRGBA: true } );
		this.composer.setSize( this.tmpTexture.width, this.tmpTexture.height );
	}

	this.composer.reset();

	if( this.params.useTexture === true ) {
		this.composer.setSource( this.params.glowTexture );
	} else {
		this.composer.setSource( c.output );
	}

	this.blurPass.params.amount = this.params.blurAmount;
	this.composer.pass( this.blurPass );
	
	if( this.params.applyZoomBlur ) {
		this.zoomBlur.params.center.set( .5 * this.composer.width, .5 * this.composer.height );
		this.zoomBlur.params.strength = this.params.zoomBlurStrength;
		this.composer.pass( this.zoomBlur );
	}

	if( this.params.useTexture === true ) {
		this.blendPass.params.mode = WAGNER.BlendMode.Screen;
		this.blendPass.params.tInput = this.params.glowTexture;
		c.pass( this.blendPass );
	}

	this.blendPass.params.mode = WAGNER.BlendMode.Screen;
	this.blendPass.params.tInput2 = this.composer.output;
	c.pass( this.blendPass );

};

// WAGNER.CGAPass = function() {

// 	WAGNER.Pass.call( this );
// 	WAGNER.log( 'CGA Pass constructor' );
// 	this.loadShader( 'cga-fs.glsl', function() {
// 		this.shader.uniforms.pixelDensity.value = window.devicePixelRatio;
// 	} );

// };

// WAGNER.CGAPass.prototype = Object.create( WAGNER.Pass.prototype );

// WAGNER.SobelEdgeDetectionPass = function() {

// 	WAGNER.Pass.call( this );
// 	WAGNER.log( 'SobelEdgeDetectionPass Pass constructor' );
// 	this.loadShader( 'sobel-fs.glsl' );

// };

// WAGNER.SobelEdgeDetectionPass.prototype = Object.create( WAGNER.Pass.prototype );

// WAGNER.FreiChenEdgeDetectionPass = function() {

// 	WAGNER.Pass.call( this );
// 	WAGNER.log( 'FreiChenEdgeDetectionPass Pass constructor' );
// 	this.loadShader( 'frei-chen-fs.glsl' );

// };

// WAGNER.FreiChenEdgeDetectionPass.prototype = Object.create( WAGNER.Pass.prototype );

// WAGNER.DirtPass = function() {

// 	this.dirtTexture = THREE.ImageUtils.loadTexture("data:image/jpg;base64,/9j/4QAYRXhpZgAASUkqAAgAAAAAAAAAAAAAAP/sABFEdWNreQABAAQAAAAFAAD/4QNkaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49Iu+7vyIgaWQ9Ilc1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCI/PiA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJBZG9iZSBYTVAgQ29yZSA1LjUtYzAyMSA3OS4xNTQ5MTEsIDIwMTMvMTAvMjktMTE6NDc6MTYgICAgICAgICI+IDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+IDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9IjBCM0IwMDc0OUQ2MkU0MjQ0MTRCNDVBMThBNDgxMkI5IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjc2QzMxQ0UwMDZENDExRTU4M0EwQjhCMzQ4MkMxRjgxIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjc2QzMxQ0RGMDZENDExRTU4M0EwQjhCMzQ4MkMxRjgxIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmQzYWIwZGJiLTY2Y2UtNDEyZi04ZTI1LTE5NmEzNmRiMWE5YSIgc3RSZWY6ZG9jdW1lbnRJRD0iMEIzQjAwNzQ5RDYyRTQyNDQxNEI0NUExOEE0ODEyQjkiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/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");
// 	this.blendPass = new WAGNER.BlendPass();
// 	// this.dirtTexture = THREE.ImageUtils.loadTexture( WAGNER.assetsPath + '/textures/dirt8.jpg' );
// };

// WAGNER.DirtPass.prototype = Object.create( WAGNER.Pass.prototype );

// WAGNER.DirtPass.prototype.isLoaded = function() {

// 	if( this.blendPass.isLoaded() ) {
// 		this.loaded = true;
// 	}
// 	return WAGNER.Pass.prototype.isLoaded.call( this );

// };

// WAGNER.DirtPass.prototype.run = function( c ) {

// 	if(!this.dirtTexture.image) return

// 	this.blendPass.params.sizeMode = 1;
// 	this.blendPass.params.mode = WAGNER.BlendMode.SoftLight;
// 	this.blendPass.params.tInput2 = this.dirtTexture;
// 	this.blendPass.params.resolution2.set( this.dirtTexture.image.width, this.dirtTexture.image.height );
// 	this.blendPass.params.aspectRatio = c.read.width / c.read.height;
// 	this.blendPass.params.aspectRatio2 = this.dirtTexture.image.width / this.dirtTexture.image.height;
// 	c.pass( this.blendPass );

// };

// WAGNER.GuidedBoxBlurPass = function() {

// 	WAGNER.Pass.call( this );
// 	WAGNER.log( 'GuidedBoxBlurPass Pass constructor' );
// 	this.loadShader( 'guided-box-blur-fs.glsl' );

// 	this.params.tBias = null;
// 	this.params.delta = new THREE.Vector2( .01, 0 );
// 	this.params.invertBiasMap = false;
// 	this.params.isPacked = 0;
// 	this.params.from = 0;
// 	this.params.to = 1;

// };

// WAGNER.GuidedBoxBlurPass.prototype = Object.create( WAGNER.Pass.prototype );

// WAGNER.GuidedBoxBlurPass.prototype.run = function( c ) {

// 	this.shader.uniforms.tBias.value = this.params.tBias,
// 	this.shader.uniforms.delta.value.copy( this.params.delta );
// 	this.shader.uniforms.invertBiasMap.value = this.params.invertBiasMap;
// 	this.shader.uniforms.isPacked.value = this.params.isPacked;
// 	this.shader.uniforms.from.value = this.params.from;
// 	this.shader.uniforms.to.value = this.params.to;
// 	c.pass( this.shader );

// }

// WAGNER.GuidedFullBoxBlurPass = function() {

// 	WAGNER.Pass.call( this );
// 	WAGNER.log( 'FullBoxBlurPass Pass constructor' );
// 	this.guidedBoxPass = new WAGNER.GuidedBoxBlurPass();


// 	this.params.tBias = null;
// 	this.params.invertBiasMap = false;
// 	this.params.isPacked = 0;
// 	this.params.amount = 10;
// 	this.params.from = 0;
// 	this.params.to = 1;

// };

// WAGNER.GuidedFullBoxBlurPass.prototype = Object.create( WAGNER.Pass.prototype );

// WAGNER.GuidedFullBoxBlurPass.prototype.isLoaded = function() {

// 	if( this.guidedBoxPass.isLoaded() ) {
// 		this.loaded = true;
// 	}
// 	return WAGNER.Pass.prototype.isLoaded.call( this );

// };

// WAGNER.GuidedFullBoxBlurPass.prototype.run = function( c ) {

// 	this.guidedBoxPass.params.invertBiasMap = this.params.invertBiasMap;
// 	this.guidedBoxPass.params.isPacked = this.params.isPacked;
// 	this.guidedBoxPass.params.tBias = this.params.tBias;
// 	this.guidedBoxPass.params.from = this.params.from;
// 	this.guidedBoxPass.params.to = this.params.to;
// 	this.guidedBoxPass.params.delta.set( this.params.amount / c.width, 0 );
// 	c.pass( this.guidedBoxPass );
// 	this.guidedBoxPass.params.delta.set( 0, this.params.amount / c.height );
// 	c.pass( this.guidedBoxPass );

// };

// WAGNER.PixelatePass = function() {

// 	WAGNER.Pass.call( this );
// 	WAGNER.log( 'PixelatePass Pass constructor' );
// 	this.loadShader( 'pixelate-fs.glsl' );

// 	this.params.amount = 320;

// };

// WAGNER.PixelatePass.prototype = Object.create( WAGNER.Pass.prototype );

// WAGNER.PixelatePass.prototype.run = function( c ) {

// 	this.shader.uniforms.amount.value = this.params.amount;
// 	c.pass( this.shader );

// }

// WAGNER.RGBSplitPass = function() {

// 	WAGNER.Pass.call( this );
// 	WAGNER.log( 'RGBSplitPass Pass constructor' );
// 	this.loadShader( 'rgb-split-fs.glsl', function() {
// 	} );

// 	this.params.delta = new THREE.Vector2();

// };

// WAGNER.RGBSplitPass.prototype = Object.create( WAGNER.Pass.prototype );

// WAGNER.RGBSplitPass.prototype.run = function( c ) {

// 	this.shader.uniforms.distance.value.copy( this.params.delta );
// 	c.pass( this.shader );

// }

/*

https://www.shadertoy.com/view/XssGz8

Simulates Chromatic Aberration by linearly interpolating blur-weights from red to green to blue.
Original idea by Kusma: https://github.com/kusma/vlee/blob/master/data/postprocess.fx
Barrel Blur forked from https://www.shadertoy.com/view/XslGz8

*/

// WAGNER.ChromaticAberrationPass = function() {

// 	WAGNER.Pass.call( this );
// 	WAGNER.log( 'ChromaticAberrationPass Pass constructor' );
// 	this.loadShader( 'chromatic-aberration-fs.glsl' );

// };

// WAGNER.ChromaticAberrationPass.prototype = Object.create( WAGNER.Pass.prototype );

// WAGNER.BarrelBlurPass = function() {

// 	WAGNER.Pass.call( this );
// 	WAGNER.log( 'BarrelBlurPass Pass constructor' );
// 	this.loadShader( 'barrel-blur-fs.glsl' );

// };

// WAGNER.BarrelBlurPass.prototype = Object.create( WAGNER.Pass.prototype );

// WAGNER.OldVideoPass = function() {

// 	WAGNER.Pass.call( this );
// 	WAGNER.log( 'OldVideoPass Pass constructor' );
// 	this.loadShader( 'old-video-fs.glsl' );

// };

// WAGNER.OldVideoPass.prototype = Object.create( WAGNER.Pass.prototype );

// WAGNER.DotScreenPass = function() {

// 	WAGNER.Pass.call( this );
// 	WAGNER.log( 'DotScreenPass Pass constructor' );
// 	this.loadShader( 'dot-screen-fs.glsl' );

// };

// WAGNER.DotScreenPass.prototype = Object.create( WAGNER.Pass.prototype );

// WAGNER.PoissonDiscBlurPass = function() {

// 	WAGNER.Pass.call( this );
// 	WAGNER.log( 'PoissonDiscBlurPass Pass constructor' );
// 	this.loadShader( 'poisson-disc-blur-fs.glsl' );

// };

// WAGNER.PoissonDiscBlurPass.prototype = Object.create( WAGNER.Pass.prototype );

// WAGNER.CircularBlurPass = function() {

// 	WAGNER.Pass.call( this );
// 	WAGNER.log( 'CircularBlurPass Pass constructor' );
// 	this.loadShader( 'circular-blur-fs.glsl' );

// };

// WAGNER.CircularBlurPass.prototype = Object.create( WAGNER.Pass.prototype );

// WAGNER.ToonPass = function() {

// 	WAGNER.Pass.call( this );
// 	WAGNER.log( 'ToonPass Pass constructor' );
// 	this.loadShader( 'toon-fs.glsl' );

// };

// WAGNER.ToonPass.prototype = Object.create( WAGNER.Pass.prototype );

// WAGNER.FXAAPass = function() {

// 	WAGNER.Pass.call( this );
// 	WAGNER.log( 'FXAA Pass constructor' );
// 	this.loadShader( 'fxaa-fs.glsl' );

// };

// WAGNER.FXAAPass.prototype = Object.create( WAGNER.Pass.prototype );

// WAGNER.HighPassPass = function() {

// 	WAGNER.Pass.call( this );
// 	WAGNER.log( 'HighPass Pass constructor' );
// 	this.loadShader( 'high-pass-fs.glsl' );

// };

// WAGNER.HighPassPass.prototype = Object.create( WAGNER.Pass.prototype );

// WAGNER.GrayscalePass = function() {

// 	WAGNER.Pass.call( this );
// 	WAGNER.log( 'GrayscalePass Pass constructor' );
// 	this.loadShader( 'grayscale-fs.glsl' );

// };

// WAGNER.GrayscalePass.prototype = Object.create( WAGNER.Pass.prototype );

// WAGNER.ASCIIPass = function() {

// 	WAGNER.Pass.call( this );
// 	WAGNER.log( 'ASCIIPass Pass constructor' );
// 	this.loadShader( 'ascii-fs.glsl', function() {
// 		this.shader.uniforms.tAscii.value = THREE.ImageUtils.loadTexture( WAGNER.assetsPath + '/ascii/8x16_ascii_font_sorted.gif' );
// 	} );

// };

// WAGNER.ASCIIPass.prototype = Object.create( WAGNER.Pass.prototype );

// WAGNER.LEDPass = function() {

// 	WAGNER.Pass.call( this );
// 	WAGNER.log( 'LEDPass Pass constructor' );
// 	this.loadShader( 'led-fs.glsl', function() {
		
// 		//this.shader.uniforms.noiseTexture.value = 1;
// 	} );

// 	this.params.pixelSize = 10;
// 	this.params.tolerance = .25;
// 	this.params.pixelRadius = .25;
// 	this.params.luminanceSteps = 100;
// 	this.params.luminanceBoost = .2;
// 	this.params.colorBoost = .01;
// 	this.params.burntOutPercent = 50;
// };

// WAGNER.LEDPass.prototype = Object.create( WAGNER.Pass.prototype );

// WAGNER.LEDPass.prototype.run = function( c ) {

// 	this.shader.uniforms.pixelSize.value = this.params.pixelSize;
// 	this.shader.uniforms.tolerance.value = this.params.tolerance;
// 	this.shader.uniforms.pixelRadius.value = this.params.pixelRadius;
// 	this.shader.uniforms.luminanceSteps.value = this.params.luminanceSteps;
// 	this.shader.uniforms.luminanceBoost.value = this.params.luminanceBoost;
// 	this.shader.uniforms.colorBoost.value = this.params.colorBoost;
// 	this.shader.uniforms.burntOutPercent.value = this.params.burntOutPercent;

// 	c.pass( this.shader );

// }

// WAGNER.HalftonePass = function() {

// 	WAGNER.Pass.call( this );
// 	WAGNER.log( 'HalftonePass Pass constructor' );
// 	this.loadShader( 'halftone-fs.glsl', function() {
// 		this.shader.uniforms.pixelSize.value = 6;
// 	} );

// };

// WAGNER.HalftonePass.prototype = Object.create( WAGNER.Pass.prototype );

// WAGNER.Halftone2Pass = function() {

// 	WAGNER.Pass.call( this );
// 	WAGNER.log( 'Halftone2Pass Pass constructor' );
// 	this.loadShader( 'halftone2-fs.glsl' );

// 	this.params.amount = 128;
// 	this.params.smoothness = .25;

// };

// WAGNER.Halftone2Pass.prototype = Object.create( WAGNER.Pass.prototype );

// WAGNER.Halftone2Pass.prototype.run = function( c ) {

// 	this.shader.uniforms.amount.value = this.params.amount;
// 	this.shader.uniforms.smoothness.value = this.params.smoothness;

// 	c.pass( this.shader );

// }

// WAGNER.HalftoneCMYKPass = function() {

// 	WAGNER.Pass.call( this );
// 	WAGNER.log( 'HalftoneCMYKPass Pass constructor' );
// 	this.loadShader( 'halftone-cmyk-fs.glsl', function() {

// 	} );

// };

// WAGNER.HalftoneCMYKPass.prototype = Object.create( WAGNER.Pass.prototype );

// WAGNER.CrossFadePass = function() {

// 	WAGNER.Pass.call( this );
// 	WAGNER.log( 'CrossFadePass Pass constructor' );
// 	this.loadShader( 'crossfade-fs.glsl' );

// 	this.params.tInput2 = null;
// 	this.params.tFadeMap = null;
// 	this.params.amount = 0;

// };

// WAGNER.CrossFadePass.prototype = Object.create( WAGNER.Pass.prototype );

// WAGNER.CrossFadePass.prototype.run = function( c ) {

// 	this.shader.uniforms.tInput2.value = this.params.tInput2;
// 	this.shader.uniforms.tFadeMap.value = this.params.tFadeMap;
// 	this.shader.uniforms.amount.value = this.params.amount;

// 	c.pass( this.shader );

// }

// WAGNER.SSAOPass = function() {

// 	WAGNER.Pass.call( this );
// 	WAGNER.log( 'SSAOPass Pass constructor' );
// 	this.loadShader( 'ssao-fs.glsl', function( fs ) {
		
// 		/*this.shader.uniforms.pSphere.value = [
// 			new THREE.Vector3(-0.010735935, 0.01647018, 0.0062425877),
// 			new THREE.Vector3(-0.06533369, 0.3647007, -0.13746321),
// 			new THREE.Vector3(-0.6539235, -0.016726388, -0.53000957),
// 			new THREE.Vector3(0.40958285, 0.0052428036, -0.5591124),
// 			new THREE.Vector3(-0.1465366, 0.09899267, 0.15571679),
// 			new THREE.Vector3(-0.44122112, -0.5458797, 0.04912532),
// 			new THREE.Vector3(0.03755566, -0.10961345, -0.33040273),
// 			new THREE.Vector3(0.019100213, 0.29652783, 0.066237666),
// 			new THREE.Vector3(0.8765323, 0.011236004, 0.28265962),
// 			new THREE.Vector3(0.29264435, -0.40794238, 0.15964167)
// 		];*/
		
// 	} );

// 	this.params.texture = null;
// 	this.params.isPacked = false;
// 	this.params.onlyOcclusion = false;

// };

// WAGNER.SSAOPass.prototype = Object.create( WAGNER.Pass.prototype );

// WAGNER.SSAOPass.prototype.run = function( c ) {

// 	this.shader.uniforms.tDepth.value = this.params.texture;
// 	this.shader.uniforms.isPacked.value = this.params.isPacked;
// 	this.shader.uniforms.onlyOcclusion.value = this.params.onlyOcclusion;
// 	c.pass( this.shader );

// }

// WAGNER.DirectionalBlurPass = function() {

// 	WAGNER.Pass.call( this );
// 	WAGNER.log( 'Directional Blur Pass constructor' );
// 	this.loadShader( 'guided-directional-blur-fs.glsl', function( fs ) {
		
// 	} );

// 	this.params.tBias = null;
// 	this.params.delta = .1;

// }

// WAGNER.DirectionalBlurPass.prototype = Object.create( WAGNER.Pass.prototype );

// WAGNER.DirectionalBlurPass.prototype.run = function( c ) {

// 	this.shader.uniforms.tBias.value = this.params.tBias;
// 	this.shader.uniforms.delta.value = this.params.delta;

// 	c.pass( this.shader );

// }