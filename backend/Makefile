.PHONY: run test lint clean install

server:
	uvicorn app.main:app --reload --port 8022

test:
	pytest

lint:
	black . --exclude venv
	flake8 .
	black . --check --exclude venv

clean:
	find . -type d -name "__pycache__" -exec rm -r {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type f -name "*.pyd" -delete
	find . -type f -name ".coverage" -delete
	find . -type d -name "*.egg-info" -exec rm -r {} +
	find . -type d -name "*.egg" -exec rm -r {} +
	find . -type d -name ".pytest_cache" -exec rm -r {} +
	find . -type d -name ".mypy_cache" -exec rm -r {} +

install:
	pip3 install -r requirements.txt 
