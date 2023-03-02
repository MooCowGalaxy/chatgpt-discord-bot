const config = require('../config');

// openai: OpenAIApi
// chatHistory: [{userType: int, message: string}]
// newMessage: string
module.exports = async function generateText(openai, chatHistory, newMessage) {
    let messages = [];
    for (const message of chatHistory) {
        messages.push({
            role: ['user', 'assistant'][message.userType],
            content: message.message
        });
    }

    messages.push({
        role: 'user',
        content: newMessage
    });

    const completion = await openai.createChatCompletion({
        model: config.openai.modelName,
        messages
    });

    return {
        response: completion.data.choices[0].message.content,
        totalTokenUsage: completion.data.usage.total_tokens
    };
}