let card = require("../models/card");
let dialogFlow = require("../models/dialogFlow");
let miiaResponse = require("../util/miiaResponse");

module.exports = function (response) {
    response = JSON.parse(response);
    let finalResponse;
    let cards = [];
    if (response.hasOwnProperty("documents") && response.documents !== null) {
        // generate list for facebook cards
        for (let i = 0; i < response.documents.length; i++) {
            let document = response.documents[i];
            console.log(`Content: ${miiaResponse(document).replace(/^\n/, "")}`
                + `\nscore = ${document.score}`);
            if (cards.length < 9) {
                if (document.matchingConcepts.length > 0) {
                    cards.push(card(miiaResponse(document).substring(0, 80),
                        `${document.publicationDate.getDate()}/`
                        + `${document.publicationDate.getMonth()}/`
                        + `${document.publicationDate.getFullYear()}`,
                        response.docUri));
                }
            }
        }
        // for web demo (Take the first respond(highest score)))
        finalResponse = miiaResponse(response.documents[0])
    } else {
        finalResponse = "Geen antwoord gevonden";
    }
    // Dialogflow format https://dialogflow.com/docs/fulfillment
    return dialogFlow(finalResponse, cards)
};

