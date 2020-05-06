const Influx = require('influx');
const Log = require('../../_classes/logger');
const config = require('../configuration');
const agent = require('../../_agent/agent');
// const eventHandler = require('../api/services/items').eventEmitter;

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
        //   {
        //     measurement: 'eosinverter',
        //     fields: {
        //       pvinstalledcapacity: Influx.FieldType.INTEGER,
        //       pvactualdcvoltage: Influx.FieldType.FLOAT,
        //       invertertotaldcpower: Influx.FieldType.FLOAT,
        //       inverteraccumulatedactiveenergyproduction: Influx.FieldType.INTEGER,
        //       // pvconnectionstatus: Influx.FieldType.STRING,
        //       inverteractualfrequency: Influx.FieldType.FLOAT,
        //       pvactualdccurrent: Influx.FieldType.FLOAT,
        //       inverteractualreactivepower: Influx.FieldType.FLOAT,
        //       inverteractualactivepower: Influx.FieldType.INTEGER,
        //       // inverterstatus: Influx.FieldType.STRING,
        //       pvactualdcpower: Influx.FieldType.FLOAT,
        //       // pvoperationstatus: Influx.FieldType.STRING
        //     },
        //     tags: [
        //       'id', 'type', 'name'
        //     ]
        //   }
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
        await agent.subscribeEvents();
        
        logger.info("InfluxDB initialized and waiting for events", "INFLUX");
        return Promise.resolve(true);
    } catch(err) {
      logger.error(err, "INFLUX")
      return Promise.reject(false);
    }




    // .then(function(response){
    //     // UKMQTT
    //     eventHandler.on("ukmqtt", function(data) {
    //       influxOP.writePoints([
    //           {
    //           measurement: 'ukmqtt',
    //           tags: { id: data.id },
    //           fields: { 
    //               temperature: parseFloat(data.temperature),
    //               humidity: parseFloat(data.humidity),
    //               batterylevel: parseFloat(data.batterylevel),
    //               batteryvoltage: parseFloat(data.batteryvoltage) 
    //               },
    //           }
    //       ]).catch(err => {
    //         logger.error(`Error saving data to InfluxDB! ${err.stack}`)
    //       })
    //     });
    //     // eosinverter
    //     eventHandler.on("eosinverter", function(data) {
    //         influxOP.writePoints([
    //           {
    //           measurement: 'eosinverter',
    //           tags: { id: data.oid, type: data.type, name: data.name },
    //           fields: { 
    //             pvinstalledcapacity: parseInt(data.pvinstalledcapacity) || 0,
    //             pvactualdcvoltage: parseFloat(data.pvactualdcvoltage) || 0,
    //             invertertotaldcpower: parseFloat(data.invertertotaldcpower) || 0,
    //             inverteraccumulatedactiveenergyproduction: parseInt(data.inverteraccumulatedactiveenergyproduction) || 0,
    //             // pvconnectionstatus: data.pvconnectionstatus,
    //             inverteractualfrequency: parseFloat(data.inverteractualfrequency) || 0,
    //             pvactualdccurrent: parseFloat(data.pvactualdccurrent) || 0,
    //             inverteractualreactivepower: parseFloat(data.inverteractualreactivepower) || 0,
    //             inverteractualactivepower: parseInt(data.inverteractualactivepower) || 0,
    //             // inverterstatus: data.inverterstatus,
    //             pvactualdcpower: parseFloat(data.pvactualdcpower) || 0,
    //             // pvoperationstatus: data.pvoperationstatus
    //               },
    //           }
    //       ]).catch(err => {
    //         logger.error(`Error saving data to InfluxDB! ${err.stack}`)
    //       })
    //     });
    //             // eosbattery
    //             eventHandler.on("eosbattery", function(data) {
    //               influxOP.writePoints([
    //                 {
    //                 measurement: 'eosbattery',
    //                 tags: { id: data.oid, type: data.type, name: data.name },
    //                 fields: { 
    //                   // batterychargestatus: data.batterychargestatus,
    //                   batteryactualdcpower: parseFloat(data.batteryactualdcpower) || 0,
    //                   // batteryoperationalstatus: data.batteryoperationalstatus,
    //                   batterynominalpower: parseInt(data.batterynominalpower) || 0,
    //                   // batteryactualcontrolmode: data.batteryactualcontrolmode,
    //                   batterynominalcapacity: parseInt(data.batterynominalcapacity) || 0,
    //                   // batteryconnectionstatus: data.batteryconnectionstatus,
    //                   batteryactualdcvoltage: parseFloat(data.batteryactualdcvoltage) || 0,
    //                   actualbatterystateofcharge: parseInt(data.actualbatterystateofcharge) || 0
    //                     },
    //                 }
    //             ]).catch(err => {
    //               logger.error(`Error saving data to InfluxDB! ${err.stack}`)
    //             })
    //           });
    //     // froniusinverter
    //     eventHandler.on("froniusinverter", function(data) {
    //       influxOP.writePoints([
    //         {
    //         measurement: 'froniusinverter',
    //         tags: { id: data.oid, type: data.type, name: data.name },
    //         fields: { 
    //             InverterPVActualActivePower: parseFloat(data.InverterPVActualActivePower) || 0,
    //             InverterAccumulatedActiveEnergyProduction: parseFloat(data.InverterAccumulatedActiveEnergyProduction) || 0,
    //             InverterPVActualReactivePower: parseFloat(data.InverterPVActualReactivePower) || 0,
    //             InverterGridActivePowerLoad: parseFloat(data.InverterGridActivePowerLoad) || 0, 
    //             PvInstalledCapacity: parseFloat(data.PvInstalledCapacity) || 0,
    //             InverterConsumerActivePowerLoad: parseFloat(data.InverterConsumerActivePowerLoad) || 0  
    //             },
    //         }
    //     ]).catch(err => {
    //       logger.error(`Error saving data to InfluxDB! ${err.stack}`)
    //     })
    //   });
    // })
    // .catch(function(err){
    //     logger.error(err, "INFLUXDB");
    // });
}

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