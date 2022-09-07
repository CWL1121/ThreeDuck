<template>
    <div id="info">
            <a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - orbit controls
    </div>
</template>

<script setup>
    import { onMounted } from '@vue/runtime-core';
    import * as THREE from 'three';
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
    import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
    import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

    let camera, controls, scene, renderer;

    onMounted(()=>{
        init();
        animate();
    })

    function init() {

        //  <iframe width="350" height="430" allow="microphone;" src="https://console.dialogflow.com/api-client/demo/embedded/c1603611-8396-42d4-8809-bb9ed3178372"></iframe>
        const div = document.createElement( 'div' );
        div.style.width = '350px';
        div.style.height = '480px';
        div.style.backgroundColor = '#000';

        const iframe = document.createElement( 'iframe' );
        iframe.style.width = '350px';
        iframe.style.height = '480px';
        iframe.style.border = '0px';
        iframe.src = [ 'https://console.dialogflow.com/api-client/demo/embedded/c1603611-8396-42d4-8809-bb9ed3178372' ].join( '' );
        div.appendChild( iframe );

        const object = new CSS3DObject( div );

        scene = new THREE.Scene();
        scene.background = new THREE.Color( 0xcccccc );
        scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );

        console.log(renderer.domElement)
        camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
        camera.position.set( 400, 200, 0 );

        // controls

        controls = new OrbitControls( camera, renderer.domElement );
        controls.listenToKeyEvents( window ); // optional

        controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

        controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        controls.dampingFactor = 0.05;

        controls.screenSpacePanning = false;

        controls.minDistance = 100;
        controls.maxDistance = 500;

        controls.maxPolarAngle = Math.PI / 2;
        // console.log(controls)

        // world

        const geometry = new THREE.CylinderGeometry( 0, 10, 30, 4, 1 );
        const material = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } );

        for ( let i = 0; i < 500; i ++ ) {

            const mesh = new THREE.Mesh( geometry, material );
            mesh.position.x = Math.random() * 1600 - 800;
            mesh.position.y = 0;
            mesh.position.z = Math.random() * 1600 - 800;
            mesh.updateMatrix();
            mesh.matrixAutoUpdate = false;
            scene.add( mesh );

        }

        // lights

        const dirLight1 = new THREE.DirectionalLight( 0xffffff );
        dirLight1.position.set( 1, 1, 1 );
        scene.add( dirLight1 );

        const dirLight2 = new THREE.DirectionalLight( 0x002288 );
        dirLight2.position.set( - 1, - 1, - 1 );
        scene.add( dirLight2 );

        const ambientLight = new THREE.AmbientLight( 0x222222 );
        scene.add( ambientLight );

        //

        console.log(scene)
        scene.add(object)

        window.addEventListener( 'resize', onWindowResize );

    }

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize( window.innerWidth, window.innerHeight );

    }

    function animate() {

        requestAnimationFrame( animate );

        controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

        render();

    }

    function render() {

        renderer.render( scene, camera );

    }

</script>

<style scoped>
    body {
        background-color: #ccc;
        color: #000;
    }

    a {
        color: #f00;
    }
</style>