// once everything is loaded, we run our Three.js stuff.
$(function () {
	const stats = initStats();

	//TODO kitos basic figuros is bloku,
	// ambient and spot light (kugine),
	// seseliai, blizgios medziagos
	// interaktyvuis gui parametrai:
	// pasirenkamas kugines sviesos tikslas (target), sviesos stiprumas

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

	let spin = false;

	const controls = new (function () {
		this.fov = 75;
		this.spin = false;
	})();

	const gui = new dat.GUI();
	gui.add(controls, "fov", 25, 100);
	gui.add(controls, 'spin').onChange(function () {
		spin = !spin;
	});

	const boardGroup = populateBoard();
	scene.add(boardGroup);

	const camControl = new THREE.TrackballControls(camera, renderer.domElement);
	render();

	function render() {
		stats.update();

		camera.fov = controls.fov;
		camera.updateProjectionMatrix();

		camControl.update();

		if (spin) {
			plane.rotation.z += .01;
			boardGroup.rotation.y += .01;
		}

		requestAnimationFrame(render);
		renderer.render(scene, camera);
	}
	function createChessFigureMesh(color) {
		const pointsX = [
			251, 202, 214, 225, 210,
			200, 225, 225, 220, 215,
			208, 205, 197, 186, 190,
			169, 168, 172, 161, 160, 251
		];
		const pointsY = [
			85, 97, 124, 145, 155,
			175, 180, 205, 235, 265,
			283, 295, 307, 316, 325,
			334, 343, 352, 361, 370, 370
		];
		const points = [];
		for (let i = 0; i < pointsX.length; i++) {
			points.push(new THREE.Vector3(25-pointsX[i]/10, 0.01, (pointsY[pointsX.length - 1]-pointsY[i]-174)/10));
		}

		const latheGeometry = new THREE.LatheGeometry(points, 12, 0, 2 * Math.PI);

		const meshMaterial = new THREE.MeshLambertMaterial({color: color});
		meshMaterial.side = THREE.DoubleSide;

		const latheMesh = new THREE.Mesh(latheGeometry, meshMaterial);
		latheMesh.rotateX(-Math.PI / 2);

		const crossYPosition = 13;
		const crossXPosition = 0;
		const cutYDistance = 1.5;
		const cutXDistance = 1.5;

		const crossGeometry = new THREE.CubeGeometry(5, 5, 1);
		const crossMesh = new THREE.Mesh(crossGeometry, meshMaterial);
		crossMesh.position.y=crossYPosition;
		crossMesh.position.x=crossXPosition;

		const boxGeometry = new THREE.CubeGeometry(2, 2, 1);
		const topLeftBox = new THREE.Mesh( boxGeometry, meshMaterial ) ;
		topLeftBox.position.y = crossYPosition + cutYDistance;
		topLeftBox.position.x = crossXPosition - cutXDistance;

		const topRightBox = new THREE.Mesh( boxGeometry, meshMaterial ) ;
		topRightBox.position.y = crossYPosition + cutYDistance;
		topRightBox.position.x = crossXPosition + cutXDistance;

		const bottomLeftBox = new THREE.Mesh( boxGeometry, meshMaterial ) ;
		bottomLeftBox.position.y = crossYPosition - cutYDistance;
		bottomLeftBox.position.x = crossXPosition - cutXDistance;

		const bottomRightBox = new THREE.Mesh( boxGeometry, meshMaterial ) ;
		bottomRightBox.position.y = crossYPosition - cutYDistance;
		bottomRightBox.position.x = crossXPosition + cutXDistance;

		let crossBSP = new ThreeBSP(crossMesh);
		let topLeftBSP = new ThreeBSP(topLeftBox);
		let topRightBSP = new ThreeBSP(topRightBox);
		let bottomLeftBSP = new ThreeBSP(bottomLeftBox);
		let bottomRightBSP = new ThreeBSP(bottomRightBox);
		crossBSP = crossBSP.subtract(topLeftBSP).subtract(topRightBSP).subtract(bottomLeftBSP).subtract(bottomRightBSP);

		let meshBSP = new ThreeBSP(latheMesh);
		let resultBSP = meshBSP.union(crossBSP);

		let mesh = resultBSP.toMesh();
		mesh.geometry.computeFaceNormals();
		mesh.geometry.computeVertexNormals();
		mesh.material=meshMaterial;

		return mesh;
	}

	function createPawnBox(color) {
		// create box
		const width = 10;
		const height = 20;
		const depth = 10;

		const boxGeometry = new THREE.CubeGeometry(width, height, depth);
		const boxMaterial = new THREE.MeshLambertMaterial({ color: color });

		const box = new THREE.Mesh(boxGeometry, boxMaterial);
		box.castShadow = true;
		return box;
	}

	function moveChessPieceOnBoardWithHeight(chessPiece, positionString, y) {
		moveChessPieceOnBoard(chessPiece, positionString)
		chessPiece.position.y = y;
	}

	function populateBoard() {
		const group = new THREE.Object3D();

		const pawnColumns = 'ABCDEFGH'
		let pawnRows = [2, 7];
		let colors = [0xFFFFFF, 0x111111]

		for (let i = 0; i < pawnRows.length; i++) {
			for (let j = 0; j < pawnColumns.length; j++) {
				let position = pawnColumns.charAt(j) + pawnRows[i];
				const newFigure = createPawnBox(colors[i]);
				moveChessPieceOnBoardWithHeight(newFigure, position, newFigure.geometry.height / 2);
				group.add(newFigure)
			}
		}

		const kingColumns = 'E'
		let rows = [1, 8];

		for (let i = 0; i < rows.length; i++) {
			for (let j = 0; j < kingColumns.length; j++) {
				let position = kingColumns.charAt(j) + rows[i];
				const newFigure = createChessFigureMesh(colors[i]);
				moveChessPieceOnBoard(newFigure, position);
				group.add(newFigure)
			}
		}

		const rookColumns = 'ABCDFGH'
		for (let i = 0; i < rows.length; i++) {
			for (let j = 0; j < rookColumns.length; j++) {
				let position = rookColumns.charAt(j) + rows[i];
				const newFigure = createPawnBox(colors[i]);
				moveChessPieceOnBoardWithHeight(newFigure, position, newFigure.geometry.height / 2);
				group.add(newFigure)
			}
		}
		return group;
	}

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
