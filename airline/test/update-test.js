'use strict';
/**
 * Part of a course on Hyperledger Fabric:
 * http://ACloudFan.com
 *
 * Use this as a template for your own unit test cases
 */
var assert = require('chai').assert;


const utHarness = require('/home/maul/workspace/HLF - Course/ACME/HLF-Fabric-API/ut-harness');

// This points to the model project folder
var modelFolder = __dirname + '/..';

var adminConnection = {};
var businessNetworkConnection = {};
var bnDefinition = {};
var factory = {};


// Synchronous call so that connections can be established
// Executed before the describe{} gets executed
before((done) => {
    utHarness.debug = false;
    utHarness.initialize(modelFolder, (adminCon, bnCon, definition) => {
        adminConnection = adminCon;
        businessNetworkConnection = bnCon;
        bnDefinition = definition;
        factory = bnDefinition.getFactory();
        done();
    });
});

const nameSpaceFlight = 'org.acme.airline.flight';
const assetNameFlight = 'Flight';
const nameSpaceAircraft = 'org.acme.airline.aircraft';
const assetNameAircraft = 'Aircraft';
const transactionNameCreate = 'CreateFlight';
const transactionNameAssign = 'AssignAircraft';
const transactionNameUpdate = 'UpdateAircraftInBatch';

var flightId = 'AE101-10-11-18';
var aircraftId = 'CRAFT001';
describe('Transaction # UpdateAircraftInBatch  Valid', () => {

    // 1. Create and instance of aircraft (id=CRAFT01)
    // 2. Creat an instance of flight (id=AE101-01-03-18)
    // Gets executed before the it{] blocks get executed within this describe{} block
    // NB: change Promise.all with registry.addAll
    before((done) => {
        let transaction = factory.newTransaction(nameSpaceFlight, transactionNameCreate);
        transaction.setPropertyValue('flightNumber', 'AE101');
        transaction.setPropertyValue('origin', 'EWR');
        transaction.setPropertyValue('destination', 'SEA');
        // Set the future date
        transaction.setPropertyValue('schedule', new Date('2018-10-13T21:44Z'));

        let p1 = businessNetworkConnection.submitTransaction(transaction);

        transaction = factory.newTransaction(nameSpaceFlight, transactionNameCreate);
        transaction.setPropertyValue('flightNumber', 'AE102');
        transaction.setPropertyValue('origin', 'JFK');
        transaction.setPropertyValue('destination', 'SEA');
        // Set the future date
        transaction.setPropertyValue('schedule', new Date('2018-10-15T21:44Z'));

        let p2 = businessNetworkConnection.submitTransaction(transaction);

        transaction = factory.newTransaction(nameSpaceFlight, transactionNameCreate);
        transaction.setPropertyValue('flightNumber', 'AE103');
        transaction.setPropertyValue('origin', 'ATL');
        transaction.setPropertyValue('destination', 'SEA');
        // Set the future date
        transaction.setPropertyValue('schedule', new Date('2018-10-20T21:44Z'));

        let p3 = businessNetworkConnection.submitTransaction(transaction);

        Promise.all([p1, p2, p3])
            .then(() => {
                console.log("Flights Added");
                return businessNetworkConnection.getAssetRegistry(nameSpaceAircraft + "." + assetNameAircraft);
            })
            .then((registry) => {
                let aircraftResource = factory.newResource(nameSpaceAircraft, assetNameAircraft, 'CRAFT01');
                aircraftResource.setPropertyValue('ownershipType', 'LEASED');
                aircraftResource.setPropertyValue('firstClassSeats', 10);
                aircraftResource.setPropertyValue('businessClassSeats', 10);
                aircraftResource.setPropertyValue('economyClassSeats', 50);

                p1 = registry.add(aircraftResource);

                aircraftResource = factory.newResource(nameSpaceAircraft, assetNameAircraft, 'CRAFT02');
                aircraftResource.setPropertyValue('ownershipType', 'OWNED');
                aircraftResource.setPropertyValue('firstClassSeats', 10);
                aircraftResource.setPropertyValue('businessClassSeats', 10);
                aircraftResource.setPropertyValue('economyClassSeats', 50);

                p1 = registry.add(aircraftResource);
                return Promise.all([p1, p2]);
            })
            .then(() => {
                console.log("Aircrafts Added");
            })
            .then(() => {
                //flightIds
                var flightIds = [
                    "AE101-10-13-18",
                    "AE102-10-15-18",
                    "AE103-10-20-18"
                ]
                var promises = [];
                // Get the factory using the BN Definition
                const factory = bnDefinition.getFactory();
                // Create the instance
                flightIds.forEach(id => {
                    let transaction = factory.newTransaction(nameSpaceFlight, transactionNameAssign);
                    transaction.setPropertyValue('flightId', id);
                    transaction.setPropertyValue('aircraftId', aircraftId);

                    let p = businessNetworkConnection.submitTransaction(transaction);

                    promises.push(p);

                });
                return Promise.all(promises);
            })
            .then(() => {
                console.log('Assignments done');
                done();
            })
            .catch((error) => {
                console.log(error);
                process.exit(1);
            })
    });

    var flightRegistry = {}
    // Test Case # 1 Sunny day path - we are able to assign an aircraft to EACH flight
    it('should assign the CRAFT002 to EACH flight', () => {
        const new_id = "CRAFT002"
        const factory = bnDefinition.getFactory();
        let transaction = factory.newTransaction(nameSpaceFlight, transactionNameUpdate);
        transaction.setPropertyValue('aircraftId', aircraftId);
        transaction.setPropertyValue('newAircraftId', new_id);
        transaction.setPropertyValue('days', 10);

        return businessNetworkConnection.submitTransaction(transaction).then(() => {
            return businessNetworkConnection.getAssetRegistry(nameSpaceFlight + "." + assetNameFlight)
        }).then((registry) => {
            flightRegistry = registry;
            return registry.getAll();
        }).then((assets) => {
            // Check if the aircraft ID is set for the flight
            assets.forEach(asset => {
                assert.deepEqual(asset.aircraft.$identifier, 'CRAFT002', "should be set to CRAFT002!!");
                console.log("ASSET: ", asset.aircraft.$identifier);
            })
        });
    });
});