let card = require("../models/card");
let dialogFlow = require("../models/dialogFlow");
let miiaResponse = require("../util/miiaResponse");

module.exports = function (response) {
    response = JSON.parse(response);
    let finalResponse;
    let cards = [];
    if (response.hasOwnProperty("paragraphs") && response.documents !== null) {
        // generate list for facebook cards
        for (let i = 0; i < response.paragraphs.length; i++) {
            let document = response.paragraphs[i];
            console.log(`Content: ${miiaResponse(document).replace(/^\n/, "")}`
                + `\nscore = ${document.score}`);
            if (cards.length < 9) {
                if (document.matchingConcepts !== null && document.matchingConcepts.length > 0) {
                    let date = new Date(document.publicationDate);
                    cards.push(card(miiaResponse(document).substring(0, 80),
                        `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`,
                        document.docUri));
                }
            }
        }
        // for web demo (Take the first respond(highest score)))
        if (cards.length === 0) {
            finalResponse = "Geen antwoord gevonden";
        } else {
            finalResponse = miiaResponse(response.paragraphs[0])
        }
    } else {
        finalResponse = "Geen antwoord gevonden";
    }
    // Dialogflow format https://dialogflow.com/docs/fulfillment
    return dialogFlow(finalResponse, cards)
};

