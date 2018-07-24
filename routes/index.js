const express = require("express");
const router = express.Router();
const {WebhookClient, Card} = require("dialogflow-fulfillment");
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

    let fulfillmentText = null;
    let cards = false;

    // Get documents with highest scores
    if (parsedBody.hasOwnProperty("documents") && parsedBody.documents !== null) {

        // Take the first item (highest score) as a short text answer
        if (parsedBody.documents.length > 0) {
            let doc = parsedBody.documents[0];
            let paragraphs = [];
            let paragraph;
            if (parsedBody.hasOwnProperty("paragraphs")) {
                paragraphs = getParagraphs(parsedBody.paragraphs, doc);  // Get associated paragraphs
                paragraph = paragraphs[0];
            }

            if (paragraphs.length > 0
                && paragraph !== null
                && paragraph.hasOwnProperty("docUri")
                && (getDescription(paragraph) !== null
                    || (paragraph.hasOwnProperty("content") && paragraph.content !== null))) {
                // Firstly try the best paragraph
                let description = (getDescription(paragraph) !== null)
                    ? getDescription(paragraph)
                    : paragraph.content;
                fulfillmentText = `${description}\nBekijk het verslag: ${paragraph.docUri}`;
            } else if (doc.hasOwnProperty("docUri") && getDescription(doc) !== null) {
                // Secondly try the document with link
                fulfillmentText = `${getDescription(doc)}\nBekijk het verslag: ${doc.docUri}`;
            } else if (getDescription(doc) !== null) {
                // Thirdly try the document without link
                fulfillmentText = `${getDescription(doc)}`;
            }
        }


        let i = 0; // Cursor
        let j = 0; // Card count (max 10 cards)
        while (i < parsedBody.documents.length && j < 9) {
            let document = parsedBody.documents[i];

            // Construct a card, if this is a reasonable answer
            if (document.hasOwnProperty("score")
                && document.hasOwnProperty("originalURI")
                && document.score > 5) {

                // Construct default card
                let card = new Card(getDescription(document) !== null ? getDescription(document) : "Geen beschrijving");
                if (document.hasOwnProperty("publicationDate")) {
                    let date = new Date(document.publicationDate);
                    card.setText(`${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`);
                }
                if (document.hasOwnProperty("docUri")) {
                    card.setButton({
                        text: 'Bekijk het verslag',
                        url: document.docUri
                    });
                }

                // Attempt to make a better card on the basis of the associated paragraph with the highest score
                if (parsedBody.hasOwnProperty("paragraphs")) {
                    let paragraphs = getParagraphs(parsedBody.paragraphs, document);  // Get associated paragraphs

                    if (paragraphs.length > 0) {
                        let paragraph = paragraphs[0];  // Highest scoring paragraph

                        // Make card
                        if (paragraph.hasOwnProperty("publicationDate")
                            && paragraph.hasOwnProperty("docUri")) {
                            let date = new Date(paragraph.publicationDate);
                            if (getDescription(paragraph) !== null) {
                                card = new Card(getDescription(paragraph));
                            } else if (paragraph.hasOwnProperty("content") && paragraph.content !== null) {
                                card = new Card(paragraph.content);
                            }
                            card.setText(`${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`)
                                .setButton({
                                    text: 'Bekijk het verslag',
                                    url: paragraph.docUri
                                });
                        }
                    }
                }
                cards = true;
                agent.add(card);
                j++;
            }
            i++;
        }
    }

    // Add short answer

    let answered = fulfillmentText !== null || cards;

    if (!answered) {
        fulfillmentText = "Sorry ik kon geen antwoord vinden. Wilt u door een medewerken verder geholpen worden?";
    } else if (fulfillmentText === null) {
        fulfillmentText = "Geen antwoord gevonden, misschien kunnen bovenstaande documenten je helpen?";
    }

    agent.add(fulfillmentText);

    if (answered) {
        agent.add("Hopelijk is dit wat u zocht. Zo niet, wilt u dan door een medewerken verder geholpen worden?");
    }
}

function getParagraphs(paragraphs, document) {
    let pars = [];  // Associated paragraphs
    paragraphs.forEach(function (item) {
        if (item.hasOwnProperty("originalURI") && item.originalURI === document.originalURI) {
            pars.push(item);
        }
    });
    pars.sort(function (a, b) {  // Sort on score, highest to lowest
        return b.score - a.score;
    });
    return pars;
}

function error(agent) {
    agent.add(`Geen resultaten gevonden`);
}

function getDescription(item) {
    let description = null;
    if (item.hasOwnProperty("summary") && item.summary !== null) {
        description = item.summary;
    } else if (item.hasOwnProperty("displaySummary") && item.displaySummary !== null) {
        description = item.displaySummary;
    }
    return description;
}

module.exports = router;
