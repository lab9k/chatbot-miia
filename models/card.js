module.exports = function (title, subtitle, url) {
    if (url !== undefined && url !== null) {
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
        };
    }
    else {
        return {
            title: title,
            subtitle: subtitle
        }
    }
};