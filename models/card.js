module.exports = function (title, subtitle, url) {
    return {
        title: title,
        subtitle: subtitle,
        buttons: [
            {
                type: "web_url",
                url: url,
                title: "Bekijk het verslag"
            }
        ]
    }
};