const request = require('request');

module.exports = function (options) {
    if (typeof options === 'string') {
        options = {
            method: 'GET',
            uri: options
        }
    }

    return new Promise(function (resolve, reject) {
        request(
            options
            , (error, response, body) => {
                if (error) {
                    reject(error);
                } else if (response.statusCode == 200) {
                    response.body = body;
                    resolve(response);
                } else {
                    reject({
                        status: response.statusCode,
                        body: body,
                        headers: response.headers
                    });
                }
            }
        )
    });
};

