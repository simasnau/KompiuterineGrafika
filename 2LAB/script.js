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
	camera.position.x = 0;
	camera.position.y = 100;
	camera.position.z = 180;
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	// create a render and set the size
	const renderer = new THREE.WebGLRenderer();

	renderer.setClearColor(0xeeeeee, 1.0);
	renderer.setSize(window.innerWidth, window.innerHeight);

	// create the ground plane
	const planeGeometry = new THREE.PlaneGeometry(180, 180);
	const texture = THREE.ImageUtils.loadTexture("textures/ChessBoardSvg.svg");
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

	const controls = new (function () {
		this.fov = 75;
	})();

	const gui = new dat.GUI();
	gui.add(controls, "fov", 25, 100);

	const firstMesh = createChessFigureMesh();
	moveChessPieceOnBoard(firstMesh, 'C4');
	scene.add(firstMesh);

	const secondMesh = createChessFigureMesh();
	moveChessPieceOnBoard(secondMesh, 'B2');
	scene.add(secondMesh);

	// const pawn = createPawnBox();
	// moveChessPieceOnBoard(pawn, 'A2');
	// scene.add(pawn);

	const camControl = new THREE.TrackballControls(camera, renderer.domElement);
	render();

	function render() {
		stats.update();

		camera.fov = controls.fov;
		camera.updateProjectionMatrix();

		camControl.update();

		requestAnimationFrame(render);
		renderer.render(scene, camera);
	}
	function createChessFigureMesh() {
		const pointsX = [
			240, 202, 214, 225, 210,
			200, 225, 225, 220, 215,
			208, 205, 197, 186, 190,
			169, 168, 172, 161, 160,
		];
		const pointsY = [
			85, 97, 124, 145, 155,
			175, 180, 205, 235, 265,
			283, 295, 307, 316, 325,
			334, 343, 352, 361, 370,
		];
		const points = [];
		for (let i = 0; i < pointsX.length; i++) {
			points.push(new THREE.Vector3(25-pointsX[i]/10, 0.01, (pointsY[pointsX.length - 1]-pointsY[i]-174)/10));
		}

		const latheGeometry = new THREE.LatheGeometry(points, Math.ceil(12), 0, 2 * Math.PI);

		const meshMaterial = new THREE.MeshLambertMaterial({color: 0x444444});
		meshMaterial.side = THREE.DoubleSide;

		const mesh = new THREE.Mesh(latheGeometry, meshMaterial);
		mesh.rotateX(-Math.PI / 2);
		return mesh;
	}

	// function createPawnBox() {
	// 	// create box
	// 	const width = 10;
	// 	const height = 2;
	// 	const depth = 10;
	//
	// 	const boxGeometry = new THREE.BoxGeometry(width, height, depth);
	// 	const boxMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
	//
	// 	// stack of boxes
	// 	// for (let i = 0; i < 5; i++) {
	// 		const box = new THREE.Mesh(boxGeometry, boxMaterial);
	// 		box.castShadow = true;
	// 		box.position.y = (0.5 + 2 * 1.2) * height;
	// 		// scene.add(box);
	// 	// }
	//
	// 	// const latheGeometry = new THREE.LatheGeometry(points, Math.ceil(12), 0, 2 * Math.PI);
	// 	//
	// 	// const meshMaterial = new THREE.MeshLambertMaterial({color: 0x444444});
	// 	// meshMaterial.side = THREE.DoubleSide;
	// 	//
	// 	// const mesh = new THREE.Mesh(latheGeometry, meshMaterial);
	// 	// mesh.rotateX(-Math.PI / 2);
	// 	// return mesh;
	// 	return box;
	// }

	function moveChessPieceOnBoard(chessPiece, positionString) {
		if (positionString.length !== 2) {
			throw new Error("Wrong length passed")
		}
		let x = -67
		let z = 64
		const gap = 19;

		let xMultiplier = 1;
		let zMultiplier = 1;

		positionString = positionString.toUpperCase();
		switch (positionString.charAt(0)) {
			case 'B':
				xMultiplier = 2;
				break;
			case 'C':
				xMultiplier = 3;
				break;
			case 'D':
				xMultiplier = 4;
				break;
			case 'E':
				xMultiplier = 5;
				break;
			case 'F':
				xMultiplier = 6;
				break;
			case 'G':
				xMultiplier = 7;
				break;
			case 'H':
				xMultiplier = 8;
				break;
		}

		switch (positionString.charAt(1)) {
			case '2':
				zMultiplier = 2;
				break;
			case '3':
				zMultiplier = 3;
				break;
			case '4':
				zMultiplier = 4;
				break;
			case '5':
				zMultiplier = 5;
				break;
			case '6':
				zMultiplier = 6;
				break;
			case '7':
				zMultiplier = 7;
				break;
			case '8':
				zMultiplier = 8;
				break;
		}

		x = x + (xMultiplier - 1) * gap;
		z = z - (zMultiplier - 1) * gap;

		chessPiece.position.set(x, 18, z);
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
