import { z } from 'zod';

/**
 * Tool: execute_english_query
 */
export default function executeEnglishQuery(server, pg, openai, model) {
    server.registerTool(
        'execute_english_query',
        {
            title: 'Turn a plain‐English question into SQL and optionally run it',
            description: 'Translate a question into SQL, optionally execute it',
            inputSchema: {
                query: z.string().describe('Query in english-like natural language.'),
                direct_execute: z.boolean().describe('If true, generates and runs the SQL and returns data; otherwise only returns the generated SQL without executing it.').default(true)
            }
        },
        async ({ query, direct_execute }) => {
            // gather schema info
            const tablesRes = await pg.query(`
        SELECT table_schema, table_name
        FROM information_schema.tables
        WHERE table_type = 'BASE TABLE'
          AND table_schema NOT IN ('pg_catalog','information_schema');
      `);

            const schemaLines = [];
            for (const { table_schema, table_name } of tablesRes.rows) {
                const cols = await pg.query(
                    `SELECT column_name, data_type
           FROM information_schema.columns
           WHERE table_schema = $1
             AND table_name = $2;`,
                    [table_schema, table_name]
                );
                const colsDesc = cols.rows
                    .map(c => `${c.column_name} (${c.data_type})`)
                    .join(', ');
                schemaLines.push(`Table ${table_schema}.${table_name}: ${colsDesc}`);
            }

            // build prompt
            const prompt = `
You are an expert PostgreSQL assistant. 
Your task is to translate a user's question in natural language into a valid PostgreSQL query. 
The dialect is PostgreSQL. Only output the SQL query. 
Do not add any explanation, preamble, or markdown formatting like \`\`\`sql.

Here is the database schema context:
---
${schemaLines.join('\n')}
---

User's question:
"${query}"

Generate the PostgreSQL query.`;

            const chat = await openai.chat.completions.create({
                model,
                messages: [{ role: 'user', content: prompt }]
            });
            const generatedSQL = chat.choices[0].message.content.trim();

            if (direct_execute) {
                const result = await pg.query(generatedSQL);
                return { content: [{ type: 'text', text: JSON.stringify({ sql: generatedSQL, rows: result.rows }) }] };
            }

            return { content: [{ type: 'text', text: JSON.stringify({ sql: generatedSQL }) }] };
        }
    );
}
