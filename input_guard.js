import { Agent,run ,InputGuardrailTripwireTriggered} from "@openai/agents";
import "dotenv/config";
import z from "zod";

const mathInputAgent = new Agent({
    name: "Maths query checker",
    instructions: `
    You are an expert maths agent that can identify if the user query is a mathematical problem or not.
    `,
    outputType:z.object({
        isValidMathProblem: z.boolean().describe("if the query is a valid mathematical problem or not"),
    }),
});
const mathInputGuardrail = {
    name : "Math Input Guardrail",
    execute: async ({input}) => {
    const result = await run(mathInputAgent, input);
    console.log("Input Guardrail Result:", result.finalOutput);
    return {
        tripwireTriggered: !result.finalOutput.isValidMathProblem,
    }
}}


const mathsAgent = new Agent({
    name: "Maths Agent",
    instructions: `
    You are an expert maths agent that can solve complex mathematical problems.
    `,
    inputGuardrails: [mathInputGuardrail],
});

async function name(q = '') {
    const result = await run(mathsAgent, q);
    console.log("Agent Response:", result.finalOutput);
}

try {
    await name(`What is the integral of x^2 + 2x + 1`);
    await name (`Who is the president of USA?`);
} catch (e) {
    if (e instanceof InputGuardrailTripwireTriggered) {
        console.log("Tripwire Triggered: The input was not a valid mathematical problem.");
    } else {
        throw e;
    }
}
