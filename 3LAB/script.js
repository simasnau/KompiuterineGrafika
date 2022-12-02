// once everything is loaded, we run our Three.js stuff.
$(function () {
	const r = 5;
	const R = 7.5;

	const stats = initStats();

	// create a scene, that will hold all our elements such as objects, cameras and lights.
	const scene = new THREE.Scene();

	// create a camera, which defines where we're looking at.
	const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);

	// create a render and set the size
	const webGLRenderer = new THREE.WebGLRenderer();
	webGLRenderer.setSize(window.innerWidth, window.innerHeight);
	webGLRenderer.shadowMapEnabled = true;

	// position and point the camera to the center of the scene
	camera.position.x = -30;
	camera.position.y = 40;
	camera.position.z = 50;
	camera.lookAt(new THREE.Vector3(10, 0, 0));

	// add the output of the renderer to the html element
	$("#WebGL-output").append(webGLRenderer.domElement);

	const axes = new THREE.AxisHelper(50);
	scene.add(axes);

	// the points group
	let spGroup;
	// the mesh
	let hullMesh;

	generatePoints();

	const cameraControls = new THREE.TrackballControls(camera, webGLRenderer.domElement);

	let newpoints = [];
	newpoints.push(new THREE.Vector3(1, 0, 0));
	newpoints.push(new THREE.Vector3(0, 1, 0));
	newpoints.push(new THREE.Vector3(-1, 0, 0));
	newpoints.push(new THREE.Vector3(0, -1, 0));
	newpoints.push(new THREE.Vector3(0, 0, 1));
	newpoints.push(new THREE.Vector3(0, 0, -1));

	let basicMaterial = new THREE.MeshBasicMaterial({color: 0xff0000});
	const convexGeometry = new THREE.ConvexGeometry(newpoints);
	const geoMesh = new THREE.Mesh(convexGeometry, basicMaterial);
	geoMesh.position.y = 25;
	scene.add(geoMesh);
	render();

	function generatePoints() {
		const points = [];
		const allPoints = [];
		let x2;
		let y2;
		let z2;
		let R2;
		let r2; // TODO gal perkelti i fora
		for (let i = 0; i < 5000; i++) {
			const x = -15 + Math.random() * 30;
			const y = -7.5 + Math.random() * 15;
			const z = -15 + Math.random() * 30;
			x2 = Math.pow(x, 2);
			y2 = Math.pow(y, 2);
			z2 = Math.pow(z, 2);
			R2 = Math.pow(R, 2);
			r2 = Math.pow(r, 2);
			if (Math.pow(x2 + y2 + z2 + R2 - r2, 2) - 4 * R2 * (x2 + z2) <= 0) {
				// points.push(new THREE.Vector3(x, y, z).applyAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI/2));
				points.push(new THREE.Vector3(x, y, z));
			} else {
				// allPoints.push(new THREE.Vector3(x, y, z).applyAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI/2))
				allPoints.push(new THREE.Vector3(x, y, z));
			}
		}

		spGroup = new THREE.Object3D();
		let material = new THREE.MeshBasicMaterial({color: 0xff0000});
		points.forEach(function (point) {
			const spGeom = new THREE.SphereGeometry(0.2);
			const spMesh = new THREE.Mesh(spGeom, material);
			spMesh.position = point;
			// spGroup.add(spMesh); // parodo taskus viduje
		});

		//add all randomly generated points
		material = new THREE.MeshBasicMaterial({ color: 0xd7d8cc });
		allPoints.forEach(function (point) {
			const spGeom = new THREE.SphereGeometry(0.2);
			const spMesh = new THREE.Mesh(spGeom, material);
			spMesh.position = point;
			// spGroup.add(spMesh); // parodo taskus
		});
		// add the points as a group to the scene
		scene.add(spGroup);

		// use the same points to create a convexgeometry
		const hullGeometry = new THREE.ConvexGeometry(points);
		hullGeometry.uvsNeedUpdate = true;
		hullMesh = createMesh(hullGeometry);

		scene.add(hullMesh);
	}

	function createMesh(geom) {
		// assign two materials
		const meshMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00, transparent: true, opacity: 0.2});
		meshMaterial.side = THREE.DoubleSide;
		const wireFrameMat = new THREE.MeshBasicMaterial({color: 0x1603d3});
		wireFrameMat.wireframe = true;

		const texture = THREE.ImageUtils.loadTexture("textures/texture.jpg");
		const textureMaterial = new THREE.MeshBasicMaterial({ map: texture });

		let vertices = geom.vertices;
		geom.faceVertexUvs[0].forEach((vertexUvs, index) => {
			geom.faceVertexUvs[0][index] = [];
			const a = getUv(vertices, geom.faces[index].a);
			const b = getUv(vertices, geom.faces[index].b);
			const c = getUv(vertices, geom.faces[index].c);

			// pataisome siule
			geom.faceVertexUvs[0][index] = fixUvs(a, b, c);
		});

		return THREE.SceneUtils.createMultiMaterialObject(geom, [textureMaterial, wireFrameMat]);
	}

	function fixUvs(a, b, c) {
		if (Math.abs(a.y - b.y) > 0.5 || Math.abs(b.y - c.y) > 0.5 || Math.abs(c.y - a.y) > 0.5) {
			if (Math.abs(a.y - b.y) > 0.5 && Math.abs(c.y - a.y) > 0.5 && a.y < b.y && a.y < c.y) {
				a.y += 1;
			} else if (Math.abs(a.y - b.y) > 0.5 && Math.abs(c.y - a.y) > 0.5 && a.y > b.y && a.y > c.y) {
				a.y -= 1;
			} else if (Math.abs(b.y - a.y) > 0.5 && Math.abs(b.y - c.y) > 0.5 && b.y < a.y && b.y < c.y) {
				b.y += 1;
			} else if (Math.abs(b.y - a.y) > 0.5 && Math.abs(b.y - c.y) > 0.5 && b.y > a.y && b.y > c.y) {
				b.y -= 1;
			} else if (Math.abs(c.y - b.y) > 0.5 && Math.abs(c.y - a.y) > 0.5 && c.y < a.y && c.y < b.y) {
				c.y += 1;
			} else if (Math.abs(c.y - b.y) > 0.5 && Math.abs(c.y - a.y) > 0.5 && c.y > a.y && c.y > b.y) {
				c.y -= 1;
			} else {
				const arr = fixUvs2(a, b, c);
				return fixUvs(arr[0], arr[1], arr[2]);
			}
		}

		return [a, b, c];
	}

	function fixUvs2(a, b, c) {
		if (Math.abs(a.y - b.y) > 0.5) {
			a.y > b.y ? (a.y > 0 ? (a.y -= 0.5) : (a.y += 0.5)) : b.y > 0 ? (b.y -= 0.5) : (b.y += 0.5);
		} else if (Math.abs(b.y - c.y) > 0.5) {
			b.y > c.y ? (b.y > 0 ? (b.y -= 0.5) : (b.y += 0.5)) : c.y > 0 ? (c.y -= 0.5) : (c.y += 0.5);
		} else if (Math.abs(c.y - a.y) > 0.5) {
			c.y > a.y ? (c.y > 0 ? (c.y -= 0.5) : (c.y += 0.5)) : a.y > 0 ? (a.y -= 0.5) : (a.y += 0.5);
		}
		return [a, b, c];
	}

	function getUv(vertices, pointIndex) {
		let point = vertices[pointIndex];
		let u = Math.atan2(point.x, point.z) / (2 * Math.PI);
		let v = Math.atan2(point.y, Math.sqrt(point.x * point.x + point.z * point.z) + R) / Math.PI + 0.5;
		if (u < 0) {
			u += 1;
		}
		if (u > 1) {
			u -= 1;
		}
		if (v > 1) {
			v -= 1;
		}
		if (v < 0) {
			v += 1;
		}
		return new THREE.Vector2(v, u);
	}

	function render() {
		stats.update();

		// render using requestAnimationFrame
		requestAnimationFrame(render);
		webGLRenderer.render(scene, camera);
		cameraControls.update();
	}

	function initStats() {
		const newStats = new Stats();
		newStats.setMode(0); // 0: fps, 1: ms

		// Align top-left
		newStats.domElement.style.position = "absolute";
		newStats.domElement.style.left = "0px";
		newStats.domElement.style.top = "0px";

		$("#Stats-output").append(newStats.domElement);

		return newStats;
	}
});
