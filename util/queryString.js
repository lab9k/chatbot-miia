module.exports.formatQueryString = data => encodeURI(
  Object.keys(data)
    .map(key => `${key}=${data[key]}`)
    .join('&'),
);
