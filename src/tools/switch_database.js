import { z } from 'zod';
import { switchDB } from '../db.js';

export default function switchDatabase(server) {
    server.registerTool(
        'switch_database',
        {
            title: 'Switch current database',
            description: 'Switches the active database to the specified one. If an error occurs during the switch, the system automatically reverts back to the previous active database',
            inputSchema: {
                database_name: z.string().describe('Name of the database to switch to.')
            }
        },
        async ({ database_name }) => {
            const error = await switchDB(database_name);
            
            return { 
                content: [{ 
                    type: 'text', 
                    text: error ? `Error while switching to database (${database_name}): \n${error}` : `Successfully switched to database: ${database_name}` 
                }], 
                isError: !!error 
            };
        }
    );
}
