// once everything is loaded, we run our Three.js stuff.
$(function () {
	const stats = initStats();

	//TODO normali lenta, apvalus karalius, kitos basic figuros is bloku, jas sudeti ant lentos, karaliaus karuna su binary ops,
	// ambient and spot light (kugine),
	// seseliai, blizgios medziagos
	// interaktyvuis gui parametrai:
	// pasirenkamas kugines sviesos tikslas (target), sviesos stiprumas, ijungiamas/isjungiamas scenos sukimasis

	// create a scene, that will hold all our elements such as objects, cameras and lights.
	const scene = new THREE.Scene();

	// create a camera, which defines where we're looking at.
	const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);
	camera.position.x = 120;
	camera.position.y = 60;
	camera.position.z = 180;
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	// create a render and set the size
	const renderer = new THREE.WebGLRenderer();

	renderer.setClearColor(0xeeeeee, 1.0);
	renderer.setSize(window.innerWidth, window.innerHeight);

	// create the ground plane
	const planeGeometry = new THREE.PlaneGeometry(180, 180);
	const texture = THREE.ImageUtils.loadTexture("textures/ChessBoard.png");
	const textureMaterial = new THREE.MeshBasicMaterial({ map: texture });
	const plane = new THREE.Mesh(planeGeometry, textureMaterial);

	plane.rotation.x = -0.5 * Math.PI;
	plane.position.x = 0;
	plane.position.y = 0;
	plane.position.z = 0;

	scene.add(plane);

	const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
	directionalLight.position.set(-20, 40, 60);
	scene.add(directionalLight);

	// add subtle ambient lighting
	const ambientLight = new THREE.AmbientLight(0x292929);
	scene.add(ambientLight);

	// add the output of the renderer to the html element
	$("#WebGL-output").append(renderer.domElement);

	let step = 0;

	const controls = new (function () {
		this.fov = 75;
	})();

	const gui = new dat.GUI();
	gui.add(controls, "fov", 25, 100);

	const firstMesh = createChessFigureMesh();
	firstMesh.position.set(-50, -50, -50);
	scene.add(firstMesh);

	const secondMesh = createChessFigureMesh();
	secondMesh.position.set(0, 18, -50);
	scene.add(secondMesh);
	const camControl = new THREE.TrackballControls(camera, renderer.domElement);
	render();

	function render() {
		stats.update();

		let x = 10 + 50 * Math.sin(step);
		firstMesh.position = new THREE.Vector3(x, 18, 50);

		step += 0.01;
		camera.fov = controls.fov;
		camera.lookAt(new THREE.Vector3(0, 0, 0));

		camera.updateProjectionMatrix();

		camControl.update();

		requestAnimationFrame(render);
		renderer.render(scene, camera);
	}
	function createChessFigureMesh() {
		const pointsX = [
			250, 240, 230, 220, 210, 200, 200, 205, 214, 230, 220, 207, 210, 218, 228, 226, 224, 221, 217, 209, 198, 188, 184, 182, 190,
			180, 175, 179, 172, 173, 250,
		];
		const pointsY = [
			34, 46, 58, 70, 82, 94, 106, 118, 130, 142, 154, 166, 178, 190, 202, 214, 226, 238, 250, 262, 274, 286, 298, 310, 322, 334,
			346, 358, 370, 382, 382,
		];
		const points = [];
		for (let i = 0; i < pointsX.length; i++) {
			points.push(new THREE.Vector3(25 - pointsX[i] / 10, 0.01, (pointsY[30] - pointsY[i] - 174) / 10));
		}

		const latheGeometry = new THREE.LatheGeometry(points, Math.ceil(12), 0, 2 * Math.PI);

		const meshMaterial = new THREE.MeshLambertMaterial({color: 0x444444});
		meshMaterial.side = THREE.DoubleSide;

		const mesh = new THREE.Mesh(latheGeometry, meshMaterial);
		mesh.rotateX(-Math.PI / 2);
		return mesh;
	}

	function initStats() {
		const newStats = new Stats();

		newStats.setMode(0);

		newStats.domElement.style.position = "absolute";
		newStats.domElement.style.left = "0px";
		newStats.domElement.style.top = "0px";

		$("#Stats-output").append(newStats.domElement);

		return newStats;
	}
});
