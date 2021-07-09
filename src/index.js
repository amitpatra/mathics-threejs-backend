import drawGraphics3d from './graphics3d.js';

// it'll be removed on Mathics Core update
window.drawGraphics3d = (object) => {
	object.elements.forEach((primitive) => {
		if (primitive.faceColor) {
			primitive.color = primitive.faceColor;
		}
	});

	object.lighting.forEach((light) => {
		if (light.position) {
			light.coords = [light.position];
		}

		light.type.toLowerCase();
	});

	return drawGraphics3d(object);
};

export default drawGraphics3d;
