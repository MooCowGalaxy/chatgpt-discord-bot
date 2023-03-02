const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const config = require('./config');
const fs = require('fs');

let commands = [];

const commandFiles = fs.readdirSync('./commands');

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    commands.push(command.data.toJSON());
}

const rest = new REST({version: '9' }).setToken(config.discord.token);

(async () => {
    try {
        console.log('Refreshing slash commands...');

        await rest.put(
            Routes.applicationCommands(config.discord.clientId),
            { body: commands }
        );

        console.log('Successfully refreshed slash commands.');
    } catch (error) {
        console.error(error);
    }
})();

