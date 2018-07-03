const express = require("express");
const router = express.Router();
const dialogFlowFormatter = require("../util/dialogFlowFormatter");
const config = require("../config.json");
const miiaAPI = new MiiaAPI(
    config.baseURL,
    config.username,
    config.password,
    config.docType
);

/**
 * Routes HTTP POST requests to index
 */
router.post("/", function (req, res) {
    miiaAPI.query(req.body.queryResult.queryText, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            let dialogFlowResponse = dialogFlowFormatter(body);
            res.send(dialogFlowResponse);
        } else {
            res.send(dialogFlowFormatter({}))
        }
    });
});

module.exports = router;
