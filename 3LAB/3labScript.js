import * as THREE from "https://unpkg.com/three@0.123.0/build/three.module.js";
import { TrackballControls } from "https://unpkg.com/three@0.123.0/examples/jsm/controls/TrackballControls.js";
import { ConvexGeometry } from "https://unpkg.com/three@0.123.0/examples/jsm/geometries/ConvexGeometry.js";
import Stats from "https://unpkg.com/three@0.123.0/examples/jsm/libs/stats.module";

const stats = initStats();

const r = 5;
const R = 7.5;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.x = -20;
camera.position.y = 40;
camera.position.z = 40;
camera.lookAt(scene.position);

const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xeeeeee, 1.0);
renderer.setSize(window.innerWidth, window.innerHeight);

$("#WebGL-output").append(renderer.domElement);
const trackballControls = new TrackballControls(camera, renderer.domElement);

const axes = new THREE.AxesHelper(50);
scene.add(axes);

const ambientLight = new THREE.AmbientLight(0xcccccc, 1);
scene.add(ambientLight);

const generatedPoints = generatePoints(R, r);
const torusPoints = filterPoints(R, r, generatedPoints);

const geometry = new ConvexGeometry(torusPoints);

const s = 4;
geometry.faceVertexUvs[0] = [];
for (const face of geometry.faces) {
	const v1 = geometry.vertices[face.a];
	const v2 = geometry.vertices[face.b];
	const v3 = geometry.vertices[face.c];

	let u1 = calcU(v1.x, v1.z, s);
	let u2 = calcU(v2.x, v2.z, s);
	let u3 = calcU(v3.x, v3.z, s);

	if (u1 > 0.9 * s || u2 > 0.9 * s || u3 > 0.9 * s) {
		if (u1 < s * 0.8) {
			u1 += s;
		}
		if (u2 < s * 0.8) {
			u2 += s;
		}
		if (u3 < s * 0.8) {
			u3 += s;
		}
	}

	geometry.faceVertexUvs[0].push([
		new THREE.Vector2(u1, calcV(v1.y, r)),
		new THREE.Vector2(u2, calcV(v2.y, r)),
		new THREE.Vector2(u3, calcV(v3.y, r)),
	]);
}
geometry.uvsNeedUpdate = true;

const wireFrameMaterial = new THREE.MeshBasicMaterial({ color: 0x969100 });
wireFrameMaterial.wireframe = true;

const texture = new THREE.TextureLoader().load("textures/texture.jpg");
texture.wrapS = THREE.RepeatWrapping;

const material = new THREE.MeshBasicMaterial({ map: texture });

const mesh = createMultiMaterialObject(geometry, [wireFrameMaterial, material]);
scene.add(mesh);

render();

function render() {
	trackballControls.update();
	stats.update();
	renderer.render(scene, camera);
	requestAnimationFrame(render);
}

function generatePoints(R, r) {
	var points = [];
	for (let i = 0; i < 10000; i++) {
		let x = random(-(R + r), R + r);
		let y = random(-r, r);
		let z = random(-(R + r), R + r);
		points.push(new THREE.Vector3(x, y, z));
	}
	return points;
}

function random(min, max) {
	return Math.random() * (max - min) + min;
}

function filterPoints(R, r, points) {
	let filteredPoints = [];
	points.forEach((point) => {
		let x2 = Math.pow(point.x, 2);
		let y2 = Math.pow(point.y, 2);
		let z2 = Math.pow(point.z, 2);
		let R2 = Math.pow(R, 2);
		let r2 = Math.pow(r, 2);
		const torusCondition = Math.pow(x2 + y2 + z2 + R2 - r2, 2) - 4 * R2 * (x2 + z2) <= 0;
		if (torusCondition) {
			filteredPoints.push(point);
		}
	});
	return filteredPoints;
}

function calcU(x, z, s) {
	return ((Math.atan2(z, x) + Math.PI) / (2 * Math.PI)) * s;
}

function calcV(y, r) {
	return Math.asin(y / r) / Math.PI + 1 / 2;
}

function initStats() {
	const newStats = new Stats();
	newStats.setMode(0);

	// Align top-left
	newStats.domElement.style.position = "absolute";
	newStats.domElement.style.left = "0px";
	newStats.domElement.style.top = "0px";

	$("#Stats-output").append(newStats.domElement);

	return newStats;
}

function createMultiMaterialObject(geometry, materials) {
	var group = new THREE.Object3D();
	for (let i = 0; i < materials.length; i++) {
		group.add(new THREE.Mesh(geometry, materials[i]));
	}
	return group;
}
