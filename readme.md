
# Game Idea
The Unicorn is always moving and bounces off of the outside walls
The Unicorn leaves a trail of rainbow colored pixels behind it
The player can draw lines on the board which the unicorn can bounce off of
The goal of the game is to fill the board with rainbow pixels

# Structure
- `javascript/engine.js` — canvas setup, fixed-timestep game loop, input, drawing tools
- `javascript/config.js` —`settings`and`colors`for tuning
- `javascript/background.js` — mcEscher mosaic background, ported from `pattern-generators/generators/mcEscherMosaic.mjs`
- `javascript/grid.js` — a grid of cells, each with a color and its col/row.
- `javascript/effects.js` — confetti particles, sound effects, and the board-completion celebration
- `javascript/game.js` — unicorn physics, wall drawing, ribbon painting, powerups. `gameInit`/`gameUpdate`/`gameRenderPost` run against a single declarative `gs` state object
- `game.lua` + `build.lua` — HTML5 build and deploy
