'use strict';

// Connect to business network
const aircraftNamespace = 'org.acme.airline.aircraft';
const aircraftType = 'Aircraft';
const flightNamespace = 'org.acme.airline.flight';
const flightType = 'Flight';

const bnUtil = require('./bn-connection-util');
bnUtil.connect(main);

function main(){
    var registry = {};

    return bnUtil.connection.getAssetRegistry(flightNamespace+'.'+flightType)
    .then((reg) => {
        registry = reg;
        console.log(`Received  ${registry.id} Registry`);
        return registry.getAll();
    })
    .then((flights) => {
        console.log(`Retrieved ${flights.length} flights`);
        return registry.removeAll(flights)
    })
    .then(() => {
        return bnUtil.connection.getAssetRegistry(aircraftNamespace+'.'+aircraftType)
    })
    .then((reg) => {
        registry = reg;
        console.log(`Received ${registry.id} Registry`);
        return registry.getAll();
    })
    .then((aircrafts) => {
        console.log(`Retrieved ${aircrafts.length} aircrafts`);
        return registry.removeAll(aircrafts);
    })
    .then(() => {
        console.log('Removed all flights and aircrafts!')
        bnUtil.disconnect();
    }).catch((error) => {
        console.log(error);
        bnUtil.disconnect();
    })    
}

