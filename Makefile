.PHONY: clean install build server prod lint

# Run all commands in a single shell session
.ONESHELL:
SHELL := /bin/zsh
.SHELLFLAGS := -l -c

# Initialize Node.js environment and verify it's available
INIT_NODE = [ -d ~/.nvm ] && export NVM_DIR="$$HOME/.nvm" && [ -s "$$NVM_DIR/nvm.sh" ] && . "$$NVM_DIR/nvm.sh" || true; \
	command -v fnm >/dev/null 2>&1 && eval "$$(fnm env)" || true; \
	[ -d ~/.asdf ] && . ~/.asdf/asdf.sh || true; \
	[ -f ~/.zshrc ] && source ~/.zshrc 2>/dev/null || true; \
	[ -f ~/.zprofile ] && source ~/.zprofile 2>/dev/null || true; \
	if ! command -v node >/dev/null 2>&1; then \
		echo "Error: Node.js is not available. Please install Node.js:"; \
		echo "  brew install node"; \
		echo "  or visit https://nodejs.org/"; \
		exit 1; \
	fi

clean:
	set -e
	$(INIT_NODE)
	rm -rf dist/ build/ coverage/ .next/ out/
	rm -f yarn.lock
	rm -rf node_modules/
	yarn cache clean

install:
	set -e
	$(INIT_NODE)
	yarn install

build:
	set -e
	$(INIT_NODE)
	[ -d node_modules ] || yarn install
	yarn build

server: install
	set -e
	$(INIT_NODE)
	[ -d node_modules ] || yarn install
	yarn build
	yarn dev

prod:
	set -e
	$(INIT_NODE)
	[ -d node_modules ] || yarn install
	yarn build
	yarn start

lint:
	set -e
	$(INIT_NODE)
	[ -d node_modules ] || yarn install
	yarn lint
	yarn prettier --write "src/**/*.{js,jsx,ts,tsx,json,css,scss,md}"
