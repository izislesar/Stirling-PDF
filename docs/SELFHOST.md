# stirling-pdf selfhost notes

PDF toolbox in the browser — merge, split, rotate, OCR, compress.
Stateless (no db), ~400mb ram. Manual runs.

## up

```bash
cp selfhost/.env.example selfhost/.env
docker compose -f selfhost/docker-compose.yml --env-file selfhost/.env up -d
docker logs -f stirling-pdf   # jvm warmup takes a minute
```

open http://localhost:8099, login with the initial creds from .env.

## backup

stateless — nothing to back up except `stirling-config` if you
customize settings:

```bash
docker run --rm -v stirling-config:/c -v $(pwd)/backups:/b alpine \
  tar czf /b/stirling-config-$(date +%F).tar.gz /c
```

## update

pull + up -d. Login config keys change occasionally — check the log
if auth stops working after an update.
