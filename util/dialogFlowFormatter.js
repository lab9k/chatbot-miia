const Card = require("../models/Card");
const DialogflowResponse = require("../models/DialogflowResponse");
const miiaResponse = require("../util/miiaResponse");

module.exports = function (response) {
    response = JSON.parse(response);
    let finalResponse;
    let cards = [];
    if (response.hasOwnProperty("paragraphs") && response.paragraphs !== null) {
        // generate list for facebook cards
        for (let i = 0; i < response.paragraphs.length; i++) {
            let paragraph = response.paragraphs[i];
            console.log(`Content: ${miiaResponse(paragraph).replace(/^\n/, "")}`
                + `\nscore = ${paragraph.score}`);
            if (cards.length < 9) {
                if (paragraph.matchingConcepts !== null && paragraph.matchingConcepts.length > 0) {
                    let date = new Date(paragraph.publicationDate);
                    cards.push(new Card(miiaResponse(paragraph),
                        `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`,
                        paragraph.docUri));
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
    return new DialogflowResponse(finalResponse, cards);
};
