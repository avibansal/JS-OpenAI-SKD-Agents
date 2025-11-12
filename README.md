# JS Agent with OpenAI SDK

## Overview
This project demonstrates a weather agent built using the OpenAI Agents SDK. The agent can fetch and report current weather information for specified cities.

## Project Structure
- **index.js** - Main application file containing the agent setup and execution
- **package.json** - Project dependencies and scripts
- **.env** - Environment variables (not tracked in git)

## Features
- **Weather Agent**: An AI agent that provides weather reports for any city
- **Weather Tool**: A tool that fetches real-time weather data using the wttr.in API
- **Structured Output**: Uses Zod schemas to define expected output format

## How It Works

### 1. Weather Tool (`getWeatherTool`)
- Accepts a city name as input
- Fetches weather data from `https://wttr.in/` API
- Returns temperature and weather condition

### 2. Weather Agent (`Agent`)
- Configured with the `get_weather` tool
- Processes natural language queries about weather
- Returns structured output matching `getWeatherResultSchema`

### 3. Output Schema
The agent returns weather information in the following format:
```json
{
  "city": "string",
  "degree_c": "string",
  "condition": "string"
}
```

## Running the Project

Install dependencies:
```bash
npm install
```

Run the agent:
```bash
npm run dev
```

## Example Usage
The agent processes queries like:
```
"What's the weather like in New Delhi today?"
```

## Dependencies
- **@openai/agents** - OpenAI Agents SDK for building AI agents
- **axios** - HTTP client for API requests
- **dotenv** - Environment variable management
- **zod** - Schema validation and documentation

## Requirements
- Node.js (with ES modules support)
- OpenAI API key (stored in `.env`)