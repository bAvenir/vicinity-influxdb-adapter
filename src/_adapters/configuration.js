/**
 * ADAPTER configuration parameters
 * Included in .env (at project root)
 */

const dotenv = require('dotenv');

// Read configuration      
dotenv.config();

// Configuration object to export
let config = module.exports = {};

// Argument passed to node when starting app
config.responseMode = process.env.ADAPTER_RESPONSE_MODE || "dummy";
config.dataCollectionMode = process.env.ADAPTER_DATA_COLLECTION_MODE || "dummy";
config.proxyUrl = process.env.ADAPTER_PROXY_URL || "http://localhost:8000";
config.influx = {};
config.influx.host = process.env.INFLUX_HOST || "localhost";
config.influx.protocol = process.env.INFLUX_PROTOCOL || "http";
config.influx.database = process.env.INFLUX_DB;
config.influx.port = process.env.INFLUX_PORT || 8086;
config.influx.username = process.env.INFLUX_USERNAME || "admin";
config.influx.password = process.env.INFLUX_PWD || "admin";
