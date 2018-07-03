let card = require("../models/card");
let carousel = require("../models/carousel");
let facebook = require("../models/facebook");

module.exports = function (miiaResponse) {
    let response;
    miiaResponse = JSON.parse(miiaResponse);
    let cards = [];
    if (miiaResponse.hasOwnProperty("documents") && miiaResponse.documents !== null) {
        // generate list for facebook cards
        for (let i = 0; i < 10; i++) {
            cards.push(card("iets", "iets", "https://lab9k.gent"))
        }
        // for web demo (Take the first respond(highest score)))
        miiaResponse = miiaResponse.documents[0];
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
        // payload: {
        //     facebook: facebook(carousel(cards))
        // }
    }
};