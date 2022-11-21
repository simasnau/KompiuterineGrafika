// once everything is loaded, we run our Three.js stuff.
$(function () {
	const stats = initStats();

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
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	// create the ground plane
	const planeGeometry = new THREE.PlaneGeometry(180, 180);
	const texture = new THREE.TextureLoader().load("textures/ChessBoardSvg.svg");

	const planeMaterial = new THREE.MeshLambertMaterial({
		map: texture,
	});
	const plane = new THREE.Mesh(planeGeometry, planeMaterial);
	plane.receiveShadow = true;

	plane.rotation.x = -0.5 * Math.PI;
	plane.position.x = 0;
	plane.position.y = 0;
	plane.position.z = 0;

	scene.add(plane);

	// add spotlight for the shadows
	var spotLight = new THREE.SpotLight(0xffffff, 1);
	spotLight.position.set(-60, 100, 125);
	spotLight.castShadow = true;
	scene.add(spotLight);
	scene.add(spotLight.target);

	const helper = new THREE.CameraHelper( spotLight.shadow.camera );
	scene.add( helper );

	// add subtle ambient lighting
	const ambientLight = new THREE.AmbientLight(0x292929, 0.5);
	scene.add(ambientLight);

	// add the output of the renderer to the html element
	$("#WebGL-output").append(renderer.domElement);

	let spin = false;

	const controls = new (function () {
		this.spotLightIntensity = 1;
		this.spotLightTargetX = 0;
		this.spotLightTargetY = 0;
		this.spotLightTargetZ = 0;
		this.spin = false;
	})();

	const gui = new dat.GUI();
	gui.add(controls, 'spin').onChange(function () {
		spin = !spin;
	});
	gui.add(controls, "spotLightIntensity", 0, 2);
	gui.add(controls, "spotLightTargetX", -100, 100);
	gui.add(controls, "spotLightTargetY", -100, 100);
	gui.add(controls, "spotLightTargetZ", -100, 100);

	const boardGroup = populateBoard();
	scene.add(boardGroup);

	const camControl = new THREE.TrackballControls(camera, renderer.domElement);
	render();

	function render() {
		stats.update();

		spotLight.intensity = controls.spotLightIntensity;
		spotLight.target.position.set(controls.spotLightTargetX, controls.spotLightTargetY, controls.spotLightTargetZ)
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
			points.push(new THREE.Vector2(25-pointsX[i]/10, (pointsY[pointsX.length - 1]-pointsY[i]-174)/10));
		}

		const latheGeometry = new THREE.LatheGeometry(points, 12, 0, 2 * Math.PI);

		const meshMaterial = new THREE.MeshPhongMaterial({color: color, shininess: 100});
		meshMaterial.side = THREE.DoubleSide;

		const latheMesh = new THREE.Mesh(latheGeometry, meshMaterial);
		latheMesh.castShadow = true;

		const crossYPosition = 13;
		const crossXPosition = 0;
		const cutYDistance = 1.5;
		const cutXDistance = 1.5;

		const crossGeometry = new THREE.BoxGeometry(5, 5, 1);
		const crossMesh = new THREE.Mesh(crossGeometry, meshMaterial);
		crossMesh.position.y=crossYPosition;
		crossMesh.position.x=crossXPosition;

		const boxGeometry = new THREE.BoxGeometry(2, 2, 1);
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

		let cross = crossBSP.toMesh();
		cross.geometry.computeFaceNormals();
		cross.geometry.computeVertexNormals();
		cross.material = meshMaterial;

		latheMesh.geometry.computeFaceNormals();
		latheMesh.geometry.computeVertexNormals();
		latheMesh.material = meshMaterial;

		let kingGroup = new THREE.Group();
		kingGroup.add(cross);
		kingGroup.add(latheMesh);
		return kingGroup;
	}

	function createPawnBox(color) {
		const newFigure1 = createShinyBox(9, 3, 9, color);
		newFigure1.position.y = 1.5;
		const newFigure3 = createShinyBox(4, 12, 4, color);
		newFigure3.position.y = 6;
		const newFigure4 = createShinyBox(3, 15, 3, color);
		newFigure4.position.y = 7.5;
		const newFigure5 = createShinyBox(4, 4, 4, color);
		newFigure5.position.y = 16.5;

		return mergeMeshes([newFigure1, newFigure3, newFigure4, newFigure5], color);
	}

	function createRook(color) {
		const newFigure1 = createShinyBox(9, 3, 9, color);
		newFigure1.position.y=1.5
		const newFigure4 = createShinyBox(7, 19, 7, color);
		newFigure4.position.y=19/2;
		const newFigure5 = createShinyBox(8, 3, 8, color);
		newFigure5.position.y=1.5+19
		return mergeMeshes([newFigure1, newFigure4, newFigure5], color);
	}

	function createKnight(color, i) {
		const newFigure1 = createShinyBox(9, 3, 9, color);
		newFigure1.position.y=newFigure1.geometry.parameters.height / 2
		const newFigure3 = createShinyBox(8, 12, 8, color);
		newFigure3.position.y=newFigure3.geometry.parameters.height / 2
		const newFigure4 = createShinyBox(7, 23, 7, color);
		newFigure4.position.y=newFigure4.geometry.parameters.height / 2
		const newFigure5 = createShinyBox(7, 6, 14, color);
		newFigure5.position.y=23 - 5
		newFigure5.position.z -= (2 * (-1)**(i % 2));

		return mergeMeshes([newFigure1, newFigure3, newFigure4, newFigure5], color)
	}

	function createBishop(color) {
		const newFigure1 = createShinyBox(9, 3, 9, color);
		newFigure1.position.y=newFigure1.geometry.parameters.height / 2;
		const newFigure3 = createShinyBox(6, 13, 6, color);
		newFigure3.position.y=newFigure3.geometry.parameters.height / 2;
		const newFigure4 = createShinyBox(3, 19, 3, color);
		newFigure4.position.y=newFigure4.geometry.parameters.height / 2;
		const newFigure5 = createShinyBox(4, 4, 4, color);
		newFigure5.position.y=newFigure5.geometry.parameters.height / 2 + 19;
		const newFigure6 = createShinyBox(2, 24, 2, color);
		newFigure6.position.y=newFigure6.geometry.parameters.height / 2;
		return mergeMeshes([newFigure1, newFigure3, newFigure4, newFigure5, newFigure6], color)
	}

	function createQueen(color) {
		const newFigure1 = createShinyBox(9, 3, 9, color);
		newFigure1.position.y=newFigure1.geometry.parameters.height / 2;
		const newFigure2 = createShinyBox(8, 5, 8, color);
		newFigure2.position.y=newFigure2.geometry.parameters.height / 2;
		const newFigure3 = createShinyBox(6, 23, 6, color);
		newFigure3.position.y=newFigure3.geometry.parameters.height / 2;
		const newFigure4 = createShinyBox(7, 5, 7, color);
		newFigure4.position.y=newFigure4.geometry.parameters.height / 2 + 23;
		const newFigure5 = createShinyBox(6, 3, 6, color);
		newFigure5.position.y=newFigure5.geometry.parameters.height / 2 + 28;

		return mergeMeshes([newFigure1, newFigure2, newFigure3, newFigure4, newFigure5], color)
	}

	function moveChessPieceOnBoardWithHeight(chessPiece, positionString, y) {
		moveChessPieceOnBoard(chessPiece, positionString)
		chessPiece.position.y = y;
	}

	function mergeMeshes (meshArr, color) {
		const geometry = new THREE.Geometry();

		for (const mesh of meshArr) {
			geometry.mergeMesh(mesh);
		}
		geometry.mergeVertices();


		const meshResult = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color: color, shininess: 100}));
		meshResult.castShadow = true;
		meshResult.receiveShadow = true;
		return meshResult;
	}

	function createMeshWithShadows(geometry, material) {
		const mesh = new THREE.Mesh(geometry, material);
		mesh.castShadow = true;
		mesh.receiveShadow = true;
		return mesh;
	}

	function createShinyBox(width, height, depth, color) {
		const boxGeometry = new THREE.BoxGeometry(width, height, depth);
		const boxMaterial = new THREE.MeshPhongMaterial({ color: color, shininess: 100 });

		return createMeshWithShadows(boxGeometry, boxMaterial);
	}

	function populateBoard() {
		const group = new THREE.Group();

		const pawnColumns = 'ABCDEFGH'
		let pawnRows = [2, 7];
		let colors = [0xFFFFFF, 0x4a4a4a]

		for (let i = 0; i < pawnRows.length; i++) {
			for (let j = 0; j < pawnColumns.length; j++) {
				let position = pawnColumns.charAt(j) + pawnRows[i];
				const newFigure = createPawnBox(colors[i]);
				moveChessPieceOnBoardWithHeight(newFigure, position, 0);
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

		const rookColumns = 'AH'
		for (let i = 0; i < rows.length; i++) {
			for (let j = 0; j < rookColumns.length; j++) {
				let position = rookColumns.charAt(j) + rows[i];
				const newFigure = createRook(colors[i]);
				moveChessPieceOnBoardWithHeight(newFigure, position, 0);
				group.add(newFigure);
			}
		}

		const knightColumns = 'BG'
		for (let i = 0; i < rows.length; i++) {
			for (let j = 0; j < knightColumns.length; j++) {
				let position = knightColumns.charAt(j) + rows[i];
				const newFigure = createKnight(colors[i], i);
				moveChessPieceOnBoardWithHeight(newFigure, position, 0);
				group.add(newFigure)
			}
		}

		const bishopColumns = 'CF'
		for (let i = 0; i < rows.length; i++) {
			for (let j = 0; j < bishopColumns.length; j++) {
				let position = bishopColumns.charAt(j) + rows[i];
				const newFigure = createBishop(colors[i]);
				moveChessPieceOnBoardWithHeight(newFigure, position, 0);
				group.add(newFigure)
			}
		}

		const queenColumns = 'D'
		for (let i = 0; i < rows.length; i++) {
			for (let j = 0; j < queenColumns.length; j++) {
				let position = queenColumns.charAt(j) + rows[i];
				const newFigure = createQueen(colors[i]);
				moveChessPieceOnBoardWithHeight(newFigure, position, 0);
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
				zMultiplier = 6.9;
				break;
			case '8':
				zMultiplier = 7.9;
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
