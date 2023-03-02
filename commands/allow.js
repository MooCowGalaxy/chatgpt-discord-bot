const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('allow')
        .setDescription('Allows another user to create threads and start conversations.')
        .addUserOption(option => option.setName('user')
            .setDescription('The user to allow access to.')
            .setRequired(true)),
    execute: async (client, interaction) => {
        if (interaction.user.id !== client.config.discord.ownerId) {
            await interaction.reply({ content: `Sorry, you do not have permission to use this command.`, ephemeral: true });
            return;
        }

        const user = interaction.options.getUser('user');

        const userInfo = await client.prisma.user.upsert({
            where: {
                userId: user.id
            },
            update: {},
            create: {
                userId: user.id,
                hasPermission: 0
            }
        });

        if (userInfo.hasPermission === 1) {
            await interaction.reply({ content: `<@${user.id}> already has permission to create conversations.`, ephemeral: true });
            return;
        }

        await client.prisma.user.update({
            where: {
                userId: user.id
            },
            data: {
                hasPermission: 1
            }
        });

        await interaction.reply({ content: `Updated permissions! <@${user.id}> is now able to create conversations.`, ephemeral: true });
    }
}