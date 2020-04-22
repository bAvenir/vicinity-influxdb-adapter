/**
* interfaces.js
* Interface to interact with the persistance layer
* @interface
*/ 

const Log = require('../_classes/logger');
const fileMgmt = require('./_modules/fileMgmt');
const config = require('./configuration');

/**
 * Loads in memory configuration files
 */
module.exports.loadConfigurationFile = async function(fileType){
    let logger = new Log();
    try{ 
        let file = await fileMgmt.read(`./agent/${fileType}.json`);
        let array = JSON.parse(file);
        let countRows = array.length;
        if(countRows>0){
            //TBD store in memory during runtime
            //if(config.db === "redis") await storeInMemory(fileType, array);
            return Promise.resolve(array);
        } else {
            logger.info(`There are no ${fileType} available to load`, "PERSISTANCE");
            return Promise.resolve(array);
        }
    } catch(err) {
        logger.error(err, "PERSISTANCE")
        return Promise.reject(false)
    }
}

/**
 * Get configuration file
 * TBD Load from memory if available
 */
module.exports.getConfigurationFile = async function(fileType){
    let logger = new Log();
    try{ 
        // TBD if(config.db === "redis") let array = await findOidPid(fileType);
        let file = await fileMgmt.read(`./agent/${fileType}.json`);
        let array = JSON.parse(file);
        return Promise.resolve(array);
    } catch(err) {
        logger.error(err, "PERSISTANCE")
        return Promise.reject(false)
    }
}

/**
 * Save registrations or interactions to file
 */
module.exports.saveConfigurationFile = async function(fileType, data){
    let logger = new Log();
    try{ 
        // TBD Store in memory too (Append new values)
        //if(config.db === "redis") await storeInMemory(fileType, array);
        await fileMgmt.write(`./agent/${fileType}.json`, JSON.stringify(data));
        return Promise.resolve(true);
    } catch(err) {
        logger.error(err, "PERSISTANCE")
        return Promise.reject(false)
    }
}

/**
 * Check if incoming request is valid
 * Oid exists in infrastructure and has pid 
 */
module.exports.combinationExists = async function(oid, pid){
    // TBD if(config.db === "redis") await findOidPid(fileType, array);
    return(true)
}
