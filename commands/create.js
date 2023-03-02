const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create')
        .setDescription('Starts a new thread.'),
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

        const thread = await message.startThread({
            name: `${interaction.user.username}'s ChatGPT Thread #${count}`
        });

        await client.prisma.thread.create({
            data: {
                user: {
                    connect: {
                        id: userInfo.id
                    }
                },
                threadChannelId: thread.id,
                totalTokens: 0
            }
        });

        await thread.send({ content: `Hi, how can I help?\n\n*Type a message to start chatting! Messages that start with a \`!\` will be ignored.*` });

        await interaction.editReply({ content: 'Created, check the thread attached to this message!' });
    }
}