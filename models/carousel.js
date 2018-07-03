module.exports = function (listOfCards) {
    if (listOfCards.length !== 0)
        return {
            payload: {
                template_type: "generic",
                elements: listOfCards
            }
        };
    else
        return {}
};