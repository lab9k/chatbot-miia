
module.exports = function (miiaResponse) {
    let response;
    miiaResponse = JSON.parse(miiaResponse);
    if (miiaResponse.hasOwnProperty("documents") && miiaResponse.documents !== null) {
        miiaResponse = miiaResponse.documents[0]; // Take the first respond(highest score)
        if (miiaResponse.hasOwnProperty("summary") && miiaResponse.summary !== null) {
            response = miiaResponse.summary;
        } else if (miiaResponse.hasOwnProperty("displaySummary") && miiaResponse.displaySummary !== null) {
            response = miiaResponse.displaySummary;
        } else if (miiaResponse.hasOwnProperty("content") && miiaResponse.content !== null) {
            response = miiaResponse.content;
        } else {
            response = "Geen antwoord";
        }
    } else {
        response = "Geen antwoord";
    }
    // Dialogflow format https://dialogflow.com/docs/fulfillment
    return {
        fulfillmentText: response,
        source: "http://miia-chatbot-gent.herokuapp.com",
        /*        payload: {
                     facebook: {

                     }
                }*/
    }
};