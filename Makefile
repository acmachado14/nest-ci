rebuild:
	@docker-compose build
.PHONY: rebuild

destroy:
	@docker-compose down -v --rmi local
.PHONY: destroy

server:
	@docker-compose up server
.PHONY: server

migrate:
	@docker-compose up migrate
.PHONY: migrate

start-postgres:
	@docker-compose up -d postgres
.PHONY: start-postgres

setup-postgres-db: start-postgres migrate
.PHONY: setup-postgres-db

tests:
	@docker-compose run tests
.PHONY: tests

lint:
	@docker-compose run lint
.PHONY: lint