import { Agent ,run,tool} from "@openai/agents";
import 'dotenv/config';
import {z} from "zod"; 
import axios from 'axios';

const getWeatherResultSchema = z.object({
    city: z.string().describe('name of the city'),
    degree_c: z.string().describe('the temperature in degree celsius'),
    condition: z.string().describe('the weather condition'),
});

const getWeatherTool = tool({
  name: 'get_weather',
  description: 'returns the current weather information for the given city',
  parameters: z.object({
    city: z.string().describe('name of the city'),
  }),
  execute: async function ({ city }) {
    const url = `https://wttr.in/${city.toLowerCase()}?format=%C+%t`;
    const response = await axios.get(url, { responseType: 'text' });
    console.log(response.data);
    return `The weather of ${city} is ${response.data}`;
  },
});


const agent = new Agent({
    name : "Weather Agent",
    instructions : "You are an expert weather agent that helps user to tell weather report.",
    tools : [getWeatherTool],
    outputType : getWeatherResultSchema,
});

async function main(query='') {
    const result = await run(agent, query );
    console.log(result.finalOutput);
}

main("What's the weather like in New Delhi today?");