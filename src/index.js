#!/usr/bin/env node

import 'dotenv/config';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import config from './config.js';
import registerTools from './register_tools.js';

async function main() {
    const server = new McpServer({
        name: config.app.name,
        version: config.app.version
    });

    registerTools(server);

    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
