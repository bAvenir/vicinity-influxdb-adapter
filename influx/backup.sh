# Backup inside docker
## docker exec -it <docker-container> influxd backup -database <mydb_to_backup> -portable -since <timestamp> <output-path-for-dump-in-docker> 
docker exec -it influxdb influxd backup -database longterm -portable /var/lib/influxdb/backup

# Copy backup to host
## docker cp <docker-container>:<output-path-for-dump-in-docker>  <path-for-backup-in-your-host>
docker cp influxdb:/var/lib/influxdb/backup  ./