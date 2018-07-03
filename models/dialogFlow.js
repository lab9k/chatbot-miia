module.exports = function (response, cards) {
    if (cards.length === 0) {
        console.log(1);
        return {
            fulfillmentText: response,
            source: "http://miia-chatbot-gent.herokuapp.com",
        }
    } else {
        return {
            fulfillmentText: response,
            source: "http://miia-chatbot-gent.herokuapp.com",
            payload: {
                facebook: {
                    attachment: {
                        type: 'template',
                        payload: {
                            template_type: 'generic',
                            elements: [cards]
                        }
                    }
                }
            }
        }
    }
};