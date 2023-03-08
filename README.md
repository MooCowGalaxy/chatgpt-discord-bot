# ChatGPT Discord Bot
A simple Discord bot that interfaces with OpenAI's API for ChatGPT!
## Features
- Uses threads for conversations, so multiple conversations can be had at the same time
- Includes a permissions system to allow the owner of the bot to allow/deny other users to create conversations (defaults to not allowed)
## Setup
1. Install [node.js](https://nodejs.org/en/download/) v18 or higher
2. Install packages (`npm install`)
3. Copy `config.js.example` to `config.js` and replace the example values
   - Instructions on how to get a discord ID can be found [here](https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-)
   - Your OpenAI API key can be created [here](https://platform.openai.com/account/api-keys)
   - To get the bot token:
     1. Create an application in the [developer portal](https://discord.com/developers/applications)
     2. Once created, click on the Bot tab and create a bot account
     3. Enable the message content intent (required in order for the bot to function)
     4. Copy the token
     5. And lastly, invite the bot to your server
4. Set up the database (`npm run db:deploy` and `npm run db:generate`)
5. Create slash commands (`npm run deploy`)
6. Run the bot (`npm start`)
## Updating
1. Run `git pull` to update the files
2. Install any new packages (`npm install`)
3. Check for new database schema (`npm run db:deploy` and `npm run db:generate`)
4. Update slash commands (`npm run deploy`)