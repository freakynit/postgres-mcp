import listTables from './tools/list_tables.js';
import describeTables from './tools/describe_table.js';
import executeRawQuery from './tools/execute_raw_query.js';
import switchDatabase from './tools/switch_database.js';

export default function registerTools(server) {
    listTables(server);
    describeTables(server);
    executeRawQuery(server);
    switchDatabase(server);
}
