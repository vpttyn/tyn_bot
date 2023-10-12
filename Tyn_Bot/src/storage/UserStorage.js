const {QuickDB} = require("quick.db");
const db = new QuickDB({
    filePath: "./users.sqlite",
    table: "users",
})

const addUser = (user) => {
    const existsUser = getUser(user.id);
    if (existsUser) {
        db.set(user.id, user)
        return;
    }
    db.add(user.id, user)
}

const getUser = (id) => {
    return db.get(id);
}

const isReadyLink = async (username) => {
    const users = await db.all();
    return new Promise((resolve, reject) => {
        users.forEach(user => {
            if (user.value.auth.login === username && user.value.auth.wait2FA !== true) {
                resolve(true);
            }
        })
        resolve(false);
    })
}

const getUserbyPuuid = (id, puuid) => {
    return db.get(id).then(user => {
        if (!user) return null;
        if (user.puuid === puuid) {
            return user;
        } else {
            return null;
        }
    })
}

const deleteUser = (id) => {
    db.delete(id)
}

module.exports = {
    addUser,
    getUser,
    getUserbyPuuid,
    deleteUser,
    isReadyLink
}