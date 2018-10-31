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


// Synchronous call so that connections can be established
before((done) => {
    utHarness.debug = false;
    utHarness.initialize(modelFolder, (adminCon, bnCon, definition) => {
        adminConnection = adminCon;
        businessNetworkConnection = bnCon;
        bnDefinition = definition;
        done();
    });
})

const nameSpace = 'org.example.biznet';
const resourceName = 'SampleAsset';

// Test Suite # 1
describe('Give information on the test case', () => {
    it('should have 1 asset instance with value=10', () => {
        let registry = {};
        return businessNetworkConnection.getAssetRegistry(nameSpace + '.' + resourceName).then((reg) => {
            registry = reg;
            const factory = bnDefinition.getFactory();
            let sampleAsset = factory.newResource(nameSpace, resourceName, 'SA-1');
            sampleAsset.value = '10';
            return registry.add(sampleAsset);
        }).then((asset) => {
            return registry.get('SA-1')
        }).then((asset) => {
            assert.equal(asset.value, "10", "Value not equal or undefined");
        }).catch((error) => {
            console.log(error);
        })
    })
});