const assert = require('assert');
const rq = require('./request');

if (!String.prototype.capitalize) {
    String.prototype.capitalize = function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    }
}

if (!String.prototype.has) {
    String.prototype.has = function (a) {
        return this.indexOf(a) != -1;
    }
}

if (!String.prototype.replaceAll) {
    String.prototype.replaceAll = function (search, replace) {
        if (!replace)
            replace = '';

        return this.split(search).join(replace);
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
        this.options.subdir = options.subdir;
        this.options.expiry = options.expiry || 3600;

        assert.ok(options.api && options.username && options.password);

        if (this.options.api[this.options.api.length - 1] != '/')
            this.options.api += '/';
    }

    [prepareHeaders](headers, source) {
        var result = {};

        source = source || this.options;

        for (let h of headers) {
            if (source[h]) {
                result[this.options.prefix + h.capitalize()] = source[h];
            }
        }

        return result;
    }

    async rpc(method, params) {
        assert.ok(method);
        assert.ok(params);

        if (!this.loginData)
            await login();

        if (!params.token)
            params.token = this.loginData.token;

        var request = {
            "method": method,
            "id": 1,
            "params": params,
            "jsonrpc": "2.0"
        };

        let json = await rq({
            body: JSON.stringify(request),
            uri: this.options.api + 'jsonrpc',
            method: 'POST'
        });

        let result = JSON.parse(json.body);

        if (result.error)
            throw result.error;

        return result.result;
    }

    async login() {
        if (this.loginData)
            return this.loginData;

        let headers = this[prepareHeaders](['username', 'password', 'subdir', 'expiry']);

        let res = await rq({
            method: 'GET',
            uri: this.options.api + 'account/login',
            headers: headers,
        });

        if (res.statusCode != 200) {
            throw res;
        }
        else {
            this.loginData = {};

            let prefix = this.options.prefix.toLowerCase();
            for (var h in res.headers) {
                let val = res.headers[h];
                h = h.toLowerCase();

                if (h.has(prefix)) {
                    h = h.replaceAll(prefix);
                    this.loginData[h] = val;
                }
            }

            let self = this;
            setTimeout(function () {
                self.loginData = false;
            }, ( this.options.expiry - 60 ) * 1000);

            return this.loginData;
        }
    }

    async upload(params) {
        assert.ok(params);
        assert.ok(params.body);
        assert.ok(params.path);

        if (!this.loginData)
            await login();

        var splitPath = params.path.split('/');
        var basename = splitPath[splitPath.length - 1];
        var directory = params.path.replaceAll(basename);

        params.basename = basename;
        params.directory = directory;
        params.authorization = this.loginData.token;
        params.recursive = 'yes';

        let headers = this[prepareHeaders](['basename', 'directory', 'authorization', 'recursive'], params);

        let res = await rq({
            method: 'POST',
            uri: this.options.api + 'post/raw',
            headers: headers,
            body: params.body
        });

        if (res.statusCode != 200) {
            throw res;
        }
        else {
            let result = {};

            let prefix = this.options.prefix.toLowerCase();
            for (var h in res.headers) {
                let val = res.headers[h];
                h = h.toLowerCase();

                if (h.has(prefix)) {
                    h = h.replaceAll(prefix);
                    result[h] = val;
                }
            }

            return result;
        }
    }

    async delete(path) {
        assert.ok(path);

        let res = await this.rpc('deleteFile', {path});
        if (res == 0) {
            return true;
        }
        else {
            return false;
        }
    }

    async list(path) {
        assert.ok(path);

        return await this.rpc('listPath', {path});
    }
};