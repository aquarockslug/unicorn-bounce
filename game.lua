local M   = {}

M.title   = "Unicorn Bounce"

M.files   = {
	"javascript/lib/ZzFXMicro.min.js",
	"javascript/engine.js",
	"javascript/config.js",
	"javascript/background.js",
	"javascript/grid.js",
	"javascript/effects.js",
	"javascript/game.js",
}

M.output  = "dist/index.html"

M.publish = true
M.channel = "aquarock/unicorn-bounce:html5"

return M
