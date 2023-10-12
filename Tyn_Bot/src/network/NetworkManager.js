const {Authenticator} = require("./protection/Authenticator");
const Path = {
    GET_INFO: '/getInfo/:discordId',
    GET_REGION: '/getRegion/:discordId',
    ADD_USER_CREDIT: '/addUserCredit',
    REDUCE_USER_CREDIT: '/reduceUserCredit',
    GET_USER_CREDIT: '/getUserCredit/:discordId',
};

class NetworkManager {
    constructor(app) {
        this.app = app;
        this.responses = new Map();
        this.networkURL = [];
    }

    /**
     * Get a path by name.
     *
     * @param path
     * @returns {string}
     */
    getPath(path) {
        return Path[path];
    }

    /**
     * Get all paths.
     *
     * @returns {any}
     */
    getPaths() {
        return Path;
    }

    /**
     * Get a response by name.
     *
     * @param name
     * @returns {any}
     */
    getResponse(name) {
        return this.responses.get(name);
    }

    /**
     * Register all responses.
     */
    registerResponses() {
        const fs = require('fs');
        const path = require('path');
        const responsesPath = path.join(__dirname, 'responses');
        const responses = fs.readdirSync(responsesPath);
        for (const response of responses) {
            const responsePath = path.join(responsesPath, response);
            const responseFile = require(responsePath);
            this.responses.set(responseFile.name, responseFile);
            const pathName = this.getPath(responseFile.pathName);
            this.networkURL.push({
                name: responseFile.name,
                url: pathName,
                method: responseFile.method
            });
            console.debug(`Registered response ${responseFile.name}.`);
        }
    }

    /**
     * Register all network URLs.
     */
    registerNetworkURL() {
        this.networkURL.forEach((data) => {
            if (data.method === 'GET') {
                this.app.get(data.url, this.getResponse(data.name).run);
                console.debug(`Registered path ${data.url} as GET.`);
            }
            if (data.method === 'POST') {
                this.app.post(data.url, Authenticator, this.getResponse(data.name).run);
                console.debug(`Registered path ${data.url} as POST.`);
            }
        });
    }
}

/**
 * Export the NetworkManager.
 *
 * @type {{NetworkManager: NetworkManager}}
 */
module.exports = { NetworkManager };