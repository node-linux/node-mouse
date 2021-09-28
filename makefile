index.js: clean
	cp ./keys.json ./build/d/keys.json
	cp ./keys.json ./build/keys.json
	pnpm exec -r tsc
	esbuild ./src/index.ts --outfile=./build/index.js --bundle --sourcemap --platform=node

clean:
	rm -rf ./build