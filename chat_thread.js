 import 'dotenv/config';
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";

let sharedHistory = [];

const executeSQLQuery = tool({
    name: "execute_sql_query",
    description: "Execute a SQL query on the database and return the results.",
    parameters: z.object({
        sql: z.string().describe("The SQL query to be executed"),
    }),
    execute: async function ({ sql }) {
        // Mock database response for demonstration purposes
        console.log("Executing SQL Query:", sql);
        return 'done'
    }
});

const sqlAgent = new Agent({
    name: "SQL Agent",
    instructions: `
    You are an expert SQL agent that is specialized in generating SQL queries based on user requests.
    Postgress Schema:
    -- users table
    CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    -- comments table
    CREATE TABLE comments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        comment_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `,
    tools: [executeSQLQuery],
})

async function main(q='') {
     
    sharedHistory.push({role: 'user', content: q});
    const result = await run(sqlAgent, sharedHistory);
    sharedHistory = result.history;
    // console.log("Agent Response:", result.history);
}

await main(`Hi my name is Avi bansal`);
await main(`Give me a list of all users who have the same name as me`);
