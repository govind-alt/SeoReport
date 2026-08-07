const { createClient } = require('@libsql/client');
const db = createClient({ url: 'file:dev.db' });

db.execute('ALTER TABLE Agency ADD COLUMN notificationEmail TEXT')
  .then(() => {
    console.log('SUCCESS: notificationEmail column added to Agency table');
    process.exit(0);
  })
  .catch(e => {
    if (e.message && e.message.includes('duplicate column')) {
      console.log('INFO: Column already exists — nothing to do.');
    } else {
      console.error('ERROR:', e.message);
    }
    process.exit(0);
  });
