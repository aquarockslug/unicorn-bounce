const confetti = [];
const randBetween = (a, b) => a + Math.random() * (b - a);
const randomRainbow = () =>
	colors.rainbow[(Math.random() * colors.rainbow.length) | 0];

function confettiBurst(pos, count, speed) {
	if (confetti.length > 500) return;
	for (let i = 0; i < count; i++) {
		const angle = randBetween(0, Math.PI * 2);
		const spd = randBetween(speed * 0.25, speed);
		confetti.push({
			pos: vec2(pos.x, pos.y),
			vel: vec2(Math.cos(angle) * spd, Math.sin(angle) * spd),
			rot: randBetween(0, Math.PI * 2),
			spin: randBetween(-10, 10),
			size: randBetween(3, 7),
			life: randBetween(0.8, 1.8),
			maxLife: 1.8,
			color: randomRainbow(),
		});
	}
}

function confettiRain() {
	if (confetti.length > 500 || confetti.length % 3) return;
	const { x: w } = gridSize;
	confetti.push({
		pos: vec2(randBetween(0, w * settings.squareSize.x), -10),
		vel: vec2(randBetween(-15, 15), randBetween(50, 120)),
		rot: randBetween(0, Math.PI * 2),
		spin: randBetween(-8, 8),
		size: randBetween(3, 6),
		life: randBetween(2.5, 4),
		maxLife: 4,
		color: randomRainbow(),
	});
}

function updateConfetti(dt) {
	for (let i = confetti.length - 1; i >= 0; i--) {
		const c = confetti[i];
		c.life -= dt;
		if (c.life <= 0) {
			confetti.splice(i, 1);
			continue;
		}
		c.vel.y += 90 * dt;
		c.vel.x *= Math.max(0, 1 - dt * 0.6);
		c.pos = c.pos.add(c.vel.multiply(vec2(dt, dt)));
		c.rot += c.spin * dt;
	}
}

function drawConfetti() {
	for (const c of confetti) {
		const a = Math.min(1, c.life / 0.4);
		ctx.save();
		ctx.globalAlpha = a;
		ctx.translate(c.pos.x, c.pos.y);
		ctx.rotate(c.rot);
		ctx.scale(Math.max(0.2, Math.abs(Math.cos(c.rot * 3))), 1);
		setFill(ctx, c.color);
		ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size);
		ctx.restore();
	}
}

const hasAudio = typeof zzfx === 'function';
function playS(params) {
	if (hasAudio) zzfx(...params);
}
function playScreenBounce() {
	playS(settings.sfx.screenBounce);
}
function playWallBounce() {
	playS(settings.sfx.wallBounce);
}
function playPowerup() {
	playS(settings.sfx.powerup);
}
function playFanfare() {
	const { notes, params, delay } = settings.sfx.fanfare;
	notes.forEach((f, i) => {
		setTimeout(
			() => playS([...params.slice(0, 2), f, ...params.slice(3)]),
			i * delay,
		);
	});
}

function celebrateFill() {
	const { x: w, y: h } = gridSize;
	const sw = w * settings.squareSize.x;
	const sh = h * settings.squareSize.y;
	confettiBurst(vec2(sw / 2, sh / 2), 140, 280);
	confettiBurst(vec2(sw / 2, 0), 50, 200);
	confettiBurst(vec2(sw / 2, sh), 50, 200);
	confettiBurst(vec2(0, sh / 2), 50, 200);
	confettiBurst(vec2(sw, sh / 2), 50, 200);
	playFanfare();
}

function drawCelebration(time, celebrateTime) {
	const msg =
		celebrateTime < settings.celebrateLength / 2
			? 'YOU FILLED THE BOARD!'
			: 'SPEED UP!';
	const fadeIn = Math.min(1, celebrateTime / 0.4);
	const fadeOut =
		celebrateTime > 4.4
			? Math.max(0, (settings.celebrateLength - celebrateTime) / 0.6)
			: 1;
	const alpha = fadeIn * fadeOut;
	if (!alpha) return;
	const size = 34 + Math.sin(time * 9) * 5;
	const { x: w, y: h } = gridSize;
	const sw = w * settings.squareSize.x;
	const sh = h * settings.squareSize.y;
	const pos = vec2(sw / 2, sh / 2 - 60);
	ctx.save();
	ctx.translate(0, Math.sin(time * 5) * 4);
	ctx.globalAlpha = alpha * 0.85;
	paletteColor(time * 0.35, waveColor);
	setFill(ctx, waveColor);
	ctx.font = `bold ${size}px monospace`;
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	const tw = ctx.measureText(msg).width;
	ctx.fillRect(pos.x - tw / 2 - 12, pos.y - size / 2 - 8, tw + 24, size + 16);
	ctx.globalAlpha = alpha;
	paletteColor(time * 0.9, waveColor);
	setFill(ctx, waveColor);
	ctx.fillText(msg, pos.x, pos.y);
	ctx.restore();
}
