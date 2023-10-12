class User {

    constructor({id, puuid, auth, username, region, entitlements}) {
        this.id = id;
        this.puuid = puuid;
        this.auth = auth;
        this.username = username;
        this.region = region;
        this.entitlements = entitlements;
    }
}

module.exports = User;