const express = require("express");
const router = express.Router();
const {WebhookClient, Card } = require("dialogflow-fulfillment");
const DialogflowResponse = require("../models/DialogflowResponse");
const MiiaAPI = require("../api/MiiaAPI");
const miiaAPI = new MiiaAPI(
    process.env.BASEURL,
    process.env.USERNAME,
    process.env.PASSWORD,
    process.env.DOCTYPE
);

/**
 * Routes HTTP POST requests to index
 */
router.post("/", function (req, res) {
    if (!req.hasOwnProperty("body") || Object.keys(req.body).length === 0) {
        res.status(400).send("Empty body");
    }

    const agent = new WebhookClient({request: req, response: res});

    miiaAPI.query(req.body.queryResult.queryText, (error, response, body) => {
        let intentMap = new Map();
        if (!error && response.statusCode === 200) {
            intentMap.set("Default Fallback Intent", (agent) => getResponse(agent, res, body));
        } else {
            intentMap.set("Default Fallback Intent", error);
        }
        agent.handleRequest(intentMap);

    });
});

function getResponse(agent, response, body) {
    let parsedBody = JSON.parse(body);

    let fulfillmentText = "Geen antwoord gevonden";

    if (parsedBody.hasOwnProperty("paragraphs") && parsedBody.paragraphs !== null) {
        // Generate list for Facebook cards
        let i = 0;
        let j = 0;
        while (i < parsedBody.paragraphs.length && j < 9) {
            let paragraph = parsedBody.paragraphs[i];
            if (paragraph.matchingConcepts !== null && paragraph.matchingConcepts.length > 0) {
                let date = new Date(paragraph.publicationDate);

                let card = new Card(getContent(paragraph));
                card.setText(`${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`)
                    .setButton({
                        text: 'Bekijk het verslag',
                        url: paragraph.docUri
                    });
                agent.add(card);
                j++;
            }
            i++;
        }
        // For web demo (Take the first respond(highest score)))
        if (j !== 0) {
            fulfillmentText = `${getContent(parsedBody.paragraphs[0])}`
                + `\nBekijk het verslag: ${parsedBody.paragraphs[0].docUri}`;
        }
    }
    // Dialogflow format https://dialogflow.com/docs/fulfillment
    agent.add(fulfillmentText);
}

function error(agent) {
    agent.add(`Geen antwoord gevonden`);
}

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
