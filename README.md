# ChatGPT Discord Bot
A simple Discord bot that interfaces with OpenAI's API for ChatGPT!
## Features
- Uses threads for conversations, so multiple conversations can be had at the same time
- Includes a permissions system to allow the owner of the bot to allow/deny other users to create conversations (defaults to not allowed)
## Setup
1. Install [node.js](https://nodejs.org/en/download/) v18 or higher
2. Install packages (`npm install`)
3. Set up the database (`npm run db:deploy` and `npm run db:generate`)
4. Create slash commands (`npm run deploy`)
5. Run the bot (`npm start`)