.PHONY: clean install build server lint

clean:
	rm -rf dist/
	rm -rf build/
	rm -rf coverage/
	rm -rf .next/
	rm -rf out/
	rm -rf node_modules/
	yarn cache clean
	rm -f yarn.lock

install:
	yarn install

build:
	yarn build

dev:
	yarn build
	yarn dev

prod:
	yarn build
	yarn start

lint:
	yarn lint
	yarn prettier --write "src/**/*.{js,jsx,ts,tsx,json,css,scss,md}"
