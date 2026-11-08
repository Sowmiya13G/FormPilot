import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import mongoose from 'mongoose';
import connectToDatabase from '../src/lib/db/mongoose';
import User from '../src/models/User';

async function seedAdmins() {
  console.log('--- Initial Admin Seeding ---');

  const emailsInput = process.env.INITIAL_ADMIN_EMAILS;
  if (!emailsInput) {
    console.error('ERROR: INITIAL_ADMIN_EMAILS environment variable is not defined.');
    process.exit(1);
  }

  const adminEmails = emailsInput
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (adminEmails.length === 0) {
    console.warn('No admin emails found in INITIAL_ADMIN_EMAILS.');
    process.exit(0);
  }

  console.log(`Connecting to database...`);
  await connectToDatabase();

  for (const email of adminEmails) {
    const existing = await User.findOne({ email });
    if (!existing) {
      const newUser = await User.create({
        email,
        name: email.split('@')[0],
        role: 'ADMIN',
        active: true,
        authProvider: 'google',
        createdBy: 'cli-seed',
      });
      console.log(`✓ Created new admin user: ${newUser.email}`);
    } else {
      let updated = false;
      if (existing.role !== 'ADMIN') {
        existing.role = 'ADMIN';
        updated = true;
      }
      if (!existing.active) {
        existing.active = true;
        updated = true;
      }
      if (updated) {
        await existing.save();
        console.log(`✓ Promoted existing user to active ADMIN: ${existing.email}`);
      } else {
        console.log(`- Admin already active: ${existing.email}`);
      }
    }
  }

  console.log('Seeding completed successfully.');
  await mongoose.disconnect();
  process.exit(0);
}

seedAdmins().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});

