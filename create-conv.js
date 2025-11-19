import { OpenAI } from 'openai';
import 'dotenv/config';

const client = new OpenAI()
client.conversations.create({}).then(e=>{
    console.log(`Conversation created: ${e.id}`);}
);
// You will get a conversation id in response, you can use it to create a conversation.