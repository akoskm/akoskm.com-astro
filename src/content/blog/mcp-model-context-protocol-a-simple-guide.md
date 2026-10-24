---
title: "MCP, Model Context Protocol: A Simple Guide"
publishedAt: "2025-04-27T07:27:32.693Z"
updatedAt: "2025-04-28T06:26:55.126Z"
description: "Discover the basics of MCP, Model Context Protocol, and how it links AI assistants with tools and content repositories."
brief: "If you've been following the MCP hype and thinking all this time, \"this isn't anything new\", you were right.\nMCPs provide a standardized way to expose resources or capabilities to LLMs. It’s more like a standard than a technology breakthrough. And no..."
readTimeInMinutes: 5
coverImage: "../../assets/posts/mcp-model-context-protocol-a-simple-guide/cover.png"
tags:
  - name: "AI"
    slug: "ai"
  - name: "mcp"
    slug: "mcp"
  - name: "TypeScript"
    slug: "typescript"
  - name: "Web Development"
    slug: "web-development"
series: null
draft: false
---

If you've been following the MCP hype and thinking all this time, "this isn't anything new", you were right.

MCPs provide a standardized way to expose resources or capabilities to LLMs. It’s more like a standard than a technology breakthrough. And now you’re thinking, we can expose app capabilities through REST endpoints as we’ve been doing it for decades?

Again, you’re not wrong.

So why do we need a standard?

Imagine we’re creating an app that can suggest events in a city based on the weather. If it’s a rainy day, you might go to a tech conference and listen to your favorite tech personality. If it’s sunny, you might listen to some music in the open.

The architecture before MCPs for such an app looked something like this:

![](../../assets/posts/mcp-model-context-protocol-a-simple-guide/c5b5bdba-f4c4-4c33-88c1-4ddd3bb5b731.png)

Then you also might have used multiple weather API, in case one wasn’t available or you wanted to compare different results:

```plaintext
# Weather API 1
GET /api/v1/london/forecast-10-days
# Weather API 2
GET /api/v1/forecast?d=10&city=london
```

The LLM doesn't know how to interact with these APIs, so you'd have to hardcode the host, the endpoints, the HTTP method, the query keys or path params, the request and response format.

And this works fine until you have two weather APIs around the globe, but what if there are more? Similar to this, there can be tons of websites suggesting events, but each doing it slightly differently.

If you want to create an LLM that can suggest events based on the weather for the next few days, this is a lot of endpoints to hardcode.

But this is where MCP comes into play!

# The MCP Architecture {#heading-the-mcp-architecture}

MCP is a client-server architecture at its core.

## The Host {#heading-the-host}

The host is your application, which gathers input from the user, such as where they are located right now and when they’re looking for some activity.

The host initiates the connection to the MCP Server using an MCP client.

## MCP Client {#heading-mcp-client}

The client is part of the Host application, and its role is to:

* Initiate and maintain a connection with the MCP Server
    
* Discover what the MCP Server can do for the client
    

Here’s an example of calling the Weather MCP server for a specific city:

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { HttpClientTransport } from "@modelcontextprotocol/sdk/client/http.js";

async function useWeatherMCP() {
  const client = new Client({ name: "weather-client", version: "1.0.0" });
  await client.connect(new HttpClientTransport({ url: "http://localhost:3000" }));
  
  const result = await client.executeResource({
    name: "weather/forecast",
    arguments: { city: "london" }
  });
  
  console.log("Weather forecast:", result.data.forecast);
}
```

## MCP Server {#heading-mcp-server}

The MCP Server is responsible for the execution of prompts, tool calls, and resource access.

Here’s an example of a Weather MCP that returns the forecast for a city based on some static data:

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { HttpServerTransport } from "@modelcontextprotocol/sdk/server/http.js";

const weatherData = {
  "london": [{ date: "2025-04-27", temperature: 15, condition: "Sunny" }]
};

const server = new Server(
  { name: "weather-server", version: "1.0.0" },
  { capabilities: { resources: { weather: {} } } }
);

// This is how you expose the weather forecast resource
server.setRequestHandler("ListResources", async () => ({
  resources: [{
    name: "weather/forecast",
    description: "Get weather forecast",
    arguments: [{ name: "city", required: true }],
    mimeType: "application/json",
  }]
}));

// Handle weather forecast requests
server.setRequestHandler("ExecuteResource", async (request) => {
  if (request.params.name === "weather/forecast") {
    // This is where the magic happens, but I'm just returning some dummy data
    const city = request.params.arguments.city.toLowerCase();
    return { data: { forecast: weatherData[city] || [] } };
  }
});

new HttpServerTransport({ port: 3000 }).connect(server);
```

# What makes MCPs special? {#heading-what-makes-mcps-special}

The protocol.

A standardized way to list available resources, tools, and prompts that the MCP can recognize, run, and answer.

No new AI black magic here, simply an agreement on how MCP Servers and Clients communicate.

![](../../assets/posts/mcp-model-context-protocol-a-simple-guide/b6d0cd77-89b1-424d-bca8-1d0855872858.png)

If I had to summarize the main takeaway of all this, to me it would be that MCP Client will always know what they can do with MCP Servers using the following API:

```typescript
client.listPrompts
client.listResources
client.listTools
```

We went from storing how we can interact with different servers and APIs to asking those APIs what they can do for us.

This is so much better than having those endpoints hardcoded because the LLMs can just ask the servers what they can do for them.

This eliminates most of the work that came from staying up to date with API formats, for example, adapting your app to handle a new URL or the removal of a field from the response.

# How LLMs fit into this? {#heading-how-llms-fit-into-this}

So far, we’ve only seen writing code to discover what tools, resources, and prompts we have available on the server. And we’ve been doing this manually, by calling the right commands, so where does the LLM come into play?

The LLM acts as a mediator between your input and selecting the right action based on the server's capabilities.

So in the case of our event suggestion app, you’d tell the application something like this:

*Find me something to do tomorrow at 4PM.*

Then rely on the LLM to select what tool to interact with. This is how this would look in the code:

```typescript
const userQuery = req.body.query;

const client = new Client({ name: "event-client", version: "1.0.0" });
const availableTools = client.listTools();

const prompt = `
  You're an assistant that interacts with an MCP Server that has the following
  tools available ${JSON.stringify(availableTools}}. Select the approriate tool
  based on the clients query ${userQuery} and extra the parameters to call it.
`;

const toolSelection = await this.openai.chat.completions.create({
  messages: [
    {
      "role": "system",
      "content": prompt
    },
    ...messages
  ],
  model: "gpt-4o-mini",
});

// Call the selected tool
const result = await client.callTool({
  name: toolSelection.tool,
  arguments: toolSelection.arguments,
});
```

# Further Read {#heading-further-read}

* Introduction: [https://modelcontextprotocol.io](https://modelcontextprotocol.io)
    
* Example MCP Servers to study: [https://modelcontextprotocol.io/examples](https://modelcontextprotocol.io/examples)
    
    I recommend you look at the PostgreSQL example: [https://github.com/modelcontextprotocol/servers/blob/main/src/postgres/index.ts](https://github.com/modelcontextprotocol/servers/blob/main/src/postgres/index.ts)
    
* MCP Inspector to develop and debug MCPs: [https://modelcontextprotocol.io/docs/tools/inspector](https://modelcontextprotocol.io/docs/tools/inspector)
    
* A huge list of MCP Servers you can use: [https://github.com/punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers)
    

# What’s Next? {#heading-whats-next}

Try to run an MCP Server.

Here’s how to get started:

1. Create a node TypeScript project with Node and use the MCP Server from the Quickstart [here](https://github.com/modelcontextprotocol/typescript-sdk?tab=readme-ov-file#quick-start).
    
2. Run the server
    
3. Use the [Inspector tool](https://modelcontextprotocol.io/docs/tools/inspector) to list the available resources
    

I’ll be writing a short and useful book on building MCP Servers, Clients, and using them in your apps. If you’d like to get an email when the book is out, you can subscribe [here](https://akoskm.gumroad.com/l/mcp).
