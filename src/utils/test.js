import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as CANNON from '../../node_modules/cannon-es/dist/cannon-es.js'
import { PointerLockControlsCannon } from './libs/PointerLockControlsCannon.js'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import Stats from 'https://unpkg.com/three@0.122.0/examples/jsm/libs/stats.module.js'
import { threeToCannon, ShapeType } from 'three-to-cannon';
import { Vec3 } from 'cannon-es'

export default class Three{
    constructor(){
        this.init()
    }
    init(){

      this.timeStep = 1 / 60
      this.lastCallTime = performance.now()
      this.balls = []
      this.ballMeshes = []
      this.boxes = []
      this.boxMeshes = []

      this.instructions = document.getElementById('instructions');
      this.blocker = document.getElementById('blocker');
      this.crossHair = document.getElementById('cross');
      this.crossHair.style.display = 'none'
      

      this.initThree()
      this.loadModels()
      this.initCannon()
      this.initPointerLock()
      this.addWall()
      this.animate()
      this.setVRContorl()
    }

    initThree() {
        // Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        this.camera.position.set(0,0,0)
        // Scene
        this.scene = new THREE.Scene()

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true })
        this.renderer.setSize(window.innerWidth, window.innerHeight)

        document.body.appendChild(this.renderer.domElement)

        // Stats.js
        this.stats = new Stats()
        document.body.appendChild(this.stats.dom)

        // Lights
        let light = new THREE.AmbientLight(  0xffffff , 1 ); 
        this.scene.add( light );

        light = new THREE.DirectionalLight(0xffffff, 1);
        light.castShadow = true

        light.position.set(0,800,0)
        this.scene.add(light);

        // Generic material
        this.material = new THREE.MeshLambertMaterial({transparent:true,opacity :0})

        // Floor
        const floorGeometry = new THREE.PlaneBufferGeometry(100, 100, 1, 1)
        floorGeometry.rotateX(-Math.PI / 2)
        const floor = new THREE.Mesh(floorGeometry, this.material)
        floor.receiveShadow = true
        floor.name = "floor"
        this.scene.add(floor)

        window.addEventListener('resize', this.onWindowResize(this))
    }

    onWindowResize(three) {
        three.camera.aspect = window.innerWidth / window.innerHeight
        three.camera.updateProjectionMatrix()
        three.renderer.setSize(window.innerWidth, window.innerHeight)
    }

    initCannon() {
        this.world = new CANNON.World()

        // Tweak contact properties.
        // Contact stiffness - use to make softer/harder contacts
        this.world.defaultContactMaterial.contactEquationStiffness = 1e9

        // Stabilization time in number of timesteps
        this.world.defaultContactMaterial.contactEquationRelaxation = 4

        const solver = new CANNON.GSSolver()
        solver.iterations = 7
        solver.tolerance = 0.1
        this.world.solver = new CANNON.SplitSolver(solver)

        this.world.gravity.set(0,-50, 0)

        // Create a slippery material (friction coefficient = 0.0)
        this.physicsMaterial = new CANNON.Material('physics')
        const physics_physics = new CANNON.ContactMaterial(this.physicsMaterial, this.physicsMaterial, {
            friction: 100,
            restitution: 0,
        })

        // We must add the contact materials to the world
        this.world.addContactMaterial(physics_physics)

        // Create the user collision sphere
        this.sphereShape = new CANNON.Sphere(1.5)
        this.sphereBody = new CANNON.Body({ mass: 5, material: this.physicsMaterial })
        this.sphereBody.addShape(this.sphereShape)
        this.sphereBody.position.set(0, 2, 0)
        this.sphereBody.linearDamping = 0.9
        this.world.addBody(this.sphereBody)

        // Create the ground plane
        const groundShape = new CANNON.Plane()
        const groundBody = new CANNON.Body({ mass: 0, material: this.physicsMaterial })
        groundBody.addShape(groundShape)
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
        console.log(groundBody.position)
        this.world.addBody(groundBody)

        const roof = new CANNON.Plane()
        const roofBody = new CANNON.Body({ mass: 0, material: this.physicsMaterial })
        roofBody.addShape(roof)
        roofBody.position.set(0, 0, 10)
        // roofBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
        console.log(roofBody.position)
        // this.world.addBody(roofBody)


        // Returns a vector pointing the the diretion the camera is at
        function getShootDirection() {
            const vector = new THREE.Vector3(0, 0, 1)
            vector.unproject(camera)
            const ray = new THREE.Ray(sphereBody.position, vector.sub(sphereBody.position).normalize())
            return ray.direction
        }
    }

    initPointerLock() {
        this.controls = new PointerLockControlsCannon(this.camera, this.sphereBody )
        this.scene.add(this.controls.getObject())

        this.instructions.addEventListener('click', () => {
            this.controls.lock()
        })

        this.controls.addEventListener('lock', () => {
            this.controls.enabled = true
            this.instructions.style.display = 'none'
            this.blocker.style.display = 'none'
            this.crossHair.style.display = null
        })

        this.controls.addEventListener('unlock', () => {
            this.controls.enabled = false
            this.instructions.style.display = null
            this.blocker.style.display = null
            this.crossHair.style.display = 'none'
        })
    }

    loadModels(){
        this.modelmesh = []
        this.modelbody = []
        let url = './src/model/'   
        this.modelLoader(url+'women/',{x:1,y:1,z:1},{x: 1.9,y:0,z:-3.2},{},true);
        this.testLoader(url+'store/',{x:1,y:1,z:1},{x:0,y:0,z:0},{},true);
        // this.testLoader(url+'classroom/',{x:1,y:1,z:1},{x:0,y:0,z:0},{},true);
        // this.testLoader(url+'lobby/',{x:1,y:1,z:1},{x:0,y:-2.7,z:0},{},true);
        // this.testLoader(url+'castal/',{x:20,y:20,z:20},{x:0,y:0,z:0},{},true)
    }

    setVRContorl(){
        console.log("vr")
        this.blocker.appendChild( VRButton.createButton( this.renderer ) );
        this.renderer.xr.enabled = true;
        this.renderer.xr.addEventListener(
            'sessionstart',
            function() {
                this.controls.lock()
                this.camera.position.y = -50 ;
            },
            false
        )
    }

    modelLoader(path,size,position,rotate,add){
        this.loader = new GLTFLoader().setPath(path);
        this.loader.load('scene.glb',
        (gltf)=>{
            gltf.scene.scale.set(size.x,size.y,size.z);
            gltf.scene.position.set(position.x,position.y,position.z);
            this.scene.add(gltf.scene);
            if(add){
                let result = threeToCannon(gltf.scene,{type: ShapeType.BOX});
                let obj = new CANNON.Body();
                obj.position = (gltf.scene.position)
                obj.addShape(result.shape,result.offset,result.orientation)
                // console.log(obj)
                this.world.addBody(obj)
            }
        },(xhr)=>{
        },(error)=>{
            console.log(error)
        })
    }
    testLoader(path,size,position,rotate,add){
        this.loader = new GLTFLoader().setPath(path);
        this.loader.load('scene.glb',
        (gltf)=>{
            gltf.scene.scale.set(size.x,size.y,size.z);
            gltf.scene.position.set(position.x,position.y,position.z);
            this.scene.add(gltf.scene);
            if(add){
                gltf.scene.children.forEach(element => {
                    // if (element.name == 'woodBase' || element.name == 'wall' || element.name == 'wall010'|| element.name == 'windows' || element.name =='beams' || element.name =='woodBase') {
                    //     console.log(element)
                    //     let result = threeToCannon(element,{type: ShapeType.MESH});
                    //     let obj = new CANNON.Body();
                    //     obj.position = (element.position)
                    //     obj.addShape(result.shape,result.offset,result.orientation)
                    //     console.log(obj)
                    //     obj.name = element.name
                    //     this.world.addBody(obj)
                    //     console.log(this.world)
                    //     console.log("in:"+element.name)
                    // }else{
                    //     console.log("out:"+element.name)
                    // }
                    element.children.forEach(element => {
                        element.children.forEach(element => {
                            if (element.name == 'Object_5' || element.name == 'Object_13' || element.name == 'chao_wei_01' || element.name == 'woodBase') {
                                let result = threeToCannon(element,{type: ShapeType.BOX});
                                let obj = new CANNON.Body();
                                obj.position = (element.position)
                                obj.addShape(result.shape,result.offset,result.orientation)
                                console.log(obj)
                                obj.name = element.name
                                this.world.addBody(obj)
                                console.log(this.world)
                                console.log("in:"+element.name)
                            }else{
                                console.log("out:"+element.name)
                            }
                        });
                    });
                });
            }
        },(xhr)=>{
        },(error)=>{
            console.log(error)
        })
    }
    addWall(){
        let three = this
        function add1(){
            const halfExtents = new Vec3(3.5,3,.1)
            const xy = new Vec3(8.8,1.4,11)
            const boxShape = new CANNON.Box(halfExtents)
            const boxBody = new CANNON.Body({ mass: 0 })
            boxBody.addShape(boxShape)
            boxBody.position = xy
            three.world.addBody(boxBody)
    
            const boxGeometry = new THREE.BoxGeometry(
                halfExtents.x * 2,
                halfExtents.y * 2,
                halfExtents.z * 2
            )
            const boxMaterial = new THREE.MeshLambertMaterial({
                color: Math.random() * 0xffffff
              })
            const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial)
            boxMesh.position.set(xy.x,xy.y,xy.z)
            three.scene.add(boxMesh)
        }
        function add2(){
            const halfExtents = new Vec3(.1,3,10)
            const xy = new Vec3(12.8,1.5,0)
            const boxShape = new CANNON.Box(halfExtents)
            const boxBody = new CANNON.Body({ mass: 0 })
            boxBody.addShape(boxShape)
            boxBody.position = xy
            three.world.addBody(boxBody)
    
            const boxGeometry = new THREE.BoxGeometry(
                halfExtents.x * 2,
                halfExtents.y * 2,
                halfExtents.z * 2
            )
            const boxMaterial = new THREE.MeshLambertMaterial({
                color: Math.random() * 0xffffff
              })
            const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial)
            boxMesh.position.set(xy.x,xy.y,xy.z)
            three.scene.add(boxMesh)
        }
        function add3(){
            const halfExtents = new Vec3(.1,3,6)
            const xy = new Vec3(5.2,1.4,7)
            const boxShape = new CANNON.Box(halfExtents)
            const boxBody = new CANNON.Body({ mass: 0 })
            boxBody.addShape(boxShape)
            boxBody.position = xy
            three.world.addBody(boxBody)
    
            const boxGeometry = new THREE.BoxGeometry(
                halfExtents.x * 2,
                halfExtents.y * 2,
                halfExtents.z * 2
            )
            const boxMaterial = new THREE.MeshLambertMaterial({
                color: Math.random() * 0xffffff
              })
            const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial)
            boxMesh.position.set(xy.x,xy.y,xy.z)
            three.scene.add(boxMesh)
        }
        function add4(){
            const halfExtents = new Vec3(3.5,3,.1)
            const xy = new Vec3(1,1.4,3)
            const boxShape = new CANNON.Box(halfExtents)
            const boxBody = new CANNON.Body({ mass: 0 })
            boxBody.addShape(boxShape)
            boxBody.position = xy
            three.world.addBody(boxBody)
    
            const boxGeometry = new THREE.BoxGeometry(
                halfExtents.x * 2,
                halfExtents.y * 2,
                halfExtents.z * 2
            )
            const boxMaterial = new THREE.MeshLambertMaterial({
                color: Math.random() * 0xffffff
              })
            const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial)
            boxMesh.position.set(xy.x,xy.y,xy.z)
            three.scene.add(boxMesh)
        }
        function add5(){
            const halfExtents = new Vec3(.1,3,1.4)
            const xy = new Vec3(5.2,1.4,-4)
            const boxShape = new CANNON.Box(halfExtents)
            const boxBody = new CANNON.Body({ mass: 0 })
            boxBody.addShape(boxShape)
            boxBody.position = xy
            three.world.addBody(boxBody)
    
            const boxGeometry = new THREE.BoxGeometry(
                halfExtents.x * 2,
                halfExtents.y * 2,
                halfExtents.z * 2
            )
            const boxMaterial = new THREE.MeshLambertMaterial({
                color: Math.random() * 0xffffff
              })
            const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial)
            boxMesh.position.set(xy.x,xy.y,xy.z)
            three.scene.add(boxMesh)
        }
        function add6(){
            const halfExtents = new Vec3(5,3,.1)
            const xy = new Vec3(-1,1.4,-5)
            const boxShape = new CANNON.Box(halfExtents)
            const boxBody = new CANNON.Body({ mass: 0 })
            boxBody.addShape(boxShape)
            boxBody.position = xy
            three.world.addBody(boxBody)
    
            const boxGeometry = new THREE.BoxGeometry(
                halfExtents.x * 2,
                halfExtents.y * 2,
                halfExtents.z * 2
            )
            const boxMaterial = new THREE.MeshLambertMaterial({
                color: Math.random() * 0xffffff
              })
            const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial)
            boxMesh.position.set(xy.x,xy.y,xy.z)
            three.scene.add(boxMesh)
        }
        function add7(){
            const halfExtents = new Vec3(3.5,3,.1)
            const xy = new Vec3(8.8,1.4,-10)
            const boxShape = new CANNON.Box(halfExtents)
            const boxBody = new CANNON.Body({ mass: 0 })
            boxBody.addShape(boxShape)
            boxBody.position = xy
            three.world.addBody(boxBody)
    
            const boxGeometry = new THREE.BoxGeometry(
                halfExtents.x * 2,
                halfExtents.y * 2,
                halfExtents.z * 2
            )
            const boxMaterial = new THREE.MeshLambertMaterial({
                color: Math.random() * 0xffffff
              })
            const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial)
            boxMesh.position.set(xy.x,xy.y,xy.z)
            three.scene.add(boxMesh)
        }
        function add8(){
            const halfExtents = new Vec3(.1,3,6)
            const xy = new Vec3(-7.2,1.4,-2)
            const boxShape = new CANNON.Box(halfExtents)
            const boxBody = new CANNON.Body({ mass: 0 })
            boxBody.addShape(boxShape)
            boxBody.position = xy
            three.world.addBody(boxBody)
    
            const boxGeometry = new THREE.BoxGeometry(
                halfExtents.x * 2,
                halfExtents.y * 2,
                halfExtents.z * 2
            )
            const boxMaterial = new THREE.MeshLambertMaterial({
                color: Math.random() * 0xffffff
              })
            const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial)
            boxMesh.position.set(xy.x,xy.y,xy.z)
            three.scene.add(boxMesh)
        }
        function add9(){
            const halfExtents = new Vec3(.1,3,10)
            const xy = new Vec3(12.8,1.5,0)
            const boxShape = new CANNON.Box(halfExtents)
            const boxBody = new CANNON.Body({ mass: 0 })
            boxBody.addShape(boxShape)
            boxBody.position = xy
            three.world.addBody(boxBody)
    
            const boxGeometry = new THREE.BoxGeometry(
                halfExtents.x * 2,
                halfExtents.y * 2,
                halfExtents.z * 2
            )
            const boxMaterial = new THREE.MeshLambertMaterial({
                color: Math.random() * 0xffffff
              })
            const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial)
            boxMesh.position.set(xy.x,xy.y,xy.z)
            three.scene.add(boxMesh)
        }
        function add10(){
            const halfExtents = new Vec3(.1,3,3)
            const xy = new Vec3(4,1.5,-10)
            const boxShape = new CANNON.Box(halfExtents)
            const boxBody = new CANNON.Body({ mass: 0 })
            boxBody.addShape(boxShape)
            boxBody.position = xy
            three.world.addBody(boxBody)
    
            const boxGeometry = new THREE.BoxGeometry(
                halfExtents.x * 2,
                halfExtents.y * 2,
                halfExtents.z * 2
            )
            const boxMaterial = new THREE.MeshLambertMaterial({
                color: Math.random() * 0xffffff
              })
            const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial)
            boxMesh.position.set(xy.x,xy.y,xy.z)
            three.scene.add(boxMesh)
        }
        function add11(){
            const halfExtents = new Vec3(10,.01,10)
            const xy = new Vec3(0,4,0)
            const boxShape = new CANNON.Box(halfExtents)
            const boxBody = new CANNON.Body({ mass: 0 })
            boxBody.addShape(boxShape)
            boxBody.position = xy
            three.world.addBody(boxBody)
    
            const boxGeometry = new THREE.BoxGeometry(
                halfExtents.x * 2,
                halfExtents.y * 2,
                halfExtents.z * 2
            )
            const boxMaterial = new THREE.MeshLambertMaterial({
                color: Math.random() * 0xffffff
              })
            const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial)
            boxMesh.position.set(xy.x,xy.y,xy.z)
            three.scene.add(boxMesh)
        }
        function add12(){
            const halfExtents = new Vec3(3.5,3,.1)
            const xy = new Vec3(-3,1.4,4)
            const boxShape = new CANNON.Box(halfExtents)
            const boxBody = new CANNON.Body({ mass: 0 })
            boxBody.addShape(boxShape)
            boxBody.position = xy
            three.world.addBody(boxBody)
    
            const boxGeometry = new THREE.BoxGeometry(
                halfExtents.x * 2,
                halfExtents.y * 2,
                halfExtents.z * 2
            )
            const boxMaterial = new THREE.MeshLambertMaterial({
                color: Math.random() * 0xffffff
              })
            const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial)
            boxMesh.position.set(xy.x,xy.y,xy.z)
            three.scene.add(boxMesh)
        }
        add1();
        add2();
        add3();
        add4();
        add5();
        add6();
        add7();
        add8();
        add9();
        add10();
        add11();
        add12();
    }
    animate() {
        // console.log(this.scene)
        this.renderer.setAnimationLoop( this.animate.bind((this)) );
        console.log(this.controls.getObject().position)
        const time = performance.now() / 1000
        const dt = time - this.lastCallTime
        this.lastCallTime = time

        if (this.controls.enabled) {
            this.world.step(this.timeStep, dt)
        }

        this.controls.update(dt)
        this.renderer.render(this.scene, this.camera)
        this.stats.update()
    }
}