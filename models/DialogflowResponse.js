class DialogflowResponse {
    constructor(response, cards) {
        this.fulfillmentText = response;
        if (cards !== undefined && cards.length !== 0) {
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