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