let gs = null;

const resumeAudio = () => {
	if (typeof zzfxX !== 'undefined') zzfxX.resume();
};
window.addEventListener('pointerdown', resumeAudio);

function closestPointOnSegment(p, a, b) {
	const dx = b.x - a.x;
	const dy = b.y - a.y;
	const len2 = dx * dx + dy * dy;
	if (!len2) return a;
	const t = Math.max(
		0,
		Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2),
	);
	return vec2(a.x + dx * t, a.y + dy * t);
}

function collideSegment(uni, a, b) {
	const closest = closestPointOnSegment(uni.pos, a, b);
	const dx = uni.pos.x - closest.x;
	const dy = uni.pos.y - closest.y;
	const dist = Math.hypot(dx, dy);
	if (dist >= uni.radius || !dist) return uni;
	const ux = dx / dist;
	const uy = dy / dist;
	const pos = vec2(closest.x + ux * uni.radius, closest.y + uy * uni.radius);
	const dot = uni.vel.x * ux + uni.vel.y * uy;
	return dot < -0.001
		? {
				...uni,
				pos,
				vel: vec2(uni.vel.x - 2 * dot * ux, uni.vel.y - 2 * dot * uy),
			}
		: { ...uni, pos };
}

function updateUnicorn(unicorn, walls, dt) {
	const { x: maxX, y: maxY } = settings.screenResolution;
	const speed = dt * 60;
	const vel = unicorn.vel;
	const pos = vec2(
		unicorn.pos.x + vel.x * speed,
		unicorn.pos.y + vel.y * speed,
	);
	let next = { ...unicorn, pos, vel };
	if (pos.x < 0 || pos.x > maxX) {
		next.vel = vec2(-vel.x, vel.y);
		next.pos = vec2(Math.max(0, Math.min(maxX, pos.x)), pos.y);
	}
	if (pos.y < 0 || pos.y > maxY) {
		next.vel = vec2(next.vel.x, -vel.y);
		next.pos = vec2(next.pos.x, Math.max(0, Math.min(maxY, pos.y)));
	}
	const removed = [];
	for (const wall of walls || []) {
		const before = next;
		next = collideSegment(next, wall.start, wall.end);
		if (next !== before) removed.push(wall);
	}
	return { unicorn: next, removed };
}

function paintRibbon(grid, pos, brush) {
	const { x: gx, y: gy } = gridSize;
	if (grid.squareUnder(pos).index < 0) return 0;
	const radius = (colors.rainbow.length * settings.ribbonThickness * brush) / 2;
	const cx = pos.x / settings.squareSize.x - 0.5;
	const cy = pos.y / settings.squareSize.y - 0.5;
	let painted = 0;
	for (
		let col = Math.max(0, Math.floor(cx - radius));
		col <= Math.min(gx - 1, Math.ceil(cx + radius));
		col++
	)
		for (
			let row = Math.max(0, Math.floor(cy - radius));
			row <= Math.min(gy - 1, Math.ceil(cy + radius));
			row++
		) {
			const dc = col - cx;
			const dr = row - cy;
			if (dc * dc + dr * dr > radius * radius) continue;
			const cell = grid.cellAt(col, row);
			if (cell.color === colors.background) {
				cell.color = colors.rainbow[(row + col) % colors.rainbow.length];
				painted++;
			}
		}
	return painted;
}

function paletteColor(t, out) {
	const n = colors.rainbow.length;
	const x = (((t % 1) + 1) % 1) * n;
	const i = Math.floor(x);
	const f = x - i;
	const a = colors.rainbow[i];
	const b = colors.rainbow[(i + 1) % n];
	out.r = a.r + (b.r - a.r) * f;
	out.g = a.g + (b.g - a.g) * f;
	out.b = a.b + (b.b - a.b) * f;
	out.a = 1;
	out.css = null;
	return out;
}

const waveColor = new Color(1, 1, 1);

function spawnPowerup() {
	const { x: w, y: h } = gridSize;
	const margin = 2;
	const col = margin + Math.floor(Math.random() * (w - margin * 2));
	const row = margin + Math.floor(Math.random() * (h - margin * 2));
	return {
		pos: vec2(
			(col + 0.5) * settings.squareSize.x,
			(row + 0.5) * settings.squareSize.y,
		),
		radius: settings.powerupRadius,
	};
}

const unicornSprite = document.createElement('canvas');
unicornSprite.width = 640;
unicornSprite.height = 480;
const unicornSpriteCtx = unicornSprite.getContext('2d');
const unicornImage = new Image();
unicornImage.onload = () => unicornSpriteCtx.drawImage(unicornImage, 0, 0);
unicornImage.src =
	'data:image/svg+xml;charset=utf-8,' +
	encodeURIComponent(
		'<?xml version="1.0"?><svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">' +
			'<g><path id="path2909" stroke="#000000" fill="#ff69b1" stroke-width="16" ' +
			'd="m349.62561,438.052338l-334.62561,-28.253998c45.526749,-55.763336 113.677917,-90.203674 141.686264,-150.818481c39.628311,-88.49614 108.150955,-117.372101 166.645432,-165.83905c54.830353,-22.069206 83.876038,-27.477837 140.514404,-26.76091l29.543549,13.620171l15.686523,16.077881l2.549744,6.518074c-1.892761,-5.471275 152.635925,-102.626754 105.635925,-67.626755l-87.265198,112.135132c14.737732,73.344193 21.418945,143.32608 44.213135,220.03302c0,0 0.83252,27.074341 -11.454651,39.857819c-12.287109,12.783936 -61.629211,20.330841 -61.629211,20.330841c0,0 -25.123291,-14.450989 -28.291168,-23.791229c-3.167816,-9.34021 4.775818,-21.660858 4.775818,-21.660858c-27.362396,-38.126129 -55.216675,-56.100616 -103.171478,-86.284515c-21.436981,36.293121 -40.464661,83.408447 -22.813324,162.46286l-2.000153,-20z"/></g></svg>',
	);

function nextBoard() {
	gameInit();
}

function gameInit() {
	gridSize = vec2(
		Math.floor(settings.screenResolution.x / settings.squareSize.x),
		Math.floor(settings.screenResolution.y / settings.squareSize.y),
	);
	const grid = Grid(gridSize, colors.background);
	const board = (gs?.board ?? -1) + 1;
	for (let i = 0; i < board; i++)
		setTimeout(() => playS(settings.sfx.reset), i * 150);
	const speedMultiplier = 1 + board * 0.5;
	const prev = gs?.unicorn;
	const baseVel = settings.unicornVelocity;
	const baseSpeed = Math.hypot(baseVel.x, baseVel.y) || 1;
	const prevSpeed = prev ? Math.hypot(prev.vel.x, prev.vel.y) : baseSpeed;
	const velScale = (baseSpeed * speedMultiplier) / prevSpeed;
	const vel = prev
		? vec2(prev.vel.x * velScale, prev.vel.y * velScale)
		: vec2(baseVel.x * speedMultiplier, baseVel.y * speedMultiplier);
	const pos = prev ? prev.pos : grid.center();
	const angle = prev ? prev.angle : 0;
	const scheme =
		settings.backgroundSchemes[
			Math.floor(Math.random() * settings.backgroundSchemes.length)
		];
	gs = {
		grid,
		walls: [],
		drawing: null,
		lastRibbonPos: pos,
		time: 0,
		filled: false,
		filledCount: 0,
		celebrateTime: 0,
		celebrateLength: settings.celebrateLength,
		powerups: [],
		spawnTimer: 0,
		brushTime: 0,
		board,
		unicorn: {
			pos,
			vel,
			radius: settings.unicornRadius,
			angle,
			spin: settings.unicornSpin,
		},
	};
	cameraPos = grid.center();
	setCanvasFixedSize(settings.screenResolution);
	initEscherBackground(scheme);
	mouseBtn.fill(false);
	confetti.length = 0;
}

function gameUpdate(dt) {
	const mouse = mouseIsDown(0);
	if (mouse && !gs.drawing)
		gs.drawing = {
			start: screenToWorld(mousePos),
			end: screenToWorld(mousePos),
		};
	else if (mouse) gs.drawing.end = screenToWorld(mousePos);
	else if (gs.drawing) {
		if (gs.drawing.start.distance(gs.drawing.end) > settings.minWallLength) {
			gs.walls.push(gs.drawing);
			playS(settings.sfx.draw);
		}
		gs.drawing = null;
	}

	const prevVel = gs.unicorn.vel;
	const { unicorn, removed } = updateUnicorn(gs.unicorn, gs.walls, dt);
	const walls = gs.walls.filter((wall) => !removed.includes(wall));
	if (unicorn.vel.x !== prevVel.x || unicorn.vel.y !== prevVel.y) {
		if (removed.length) {
			confettiBurst(unicorn.pos, 14, 140);
			playWallBounce();
		} else {
			confettiBurst(unicorn.pos, 7, 80);
			playScreenBounce();
		}
	}

	const baseSpeed = Math.hypot(
		settings.unicornVelocity.x,
		settings.unicornVelocity.y,
	);
	const speed = Math.hypot(unicorn.vel.x, unicorn.vel.y);
	const spinTarget = settings.unicornSpin * (speed / baseSpeed);
	let spin = gs.unicorn.spin;
	if (prevVel.x * unicorn.vel.x + prevVel.y * unicorn.vel.y < -0.001)
		spin = -spin;
	spin = Math.sign(spin || 1) * spinTarget;
	const angle = gs.unicorn.angle + spin * dt;

	const time = gs.time + dt;
	updateConfetti(dt);

	let brushTime = Math.max(0, gs.brushTime - dt);
	let powerups = gs.powerups;
	if (powerups.length < settings.maxPowerups) {
		gs.spawnTimer -= dt;
		if (gs.spawnTimer <= 0) {
			powerups = [...powerups, spawnPowerup()];
			gs.spawnTimer = settings.powerupSpawnInterval;
		}
	}
	const collected = [];
	for (const powerup of powerups) {
		if (unicorn.pos.distance(powerup.pos) < unicorn.radius + powerup.radius) {
			brushTime = settings.powerupDuration;
			collected.push(powerup);
		}
	}
	if (collected.length) {
		const gone = new Set(collected);
		powerups = powerups.filter((p) => !gone.has(p));
		confettiBurst(unicorn.pos, 18, 170);
		playPowerup();
	}
	const brush = brushTime > 0 ? settings.powerupBrushScale : 1;

	const from = gs.lastRibbonPos;
	const dist = from.distance(unicorn.pos);
	const steps = Math.max(1, Math.ceil(dist / (settings.squareSize.x * 0.5)));
	let painted = 0;
	for (let i = 0; i <= steps; i++) {
		const t = i / steps;
		painted += paintRibbon(
			gs.grid,
			vec2(
				from.x + (unicorn.pos.x - from.x) * t,
				from.y + (unicorn.pos.y - from.y) * t,
			),
			brush,
		);
	}

	let filled = gs.filled;
	let justFilled = false;
	if (!filled) {
		const cells = gs.grid.values();
		const missing = cells.length - gs.filledCount - painted;
		if (missing <= cells.length * (1 - settings.fillThreshold)) {
			for (const cell of cells) {
				if (cell.color !== colors.background) continue;
				cell.color =
					colors.rainbow[(cell.row + cell.col) % colors.rainbow.length];
				painted++;
			}
			filled = true;
			justFilled = true;
		}
	}
	for (const cell of gs.grid.values()) {
		if (cell.color === colors.background) continue;
		const neighbors = [
			gs.grid.cellAt(cell.col - 1, cell.row),
			gs.grid.cellAt(cell.col + 1, cell.row),
			gs.grid.cellAt(cell.col, cell.row - 1),
			gs.grid.cellAt(cell.col, cell.row + 1),
		];
		const exposed = neighbors.some((n) => !n || n.color === colors.background);
		const decayChance =
			settings.cellDecayRate *
			(exposed ? settings.cellDecayEdgeBoost : 1) *
			(gs.board + 1) *
			dt;
		if (Math.random() < decayChance) cell.color = colors.background;
	}
	if (justFilled) celebrateFill();
	if (filled && Math.random() < dt * 30) confettiRain();
	const celebrateTime = filled ? gs.celebrateTime + dt : 0;
	if (celebrateTime >= gs.celebrateLength) {
		nextBoard();
		return;
	}

	gs = {
		...gs,
		unicorn: { ...unicorn, angle, spin },
		walls,
		lastRibbonPos: unicorn.pos,
		time,
		filled,
		filledCount: gs.filledCount + painted,
		celebrateTime,
		powerups,
		spawnTimer: gs.spawnTimer,
		brushTime,
	};
}

const powerupGlow = new Color(
	colors.powerup.r,
	colors.powerup.g,
	colors.powerup.b,
	0.3,
);
const boostGlow = new Color(1, 0.41, 0.71, 0.35);

function drawPowerup(p, time) {
	const pulse = 1 + Math.sin(time * 6) * 0.15;
	drawCircle(p.pos, p.radius * 1.7, powerupGlow);
	drawCircle(p.pos, p.radius * pulse, colors.powerup);
}

function gameRenderPost() {
	drawBackground();
	const { x: width, y: height } = gridSize;
	const { x: sw, y: sh } = settings.squareSize;
	const cells = gs.grid.values();

	if (gs.filled) {
		for (const cell of cells) {
			const hue =
				((cell.row + cell.col) / (width + height) +
					gs.time * settings.celebrationSpeed) %
				1;
			paletteColor(hue, waveColor);
			setFill(ctx, waveColor);
			ctx.fillRect(cell.col * sw, cell.row * sh, sw, sh);
		}
	} else {
		for (const cell of cells) {
			if (cell.color === colors.background) continue;
			setFill(ctx, cell.color);
			ctx.fillRect(cell.col * sw, cell.row * sh, sw, sh);
		}
	}

	for (const wall of gs.walls) {
		drawLine(wall.start, wall.end, C(1, 1, 1), settings.wallWidth);
		drawLine(wall.start, wall.end, colors.wall, settings.wallWidth / 2);
	}
	if (gs.drawing)
		drawLine(
			gs.drawing.start,
			gs.drawing.end,
			colors.draft,
			settings.draftWidth,
		);

	const { pos, radius } = gs.unicorn;
	if (gs.brushTime > 0) drawCircle(pos, radius * 1.6, boostGlow);
	drawCircle(pos, radius, colors.unicorn);
	if (unicornImage.complete && unicornImage.naturalWidth) {
		const scale = (radius * 3) / unicornSprite.width;
		ctx.save();
		ctx.translate(pos.x, pos.y);
		ctx.rotate(gs.unicorn.angle);
		ctx.scale(scale, scale);
		ctx.drawImage(
			unicornSprite,
			-unicornSprite.width / 2,
			-unicornSprite.height / 2,
		);
		ctx.restore();
	}
	for (const powerup of gs.powerups) drawPowerup(powerup, gs.time);
	if (gs.filled) drawCelebration(gs.time, gs.celebrateTime);
	drawConfetti();
	if (gs.brushTime > 0)
		drawText(
			`POWERUP! ${Math.ceil(gs.brushTime)}`,
			vec2(gridSize.x * settings.squareSize.x - 16, 10),
			colors.unicorn,
			24,
			'right',
			colors.hudPanel,
		);
	let fillPercent = Math.floor(
		(gs.filledCount / (gridSize.x * gridSize.y)) * 100,
	);
	drawText(
		`${fillPercent}% filled`,
		vec2(10, 10),
		colors.background,
		24,
		'left',
		colors.hudPanel,
	);
}

engineInit(gameInit, gameUpdate, gameRenderPost);
