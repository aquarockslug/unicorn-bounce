// M. C. Escher mosaic background.
// Ported from https://github.com/SebastianSimon/pattern-generators

const escherTileSize = 32;

function generateEscherPattern(target, options) {
	const {
		color1 = '#562a51',
		color2 = '#2d445c',
		width,
		height,
		maxAmplitude = 12,
	} = options || {};
	const cCount = 10;
	const randCurveSamples = 90;
	const sf = Array.from({ length: cCount }, () => ({
		s: Math.random(),
		randomAmplitude: Math.random() * maxAmplitude,
	}));
	const randCurve = Array.from({ length: randCurveSamples }, (_, i) =>
		sf.reduce(
			(sum, { s, randomAmplitude }) => sum + Math.sin(i * s) * randomAmplitude,
			0,
		),
	);
	const ctx = target.getContext('2d');
	target.width = width;
	target.height = height;
	ctx.fillStyle = '#000000';
	ctx.fillRect(0, 0, width, height);
	ctx.translate(width, 0);
	ctx.scale(-1, 1);
	for (let y = -31.5; y < height + 48.5; y += escherTileSize) {
		for (let x = -31.5; x < width + 48.5; x += escherTileSize) {
			const stroke = [color1, color2][
				Math.abs((x - 0.5) / escherTileSize + (y - 0.5) / escherTileSize) % 2
			];
			ctx.strokeStyle = stroke;
			ctx.fillStyle = stroke;
			ctx.beginPath();
			randCurve.forEach((a, i) => {
				ctx.lineTo(
					Math.cos((i * Math.PI) / 45) * (a + 36) + x,
					Math.sin((i * Math.PI) / 45) * (a + 36) + y,
				);
			});
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}
	}
}

const escherBackground = document.createElement('canvas');
let escherBackgroundReady = false;

function initEscherBackground(scheme) {
	const { enabled } = settings.escher;
	if (!enabled) return;
	const palette = scheme || settings.escher;
	generateEscherPattern(escherBackground, {
		width: canvasW,
		height: canvasH,
		color1: palette.color1,
		color2: palette.color2,
		maxAmplitude: settings.escher.maxAmplitude,
	});
	escherBackgroundReady = true;
}

function drawBackground() {
	if (!escherBackgroundReady) {
		drawSky(colors.sky.top, colors.sky.bottom);
		return;
	}
	ctx.save();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.drawImage(escherBackground, 0, 0);
	ctx.restore();
}
