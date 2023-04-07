const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deny')
        .setDescription('Removes permissions from another user to create threads and start conversations.')
        .addUserOption(option => option.setName('user')
            .setDescription('The user to remove access from.')
            .setRequired(true)),
    execute: async (client, interaction) => {
        if (interaction.user.id !== client.config.discord.ownerId) {
            await interaction.reply({ content: `Sorry, you do not have permission to use this command.`, ephemeral: true });
            return;
        }

        if (client.config.settings.allowAnyUserToCreateThreads) {
            await interaction.reply({ content: `All users have permission to create threads. If you want to only allow certain users, set \`allowAnyUserToCreateThreads\` to false in \`config.js\` and restart the bot.`, ephemeral: true });
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

        if (userInfo.hasPermission === 0) {
            await interaction.reply({ content: `<@${user.id}> already not allowed to create conversations.`, ephemeral: true });
            return;
        }

        await client.prisma.user.update({
            where: {
                userId: user.id
            },
            data: {
                hasPermission: 0
            }
        });

        await interaction.reply({ content: `Updated permissions! <@${user.id}> is now not allowed to create conversations.`, ephemeral: true });
    }
}