class DialogflowResponse {
    constructor(response, cards) {
        if (cards.length === 0) {
            this.fulfillmentText = response;
        } else {
            this.payload = {
                facebook: {
                    attachment: {
                        type: "template",
                        payload: {
                            template_type: "generic",
                            elements: cards
                        }
                    }
                }
            }
        }
    }
}

module.exports = DialogflowResponse;