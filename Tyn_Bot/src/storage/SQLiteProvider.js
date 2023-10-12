const {addItemToString, removeItemFromString, getFirstIndex, log, embedMessage} = require("../utils/Utils");
const {refeshToken} = require("../utils/Auth");
const sqlite = require("sqlite3").verbose();

class SQLiteProvider {

    init() {
        this.db = new sqlite.Database("./database.sql", (err) => {
            if (err) {
                console.error(err.message);
            }
            console.log("Connected to the database.");
        });
        this.db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price TEXT NOT NULL,
            description TEXT NOT NULL,
            emoji TEXT NOT NULL,
            items BLOG DEFAULT "[]"
        );`);
        this.db.run(`CREATE TABLE IF NOT EXISTS credits (
            id TEXT PRIMARY KEY,
            credit INTEGER DEFAULT 0
        );`);
        this.db.run(`CREATE TABLE IF NOT EXISTS limitCredit (
            id TEXT PRIMARY KEY,
            currentday TEXT NOT NULL,
            limits INTEGER NOT NULL DEFAULT 0
        );`);
        this.db.run(`CREATE TABLE IF NOT EXISTS dailyrewards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            discord_id TEXT NOT NULL,
            day TEXT NOT NULL
        );`);
        this.db.run(`CREATE TABLE IF NOT EXISTS purchased (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            discord_id TEXT NOT NULL,
            list TEXT NOT NULL
        );`);
        this.db.run(`CREATE TABLE IF NOT EXISTS invites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            discord_id TEXT NOT NULL,
            time INTEGER NOT NULL DEFAULT 0,
            currentday TEXT NOT NULL
        );`);
    }

    async getProducts() {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT * FROM products`, (err, rows) => {
                if (err) {
                    reject(err);
                }
                resolve(rows);
            });
        });
    }

    async getProduct(id) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM products WHERE id = ?`, [id], (err, row) => {
                if (err) {
                    reject(err);
                }
                resolve(row);
            });
        });
    }

    async sortProducts() {
        return new Promise((resolve, reject) => {
            this.db.all(`UPDATE products SET id = (SELECT COUNT(*) FROM products p2 WHERE p2.id < products.id) + 1`, (err, rows) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    }

    async addProduct(name, price, description, emoji) {
        return new Promise((resolve, reject) => {
            this.db.run(`INSERT INTO products (name, price, description, emoji) VALUES (?, ?, ?, ?)`, [name, price, description, emoji], (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    }

    async getFirstItemInProduct(id) {
        return new Promise(async (resolve, reject) => {
            const items = await this.getItemsInProduct(id)
            resolve(getFirstIndex(items))
        });
    }

    async addProductItem(id, item) {
        return new Promise(async (resolve, reject) => {
            const items = await this.getItemsInProduct(id)
            const string = addItemToString(items, item)
            this.db.run(`UPDATE products SET items = ? WHERE id = ?`, [string, id], (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    }

    async removeProductItem(id, item) {
        return new Promise(async (resolve, reject) => {
            const items = await this.getItemsInProduct(id)
            const string = removeItemFromString(items, item)
            this.db.run(`UPDATE products SET items = ? WHERE id = ?`, [string, id], (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    }

    async getItemsInProduct(id) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT items FROM products WHERE id = ?`, [id], (err, row) => {
                if (err) {
                    reject(err);
                }
                resolve(row.items);
            });
        });
    }

    async deleteProduct(id) {
        return new Promise((resolve, reject) => {
            this.db.run(`DELETE FROM products WHERE id = ?`, [id], (err) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
    }

    async getCredit(id) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT credit FROM credits WHERE id = ?`, [id], (err, row) => {
                if (err) {
                    reject(err);
                }
                if (!row || !row.credit) {
                    resolve(undefined);
                    return;
                }
                resolve(row.credit);
            });
        });
    }

    async getAllCredits() {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT * FROM credits`, (err, rows) => {
                if (err) {
                    reject(err);
                }
                resolve(rows);
            });
        });
    }

    async addCredit(id, credit, isAdmin = false, reason = "Không rõ") {
        if (isNaN(credit) || credit <= 0) return;
        let maxLimit = await this.getMaxLimit(id);
        let noLimit = false;
        const guild = await main.getClient().guilds.fetch(config.guild);
        const user = await guild.members.fetch(id);
        const limit = await this.getLimit(id);
        const ranks = config.ranks;
        const bonusRoles = config.bonusRoles;
        if (!user) return;
        for (const rank in ranks) {
            const info = ranks[rank];
            if (user.roles.cache.has(info.role)) {
                credit += info.bonusCredit;
            }
        }
        for (const bonus in bonusRoles) {
            const info = bonusRoles[bonus];
            if (user.roles.cache.has(info.role)) {
                if (info.limitCredit === "noLimit") {
                    noLimit = true;
                    break;
                }
                credit += info.bonus;
            }
        }
        if (limit.limits >= maxLimit && !isAdmin && !noLimit) {
            const user = await main.getClient().users.fetch(id);
            if (!user) return;
            await user.send(`Bạn đã vượt quá giới hạn credit nhận được vào ngày hôm nay (**${limit.limits}**/**${maxLimit}**) nên không được cộng thêm bất kì 1 credit nào nữa. Vui lòng thử lại vào ngày mai!`);
            return;
        }
        if (!isAdmin) {
            await this.addLimit(id, credit);
        }
        await log(`Người dùng **${user.user.username}** đã được cộng **${credit}** credit vì **${reason}**!`);
        let currentCredit = await this.getCredit(id);
        if (currentCredit) {
            currentCredit += credit;
            this.db.run(`UPDATE credits SET credit = ? WHERE id = ?`, [parseInt(currentCredit), id]);
        } else {
            this.db.run(`INSERT INTO credits (id, credit) VALUES (?, ?)`, [id, parseInt(credit)]);
        }
    }

    async getMaxLimit(id) {
        let maxLimit = 0;
        let noLimit = false;
        const guild = await main.getClient().guilds.fetch(config.guild);
        const user = await guild.members.fetch(id);
        const ranks = config.ranks;
        const inCreaseLimit = config.inCreaseLimit;
        const bonusRoles = config.bonusRoles;
        if (!user) return;
        if (user.roles.cache.has(config.verifyRole.id)) {
            maxLimit += config.verifyRole.limitCredit;
        }
        for (const rank in ranks) {
            const info = ranks[rank];
            if (user.roles.cache.has(info.role)) {
                maxLimit += info.limitCredit;
            }
        }
        for (const increase in inCreaseLimit) {
            const info = inCreaseLimit[increase];
            if (user.roles.cache.has(info.role)) {
                if (info.limitCredit === "noLimit") {
                    noLimit = true;
                    break;
                }
                maxLimit += info.limitCredit;
            }
        }
        for (const bonus in bonusRoles) {
            const info = bonusRoles[bonus];
            if (user.roles.cache.has(info.role)) {
                if (info.limitCredit === "noLimit") {
                    noLimit = true;
                    break;
                }
                maxLimit += info.limitCredit;
            }
        }
        return maxLimit;
    }

    async removeCredit(id, credit, reason = "Không rõ") {
        if (isNaN(credit) || credit <= 0) return;
        const user = await main.getClient().users.fetch(id);
        if (!user) return;
        await log(`Người dùng **${user.username}** đã bị trừ **${credit}** credit vì **${reason}**!`);
        let currentCredit = await this.getCredit(id);
        if (currentCredit) {
            currentCredit -= credit;
            this.db.run(`UPDATE credits SET credit = ? WHERE id = ?`, [parseInt(currentCredit), id]);
        } else {
            this.db.run(`INSERT INTO credits (id, credit) VALUES (?, ?)`, [id, 0]);
        }
    }

    async getLimit(id) {
        const currentDay = new Date().toLocaleDateString('vi-VN');
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM limitCredit WHERE id = ?`, [id], (err, row) => {
                if (err) {
                    reject(err);
                }
                if (!row) {
                    this.db.run(`INSERT INTO limitCredit (id, currentday, limits) VALUES (?, ?, ?)`, [id, currentDay, 0], () => {
                        resolve(0);
                    })
                    return;
                }
                if (row.currentday !== currentDay) {
                    this.db.run(`UPDATE limitCredit SET currentday = ?, limits = ? WHERE id = ?`, [currentDay, 0, id], () => {
                        resolve({
                            currentday: currentDay,
                            limits: 0
                        });
                    })
                    return;
                }
                resolve(row);
            });
        });
    }

    async addLimit(id, limit) {
        const currentLimit = await this.getLimit(id);
        this.db.run(`UPDATE limitCredit SET limits = ? WHERE id = ?`, [parseInt(currentLimit.limits) + parseInt(limit), id]);
    }

    async getRewardDay(id) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM dailyrewards WHERE discord_id = ?`, [id], (err, row) => {
                if (!row) {
                    resolve(null);
                    return;
                }
                resolve(row.day);
            });
        });
    }

    async setRewardDay(id) {
        const currentday = new Date().toLocaleDateString('vi-VN');
        const rewardDay = await this.getRewardDay(id);
        if (!rewardDay) {
            this.db.run(`INSERT INTO dailyrewards (discord_id, day) VALUES (?, ?)`, [id, currentday]);
            return;
        }
        this.db.run(`UPDATE dailyrewards SET day = ? WHERE discord_id = ?`, [currentday, id]);
    }

    async getPurchased(id) {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM purchased WHERE discord_id = ?`, [id], (err, row) => {
                if (!row) {
                    const purchased = [];
                    this.db.run(`INSERT INTO purchased (discord_id, list) VALUES (?, ?)`, [id, JSON.stringify(purchased)]);
                    resolve(purchased);
                    return;
                }
                resolve(JSON.parse(row.list));
            });
        });
    }

    async addPurchased(id, item) {
        const purchased = await this.getPurchased(id);
        purchased.push(item);
        this.db.run(`UPDATE purchased SET list = ? WHERE discord_id = ?`, [JSON.stringify(purchased), id]);
    }

    async recreatePurchase() {
        this.db.run(`DROP TABLE purchased`);
        this.db.run(`CREATE TABLE IF NOT EXISTS purchased (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                discord_id TEXT NOT NULL,
                list TEXT NOT NULL
            );`);
    }

    async getInvites(id) {
        const currentDay = new Date().toLocaleDateString('vi-VN');
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT * FROM invites WHERE discord_id = ?`, [id], (err, row) => {
                if (!row) {
                    this.db.run(`INSERT INTO invites (discord_id, time, currentday) VALUES (?, ?, ?)`, [id, 0, currentDay])
                    resolve(0);
                    return;
                }
                if (row.currentday !== currentDay) {
                    this.db.run(`UPDATE invites SET currentday = ?, time = ? WHERE discord_id = ?`, [currentDay, 0, id]);
                    resolve(0);
                    return;
                }
                resolve(row.time);
            });
        });
    }

    async addInvite(id) {
        const currentDay = new Date().toLocaleDateString('vi-VN');
        const invites = await this.getInvites(id);
        this.db.run(`UPDATE invites SET time = ?, currentday = ? WHERE discord_id = ?`, [invites + 1, currentDay, id]);
    }
}

module.exports = SQLiteProvider;