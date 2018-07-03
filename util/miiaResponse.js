module.exports = function (response) {
    let miiaResponse;
    if (response.hasOwnProperty("summary") && response.summary !== null) {
        miiaResponse = response.summary;
    } else if (response.hasOwnProperty("displaySummary") && response.displaySummary !== null) {
        miiaResponse = response.displaySummary;
    } else if (response.hasOwnProperty("content") && response.content !== null) {
        miiaResponse = response.content;
    } else {
        miiaResponse = "Geen antwoord gevonden";
    }
    return miiaResponse;
};