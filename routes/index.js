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
const MAX_CARD_AMOUNT = 10;
const MAX_DESCRIPTION_LENGTH = 255;

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
            intentMap.set("Default Fallback Intent", getErrorResponse);
        }
        agent.handleRequest(intentMap);

    });
});

function getResponse(agent, response, body) {
    let parsedBody = JSON.parse(body);

    let fulfillmentText = null;
    let cards = [];

    // Get documents with highest scores
    if (parsedBody.hasOwnProperty("documents") && parsedBody.documents !== null) {

        // Take the first item (highest score, above 5) as a short text answer
        if (parsedBody.documents.length > 0
            && parsedBody.documents[0].hasOwnProperty("score")
            && parsedBody.documents[0].score > 5) {
            let doc = parsedBody.documents[0];
            let paragraphs = [];
            let paragraph;
            if (parsedBody.hasOwnProperty("paragraphs")) {
                paragraphs = getParagraphs(doc, parsedBody.paragraphs);  // Get associated paragraphs
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
        while (i < parsedBody.documents.length && j < MAX_CARD_AMOUNT) {
            let document = parsedBody.documents[i];

            // Construct a card, if this is a reasonable answer
            let paragraphs = (parsedBody.hasOwnProperty("paragraphs"))
                ? getParagraphs(document, parsedBody.paragraphs)
                : [];
            let card = getCard(document, paragraphs);
            if (card !== null) {
                cards.push(card);
                j++;
            }

            i++;
        }
    }

    // Add answers

    if (fulfillmentText !== null) {
        agent.add(fulfillmentText);
        if (cards.length > 0) {
            agent.add("Als dit niet het antwoord is dat u zocht kunnen onderstaande documenten u misschien helpen.");
        }
    } else if (cards.length > 0) {
        agent.add("Geen antwoord gevonden, misschien kunnen onderstaande documenten je helpen?");
    } else {
        agent.add("Sorry ik kon geen antwoord vinden. Wilt u door een medewerken verder geholpen worden?");
        return;
    }

    cards.forEach(card => agent.add(card));
    agent.add("Hopelijk is dit wat u zocht. Zo niet, wilt u dan door een medewerker verder geholpen worden?");

}

function getErrorResponse(agent) {
    agent.add(`Geen resultaten gevonden`);
}

/**
 * Makes a card representation of a document. Returns null if no card could be made.
 *
 * @param document is the document to be represented by the card.
 * @param paragraphs is an optional parameter to improve text of card.
 * @returns {Card|*}
 */
function getCard(document, paragraphs) {
    if (!document.hasOwnProperty("score")
        || !document.hasOwnProperty("originalURI")
        || document.score <= 5) {
        return null;
    }

    // Construct default card
    let card = new Card(getDescription(document) !== null ? getDescription(document) : "Geen beschrijving");
    if (document.hasOwnProperty("publicationDate")) {
        let date = new Date(document.publicationDate);
        card.setText(`${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`);
    }
    if (document.hasOwnProperty("docUri")) {
        card.setButton({
            text: "Bekijk het verslag",
            url: document.docUri
        });
    }

    // Attempt improve card on the basis of the associated paragraph with the highest score
    if (paragraphs.length > 0) {
        let paragraph = paragraphs[0];  // Highest scoring paragraph
        if (getDescription(paragraph) !== null) {
            card = new Card(getDescription(paragraph));
            if (paragraph.hasOwnProperty("docUri")) {
                card.setButton({
                    text: "Bekijk het verslag",
                    url: paragraph.docUri
                });
            }
        }
    }

    return card;
}

/**
 * @param document
 * @param paragraphs
 * @returns {Array} a list of associated paragraphs of a given document, sorted from highest to lowest score. Returns an
 * empty list on failure.
 */
function getParagraphs(document, paragraphs) {
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

function getDescription(item) {
    let description = null;
    if (item.hasOwnProperty("summary") && item.summary !== null) {
        description = item.summary;
    } else if (item.hasOwnProperty("displaySummary") && item.displaySummary !== null) {
        description = item.displaySummary;
    } else if (item.hasOwnProperty("content") && item.content !== null) {
        description = (item.content.length <= MAX_DESCRIPTION_LENGTH)
            ? item.content
            : `${item.content.slice(0, MAX_DESCRIPTION_LENGTH-3)}...`;
    }
    return description;
}

module.exports = router;
