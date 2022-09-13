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