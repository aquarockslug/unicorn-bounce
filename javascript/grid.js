function Grid(size, initColor) {
	const w = Math.floor(size.x);
	const h = Math.floor(size.y);
	const cells = [];
	for (let col = 0; col < w; col++)
		for (let row = 0; row < h; row++)
			cells.push({ color: initColor, col, row });

	const at = (col, row) =>
		col < 0 || col >= w || row < 0 || row >= h
			? undefined
			: cells[col * h + row];

	return {
		width: w,
		height: h,
		values: () => cells,
		center: () =>
			vec2((w * settings.squareSize.x) / 2, (h * settings.squareSize.y) / 2),
		cellAt: at,
		setCell(col, row, color) {
			const cell = at(col, row);
			if (cell) cell.color = color;
		},
		squareUnder(target) {
			const col = Math.floor(target.x / settings.squareSize.x);
			const row = Math.floor(target.y / settings.squareSize.y);
			const cell = at(col, row);
			return { cell, col, row, index: cell ? col * h + row : -1 };
		},
	};
}
