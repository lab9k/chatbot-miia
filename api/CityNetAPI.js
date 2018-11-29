const request = require('request-promise');

/**
 * Wrapper klasse voor CityNet Rest API
 * @class
 */
class CityNetAPI {
  constructor(baseURL, username, password, docType) {
    this.baseURL = baseURL;
    this.username = username;
    this.password = password;
    this.docType = docType;
  }

  query(query) {
    return request({
      uri: `${this.baseURL}/v1/query`,
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        docType: this.docType,
      }),
      auth: {
        user: this.username,
        pass: this.password,
      },
    });
  }
}

module.exports = CityNetAPI;
