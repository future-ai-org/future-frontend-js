.PHONY: clean install build server prod lint

clean:
	rm -rf dist/
	rm -rf build/
	rm -rf coverage/
	rm -rf .next/
	rm -rf out/
	rm -f yarn.lock
	rm -rf node_modules/
	yarn cache clean

install:
	yarn install

build:
	yarn build

server:
	yarn build
	yarn dev

prod:
	yarn build
	yarn start

lint:
	yarn lint
	yarn prettier --write "src/**/*.{js,jsx,ts,tsx,json,css,scss,md}"
