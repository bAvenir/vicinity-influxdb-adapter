# Grafana configuration

* First login with admin:admin
* Connect to a data source and remember to add cert and key
    * You can find Influx db docker instance IP running the following command:
    ```
    docker network inspect bridge | grep influxdb -A 5
    ```
* Configuration options
  
    * Basic configuration
    ```
    -e GF_SERVER_PROTOCOL=http 
    -e GF_SERVER_DOMAIN=YOUR.DOMAIN.TEST
    -e GF_SECURITY_ADMIN_USER=bavenir
    -e GF_SECURITY_ADMIN_PASSWORD=bavenir
    -e VIRTUAL_HOST=YOUR.DOMAIN.TEST
    -e VIRTUAL_PROTO=http
    -e VIRTUAL_PORT=3000
    ```

    * SMPT server set-up
    ```
    -e "GF_SMTP_ENABLED=true"
    -e "GF_SMTP_HOST=smtp.example.com:PORT"
    -e "GF_SMTP_FROM_ADDRESS=user_that_sends_mail"
    -e "GF_SMTP_USER=user_that_sends_mail"
    -e "GF_SMTP_PASSWORD=mysecret"
    ```

    * Install plugins

    Add the environment variable below. Find more plugins in Grafana website. To remove them you need to rebuild the docker image or to remove the plugins from the plugin folder that you can find inside grafana/data.

    ```
    -e "GF_INSTALL_PLUGINS=grafana-clock-panel,grafana-simple-json-datasource,digiapulssi-organisations-panel,agenty-flowcharting-panel,vonage-status-panel,grafana-piechart-panel,snuids-radar-panel,natel-plotly-panel" \
    ```

* Useful links
    * https://grafana.com/docs/grafana/latest/installation/docker/
    * https://grafana.com/docs/grafana/latest/installation/configure-docker/
    * https://grafana.com/docs/grafana/latest/guides/getting_started/