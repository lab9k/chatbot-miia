module.exports = function (response, cards) {
    if (cards.length === 0) {
        return {
            fulfillmentText: response,
        }
    } else {
        return {
            fulfillmentText: response,
            payload: {
                facebook: {
                    attachment: {
                        type: 'template',
                        payload: {
                            template_type: 'generic',
                            elements: cards
                        }
                    }
                }
            }
        }
    }
};