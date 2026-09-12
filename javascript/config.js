const C = (...a) => new Color(...a);

settings = {
	screenResolution: vec2(640, 480),
	squareSize: vec2(6),
	ribbonThickness: 1,
	fillThreshold: 0.99,
	celebrationSpeed: 0.2,
	unicornVelocity: vec2(3, 0),
	unicornRadius: 20,
	unicornSpin: 1,
	minWallLength: 8,
	wallWidth: 8,
	draftWidth: 4,
	powerupRadius: 16,
	powerupDuration: 8,
	powerupSpawnInterval: 5,
	powerupBrushScale: 3,
	maxPowerups: 2,
	// biome-ignore format: sfx
	sfx: {
		bounce: [0.25, 0.08, 300, 0.005, 0.04, 0.09, 1, 1, -80, 0, 0, 0, 0, 0, 0, 0, 0, 1],
		powerup: [0.6, 0.05, 660, 0.01, 0.08, 0.25, 1, 1, 140, 80, 0, 0, 0, 0, 0, 0, 0, 1],
		fanfare: {
			notes: [523.25, 659.25, 783.99, 1046.5, 1318.5],
			params: [0.6, 0.03, 0, 0.01, 0.14, 0.3, 1, 1, -60, 0, 0, 0, 0, 0, 0, 0, 0, 1],
			delay: 95,
		},
	},
};

colors = {
	background: C(1, 1, 1),
	sky: { top: C(0.29, 0.55, 0.86), bottom: C(0.85, 0.94, 1) },
	unicorn: C(1, 0.41, 0.71),
	wall: C(0.2, 0.2, 0.25),
	draft: C(1.0, 0.1, 0.1, 0.6),
	powerup: C(1, 0.85, 0.15),
	hudPanel: C(0.12, 0.12, 0.16, 0.75),
	rainbow: [
		C(1, 0.55, 0.65),
		C(1, 0.72, 0.42),
		C(0.98, 0.9, 0.42),
		C(0.55, 0.9, 0.55),
		C(0.4, 0.7, 0.96),
		C(0.76, 0.55, 0.93),
	],
};
