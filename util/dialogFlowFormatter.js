module.exports = function (miiaResponse) {
    let response;
    if ("summary" in miiaResponse && miiaResponse.summary !== null) {
        response = miiaResponse.summary;
    } else if ("displaySummary" in miiaResponse && miiaResponse.displaySummary !== null) {
        response = miiaResponse.displaySummary;
    } else if ("content" in miiaResponse && miiaResponse.content !== null) {
        response = miiaResponse.content;
    } else {
        response = "Geen antwoord";
    }
    // Dialogflow format https://dialogflow.com/docs/fulfillment
    return {
        fulfillmentText: response,
        /*fulfillmentMessages: [
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
        ],*/
        source: "example.com",
        /* payload: {
             google: {
                 expectUserResponse: true,
                 richResponse: {
                     items: [
                         {
                             simpleResponse: {
                                 textToSpeech: "this is a simple response"
                             }
                         }
                     ]
                 }
             },
             facebook: {
                 text: "Hello, Facebook!"
             },
             slack: {
                 text: "This is a text response for Slack."
             }
         },
         outputContexts: [
             {
                 name: "projects/${PROJECT_ID}/agent/sessions/${SESSION_ID}/contexts/context name",
                 lifespanCount: 5,
                 parameters: {
                     param: "param value"
                 }
             }
         ],
         followupEventInput: {
             name: "event name",
             languageCode: "en-US",
             parameters: {
                 param: "param value"
             }
         }*/
    }
};