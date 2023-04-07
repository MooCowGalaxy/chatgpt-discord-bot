const { Client, IntentsBitField, ChannelType } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const config = require('./config');

const respond = require('./utils/respond');

const client = new Client({
    intents: new IntentsBitField([
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ])
});
const prisma = new PrismaClient();

const configuration = new Configuration({
    apiKey: config.openai.key
});

client.config = config;
client.prisma = prisma;
client.openai = new OpenAIApi(configuration);

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}.`);
});

client.on('messageCreate', async message => {
    // filter out messages from normal text channels
    if (![ChannelType.PrivateThread, ChannelType.PublicThread].includes(message.channel.type)) return;
    // make sure the message isn't prefixed to ignore
    if (message.content.startsWith(config.settings.ignoreMessagePrefix)) return;
    // do not reply to self or other bots
    if (message.author.bot) return;

    const threadId = message.channel.id;

    // find associated thread object in db
    const thread = await client.prisma.thread.findUnique({
        where: {
            threadChannelId: threadId
        },
        include: {
            user: true
        }
    });

    // check for user and reply
    if (!thread) return;
    if (!config.settings.allowAnyUserToReplyThreads && thread.user.userId !== message.author.id) return;

    await respond(client, thread, message);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const commandName = interaction.commandName;
    if (!fs.existsSync(`./commands/${commandName}.js`)) {
        await interaction.reply({ content: `That command doesn't exist.`, ephemeral: true });
        return;
    }

    const command = require(`./commands/${commandName}`);
    try {
        await command.execute(client, interaction);
    } catch (e) {
        console.error(e);
        await interaction.reply({ content: `Something went wrong while running the command.`, ephemeral: true });
    }
});

client.login(config.discord.token).then();
