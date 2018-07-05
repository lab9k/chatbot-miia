const express = require("express");
const router = express.Router();
const dialogFlowFormatter = require("../util/dialogFlowFormatter");
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
    console.log(req.body);
    console.log(req.body.queryResult.queryText);
    miiaAPI.query(req.body.queryResult.queryText, (error, response, body) => {
        console.log(error);
        if (!error && response.statusCode === 200) {
            let dialogFlowResponse = dialogFlowFormatter(body);
            res.send(dialogFlowResponse);
        } else {
            res.send(dialogFlowFormatter({}))
        }
    });
});

module.exports = router;
