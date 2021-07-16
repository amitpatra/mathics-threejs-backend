import {
	BoxBufferGeometry,
	BufferAttribute,
	BufferGeometry,
	Color,
	DirectionalLight,
	EdgesGeometry,
	Geometry,
	Line,
	LineBasicMaterial,
	LineSegments,
	Matrix4,
	PerspectiveCamera,
	Scene,
	Vector3,
	WebGLRenderer
} from '../vendors/threejs/three.min.js';

import primitiveFunctions from './primitives.js';
import lightFunctions from './lights.js';
import calculateExtent from './extent.js';
import scaleCoordinate from './scaleCoordinate.js';

export default function (
	container,
	{ axes, elements, lighting, viewpoint },
	maxSize,
	innerWidthMultiplier
) {
	// TODO: shading, handling of VertexNormals

	maxSize ??= 400;
	innerWidthMultiplier ??= 0.65;

	let isCtrlDown, isShiftDown, onMouseDownFocus, onCtrlDownFov,
		hasAxes, isMouseDown = false,
		theta, onMouseDownTheta, phi, onMouseDownPhi,
		canvasSize = Math.min(maxSize, window.innerWidth * innerWidthMultiplier),
		autoRescale = true;

	container.style.width = canvasSize + 'px';
	// to avoid overflow when a tick numbers is out of the parent element
	container.style.height = canvasSize + 10 + 'px';

	const extent = calculateExtent(elements);

	// where the camera is looking (initialized on center of the scene)
	const focus = new Vector3(
		0.5 * (extent.xmin + extent.xmax),
		0.5 * (extent.ymin + extent.ymax),
		0.5 * (extent.zmin + extent.zmax)
	);

	const viewPoint = new Vector3(...viewpoint)
		.multiplyScalar(
			// scale the viewpoint so the camera isn't inside the bounding box
			Math.max(
				extent.xmax - extent.xmin,
				extent.ymax - extent.ymin,
				extent.zmax - extent.zmin
			)
		)
		.sub(focus);

	const radius = viewPoint.length();

	onMouseDownTheta = theta = Math.acos(viewPoint.z / radius);
	onMouseDownPhi = phi = (Math.atan2(viewPoint.y, viewPoint.x) + 2 * Math.PI) % (2 * Math.PI);

	const scene = new Scene();

	const camera = new PerspectiveCamera(
		35,           // field of view
		1,            // aspect ratio
		0.1 * radius, // near plane
		1000 * radius // far plane
	);

	function updateCameraPosition() {
		camera.position.set(
			radius * Math.sin(theta) * Math.cos(phi),
			radius * Math.sin(theta) * Math.sin(phi),
			radius * Math.cos(theta)
		).add(focus);

		camera.lookAt(focus);
	}

	updateCameraPosition();
	camera.up.set(0, 0, 1);

	scene.add(camera);

	function getInitialLightPosition({ coords }) {
		if (!(coords instanceof Array)) {
			return;
		}

		// initial light position in spherical polar coordinates
		const temporaryPosition = new Vector3(
			...(coords[0] ?? scaleCoordinate(coords[1], extent))
		);

		const result = {
			radius: radius * temporaryPosition.length(),
			phi: 0,
			theta: 0
		};

		if (temporaryPosition.length() !== 0) {
			result.phi = (Math.atan2(temporaryPosition.y, temporaryPosition.x) + 2 * Math.PI) % (2 * Math.PI);
			result.theta = Math.asin(temporaryPosition.z / result.radius);
		}

		return result;
	}

	const lights = new Array(lighting.length);
	const initialLightPosition = new Array(lighting.length);

	lighting.forEach((light, i) => {
		initialLightPosition[i] = getInitialLightPosition(light);

		lights[i] = lightFunctions[light.type](light, extent, radius);

		scene.add(lights[i]);
	});

	function positionLights() {
		lights.forEach((light, i) => {
			if (light instanceof DirectionalLight) {
				light.position.set(
					initialLightPosition[i].radius * Math.sin(theta + initialLightPosition[i].theta) * Math.cos(phi + initialLightPosition[i].phi),
					initialLightPosition[i].radius * Math.sin(theta + initialLightPosition[i].theta) * Math.sin(phi + initialLightPosition[i].phi),
					initialLightPosition[i].radius * Math.cos(theta + initialLightPosition[i].theta)
				).add(focus);
			}
		});
	}

	const boundingBox = new LineSegments(
		new EdgesGeometry(new BoxBufferGeometry(
			extent.xmax - extent.xmin,
			extent.ymax - extent.ymin,
			extent.zmax - extent.zmin
		)),
		new LineBasicMaterial({ color: 0x666666 })
	);

	boundingBox.position.copy(focus);

	scene.add(boundingBox);

	// draw the axes
	if (axes.hasaxes instanceof Array) {
		hasAxes = [...axes.hasaxes];
	} else if (typeof axes.hasaxes === 'boolean') {
		hasAxes = [axes.hasaxes, axes.hasaxes, axes.hasaxes];
	} else {
		hasAxes = [false, false, false];
	}

	const axesGeometry = [];
	const axesIndexes = [
		[[0, 5], [1, 4], [2, 7], [3, 6]],
		[[0, 2], [1, 3], [4, 6], [5, 7]],
		[[0, 1], [2, 3], [4, 5], [6, 7]]
	];

	const axesLines = new Array(3);

	const axesVertices = new Float32Array(6);

	for (let i = 0; i < 3; i++) {
		if (hasAxes[i]) {
			axesGeometry[i] = new BufferGeometry();

			axesVertices[0] = boundingBox.geometry.attributes.position.array[axesIndexes[i][0][0] * 3] + boundingBox.position.x;

			axesVertices[1] = boundingBox.geometry.attributes.position.array[axesIndexes[i][0][0] * 3 + 1] + boundingBox.position.y;

			axesVertices[2] = boundingBox.geometry.attributes.position.array[axesIndexes[i][0][0] * 3 + 2] + boundingBox.position.z;

			axesVertices[3] = boundingBox.geometry.attributes.position.array[axesIndexes[i][0][1] * 3] + boundingBox.position.x;

			axesVertices[4] = boundingBox.geometry.attributes.position.array[axesIndexes[i][0][1] * 3 + 1] + boundingBox.position.y;

			axesVertices[5] = boundingBox.geometry.attributes.position.array[axesIndexes[i][0][1] * 3 + 2] + boundingBox.position.z;

			axesGeometry[i].setAttribute('position', new BufferAttribute(axesVertices, 3));

			axesLines[i] = new Line(
				axesGeometry[i],
				new LineBasicMaterial({
					color: 0x000000,
					linewidth: 1.5
				})
			);

			scene.add(axesLines[i]);
		}
	}

	function positionAxes() {
		// automatic axes placement
		let nearJ, nearLength = 10 * radius, farJ, farLength = 0;

		const temporaryVector = new Vector3();

		for (let i = 0; i < 8; i++) {
			temporaryVector.set(
				boundingBox.geometry.attributes.position.array[i * 3] + boundingBox.position.x,
				boundingBox.geometry.attributes.position.array[i * 3 + 1] + boundingBox.position.y,
				boundingBox.geometry.attributes.position.array[i * 3 + 2] + boundingBox.position.z
			).sub(camera.position);

			const temporaryLength = temporaryVector.length();

			if (temporaryLength < nearLength) {
				nearLength = temporaryLength;
				nearJ = i;
			} else if (temporaryLength > farLength) {
				farLength = temporaryLength;
				farJ = i;
			}
		}
		for (let i = 0; i < 3; i++) {
			if (hasAxes[i]) {
				let maxJ, maxLength = 0;

				for (let j = 0; j < 4; j++) {
					if (axesIndexes[i][j][0] !== nearJ &&
						axesIndexes[i][j][1] !== nearJ &&
						axesIndexes[i][j][0] !== farJ &&
						axesIndexes[i][j][1] !== farJ
					) {
						const edge = toCanvasCoords(new Vector3(
							...boundingBox.geometry.attributes.position.array.slice(axesIndexes[i][j][0] * 3, axesIndexes[i][j][0] * 3 + 2)
						)).sub(toCanvasCoords(new Vector3(
							...boundingBox.geometry.attributes.position.array.slice(axesIndexes[i][j][1] * 3, axesIndexes[i][j][1] * 3 + 2)
						)));

						edge.z = 0;

						if (edge.length() > maxLength) {
							maxLength = edge.length();
							maxJ = j;
						}
					}
				}

				axesGeometry[i].attributes.position.array[0] = boundingBox.geometry.attributes.position.array[(axesIndexes[i][maxJ] ?? [0])[0] * 3] + boundingBox.position.x;

				axesGeometry[i].attributes.position.array[1] = boundingBox.geometry.attributes.position.array[(axesIndexes[i][maxJ] ?? [0])[0] * 3 + 1] + boundingBox.position.y;

				axesGeometry[i].attributes.position.array[2] = boundingBox.geometry.attributes.position.array[(axesIndexes[i][maxJ] ?? [0])[0] * 3 + 2] + boundingBox.position.z;

				axesGeometry[i].attributes.position.array[3] = boundingBox.geometry.attributes.position.array[(axesIndexes[i][maxJ] ?? [0, 0])[1] * 3] + boundingBox.position.x;

				axesGeometry[i].attributes.position.array[4] = boundingBox.geometry.attributes.position.array[(axesIndexes[i][maxJ] ?? [0, 0])[1] * 3 + 1] + boundingBox.position.y;

				axesGeometry[i].attributes.position.array[5] = boundingBox.geometry.attributes.position.array[(axesIndexes[i][maxJ] ?? [0, 0])[1] * 3 + 2] + boundingBox.position.z;
			}
		}

		updateAxes();
	}

	// axes ticks
	const tickMaterial = new LineBasicMaterial({
		color: 0x000000,
		linewidth: 1.2
	});
	const ticks = new Array(3),
		ticksSmall = new Array(3),
		tickLength = 0.005 * radius;

	for (let i = 0; i < 3; i++) {
		if (hasAxes[i]) {
			ticks[i] = new Array(axes.ticks[i][0].length);
			ticksSmall[i] = new Array(axes.ticks[i][1].length);

			for (let j = 0; j < axes.ticks[i][0].length; j++) {
				const tickGeometry = new BufferGeometry();

				tickGeometry.setAttribute(
					'position',
					new BufferAttribute(
						new Float32Array(6),
						3
					)
				);

				ticks[i][j] = new Line(tickGeometry, tickMaterial);

				scene.add(ticks[i][j]);
			}

			for (let j = 0; j < axes.ticks[i][1].length; j++) {
				const tickGeometry = new BufferGeometry();

				tickGeometry.setAttribute(
					'position',
					new BufferAttribute(
						new Float32Array(6),
						3
					)
				);

				ticksSmall[i][j] = new Line(tickGeometry, tickMaterial);

				scene.add(ticksSmall[i][j]);
			}
		}
	}

	function getTickDirection(i) {
		const tickDirection = new Vector3();

		if (i === 0) {
			if (0.25 * Math.PI < theta && theta < 0.75 * Math.PI) {
				if (axesGeometry[0].attributes.position.array[2] > boundingBox.position.z) {
					tickDirection.setZ(-tickLength);
				} else {
					tickDirection.setZ(tickLength);
				}
			} else {
				if (axesGeometry[0].attributes.position.array[1] > boundingBox.position.y) {
					tickDirection.setY(-tickLength);
				} else {
					tickDirection.setY(tickLength);
				}
			}
		} else if (i === 1) {
			if (0.25 * Math.PI < theta && theta < 0.75 * Math.PI) {
				if (axesGeometry[1].attributes.position.array[2] > boundingBox.position.z) {
					tickDirection.setZ(-tickLength);
				} else {
					tickDirection.setZ(tickLength);
				}
			} else {
				if (axesGeometry[1].attributes.position.array[0] > boundingBox.position.x) {
					tickDirection.setX(-tickLength);
				} else {
					tickDirection.setX(tickLength);
				}
			}
		} else if (i === 2) {
			if ((0.25 * Math.PI < phi && phi < 0.75 * Math.PI) || (1.25 * Math.PI < phi && phi < 1.75 * Math.PI)) {
				if (axesGeometry[2].attributes.position.array[0] > boundingBox.position.x) {
					tickDirection.setX(-tickLength);
				} else {
					tickDirection.setX(tickLength);
				}
			} else {
				if (axesGeometry[2].attributes.position.array[1] > boundingBox.position.y) {
					tickDirection.setY(-tickLength);
				} else {
					tickDirection.setY(tickLength);
				}
			}
		}

		return tickDirection;
	}

	function updateAxes() {
		for (let i = 0; i < 3; i++) {
			if (hasAxes[i]) {
				const tickDirection = getTickDirection(i);

				for (let j = 0; j < axes.ticks[i][0].length; j++) {
					const value = axes.ticks[i][0][j];

					ticks[i][j].geometry.attributes.position.array[0] = axesGeometry[i].attributes.position.array[0];

					ticks[i][j].geometry.attributes.position.array[1] = axesGeometry[i].attributes.position.array[1];

					ticks[i][j].geometry.attributes.position.array[2] = axesGeometry[i].attributes.position.array[2];

					ticks[i][j].geometry.attributes.position.array[3] = axesGeometry[i].attributes.position.array[0] + tickDirection.x;

					ticks[i][j].geometry.attributes.position.array[4] = axesGeometry[i].attributes.position.array[1] + tickDirection.y;

					ticks[i][j].geometry.attributes.position.array[5] = axesGeometry[i].attributes.position.array[2] + tickDirection.z;

					if (i === 0) {
						ticks[i][j].geometry.attributes.position.array[0] = value;
						ticks[i][j].geometry.attributes.position.array[3] = value;
					} else if (i === 1) {
						ticks[i][j].geometry.attributes.position.array[1] = value;
						ticks[i][j].geometry.attributes.position.array[4] = value;
					} else if (i === 2) {
						ticks[i][j].geometry.attributes.position.array[2] = value;
						ticks[i][j].geometry.attributes.position.array[5] = value;
					}
				}

				for (let j = 0; j < axes.ticks[i][1].length; j++) {
					const value = axes.ticks[i][1][j];

					ticksSmall[i][j].geometry.attributes.position.array[0] = axesGeometry[i].attributes.position.array[0];

					ticksSmall[i][j].geometry.attributes.position.array[1] = axesGeometry[i].attributes.position.array[1];

					ticksSmall[i][j].geometry.attributes.position.array[2] = axesGeometry[i].attributes.position.array[2];

					ticksSmall[i][j].geometry.attributes.position.array[3] = axesGeometry[i].attributes.position.array[0] + tickDirection.x / 2;

					ticksSmall[i][j].geometry.attributes.position.array[4] = axesGeometry[i].attributes.position.array[1] + tickDirection.y / 2;

					ticksSmall[i][j].geometry.attributes.position.array[5] = axesGeometry[i].attributes.position.array[2] + tickDirection.z / 2;

					if (i === 0) {
						ticksSmall[i][j].geometry.attributes.position.array[0] = value;
						ticksSmall[i][j].geometry.attributes.position.array[3] = value;
					} else if (i === 1) {
						ticksSmall[i][j].geometry.attributes.position.array[1] = value;
						ticksSmall[i][j].geometry.attributes.position.array[4] = value;
					} else if (i === 2) {
						ticksSmall[i][j].geometry.attributes.position.array[2] = value;
						ticksSmall[i][j].geometry.attributes.position.array[5] = value;
					}
				}
			}
		}
	}

	updateAxes();

	// axes numbering using divs
	const tickNumbers = new Array(3);

	for (let i = 0; i < 3; i++) {
		if (hasAxes[i]) {
			tickNumbers[i] = new Array(axes.ticks[i][0].length);

			for (let j = 0; j < tickNumbers[i].length; j++) {
				let color = 'black';

				if (i < axes.ticks_style.length) {
					color = new Color(...axes.ticks_style[i]).getStyle();
				}

				tickNumbers[i][j] = document.createElement('div');
				tickNumbers[i][j].innerHTML = axes.ticks[i][2][j]
					.replace('0.', '.');

				// handle minus signs
				if (axes.ticks[i][0][j] >= 0) {
					tickNumbers[i][j].style.paddingLeft = '0.5em';
				} else {
					tickNumbers[i][j].style.paddingLeft = 0;
				}

				tickNumbers[i][j].style.position = 'absolute';
				tickNumbers[i][j].style.fontSize = '0.8em';
				tickNumbers[i][j].style.color = color;

				container.appendChild(tickNumbers[i][j]);
			}
		}
	}

	function toCanvasCoords(position) {
		const temporaryPosition = position.clone().applyMatrix4(
			new Matrix4().multiplyMatrices(
				camera.projectionMatrix,
				camera.matrixWorldInverse
			)
		);

		return new Vector3(
			(temporaryPosition.x + 1) * 200,
			(1 - temporaryPosition.y) * 200,
			(temporaryPosition.z + 1) * 200
		);
	}

	function positionTickNumbers() {
		for (let i = 0; i < 3; i++) {
			if (hasAxes[i]) {
				for (let j = 0; j < tickNumbers[i].length; j++) {
					const tickPosition = toCanvasCoords(
						new Vector3(
							ticks[i][j].geometry.attributes.position.array[0] * 7 - ticks[i][j].geometry.attributes.position.array[3] * 6,

							ticks[i][j].geometry.attributes.position.array[1] * 7 - ticks[i][j].geometry.attributes.position.array[4] * 6,

							ticks[i][j].geometry.attributes.position.array[2] * 7 - ticks[i][j].geometry.attributes.position.array[5] * 6
						)
					).multiplyScalar(canvasSize / maxSize);

					tickNumbers[i][j].style.position = `absolute`;
					tickNumbers[i][j].style.left = `${tickPosition.x}px`;
					tickNumbers[i][j].style.top = `${tickPosition.y}px`;

					if (tickPosition.x < 5 || tickPosition.x > 395 || tickPosition.y < 5 || tickPosition.y > 395) {
						tickNumbers[i][j].style.display = 'none';
					}
					else {
						tickNumbers[i][j].style.display = '';
					}
				}
			}
		}
	}

	// plot the primatives
	elements.forEach((element) => {
		scene.add(primitiveFunctions[element.type](element, extent, canvasSize));
	});

	const renderer = new WebGLRenderer({
		antialias: true,
		alpha: true
	});

	renderer.setSize(canvasSize, canvasSize);
	renderer.setPixelRatio(window.devicePixelRatio);
	container.appendChild(renderer.domElement);

	function render() {
		positionLights();
		renderer.render(scene, camera);
	}

	function scaleInView() {
		camera.updateMatrixWorld(); // without this scaleInView doesn't work

		const proj2d = new Vector3();

		let temporaryFOV = 0;

		for (let i = 0; i < 8; i++) {
			proj2d.set(
				boundingBox.geometry.attributes.position.array[i * 3] + boundingBox.position.x,
				boundingBox.geometry.attributes.position.array[i * 3 + 1] + boundingBox.position.y,
				boundingBox.geometry.attributes.position.array[i * 3 + 2] + boundingBox.position.z
			).applyMatrix4(camera.matrixWorldInverse);

			temporaryFOV = Math.max(
				temporaryFOV,
				114.59 * Math.max(
					Math.abs(Math.atan(proj2d.x / proj2d.z) / camera.aspect),
					Math.abs(Math.atan(proj2d.y / proj2d.z))
				)
			);
		}

		camera.fov = temporaryFOV + 5;
		camera.updateProjectionMatrix();
	}

	function onDocumentMouseDown(event) {
		event.preventDefault();

		isMouseDown = true;
		isShiftDown = false;
		isCtrlDown = false;

		onMouseDownTheta = theta;
		onMouseDownPhi = phi;

		onMouseDownPosition[0] = event.clientX;
		onMouseDownPosition[1] = event.clientY;

		onMouseDownFocus = focus.clone();
	}

	function onDocumentMouseMove(event) {
		event.preventDefault();

		if (isMouseDown) {
			positionTickNumbers();

			if (event.shiftKey) { // pan
				if (!isShiftDown) {
					isShiftDown = true;
					onMouseDownPosition[0] = event.clientX;
					onMouseDownPosition[1] = event.clientY;
					autoRescale = false;
					container.style.cursor = 'move';
				}

				const cameraX = new Vector3(
					- radius * Math.cos(theta) * Math.sin(phi) * (theta < 0.5 * Math.PI ? 1 : -1),
					radius * Math.cos(theta) * Math.cos(phi) * (theta < 0.5 * Math.PI ? 1 : -1),
					0
				).normalize();

				const cameraY = new Vector3().crossVectors(
					new Vector3()
						.subVectors(focus, camera.position)
						.normalize(),
					cameraX
				);

				focus.x = onMouseDownFocus.x + (radius / canvasSize) * (cameraX.x * (onMouseDownPosition[0] - event.clientX) + cameraY.x * (onMouseDownPosition[1] - event.clientY));
				focus.y = onMouseDownFocus.y + (radius / canvasSize) * (cameraX.y * (onMouseDownPosition[0] - event.clientX) + cameraY.y * (onMouseDownPosition[1] - event.clientY));
				focus.z = onMouseDownFocus.z + (radius / canvasSize) * (cameraY.z * (onMouseDownPosition[1] - event.clientY));

				updateCameraPosition();
			} else if (event.ctrlKey) { // zoom
				if (!isCtrlDown) {
					isCtrlDown = true;
					onCtrlDownFov = camera.fov;
					onMouseDownPosition[0] = event.clientX;
					onMouseDownPosition[1] = event.clientY;
					autoRescale = false;
					container.style.cursor = 'crosshair';
				}

				camera.fov = Math.max(
					1,
					Math.min(
						onCtrlDownFov + 20 * Math.atan((event.clientY - onMouseDownPosition[1]) / 50),
						150
					)
				);

				camera.updateProjectionMatrix();
			} else { // spin
				if (isCtrlDown || isShiftDown) {
					onMouseDownPosition[0] = event.clientX;
					onMouseDownPosition[1] = event.clientY;
					isShiftDown = false;
					isCtrlDown = false;
					container.style.cursor = 'pointer';
				}

				phi = 2 * Math.PI * (onMouseDownPosition[0] - event.clientX) / canvasSize + onMouseDownPhi;
				phi = (phi + 2 * Math.PI) % (2 * Math.PI);
				theta = 2 * Math.PI * (onMouseDownPosition[1] - event.clientY) / canvasSize + onMouseDownTheta;
				const epsilon = 1e-12; // prevents spinnging from getting stuck
				theta = Math.max(Math.min(Math.PI - epsilon, theta), epsilon);

				updateCameraPosition();
			}

			render();
		} else {
			container.style.cursor = 'pointer';
		}
	}

	function onDocumentMouseUp(event) {
		event.preventDefault();

		isMouseDown = false;
		container.style.cursor = 'pointer';

		if (autoRescale) {
			scaleInView();
		}

		positionAxes();
		positionTickNumbers();
		render();
	}

	// bind mouse events
	container.addEventListener('mousemove', onDocumentMouseMove);
	container.addEventListener('mousedown', onDocumentMouseDown);
	container.addEventListener('mouseup', onDocumentMouseUp);

	window.addEventListener('resize', () => {
		canvasSize = Math.min(maxSize, window.innerWidth * innerWidthMultiplier);
		container.style.width = canvasSize + 'px';
		// to avoid overflow when a tick numbers is out of the parent element
		container.style.height = canvasSize + 10 + 'px';

		renderer.setSize(canvasSize, canvasSize);
		renderer.setPixelRatio(window.devicePixelRatio);

		positionTickNumbers();
	});

	const onMouseDownPosition = new Int16Array(2);

	updateCameraPosition();
	positionAxes();
	scaleInView();
	render();
	positionTickNumbers();
}
