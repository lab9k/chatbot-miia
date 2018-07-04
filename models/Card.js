class Card {
    constructor(title, subtitle, url) {
        this.title = title;
        this.subtitle = subtitle;
        if (url !== undefined && url !== null) {
            this.buttons = [
                {
                    type: "web_url",
                    url: url,
                    title: "Bekijk het verslag"
                }
            ]
        }
    }
}

module.exports = Card;