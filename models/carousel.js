module.exports = function (listOfCards) {
    if (listOfCards.length !== 0)
        return {
            template_type: "generic",
            elements: listOfCards
        };
    else
        return {}
};