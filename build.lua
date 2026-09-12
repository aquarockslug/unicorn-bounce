local M = {}

local function ensure_parent_dir(path)
	local dir = path:match("^(.*)/")
	if dir and dir ~= "" then
		os.execute("mkdir -p " .. dir)
	end
end

function M.deploy(game)
	local scripts = {}
	for _, path in ipairs(game.files or {}) do
		local f = io.open(path, "r")
		if f then
			table.insert(scripts, f:read("*all"))
			f:close()
		else
			print("Warning: missing " .. path .. ", skipping")
		end
	end

	local html = "<!doctype html><body>\n"
	for _, s in ipairs(scripts) do
		html = html .. "  <script>\n" .. s .. "\n  </script>\n"
	end
	html = html .. "</body>\n"

	ensure_parent_dir(game.output)
	local out = io.open(game.output, "w")
	if out then
		out:write(html)
		out:close()
		print("Created " .. game.output)
	else
		print("Error: could not write " .. game.output)
		return
	end

	os.execute "minify --html-keep-document-tags -i dist/index.html"

	if game.publish and game.channel then
		os.execute("butler push " .. game.output .. " " .. game.channel)
	end

	os.execute("wc -l " .. game.output)
end

local self_path = debug.getinfo(1, "S").source:sub(2)
if arg and arg[0] and arg[0]:match(self_path:gsub("%.", "%%.") .. "$") then
	local game = require "game"
	M.deploy(game)
end

return M
