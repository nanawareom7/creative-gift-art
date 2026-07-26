/**
 * One-time script: drop the old global slug_1 index from the categories collection
 * so Mongoose can create the new compound { serviceId, slug } unique index.
 *
 * Run once:  node src/scripts/fixCategoryIndex.js
 * Safe to re-run — it skips gracefully if the index no longer exists.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const fix = async () => {
  await connectDB();

  const db = mongoose.connection.db;
  const collection = db.collection('categories');

  try {
    const indexes = await collection.indexes();
    const hasOldIndex = indexes.some((idx) => idx.name === 'slug_1');

    if (hasOldIndex) {
      await collection.dropIndex('slug_1');
      console.log('✅ Dropped old index: categories.slug_1');
    } else {
      console.log('ℹ️  Index categories.slug_1 does not exist — nothing to drop.');
    }

    console.log('✅ Done. Mongoose will create the new compound index on next server start.');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

fix();
