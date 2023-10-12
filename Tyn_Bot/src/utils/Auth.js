const {parseSetCookie, stringifyCookies, extractTokensFromUri, decodeToken, embedMessage} = require("./Utils");
const User = require("../user/User");
const {getUserbyPuuid, addUser, getUser, deleteUser} = require("../storage/UserStorage");
const HenrikDevValorantAPI = require("unofficial-valorant-api");

/**
 *
 * @param id Id Discord User
 * @param username Username of riot account
 * @param password Password of riot account
 * @returns {Promise<{success: boolean}|{success: boolean, token: string}>}
 */
const login = async (id, username, password) => {
    let url = 'https://auth.riotgames.com/api/v1/authorization';
    let userAgent = getUserAgent();
    const headers1 = {
        'Content-Type': 'application/json',
        'User-Agent': userAgent,
    }
    const body1 = JSON.stringify({
        "client_id": "riot-client",
        "code_challenge": "",
        "code_challenge_method": "",
        "acr_values": "",
        "claims": "",
        "nonce": "69420",
        "redirect_uri": "http://localhost/redirect",
        "response_type": "token id_token",
        "scope": "openid link ban lol_region"
    });
    let response = await fetch(url, {
        method: 'POST',
        headers: headers1,
        body: body1
    });
    let headers2 = response.headers.getSetCookie();
    let cookies = parseSetCookie(headers2)
    const headers = {
        'Content-Type': 'application/json',
        'User-Agent': userAgent,
        'Cookie': stringifyCookies(cookies)
    }
    const body = JSON.stringify({
        "type": "auth",
        "username": username,
        "password": password,
        "remember": true
    });
    let response2 = await fetch(url, {
        method: 'PUT',
        headers: headers,
        body: body
    });
    let data = await response2.json();
    if (data.type === 'error') {
        if (data.error === 'auth_failure') {
            return {success: false};
        }
    }
    if (data.type === 'response') {
        let user = await extractUser(id, {
            login: username,
            password: password,
            cookies: parseSetCookie(response2.headers.getSetCookie())
        }, data.response.parameters.uri);
        addUser(user);
        return {success: true};
    } else if (data.type === 'multifactor') {
        const user = new User({id});
        user.auth = {
            ...user.auth,
            wait2FA: true,
            cookies: parseSetCookie(response2.headers.getSetCookie())
        }
        user.auth.login = username;
        user.auth.password = password;
        addUser(user);
        return {success: true, mfa: true, method: data.multifactor.method, email: data.multifactor.email};
    }
    return {success: false}
}

const login2FA = async (id, mfaCode) => {
    let user = await getUser(id);
    const req = await fetch("https://auth.riotgames.com/api/v1/authorization", {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': getUserAgent(),
            'Cookie': stringifyCookies(user.auth.cookies)
        },
        body: JSON.stringify({
            'type': 'multifactor',
            'code': mfaCode,
            'rememberDevice': true
        })
    });
    const data = await req.json();

    deleteUser(id);

    user.auth = {
        ...user.auth,
        cookies: parseSetCookie(req.headers.getSetCookie())
    }

    if (data.type === 'multifactor_attempt_failed' || data.type === 'error') {
        return {success: false};
    }

    user = await extractUser(id, {
        login: user.auth.login,
        password: user.auth.password,
        cookies: user.auth.cookies
    }, data.response.parameters.uri, user);

    delete user.auth.wait2FA;
    addUser(user);
    return {success: true};
}

const loginWithCookie = async (id, cookies) => {
    const url = `https://auth.riotgames.com/authorize?redirect_uri=https%3A%2F%2Fplayvalorant.com%2Fopt_in&client_id=play-valorant-web-prod&response_type=token%20id_token&scope=account%20openid&nonce=1`;
    const headers = {
        'Content-Type': 'application/json',
        'User-Agent': getUserAgent(),
        'Cookie': cookies
    }
    const req = await fetch(url, {
        method: 'GET',
        headers: headers,
        redirect: 'manual'
    });
    const data = req.headers.get('location');
    if(!data.includes("access_token")) return {success: false};
    cookies = {
        ...parseSetCookie(cookies),
        ...parseSetCookie(req.headers.getSetCookie())
    }
    const user = await extractUser(id,
        {
            login: null,
            password: null,
            cookies: cookies
        }, data);
    addUser(user);
    return {success: true};
}

const extractUser = async (id, authInfo, authUri, user = null) => {
    if (!user) user = new User({id})
    const [rso, idt] = extractTokensFromUri(authUri);
    user.auth = {
        rso: rso,
        idt: idt
    }
    if (!user.auth.wait2FA) {
        user.auth.cookies = authInfo.cookies;
        user.auth.login = authInfo.login;
        user.auth.password = authInfo.password;
    } else {
        user.auth.cookies = authInfo.cookies;
        delete user.auth.login;
        delete user.auth.password;
    }
    user.puuid = decodeToken(rso).sub;

    const existsAccount = getUserbyPuuid(id, user.puuid);
    if (existsAccount) {
        user.username = existsAccount.username;
        user.region = existsAccount.region;
        if (existsAccount.entitlements) {
            user.entitlements = existsAccount.entitlements;
        }
    }

    const userInfo = await getUseInfo(rso);
    user.username = userInfo.username;

    if (!user.entitlements) {
        user.entitlements = await getEntitlements(user);
    }

    if (!user.region) {
        user.region = await getRegion(user);
    }
    return user;
}
const getUseInfo = async (token) => {
    let url = 'https://auth.riotgames.com/userinfo';
    let response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    let data = await response.json();
    if (data.acct) return {
        puuid: data.sub,
        username: data.acct.game_name && data.acct.game_name + "#" + data.acct.tag_line
    }
}

const getEntitlements = async (user) => {
    const req = await fetch("https://entitlements.auth.riotgames.com/api/token/v1", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + user.auth.rso
        }
    });
    const data = await req.json();
    return data.entitlements_token;
}

const getRegion = async (user) => {
    const req = await fetch("https://riot-geo.pas.si.riotgames.com/pas/v1/product/valorant", {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + user.auth.rso
        },
        body: JSON.stringify({
            'id_token': user.auth.idt,
        })
    });
    const data = await req.json();
    return data.affinities.live;
}

const getPlayerRank = async (user) => {
    const region = user.region;
    const userInfo = await getUseInfo(user.auth.rso);
    const vapi = new HenrikDevValorantAPI(config.API_KEY);
    if (!region || !userInfo) return null;
    const mmr_data = await vapi.getMMR({
        version: 'v2',
        region: region,
        name: userInfo.username.split('#')[0],
        tag: userInfo.username.split('#')[1]
    });
    if (!mmr_data) return null;
    return {
        rank: mmr_data.data.current_data.currenttierpatched,
        tier: mmr_data.data.current_data.currenttier
    };
}

const getRankInfo = async (tier) => {
    const req = await fetch("https://valorant-api.com/v1/competitivetiers");
    const data = (await req.json()).data;
    const currentSeason = data[data.length - 1].tiers;
    return currentSeason.find(r => r.tier === tier);
}

const getVersion = async () => {
    let url = 'https://api.github.com/repos/Morilli/riot-manifests/contents/Riot%20Client/KeystoneFoundationLiveWin?ref=master';
    let response = await fetch(url);
    let data = await response.json();
    let version = data[0].name;
    return version.split('_')[0];
}

// const getClientPlatform = async () => {
//     const platformInfo = {
//         "platformType": "PC",
//         "platformOS": "Windows",
//         "platformOSVersion": "10.0.19042.1.256.64bit",
//         "platformChipset": "Unknown"
//     };
//     return btoa(JSON.stringify(platformInfo));
// }
//
// const getClientVersion = async () => {
//     const req = await fetch("https://valorant-api.com/v1/version");
//     const data = await req.json();
//     return data.data.riotClientVersion;
// }

const refeshToken = async (discordId) => {
    let user = await getUser(discordId);
    if (!user || !user.auth.cookies) {
        return null;
    }
    const url = `https://auth.riotgames.com/authorize?redirect_uri=https%3A%2F%2Fplayvalorant.com%2Fopt_in&client_id=play-valorant-web-prod&response_type=token%20id_token&scope=account%20openid&nonce=1`;
    const headers = {
        'Content-Type': 'application/json',
        'User-Agent': getUserAgent(),
        'Cookie': stringifyCookies(user.auth.cookies)
    }
    const response = await fetch(url, {
        method: 'GET',
        headers: headers,
        redirect: 'manual'
    });
    await deleteUser(discordId);
    const data = response.headers.get('location');
    if (!data) return null;
    const [rso, idt] = extractTokensFromUri(data);
    user.auth = {
        rso: rso,
        idt: idt
    }
    user.puuid = user.puuid || decodeToken(rso).sub;
    user.auth.cookies = parseSetCookie(response.headers.getSetCookie());
    await addUser(user);
    return user;
}

const getUserAgent = () => {
    return `ShooterGame/11 Windows/10.0.22621.1.768.64bit`;
}

module.exports = {
    login,
    login2FA,
    getUseInfo,
    getPlayerRank,
    getRankInfo,
    refeshToken,
    loginWithCookie
}