import 'dotenv/config';
import { z } from "zod";

import { Agent, OutputGuardrailTripwireTriggered, run } from '@openai/agents';

const sqlGuardrailAgent = new Agent({
    name: "SQL Guardrail Agent",
    instructions: `
    Check if query is safe to execute against the database.
    The query should be read only and should not modify any data.
    `,
    outputType: z.object({
        reason: z.string().describe("The reason why the query is not safe to execute. If the query is safe, return an empty string."),
        is_safe: z.boolean().describe("Indicates whether the SQL query is safe to execute or not."),
    }),
})

const sqlGuardrail = {
    name: "sql_guardrail",
    async  execute ({agentOutput}) {
        const result = await run(sqlGuardrailAgent, agentOutput.sqlQuery);
        return {
            outputInfo: result.finalOutput.reason,
            tripwireTriggered: !result.finalOutput.is_safe,
        }
    }
}

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
    outputType: z.object({
        sqlQuery: z.string().nullable().optional().describe(`
            The SQL query generated based on the user request.
        `),
    }),
    outputGuardrails: [sqlGuardrail],
})

async function main(q='') {
    const result = await run(sqlAgent, [{role: 'user', content: q}]);
    console.log("Agent Response:", result.finalOutput.sqlQuery);
}

try {
    await main(`List all users who signed up in the last 7 days.`)
    await main(
    `Delete all users who have the same name as 'Avi Bansal'`
)
} catch (e) {
    if (e instanceof OutputGuardrailTripwireTriggered) {
        console.error("Tripwire Triggered:", e.guardrailOutputInfo);
    } else {
        console.error("Error:", e);
    }    
}


