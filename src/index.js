import 'dotenv/config';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import config from './config.js';
import createDbClient from './db.js';
import createOpenAIClient from './openai_client.js';
import registerTools from './register_tools.js';

async function main() {
    const pg = createDbClient(config.db);
    await pg.connect();

    const openai = createOpenAIClient(config.openai);

    const server = new McpServer({
        name: config.app.name,
        version: config.app.version
    });

    registerTools(server, pg, openai, config.openai.model);

    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.log(`Stdio server running`);
}

main().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
