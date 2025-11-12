import { z } from 'zod';
import { getClient as getDBClient } from '../db.js';

export default function describeTables(server) {
    server.registerTool(
        'describe_tables',
        {
            title: 'Get complete table description including columns, indexes, triggers, and constraints for one more tables',
            description: 'Get comprehensive table information for one or more tables including columns, indexes, triggers, foreign keys, and constraints',
            inputSchema: {
                table_schema: z.string().describe('Postgres table schema name').default('public'),
                table_names: z.array(z.string()).describe('Array of table names')
            }
        },
        async ({ table_schema, table_names }) => {
            const pg = getDBClient();
            
            const tables = table_names;
            
            const queries = {
                columns: `SELECT table_name, column_name, data_type, is_nullable, column_default, character_maximum_length
                         FROM information_schema.columns
                         WHERE table_schema = $1 AND table_name = ANY($2::text[])
                         ORDER BY table_name, ordinal_position`,
                
                primaryKey: `SELECT kcu.table_name, constraint_name, column_name
                            FROM information_schema.key_column_usage kcu
                            WHERE table_schema = $1 AND table_name = ANY($2::text[])
                              AND constraint_name IN (
                                SELECT constraint_name FROM information_schema.table_constraints
                                WHERE table_schema = $1 AND table_name = ANY($2::text[]) AND constraint_type = 'PRIMARY KEY'
                              )`,
                
                foreignKeys: `SELECT tc.table_name, tc.constraint_name, kcu.column_name, 
                                    ccu.table_schema AS foreign_table_schema,
                                    ccu.table_name AS foreign_table_name,
                                    ccu.column_name AS foreign_column_name
                             FROM information_schema.table_constraints tc
                             JOIN information_schema.key_column_usage kcu 
                                 ON tc.constraint_name = kcu.constraint_name
                             JOIN information_schema.constraint_column_usage ccu 
                                 ON ccu.constraint_name = tc.constraint_name
                             WHERE tc.constraint_type = 'FOREIGN KEY' 
                               AND tc.table_schema = $1 AND tc.table_name = ANY($2::text[])`,
                
                indexes: `SELECT tablename AS table_name, indexname, indexdef
                         FROM pg_indexes
                         WHERE schemaname = $1 AND tablename = ANY($2::text[])`,
                
                triggers: `SELECT event_object_table AS table_name, trigger_name, event_manipulation, action_statement, action_timing
                          FROM information_schema.triggers
                          WHERE event_object_schema = $1 AND event_object_table = ANY($2::text[])`,
                
                checkConstraints: `SELECT tc.table_name, tc.constraint_name, cc.check_clause
                                  FROM information_schema.check_constraints cc
                                  JOIN information_schema.table_constraints tc 
                                      ON cc.constraint_name = tc.constraint_name
                                  WHERE tc.constraint_schema = $1 
                                    AND tc.table_name = ANY($2::text[]) 
                                    AND tc.constraint_type = 'CHECK'`
            };

            const queryResults = {};
            
            for (const [key, query] of Object.entries(queries)) {
                const res = await pg.query(query, [table_schema, tables]);
                queryResults[key] = res.rows;
            }

            const results = tables.reduce((acc, tableName) => {
                acc[tableName] = {
                    columns: queryResults.columns
                        .filter(row => row.table_name === tableName)
                        .map(({ table_name, ...rest }) => rest),
                    
                    primaryKey: queryResults.primaryKey
                        .filter(row => row.table_name === tableName)
                        .map(({ table_name, ...rest }) => rest),
                    
                    foreignKeys: queryResults.foreignKeys
                        .filter(row => row.table_name === tableName)
                        .map(({ table_name, ...rest }) => rest),
                    
                    indexes: queryResults.indexes
                        .filter(row => row.table_name === tableName)
                        .map(({ table_name, ...rest }) => rest),
                    
                    triggers: queryResults.triggers
                        .filter(row => row.table_name === tableName)
                        .map(({ table_name, ...rest }) => rest),
                    
                    checkConstraints: queryResults.checkConstraints
                        .filter(row => row.table_name === tableName)
                        .map(({ table_name, ...rest }) => rest)
                }

                return acc;
            }, {});

            return { 
                content: [{ 
                    type: 'text', 
                    text: JSON.stringify(results, null, 2) 
                }] 
            };
        }
    );
}
