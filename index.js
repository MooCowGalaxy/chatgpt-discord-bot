const { Client, IntentsBitField, MessageType, ChannelType, EmbedBuilder } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const config = require('./config');

const generateText = require('./utils/generateText');

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
    if (![ChannelType.PrivateThread, ChannelType.PublicThread].includes(message.channel.type)) return;
    if (message.content.startsWith('!')) return;

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
    if (thread.user.userId !== message.author.id) return;

    // get previous messages in the chat
    const previousMessages = await client.prisma.message.findMany({
        where: {
            threadId: thread.id
        },
        select: {
            userType: true,
            message: true
        }
    });

    const text = message.content.trim();
    const responseMessage = await message.channel.send({ content: 'Generating response... this may take a bit.' });
    let responseMessageId = responseMessage.id;

    const completion = await generateText(client.openai, previousMessages, text);

    const embed = new EmbedBuilder()
        .setDescription(`Tokens used to generate prompt: ${completion.totalTokenUsage}`)
        .setFooter({ text: `Thread ID: ${thread.id} | Total tokens used in this thread: ${thread.totalTokens + completion.totalTokenUsage}` });

    // send message in thread
    if (completion.response.length < 2000) {
        // 2000 character limit in messages
        await responseMessage.edit({
            content: completion.response,
            embeds: [embed]
        });
    } else {
        // need to split up into multiple messages
        let messages = [];
        let remainingWords = completion.response.split(' ');
        let currentMessage = [];

        while (remainingWords.length > 0) {
            const currentWord = remainingWords[0];
            remainingWords = remainingWords.slice(1);

            const newMessage = [...currentMessage, currentWord];
            if (newMessage.join(' ').length > 2000) {
                messages.push(currentMessage.join(' '));
                currentMessage = [currentWord];
            } else {
                currentMessage.push(currentWord);
            }
        }

        if (currentMessage.length > 0) {
            messages.push(currentMessage.join(' '));
        }

        for (let i = 0; i < messages.length; i++) {
            if (i === messages.length - 1) {
                const res = await message.channel.send({ content: messages[i], embeds: [embed] });
                responseMessageId = res.id;
            } else if (i === 0) {
                await responseMessage.edit({
                    content: messages[i]
                });
            } else {
                await message.channel.send({ content: messages[i] });
            }
        }
    }

    // add new messages to database and increment token count
    await client.prisma.message.create({
        data: {
            thread: {
                connect: {
                    id: thread.id
                }
            },
            userType: 0,
            message: text,
            messageId: message.id,
            tokenCount: 0 // tokens are counted in the bot response
        }
    });
    await client.prisma.message.create({
        data: {
            thread: {
                connect: {
                    id: thread.id
                }
            },
            userType: 1,
            message: completion.response,
            messageId: responseMessageId,
            tokenCount: completion.totalTokenUsage
        }
    });
    await client.prisma.thread.update({
        where: {
            id: thread.id
        },
        data: {
            totalTokens: {
                increment: completion.totalTokenUsage
            }
        }
    });
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
