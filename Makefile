up:
	docker compose -f docker-compose.dev.yml up --build

prune:
	docker system prune -a