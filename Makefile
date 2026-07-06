.PHONY: install start dev test backup docker-up docker-down logs

install:
	@cd portfolio-main/server && npm ci

start:
	@cd portfolio-main/server && npm start

dev:
	@cd portfolio-main/server && npm run dev

test:
	@cd portfolio-main/server && npm test

backup:
	@cd portfolio-main/server && npm run backup

docker-up:
	@docker compose up -d

docker-down:
	@docker compose down

logs:
	@docker compose logs -f

lint:
	@npm audit