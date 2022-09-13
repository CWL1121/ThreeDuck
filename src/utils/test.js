import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as CANNON from '../../node_modules/cannon-es/dist/cannon-es.js'
import { PointerLockControlsCannon } from './libs/PointerLockControlsCannon.js'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import Stats from 'https://unpkg.com/three@0.122.0/examples/jsm/libs/stats.module.js'
import { threeToCannon, ShapeType } from 'three-to-cannon';
import { Vec3 } from 'cannon-es';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { WireframeGeometry } from 'three';
import {io} from 'socket.io-client'

export default class Three{
    constructor(){
        this.init()
    }

    init(){
        this.playerInfo = [];
        this.socket = io('http://localhost:3000');
        console.log(this.socket.id)
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( this.renderer.domElement );

        this.controls = new OrbitControls( this.camera, this.renderer.domElement );
        this.camera.position.set( 0, 20, 40 );
        this.controls.update();

        this.light = new THREE.AmbientLight( 0x404040 , 3); // soft white light
        this.scene.add( this.light );
        
        this.DirectionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
        this.DirectionalLight.position.set(0 , 100, 0)
        this.scene.add( this.DirectionalLight );


        this.loadModels();
            
        let url = "https://cwl1121.github.io/ThreeDuck/src/assets/"
        this.scene.background = new THREE.CubeTextureLoader()
        .setPath( url )
        .load( [ 'px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg' ] );

        this.createBoxes();
        this.updatePlace()
        this.animate();
    
    }

    loadModels(){
        let url = "https://cwl1121.github.io/ThreeDuck/src/model/"   
        this.modelLoader(url+'fish/',{x:1,y:1,z:1},{x: 1.9,y:11,z:-3.2},{},true);
    }
    
    modelLoader(path,size,position,rotate,add){
        this.loader = new GLTFLoader().setPath(path);
        this.loader.load('scene.glb',
        (gltf)=>{
            gltf.scene.scale.set(size.x,size.y,size.z);
            gltf.scene.position.set(position.x,position.y,position.z);
            this.scene.add(gltf.scene);
        },(xhr)=>{
        },(error)=>{
            console.log(error)
        })

        this.geometry = new THREE.PlaneGeometry( 1, 1 );
        this.material = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
        this.plane = new THREE.Mesh( this.geometry, this.material );
        this.scene.add( this.plane );
    }

    createBoxes() {
        // Add boxes
        const halfExtents = new CANNON.Vec3(50, 0.1, 50)
        const boxGeometry = new THREE.BoxBufferGeometry(
          halfExtents.x * 2,
          halfExtents.y * 2,
          halfExtents.z * 2
        )

        this.MeshBasicMaterial = new THREE.MeshBasicMaterial( { 
            color: 0x0044BB, 
            transparent: true, 
            opacity:0.3
        } );
        
        this.boxMesh = new THREE.Mesh(boxGeometry, this.MeshBasicMaterial)
        this.scene.add(this.boxMesh)
        this.boxMesh.position.set(0 ,0 ,0)
        this.boxMesh.castShadow = true
        this.boxMesh.receiveShadow = true

    }

    addSquareBox(info){
        try {
            this.check(info)
            this.geometry = new THREE.BoxGeometry( 10, 10, 10 );
            this.material = new THREE.MeshBasicMaterial( {color:0x0044BB} );
            this.cube = new THREE.Mesh( this.geometry, this.material );
            this.cube.position.x = info.pos.position.x;
            this.cube.position.y = info.pos.position.y;
            this.cube.position.z = info.pos.position.z;
            this.cube.name = info.id
            this.scene.add( this.cube );
        } catch (error) {
            
        }

    }

    animate() {
        this.socket.emit('move',{
            position:this.controls.object.position
        })
        this.renderer.setAnimationLoop( this.animate.bind((this)) );
        this.renderer.render( this.scene, this.camera );
        this.controls.update();
        // this.check()
        this.playerInfo.forEach(box=>{
            this.addSquareBox(box)
        })
        // console.log(this.scene.children)
    }
    updatePlace(){
        this.socket.on('replace',(info)=>{
            this.playerInfo = info.players;
        })
    }
    check(info){
        let ans = true
        this.scene.children.forEach(child=>{
            if (child.name) {
                if(child.name == info.id){
                    this.ans = false;
                    this.updatePosition(child.name,info.pos.position)
                    throw {}
                }else{
                    this.ans = true
                }
            }
        })
        return ans;
    }
    updatePosition(info,pos){
        this.scene.children.forEach(child=>{
            if (child.name) {
                if(child.name == info){
                    child.position.x = pos.x;
                    child.position.y = pos.y;
                    child.position.z = pos.z;
                }
            }
        })
    }
}