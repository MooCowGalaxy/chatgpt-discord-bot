// openai: OpenAIApi
// chatHistory: [{userType: int, message: string}]
// newMessage: string
module.exports = async function generateText({ config, openai }, chatHistory, newMessage) {
    let messages = [];

    // initial system prompt
    if (config.openai.initialPrompt?.length > 0) {
        messages.push({
            role: 'system',
            content: config.openai.initialPrompt
        });
    }

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
        response: completion.data.choices[0].message.content.trim(),
        totalTokenUsage: completion.data.usage.total_tokens
    };
}
