const { EmbedBuilder } = require('discord.js');
const generateText = require('./generateText');

module.exports = async function respond(client, thread, message) {
    const text = message.content.trim();

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

    const responseMessage = await message.reply({ content: 'Generating response... this may take a bit.' });
    let responseMessageId = responseMessage.id;

    const completion = await generateText(client, previousMessages, text);

    const embed = new EmbedBuilder()
        .setDescription(`Tokens used to generate response: ${completion.totalTokenUsage}`)
        .setFooter({ text: `Thread ID: ${thread.id}\nTotal tokens used in this thread: ${thread.totalTokens + completion.totalTokenUsage}` });

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
            messageId: responseMessage.id,
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
}