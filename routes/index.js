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
 * Documents with a score lower than LOWER_BOUND_SCORE are deemed irrelevant.
 * @type {number}
 */
const LOWER_BOUND_SCORE = 5;

/**
 * Documents with a score above UPPER_BOUND_SCORE are deemed likely to be a hit.
 * @type {number}
 */
const UPPER_BOUND_SCORE = 30;

/**
 * Maximum amount of cards to be shown in a carousel.
 * @type {number}
 */
const MAX_CARD_AMOUNT = 10;

/**
 * Maximum amount of characters of the description of a document which may be shown in a single response message.
 * @type {number}
 */
const MAX_DESCRIPTION_LENGTH = 255;

/**
 * The name for the follow-up context of a good answer
 * @type {string}
 */
const GOOD_ANSWER_KEY = "GoodAnswer";

/**
 * The name for the follow-up context of a moderate answer
 * @type {string}
 */
const MODERATE_ANSWER_KEY = "ModerateAnswer";

/**
 * Routes HTTP POST requests to index. It catches all fulfillment's from Dialogflow.
 */
router.post("/", function (req, res) {
    if (!req.hasOwnProperty("body") || Object.keys(req.body).length === 0) {
        res.status(400).send("Empty body");
    }

    const agent = new WebhookClient({request: req, response: res});

    // if (agent.getContext(GOOD_ANSWER_KEY) !== null) {
    //     // TODO Catch answer from user to the follow-up question
    //     return;
    // }

    miiaAPI.query(req.body.queryResult.queryText, (error, response, body) => {
        let intentMap = new Map();

        if (!error && response.statusCode === 200) {
            intentMap.set("Default Fallback Intent", (agent) =>
                getResponse(agent, req.body.queryResult.queryText, body));
        } else {
            intentMap.set("Default Fallback Intent", getErrorResponse);
        }
        intentMap.set("Good Answer Followup - no", (agent) =>
            getResponse(agent, req.body.queryResult.queryText, body, true));

        agent.handleRequest(intentMap);

    });
});

function getResponse(agent, question, body, goodFollowup=false) {
    let parsedBody = JSON.parse(body);
    let paragraphs = (parsedBody.hasOwnProperty("paragraphs")) ? parsedBody.paragraphs : [];

    let fulfillmentText = null;
    let cards = [];

    // Basic checks
    if (!parsedBody.hasOwnProperty("documents")
        || parsedBody.documents === null
        || parsedBody.documents.length <= 0) {
        agent.add(getHelpResponse());
        return;
    }

    // Search for a meaningful answer
    let highestScoring = parsedBody.documents[0];
    if (!goodFollowup && highestScoring.hasOwnProperty("score") && highestScoring.score > UPPER_BOUND_SCORE) {
        // We got a good anwser so we set the appropriate context
        agent.setContext({"name": GOOD_ANSWER_KEY, "lifespan": 1, "parameters": {"question": question}}); // TODO lifespan 2 but clear when matched
        // Make a short response
        fulfillmentText = getShortResponse(
            highestScoring,
            getParagraphs(highestScoring, paragraphs).length > 0
                ? getParagraphs(highestScoring, paragraphs)[0]
                : null);
    } else {
        // If no high scoring document was found we send a set of documents, scoring higher than LOWER_BOUND_SCORE.
        cards = getCardResponse(document, getParagraphs(document, paragraphs));
        agent.setContext({"name": MODERATE_ANSWER_KEY, "lifespan": 1, "parameters": {}});
    }

    // If no meaningful answer could be found a help response is send
    if (fulfillmentText === null && cards.length <= 0) {
        agent.add(getHelpResponse());
        return;
    }

    // Send answer
    if (fulfillmentText !== null) {
        agent.add(fulfillmentText);
    } else {
        if (goodFollowup) {
            agent.add("Misschien kunnen deze documenten je helpen:");
        }
        cards.forEach(card => agent.add(card));
    }

    // Send follow-up question
    agent.add("Heeft dit uw vraag beantwoord?");
}

function getErrorResponse(agent) {
    agent.add(`Geen resultaten gevonden`);
}

/**
 * Gives a response for a single document. Only displays a short paragraph or description of the document and a link to
 * the corresponding pdf.
 *
 * Returns null if no meaningful message could be constructed.
 *
 * @param document to be represented
 * @param paragraph from the document
 * @returns {string|null}
 */
function getShortResponse(document, paragraph) {
    // Take the first item (highest score, above 5) as a short text answer
    let fulfillmentText;

    if (paragraph !== null
        && paragraph.hasOwnProperty("docUri")
        && getDescription(paragraph) !== null) {
        // Firstly try the best paragraph
        let description = (getDescription(paragraph) !== null)
            ? getDescription(paragraph)
            : paragraph.content;
        fulfillmentText = `${description}\nBekijk het verslag: ${paragraph.docUri}`;
    } else if (document.hasOwnProperty("docUri") && getDescription(document) !== null) {
        // Secondly try the document with link
        fulfillmentText = `${getDescription(document)}\nBekijk het verslag: ${document.docUri}`;
    } else {
        fulfillmentText = `${getDescription(document)}`;
    }

    return fulfillmentText;
}

/**
 * Gives a carousel of the best related documents in card form.
 *
 * @param documents
 * @param paragraphs
 * @returns {Array}
 */
function getCardResponse(documents, paragraphs) {
    let cards = [];
    let i = 0; // Cursor
    let j = 0; // Card count (max 10 cards)
    while (i < documents.length && j < MAX_CARD_AMOUNT) {
        let document = documents[i];
        let card = getCard(document, paragraphs);
        if (card !== null && document.hasOwnProperty("score") && document.score > LOWER_BOUND_SCORE) {
            cards.push(card);
            j++;
        }
        i++;
    }
    return cards;
}

function getHelpResponse() {
    // TODO Give some tips (refrase etc.) and give gentinfo@stad.gent for more help
    return "Sorry ik kon geen antwoord vinden. " +
        "U kan hopelijk verder geholpen worden op dit e-mailadres: gentinfo@stad.gent";
}


/**
 * Makes a card representation of a document. Returns null if no card could be made.
 *
 * @param document is the document to be represented by the card.
 * @param paragraphs is an optional parameter to improve text of card.
 * @returns {Card|null}
 */
function getCard(document, paragraphs) {
    // Check if document is usable
    if (!document.hasOwnProperty("score")
        || !document.hasOwnProperty("originalURI")
        || document.score <= LOWER_BOUND_SCORE) {
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
            : `${item.content.slice(0, MAX_DESCRIPTION_LENGTH - 3)}...`;
    }
    return description;
}

module.exports = router;
