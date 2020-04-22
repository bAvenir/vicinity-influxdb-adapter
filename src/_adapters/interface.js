/**
* interface.js
* Process incoming requests coming from the gateway
* The behaviour of this module depends on the properties set on the configuration file:
* - response_mode and data_collection
* The incoming messages can be:
* - Request to send property value
* - Request to update property value
* - Receive event from subscribed value
*/ 

// Import logger
const Log = require('../_classes/logger');
// Configuration Modes
const config = require('./configuration');
const responseMode = config.responseMode;
const collectionMode = config.dataCollectionMode;
const proxyUrl = config.proxyUrl;
// Modules
const dummyModule = require('./_modules/dummy');
const proxyModule = require('./_modules/proxy');

// TBD Include other adapter modules when available
// TBD Handle events and actions sent by gtw

/**
 * Redirects incoming property requests
 * Response of the adapter depends on the configuration
 * @param {STRING} oid (local VICINITY OID)
 * @param {STRING} pid (local VICINITY Property)
 */
module.exports.proxyGetProperty = async function(oid, pid){
    let logger = new Log();
    let result;
    try{
        // TBD Check if combination of oid + pid exists (persistance.combinationExists)

        switch (responseMode) {
            case 'dummy':
                result = dummyModule.getProperty(oid, pid);
                break;
            case 'proxy':
                result = await proxyModule.getProperty(oid, pid, proxyUrl);
                break;
            default:
                throw new Error('ADAPTER ERROR: Selected module could not be found');
        }

        logger.debug(`Responded to get property ${pid} of ${oid} in mode: ${globalMode}`, "ADAPTER");
        return Promise.resolve(result);
    } catch(err) {
        logger.error(err, "ADAPTER")
        return Promise.reject({error: true, message: err})
    }
}

/**
 * Redirects incoming update property requests
 * Response of the adapter depends on the configuration
 * @param {STRING} oid (local VICINITY OID)
 * @param {STRING} pid (local VICINITY Property)
 * @param {OBJECT} body
 */
module.exports.proxySetProperty = async function(oid, pid, body){
    let logger = new Log();
    let result;
    try{ 
        // TBD Check if combination of oid + pid exists

        switch (responseMode) {
            case 'dummy':
                result = dummyModule.setProperty(oid, pid);
                break;
            case 'proxy':
                result = await proxyModule.setProperty(oid, pid, body, proxyUrl);
                break;
            default:
                throw new Error('ADAPTER ERROR: Selected module could not be found');
        }

        logger.debug(`Responded to set property ${pid} of ${oid} in mode: ${globalMode}`, "ADAPTER");
        return Promise.resolve(result);
    } catch(err) {
        logger.error(err, "ADAPTER")
        return Promise.reject({error: true, message: err})
    }
}

/**
 * Redirects incoming event
 * Event messages come from some subscribed channel
 * The event will be processed in different way depending on configuration
 * @param {STRING} oid (local VICINITY OID)
 * @param {STRING} eid (local VICINITY Event)
 * @param {OBJECT} body
 */
module.exports.proxyReceiveEvent = async function(oid, eid, body){
    let logger = new Log();
    let result;
    try{ 
        // TBD Check if combination of oid + pid exists

        switch (collectionMode) {
            case 'dummy':
                let event = Object.keys(body).length === 0 ? "Empty body" : JSON.stringify(body);
                logger.info(`Event received from channel ${eid} of ${oid}: ${event}`, "ADAPTER");
                break;
            case 'proxy':
                result = await proxyModule.receiveEvent(oid, eid, body, proxyUrl);
                break;
            default:
                throw new Error('ADAPTER ERROR: Selected module could not be found');
        }
        logger.debug(`Event received from channel ${eid} of ${oid} in mode: ${collectionMode}`, "ADAPTER");
    } catch(err) {
        logger.error(err, "ADAPTER")
    }
}