import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/formpilot_db';

const COLLECTIONS_MAP: Record<string, string> = {
  components: 'components',
  registration_templates: 'registrationtemplates',
  registrations: 'registrations',
  users: 'users',
  integrations: 'integrations',
  audit_logs: 'auditlogs',
  email_campaigns: 'emailcampaigns',
  system_settings: 'systemsettings',
};

async function migrateLocalToDb() {
  console.log('=== FormPilot: Migrate Local Data Store -> MongoDB ===');
  console.log(`Connecting to MongoDB: ${MONGODB_URI}`);

  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });
  console.log('✓ Connected to MongoDB successfully.\n');

  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    console.log('No local ./data directory found. Nothing to migrate.');
    await mongoose.disconnect();
    process.exit(0);
  }

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database instance is undefined');
  }

  for (const [fileKey, mongoCollection] of Object.entries(COLLECTIONS_MAP)) {
    const filePath = path.join(dataDir, `${fileKey}.json`);
    if (!fs.existsSync(filePath)) {
      continue;
    }

    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const items: any[] = JSON.parse(raw);
      if (!Array.isArray(items) || items.length === 0) {
        console.log(`- ${fileKey}: 0 items (skipped)`);
        continue;
      }

      const collection = db.collection(mongoCollection);
      let migrated = 0;

      for (const item of items) {
        const id = item._id ? new mongoose.Types.ObjectId(item._id) : new mongoose.Types.ObjectId();
        const docToUpsert = { ...item, _id: id };

        // Parse date strings to Date objects if needed
        if (docToUpsert.createdAt) docToUpsert.createdAt = new Date(docToUpsert.createdAt);
        if (docToUpsert.updatedAt) docToUpsert.updatedAt = new Date(docToUpsert.updatedAt);
        if (docToUpsert.publishedAt) docToUpsert.publishedAt = new Date(docToUpsert.publishedAt);
        if (docToUpsert.lastLoginAt) docToUpsert.lastLoginAt = new Date(docToUpsert.lastLoginAt);

        await collection.replaceOne({ _id: id }, docToUpsert, { upsert: true });
        migrated++;
      }

      console.log(`✓ Migrated ${migrated} records into MongoDB collection "${mongoCollection}"`);
    } catch (err) {
      console.error(`✗ Error migrating ${fileKey}:`, err);
    }
  }

  console.log('\n=== Migration Completed Successfully! ===');
  await mongoose.disconnect();
  process.exit(0);
}

migrateLocalToDb().catch((err) => {
  console.error('\nMigration failed:', err.message);
  process.exit(1);
});

