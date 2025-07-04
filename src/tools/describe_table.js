import { z } from 'zod';

/**
 * Tool: describe_table
 */
export default function describeTable(server, pg) {
    server.registerTool(
        'describe_table',
        {
            title: 'Get column names and types for a given table',
            description: 'Get column names and types for a given table',
            inputSchema: {
                table_schema: z.string().describe('Postgres table schema name.').default('public'),
                table_name: z.string().describe('Table name.')
            }
        },
        async ({ table_schema, table_name }) => {
            const res = await pg.query(
                `SELECT column_name, data_type, is_nullable
         FROM information_schema.columns
         WHERE table_schema = $1
           AND table_name = $2;`,
                [table_schema, table_name]
            );
            return { content: [{ type: 'text', text: JSON.stringify(res.rows) }] };
        }
    );
}
