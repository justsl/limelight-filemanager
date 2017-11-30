const assert = require('assert');
const rq = require('./request');

if (!String.prototype.capitalize) {
    String.prototype.capitalize = function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    }
}

var prepareHeaders = Symbol();

module.exports = class {
    constructor(options) {
        this.options = {};
        this.options.prefix = options.prefix || 'X-Agile-';
        this.options.api = options.api;
        this.options.username = options.username;
        this.options.password = options.password;

        assert.ok(options.api && options.username && options.password);

        if (this.options.api[this.options.api.length - 1] != '/')
            this.options.api += '/';
    }

    [prepareHeaders](headers) {
        var result = {};

        for (let h of headers) {
            if (this.options[h]) {
                result[this.options.prefix + h.capitalize()] = this.options[h];
            }
        }

        return result;
    }

    async login() {
        try {
            let headers = this[prepareHeaders](['username', 'password']);

            let res = await rq({
                method: 'GET',
                uri: this.options.api + 'account/login',
                headers: headers,
            });

            console.log(res);
        }
        catch (e) {
            return false;
        }
    }
};