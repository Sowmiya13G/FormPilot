import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStore } from '@/lib/db/local-store';
import { Component } from '@/models/Component';

describe('Local Data Store & Mongoose Model Proxy', () => {
  let testStore: LocalStore<any>;

  beforeEach(() => {
    testStore = new LocalStore('test_collection');
  });

  it('should create and retrieve documents with auto-generated _id and timestamps', async () => {
    const doc = await testStore.create({
      name: 'Test Event',
      slug: 'test-event',
      active: true,
      data: {
        category: 'VIP',
        capacity: 100,
      },
    });

    expect(doc._id).toBeDefined();
    expect(doc._id.length).toBe(24);
    expect(doc.createdAt).toBeDefined();
    expect(doc.name).toBe('Test Event');

    const found = await testStore.findById(doc._id);
    expect(found).not.toBeNull();
    expect(found.slug).toBe('test-event');
  });

  it('should match nested dot-notation filters', async () => {
    await testStore.create({
      name: 'Registration 1',
      data: { employeeName: 'Alice Johnson', age: 30 },
    });

    const results = await testStore.find({ 'data.employeeName': 'Alice Johnson' });
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('Registration 1');
  });

  it('should match $regex filters case-insensitively', async () => {
    await testStore.create({
      name: 'Wonderla Bangalore Trip',
      type: 'ThemePark',
    });

    const match = await testStore.findOne({
      name: { $regex: 'bangalore', $options: 'i' },
    });
    expect(match).not.toBeNull();
    expect(match.type).toBe('ThemePark');
  });

  it('should match $or filters properly', async () => {
    await testStore.create({
      key: 'food_preference',
      label: 'Dietary Preference',
      category: 'Custom',
    });

    const results = await testStore.find({
      $or: [
        { label: { $regex: 'dietary', $options: 'i' } },
        { key: 'non_existent_key' },
      ],
    });

    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it('should update documents via .save() method', async () => {
    const created = await testStore.create({
      label: 'Initial Label',
      status: 'DRAFT',
    });

    created.label = 'Updated Label';
    created.status = 'PUBLISHED';
    await created.save();

    const retrieved = await testStore.findById(created._id);
    expect(retrieved.label).toBe('Updated Label');
    expect(retrieved.status).toBe('PUBLISHED');
  });

  it('should proxy Component model queries seamlessly to local store', async () => {
    const components = await Component.find({}).sort({ label: 1 }).lean();
    expect(Array.isArray(components)).toBe(true);
    expect(components.length).toBeGreaterThan(0);

    const first = await Component.findOne({ key: 'employeeName' });
    expect(first).not.toBeNull();
    expect(first.key).toBe('employeeName');
  });
});

