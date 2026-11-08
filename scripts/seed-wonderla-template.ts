import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import mongoose from 'mongoose';
import connectToDatabase from '../src/lib/db/mongoose';
import Component from '../src/models/Component';
import RegistrationTemplate from '../src/models/RegistrationTemplate';
import {
  wonderlaComponents,
  wonderlaTemplateDefinition,
} from '../src/features/templates/wonderla-template.definition';

async function seedWonderla() {
  console.log('=== Wonderla BANDHAN 13.2 Master Template Seeder ===');
  console.log('Connecting to MongoDB...');
  await connectToDatabase();

  // 1. Seed Reusable Components
  console.log(`\nSeeding ${wonderlaComponents.length} Wonderla components...`);
  for (const comp of wonderlaComponents) {
    const existing = await Component.findOne({ key: comp.key });
    if (!existing) {
      await Component.create(comp);
      console.log(`  ✓ Created component: ${comp.label} (${comp.key})`);
    } else {
      Object.assign(existing, comp);
      await existing.save();
      console.log(`  ✓ Updated component: ${comp.label} (${comp.key})`);
    }
  }

  // 2. Seed Wonderla Registration Template
  console.log(`\nSeeding Wonderla Registration Template: ${wonderlaTemplateDefinition.slug}...`);
  const existingTemplate = await RegistrationTemplate.findOne({
    slug: wonderlaTemplateDefinition.slug,
  });

  if (!existingTemplate) {
    const created = await RegistrationTemplate.create({
      ...wonderlaTemplateDefinition,
      status: 'PUBLISHED',
      version: 1,
      publishedAt: new Date(),
      createdBy: 'system-seed',
    });
    console.log(`  ✓ Created published template: "${created.eventName}" with ${created.fields.length} fields.`);
  } else {
    Object.assign(existingTemplate, {
      ...wonderlaTemplateDefinition,
      status: 'PUBLISHED',
      publishedAt: existingTemplate.publishedAt || new Date(),
    });
    await existingTemplate.save();
    console.log(`  ✓ Updated template: "${existingTemplate.eventName}" (v${existingTemplate.version}).`);
  }

  console.log('\n=== Wonderla Seed Completed Successfully! ===');
  await mongoose.disconnect();
  process.exit(0);
}

seedWonderla().catch((err) => {
  console.error('\nSeeding failed with error:', err);
  process.exit(1);
});
