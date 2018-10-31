docker// Utility to create a partcipant and issue an identity 
const bnUtil = require('./bn-connection-util');
bnUtil.connect(main);

function main() {
    const NS = 'org.acme.airline.participant';
    const part_type = 'ACMEPersonnel';
    const bnDef = bnUtil.connection.getBusinessNetwork();

    let factory = bnDef.getFactory();
    let participant = factory.newResource(NS, 'ACMEPersonnel', 'nimda@airline.org');
    let contact = factory.newConcept(NS, 'Contact');
    contact.fName = 'Nimda';
    contact.lname = 'Worm';
    contact.email = 'nimda@airline.org';
    participant.contact = contact;
    participant.department = 'Human Resources';
    return bnUtil.connection.getParticipantRegistry(NS+'.'+part_type)
        .then((registry) => {
            return registry.add(participant);
        }).then(() => {
            bnUtil.connection.disconnect();
        }).catch((error) => {
            console.log("Something went wrong: ", error);
        });
}