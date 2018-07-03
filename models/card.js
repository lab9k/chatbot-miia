module.exports = function (title, subtitle, url) {
    if (url.length !== 0)
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
    else
        return {
            title: title,
            subtitle: subtitle
        }
};