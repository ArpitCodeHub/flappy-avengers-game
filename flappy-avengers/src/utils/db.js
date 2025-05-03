import Dexie from 'dexie';

const db = new Dexie('flappyAvengers');

// Define database schema with tables and indexes
db.version(1).stores({
  users: '++id, username', // Primary key is id, username is indexed
  gameProgress: 'userId, *unlockedBirds' // userId is primary key, unlockedBirds is multi-valued index
});

export default db;