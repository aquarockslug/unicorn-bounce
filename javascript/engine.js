function vec2(x, y = x) {
	return {
		x,
		y,
		add(v) { return vec2(this.x + v.x, this.y + v.y); },
		subtract(v) { return vec2(this.x - v.x, this.y - v.y); },
		multiply(v) { return vec2(this.x * v.x, this.y * v.y); },
		divide(v) { return vec2(this.x / v.x, this.y / v.y); },
		distance(v) { return Math.hypot(v.x - this.x, v.y - this.y); },
		angle() { return Math.atan2(this.x, this.y); },
	};
}

function Color(r, g, b, a = 1) {
	this.r = r;
	this.g = g;
	this.b = b;
	this.a = a;
}

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.prepend(canvas);

let canvasW, canvasH;
function setCanvasFixedSize(size) {
	canvasW = size.x;
	canvasH = size.y;
	canvas.width = size.x;
	canvas.height = size.y;
}

let cameraScale = 1;
let cameraPos = vec2(0, 0);
let mousePos = vec2(0, 0);
const mouseBtn = [false, false, false];

canvas.addEventListener('mousemove', (e) => {
	const rect = canvas.getBoundingClientRect();
	mousePos = vec2(
		(e.clientX - rect.left) * (canvasW / rect.width),
		(e.clientY - rect.top) * (canvasH / rect.height),
	);
});
canvas.addEventListener('mousedown', (e) => (mouseBtn[e.button] = true));
canvas.addEventListener('mouseup', (e) => (mouseBtn[e.button] = false));
canvas.addEventListener('mouseleave', () => mouseBtn.fill(false));

const mouseIsDown = (b) => mouseBtn[b] || false;
const screenToWorld = (v) =>
	vec2(
		(v.x - canvasW / 2) / cameraScale + cameraPos.x,
		(v.y - canvasH / 2) / cameraScale + cameraPos.y,
	);

// CSS strings are cached on color objects, and fillStyle/strokeStyle are only
// re-assigned when the color actually changed.
const cssOf = (c) =>
	(c.css ??= `rgba(${c.r * 255 | 0},${c.g * 255 | 0},${c.b * 255 | 0},${c.a})`);
const setFill = (c, color) => {
	const css = cssOf(color);
	if (c._lastFill !== css) c.fillStyle = c._lastFill = css;
};
const setStroke = (c, color) => {
	const css = cssOf(color);
	if (c._lastStroke !== css) c.strokeStyle = c._lastStroke = css;
};

function drawRect(pos, size, color) {
	setFill(ctx, color);
	ctx.fillRect(pos.x - size.x / 2, pos.y - size.y / 2, size.x, size.y);
}

function drawCircle(pos, radius, color) {
	setFill(ctx, color);
	ctx.beginPath();
	ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
	ctx.fill();
}

function drawLine(start, end, color, width) {
	setStroke(ctx, color);
	ctx.lineWidth = width || 3;
	ctx.lineCap = 'round';
	ctx.beginPath();
	ctx.moveTo(start.x, start.y);
	ctx.lineTo(end.x, end.y);
	ctx.stroke();
}

function drawSky(top, bottom) {
	ctx.save();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	const gradient = ctx.createLinearGradient(0, 0, 0, canvasH);
	gradient.addColorStop(0, cssOf(top));
	gradient.addColorStop(1, cssOf(bottom));
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, canvasW, canvasH);
	ctx.restore();
}

function drawText(text, pos, color, size, align, panel) {
	ctx.save();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.font = `bold ${size || 20}px monospace`;
	ctx.textAlign = align || 'left';
	ctx.textBaseline = 'top';
	if (panel) {
		const w = ctx.measureText(text).width;
		const pad = 8;
		let x0 = pos.x;
		let x1 = pos.x + w;
		if (align === 'right') {
			x0 = pos.x - w;
			x1 = pos.x;
		} else if (align === 'center') {
			x0 = pos.x - w / 2;
			x1 = pos.x + w / 2;
		}
		setFill(ctx, panel);
		ctx.fillRect(x0 - pad, pos.y - pad / 2, x1 - x0 + pad * 2, size + pad);
	}
	setFill(ctx, color);
	ctx.fillText(text, pos.x, pos.y);
	ctx.restore();
}

// Fixed timestep: update() always sees the same dt; if rendering falls behind,
// several steps run per frame instead of letting the sim drift.
const FIXED_TIMESTEP = 1 / 60;
const MAX_STEPS = 16;

function engineInit(init, update, render) {
	init();
	let lastTime = performance.now();
	let accumulator = 0;
	function loop(now) {
		const frameTime = Math.min((now - lastTime) / 1000, 0.25);
		lastTime = now;
		accumulator += frameTime;
		let steps = 0;
		while (accumulator >= FIXED_TIMESTEP && steps < MAX_STEPS) {
			update(FIXED_TIMESTEP);
			accumulator -= FIXED_TIMESTEP;
			steps++;
		}
		if (steps === MAX_STEPS) accumulator = 0;
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvasW, canvasH);
		ctx.setTransform(
			cameraScale,
			0,
			0,
			cameraScale,
			canvasW / 2 - cameraPos.x * cameraScale,
			canvasH / 2 - cameraPos.y * cameraScale,
		);
		render();
		requestAnimationFrame(loop);
	}
	requestAnimationFrame(loop);
}