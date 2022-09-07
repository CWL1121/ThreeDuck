<template>
    <div id="info">
            <a href="https://threejs.org" target="_blank" rel="noopener">three.js</a> - orbit controls
    </div>
</template>

<script setup>
    import { onMounted } from '@vue/runtime-core';
    import * as THREE from 'three';
    import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
    import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

    let camera, controls, scene, renderer;

    onMounted(()=>{
        init();
        animate();
    })

    function Element( id, x, y, z, ry ) {

        const div = document.createElement( 'div' );
        div.style.width = '480px';
        div.style.height = '360px';
        div.style.backgroundColor = '#000';

        const iframe = document.createElement( 'iframe' );
        iframe.style.width = '480px';
        iframe.style.height = '360px';
        iframe.style.border = '0px';
        iframe.src = [ 'https://www.youtube.com/embed/', id, '?rel=0' ].join( '' );
        div.appendChild( iframe );

        const object = new CSS3DObject( div );
        object.position.set( x, y, z );
        object.rotation.y = ry;

        return object;

    }

    init();
    animate();

    function init() {

        camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 5000 );
        camera.position.set( 500, 350, 750 );

        scene = new THREE.Scene();

        renderer = new THREE.WebGLRenderer( { antialias: true } );
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );

        const group = new THREE.Group();
        group.add( new Element( 'SJOz3qjfQXU', 0, 0, 240, 0 ) );
        group.add( new Element( 'Y2-xZ-1HE-Q', 240, 0, 0, Math.PI / 2 ) );
        group.add( new Element( 'IrydklNpcFI', 0, 0, - 240, Math.PI ) );
        group.add( new Element( '9ubytEsCaS0', - 240, 0, 0, - Math.PI / 2 ) );
        scene.add( group );

        window.addEventListener( 'resize', onWindowResize );

    }

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );

    }

    function animate() {

        requestAnimationFrame( animate );
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