import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);

const loader = new GLTFLoader();

let human = null;
let track = null;
let fileAnimations = null;
let mixer;
const clock = new THREE.Clock();

// loading human
loader.load('./models/Stickman.glb', function (gltf) {

    console.log('gltf ', gltf);

    fileAnimations = gltf.animations;

    const sword = gltf.scene;  // sword 3D object is loaded
    sword.position.y = -2;

    human = scene.add(sword);

    human.userData.draggable = true;
    human.userData.name = 'human';

    //
    mixer = new THREE.AnimationMixer(human);

    const runAnim = THREE.AnimationClip.findByName(fileAnimations, 'Run');
    const idle = mixer.clipAction(runAnim);
    idle.play();

    //
}, null, function (error) {

    console.error(error);

});

// loading track
loader.load('./models/TrackFloor.glb', function (gltf) {

    console.log('gltf ', gltf);
    
    gltf.scene.position.y = -2;
    gltf.scene.position.x = 1;
    gltf.scene.userData.draggable = false;

    track = scene.add(gltf.scene);

}, null, function (error) {

    console.error(error);

});

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1);
scene.add(light);

camera.position.z = 5;



function animate() {
    requestAnimationFrame(animate);

    if (mixer) {
        mixer.update(clock.getDelta());
    }

    renderer.render(scene, camera);
}

function moveHuman(mouse) {

    let degrees = getMouseDegrees(mouse.x, mouse.y, 5);

    human.position.x = degrees.x;

    // console.log('human ', human);
    // console.log('track ', track.position);

}

function getMouseDegrees(x, y, degreeLimit) {
    let dx = 0,
        dy = 0,
        xdiff,
        xPercentage,
        ydiff,
        yPercentage;

    let w = { x: window.innerWidth, y: window.innerHeight };

    // Left (Rotates neck left between 0 and -degreeLimit)

    // 1. If cursor is in the left half of screen
    if (x <= w.x / 2) {
        // 2. Get the difference between middle of screen and cursor position
        xdiff = w.x / 2 - x;
        // 3. Find the percentage of that difference (percentage toward edge of screen)
        xPercentage = (xdiff / (w.x / 2)) * 100;
        // 4. Convert that to a percentage of the maximum rotation we allow for the neck
        dx = ((degreeLimit * xPercentage) / 100) * -1;
    }
    // Right (Rotates neck right between 0 and degreeLimit)
    if (x >= w.x / 2) {
        xdiff = x - w.x / 2;
        xPercentage = (xdiff / (w.x / 2)) * 100;
        dx = (degreeLimit * xPercentage) / 100;
    }
    // Up (Rotates neck up between 0 and -degreeLimit)
    if (y <= w.y / 2) {
        ydiff = w.y / 2 - y;
        yPercentage = (ydiff / (w.y / 2)) * 100;
        // Note that I cut degreeLimit in half when she looks up
        dy = (((degreeLimit * 0.5) * yPercentage) / 100) * -1;
    }

    // Down (Rotates neck down between 0 and degreeLimit)
    if (y >= w.y / 2) {
        ydiff = y - w.y / 2;
        yPercentage = (ydiff / (w.y / 2)) * 100;
        dy = (degreeLimit * yPercentage) / 100;
    }
    return { x: dx, y: dy };
}

// document.addEventListener('mousemove', function (e) {
//     moveHuman(getMousePos(e));
// });

function getMousePos(e) {
    return { x: e.clientX, y: e.clientY };
}

const raycaster = new THREE.Raycaster();
const moveMouse = new THREE.Vector2();
// const draggable = THREE.Object3D;

document.addEventListener('mousemove', function (e) {

    moveMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    moveMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(moveMouse, camera);
    const raycasters = raycaster.intersectObjects(scene.children);

    for (const obj of raycasters) {
        console.log('obj ', obj);
        if (obj.name !== 'Plane_flat') {
            human.position.x = obj.point.x;
            console.log('human.position.x ', human.position.x);
        }
       
        // human.position.z = obj.point.z;
    }
    
    // console.log('moveMouse ', moveMouse);
    
});

function dragObject () {
    // console.log('draggable ', draggable);
    // if (draggable) {
        raycaster.setFromCamera(moveMouse, camera);
        const found = raycaster.intersectObjects(scene.children);
        console.log('found ', found);
        if (found.length) {
            for (const o of found) {
                if (!o.object.userData.track) {
                    continue
                }
                draggable.position.x = o.point.x;
                draggable.position.z = o.point.z;
                
            }
            
        }
    // }
}

animate();