import { Client } from 'pg';
import config from './config.js';

let pg = null;

(async () => {
    await switchDB(config.db.database);
})();

export async function switchDB(newDB) {
    const originalDB = config.db.database;
    config.db.database = newDB;
    
    let pg2 = null;
    try {
        pg2 = new Client(config.db);
        await pg2.connect();
    } catch (err) {
        config.db.database = originalDB;
        return err;
    }

    pg = pg2;
    return null;
}

export function getClient() {
    return pg;
}
