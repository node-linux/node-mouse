index.js: clean
	cp ./keys.json ./build/d/
	cp ./keys.json ./build
	pnpm exec -r tsc
	esbuild ./src/index.ts --outfile=./build/index.js --bundle --sourcemap --platform=node

clean:
	rm -rf ./build