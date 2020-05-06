mkdir -p $(pwd)/data # creates a folder for your data
MYUID=$(id -u) # saves your user id in the ID variable

# starts grafana with your user id and using the data folder
docker run -d --user ${MYUID} --name grafana --volume $(pwd)'/data:/var/lib/grafana' -p 3000:3000 \
-e "GF_SERVER_PROTOCOL=http" \
-e "GF_SERVER_DOMAIN=grafana.bavenir.eu" \
-e "GF_SECURITY_ADMIN_USER=bavenir" \
-e "GF_SECURITY_ADMIN_PASSWORD=bavenir"  \
-e "VIRTUAL_HOST=grafana.bavenir.eu" \
-e "VIRTUAL_PROTO=http" \
-e "VIRTUAL_PORT=3000" \
grafana/grafana

# Check where influxdb is running
docker network inspect bridge | grep influxdb -A 5

# Login for the first time
echo "#####"
echo "First time login admin:admin"
echo "#####"