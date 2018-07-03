module.exports = function (carousel) {
    if (carousel.length !== 0)
        return {
            payload: {
                facebook: {
                    attachment: {
                        type: 'template',
                        payload: carousel
                    }
                }
            }
        };
    else
        return {}
};