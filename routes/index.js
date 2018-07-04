const express = require("express");
const router = express.Router();
const Card = require("../models/Card");
const DialogflowResponse = require("../models/DialogflowResponse");
const MiiaAPI = require("../api/MiiaAPI");
const miiaAPI = new MiiaAPI(
    process.env.baseURL,
    process.env.username,
    process.env.password,
    process.env.docType
);

/**
 * Routes HTTP POST requests to index
 */
router.post("/", function (req, res) {
    miiaAPI.query(req.body.queryResult.queryText, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            response = JSON.parse(response);
            let fulfillmentText;
            let cards = [];
            if (response.hasOwnProperty("paragraphs") && response.paragraphs !== null) {
                // generate list for facebook cards
                let i = 0;
                while (i < response.paragraphs.length && cards.length < 9) {
                    let paragraph = response.paragraphs[i];
                    if (paragraph.matchingConcepts !== null && paragraph.matchingConcepts.length > 0) {
                        let date = new Date(paragraph.publicationDate);
                        cards.push(new Card(getContent(paragraph),
                            `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
                            paragraph.docUri));
                    }
                    i++;
                }
                // for web demo (Take the first respond(highest score)))
                if (cards.length === 0) {
                    fulfillmentText = "Geen antwoord gevonden";
                } else {
                    fulfillmentText = getContent(response.paragraphs[0])
                }
            } else {
                fulfillmentText = "Geen antwoord gevonden";
            }
            // Dialogflow format https://dialogflow.com/docs/fulfillment
            res.send(new DialogflowResponse(fulfillmentText, cards));
        } else {
            res.send(new DialogflowResponse("Kon Miia API niet berijken"));
        }
    });
});

function getContent(response) {
    let content;
    if (response.hasOwnProperty("summary") && response.summary !== null) {
        content = response.summary;
    } else if (response.hasOwnProperty("displaySummary") && response.displaySummary !== null) {
        content = response.displaySummary;
    } else if (response.hasOwnProperty("content") && response.content !== null) {
        content = response.content;
    } else {
        content = "Geen antwoord gevonden";
    }
    return content;
}

module.exports = router;
