import { z } from 'zod';
import pkg from 'node-sql-parser';
const { Parser } = pkg;
import { getClient as getDBClient } from '../db.js';

const parser = new Parser();

const readOnlyOps = ['SELECT', 'EXPLAIN', 'SHOW', 'VALUES'];
const readWriteOps = ['INSERT', 'UPDATE', 'DELETE', 'MERGE'];
const dangerousOps = [
    'CREATE', 'ALTER', 'DROP', 'TRUNCATE', 'GRANT', 'REVOKE',
    'COMMENT', 'REINDEX', 'CLUSTER', 'VACUUM', 'ANALYZE',
    'SET', 'RESET', 'DISCARD', 'SECURITY', 'COPY', 'CALL', 'DO',
    'ALTER SYSTEM', 'ALTER DATABASE', 'IMPORT FOREIGN SCHEMA', 'CREATE EXTENSION',
    'DROP EXTENSION', 'LOAD', 'LISTEN', 'UNLISTEN', 'NOTIFY', 'REFRESH MATERIALIZED VIEW'
];

const permissionLevels = {
    'read_only': 0,
    'read_write': 1,
    'admin': 2
};

const opToPermission = {};

for (const op of readOnlyOps) opToPermission[op] = 'read_only';
for (const op of readWriteOps) opToPermission[op] = 'read_write';
for (const op of dangerousOps) opToPermission[op] = 'admin';

export default function executeRawQuery(server) {
    server.registerTool(
        'execute_raw_query',
        {
            title: 'Execute a SQL query',
            description: 'Execute a SQL query. The system will automatically detect the required permission level and request user approval for write operations and dangerous DDL commands.',
            inputSchema: {
                sql: z.string().describe('The SQL statement to run.'),
                dry_run: z.boolean()
                    .optional()
                    .default(false)
                    .describe('If true, validates the query without executing it')
            }
        },
        async ({ sql, dry_run }) => {
            const pg = getDBClient();

            try {
                const response = await handlePermissionsAndDryFlag(sql, dry_run);
                if (response) {
                    return response;
                }

                const result = await pg.query(sql);
                
                const responseText = result 
                    ? result.rows.length > 0
                        ? JSON.stringify(result.rows, null, 2)
                        : `Query executed successfully. Rows affected: ${result.rowCount || 0}` 
                    : 'Query executed successfully (no result).';

                return {
                    content: [{
                        type: 'text',
                        text: responseText
                    }]
                };

            } catch (parseError) {
                return {
                    content: [{
                        type: 'text',
                        text: `Error: ${parseError.message}`
                    }],
                    isError: true
                };
            }
        }
    );

    async function handlePermissionsAndDryFlag(sql, dryRun) {
        const ast = parser.astify(sql, { database: 'PostgresQL' });
        const operations = Array.isArray(ast) ? ast : [ast];

        const opTypes = [...new Set(operations.map(op => (op.type || 'UNKNOWN').toUpperCase()))];

        // determine needed permission level
        let requiredPermission = 'read_only';
        let isDangerous = false;

        for (const opType of opTypes) {
            if (dangerousOps.includes(opType) || opType === 'UNKNOWN') {
                requiredPermission = 'admin';
                isDangerous = true;
                break;
            } else if (readWriteOps.includes(opType)) {
                requiredPermission = 'read_write';
            }
        }

        // permission reqyest from user
        if (requiredPermission !== 'read_only') {
            const permissionMessage = isDangerous
                ? `⚠️ DANGEROUS OPERATION DETECTED ⚠️\n\nThis query contains DDL operations (${opTypes.join(', ')}) that can permanently alter or delete database structures.\n\n | Query: ${sql}\n\n | Do you want to proceed?`
                : `This query contains DML operations (${opTypes.join(', ')}) that will modify data.\n\n | Query: ${sql}\n\n | Do you want to proceed?`;

            const result = await server.server.elicitInput({
                message: permissionMessage,
                requestedSchema: {
                    type: 'object',
                    properties: {
                        permission_level: {
                            type: 'string',
                            title: 'Grant Permission',
                            description: 'Select the permission level to grant for this operation',
                            enum: ['deny', 'read_write', 'admin'],
                            enumNames: [
                                'Deny Operation - Do not proceed ahead with current query',
                                'Read/Write - Allow SELECT/INSERT/UPDATE/DELETE',
                                'Admin - Allow all operations including DDL'
                            ]
                        }
                    },
                    required: ['permission_level']
                }
            });

            // Handle user response
            if (result.action === 'decline' || result.action === 'cancel') {
                return {
                    content: [{
                        type: 'text',
                        text: `Operation ${result.action === 'decline' ? 'declined' : 'cancelled'} by user.`
                    }],
                    isError: false
                };
            }

            if (result.action === 'accept') {
                const grantedPermission = result.content?.permission_level;

                // // Check if user denied permission
                if (grantedPermission === 'deny') {
                    return {
                        content: [{
                            type: 'text',
                            text: `Operation denied by user. Not proceeding ahead with current query: ${sql}`
                        }],
                        isError: false
                    };
                }

                // Validate granted permission meets requirement
                if (permissionLevels[grantedPermission] < permissionLevels[requiredPermission]) {
                    return {
                        content: [{
                            type: 'text',
                            text: `Permission denied: Operation requires "${requiredPermission}" but only "${grantedPermission}" was granted.`
                        }],
                        isError: true
                    };
                }
            } else {
                return {
                    content: [{
                        type: 'text',
                        text: `Invalid choice`
                    }],
                    isError: true
                };
            }
        }

        // Dry run mode
        if (dryRun) {
            return {
                content: [{
                    type: 'text',
                    text: `Query validated successfully.\nOperations: ${opTypes.join(', ')}\nRequired permission level: ${requiredPermission}\nQuery would execute: ${sql}`
                }]
            };
        }
    }
}
