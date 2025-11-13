import 'dotenv/config';
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import fs from "node:fs/promises";
import {RECOMMENDED_PROMPT_PREFIX} from "@openai/agents-core/extensions"

// Refund Agent to handle refund requests

const processRefund = tool({
    name : "process_refund",
    description: `This tool process the refund for a customer`,
    parameters: z.object({
        customer_id: z.string().describe("The unique identifier for the customer"),
        reason: z.string().describe("The reason for the refund request"),
    }),
    execute: async function({customer_id, reason}) {
        await fs.appendFile(`./refund.txt`, `Customer ID: ${customer_id}, Reason: ${reason}\n`, "utf-8");
        return {returnIssued: true};
    },
});
const fetchAvailablePlans = tool({
    name: "fetch_available_plans",
    description: "Fetch the available internet broadband plans.",
    parameters: z.object({}),
    execute: async function() {
     return [
        {plan_id: '1', price_inr:399, speed_mbps:100, data_gb:500},
        {plan_id: '2', price_inr:699, speed_mbps:300, data_gb:1500},
        {plan_id: '3', price_inr:999, speed_mbps:500, data_gb:3000},
     ]
    }
});

const refundAgent = new Agent({
    name : "refund_agent",
    instructions: "Handle refund requests from customers.",
    tools: [processRefund],
});

// Sales Agent to interact with customers
const salesAgent = new Agent({
    name: "Sales Agent",
    instructions: `
    You are a expert sales agent for an internet broadband company.
    Talk to the user and help them with what they need
    `,
    tools: [fetchAvailablePlans, refundAgent.asTool({
        toolName: "refund_expert",
        toolDescription: "An expert agent that handles refund requests from customers.",
    })],
});



const receptionAgent = new Agent({
    name: "Reception Agent",
    instructions: `
    ${RECOMMENDED_PROMPT_PREFIX}
    You are the customer facing agent expert in understanding customer queries and
    routing them to the appropriate expert agents.
    `,
    hamdoffDiscription: `You have two agents under you.
    1. Sales Agent: An expert sales agent for an internet broadband company.
    2. Refund Agent: An expert agent that handles refund requests from customers.
    `,
    handoffs: [salesAgent, refundAgent]
})

async function main(query) {
    const result = await run(receptionAgent, query);
    console.log("Agent Response:", result.finalOutput);
    // console.log(`History`,result.history);
}

main(`
    Hey there can you tell me which internet broadband plans you have? and i also need a refund for my previous plan because I am shifting to a new place. my customer id is cust_2
`);