const database = require('better-sqlite3');

const db = new database('log.db');

// Is the database initialized
const stmt = db.prepare(`
    SELECT name FROM sqlite_master WHERE type='table' and name='accesslog';`
    );

// Define row 
let row = stmt.get();



if (row === undefined) {
    console.log('empty datab');
    const sqlInit = `
        CREATE TABLE accesslog (id INTEGER PRIMARY KEY, remoteaddr TEXT, remoteuser TEXT, time TEXT, method TEXT, url TEXT, protocol TEXT, httpversion TEXT, status INTEGER, referer TEXT,  useragent TEXT);
        `;
// Execute SQL commands  above.
    db.exec(sqlInit);
    
} else {
    console.log('Database exists.')
}
module.exports = db