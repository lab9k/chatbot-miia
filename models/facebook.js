module.exports = function (carousel) {
    if (carousel.length !== 0)
        return {
            attachment: {
                type: 'template',
                payload: carousel
            }

        };
    else
        return {}
};