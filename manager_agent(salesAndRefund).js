import "dotenv/config";
import { Agent, run, tool } from "@openai/agents";
import { z } from "zod";
import fs from "node:fs/promises";

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

const refundAgent = new Agent({
    name : "refund_agent",
    instructions: "Handle refund requests from customers.",
    tools: [processRefund],
});


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

async function runAgent(query) {
    const result = await run(salesAgent, query);
    console.log("Agent Response:", result.finalOutput);
}

// runAgent(`Hi there I want to know all the available internet broadband plans you have.`);
runAgent(
  `I had a plan 699. I need a refund right now. my cus id is cust_1 because of I am shifting to a new place`
);