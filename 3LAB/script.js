// once everything is loaded, we run our Three.js stuff.
$(function () {
	const r = 5;
	const R = 7.5;

	var stats = initStats();

	// create a scene, that will hold all our elements such as objects, cameras and lights.
	var scene = new THREE.Scene();

	// create a camera, which defines where we're looking at.
	var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000);

	// create a render and set the size
	var webGLRenderer = new THREE.WebGLRenderer();
	webGLRenderer.setSize(window.innerWidth, window.innerHeight);
	webGLRenderer.shadowMapEnabled = true;

	// position and point the camera to the center of the scene
	camera.position.x = -30;
	camera.position.y = 40;
	camera.position.z = 50;
	camera.lookAt(new THREE.Vector3(10, 0, 0));

	// add the output of the renderer to the html element
	$("#WebGL-output").append(webGLRenderer.domElement);

	var axes = new THREE.AxisHelper(50);
	scene.add(axes);

	// call the render function
	var step = 0;

	// the points group
	var spGroup;
	// the mesh
	var hullMesh;

	generatePoints();

	// setup the control gui
	var controls = new (function () {
		// we need the first child, since it's a multimaterial

		this.redraw = function () {
			scene.remove(spGroup);
			scene.remove(hullMesh);
			generatePoints();
		};
	})();

	var gui = new dat.GUI();
	gui.add(controls, "redraw");

	// $("#WebGL-output").append(webGLRenderer.domElement);
	var cameraControls = new THREE.TrackballControls(camera, webGLRenderer.domElement);

	newpoints = [];
	newpoints.push(new THREE.Vector3(1, 0, 0));
	newpoints.push(new THREE.Vector3(0, 1, 0));
	newpoints.push(new THREE.Vector3(-1, 0, 0));
	newpoints.push(new THREE.Vector3(0, -1, 0));
	newpoints.push(new THREE.Vector3(0, 0, 1));
	newpoints.push(new THREE.Vector3(0, 0, -1));

	var newgeo = new THREE.ConvexGeometry(newpoints);
	var m = new THREE.Mesh(newgeo, material);
	m.position.y = 25;
	console.log(newgeo);
	scene.add(m);
	render();

	function generatePoints() {
		var points = [];
		var allPoints = [];
		for (var i = 0; i < 5000; i++) {
			var x = -15 + Math.random() * 30;
			var y = -7.5 + Math.random() * 15;
			var z = -15 + Math.random() * 30;
			x2 = Math.pow(x, 2);
			y2 = Math.pow(y, 2);
			z2 = Math.pow(z, 2);
			// console.log(point.z, z2)
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
		material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
		points.forEach(function (point) {
			var spGeom = new THREE.SphereGeometry(0.2);
			var spMesh = new THREE.Mesh(spGeom, material);
			spMesh.position = point;
			// spGroup.add(spMesh);
		});

		//add all randomly generated points
		material = new THREE.MeshBasicMaterial({ color: 0xd7d8cc });
		allPoints.forEach(function (point) {
			var spGeom = new THREE.SphereGeometry(0.2);
			var spMesh = new THREE.Mesh(spGeom, material);
			spMesh.position = point;
			// spGroup.add(spMesh);
		});
		// add the points as a group to the scene
		// spGroup.rotateX(Math.PI/2)
		scene.add(spGroup);

		// use the same points to create a convexgeometry
		var hullGeometry = new THREE.ConvexGeometry(points);
		hullGeometry.uvsNeedUpdate = true;
		hullMesh = createMesh(hullGeometry);

		// hullMesh.rotateX(Math.PI/2)
		scene.add(hullMesh);

		var starimesh = createStair(true);

		// starimesh.rotateY(90*Math.PI/180);
		// starimesh.rotateZ(180*Math.PI/180);
		starimesh.rotateZ((180 * Math.PI) / 180);
		var multiply = new THREE.Vector3().multiply(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1));
		starimesh.rotateOnAxis(multiply, (90 * Math.PI) / 180);
		starimesh.position.y = 15;
		scene.add(starimesh);
	}

	function createStair(flipStair) {
		var shape = new THREE.Shape();
		shape.moveTo(0, 0);
		shape.lineTo(0, 1);
		shape.bezierCurveTo(0, 1, 2.5, 1, 3, 1.5);
		shape.bezierCurveTo(3, 1.5, 3.5, 1.75, 6, 2);
		shape.lineTo(6, 0);
		shape.lineTo(0, 0);
		const extrudeSettings = {
			steps: 2,
			depth: 0.3,
			bevelEnabled: false,
			bevelThickness: 1,
			bevelSize: 1,
			bevelOffset: 0,
			bevelSegments: 1,
		};

		const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
		const mesh = new THREE.Mesh(geometry, material);

		//TO CHANGE IF STAIR IS FLIPPED
		if (flipStair) {
			mesh.scale.x *= -1;
		} else {
			mesh.position.x = -1;
		}

		mesh.position.x = mesh.position.x + 1 / 2;
		mesh.rotateX(Math.PI / 2);

		mesh.scale.y *= -1;
		return mesh;
	}

	function createMesh(geom) {
		// assign two materials
		var meshMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.2 });
		meshMaterial.side = THREE.DoubleSide;
		var wireFrameMat = new THREE.MeshBasicMaterial({ color: 0x1603d3 });
		wireFrameMat.wireframe = true;

		const texture = THREE.ImageUtils.loadTexture("textures/texture.jpg");
		const textureMaterial = new THREE.MeshBasicMaterial({ map: texture });

		console.log(geom);

		console.log(geom.faceVertexUvs[0]);
		vertices = geom.vertices;
		console.log(vertices);
		geom.faceVertexUvs[0].forEach((vertexUvs, index) => {
			geom.faceVertexUvs[0][index] = [];
			// geom.faceVertexUvs[0][index].push(getUv(vertices, geom.faces[index].a ));
			// geom.faceVertexUvs[0][index].push(getUv(vertices, geom.faces[index].b ));
			// geom.faceVertexUvs[0][index].push(getUv(vertices, geom.faces[index].c ));
			var a = getUv(vertices, geom.faces[index].a);
			var b = getUv(vertices, geom.faces[index].b);
			var c = getUv(vertices, geom.faces[index].c);

			// pataisome siule
			geom.faceVertexUvs[0][index] = fixUvs(a, b, c);
			// geom.faceVertexUvs[0][index] = [a, b, c]
		});
		// console.log(geom.faceVertexUvs[0])

		// create a multimaterial
		var mesh = THREE.SceneUtils.createMultiMaterialObject(geom, [textureMaterial, wireFrameMat]);

		return mesh;
	}

	function fixUvs(a, b, c) {
		if (Math.abs(a.y - b.y) > 0.5 || Math.abs(b.y - c.y) > 0.5 || Math.abs(c.y - a.y) > 0.5) {
			console.log("        a:" + a.y + " ,b:" + b.y + " ,c:" + c.y);
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
				console.log("        a:" + a.y + " ,b:" + b.y + " ,c:" + c.y);
				var arr = fixUvs2(a, b, c);
				console.log("kartojam");
				return fixUvs(arr[0], arr[1], arr[2]);
			}
			console.log("edited - a :" + a.y + " ,b:" + b.y + " ,c:" + c.y);
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
		point = vertices[pointIndex];
		var u = Math.atan2(point.x, point.z) / (2 * Math.PI);
		var v = Math.atan2(point.y, Math.sqrt(point.x * point.x + point.z * point.z) + R) / Math.PI + 0.5;
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

		// spGroup.rotation.y = step;
		// hullMesh.rotation.y = step += 0.01;

		// render using requestAnimationFrame
		requestAnimationFrame(render);
		webGLRenderer.render(scene, camera);
		cameraControls.update();
	}

	function initStats() {
		var stats = new Stats();
		stats.setMode(0); // 0: fps, 1: ms

		// Align top-left
		stats.domElement.style.position = "absolute";
		stats.domElement.style.left = "0px";
		stats.domElement.style.top = "0px";

		$("#Stats-output").append(stats.domElement);

		return stats;
	}
});
