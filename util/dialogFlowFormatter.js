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
        fulfillmentMessages: [
            {
                card: {
                    title: "card title",
                    subtitle: "card text",
                    imageUri: "https://assistant.google.com/static/images/molecule/Molecule-Formation-stop.png",
                    buttons: [
                        {
                            text: "button text",
                            postback: "https://assistant.google.com/"
                        }
                    ]
                }
            }
        ],
        source: "http://miia-chatbot-gent.herokuapp.com",
        payload: {
             facebook: {
                 text: "Hello, Facebook!"
             }
        }
    }
};