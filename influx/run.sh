#!/bin/bash
USAGE="$(basename "$0") [-h -s] [-p path]
-- Runs InfluxDB
-- Examples
./init.sh -p /some/path
Where:
  Flags:
      -h  shows help
      -s  enables encrypted communication
  Options with argument:
      -p  <path> [ current dir default ] [ OPTIONAL ] "

# Default configuration
DIR=$(pwd)
OS=$(uname)
SSL="false"

# Get configuration
while getopts 'hd:sd:p:' OPTION; do
  case "$OPTION" in
    h)
      echo "$USAGE"
      exit 0
      ;;
    s)
      SSL="true"
      ;;
    p)
      DIR="$OPTARG"
      ;;
  esac
done

# Stop old influx containers
docker kill influxdb
docker rm influxdb

if [ ${OS} == "Linux" ]; then
    # Linux (Using UID of user created)
    MYUID=$(id -u influxdb)
    echo "Running in Linux with user "$MYUID
        if [ ${SSL} == "true" ]; then
            docker run  -d -p 8086:8086 --restart always --user ${MYUID}:${MYUID} --name=influxdb -v $DIR/configuration/influxdb.conf:/etc/influxdb/influxdb.conf:ro -v $DIR/data:/var/lib/influxdb \
            -v $DIR/ssl/:/etc/ssl \
            --mount type=bind,source=/etc/letsencrypt/live/grafana.bavenir.eu/privkey.pem,target=/etc/ssl/influxdb-key.pem,readonly \
            --mount type=bind,source=/etc/letsencrypt/live/grafana.bavenir.eu/fullchain.pem,target=/etc/ssl/influxdb-cert.pem,readonly \
            influxdb -config /etc/influxdb/influxdb.conf
        else
            docker run  -d -p 8086:8086 --restart always --user ${MYUID}:${MYUID} --name=influxdb -v $DIR/configuration/influxdb.conf:/etc/influxdb/influxdb.conf:ro -v $DIR/data:/var/lib/influxdb \
            -v $DIR/ssl/:/etc/ssl \
            influxdb -config /etc/influxdb/influxdb.conf
        fi
else

    # Mac
    docker run -d -p 8086:8086 --name=influxdb \
    -v $DIR/configuration/influxdb.conf:/etc/influxdb/influxdb.conf:ro \
    -v $DIR/data:/var/lib/influxdb \
    influxdb -config /etc/influxdb/influxdb.conf

 fi