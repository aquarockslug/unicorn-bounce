function Grid(size, pos, initColor, values) {
	const w = Math.floor(size.x);
	const h = Math.floor(size.y);
	const positions = [];
	for (let x = 0.5; x < w; x++)
		for (let y = 0.5; y < h; y++)
			positions.push(vec2(x, y).multiply(settings.squareSize));
	values = values || Array.from({ length: w * h }, () => ({ color: initColor }));
	return {
		values: () => values,
		positions: () => positions,
		center: () =>
			vec2((w * settings.squareSize.x) / 2, (h * settings.squareSize.y) / 2),
		squareUnder(target) {
			const col = Math.floor((target.x - pos.x) / settings.squareSize.x);
			const row = Math.floor((target.y - pos.y) / settings.squareSize.y);
			if (col < 0 || col >= w || row < 0 || row >= h) return { index: -1 };
			return { index: col * h + row };
		},
	};
}