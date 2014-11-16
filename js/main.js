(function(){



var scene, camera, renderer, controls;

var plane_material, composer;

var options =
{
    valley_elevation : .5,
    noise_elevation  : .5,
    speed            : 0.4
}

var uniforms = {
    time :
    {
        type  : 'f',
        value : 0.0
    },
    speed :
    {
        type  : 'f',
        value : options.speed
    },
    valley_elevation :
    {
        type  : 'f',
        value : options.valley_elevation
    },
    noise_elevation :
    {
        type  : 'f',
        value : options.noise_elevation
    },
    offset :
    {
        type  : 'f',
        value : options.valley_elevation
    }
};

var clock;

WAGNER.vertexShadersPath = "/shaders/vertex-shaders";
WAGNER.fragmentShadersPath = "/shaders/fragment-shaders";
WAGNER.assetsPath = "/shaders/assets/";

var dirtPass, 
    barrelBlurPass,
    invertPass,
    boxBlurPass,
    fullBoxBlurPass,
    zoomBlurPass,
    multiPassBloomPass,
    denoisePass,
    sepiaPass,
    noisePass,
    vignettePass,
    vignette2Pass,
    CGAPass,
    edgeDetectionPass,
    dirtPass,
    blendPass,
    guidedFullBoxBlurPass,
    SSAOPass;

buildScene();
initPass();
update();

function initPass(){
    composer = new WAGNER.Composer( renderer, { useRGBA: false } );
    composer.setSize( window.innerWidth, window.innerHeight );

    // invertPass = new WAGNER.InvertPass();
     // boxBlurPass = new WAGNER.BoxBlurPass();
    // fullBoxBlurPass = new WAGNER.FullBoxBlurPass();
    // zoomBlurPass = new WAGNER.ZoomBlurPass();
     multiPassBloomPass = new WAGNER.MultiPassBloomPass();
    // denoisePass = new WAGNER.DenoisePass();
    // sepiaPass = new WAGNER.SepiaPass();
    // noisePass = new WAGNER.NoisePass();
    vignettePass = new WAGNER.VignettePass();
    // vignette2Pass = new WAGNER.Vignette2Pass();
    // CGAPass = new WAGNER.CGAPass();
    // edgeDetectionPass = new WAGNER.EdgeDetectionPass();
    dirtPass = new WAGNER.DirtPass();
    blendPass = new WAGNER.BlendPass();
    // guidedFullBoxBlurPass = new WAGNER.GuidedFullBoxBlurPass();
    // SSAOPass = new WAGNER.SSAOPass();
}

function renderPass() {
    composer.reset();
    composer.render( scene, camera );
    
    composer.pass( multiPassBloomPass );
    composer.pass( blendPass );
    composer.pass( dirtPass ) ;
    composer.pass( vignettePass );

    composer.toScreen();
}

function buildScene() {
    scene = new THREE.Scene();
    //camera = new THREE.OrthographicCamera(window.innerWidth * -0.5, window.innerWidth * 0.5, window.innerHeight * 0.5, window.innerHeight * -0.5, .1, 10000);
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 10000 );
    camera.position.z = 7;
    camera.lookAt(0);
    scene.add( camera );

    clock = new THREE.Clock( false );

    plane_geometry = new THREE.PlaneGeometry(10,10,200,200);
    plane_material = new THREE.ShaderMaterial({
        vertexShader       : document.getElementById("shader-vertex-terrain").textContent,
        fragmentShader     : document.getElementById("shader-fragment-terrain").textContent,
        wireframe          : false,
        wireframeLinewidth : 1,
        transparent        : true,
        uniforms           : uniforms
    });

    plane_mesh = new THREE.Mesh(plane_geometry,plane_material);
    plane_mesh.rotation.x = - Math.PI / 2;
    plane_mesh.position.y = -0.5;
    scene.add(plane_mesh);

    renderer = new THREE.WebGLRenderer({antialias: false, alpha: false});
    renderer.inputGamma = true;
    renderer.outputGamma = true;
    renderer.autoClear = false;
    document.getElementById('containerCanvas').insertBefore(renderer.domElement, document.getElementById('containerCanvas').childNodes[0]);
    renderer.setSize( window.innerWidth, window.innerHeight);

    clock.start();

    addControls();
};

function addControls()
{
    controls = new THREE.OrbitControls( camera );
    controls.enabled = false;
    controls.addEventListener( 'change', render );
    window.addEventListener("resize", onWindowResize);

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    stats.domElement.style.display = 'none';
    document.body.appendChild(stats.domElement);
}

function update() {
    
    requestAnimationFrame(update);
    controls.update();

    plane_material.uniforms['time'].value = clock.getElapsedTime();
    render()
};

function render() {
    //renderer.render( scene, camera );
    renderPass();
    stats.update();
}

//EVENTS
function onWindowResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.left = -window.innerWidth * 0.5;
    camera.right = window.innerWidth * 0.5;
    camera.top = window.innerHeight * 0.5;
    camera.bottom = -window.innerHeight * 0.5;
    camera.updateProjectionMatrix();
};

console.log('asdasd');

$('.labs').click(function(e){
    e.preventDefault();
    target = $('section[id="labs"]')

    $('html, body').animate({
        scrollTop: target.offset().top
    }, 700);
})    

})();