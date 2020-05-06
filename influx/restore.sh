## START ##

# 1 Add back ups in the folder PWD/data/backups (Create it if it does not exist)

# 2 Log into docker influx
## docker exec -it influxdb bash

# 3 Restore db (WITHIN docker container AND if in LINUX do --> chown influxdb:influxdb -R backups/ )
## influxd restore -portable -db longterm  -newdb longterm_bak /var/lib/influxdb/backups
## exit

# 4 Copy temp db into your longterm db (Again from your host machine)
# curl -i -XPOST http://localhost:8086/query -u admin:admin --data-urlencode "q=SELECT * INTO longterm.autogen.:MEASUREMENT FROM longterm_bak.autogen./.*/ GROUP BY *"

# 5 Drop temp db
# curl -i -XPOST http://localhost:8086/query -u admin:admin --data-urlencode "q=DROP DATABASE telegraf_bak"

## END ##

#### OLD STUFF ####
## Restore db to influx conainer
#   docker run --rm \
#     --entrypoint /bin/bash \
#     -v <influx_data_dir>:/var/lib/influxdb \
#     -v <local_backup>:/backups \
#     influxdb:latest \
#     -c "influxd restore -metadir /var/lib/influxdb/meta -datadir /var/lib/influxdb/data -database <DB_NAME> /backups/<BACKUP_DIR_NAME>"
