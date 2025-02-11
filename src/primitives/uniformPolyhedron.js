// @ts-check

import {
	BufferAttribute,
	Group,
	InstancedBufferAttribute,
	InstancedBufferGeometry,
	LineSegments,
	Mesh,
	RawShaderMaterial
} from '../../vendors/three.js';

import { getPopulatedCoordinateBuffer } from '../bufferUtils.js';

/**
 * See {@link PrimitiveFunction} for more information about the
 * shape of a primitive function.
 * See {@link https://mathics3.github.io/mathics-threejs-backend/primitives/uniformPolyhedron}
 * for the high-level description of what is being rendered.
 * @type {import('./index.js').PrimitiveFunction}
 */
export default function ({ color = [1, 1, 1], coords, edgeForm = {}, edgeLength = 1, opacity = 1, subType }, uniforms, extent) {
	const polyhedronGeometry = new InstancedBufferGeometry();

	// The magic numbers below are modified from the position attribute of,
	// respectively, TetrahedronBufferGeometry, OctahedronBufferGeometry,
	// DodecahedronBufferGeometry and IcosahedronBufferGeometry.
	// Each number is multiplied by 1.06066019082 (otherwise the radius of the
	// polyhedrons won't be "the same" of a sphere with edgeLength radius).
	// To get them: console.log(new GeometryName().attributes.position.array)

	switch (subType) {
	case 'tetrahedron': {
		const vertexPosition = 0.6123 * edgeLength;

		polyhedronGeometry.setAttribute(
			'position',
			new BufferAttribute(new Float32Array([
				-vertexPosition, -vertexPosition, vertexPosition,
				vertexPosition, vertexPosition, vertexPosition,
				-vertexPosition, vertexPosition, -vertexPosition,

				vertexPosition, -vertexPosition, -vertexPosition,
				-vertexPosition, vertexPosition, -vertexPosition,
				vertexPosition, vertexPosition, vertexPosition,

				vertexPosition, -vertexPosition, -vertexPosition,
				vertexPosition, vertexPosition, vertexPosition,
				-vertexPosition, -vertexPosition, vertexPosition,

				vertexPosition, -vertexPosition, -vertexPosition,
				-vertexPosition, -vertexPosition, vertexPosition,
				-vertexPosition, vertexPosition, -vertexPosition
			]), 3)
		);

		break;
	}
	case 'octahedron': {
		polyhedronGeometry.setAttribute(
			'position',
			new BufferAttribute(new Float32Array([
				0, edgeLength, 0,
				0, 0, edgeLength,
				edgeLength, 0, 0,

				0, 0, edgeLength,
				0, -edgeLength, 0,
				edgeLength, 0, 0,

				0, -edgeLength, 0,
				0, 0, -edgeLength,
				edgeLength, 0, 0,

				0, 0, -edgeLength,
				0, edgeLength, 0,
				edgeLength, 0, 0,

				0, edgeLength, 0,
				0, 0, -edgeLength,
				-edgeLength, 0, 0,

				0, 0, -edgeLength,
				0, -edgeLength, 0,
				-edgeLength, 0, 0,

				0, -edgeLength, 0,
				0, 0, edgeLength,
				-edgeLength, 0, 0,

				0, 0, edgeLength,
				0, edgeLength, 0,
				-edgeLength, 0, 0
			]), 3)
		);

		break;
	}
	case 'dodecahedron': {
		const vertexPosition0 = 0.3784 * edgeLength,
			vertexPosition1 = 0.6123 * edgeLength,
			vertexPosition2 = 0.9908 * edgeLength;

		polyhedronGeometry.setAttribute(
			'position',
			new BufferAttribute(new Float32Array([
				0, vertexPosition0, vertexPosition2,
				vertexPosition1, vertexPosition1, vertexPosition1,
				-vertexPosition1, vertexPosition1, vertexPosition1,

				vertexPosition1, vertexPosition1, vertexPosition1,
				vertexPosition0, vertexPosition2, 0,
				-vertexPosition1, vertexPosition1, vertexPosition1,

				vertexPosition0, vertexPosition2, 0,
				-vertexPosition0, vertexPosition2, 0,
				-vertexPosition1, vertexPosition1, vertexPosition1,

				vertexPosition2, 0, vertexPosition0,
				vertexPosition2, 0, -vertexPosition0,
				vertexPosition1, vertexPosition1, vertexPosition1,

				vertexPosition2, 0, -vertexPosition0,
				vertexPosition1, vertexPosition1, -vertexPosition1,
				vertexPosition1, vertexPosition1, vertexPosition1,

				vertexPosition1, vertexPosition1, -vertexPosition1,
				vertexPosition0, vertexPosition2, 0,
				vertexPosition1, vertexPosition1, vertexPosition1,

				vertexPosition1, -vertexPosition1, -vertexPosition1,
				0, -vertexPosition0, -vertexPosition2,
				vertexPosition2, 0, -vertexPosition0,

				0, -vertexPosition0, -vertexPosition2,
				0, vertexPosition0, -vertexPosition2,
				vertexPosition2, 0, -vertexPosition0,

				0, vertexPosition0, -vertexPosition2,
				vertexPosition1, vertexPosition1, -vertexPosition1,
				vertexPosition2, 0, -vertexPosition0,

				-vertexPosition1, -vertexPosition1, -vertexPosition1,
				-vertexPosition2, 0, -vertexPosition0,
				0, -vertexPosition0, -vertexPosition2,

				-vertexPosition2, 0, -vertexPosition0,
				-vertexPosition1, vertexPosition1, -vertexPosition1,
				0, -vertexPosition0, -vertexPosition2,

				-vertexPosition1, vertexPosition1, -vertexPosition1,
				0, vertexPosition0, -vertexPosition2,
				0, -vertexPosition0, -vertexPosition2,

				-vertexPosition0, -vertexPosition2, 0,
				-vertexPosition1, -vertexPosition1, vertexPosition1,
				-vertexPosition1, -vertexPosition1, -vertexPosition1,

				-vertexPosition1, -vertexPosition1, vertexPosition1,
				-vertexPosition2, 0, vertexPosition0,
				-vertexPosition1, -vertexPosition1, -vertexPosition1,

				-vertexPosition2, 0, vertexPosition0,
				-vertexPosition2, 0, -vertexPosition0,
				-vertexPosition1, -vertexPosition1, -vertexPosition1,

				0, vertexPosition0, -vertexPosition2,
				-vertexPosition1, vertexPosition1, -vertexPosition1,
				vertexPosition1, vertexPosition1, -vertexPosition1,

				-vertexPosition1, vertexPosition1, -vertexPosition1,
				-vertexPosition0, vertexPosition2, 0,
				vertexPosition1, vertexPosition1, -vertexPosition1,

				-vertexPosition0, vertexPosition2, 0,
				vertexPosition0, vertexPosition2, 0,
				vertexPosition1, vertexPosition1, -vertexPosition1,

				-vertexPosition2, 0, -vertexPosition0,
				-vertexPosition2, 0, vertexPosition0,
				-vertexPosition1, vertexPosition1, -vertexPosition1,

				-vertexPosition2, 0, vertexPosition0,
				-vertexPosition1, vertexPosition1, vertexPosition1,
				-vertexPosition1, vertexPosition1, -vertexPosition1,

				-vertexPosition1, vertexPosition1, vertexPosition1,
				-vertexPosition0, vertexPosition2, 0,
				-vertexPosition1, vertexPosition1, -vertexPosition1,

				-vertexPosition1, -vertexPosition1, vertexPosition1,
				0, -vertexPosition0, vertexPosition2,
				-vertexPosition2, 0, vertexPosition0,

				0, -vertexPosition0, vertexPosition2,
				0, vertexPosition0, vertexPosition2,
				-vertexPosition2, 0, vertexPosition0,

				0, vertexPosition0, vertexPosition2,
				-vertexPosition1, vertexPosition1, vertexPosition1,
				-vertexPosition2, 0, vertexPosition0,

				vertexPosition0, -vertexPosition2, 0,
				-vertexPosition0, -vertexPosition2, 0,
				vertexPosition1, -vertexPosition1, -vertexPosition1,

				-vertexPosition0, -vertexPosition2, 0,
				-vertexPosition1, -vertexPosition1, -vertexPosition1,
				vertexPosition1, -vertexPosition1, -vertexPosition1,

				-vertexPosition1, -vertexPosition1, -vertexPosition1,
				0, -vertexPosition0, -vertexPosition2,
				vertexPosition1, -vertexPosition1, -vertexPosition1,

				0, -vertexPosition0, vertexPosition2,
				vertexPosition1, -vertexPosition1, vertexPosition1,
				0, vertexPosition0, vertexPosition2,

				vertexPosition1, -vertexPosition1, vertexPosition1,
				vertexPosition2, 0, vertexPosition0,
				0, vertexPosition0, vertexPosition2,

				vertexPosition2, 0, vertexPosition0,
				vertexPosition1, vertexPosition1, vertexPosition1,
				0, vertexPosition0, vertexPosition2,

				vertexPosition1, -vertexPosition1, vertexPosition1,
				vertexPosition0, -vertexPosition2, 0,
				vertexPosition2, 0, vertexPosition0,

				vertexPosition0, -vertexPosition2, 0,
				vertexPosition1, -vertexPosition1, -vertexPosition1,
				vertexPosition2, 0, vertexPosition0,

				vertexPosition1, -vertexPosition1, -vertexPosition1,
				vertexPosition2, 0, -vertexPosition0,
				vertexPosition2, 0, vertexPosition0,

				-vertexPosition0, -vertexPosition2, 0,
				vertexPosition0, -vertexPosition2, 0,
				-vertexPosition1, -vertexPosition1, vertexPosition1,

				vertexPosition0, -vertexPosition2, 0,
				vertexPosition1, -vertexPosition1, vertexPosition1,
				-vertexPosition1, -vertexPosition1, vertexPosition1,

				vertexPosition1, -vertexPosition1, vertexPosition1,
				0, -vertexPosition0, vertexPosition2,
				-vertexPosition1, -vertexPosition1, vertexPosition1
			]), 3)
		);

		break;
	}
	case 'icosahedron': {
		const vertexPosition0 = 0.5576 * edgeLength,
			vertexPosition1 = 0.9022 * edgeLength;

		polyhedronGeometry.setAttribute(
			'position',
			new BufferAttribute(new Float32Array([
				-vertexPosition1, 0, vertexPosition0,
				0, vertexPosition0, vertexPosition1,
				-vertexPosition0, vertexPosition1, 0,

				0, vertexPosition0, vertexPosition1,
				vertexPosition0, vertexPosition1, 0,
				-vertexPosition0, vertexPosition1, 0,

				vertexPosition0, vertexPosition1, 0,
				0, vertexPosition0, -vertexPosition1,
				-vertexPosition0, vertexPosition1, 0,

				0, vertexPosition0, -vertexPosition1,
				-vertexPosition1, 0, -vertexPosition0,
				-vertexPosition0, vertexPosition1, 0,

				-vertexPosition1, 0, -vertexPosition0,
				-vertexPosition1, 0, vertexPosition0,
				-vertexPosition0, vertexPosition1, 0,

				0, vertexPosition0, vertexPosition1,
				vertexPosition1, 0, vertexPosition0,
				vertexPosition0, vertexPosition1, 0,

				-vertexPosition1, 0, vertexPosition0,
				0, -vertexPosition0, vertexPosition1,
				0, vertexPosition0, vertexPosition1,

				-vertexPosition1, 0, -vertexPosition0,
				-vertexPosition0, -vertexPosition1, 0,
				-vertexPosition1, 0, vertexPosition0,

				0, vertexPosition0, -vertexPosition1,
				0, -vertexPosition0, -vertexPosition1,
				-vertexPosition1, 0, -vertexPosition0,

				vertexPosition0, vertexPosition1, 0,
				vertexPosition1, 0, -vertexPosition0,
				0, vertexPosition0, -vertexPosition1,

				vertexPosition1, 0, vertexPosition0,
				0, -vertexPosition0, vertexPosition1,
				vertexPosition0, -vertexPosition1, 0,

				0, -vertexPosition0, vertexPosition1,
				-vertexPosition0, -vertexPosition1, 0,
				vertexPosition0, -vertexPosition1, 0,

				-vertexPosition0, -vertexPosition1, 0,
				0, -vertexPosition0, -vertexPosition1,
				vertexPosition0, -vertexPosition1, 0,

				0, -vertexPosition0, -vertexPosition1,
				vertexPosition1, 0, -vertexPosition0,
				vertexPosition0, -vertexPosition1, 0,

				vertexPosition1, 0, -vertexPosition0,
				vertexPosition1, 0, vertexPosition0,
				vertexPosition0, -vertexPosition1, 0,

				vertexPosition1, 0, vertexPosition0,
				0, vertexPosition0, vertexPosition1,
				0, -vertexPosition0, vertexPosition1,

				0, -vertexPosition0, vertexPosition1,
				-vertexPosition1, 0, vertexPosition0,
				-vertexPosition0, -vertexPosition1, 0,

				-vertexPosition0, -vertexPosition1, 0,
				-vertexPosition1, 0, -vertexPosition0,
				0, -vertexPosition0, -vertexPosition1,

				0, -vertexPosition0, -vertexPosition1,
				0, vertexPosition0, -vertexPosition1,
				vertexPosition1, 0, -vertexPosition0,

				vertexPosition1, 0, -vertexPosition0,
				vertexPosition0, vertexPosition1, 0,
				vertexPosition1, 0, vertexPosition0
			]), 3)
		);

		break;
	}
	}

	const polyhedronsCenters = getPopulatedCoordinateBuffer(coords, extent);

	polyhedronGeometry.instanceCount = coords.length;

	polyhedronGeometry.setAttribute(
		'polyhedronCenter',
		new InstancedBufferAttribute(polyhedronsCenters, 3)
	);

	const polyhedrons = new Mesh(
		polyhedronGeometry,
		// @ts-expect-error: bad three.js typing
		new RawShaderMaterial({
			transparent: opacity !== 1,
			depthWrite: opacity === 1,
			uniforms,
			vertexShader: `#version 300 es
				in vec3 position;
				in vec3 polyhedronCenter;

				uniform mat4 modelViewMatrix;
				uniform mat4 projectionMatrix;

				out vec3 vViewPosition;

				void main() {
					vec4 mvPosition = modelViewMatrix * vec4(position + polyhedronCenter, 1);

					vViewPosition = -mvPosition.xyz;

					gl_Position = projectionMatrix * mvPosition;
				}
			`,
			fragmentShader: `#version 300 es
				precision mediump float;

				in vec3 vViewPosition;

				uniform vec3 ambientLightColor;

				out vec4 pc_fragColor;

				#define saturate(a) clamp(a, 0.0, 1.0)

				${uniforms.directionalLights.value.length > 0 ? `
					struct IncidentLight {
						vec3 color;
						vec3 direction;
					};

					uniform IncidentLight directionalLights[${uniforms.directionalLights.value.length}];
				` : ''}

				${uniforms.pointLights.value.length > 0 ? `
					struct PointLight {
						vec3 color;
						vec3 position;
					};

					uniform PointLight pointLights[${uniforms.pointLights.value.length}];
				` : ''}

				${uniforms.spotLights.value.length > 0 ? `
					struct SpotLight {
						vec3 color;
						float coneCos;
						vec3 direction;
						vec3 position;
					};

					uniform SpotLight spotLights[${uniforms.spotLights.value.length}];

					void getSpotLightInfo(const in SpotLight spotLight, const in GeometricContext geometry, out IncidentLight light) {
						light.direction = normalize(spotLight.position + vViewPosition);

						light.color = spotLight.color * max(smoothstep(spotLight.coneCos, spotLight.coneCos, dot(light.direction, spotLight.direction)), 0.0);
					}
				` : ''}

				void main() {
					vec3 normal = normalize(cross(dFdx(vViewPosition), dFdy(vViewPosition)));

					vec3 reflectedLight = ambientLightColor;

					${uniforms.directionalLights.value.length > 0 ? `
						for (int i = 0; i < ${uniforms.directionalLights.value.length}; i++) {
							reflectedLight += saturate(dot(normal, directionalLights[i].direction)) * directionalLights[i].color;
						}
					` : ''}

					${uniforms.pointLights.value.length > 0 ? `
						for (int i = 0; i < ${uniforms.pointLights.value.length}; i++) {
							reflectedLight += saturate(dot(
								normal,
								normalize(spotLights[i].position + vViewPosition)
							)) * pointLights[i].color;
						}
					` : ''}

					${uniforms.spotLights.value.length > 0 ? `
						vec3 direction;

						for (int i = 0; i < ${uniforms.spotLights.value.length}; i++) {
							direction = normalize(spotLights[i].position + vViewPosition);

							reflectedLight += saturate(dot(normal, direction))
							* spotLights[i].color
							* max(
								smoothstep(
									spotLights[i].coneCos,
									spotLights[i].coneCos,
									dot(direction, spotLights[i].direction)
								),
								0.0
							);
						}
					` : ''}

					pc_fragColor = vec4(
						reflectedLight * vec3(${color[0]}, ${color[1]}, ${color[2]}),
						${opacity}
					);
				}
			`
		})
	);

	polyhedrons.frustumCulled = false;

	if (edgeForm.showEdges === false) {
		// If the edges aren't shown the work is done.
		return polyhedrons;
	}

	const group = new Group();

	group.add(polyhedrons);

	// The polyhedrons' edges are basicaly the same as the cylinders' ones.

	const edgesGeometry = new InstancedBufferGeometry();

	// The magic numbers below are modified from the position attribute of a
	// three.js EdgesGeometry of the polyhedron.
	// Each number is multiplied by 1.06066019082 (the same multiplier is
	// used in polyhedronGeometry).
	// To get them: console.log(new EdgesGeometry(polyhedronGeometry).attributes.position.array)

	switch (subType) {
	case 'tetrahedron': {
		const vertexPosition = 0.6123 * edgeLength;

		edgesGeometry.setAttribute('position', new BufferAttribute(
			new Float32Array([
				-vertexPosition, vertexPosition, -vertexPosition,
				vertexPosition, vertexPosition, vertexPosition,

				vertexPosition, -vertexPosition, -vertexPosition,
				vertexPosition, vertexPosition, vertexPosition,

				vertexPosition, vertexPosition, vertexPosition,
				-vertexPosition, -vertexPosition, vertexPosition,

				vertexPosition, -vertexPosition, -vertexPosition,
				-vertexPosition, -vertexPosition, vertexPosition,

				-vertexPosition, -vertexPosition, vertexPosition,
				-vertexPosition, vertexPosition, -vertexPosition,

				-vertexPosition, vertexPosition, -vertexPosition,
				vertexPosition, -vertexPosition, -vertexPosition
			]),
			3
		));

		break;
	}
	case 'octahedron': {
		edgesGeometry.setAttribute('position', new BufferAttribute(
			new Float32Array([
				edgeLength, 0, 0,
				0, 0, edgeLength,

				edgeLength, 0, 0,
				0, -edgeLength, 0,

				0, edgeLength, 0,
				edgeLength, 0, 0,

				edgeLength, 0, 0,
				0, 0, -edgeLength,

				0, edgeLength, 0,
				0, 0, -edgeLength,

				0, 0, -edgeLength,
				0, -edgeLength, 0,

				-edgeLength, 0, 0,
				0, 0, -edgeLength,

				0, -edgeLength, 0,
				0, 0, edgeLength,

				-edgeLength, 0, 0,
				0, -edgeLength, 0,

				0, 0, edgeLength,
				0, edgeLength, 0,

				0, edgeLength, 0,
				-edgeLength, 0, 0,

				-edgeLength, 0, 0,
				0, 0, edgeLength
			]),
			3
		));

		break;
	}
	case 'dodecahedron': {
		const vertexPosition0 = 0.3784 * edgeLength,
			vertexPosition1 = 0.6123 * edgeLength,
			vertexPosition2 = 0.9908 * edgeLength;

		edgesGeometry.setAttribute('position', new BufferAttribute(
			new Float32Array([
				vertexPosition0, vertexPosition2, 0,
				vertexPosition1, vertexPosition1, vertexPosition1,

				vertexPosition1, vertexPosition1, -vertexPosition1,
				vertexPosition2, 0, -vertexPosition0,

				0, vertexPosition0, -vertexPosition2,
				0, -vertexPosition0, -vertexPosition2,

				-vertexPosition2, 0, -vertexPosition0,
				-vertexPosition1, -vertexPosition1, -vertexPosition1,

				0, vertexPosition0, -vertexPosition2,
				-vertexPosition1, vertexPosition1, -vertexPosition1,

				vertexPosition1, vertexPosition1, -vertexPosition1,
				0, vertexPosition0, -vertexPosition2,

				-vertexPosition0, vertexPosition2, 0,
				vertexPosition0, vertexPosition2, 0,

				vertexPosition0, vertexPosition2, 0,
				vertexPosition1, vertexPosition1, -vertexPosition1,

				-vertexPosition2, 0, -vertexPosition0,
				-vertexPosition2, 0, vertexPosition0,

				-vertexPosition1, vertexPosition1, -vertexPosition1,
				-vertexPosition2, 0, -vertexPosition0,

				-vertexPosition1, vertexPosition1, vertexPosition1,
				-vertexPosition0, vertexPosition2, 0,

				-vertexPosition0, vertexPosition2, 0,
				-vertexPosition1, vertexPosition1, -vertexPosition1,

				-vertexPosition2, 0, vertexPosition0,
				-vertexPosition1, -vertexPosition1, vertexPosition1,

				0, vertexPosition0, vertexPosition2,
				-vertexPosition1, vertexPosition1, vertexPosition1,

				-vertexPosition1, vertexPosition1, vertexPosition1,
				-vertexPosition2, 0, vertexPosition0,

				-vertexPosition0, -vertexPosition2, 0,
				-vertexPosition1, -vertexPosition1, -vertexPosition1,

				-vertexPosition1, -vertexPosition1, -vertexPosition1,
				0, -vertexPosition0, -vertexPosition2,

				0, -vertexPosition0, -vertexPosition2,
				vertexPosition1, -vertexPosition1, -vertexPosition1,

				0, vertexPosition0, vertexPosition2,
				0, -vertexPosition0, vertexPosition2,

				vertexPosition2, 0, vertexPosition0,
				vertexPosition1, vertexPosition1, vertexPosition1,

				vertexPosition1, vertexPosition1, vertexPosition1,
				0, vertexPosition0, vertexPosition2,

				vertexPosition2, 0, vertexPosition0,
				vertexPosition1, -vertexPosition1, vertexPosition1,

				vertexPosition0, -vertexPosition2, 0,
				vertexPosition1, -vertexPosition1, -vertexPosition1,

				vertexPosition1, -vertexPosition1, -vertexPosition1,
				vertexPosition2, 0, -vertexPosition0,

				vertexPosition2, 0, -vertexPosition0,
				vertexPosition2, 0, vertexPosition0,

				-vertexPosition0, -vertexPosition2, 0,
				vertexPosition0, -vertexPosition2, 0,

				-vertexPosition1, -vertexPosition1, vertexPosition1,
				-vertexPosition0, -vertexPosition2, 0,

				vertexPosition0, -vertexPosition2, 0,
				vertexPosition1, -vertexPosition1, vertexPosition1,

				vertexPosition1, -vertexPosition1, vertexPosition1,
				0, -vertexPosition0, vertexPosition2,

				0, -vertexPosition0, vertexPosition2,
				-vertexPosition1, -vertexPosition1, vertexPosition1
			]),
			3
		));

		break;
	}
	case 'icosahedron': {
		const vertexPosition0 = 0.5576 * edgeLength,
			vertexPosition1 = 0.9022 * edgeLength;

		edgesGeometry.setAttribute('position', new BufferAttribute(
			new Float32Array([
				-vertexPosition0, vertexPosition1, 0,
				0, vertexPosition0, vertexPosition1,

				-vertexPosition0, vertexPosition1, 0,
				vertexPosition0, vertexPosition1, 0,

				-vertexPosition0, vertexPosition1, 0,
				0, vertexPosition0, -vertexPosition1,

				-vertexPosition1, 0, vertexPosition0,
				-vertexPosition0, vertexPosition1, 0,

				-vertexPosition0, vertexPosition1, 0,
				-vertexPosition1, 0, -vertexPosition0,

				vertexPosition0, vertexPosition1, 0,
				0, vertexPosition0, vertexPosition1,

				0, vertexPosition0, vertexPosition1,
				-vertexPosition1, 0, vertexPosition0,

				-vertexPosition1, 0, vertexPosition0,
				-vertexPosition1, 0, -vertexPosition0,

				-vertexPosition1, 0, -vertexPosition0,
				0, vertexPosition0, -vertexPosition1,

				0, vertexPosition0, -vertexPosition1,
				vertexPosition0, vertexPosition1, 0,

				vertexPosition0, -vertexPosition1, 0,
				0, -vertexPosition0, vertexPosition1,

				vertexPosition0, -vertexPosition1, 0,
				-vertexPosition0, -vertexPosition1, 0,

				vertexPosition0, -vertexPosition1, 0,
				0, -vertexPosition0, -vertexPosition1,

				vertexPosition1, 0, vertexPosition0,
				vertexPosition0, -vertexPosition1, 0,

				vertexPosition0, -vertexPosition1, 0,
				vertexPosition1, 0, -vertexPosition0,

				vertexPosition1, 0, vertexPosition0,
				0, vertexPosition0, vertexPosition1,

				0, vertexPosition0, vertexPosition1,
				0, -vertexPosition0, vertexPosition1,

				0, -vertexPosition0, vertexPosition1,
				vertexPosition1, 0, vertexPosition0,

				0, -vertexPosition0, vertexPosition1,
				-vertexPosition1, 0, vertexPosition0,

				-vertexPosition1, 0, vertexPosition0,
				-vertexPosition0, -vertexPosition1, 0,

				-vertexPosition0, -vertexPosition1, 0,
				0, -vertexPosition0, vertexPosition1,

				-vertexPosition0, -vertexPosition1, 0,
				-vertexPosition1, 0, -vertexPosition0,

				-vertexPosition1, 0, -vertexPosition0,
				0, -vertexPosition0, -vertexPosition1,

				0, -vertexPosition0, -vertexPosition1,
				-vertexPosition0, -vertexPosition1, 0,

				0, -vertexPosition0, -vertexPosition1,
				0, vertexPosition0, -vertexPosition1,

				0, vertexPosition0, -vertexPosition1,
				vertexPosition1, 0, -vertexPosition0,

				vertexPosition1, 0, -vertexPosition0,
				0, -vertexPosition0, -vertexPosition1,

				vertexPosition1, 0, -vertexPosition0,
				vertexPosition0, vertexPosition1, 0,

				vertexPosition0, vertexPosition1, 0,
				vertexPosition1, 0, vertexPosition0,

				vertexPosition1, 0, vertexPosition0,
				vertexPosition1, 0, -vertexPosition0

			]),
			3
		));

		break;
	}
	}

	edgesGeometry.instanceCount = coords.length;

	edgesGeometry.setAttribute(
		'polyhedronCenter',
		new InstancedBufferAttribute(polyhedronsCenters, 3)
	);

	edgeForm.color ??= [0, 0, 0];

	const edges = new LineSegments(
		edgesGeometry,
		new RawShaderMaterial({
			vertexShader: `#version 300 es
				in vec3 position;
				in vec3 polyhedronCenter;

				uniform mat4 projectionMatrix;
				uniform mat4 modelViewMatrix;

				void main() {
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position + polyhedronCenter, 1);
				}
			`,
			fragmentShader: `#version 300 es
				out lowp vec4 pc_fragColor;

				void main() {
					pc_fragColor = vec4(
						${edgeForm.color[0]},
						${edgeForm.color[1]},
						${edgeForm.color[2]},
						1
					);
				}
			`
		})
	);

	edges.frustumCulled = false;

	group.add(edges);

	return group;
}
