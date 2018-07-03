let card = require("../models/card");
let dialogFlow = require("../models/dialogFlow");
let miiaResponse = require("../util/miiaResponse");

module.exports = function (response) {
    response = JSON.parse(response);
    let finalResponse;
    let cards = [];
    if (response.hasOwnProperty("documents") && response.documents !== null) {
        // generate list for facebook cards
        for (let i = 0; i < response.documents.length && i < 10; i++) {
            let currentResponse = response.documents[i];
            console.log(currentResponse);
            cards.push(card("iets", "iets", "https://lab9k.gent"))
        }
        // for web demo (Take the first respond(highest score)))
        finalResponse = miiaResponse(response.documents[0])
    } else {
        finalResponse = "Geen antwoord gevonden";
    }
    // Dialogflow format https://dialogflow.com/docs/fulfillment
    return dialogFlow(finalResponse, cards)
};

