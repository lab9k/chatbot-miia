const express = require("express");
const router = express.Router();
const request = require("request");
const dialogFlowFormatter = require("../util/dialogFlowFormatter");
const miiaAPI = new MiiaAPI(
    "https://gent.digipolis.demo.miia.technology/legal/services",
    "digipolis",
    "aepung5yeisu5biew3eiPohYahng5moo",
    "digipolis"
);

/**
 * Routes HTTP POST requests to root
 * TODO safety check
 */
router.post("/", function (req, res) {
    miiaAPI.request(req.body.queryResult.queryText, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            let dialogFlowResponse = dialogFlowFormatter(body);
            res.send(dialogFlowResponse);
        } else {
            res.send(dialogFlowFormatter({}))
        }
    });
});

// TODO all HTML METHODS(block or accept)

module.exports = router;
