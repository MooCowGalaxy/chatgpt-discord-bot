const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const respond = require('../utils/respond');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create')
        .setDescription('Starts a new conversation.')
        .addStringOption(option =>
                option.setName('text')
                    .setDescription('The text to start the conversation with.')
                    .setRequired(false)
                    .setMaxLength(1000))
        .addStringOption(option =>
                option.setName('topic')
                    .setDescription('The topic of the thread.')
                    .setRequired(false)
                    .setMaxLength(100)),
    execute: async (client, interaction) => {
        // get user object from db
        const userInfo = await client.prisma.user.upsert({
            where: {
                userId: interaction.user.id
            },
            update: {},
            create: {
                userId: interaction.user.id,
                hasPermission: 0
            }
        });

        // check for permission
        if (interaction.user.id !== client.config.discord.ownerId) {
            if (!userInfo.hasPermission) {
                await interaction.reply({ content: `Sorry, you do not have permission to use this command.`, ephemeral: true });
                return;
            }
        }

        await interaction.reply({ content: 'Creating thread...' });
        const message = await interaction.fetchReply();

        const count = (await client.prisma.thread.aggregate({
            where: {
                userId: userInfo.id
            },
            _count: {
                id: true
            }
        }))._count.id;

        let threadName;
        if (interaction.options.getString('topic')) {
            threadName = interaction.options.getString('topic');
        } else {
            threadName = `${interaction.user.username}'s ChatGPT Thread #${count}`;
        }

        const threadChannel = await message.startThread({
            name: threadName
        });

        const thread = await client.prisma.thread.create({
            data: {
                user: {
                    connect: {
                        id: userInfo.id
                    }
                },
                threadChannelId: threadChannel.id,
                totalTokens: 0
            }
        });

        await interaction.editReply({ content: 'Created, check the thread attached to this message!' });

        const initialReply = interaction.options.getString('text');
        if (!initialReply) {
            await threadChannel.send({ content: `Hi, how can I help?\n\n*Type a message to start chatting! Messages that start with a \`!\` will be ignored.*` });
        } else {
            const message = await threadChannel.send({ content: `<@${interaction.user.id}> said: ${initialReply}`, flags: [MessageFlags.SuppressNotifications] });

            await respond(client, threadChannel, thread, initialReply.trim(), message.id);
        }
    }
}