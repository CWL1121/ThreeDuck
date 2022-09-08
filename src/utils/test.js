import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as CANNON from '../../node_modules/cannon-es/dist/cannon-es.js'
import { PointerLockControlsCannon } from './libs/PointerLockControlsCannon.js'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import Stats from 'https://unpkg.com/three@0.122.0/examples/jsm/libs/stats.module.js'
import { threeToCannon, ShapeType } from 'three-to-cannon';
import { Vec3 } from 'cannon-es';

export default class Three{
    constructor(){
        this.init()
    }

    init(){
        this.isNpc = false ;
        this.timeStep = 1 / 60
        this.lastCallTime = performance.now()

        this.app = document.getElementById('app');
        this.dialoge = document.getElementById('dialoge');
        this.instructions = document.getElementById('instructions');
        this.blocker = document.getElementById('blocker');
        this.crossHair = document.getElementById('cross');
        this.canvas = document.getElementsByTagName('canvas');
        this.exitBut = document.getElementById('button');
        this.progressContainer = document.getElementById('container');
        this.progress = document.getElementById('progress');
        this.label = document.getElementById('label');

        this.crossHair.style.display = 'none' ; 
        this.dialoge.style.display = 'none' ;

        this.initThree()
        this.Manger()
        this.loadModels()
        this.initCannon()
        this.initPointerLock()
        this.addWall()
        this.setVRContorl()
        this.animate()
    }

    initThree() {
        // Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        this.camera.position.set(0,0,0)

        // Scene
        this.scene = new THREE.Scene()

        let url = 'https://tony0831-l.github.io/cannon-vr/src/assets/'
        // let url = './src/assets/'
        this.scene.background = new THREE.CubeTextureLoader()
        .setPath( url )
        .load( [ 'px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg' ] );

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true })
        // this.renderer = new CSS3DRenderer({ antialias: true })
        this.renderer.setSize(window.innerWidth, window.innerHeight)

        document.body.appendChild(this.renderer.domElement)


        // Stats.js
        this.stats = new Stats()
        document.body.appendChild(this.stats.dom)

        let light = new THREE.AmbientLight(  0xE0FFFF , 1 ); 
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
        this.ray = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, 0 , -1 ), 0, 10 );
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
    }

    initPointerLock() {
        this.controls = new PointerLockControlsCannon(this.camera, this.sphereBody )
        this.scene.add(this.controls.getObject())
        this.position = this.controls.getObject().position

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
            if (!this.isNpc) {
                this.controls.enabled = false
                this.instructions.style.display = null
                this.blocker.style.display = null
            }
            this.crossHair.style.display = 'none'
        })
    }

    loadModels(){
        this.npc = [];
        // let url = './src/model/'   
        let url = 'https://tony0831-l.github.io/cannon-vr/src/model/'
        this.modelLoader(url+'women/',{x:1,y:1,z:1},{x: 1.9,y:0,z:-3.2},{},true);
        this.modelLoader(url+'store/',{x:1,y:1,z:1},{x:0,y:0,z:0},{},false);
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

    Manger(){
        this.loadingManger = new THREE.LoadingManager()
        this.loadingManger.onStart = ()=>{
            this.instructions.style.display = 'none'
        }
        this.loadingManger.onProgress = ( url, itemsLoaded, itemsTotal )=> {
            this.progress.value = (itemsLoaded / itemsTotal * 100)
            this.label.innerText = (((itemsLoaded / itemsTotal * 100 ).toFixed(2)) + "%  loading:"+ url );
        };
        this.loadingManger.onLoad = ()=>{
            this.progressContainer.style.display = "none";
            this.instructions.style.display = null ;
        }
    }

    modelLoader(path,size,position,rotate,add){
        this.loader = new GLTFLoader(this.loadingManger).setPath(path);
        this.loader.load('scene.glb',
        (gltf)=>{
            gltf.scene.scale.set(size.x,size.y,size.z);
            gltf.scene.position.set(position.x,position.y,position.z);
            this.scene.add(gltf.scene);
            if(add){
                let result = threeToCannon(gltf.scene,{type: ShapeType.BOX});
                let obj = new CANNON.Body();
                obj.position = (gltf.scene.position);
                obj.addShape(result.shape,result.offset,result.orientation);
                this.npc.push( gltf.scene );
                this.world.addBody(obj);
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
        }
        function add2(){
            const halfExtents = new Vec3(.1,3,10)
            const xy = new Vec3(12.8,1.5,0)
            const boxShape = new CANNON.Box(halfExtents)
            const boxBody = new CANNON.Body({ mass: 0 })
            boxBody.addShape(boxShape)
            boxBody.position = xy
            three.world.addBody(boxBody)
        }
        function add3(){
            const halfExtents = new Vec3(.1,3,6)
            const xy = new Vec3(5.2,1.4,7)
            const boxShape = new CANNON.Box(halfExtents)
            const boxBody = new CANNON.Body({ mass: 0 })
            boxBody.addShape(boxShape)
            boxBody.position = xy
            three.world.addBody(boxBody)
        }
        function add4(){
            const halfExtents = new Vec3(3.5,3,.1)
            const xy = new Vec3(1,1.4,3)
            const boxShape = new CANNON.Box(halfExtents)
            const boxBody = new CANNON.Body({ mass: 0 })
            boxBody.addShape(boxShape)
            boxBody.position = xy
            three.world.addBody(boxBody)
        }
        function add5(){
            const halfExtents = new Vec3(.1,3,1.4)
            const xy = new Vec3(5.2,1.4,-4)
            const boxShape = new CANNON.Box(halfExtents)
            const boxBody = new CANNON.Body({ mass: 0 })
            boxBody.addShape(boxShape)
            boxBody.position = xy
            three.world.addBody(boxBody)
        }
        function add6(){
            const halfExtents = new Vec3(5,3,.1)
            const xy = new Vec3(-1,1.4,-5)
            const boxShape = new CANNON.Box(halfExtents)
            const boxBody = new CANNON.Body({ mass: 0 })
            boxBody.addShape(boxShape)
            boxBody.position = xy
            three.world.addBody(boxBody)
        }
        function add7(){
            const halfExtents = new Vec3(3.5,3,.1)
            const xy = new Vec3(8.8,1.4,-10)
            const boxShape = new CANNON.Box(halfExtents)
            const boxBody = new CANNON.Body({ mass: 0 })
            boxBody.addShape(boxShape)
            boxBody.position = xy
            three.world.addBody(boxBody)
        }
        function add8(){
            const halfExtents = new Vec3(.1,3,6)
            const xy = new Vec3(-7.2,1.4,-2)
            const boxShape = new CANNON.Box(halfExtents)
            const boxBody = new CANNON.Body({ mass: 0 })
            boxBody.addShape(boxShape)
            boxBody.position = xy
            three.world.addBody(boxBody)
        }
        function add9(){
            const halfExtents = new Vec3(.1,3,10)
            const xy = new Vec3(12.8,1.5,0)
            const boxShape = new CANNON.Box(halfExtents)
            const boxBody = new CANNON.Body({ mass: 0 })
            boxBody.addShape(boxShape)
            boxBody.position = xy
            three.world.addBody(boxBody)
        }
        function add10(){
            const halfExtents = new Vec3(.1,3,3)
            const xy = new Vec3(4,1.5,-10)
            const boxShape = new CANNON.Box(halfExtents)
            const boxBody = new CANNON.Body({ mass: 0 })
            boxBody.addShape(boxShape)
            boxBody.position = xy
            three.world.addBody(boxBody)
        }
        function add11(){
            const halfExtents = new Vec3(15,.001,15)
            const xy = new Vec3(0,4,0)
            const boxShape = new CANNON.Box(halfExtents)
            const boxBody = new CANNON.Body({ mass: 0 })
            boxBody.addShape(boxShape)
            boxBody.position = xy
            three.world.addBody(boxBody)
        }
        function add12(){
            const halfExtents = new Vec3(3.5,3,.1)
            const xy = new Vec3(-3,1.4,4)
            const boxShape = new CANNON.Box(halfExtents)
            const boxBody = new CANNON.Body({ mass: 0 })
            boxBody.addShape(boxShape)
            boxBody.position = xy
            three.world.addBody(boxBody)
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

    getShootDirection() {
        const vector = new THREE.Vector3(0, 0, 1)
        vector.unproject(this.camera)
        const ray = new THREE.Ray(this.sphereBody.position, vector.sub(this.sphereBody.position).normalize())
        return ray.direction
    }

    render(){
        this.renderer.render(this.scene, this.camera)
    }

    animate() {
        this.renderer.setAnimationLoop( this.animate.bind((this)) );
        let MainCanvas = this.canvas.item(0)
        if(this.controls.enabled == true){

            // console.log(this.getShootDirection())
            this.renderer.setAnimationLoop( this.animate.bind((this)) );
            // console.log(this.controls.getObject().position)

            this.ray.ray.origin.copy( this.controls.getObject().position );
            this.ray.ray.direction.copy(this.getShootDirection())
            this.intersections = this.ray.intersectObjects( this.npc , true );

            let control = this.controls ;
            let camera = this.camera ;
            let dialoge = this.dialoge ;
            let cross = this.crossHair;
            let blocker = this.blocker;
            function stop(){
                console.log("stop") ;
                camera.zoom = 10 ;
                control.disconnect() 
                control.unlock();
                dialoge.style.display = null ;
                blocker.style.display = 'none';
                cross.style.display = 'none';
                document.removeEventListener('click',stop)
            }
            function remove(){
                console.log("remove")
                document.removeEventListener('click',stop)
                control.connect() 
                control.lock();
                dialoge.style.display = 'none' ;
                cross.style.display = null;
                MainCanvas.focus()
            }

            if (this.intersections.length>0 &&this.intersections[0].distance<2 && !this.isNpc) {
                this.isAddEvent = true;
                this.isNpc = true ;
                console.log("inn")
                document.addEventListener('click',stop,false)
                this.exitBut.addEventListener('click',()=>{
                    console.log("exit");
                    remove(this.isNpc) ;
                    this.isNpc = false ;
                    this.isAddEvent = true ;
                },true)
                setTimeout(()=>{
                    document.removeEventListener('click',stop)
                    this.isNpc = false ;
                    this.isAddEvent = true ;
                },200)
            }else{

            }

            const time = performance.now() / 1000
            const dt = time - this.lastCallTime
            this.lastCallTime = time

            this.world.step(this.timeStep, dt)
            this.controls.update(dt)
        }
        this.stats.update()
        this.render()
    }

    getObj(){
        return this
    }
}