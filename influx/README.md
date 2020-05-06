# Installation instructions

We will deploy in linux/MAC OS

## How-to start
* Initialization: Run init.sh. See below main steps contained in the script:
    * If in Linux it creates user influxdb and all your file liked to the container should be owned by it
        ``` 
        sudo useradd -rs /bin/false influxdb
        sudo chown influxdb:influxdb <container volumes and linked files>
        ```
    * Find users UID (For linux)
        ```
        cat /etc/passwd | grep influxdb
        ```
    * Get configuration to be able to customize it
        ```
        docker run --rm influxdb influxd config > influxdb.conf
        ```
    * Create folders:
        *  configuration: and add influxdb.conf (Enable authentication and HTTPS when ready)
        *  data: link to volume for db persistance out of docker
        *  scripts: Initialization script
  
* The file influxdb-init.iql needs to be created with the dafault initialization settings. 
    * Modify influxdb-init.iql to create more databases, continuous queries or users.
    * If you want to initialize a second time, remove first the contents of the data/ and ssl/ folders

* Once the initialization is done, you can use the script run.sh to start the container.


## Data dumps

* Basic query to dump all measurement as a json. Modify the query to dump different results
    ```
    curl -G 'http://localhost:8086/query?pretty=true&u=your-user&p=your-pwd&db=your-db' --data-urlencode 'q=SELECT * FROM "your_measurement"' > db_dump.json
    ```

## Backup and restore db

* Backup Steps
    * Back up inside docker (See more configuration options for backup in https://docs.influxdata.com/influxdb/v1.7/administration/backup_and_restore/ )
    ```
    docker exec -it <docker-container> influxd backup -database <mydb_to_backup> -portable -since <timestamp> <output-path-for-dump-in-docker> 
    ```
    * Copy the backup to your local machine
    ```
    docker cp <docker-container>:<output-path-for-dump-in-docker>  <path-for-backup-in-your-host>
    ```  
* Restore steps
    * Stop running influxdb container
        ```
        docker stop <container-name>
        ```
    * Restore database to your influx container
        ```
        docker run --rm \
        --entrypoint /bin/bash \
        -v <influx_data_dir>:/var/lib/influxdb \
        -v <local_backup>:/backups \
        influxdb:latest \
        -c "influxd restore -metadir /var/lib/influxdb/meta -datadir /var/lib/influxdb/data -database <DB_NAME> /backups/<BACKUP_DIR_NAME>"
        ```

      * Where:
        ```
        influx_data_dir - is the directory which is used by your stopped Influx container to store DB info
        local_backup - is the directory with DB backup
        db_name - is name of the restored DB
        backup_dir_name - is name of database backup folder inside local_backup directory
        ```
    
    * Restart docker container
    ```
    docker start <container-name>
    ```

    * **IF THIS RESTORE METHOD DOES NOT WORK, FOLLOW RESTORE.SH INSTRUCTIONS**
    
    * We can back up short term db (High granularity) or longterm (Aggregations to 15 min, 30 min ...)
    * Useful links: https://www.grzegorowski.com/how-to-backup-and-restore-influxdb-which-runs-inside-docker-container

* Rename a collection
    ```
    curl -i -XPOST http://localhost:8086/query -u admin:admin -d db=longterm -d "q=SELECT * INTO ukmqtt FROM uk_mqtt GROUP BY  * "
    ```
    ```
    curl -i -XPOST http://localhost:8086/query -u admin:admin -d db=longterm -d "q=DROP MEASUREMENT uk_mqtt"
    ```