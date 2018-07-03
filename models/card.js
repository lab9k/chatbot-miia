module.exports = function (title, subtitle, url) {
    return {
        title: title,
        "subtitle": subtitle,
        "default_action": {
            "type": "web_url",
            "url": url,
        },
        buttons: [
            {
                type: "web_url",
                url: url,
                title: "Bekijk het verslag"
            }
        ]
    }
};