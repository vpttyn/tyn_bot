const Discord = require("discord.js");
const fs = require('fs');
const {Routes} = require('discord-api-types/v10');
const SQLiteProvider = require("./storage/SQLiteProvider");
const express = require('express');
const {NetworkManager} = require("./network/NetworkManager");

class Client {

    constructor() {
        this.initConfig();
        this.loadApp().then();
        process.on('unhandledRejection', error => {
            console.log(error);
        })
        process.on('uncaughtException', error => {
            console.log(error);
        })
    }

    async loadApp() {
        this.app = express();
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }))
        this.networkManager = new NetworkManager(this.app);
        this.networkManager.registerResponses();
        this.networkManager.registerNetworkURL();
        this.app.listen(3000, () => {
            console.log(
                `VPT app listening at http://localhost:3000`
            );
        });
        this.app.keepAliveTimeout = 20 * 1000;
        this.app.headersTimeout = 40 * 1000;
    }

    registerEvents() {
        const eventDir = fs.readdirSync('./src/events');
        for (const dir of eventDir) {
            const eventFiles = fs.readdirSync(`./src/events/${dir}`).filter(file => file.endsWith('.js'));
            for (const file of eventFiles) {
                const event = require(`./events/${dir}/${file}`);
                if (event.once) {
                    this.client.once(event.name, (...args) => event.execute(...args));
                } else {
                    this.client.on(event.name, (...args) => event.execute(...args));
                }
            }
        }
        console.log(`Loaded ${eventDir.length} events!`)
    }

    async registerCommands() {
        this.getClient().commands = new Discord.Collection();
        const commandFiles = fs.readdirSync('./src/commands');
        let commands = [];
        for (const file of commandFiles) {
            const command = require(`./commands/${file}`);
            await this.getClient().commands.set(command.data.name, command)
            commands.push(command.data.toJSON());
        }
        try {
            const rest = new Discord.REST({version: '10'}).setToken(process.env.BOT_TOKEN);
            try {
                await rest.put(
                    Routes.applicationCommands(process.env.BOT_ID),
                    {body: commands},
                )
            } catch (e) {
                console.log(e.message);
            }
        } catch (e) {
            console.log(e.message)
        }
        console.log(`Loaded ${commandFiles.length} commands!`)
    }

    initConfig() {
        this.database = new SQLiteProvider();
        this.database.init();
    }

    /**
     *
     * @returns {SQLiteProvider}
     */
    getDatabase() {
        return this.database;
    }

    getClient() {
        return this.client;
    }

    login() {
        this.client = new Discord.Client({
            intents: [
                Discord.GatewayIntentBits.Guilds,
                Discord.GatewayIntentBits.GuildMessages,
                Discord.GatewayIntentBits.GuildMembers,
                Discord.GatewayIntentBits.GuildPresences,
                Discord.GatewayIntentBits.GuildMessageTyping,
                Discord.GatewayIntentBits.DirectMessages,
                Discord.GatewayIntentBits.MessageContent,
                Discord.GatewayIntentBits.GuildVoiceStates,
                Discord.GatewayIntentBits.GuildInvites
            ],
            partials: [
                Discord.Partials.Message,
                Discord.Partials.GuildMember,
                Discord.Partials.User
            ]
        });
        this.client.intervals = {};
        this.client.queues = [];
        this.client.guildInvites = new Map();
        this.client.login(process.env.BOT_TOKEN).then(async r => {
            this.registerEvents();
            await this.registerCommands();
            console.log("Logged in as " + this.client.user.tag);
        });
    }
}

module.exports = {
    Client
};