/**
 * Create Flight Transaction
 * @param {org.acme.airline.flight.CreateFlight} flightData
 * @transaction
 * 
 * 1. Check for the validity of the schedule - throw error 
 * 2. Create the Flight asset
 *    2.1 Set the flightId, flightNumber
 *    2.2 Create an instance of the 'route' Concept
 *    2.3 Set the data on 'route' Concept
 *    2.4 Set the flight asset route = 'route' concept
 * 3. Emit FlightCreated Event
 * 4. Add the flight asset to the registry
 */

function createFlight(flightData) {

    /**
     * 1. Validate the schedule data
     * If the date is a past date then throw an error
     */
    var timeNow = new Date().getTime();
    var schedTime = new Date(flightData.schedule).getTime();
    if (schedTime < timeNow) {
        throw new Error("Scheduled time cannot be in the past!!!");
    }

    // Get the Asset Registry

    return getAssetRegistry('org.acme.airline.flight.Flight')

        .then(function (flightRegistry) {
            // Now add the Flight - global function getFactory() called
            var factory = getFactory();
            var NS = 'org.acme.airline.flight';

            // Solution to exercise - Removed hardcoded value & invoked
            // generate the flight ID
            // 2.1 Set the flightNumber, flightId ... 
            var flightId = generateFlightId(flightData.flightNumber, flightData.schedule);
            var flight = factory.newResource(NS, 'Flight', flightId);
            flight.flightNumber = flightData.flightNumber;
            flight.aliasFlightNumber = [];

            // Flight asset has an instance of the concept
            // 2.2 Use the factory to create an instance of concept
            var route = factory.newConcept(NS, "Route");

            // 2.3 Set the data in the concept 'route'
            route.origin = flightData.origin;
            route.destination = flightData.destination;
            route.schedule = flightData.schedule;

            // 2.4 Set the route attribute on the asset
            flight.route = route;


            // 3 Emit the event FlightCreated
            var event = factory.newEvent(NS, 'FlightCreated');
            event.flightId = flightId;
            emit(event);

            // 4. Add to registry
            return flightRegistry.add(flight);
        });
}


/****
 * Creates the flight number from Flight number and the schedule
 * Solution to Exercise.
 */
function generateFlightId(flightNum, schedule) {
    var dt = new Date(schedule)

    // Date & Month needs to be in the format 01 02 
    // so add a '0' if they are single digits
    var month = dt.getMonth() + 1;
    if ((month + '').length == 1) month = '0' + month;
    var dayNum = dt.getDate();
    if ((dayNum + '').length == 1) dayNum = '0' + dayNum;

    // console.log(dayNum,month,dt.getFullYear())

    return flightNum + '-' + month + '-' + dayNum + '-' + (dt.getFullYear() + '').substring(2, 4);
}

/**
 * Create Flight Transaction
 * @param {org.acme.airline.flight.AssignAircraft} flightAircraftData
 * @transaction
 * 
 * **/
function AssignAircraft(flightAircraftData) {
    var flightRegistry = {};
    return getAssetRegistry('org.acme.airline.flight.Flight').then(function (registry) {
        flightRegistry = registry
        return flightRegistry.get(flightAircraftData.flightId);
    }).then(function (flight) {
        if (!flight) throw new Error("Flight : " + flightAircraftData.flightId, " Not Found!!!");
        var factory = getFactory();
        var relationship = factory.newRelationship('org.acme.airline.aircraft', 'Aircraft', flightAircraftData.aircraftId);
        flight.aircraft = relationship;
        return flightRegistry.update(flight);
    }).then(function () {
        // Successful update
        let event = getFactory().newEvent('org.acme.airline.flight', 'AircraftAssigned');
        event.setPropertyValue('flightId', flightAircraftData.flightId);
        event.setPropertyValue('aircraftId', flightAircraftData.aircraftId);
        emit(event);
    }).catch(function (error) {
        //throw new Error(error);
        console.log(error);
    });
}

/**
 * Update aircraft in batch 
 * @param {org.acme.airline.flight.UpdateAircraftInBatch} flightData
 * @transaction
 * 
 */
function UpdateAircraftInBatch(flightData) {
    // Utility data
    var today = new Date();
    // Create query 
    var statement = 'SELECT org.acme.airline.flight.Flight WHERE (aircraft == _$aircraft)';
    var qry = buildQuery(statement);

    if (qry) {
        console.log('Query successfully created');
        return query(qry, {
            aircraft: 'resource:org.acme.airline.aircraft.Aircraft#' + flightData.aircraftId
        }).then((res) => {
            var event = getFactory().newEvent('org.acme.airline.flight', 'BatchUpdated');
            event.aircraftId = flightData.newAircraftId;
            event.flightIds = [];
            res.forEach(flight => {
                console.log(flight.flightId + " " + flight.aircraft);
                let schedule = new Date(flight.route.schedule);
                if (countDays(today, schedule) <= flightData.days) {
                    var assignData = {
                        flightId: flight.flightId,
                        aircraftId: flightData.newAircraftId
                    };
                    AssignAircraft(assignData);
                    event.flightIds.push(flight.flightId);
                }
            });
            emit(event);
        })
            .catch((error) => {
                console.log(error);
            })
    } else {
        console.log('Error in creating query')
    }
}

// Counts the days between two dates
function countDays(date1, date2) {
    const day_in_s = 24 * 60 * 60 * 1000;
    return Math.round((date2.getTime() - date1.getTime()) / day_in_s);
}