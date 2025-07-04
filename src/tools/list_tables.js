/**
 * Tool: list_tables
 */
export default function listTables(server, pg) {
    server.registerTool(
        'list_tables',
        {
            title: 'List all user tables in the database',
            description: 'List all user tables in the database'
        },
        async () => {
            const res = await pg.query(`
        SELECT table_schema, table_name
        FROM information_schema.tables
        WHERE table_type = 'BASE TABLE'
          AND table_schema NOT IN ('pg_catalog','information_schema');
      `);
            return { content: [{ type: 'text', text: JSON.stringify(res.rows) }] };
        }
    );
}
