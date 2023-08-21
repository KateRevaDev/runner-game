import * as THREE from "https://cdn.skypack.dev/three@0.132.2";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Global variables
let scene,
    camera,
    renderer,
    controls,
    moveMouse,
    raycaster,
    draggableObject,
    human,
    loader,
    mixer;
const clock = new THREE.Clock();

// Create Scene and lights
function init() {
    // SCENE
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfd1e5);

    // CAMERA
    camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        5000
    );
    camera.position.set(0, 80, 200);

    // RENDERER
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // CAMERA MOVEMENT CONTROLS
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 65, 0);
    // controls.enableDamping = true;
    controls.update();

    // LIGHTS
    let ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(-30, 50, 150);
    scene.add(ambientLight);
    scene.add(directionalLight);

    // RAYCASTING (mouse functionality)
    raycaster = new THREE.Raycaster();
    moveMouse = new THREE.Vector2();

    // LOADER
    loader = new GLTFLoader();

    // FLOOR
    let floor;
    // let floor = new THREE.Mesh(
    //     new THREE.BoxBufferGeometry(2000, 3, 2000),
    //     new THREE.MeshPhongMaterial({ color: 0x1b8f06 })
    // );
    // floor.isDraggable = false;
    // scene.add(floor);
    loader.load('./models/TrackFloor.glb', function (gltf) {

        gltf.scene.scale.x = 40;
        gltf.scene.scale.y = 20;
        gltf.scene.scale.z = 100;
        gltf.scene.userData.isDraggable = false;

        floor = scene.add(gltf.scene);

    }, null, function (error) {

        console.error(error);

    });
}

function addHuman() {
    // loading human
    loader.load('./models/Stickman.glb', function (gltf) {

        gltf.scene.scale.x = 20;
        gltf.scene.scale.y = 20;
        gltf.scene.scale.z = 10;
        gltf.scene.rotation.y = Math.PI;
        gltf.scene.isDraggable = true;

        console.log('gltf.scene ', gltf.scene);

        draggableObject = gltf.scene;

        human = scene.add(gltf.scene);

        mixer = new THREE.AnimationMixer(human);

        const runAnim = THREE.AnimationClip.findByName(gltf.animations, 'Run');
        mixer.clipAction(runAnim).play();

        //
    }, null, function (error) {

        console.error(error);

    });
}
/**
 * Checks if the user is 'holding' an object.
 * If true, function updates object's location based on mouse postion
 * If false, function does nothing
 */
function dragObject() {
    // If 'holding' an object, move the object
    if (draggableObject) {
        raycaster.setFromCamera(moveMouse, camera);
        // `found` is the metadata of the objects, not the objetcs themsevles
        const found = raycaster.intersectObjects(scene.children, true);
        if (found.length) {
            for (let obj3d of found) {
                if (!obj3d.object.isDraggable) {
                    draggableObject.position.x = obj3d.point.x;
                    // draggableObject.position.z = obj3d.point.z;
                    break;
                }
            }
        }
    }
}

// Constantly updates the mouse location for use in `dragObject()`
window.addEventListener("mousemove", (event) => {
    raycaster.setFromCamera(moveMouse, camera);
    const found = raycaster.intersectObjects(scene.children, true);
    if (found.length && found[0].object.isDraggable) {
        draggableObject = found[0].object;
    }
    dragObject(); // Updates the object's postion every time the mouse moves
    moveMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    moveMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Recursive function to render the scene
function animate() {
    controls.update();
    if (mixer) {
        mixer.update(clock.getDelta());
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

// Re-renders the scene upon window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Start the program
(function () {
    window.addEventListener("resize", onWindowResize, false);
    init();
    // Adding multiple objects
    // addObject(8, { x: 0, y: 6, z: 0 }, "#FF0000");
    addHuman();
    //   addObject(8, { x: 15, y: 6, z: 15 }, "#313DF8");
    //   addObject(8, { x: -15, y: 6, z: -15 }, "#000000");
    //   addObject(8, { x: -15, y: 6, z: 15 }, "#EF0A61");
    //   addObject(8, { x: 15, y: 6, z: -15 }, "#CAB21D");
    animate();
})();
