export default function (elements) {
	const extent = {
		xmin: 0,
		xmax: 0,
		ymin: 0,
		ymax: 0,
		zmin: 0,
		zmax: 0
	};

	elements.forEach((element) => {
		if (
			element.type === 'Arrow' ||
			element.type === 'Cuboid' ||
			element.type === 'Line' ||
			element.type === 'Polygon'
		) {
			element.Coords.forEach((coordinate => {
				if (coordinate[0]) {
					if (coordinate[0][0] < extent.xmin) {
						extent.xmin = coordinate[0][0];
					} else if (coordinate[0][0] > extent.xmax)
						extent.xmax = coordinate[0][0];

					if (coordinate[0][1] < extent.ymin) {
						extent.ymin = coordinate[0][1];
					} else if (coordinate[0][1] > extent.ymax) {
						extent.ymax = coordinate[0][1];
					}

					if (coordinate[0][2] < extent.zmin) {
						extent.zmin = coordinate[0][2];
					} else if (coordinate[0][2] > extent.zmax) {
						extent.zmax = coordinate[0][2];
					}
				}
			}));
		} else if (
			// the extent isn't calculated correctly for cylinders, their extent should be transformationVector * Radius
			element.type === 'Cylinder' ||
			element.type === 'Point' ||
			element.type === 'Sphere'
		) {
			element.Radius ??= element.PointSize

			element.Coords.forEach((coordinate => {
				if (coordinate[0]) {
					if (coordinate[0][0] - element.Radius < extent.xmin) {
						extent.xmin = coordinate[0][0] - element.Radius;
					}
					if (coordinate[0][0] + element.Radius > extent.xmax) {
						extent.xmax = coordinate[0][0] + element.Radius;
					}

					if (coordinate[0][1] - element.Radius < extent.ymin) {
						extent.ymin = coordinate[0][1] - element.Radius;
					}
					if (coordinate[0][1] + element.Radius > extent.ymax) {
						extent.ymax = coordinate[0][1] + element.Radius;
					}

					if (coordinate[0][2] - element.Radius < extent.zmin) {
						extent.zmin = coordinate[0][2] - element.Radius;
					}
					if (coordinate[0][2] + element.Radius > extent.zmax) {
						extent.zmax = coordinate[0][2] + element.Radius;
					}
				}
			}));
		}
	});

	// if it's all zeroes means that no non-scaled coordinate was passed, and so we set the mins to 0 and maxs to 1
	if (
		extent.xmin === 0 &&
		extent.xmax === 0 &&
		extent.ymin === 0 &&
		extent.ymax === 0 &&
		extent.zmin === 0 &&
		extent.zmax === 0
	) {
		extent.xmin = 0;
		extent.ymin = 0;
		extent.zmin = 0;
		extent.xmax = 1;
		extent.ymax = 1;
		extent.zmax = 1;
	}

	return extent;
}
