import executeRawQuery from './tools/execute_raw_query.js';
import listTables from './tools/list_tables.js';
import describeTable from './tools/describe_table.js';
import executeEnglishQuery from './tools/execute_english_query.js';

export default function registerTools(server, pg, openai, model) {
    executeRawQuery(server, pg);
    listTables(server, pg);
    describeTable(server, pg);
    executeEnglishQuery(server, pg, openai, model);
}
