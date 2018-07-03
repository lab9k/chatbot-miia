/**
 * Wrapper klasse voor Miia Rest API
 */
class MiiaAPI {
    constructor(baseURL, username, password, docType) {
        this.baseURL = baseURL;
        this.username = username;
        this.password = password;
        this.docType = docType;
    }

    query(query, callback) {
        request({
            url: `${this.baseURL}/v1/query`,
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: query,
                docType: this.docType
            }),
            auth: {
                user: this.username,
                pass: this.password
            }
        }, callback);
    }
}