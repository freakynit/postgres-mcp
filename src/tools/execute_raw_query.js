import { z } from 'zod';

/**
 * Tool: execute_raw_query
 */
export default function executeRawQuery(server, pg) {
    server.registerTool(
        'execute_raw_query',
        {
            title: 'Execute a raw SQL query',
            description: 'Execute a raw SQL query',
            inputSchema: { sql: z.string().describe('The SQL statement to run.') }
        },
        async ({ sql }) => {
            const res = await pg.query(sql);
            return { content: [{ type: 'text', text: JSON.stringify(res.rows) }] };
        }
    );
}
