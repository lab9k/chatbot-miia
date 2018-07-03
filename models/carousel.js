module.exports = function (listOfCards) {
    return {
        payload: {
            template_type: "generic",
            elements: listOfCards
        }
    }
};