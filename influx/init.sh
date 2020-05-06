#!/bin/bash
USAGE="$(basename "$0") [-h -s] [-p path]
-- Initializes InfluxDB
-- Examples
./init.sh -s -p .
./init.sh -p /some/path
Where:
  Flags:
      -h  shows help
      -s  https
  Options with argument:
      -p  <path> [ current dir default ] [ OPTIONAL ] "

  # Default configuration
  DIR=$(pwd)
  OS=$(uname)
  HTTPS=FALSE

  # Get configuration
  while getopts 'hd:sd:p:' OPTION; do
    case "$OPTION" in
      h)
        echo "$USAGE"
        exit 0
        ;;
      s)
        HTTPS=TRUE
        ;;  
      p)
        DIR="$OPTARG"
        ;;
    esac
  done

echo "Starting initialization in folder "$DIR

if [ ${OS} == "Linux" ]; then
  echo "Running on LINUX, creating new user influxdb..."
  MYUID=$(id -u influxdb)
  if [ $? == 1 ]; then
    sudo useradd -rs /bin/false influxdb
    MYUID=$(id -u influxdb)
    echo "User influxdb created with UID "${MYUID}
  else
    echo "User influxdb already existed with UID "${MYUID}
  fi
else 
    echo "Running on "${OS} 
fi

# Generate folders
mkdir -p ${DIR}/configuration
mkdir -p ${DIR}/data
mkdir -p ${DIR}/scripts
mkdir -p ${DIR}/ssl

# Get default configuration if not existing
FILE=$DIR/configuration/influxdb.conf
if test -f "$FILE"; then
  echo "Configuration file $FILE exists"
else 
  docker run --rm influxdb influxd config > ${DIR}/configuration/influxdb.conf
  echo "Configuration file created in $FILE"
fi

# Generate SSH key and certificate
if [ ${HTTPS} == TRUE ]; then
  sudo openssl req -x509 -nodes -newkey rsa:2048 \
    -keyout ${DIR}/ssl/influxdb-selfsigned.key \
    -out ${DIR}/ssl/influxdb-selfsigned.crt \
    -days 365
  echo "Certificate and key stored under "${DIR}/ssl/
fi

# Initialize the db with new DB, users, queries...
    docker run --rm \
      -e INFLUXDB_HTTP_AUTH_ENABLED=true \
      -e INFLUXDB_ADMIN_USER=admin \
      -e INFLUXDB_ADMIN_PASSWORD=admin \
      -v ${DIR}/data:/var/lib/influxdb \
      -v ${DIR}/scripts:/docker-entrypoint-initdb.d \
      influxdb /init-influxdb.sh

if [ ${OS} == "Linux" ]; then
  # Give ownership of all the files to the user influxdb
  sudo chown -R $MYUID:$MYUID $DIR/configuration
  sudo chown -R $MYUID:$MYUID $DIR/ssl
  sudo chown -R $MYUID:$MYUID $DIR/data
  sudo chown -R $MYUID:$MYUID $DIR/scripts
fi