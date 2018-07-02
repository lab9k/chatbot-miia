const express = require("express");
const router = express.Router();
const request = require("request");

router.get("/", function (req, res) {
    res.send("Miia chatbot");
});

router.post("/", function (req, res) {
    console.log(req);
    let dataString = '{ "query":`${res}`, "docType":"digipolis" }';

    let options = {
        url: 'https://gent.digipolis.demo.miia.technology/legal/services/v1/query',
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: dataString,
        auth: {
            'user': 'digipolis',
            'pass': 'aepung5yeisu5biew3eiPohYahng5moo'
        }
    };

    function callback(error, response, body) {
        if (!error && response.statusCode === 200) {
            res.send(body);
        } else {
            res.send("Nothing!")
        }
    }

    request(options, callback);
});

module.exports = router;
