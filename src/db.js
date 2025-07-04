import { Client } from 'pg';

export default function createDbClient(dbConfig) {
    return new Client(dbConfig);
}
