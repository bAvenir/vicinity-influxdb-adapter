const Influx = require('influx');
const Log = require('../../_classes/logger');
const config = require('../configuration');
const agent = require('../../_agent/agent');
let eventHandler = require('../interface').eventEmitter;

// Declare global db object
let influxOP;

module.exports.start = function(){
        influxOP = new Influx.InfluxDB({
        protocol : config.influx.protocol,
        host: config.influx.host,
        database: config.influx.database,
        port: config.influx.port,
        username: config.influx.username,
        password: config.influx.password,
        schema: [
          {
            measurement: 'froniusinverter',
            fields: {
              devicestatus: Influx.FieldType.STRING,
              pvinstalledcapacity: Influx.FieldType.INTEGER,
              accumulatedenergyproduced: Influx.FieldType.INTEGER,
              invertergridactivepowerload: Influx.FieldType.FLOAT,
              inverterconsumeractivepowerload: Influx.FieldType.FLOAT,
              inverteractualactivepower: Influx.FieldType.FLOAT,
            },
            tags: [
              'id', 'name'
            ]
          },
          {
            measurement: 'froniusbattery',
            fields: {
              batteryactualcontrolmode: Influx.FieldType.STRING,
              actualbatterystateofcharge: Influx.FieldType.INTEGER,
              batteryactualdcpower: Influx.FieldType.FLOAT,
              batterynominalcapacity: Influx.FieldType.INTEGER,
            },
            tags: [
              'id', 'name'
            ]
          }
        ]
    });
}

module.exports.pingDB = async function(){
    let logger = new Log();
    try{
        let hosts = await influxOP.ping(5000);
        hosts.forEach(host => {
            if (host.online) { logger.info(`${host.url.host} responded in ${host.rtt}ms running version ${host.version}`, "INFLUX"); }
            else { 
                logger.error(`${host.url.host} is not responding...`, "INFLUX"); 
                throw new Error(`${host.url.host} is not responding...`);
            }
        })
        return Promise.resolve(true);
    } catch(err) {
        logger.error(err, "INFLUX")
        return Promise.reject(false);
    }
}

module.exports.initialize = async function(){
    let logger = new Log();
    try{
        // Check db is ready
        let dbs = await influxOP.getDatabaseNames();
        await _checkDb(dbs);

        // Subscribe to events
        await agent.unsubscribeEvents();
        await agent.subscribeEvents();
        
        logger.info("InfluxDB initialized and waiting for events", "INFLUX");
        return Promise.resolve(true);
    } catch(err) {
      logger.error(err, "INFLUX")
      return Promise.reject(false);
    }
  }


  // Handling events

    // froniusBattery
      eventHandler.on("froniusbattery", function(data) {
        influxOP.writePoints([
          {
          measurement: 'froniusbattery',
          tags: { id: data.oid, name: data.name },
          fields: { 
            batteryactualcontrolmode: data.BattMode,
            actualbatterystateofcharge: parseInt(data.SOC) || 0,
            batteryactualdcpower: parseFloat(data.P_Akku) || 0,
            batterynominalcapacity: parseInt(data.Capacity) || 0
          },
        }
      ]).catch(err => {
        logger.error(`Error saving data to InfluxDB! ${err.stack}`)
      })
    });

    // froniusInverter
    eventHandler.on("froniusinverter", function(data) {
      influxOP.writePoints([
        {
        measurement: 'froniusinverter',
        tags: { id: data.oid, name: data.name },
        fields: { 
            devicestatus: data.IsOnline,
            pvinstalledcapacity: parseInt(data.PeakPower) || 0,
            accumulatedenergyproduced: parseInt(data.EnergyTotal) || 0,
            invertergridactivepowerload: parseFloat(data.P_Grid) || 0,
            inverterconsumeractivepowerload: parseFloat(data.P_Load) || 0,
            inverteractualactivepower: parseFloat(data.P_PV) || 0
          },
        }
      ]).catch(err => {
        logger.error(`Error saving data to InfluxDB! ${err.stack}`)
      })
    });


// Private functions

/**
 * Receives all existing dbs
 * If necessary dbs do not exist creates them
 * On error terminates initialization
 * @param {array} dbnames 
 */
async function _checkDb(dbnames){
    try{
        if(dbnames.indexOf('shortterm') == -1) await influxOP.createDatabase('shortterm');
        return Promise.resolve(true);
    }catch(err){
        return Promise.reject(err);
    }
}