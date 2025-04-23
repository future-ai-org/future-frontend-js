.PHONY: build install server clean lint check format test

install:
	yarn install

build:
	yarn build

server:
	yarn start

clean:
	rm -rf dist/
	rm -rf build/
	rm -rf coverage/
	rm -rf .next/
	rm -rf out/
	rm -rf node_modules/
	yarn cache clean
	rm -f yarn.lock

lint:
	yarn lint

check:
	yarn tsc --noEmit

format:
	yarn prettier --write "src/**/*.{js,jsx,ts,tsx,json,css,scss,md}"

test:
	yarn test
